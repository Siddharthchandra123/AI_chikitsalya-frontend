# ============================================================
# AI CHIKITSALYA - FASTAPI BACKEND
# ============================================================
#
# Endpoints:
#   GET  /
#   GET  /health
#   GET  /model-status
#   POST /predict
#   POST /analyze-image
#
# AI Engine:
#   medical_ai.py
#
# ============================================================

import os
import logging
import traceback
from typing import Optional

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from medical_ai import (
    ask,
    analyze,
    get_model_status,
)

# Optional image analyzer
try:
    from vision.image_analyzer import ImageAnalyzer

    image_analyzer = ImageAnalyzer()

except Exception as exc:
    image_analyzer = None
    logging.warning(
        "ImageAnalyzer unavailable: %s",
        exc
    )


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(
    "AI-Chikitsalya-API"
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI Chikitsalya API",
    description=(
        "Low-cost hybrid Edge + Cloud medical "
        "AI platform for symptom assessment, "
        "medical knowledge retrieval, risk "
        "assessment and health guidance."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        # Render frontend
        "https://ai-chikitsalya-1.onrender.com",

        # Add your production frontend here
        # when deployed.
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class PredictionRequest(BaseModel):

    query: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Patient's medical question or symptoms"
    )

    lang: str = Field(
        default="en",
        max_length=20,
        description="Requested response language"
    )


class PredictionResponse(BaseModel):

    status: str

    reply: str

    condition: Optional[str] = None

    ml_prediction: Optional[str] = None

    confidence: float = 0.0

    assessment_status: str = (
        "needs_more_information"
    )

    active_features: list[str] = []

    top_predictions: list[dict] = []

    follow_up_questions: list[str] = []

    risk: Optional[dict] = None

    emergency: Optional[dict] = None

    edge_ai: bool = True

    rag_used: bool = False


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {
        "service": "AI Chikitsalya",
        "status": "running",
        "version": "1.0.0",
        "architecture": "Hybrid Edge + Cloud AI",
        "endpoints": {
            "health": "/health",
            "prediction": "/predict",
            "model_status": "/model-status",
            "image_analysis": "/analyze-image",
            "documentation": "/docs"
        }
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
async def health():

    return {
        "status": "healthy",
        "service": "AI Chikitsalya",
        "ai_engine": "available"
    }


# ============================================================
# MODEL STATUS
# ============================================================

@app.get("/model-status")
async def model_status():

    try:

        status = get_model_status()

        return {
            "status": "success",
            "models": status
        }

    except Exception as exc:

        logger.exception(
            "Model status failed"
        )

        return {
            "status": "error",
            "message": str(exc)
        }


# ============================================================
# MEDICAL PREDICTION
# ============================================================

@app.post(
    "/predict",
    response_model=PredictionResponse
)
async def predict(
    request: PredictionRequest
):

    logger.info(
        "Prediction request: %s",
        request.query
    )

    try:

        result = analyze(
            request.query
        )

        logger.info(
            "AI RESULT: %s",
            result
        )

        return PredictionResponse(

            status="success",

            reply=result.get(
                "reply",
                ""
            ),

            condition=result.get(
                "condition"
            ),

            ml_prediction=result.get(
                "ml_prediction"
            ),

            confidence=float(
                result.get(
                    "confidence",
                    0.0
                )
            ),

            assessment_status=result.get(
                "assessment_status",
                "needs_more_information"
            ),

            active_features=result.get(
                "active_features",
                []
            ),

            top_predictions=result.get(
                "top_predictions",
                []
            ),

            follow_up_questions=result.get(
                "follow_up_questions",
                []
            ),

            risk=result.get(
                "risk"
            ),

            emergency=result.get(
                "emergency"
            ),

            edge_ai=result.get(
                "edge_ai",
                True
            ),

            rag_used=result.get(
                "rag_used",
                False
            )
        )

    except Exception as exc:

        logger.exception(
            "Prediction failed"
        )

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )

# ============================================================
# IMAGE ANALYSIS
# ============================================================

@app.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...)
):

    if image_analyzer is None:

        raise HTTPException(
            status_code=503,
            detail=(
                "Image analysis service "
                "is currently unavailable."
            )
        )

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg"
    }

    if image.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image type. "
                "Use JPEG, PNG or WebP."
            )
        )

    upload_dir = "uploads"

    os.makedirs(
        upload_dir,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Generate safe filename
    # --------------------------------------------------------

    import uuid

    extension = os.path.splitext(
        image.filename or ""
    )[1]

    filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = os.path.join(
        upload_dir,
        filename
    )

    try:

        # ----------------------------------------------------
        # Save image
        # ----------------------------------------------------

        contents = await image.read()

        with open(
            file_path,
            "wb"
        ) as f:

            f.write(contents)

        logger.info(
            "Image received: %s",
            filename
        )

        # ----------------------------------------------------
        # Analyze
        # ----------------------------------------------------

        label, score = (
            image_analyzer.analyze(
                file_path
            )
        )

        return {

            "status": "success",

            "prediction": label,

            "confidence": float(
                score
            )
        }

    except Exception as exc:

        logger.exception(
            "Image analysis failed"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Image analysis failed."
            )
        )

    finally:

        # ----------------------------------------------------
        # Delete uploaded file
        # ----------------------------------------------------

        try:

            if os.path.exists(
                file_path
            ):

                os.remove(
                    file_path
                )

        except Exception:

            pass


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():

    logger.info(
        "=================================================="
    )

    logger.info(
        "🚀 AI CHIKITSALYA API STARTING"
    )

    logger.info(
        "Architecture: Hybrid Edge + Cloud"
    )

    logger.info(
        "=================================================="
    )

    try:

        status = get_model_status()

        logger.info(
            "Disease Model: %s",
            status.get(
                "disease_model"
            )
        )

        logger.info(
            "FAISS: %s",
            status.get(
                "faiss"
            )
        )

        logger.info(
            "Medical Knowledge: %s",
            status.get(
                "medical_knowledge"
            )
        )

        logger.info(
            "Embedding Model: %s",
            status.get(
                "embedding_model"
            )
        )

    except Exception as exc:

        logger.warning(
            "Could not load model status: %s",
            exc
        )

    logger.info(
        "AI CHIKITSALYA API READY"
    )


# ============================================================
# LOCAL DEVELOPMENT
# ============================================================

if __name__ == "__main__":

    import uvicorn

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )