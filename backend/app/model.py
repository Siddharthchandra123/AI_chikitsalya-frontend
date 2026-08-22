from __future__ import annotations
from pathlib import Path
import json
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MultiLabelBinarizer
import joblib

BASE = Path(__file__).resolve().parent
ARTIFACT = BASE / "model.joblib"
META = BASE / "model_meta.json"

SYMPTOMS = [
    "fever","cough","headache","fatigue","bodyache","breathing",
    "nausea","sorethroat","runny_nose","sneezing","vomiting","diarrhea",
    "abdominal_pain","chest_pain","dizziness","rash","joint_pain",
    "loss_of_smell","loss_of_taste","urinary_burning"
]

# Prototype profiles are intentionally used only to create a deterministic
# demo/training fixture. They are NOT clinical ground truth.
PROFILES = {
    "Common cold": ["cough","sorethroat","runny_nose","sneezing","fatigue"],
    "Influenza-like illness": ["fever","cough","headache","fatigue","bodyache","sorethroat"],
    "COVID-19-like illness": ["fever","cough","fatigue","headache","loss_of_smell","loss_of_taste"],
    "Allergic rhinitis": ["sneezing","runny_nose","headache","fatigue"],
    "Gastroenteritis": ["nausea","vomiting","diarrhea","abdominal_pain","fever","fatigue"],
    "Migraine-like illness": ["headache","nausea","dizziness","fatigue"],
    "Bronchitis-like illness": ["cough","fatigue","breathing","sorethroat","fever"],
    "Asthma-like symptoms": ["breathing","cough","chest_pain","fatigue"],
    "Urinary tract infection-like illness": ["fever","nausea","abdominal_pain","urinary_burning","fatigue"],
    "Viral rash illness": ["fever","rash","headache","fatigue","bodyache"],
    "Musculoskeletal pain": ["joint_pain","bodyache","fatigue"],
    "Respiratory infection-like illness": ["fever","cough","sorethroat","breathing","fatigue"],
}

def _make_fixture():
    rng = np.random.default_rng(42)
    X, y = [], []
    for label, core in PROFILES.items():
        core_idx = {SYMPTOMS.index(s) for s in core}
        for _ in range(160):
            row = rng.binomial(1, 0.04, len(SYMPTOMS))
            for i in core_idx:
                row[i] = rng.binomial(1, 0.82)
            X.append(row)
            y.append(label)
    return np.asarray(X), np.asarray(y)

def train_and_save():
    X, y = _make_fixture()
    clf = LogisticRegression(max_iter=2500, class_weight="balanced", random_state=42)
    clf.fit(X, y)
    joblib.dump({"classifier": clf, "symptoms": SYMPTOMS}, ARTIFACT)
    META.write_text(json.dumps({
        "model_type": "LogisticRegression",
        "version": "0.1-demo",
        "features": SYMPTOMS,
        "classes": list(clf.classes_),
        "clinical_validation": False,
        "training_note": "Deterministic synthetic prototype fixture for software demonstration; not medical ground truth."
    }, indent=2))
    return clf

def load_model():
    if not ARTIFACT.exists():
        return train_and_save()
    return joblib.load(ARTIFACT)["classifier"]

MODEL = load_model()

def predict(selected: list[str], additional_info: str = ""):
    clean = [s for s in selected if s in SYMPTOMS]
    if not clean:
        raise ValueError("At least one supported symptom is required.")
    x = np.zeros((1, len(SYMPTOMS)), dtype=int)
    for s in clean:
        x[0, SYMPTOMS.index(s)] = 1
    probs = MODEL.predict_proba(x)[0]
    order = np.argsort(probs)[::-1]
    top = [
        {"condition": str(MODEL.classes_[i]), "probability": round(float(probs[i]) * 100, 1)}
        for i in order[:5]
    ]
    lead = top[0]
    # Probability here is model score, not a clinical confidence estimate.
    return {
        "primary": lead,
        "alternatives": top[1:],
        "symptoms_used": clean,
        "model_version": "0.1-demo",
        "clinical_validation": False,
        "disclaimer": "For educational/prototype decision support only. It does not diagnose disease or replace a clinician."
    }

