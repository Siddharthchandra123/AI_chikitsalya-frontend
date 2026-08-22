"""
============================================================
AI CHIKITSALYA
Hybrid Edge AI + Cloud Medical Intelligence
Single-file FastAPI Backend
============================================================

Architecture:

                USER
                  |
                  v
          +---------------+
          |   FastAPI     |
          +-------+-------+
                  |
          +-------v-------+
          | Symptom NLP   |
          +-------+-------+
                  |
          +-------v-------+
          | Safety Engine |
          +-------+-------+
                  |
          +-------v-------+
          | Edge ML Model |
          | Random Forest |
          +-------+-------+
                  |
             Preliminary
              Assessment
                  |
           +------+------+
           |             |
        Offline       Online
           |             |
           |       Cloud Enhancement
           |             |
           |       +-----v------+
           |       | FAISS/RAG  |
           |       +-----+------+
           |             |
           |       Medical Context
           |             |
           +------+------+
                  |
                  v
             Final Result

IMPORTANT:
- Edge AI is always available when the disease model is available.
- Cloud/RAG is lazy-loaded.
- RAG failure must never break /predict.
============================================================
"""

import os
import re
import json
import logging
import traceback
from pathlib import Path
from typing import Optional, List, Dict, Any

import numpy as np

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ------------------------------------------------------------
# Optional ML imports
# ------------------------------------------------------------

try:
    import joblib
except Exception:
    joblib = None

# ------------------------------------------------------------
# Optional FAISS
# ------------------------------------------------------------

faiss = None

# ------------------------------------------------------------
# Optional sentence-transformers
# ------------------------------------------------------------

SentenceTransformer = None

# ------------------------------------------------------------
# Optional torch
# ------------------------------------------------------------

torch = None


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format=(
        "%(asctime)s | %(levelname)s | "
        "%(name)s | %(message)s"
    ),
)

logger = logging.getLogger("AI-Chikitsalya-API")


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
RAG_DIR = BASE_DIR / "rag"

# Support your current flat structure as fallback
DATA_DIR_ALT = BASE_DIR
MODEL_DIR_ALT = BASE_DIR


def find_file(
    filename: str,
    *directories: Path,
) -> Optional[Path]:

    for directory in directories:

        path = directory / filename

        if path.exists():
            return path

    return None


# ============================================================
# ENVIRONMENT
# ============================================================

PORT = int(
    os.getenv("PORT", "10000")
)

ENABLE_CLOUD = (
    os.getenv(
        "ENABLE_CLOUD",
        "true"
    ).lower()
    == "true"
)

ENABLE_RAG = (
    os.getenv(
        "ENABLE_RAG",
        "false"
    ).lower()
    == "true"
)

RAG_TOP_K = int(
    os.getenv(
        "RAG_TOP_K",
        "4"
    )
)

MODEL_PATH = find_file(
    "disease_model.pkl",
    MODEL_DIR,
    MODEL_DIR_ALT,
)

FEATURE_PATH = find_file(
    "feature_columns.pkl",
    MODEL_DIR,
    MODEL_DIR_ALT,
)

DATASET_PATH = find_file(
    "dataset.csv",
    DATA_DIR,
    DATA_DIR_ALT,
)

DESCRIPTION_PATH = find_file(
    "symptom_Description.csv",
    DATA_DIR,
    DATA_DIR_ALT,
)

PRECAUTION_PATH = find_file(
    "symptom_precaution.csv",
    DATA_DIR,
    DATA_DIR_ALT,
)

SEVERITY_PATH = find_file(
    "Symptom-severity.csv",
    DATA_DIR,
    DATA_DIR_ALT,
)

FAISS_PATH = find_file(
    "rag_index.faiss",
    RAG_DIR,
    BASE_DIR,
)

# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",

    "https://ai-chikitsalya.co.in",
    "https://www.ai-chikitsalya.co.in",

    "https://ai-chikitsalya-frontend.onrender.com",
]

# Allow custom frontend origin through environment variable
extra_origin = os.getenv(
    "FRONTEND_URL"
)

if extra_origin:
    ALLOWED_ORIGINS.append(
        extra_origin.rstrip("/")
    )


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="AI Chikitsalya API",
    description=(
        "Hybrid Edge AI + Cloud Medical "
        "Decision Support API"
    ),
    version="3.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GLOBAL ENGINE STATE
# ============================================================

disease_model = None
feature_columns = []

engine_ready = False
engine_error = None

rag_engine = None
rag_error = None
rag_initialized = False


# ============================================================
# REQUEST MODELS
# ============================================================

class PredictionRequest(BaseModel):

    query: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )

    lang: str = "en"


class EnhanceRequest(BaseModel):

    condition: Optional[str] = None

    query: str = ""

    symptoms: List[str] = []

    top_predictions: List[Dict[str, Any]] = []

    lang: str = "en"


# ============================================================
# SYMPTOM ALIASES
# ============================================================

SYMPTOM_ALIASES = {

    "fever": [
        "fever",
        "high fever",
        "temperature",
        "high temperature",
    ],

    "cough": [
        "cough",
        "coughing",
    ],

    "sore throat": [
        "sore throat",
        "throat pain",
        "painful throat",
        "throat irritation",
    ],

    "runny nose": [
        "runny nose",
        "running nose",
        "nasal discharge",
        "nose is running",
    ],

    "sneezing": [
        "sneeze",
        "sneezing",
    ],

    "vomiting": [
        "vomiting",
        "vomit",
        "throwing up",
        "threw up",
    ],

    "dizziness": [
        "dizziness",
        "dizzy",
        "lightheaded",
        "light headed",
    ],

    "headache": [
        "headache",
        "head pain",
        "pain in head",
    ],

    "nausea": [
        "nausea",
        "feeling nauseous",
        "feeling sick",
    ],

    "fatigue": [
        "fatigue",
        "tired",
        "tiredness",
        "weakness",
        "feeling weak",
    ],

    "chest pain": [
        "chest pain",
        "pain in chest",
        "chest discomfort",
    ],

    "breathing difficulty": [
        "difficulty breathing",
        "breathing difficulty",
        "shortness of breath",
        "breathlessness",
        "hard to breathe",
        "cannot breathe",
    ],

    "abdominal pain": [
        "abdominal pain",
        "stomach pain",
        "belly pain",
        "pain in stomach",
    ],

    "diarrhea": [
        "diarrhea",
        "loose motion",
        "loose motions",
        "loose stools",
    ],

    "constipation": [
        "constipation",
        "hard stool",
        "difficulty passing stool",
    ],

    "back pain": [
        "back pain",
        "pain in back",
    ],

    "joint pain": [
        "joint pain",
        "painful joints",
        "pain in joints",
    ],

    "muscle pain": [
        "muscle pain",
        "body pain",
        "muscle ache",
        "muscle aches",
    ],

    "skin rash": [
        "skin rash",
        "rash",
        "skin eruption",
    ],

    "itching": [
        "itching",
        "itchy",
    ],

    "swelling": [
        "swelling",
        "swollen",
    ],

    "loss of appetite": [
        "loss of appetite",
        "no appetite",
        "not hungry",
    ],

    "chills": [
        "chills",
        "shivering",
    ],

    "sweating": [
        "sweating",
        "excessive sweating",
    ],

    "eye pain": [
        "eye pain",
        "pain in eyes",
    ],

    "red eyes": [
        "red eyes",
        "reddish eyes",
    ],

    "blurred vision": [
        "blurred vision",
        "blurry vision",
    ],
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:

    if not text:
        return ""

    text = text.lower()

    text = re.sub(
        r"symptoms?\s*:",
        " ",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ============================================================
# SYMPTOM EXTRACTION
# ============================================================

def extract_symptoms(text: str) -> List[str]:

    normalized = normalize_text(text)

    found = []

    for canonical, aliases in SYMPTOM_ALIASES.items():

        for alias in aliases:

            alias_normalized = normalize_text(
                alias
            )

            if (
                alias_normalized
                and alias_normalized in normalized
            ):
                found.append(canonical)
                break

    return list(
        dict.fromkeys(found)
    )


# ============================================================
# MODEL FEATURE MATCHING
# ============================================================

def match_symptoms_to_model_features(
    symptoms: List[str],
) -> List[str]:

    if not feature_columns:
        return []

    normalized_features = {}

    for feature in feature_columns:

        clean = normalize_text(
            str(feature)
        )

        normalized_features[clean] = feature

    matched = []

    for symptom in symptoms:

        normalized_symptom = normalize_text(
            symptom
        )

        # Exact match
        if normalized_symptom in normalized_features:

            matched.append(
                normalized_features[
                    normalized_symptom
                ]
            )

            continue

        # Partial/alias matching
        for normalized_feature, original_feature in (
            normalized_features.items()
        ):

            if (
                normalized_symptom
                in normalized_feature
                or normalized_feature
                in normalized_symptom
            ):

                matched.append(
                    original_feature
                )

                break

    return list(
        dict.fromkeys(matched)
    )


# ============================================================
# SAFETY ENGINE
# ============================================================

EMERGENCY_SYMPTOMS = {
    "chest pain",
    "breathing difficulty",
}


def assess_risk(
    symptoms: List[str],
) -> Dict[str, Any]:

    symptom_set = set(symptoms)

    matched = [
        symptom
        for symptom in EMERGENCY_SYMPTOMS
        if symptom in symptom_set
    ]

    if matched:

        return {
            "risk_score": 80,
            "risk_level": "HIGH",
            "high_risk_symptoms": matched,
        }

    moderate_symptoms = {
        "vomiting",
        "dizziness",
        "high fever",
    }

    moderate_count = len(
        symptom_set.intersection(
            moderate_symptoms
        )
    )

    if moderate_count >= 2:

        return {
            "risk_score": 40,
            "risk_level": "MODERATE",
            "high_risk_symptoms": [],
        }

    return {
        "risk_score": 0,
        "risk_level": "LOW",
        "high_risk_symptoms": [],
    }


# ============================================================
# EMERGENCY ENGINE
# ============================================================

def emergency_check(
    symptoms: List[str],
) -> Dict[str, Any]:

    symptom_set = set(symptoms)

    if (
        "chest pain" in symptom_set
        and "breathing difficulty" in symptom_set
    ):

        return {
            "emergency": True,
            "severity": "CRITICAL",
            "matched_rules": [
                "chest_pain_and_breathing_difficulty"
            ],
            "message": (
                "Seek urgent medical attention "
                "immediately."
            ),
        }

    if (
        "breathing difficulty"
        in symptom_set
    ):

        return {
            "emergency": True,
            "severity": "HIGH",
            "matched_rules": [
                "breathing_difficulty"
            ],
            "message": (
                "Breathing difficulty can require "
                "urgent medical evaluation."
            ),
        }

    return {
        "emergency": False,
        "severity": "NORMAL",
        "matched_rules": [],
        "message": "",
    }


# ============================================================
# LOAD EDGE MODEL
# ============================================================

def initialize_edge_ai():

    global disease_model
    global feature_columns
    global engine_ready
    global engine_error

    try:

        logger.info(
            "=============================================="
        )

        logger.info(
            "Initializing Edge AI..."
        )

        logger.info(
            "Model path: %s",
            MODEL_PATH,
        )

        logger.info(
            "Feature path: %s",
            FEATURE_PATH,
        )

        if joblib is None:

            raise RuntimeError(
                "joblib is not installed"
            )

        if MODEL_PATH is None:

            raise FileNotFoundError(
                "disease_model.pkl not found"
            )

        if FEATURE_PATH is None:

            raise FileNotFoundError(
                "feature_columns.pkl not found"
            )

        logger.info(
            "Loading pre-trained disease model..."
        )

        disease_model = joblib.load(
            MODEL_PATH
        )

        feature_columns = joblib.load(
            FEATURE_PATH
        )

        if hasattr(
            feature_columns,
            "tolist"
        ):

            feature_columns = (
                feature_columns.tolist()
            )

        feature_columns = list(
            feature_columns
        )

        logger.info(
            "ML model loaded with %d features.",
            len(feature_columns),
        )

        logger.info(
            "Edge AI ready."
        )

        engine_ready = True
        engine_error = None

    except Exception as exc:

        engine_ready = False
        engine_error = str(exc)

        logger.exception(
            "Edge AI initialization failed"
        )


# ============================================================
# EDGE ML PREDICTION
# ============================================================

def edge_predict(
    symptoms: List[str],
) -> Dict[str, Any]:

    if not engine_ready:

        return {
            "status": "unavailable",
            "condition": None,
            "confidence": 0,
            "top_predictions": [],
            "active_features": [],
        }

    matched_features = (
        match_symptoms_to_model_features(
            symptoms
        )
    )

    logger.info(
        "Symptoms extracted: %s",
        symptoms,
    )

    logger.info(
        "Model features matched: %s",
        matched_features,
    )

    if not matched_features:

        return {
            "status": "needs_more_information",
            "condition": None,
            "confidence": 0,
            "top_predictions": [],
            "active_features": [],
        }

    vector = np.zeros(
        len(feature_columns),
        dtype=np.int8,
    )

    normalized_active = {
        normalize_text(x)
        for x in matched_features
    }

    for index, feature in enumerate(
        feature_columns
    ):

        if (
            normalize_text(feature)
            in normalized_active
        ):

            vector[index] = 1

    try:

        X = vector.reshape(
            1,
            -1,
        )

        prediction = disease_model.predict(
            X
        )[0]

        top_predictions = []

        confidence = 0.0

        if hasattr(
            disease_model,
            "predict_proba",
        ):

            probabilities = (
                disease_model.predict_proba(X)[0]
            )

            classes = disease_model.classes_

            ranking = sorted(
                zip(
                    classes,
                    probabilities,
                ),
                key=lambda x: x[1],
                reverse=True,
            )

            top_predictions = [
                {
                    "condition": str(
                        condition
                    ),
                    "confidence": round(
                        float(
                            probability
                        ),
                        4,
                    ),
                }
                for condition, probability
                in ranking[:5]
            ]

            if top_predictions:

                confidence = (
                    top_predictions[0][
                        "confidence"
                    ]
                )

        return {
            "status": "success",
            "condition": str(
                prediction
            ),
            "confidence": confidence,
            "top_predictions": top_predictions,
            "active_features": matched_features,
        }

    except Exception as exc:

        logger.exception(
            "Edge ML prediction failed"
        )

        return {
            "status": "error",
            "condition": None,
            "confidence": 0,
            "top_predictions": [],
            "active_features": matched_features,
            "error": str(exc),
        }


# ============================================================
# LAZY CLOUD RAG
# ============================================================

def initialize_rag():

    global rag_engine
    global rag_error
    global rag_initialized
    global faiss
    global SentenceTransformer
    global torch

    if rag_initialized:

        return rag_engine

    rag_initialized = True

    try:

        logger.info(
            "Initializing Cloud RAG..."
        )

        import faiss as faiss_module

        faiss = faiss_module

        from sentence_transformers import (
            SentenceTransformer as ST,
        )

        SentenceTransformer = ST

        try:

            import torch as torch_module

            torch = torch_module

            # Force CPU
            torch.set_num_threads(
                max(
                    1,
                    min(
                        2,
                        os.cpu_count()
                        or 1,
                    ),
                )
            )

        except Exception:

            torch = None

        if FAISS_PATH is None:

            raise FileNotFoundError(
                "rag_index.faiss not found"
            )

        logger.info(
            "Loading FAISS index..."
        )

        index = faiss.read_index(
            str(FAISS_PATH)
        )

        model_name = os.getenv(
            "EMBEDDING_MODEL",
            "sentence-transformers/all-MiniLM-L6-v2",
        )

        logger.info(
            "Loading embedding model: %s",
            model_name,
        )

        embedding_model = (
            SentenceTransformer(
                model_name,
                device="cpu",
            )
        )

        rag_engine = {
            "index": index,
            "embedding_model": (
                embedding_model
            ),
        }

        rag_error = None

        logger.info(
            "Cloud RAG initialized successfully."
        )

        return rag_engine

    except Exception as exc:

        rag_error = str(exc)

        logger.exception(
            "Cloud RAG initialization failed"
        )

        rag_engine = None

        return None


# ============================================================
# CLOUD RAG SEARCH
# ============================================================

def rag_search(
    query: str,
) -> List[Dict[str, Any]]:

    engine = initialize_rag()

    if engine is None:

        return []

    try:

        embedding = (
            engine[
                "embedding_model"
            ].encode(
                [query],
                normalize_embeddings=True,
            )
        )

        scores, indices = (
            engine["index"].search(
                np.asarray(
                    embedding,
                    dtype=np.float32,
                ),
                RAG_TOP_K,
            )
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0],
        ):

            if index < 0:
                continue

            results.append(
                {
                    "score": float(score),
                    "index": int(index),
                }
            )

        return results

    except Exception:

        logger.exception(
            "RAG search failed"
        )

        return []


# ============================================================
# CLOUD ENHANCEMENT
# ============================================================

def cloud_enhance(
    query: str,
    condition: Optional[str],
    symptoms: List[str],
) -> Dict[str, Any]:

    if not ENABLE_CLOUD:

        return {
            "available": False,
            "rag_used": False,
            "message": (
                "Cloud enhancement disabled."
            ),
        }

    if not ENABLE_RAG:

        return {
            "available": True,
            "rag_used": False,
            "message": (
                "Cloud RAG is currently "
                "disabled for lightweight deployment."
            ),
        }

    search_query = query

    if condition:

        search_query = (
            f"{condition}. "
            f"Symptoms: "
            f"{', '.join(symptoms)}. "
            f"{query}"
        )

    results = rag_search(
        search_query
    )

    if not results:

        return {
            "available": False,
            "rag_used": False,
            "message": (
                "Cloud medical knowledge "
                "is temporarily unavailable."
            ),
        }

    return {
        "available": True,
        "rag_used": True,
        "results": results,
    }


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup():

    logger.info(
        "=============================================="
    )

    logger.info(
        "AI CHIKITSALYA API STARTING"
    )

    logger.info(
        "Version: 3.0.0"
    )

    logger.info(
        "PORT: %s",
        PORT,
    )

    logger.info(
        "Edge AI: enabled"
    )

    logger.info(
        "Cloud AI: %s",
        ENABLE_CLOUD,
    )

    logger.info(
        "Cloud RAG: %s",
        ENABLE_RAG,
    )

    logger.info(
        "Allowed origins: %s",
        ALLOWED_ORIGINS,
    )

    logger.info(
        "=============================================="
    )

    # CRITICAL:
    # Only load lightweight Edge AI here.
    initialize_edge_ai()

    if engine_ready:

        logger.info(
            "=============================================="
        )

        logger.info(
            "EDGE AI READY"
        )

        logger.info(
            "Disease model: READY"
        )

        logger.info(
            "Safety engine: READY"
        )

        logger.info(
            "Cloud RAG: LAZY LOADED"
        )

        logger.info(
            "=============================================="
        )

    else:

        logger.error(
            "EDGE AI FAILED: %s",
            engine_error,
        )


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {
        "service": "AI Chikitsalya",
        "status": (
            "ready"
            if engine_ready
            else "degraded"
        ),
        "architecture": (
            "Edge AI + Cloud AI"
        ),
        "version": "3.0.0",
        "edge_ai": engine_ready,
        "cloud_ai": ENABLE_CLOUD,
        "rag_enabled": ENABLE_RAG,
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health():

    return {
        "status": (
            "healthy"
            if engine_ready
            else "degraded"
        ),
        "edge_ai": engine_ready,
        "cloud_ai": ENABLE_CLOUD,
        "rag_enabled": ENABLE_RAG,
        "rag_loaded": (
            rag_engine is not None
        ),
        "model_features": len(
            feature_columns
        ),
        "error": engine_error,
    }


# ============================================================
# MODEL STATUS
# ============================================================

@app.get("/model-status")
async def model_status():

    return {
        "edge_ai": {
            "ready": engine_ready,
            "model_loaded": (
                disease_model is not None
            ),
            "feature_count": len(
                feature_columns
            ),
            "error": engine_error,
        },

        "cloud_ai": {
            "enabled": ENABLE_CLOUD,
        },

        "rag": {
            "enabled": ENABLE_RAG,
            "initialized": rag_initialized,
            "loaded": rag_engine is not None,
            "error": rag_error,
        },
    }


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/system-status")
async def system_status():

    return {
        "service": "AI Chikitsalya",

        "edge_ai": {
            "available": engine_ready,
            "disease_model": (
                disease_model is not None
            ),
            "safety_engine": True,
        },

        "cloud_ai": {
            "available": ENABLE_CLOUD,
        },

        "rag": {
            "available": (
                ENABLE_RAG
                and rag_engine is not None
            ),
            "enabled": ENABLE_RAG,
            "loaded": (
                rag_engine is not None
            ),
        },
    }


# ============================================================
# MAIN PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
async def predict(
    request: PredictionRequest,
):

    logger.info(
        "Prediction request received | "
        "lang=%s | chars=%d",
        request.lang,
        len(request.query),
    )

    # --------------------------------------------------------
    # EDGE SYMPTOM EXTRACTION
    # --------------------------------------------------------

    symptoms = extract_symptoms(
        request.query
    )

    logger.info(
        "Extracted symptoms: %s",
        symptoms,
    )

    # --------------------------------------------------------
    # SAFETY
    # --------------------------------------------------------

    risk = assess_risk(
        symptoms
    )

    emergency = emergency_check(
        symptoms
    )

    # --------------------------------------------------------
    # EDGE ML
    # --------------------------------------------------------

    if not engine_ready:

        logger.error(
            "Edge model unavailable: %s",
            engine_error,
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Edge medical AI model "
                "is currently unavailable."
            ),
        )

    result = edge_predict(
        symptoms
    )

    # --------------------------------------------------------
    # NEED MORE INFORMATION
    # --------------------------------------------------------

    if result["status"] == (
        "needs_more_information"
    ):

        return {
            "status": "success",

            "assessment_status":
                "needs_more_information",

            "reply": (
                "More information is needed "
                "before AI Chikitsalya can "
                "provide a condition-specific "
                "assessment."
            ),

            "condition": None,

            "ml_prediction": None,

            "confidence": 0,

            "top_predictions": [],

            "active_features": [],

            "follow_up_questions": [
                "How long have you had these symptoms?",
                "Are the symptoms getting better, worse, or staying the same?",
                "Are you taking any medicines or do you have any known medical conditions?",
            ],

            "risk": risk,

            "emergency": emergency,

            "edge_ai": True,

            "rag_used": False,

            "model_version": "edge-v1",

            "disclaimer": (
                "AI Chikitsalya provides health "
                "information and decision support. "
                "It does not replace a qualified "
                "medical professional or provide "
                "a confirmed diagnosis."
            ),
        }

    # --------------------------------------------------------
    # SUCCESS
    # --------------------------------------------------------

    condition = result.get(
        "condition"
    )

    confidence = result.get(
        "confidence",
        0,
    )

    top_predictions = result.get(
        "top_predictions",
        [],
    )

    # --------------------------------------------------------
    # EDGE RESPONSE
    # --------------------------------------------------------

    response = {
        "status": "success",

        "assessment_status":
            "preliminary_assessment",

        "reply": (
            f"AI Chikitsalya generated "
            f"a preliminary assessment "
            f"based on the entered symptoms."
        ),

        "condition": condition,

        "ml_prediction": condition,

        "confidence": confidence,

        "top_predictions":
            top_predictions,

        "active_features":
            result.get(
                "active_features",
                [],
            ),

        "risk": risk,

        "emergency": emergency,

        "edge_ai": True,

        "rag_used": False,

        "cloud_available":
            ENABLE_CLOUD,

        "model_version": "edge-v1",

        "disclaimer": (
            "AI Chikitsalya provides health "
            "information and decision support. "
            "It does not replace a qualified "
            "medical professional or provide "
            "a confirmed diagnosis."
        ),
    }

    return response


# ============================================================
# CLOUD ENHANCEMENT ENDPOINT
# ============================================================

@app.post("/enhance")
async def enhance(
    request: EnhanceRequest,
):

    logger.info(
        "Cloud enhancement requested"
    )

    result = cloud_enhance(
        query=request.query,
        condition=request.condition,
        symptoms=request.symptoms,
    )

    return {
        "status": "success",
        **result,
    }


# ============================================================
# RAG STATUS
# ============================================================

@app.get("/cloud-status")
async def cloud_status():

    return {
        "cloud_enabled": ENABLE_CLOUD,

        "rag_enabled": ENABLE_RAG,

        "rag_initialized":
            rag_initialized,

        "rag_loaded":
            rag_engine is not None,

        "rag_error":
            rag_error,
    }


# ============================================================
# IMAGE ENDPOINT
# ============================================================

@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
):

    """
    Lightweight placeholder for image analysis.

    Heavy vision models should NOT be loaded during
    API startup.

    This endpoint can later activate a cloud vision
    engine only when requested.
    """

    filename = file.filename or ""

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    extension = Path(
        filename
    ).suffix.lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format."
            ),
        )

    try:

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail="Empty image.",
            )

        return {
            "status": "success",

            "message": (
                "Image received successfully. "
                "Cloud vision analysis can be "
                "enabled as an optional service."
            ),

            "filename": filename,

            "size_bytes": len(contents),

            "edge_ai": True,

            "cloud_vision": False,
        }

    except HTTPException:

        raise

    except Exception as exc:

        logger.exception(
            "Image processing failed"
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    logger.info(
        "Starting Uvicorn on port %s",
        PORT,
    )

    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
    )