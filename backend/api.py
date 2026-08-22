"""
AI CHIKITSALYA - FastAPI Backend
--------------------------------

Production-friendly API for the AI Chikitsalya medical screening prototype.

Architecture:
    Browser / Next.js
            |
            v
        FastAPI / Uvicorn
            |
            +--> Safety / emergency checks
            +--> Random Forest symptom model
            +--> Rule-based matching
            +--> FAISS + MiniLM medical retrieval
            +--> Optional image/vision service
            |
            v
       Structured JSON response

Important:
- This is a health-information/screening prototype.
- It does not provide a confirmed medical diagnosis.
- Heavy medical AI code is loaded lazily so Uvicorn can bind to
  Render's PORT before model initialization.
"""

from __future__ import annotations

import asyncio
import importlib
import logging
import os
import time
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
# CONFIGURATION
# ============================================================

APP_NAME = "AI Chikitsalya API"
APP_VERSION = "2.0.0"

HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", "5000"))

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Keep optional open-weight generation disabled on low-cost CPU
# deployments unless explicitly enabled.
OPEN_MODEL_NAME = os.getenv("OPEN_MODEL_NAME", "").strip()

# CORS:
# Add your production frontend URL through FRONTEND_URL.
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_URL,
    "https://ai-chikitsalya.co.in",
    "https://www.ai-chikitsalya.co.in",
]

# Remove duplicates / empty strings.
ALLOWED_ORIGINS = sorted(
    {
        origin.strip().rstrip("/")
        for origin in ALLOWED_ORIGINS
        if origin and origin.strip()
    }
)


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("AI-Chikitsalya-API")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "AI-assisted medical screening and health-information API "
        "for AI Chikitsalya."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LAZY MEDICAL ENGINE STATE
# ============================================================

_medical_engine: Optional[Any] = None
_engine_error: Optional[str] = None
_engine_loading = False
_engine_ready = False
_engine_started_at: Optional[float] = None


def get_medical_engine():
    """
    Import medical_ai lazily.

    This is deliberate. If medical_ai loads Random Forest, FAISS,
    SentenceTransformer, datasets, etc. at import time, importing it
    directly at module level can delay Uvicorn startup enough for
    Render to think the service has no open HTTP port.
    """
    global _medical_engine
    global _engine_error
    global _engine_loading
    global _engine_ready
    global _engine_started_at

    if _medical_engine is not None:
        return _medical_engine

    if _engine_loading:
        return None

    _engine_loading = True
    _engine_started_at = time.time()

    try:
        logger.info("==============================================")
        logger.info("Loading AI Chikitsalya medical engine...")
        logger.info("Importing medical_ai.py")
        logger.info("==============================================")

        _medical_engine = importlib.import_module("medical_ai")

        _engine_ready = True
        _engine_error = None

        elapsed = time.time() - _engine_started_at

        logger.info(
            "Medical engine loaded successfully in %.2f seconds.",
            elapsed,
        )

        return _medical_engine

    except Exception as exc:
        _engine_ready = False
        _engine_error = f"{type(exc).__name__}: {exc}"

        logger.exception(
            "Medical engine initialization failed."
        )

        return None

    finally:
        _engine_loading = False


async def preload_medical_engine():
    """
    Load the heavy engine in a background thread after FastAPI has
    started. This lets the HTTP server bind to PORT immediately.
    """
    logger.info("Starting background medical engine initialization...")

    try:
        await asyncio.to_thread(get_medical_engine)
    except Exception:
        logger.exception(
            "Background medical engine initialization failed."
        )


@app.on_event("startup")
async def startup_event():
    """
    Keep startup lightweight.

    Uvicorn can begin serving /health immediately while the heavy
    ML/RAG stack initializes in the background.
    """
    logger.info("==============================================")
    logger.info("AI CHIKITSALYA API STARTING")
    logger.info("Version: %s", APP_VERSION)
    logger.info("PORT: %s", PORT)
    logger.info("Allowed origins: %s", ALLOWED_ORIGINS)
    logger.info("==============================================")

    asyncio.create_task(preload_medical_engine())

    logger.info(
        "HTTP server startup complete; medical engine loading in background."
    )


# ============================================================
# REQUEST MODELS
# ============================================================

class PredictionRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Patient symptom description or health question.",
    )
    lang: str = Field(
        default="en",
        max_length=10,
    )


class TextRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=10000,
    )


# ============================================================
# RESPONSE HELPERS
# ============================================================

DISCLAIMER = (
    "AI Chikitsalya provides AI-assisted health information and "
    "decision support. It does not replace a qualified medical "
    "professional or provide a confirmed diagnosis."
)


def condition_name(item: Dict[str, Any]) -> str:
    return str(
        item.get("name")
        or item.get("disease")
        or item.get("condition")
        or "Unknown"
    )


def condition_score(item: Dict[str, Any]) -> float:
    try:
        return float(
            item.get("score")
            if item.get("score") is not None
            else item.get("confidence", 0)
        )
    except (TypeError, ValueError):
        return 0.0


def make_follow_up_questions(
    query: str,
    known_symptoms: List[str],
    confidence: float,
) -> List[str]:
    """
    Generate deterministic, non-diagnostic follow-up questions.

    These questions are intentionally simple so the frontend doesn't
    repeatedly receive a generic "more information needed" message.
    """

    clean = query.lower()

    questions: List[str] = []

    duration_words = (
        "day",
        "days",
        "week",
        "weeks",
        "month",
        "months",
        "hour",
        "hours",
        "since",
        "yesterday",
        "today",
    )

    if not any(word in clean for word in duration_words):
        questions.append(
            "How long have you had these symptoms?"
        )

    trend_words = (
        "better",
        "worse",
        "improving",
        "improved",
        "getting worse",
        "same",
        "stable",
    )

    if not any(word in clean for word in trend_words):
        questions.append(
            "Are the symptoms getting better, worse, or staying the same?"
        )

    medication_words = (
        "medicine",
        "medication",
        "tablet",
        "drug",
        "taking",
        "prescribed",
    )

    if not any(word in clean for word in medication_words):
        questions.append(
            "Are you taking any medicines or do you have any known medical conditions?"
        )

    # Keep the UI focused.
    return questions[:3]


def transform_risk(risk: Dict[str, Any]) -> Dict[str, Any]:
    level = str(
        risk.get("risk_level")
        or risk.get("level")
        or "LOW"
    ).upper()

    red_flags = list(
        risk.get("high_risk_symptoms")
        or risk.get("red_flags")
        or []
    )

    severity_matches = list(
        risk.get("severity_matches")
        or []
    )

    if level == "EMERGENCY":
        score = 100
    elif level == "HIGH":
        score = 75
    elif level == "MODERATE":
        score = 45
    else:
        score = 0

    return {
        "risk_score": score,
        "risk_level": level,
        "high_risk_symptoms": red_flags or severity_matches,
        "emergency": level == "EMERGENCY"
        or bool(risk.get("emergency")),
    }


def transform_emergency(
    risk: Dict[str, Any],
) -> Dict[str, Any]:
    emergency = bool(
        risk.get("emergency")
        or str(risk.get("risk_level", "")).lower()
        == "emergency"
    )

    matched = list(
        risk.get("red_flags")
        or risk.get("high_risk_symptoms")
        or []
    )

    return {
        "emergency": emergency,
        "severity": (
            "EMERGENCY"
            if emergency
            else str(
                risk.get("risk_level")
                or "NORMAL"
            ).upper()
        ),
        "matched_rules": matched,
        "message": (
            "Potential emergency warning signs were detected. "
            "Seek urgent medical evaluation."
            if emergency
            else ""
        ),
    }


def normalize_engine_response(
    raw: Dict[str, Any],
    query: str,
) -> Dict[str, Any]:
    """
    Convert the medical_ai.ask() response into the response shape
    expected by the current Next.js AI Detection page.
    """

    raw_status = str(raw.get("status", "success"))

    risk = transform_risk(
        raw.get("risk") or {}
    )

    emergency = transform_emergency(
        raw.get("risk") or {}
    )

    candidates = raw.get("possible_conditions") or []

    normalized_candidates: List[Dict[str, Any]] = []

    for item in candidates:
        if not isinstance(item, dict):
            continue

        name = condition_name(item)
        confidence = condition_score(item)

        normalized_candidates.append(
            {
                "disease": name,
                "confidence": confidence,
            }
        )

    normalized_candidates.sort(
        key=lambda x: x["confidence"],
        reverse=True,
    )

    top = (
        normalized_candidates[0]
        if normalized_candidates
        else None
    )

    primary_condition = (
        top["disease"]
        if top and top["disease"] != "Unknown"
        else raw.get("rule_based_condition")
    )

    confidence = (
        float(top["confidence"])
        if top
        else 0.0
    )

    known_symptoms = list(
        raw.get("known_symptoms")
        or []
    )

    follow_up_questions = make_follow_up_questions(
        query=query,
        known_symptoms=known_symptoms,
        confidence=confidence,
    )

    # Assessment status is based on model evidence, but intentionally
    # avoids calling a low-confidence ranking a diagnosis.
    if emergency["emergency"]:
        assessment_status = "urgent"
    elif primary_condition and confidence >= 0.65:
        assessment_status = "high_confidence"
    elif primary_condition and confidence >= 0.30:
        assessment_status = "moderate_confidence"
    else:
        assessment_status = "needs_more_information"

    guidance = raw.get("guidance") or []

    if isinstance(guidance, list):
        reply = "\n\n".join(
            str(item)
            for item in guidance
            if str(item).strip()
        )
    else:
        reply = str(guidance or "")

    if not reply:
        reply = (
            "The AI completed an initial screening. "
            "Please review the assessment and consider the "
            "recommended next steps."
        )

    rag_results = raw.get("rag") or []

    return {
        "status": (
            "urgent"
            if emergency["emergency"]
            else "success"
        ),
        "assessment_status": assessment_status,

        "reply": reply,

        "condition": primary_condition,
        "ml_prediction": primary_condition,
        "confidence": confidence,

        "active_features": known_symptoms,

        "top_predictions": normalized_candidates[:3],

        "follow_up_questions": follow_up_questions,

        "risk": risk,
        "emergency": emergency,

        "edge_ai": True,
        "rag_used": bool(rag_results),

        # Useful for debugging and the technical view in the frontend.
        "intent": raw.get("intent"),
        "rule_based_condition": raw.get(
            "rule_based_condition"
        ),
        "model_version": raw.get(
            "model_version",
            "hybrid-v2",
        ),

        "disclaimer": DISCLAIMER,
    }


# ============================================================
# ROOT / HEALTH / STATUS
# ============================================================

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": APP_NAME,
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    """
    Lightweight health endpoint.

    This intentionally does NOT require the medical engine to be ready.
    Render can use it to verify that the HTTP service is alive.
    """
    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION,
        "engine_ready": _engine_ready,
        "engine_loading": _engine_loading,
        "engine_error": _engine_error,
    }


@app.get("/status")
async def status():
    """
    More detailed service/model status endpoint.
    """
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "api": {
            "status": "online",
        },
        "medical_engine": {
            "ready": _engine_ready,
            "loading": _engine_loading,
            "error": _engine_error,
        },
        "environment": {
            "port": PORT,
            "open_model_enabled": bool(
                OPEN_MODEL_NAME
            ),
        },
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(request: PredictionRequest):
    query = request.query.strip()

    if not query:
        return {
            "status": "error",
            "message": "Please enter a medical question.",
        }

    logger.info(
        "Prediction request received | lang=%s | chars=%d",
        request.lang,
        len(query),
    )

    # If the background preload has not completed, wait for it in a
    # worker thread. This keeps the event loop responsive.
    engine = _medical_engine

    if engine is None:
        logger.info(
            "Medical engine not ready; waiting for initialization..."
        )

        engine = await asyncio.to_thread(
            get_medical_engine
        )

    if engine is None:
        logger.error(
            "Medical engine unavailable: %s",
            _engine_error,
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "AI model service is still initializing or "
                "unavailable. Please try again in a moment."
            ),
        )

    try:
        raw = await asyncio.to_thread(
            engine.ask,
            query,
        )

        response = normalize_engine_response(
            raw=raw,
            query=query,
        )

        logger.info(
            "Prediction complete | condition=%s | confidence=%.3f | "
            "risk=%s | rag=%s",
            response.get("condition"),
            response.get("confidence", 0),
            response.get("risk", {}).get("risk_level"),
            response.get("rag_used"),
        )

        return response

    except Exception as exc:
        logger.exception(
            "Prediction failed."
        )

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {type(exc).__name__}: {exc}",
        )


# ============================================================
# SIMPLE TEXT COMPATIBILITY ENDPOINT
# ============================================================

@app.post("/ask")
async def ask(request: TextRequest):
    """
    Compatibility endpoint for older frontend/chat code.
    """
    prediction = await predict(
        PredictionRequest(
            query=request.text,
            lang="en",
        )
    )

    return prediction


# ============================================================
# MODEL STATUS
# ============================================================

@app.get("/model-status")
async def model_status():
    """
    Attempts to expose the medical engine's internal model status
    without crashing the API if a particular component is unavailable.
    """
    engine = _medical_engine

    if engine is None:
        return {
            "engine_ready": False,
            "engine_loading": _engine_loading,
            "engine_error": _engine_error,
        }

    status: Dict[str, Any] = {
        "engine_ready": True,
        "engine_loading": False,
        "engine_error": None,
    }

    try:
        model_status_value = getattr(
            engine,
            "MODEL_STATUS",
            None,
        )

        if isinstance(model_status_value, dict):
            status["models"] = model_status_value
        else:
            status["models"] = {
                "disease_model": getattr(
                    engine,
                    "model_ml",
                    None,
                ) is not None,
                "faiss": getattr(
                    engine,
                    "index",
                    None,
                ) is not None,
            }

    except Exception as exc:
        status["status_error"] = str(exc)

    return status


# ============================================================
# IMAGE ENDPOINT
# ============================================================

@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
):
    """
    Image-analysis compatibility endpoint.

    The backend remains functional even if a dedicated vision engine
    has not been installed. This avoids pretending that an image was
    medically interpreted when it was not.
    """

    filename = file.filename or "uploaded-image"

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image type. "
                "Use JPEG, PNG, or WebP."
            ),
        )

    content = await file.read()

    # 10 MB safety limit.
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image is too large. Maximum size is 10 MB.",
        )

    logger.info(
        "Image received | filename=%s | size=%d bytes | type=%s",
        filename,
        len(content),
        file.content_type,
    )

    # Try to use an existing image_analyzer module if the project
    # contains one. We intentionally don't hard-fail if it doesn't.
    possible_modules = [
        "image_analyzer",
        "vision.image_analyzer",
    ]

    analyzer = None

    for module_name in possible_modules:
        try:
            analyzer = importlib.import_module(
                module_name
            )
            break
        except Exception:
            continue

    if analyzer is None:
        return {
            "status": "success",
            "image_analyzed": False,
            "message": (
                "Image received successfully, but no vision engine "
                "is configured in this deployment."
            ),
            "filename": filename,
            "disclaimer": DISCLAIMER,
        }

    try:
        # Support a few common analyzer interfaces without forcing
        # one specific implementation.
        if hasattr(analyzer, "analyze_image"):
            result = await asyncio.to_thread(
                analyzer.analyze_image,
                content,
            )
        elif hasattr(analyzer, "analyze"):
            result = await asyncio.to_thread(
                analyzer.analyze,
                content,
            )
        else:
            result = {
                "message": (
                    "Vision module found, but no supported "
                    "analyze function is exposed."
                )
            }

        return {
            "status": "success",
            "image_analyzed": True,
            "result": result,
            "filename": filename,
            "disclaimer": DISCLAIMER,
        }

    except Exception as exc:
        logger.exception(
            "Image analysis failed."
        )

        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {exc}",
        )


# ============================================================
# LOCAL DEVELOPMENT ENTRYPOINT
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level=LOG_LEVEL.lower(),
    )