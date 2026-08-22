from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from model import predict, SYMPTOMS

app = FastAPI(title="AI Chikitsalya Clinical Decision Support API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    symptoms: list[str] = Field(min_length=1, max_length=20)
    additional_info: str = Field(default="", max_length=3000)

@app.get("/health")
def health():
    return {"status": "ok", "model": "0.1-demo", "clinical_validation": False}

@app.get("/symptoms")
def symptoms():
    return {"symptoms": SYMPTOMS}

@app.post("/predict")
def prediction(req: PredictionRequest):
    try:
        return predict(req.symptoms, req.additional_info)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

