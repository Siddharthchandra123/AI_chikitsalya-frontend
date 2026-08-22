"""
AI CHIKITSALYA - FastAPI Backend
Production-oriented FastAPI/Uvicorn API.

Key deployment behavior:
- Binds to Render's $PORT.
- /health and /status remain lightweight.
- medical_ai is loaded in the background.
- /predict waits for background initialization instead of returning
  503 immediately while the model is loading.
- Heavy ML/RAG imports are kept out of module import time.
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
# CONFIG
# ============================================================

APP_NAME = "AI Chikitsalya API"
APP_VERSION = "2.1.0"

HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", "5000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
).strip().rstrip("/")

ALLOWED_ORIGINS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",

    # Production domain
    "https://ai-chikitsalya.co.in",
    "https://www.ai-chikitsalya.co.in",

    # Render frontend
    "https://ai-chikitsalya-frontend.onrender.com",
]

ENGINE_MAX_WAIT_SECONDS = int(
    os.getenv("ENGINE_MAX_WAIT_SECONDS", "180")
)


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("AI-Chikitsalya-API")


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "AI-assisted health information and screening API "
        "for AI Chikitsalya."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MEDICAL ENGINE STATE
# ============================================================

_medical_engine: Optional[Any] = None
_engine_error: Optional[str] = None
_engine_loading: bool = False
_engine_ready: bool = False
_engine_started_at: Optional[float] = None

# This event is set when initialization finishes, successfully
# or unsuccessfully.
_engine_ready_event = asyncio.Event()

# Prevent multiple simultaneous initialization attempts.
_engine_lock = asyncio.Lock()


# ============================================================
# REQUEST MODELS
# ============================================================

class PredictionRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        max_length=10000,
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
# CONSTANTS
# ============================================================

DISCLAIMER = (
    "AI Chikitsalya provides health information and decision "
    "support. It does not replace a qualified medical professional "
    "or provide a confirmed diagnosis."
)


# ============================================================
# MEDICAL ENGINE LOADING
# ============================================================

def _import_medical_engine_sync():
    """
    Synchronous import executed in a worker thread.

    medical_ai.py may load:
    - Random Forest
    - FAISS
    - SentenceTransformer
    - RAG resources
    - datasets
    - other ML assets

    Keeping this outside the Uvicorn event loop prevents heavy
    initialization from blocking the HTTP server.
    """
    return importlib.import_module("medical_ai")


async def initialize_medical_engine():
    """
    Initialize the medical engine exactly once.

    Important:
    Do NOT set _engine_loading=True and then return None to callers.
    Callers should wait for this initialization to finish.
    """
    global _medical_engine
    global _engine_error
    global _engine_loading
    global _engine_ready
    global _engine_started_at

    if _medical_engine is not None:
        return _medical_engine

    async with _engine_lock:

        # Another coroutine may have completed initialization
        # while we were waiting for the lock.
        if _medical_engine is not None:
            return _medical_engine

        if _engine_loading:
            return None

        _engine_loading = True
        _engine_ready_event.clear()
        _engine_started_at = time.time()
        _engine_error = None

        logger.info("==============================================")
        logger.info("Loading AI Chikitsalya medical engine...")
        logger.info("Importing medical_ai.py")
        logger.info("==============================================")

        try:
            engine = await asyncio.to_thread(
                _import_medical_engine_sync
            )

            _medical_engine = engine
            _engine_ready = True
            _engine_error = None

            elapsed = time.time() - _engine_started_at

            logger.info(
                "Medical engine loaded successfully in %.2f seconds.",
                elapsed,
            )
            logger.info("AI CHIKITSALYA MEDICAL ENGINE READY")

            return _medical_engine

        except Exception as exc:
            _medical_engine = None
            _engine_ready = False
            _engine_error = (
                f"{type(exc).__name__}: {exc}"
            )

            logger.exception(
                "Medical engine initialization failed."
            )

            return None

        finally:
            _engine_loading = False
            _engine_ready_event.set()


async def preload_medical_engine():
    """
    Background initialization.

    Uvicorn can bind to Render's port first, while this task loads
    the heavy medical engine.
    """
    logger.info(
        "Starting background medical engine initialization..."
    )

    await initialize_medical_engine()


async def wait_for_medical_engine():
    """
    Wait for the background engine initialization.

    If initialization has not started, start it.
    If initialization is already running, wait for it.
    """
    global _medical_engine

    if _medical_engine is not None:
        return _medical_engine

    # Start initialization if necessary.
    if not _engine_loading:
        asyncio.create_task(
            initialize_medical_engine()
        )

    start = time.time()

    while _medical_engine is None and _engine_loading:

        elapsed = time.time() - start

        if elapsed >= ENGINE_MAX_WAIT_SECONDS:
            logger.error(
                "Medical engine initialization timed out after %s seconds.",
                ENGINE_MAX_WAIT_SECONDS,
            )
            return None

        await asyncio.sleep(0.5)

    return _medical_engine


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():
    logger.info("==============================================")
    logger.info("AI CHIKITSALYA API STARTING")
    logger.info("Version: %s", APP_VERSION)
    logger.info("PORT: %s", PORT)
    logger.info("Allowed origins: %s", ALLOWED_ORIGINS)
    logger.info("==============================================")

    # Start loading without blocking HTTP server startup.
    asyncio.create_task(
        preload_medical_engine()
    )

    logger.info(
        "HTTP server startup complete; "
        "medical engine loading in background."
    )


# ============================================================
# RESPONSE NORMALIZATION
# ============================================================

def _condition_name(item: Dict[str, Any]) -> str:
    return str(
        item.get("name")
        or item.get("disease")
        or item.get("condition")
        or "Unknown"
    )


def _condition_score(item: Dict[str, Any]) -> float:
    try:
        value = (
            item.get("score")
            if item.get("score") is not None
            else item.get("confidence", 0)
        )

        value = float(value)

        # Accept either 0-1 or 0-100 representations.
        if value > 1:
            value = value / 100.0

        return max(0.0, min(1.0, value))

    except (TypeError, ValueError):
        return 0.0


def _normalize_predictions(
    raw: Dict[str, Any],
) -> List[Dict[str, Any]]:

    candidates = (
        raw.get("possible_conditions")
        or raw.get("predictions")
        or raw.get("top_predictions")
        or []
    )

    output: List[Dict[str, Any]] = []

    if isinstance(candidates, dict):
        candidates = [
            {
                "disease": key,
                "confidence": value,
            }
            for key, value in candidates.items()
        ]

    for item in candidates:

        if isinstance(item, str):
            output.append(
                {
                    "disease": item,
                    "confidence": 0.0,
                }
            )
            continue

        if not isinstance(item, dict):
            continue

        output.append(
            {
                "disease": _condition_name(item),
                "confidence": _condition_score(item),
            }
        )

    output.sort(
        key=lambda x: x["confidence"],
        reverse=True,
    )

    return output


def _normalize_risk(
    raw_risk: Dict[str, Any],
) -> Dict[str, Any]:

    level = str(
        raw_risk.get("risk_level")
        or raw_risk.get("level")
        or "LOW"
    ).upper()

    try:
        score = float(
            raw_risk.get(
                "risk_score",
                0,
            )
        )
    except (TypeError, ValueError):
        score = 0.0

    symptoms = list(
        raw_risk.get("high_risk_symptoms")
        or raw_risk.get("red_flags")
        or []
    )

    return {
        "risk_score": score,
        "risk_level": level,
        "high_risk_symptoms": symptoms,
    }


def _normalize_emergency(
    raw_risk: Dict[str, Any],
) -> Dict[str, Any]:

    emergency = bool(
        raw_risk.get("emergency")
        or str(
            raw_risk.get("risk_level", "")
        ).upper() == "EMERGENCY"
    )

    matched = list(
        raw_risk.get("matched_rules")
        or raw_risk.get("red_flags")
        or raw_risk.get("high_risk_symptoms")
        or []
    )

    return {
        "emergency": emergency,
        "severity": (
            "EMERGENCY"
            if emergency
            else str(
                raw_risk.get("risk_level")
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


def _follow_up_questions(
    query: str,
) -> List[str]:

    text = query.lower()
    questions: List[str] = []

    duration_markers = [
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
    ]

    if not any(
        marker in text
        for marker in duration_markers
    ):
        questions.append(
            "How long have you had these symptoms?"
        )

    trend_markers = [
        "better",
        "worse",
        "improving",
        "improved",
        "getting worse",
        "same",
        "stable",
    ]

    if not any(
        marker in text
        for marker in trend_markers
    ):
        questions.append(
            "Are the symptoms getting better, worse, "
            "or staying the same?"
        )

    medication_markers = [
        "medicine",
        "medication",
        "tablet",
        "drug",
        "taking",
        "prescribed",
        "condition",
    ]

    if not any(
        marker in text
        for marker in medication_markers
    ):
        questions.append(
            "Are you taking any medicines or do you have "
            "any known medical conditions?"
        )

    return questions[:3]


def normalize_engine_response(
    raw: Dict[str, Any],
    query: str,
) -> Dict[str, Any]:

    if not isinstance(raw, dict):
        raw = {
            "reply": str(raw),
        }

    predictions = _normalize_predictions(raw)

    top_prediction = (
        predictions[0]
        if predictions
        else None
    )

    primary_condition = (
        top_prediction["disease"]
        if top_prediction
        and top_prediction["disease"] != "Unknown"
        else (
            raw.get("ml_prediction")
            or raw.get("condition")
            or raw.get("rule_based_condition")
        )
    )

    try:
        confidence = (
            float(
                top_prediction["confidence"]
            )
            if top_prediction
            else float(
                raw.get("confidence", 0)
            )
        )
    except (TypeError, ValueError):
        confidence = 0.0

    if confidence > 1:
        confidence /= 100.0

    confidence = max(
        0.0,
        min(1.0, confidence),
    )

    raw_risk = raw.get("risk") or {}

    risk = _normalize_risk(
        raw_risk
    )

    emergency = _normalize_emergency(
        raw_risk
    )

    # Respect an explicit status from the engine when possible.
    engine_status = str(
        raw.get("status", "")
    ).lower()

    if emergency["emergency"]:
        assessment_status = "urgent"
    elif engine_status in {
        "needs_more_information",
        "need_more_information",
    }:
        assessment_status = "needs_more_information"
    elif confidence >= 0.65:
        assessment_status = "high_confidence"
    elif confidence >= 0.30:
        assessment_status = "moderate_confidence"
    else:
        assessment_status = "needs_more_information"

    reply = raw.get("reply")

    if not reply:
        reply = raw.get("message")

    if not reply:
        reply = (
            "The AI completed an initial screening. "
            "Please review the assessment and consider "
            "the recommended next steps."
        )

    return {
        "status": (
            "urgent"
            if emergency["emergency"]
            else "success"
        ),

        "assessment_status": assessment_status,

        "reply": str(reply),

        "condition": primary_condition,
        "ml_prediction": primary_condition,
        "confidence": confidence,

        "top_predictions": predictions[:5],

        "active_features": list(
            raw.get("known_symptoms")
            or raw.get("active_features")
            or []
        ),

        "follow_up_questions": (
            _follow_up_questions(query)
            if assessment_status
            == "needs_more_information"
            else []
        ),

        "risk": risk,
        "emergency": emergency,

        "edge_ai": bool(
            raw.get("edge_ai", True)
        ),

        "rag_used": bool(
            raw.get("rag_used")
            or raw.get("rag")
        ),

        "model_version": raw.get(
            "model_version",
            "hybrid-v2",
        ),

        "rule_based_condition": raw.get(
            "rule_based_condition"
        ),

        "disclaimer": DISCLAIMER,
    }


# ============================================================
# BASIC ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": APP_NAME,
        "version": APP_VERSION,
        "health": "/health",
        "status_endpoint": "/status",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """
    Lightweight health check.

    This endpoint does not wait for ML initialization, which is
    important for Render's health/port detection.
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
    return {
        "status": "online",
        "service": APP_NAME,
        "version": APP_VERSION,
        "port": PORT,
        "engine": {
            "ready": _engine_ready,
            "loading": _engine_loading,
            "error": _engine_error,
            "started_at": _engine_started_at,
        },
    }


@app.get("/model-status")
async def model_status():
    engine = _medical_engine

    result: Dict[str, Any] = {
        "engine_ready": _engine_ready,
        "engine_loading": _engine_loading,
        "engine_error": _engine_error,
    }

    if engine is None:
        return result

    try:
        explicit_status = getattr(
            engine,
            "MODEL_STATUS",
            None,
        )

        if isinstance(explicit_status, dict):
            result["models"] = explicit_status
        else:
            result["models"] = {
                "engine_module": True,
                "disease_model": getattr(
                    engine,
                    "model_ml",
                    None,
                ) is not None,
                "faiss_index": getattr(
                    engine,
                    "index",
                    None,
                ) is not None,
            }

    except Exception as exc:
        result["status_error"] = str(exc)

    return result


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    request: PredictionRequest,
):

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

    # --------------------------------------------------------
    # WAIT FOR MEDICAL ENGINE
    # --------------------------------------------------------

    engine = await wait_for_medical_engine()

    if engine is None:

        logger.error(
            "Medical engine unavailable: %s",
            _engine_error,
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "AI model service is still initializing or "
                "unavailable. Please try again shortly."
            ),
        )

    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    try:

        if not hasattr(engine, "ask"):
            raise RuntimeError(
                "medical_ai.py does not expose an ask(query) function."
            )

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

            response.get(
                "confidence",
                0,
            ),

            response.get(
                "risk",
                {},
            ).get(
                "risk_level",
            ),

            response.get(
                "rag_used",
            ),
        )

        return response

    except Exception as exc:

        logger.exception(
            "Prediction failed."
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Prediction failed: "
                f"{type(exc).__name__}: {exc}"
            ),
        )


# ============================================================
# COMPATIBILITY CHAT ENDPOINT
# ============================================================

@app.post("/ask")
async def ask(
    request: TextRequest,
):
    return await predict(
        PredictionRequest(
            query=request.text,
            lang="en",
        )
    )


# ============================================================
# IMAGE ANALYSIS
# ============================================================

@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
):
    """
    Optional vision endpoint.

    Requires python-multipart in requirements.txt.
    """
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

    filename = file.filename or "uploaded-image"

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image is too large. Maximum size is 10 MB.",
        )

    logger.info(
        "Image received | filename=%s | size=%d | type=%s",
        filename,
        len(content),
        file.content_type,
    )

    analyzer = None

    for module_name in [
        "image_analyzer",
        "vision.image_analyzer",
    ]:
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
                "Image received successfully, but no vision "
                "engine is configured in this deployment."
            ),
            "filename": filename,
            "disclaimer": DISCLAIMER,
        }

    try:

        if hasattr(
            analyzer,
            "analyze_image",
        ):
            result = await asyncio.to_thread(
                analyzer.analyze_image,
                content,
            )

        elif hasattr(
            analyzer,
            "analyze",
        ):
            result = await asyncio.to_thread(
                analyzer.analyze,
                content,
            )

        else:
            result = {
                "message": (
                    "Vision module found, but no supported "
                    "analysis function is exposed."
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
            detail=(
                f"Image analysis failed: {exc}"
            ),
        )


# ============================================================
# LOCAL ENTRYPOINT
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