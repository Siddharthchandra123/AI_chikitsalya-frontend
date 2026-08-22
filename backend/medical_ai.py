"""
AI Chikitsalya - Low-Cost Hybrid Medical AI Core

Hybrid pipeline:
1. Normalize patient input
2. Emergency/red-flag screening
3. Intent routing
4. Random Forest symptom classifier
5. Rule-based disease matching
6. FAISS + MedQuAD retrieval
7. Evidence fusion
8. Optional small open-weight model for explanation
9. Structured JSON output

IMPORTANT:
This is a screening / health-information prototype, not a confirmed
medical diagnosis system.
"""

from __future__ import annotations

import logging
import os
import re
from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

try:
    import faiss
except ImportError:
    faiss = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    from transformers import pipeline
except ImportError:
    pipeline = None


# ============================================================
# CONFIGURATION
# ============================================================

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(DATA_DIR, "disease_model.pkl")
COLS_PATH = os.path.join(DATA_DIR, "feature_columns.pkl")
FAISS_PATH = os.path.join(DATA_DIR, "rag_index.faiss")
QA_CSV = os.path.join(DATA_DIR, "medquad_qa.csv")

DESCRIPTION_CSV = os.path.join(DATA_DIR, "symptom_Description.csv")
PRECAUTION_CSV = os.path.join(DATA_DIR, "symptom_precaution.csv")
SEVERITY_CSV = os.path.join(DATA_DIR, "Symptom-severity.csv")
SYMPTOMS_CSV = os.path.join(DATA_DIR, "dataset.csv")
TRAINING_CSV = os.path.join(DATA_DIR, "Training.csv")

EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/all-MiniLM-L6-v2",
)

# Leave empty for the cheapest CPU-first deployment.
# Example later:
# OPEN_MODEL_NAME=google/gemma-3-1b-it
OPEN_MODEL_NAME = os.getenv("OPEN_MODEL_NAME", "").strip()

RAG_TOP_K = int(os.getenv("RAG_TOP_K", "4"))

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("ai_chikitsalya")


# ============================================================
# RESPONSE TYPES
# ============================================================

@dataclass
class ConditionResult:
    name: str
    score: float
    source: str
    confidence_label: str


@dataclass
class RiskResult:
    level: str
    emergency: bool
    red_flags: List[str]
    severity_matches: List[str]


# ============================================================
# SAFE CSV LOADING
# ============================================================

def load_csv(path: str, required: bool = False) -> Optional[pd.DataFrame]:
    if not os.path.exists(path):
        if required:
            raise FileNotFoundError(f"Required file not found: {path}")
        logger.warning("Optional data file missing: %s", path)
        return None

    try:
        return pd.read_csv(path)
    except Exception as exc:
        if required:
            raise
        logger.exception("Could not load %s: %s", path, exc)
        return None


logger.info("Initializing AI Chikitsalya Medical AI Core...")

desc_df = load_csv(DESCRIPTION_CSV)
prec_df = load_csv(PRECAUTION_CSV)
severity_df = load_csv(SEVERITY_CSV)
symptoms_df = load_csv(SYMPTOMS_CSV)


# ============================================================
# RANDOM FOREST MODEL
# ============================================================

model_ml = None
ml_columns: List[str] = []


def load_ml_model() -> None:
    global model_ml, ml_columns

    if os.path.exists(MODEL_PATH) and os.path.exists(COLS_PATH):
        logger.info("Loading pre-trained disease model...")
        model_ml = joblib.load(MODEL_PATH)
        ml_columns = list(joblib.load(COLS_PATH))
        logger.info("ML model loaded with %d features.", len(ml_columns))
        return

    logger.warning(
        "Pre-trained model missing. Training lightweight fallback model."
    )

    train_df = load_csv(TRAINING_CSV, required=True)

    if "prognosis" not in train_df.columns:
        raise ValueError("Training.csv must contain a 'prognosis' column.")

    X = train_df.drop(columns=["prognosis"])
    y = train_df["prognosis"]

    from sklearn.ensemble import RandomForestClassifier

    model_ml = RandomForestClassifier(
        n_estimators=50,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    model_ml.fit(X, y)

    ml_columns = X.columns.tolist()

    try:
        joblib.dump(model_ml, MODEL_PATH)
        joblib.dump(ml_columns, COLS_PATH)
        logger.info("Fallback model persisted.")
    except Exception as exc:
        logger.warning("Could not save fallback model: %s", exc)


load_ml_model()


# ============================================================
# FAISS / MEDQUAD RAG
# ============================================================

index = None
answers: List[str] = []


def load_rag() -> None:
    global index, answers

    if faiss is None:
        logger.warning("FAISS not installed. RAG disabled.")
        return

    if not os.path.exists(FAISS_PATH) or not os.path.exists(QA_CSV):
        logger.warning("FAISS index or MedQuAD CSV missing. RAG disabled.")
        return

    try:
        index = faiss.read_index(FAISS_PATH)

        qa_df = pd.read_csv(QA_CSV, usecols=["Answer"])
        answers = qa_df["Answer"].fillna("").astype(str).tolist()

        logger.info(
            "Medical RAG loaded: %d answers, dimension=%d.",
            len(answers),
            index.d,
        )
    except Exception as exc:
        logger.exception("RAG initialization failed: %s", exc)
        index = None
        answers = []


load_rag()


# ============================================================
# LAZY EMBEDDING MODEL
# ============================================================

_embedding_model = None


def get_embedding_model():
    global _embedding_model

    if _embedding_model is None:
        if SentenceTransformer is None:
            raise RuntimeError(
                "sentence-transformers is not installed."
            )

        logger.info("Loading embedding model: %s", EMBEDDING_MODEL_NAME)
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    return _embedding_model


# ============================================================
# OPTIONAL SMALL OPEN-WEIGHT MODEL
# ============================================================

_open_model = None


def get_open_model():
    """
    Optional explanation model.

    Keep OPEN_MODEL_NAME empty for the lowest-cost deployment.
    The rest of the medical pipeline continues to work.
    """
    global _open_model

    if not OPEN_MODEL_NAME:
        return None

    if _open_model is not None:
        return _open_model

    if pipeline is None:
        logger.warning("transformers unavailable. Open model disabled.")
        return None

    try:
        logger.info("Loading open-weight model: %s", OPEN_MODEL_NAME)

        _open_model = pipeline(
            "text-generation",
            model=OPEN_MODEL_NAME,
            device_map="auto",
        )

        return _open_model
    except Exception as exc:
        logger.exception("Open model loading failed: %s", exc)
        _open_model = None
        return None


# ============================================================
# INPUT NORMALIZATION
# ============================================================

REPLACEMENTS = {
    "bodypain": "body pain",
    "body ache": "body pain",
    "vommit": "vomiting",
    "vomitting": "vomiting",
    "throwing up": "vomiting",
    "blurred vision": "blurry vision",
    "weak": "weakness",
    "breathlessness": "difficulty breathing",
    "shortness of breath": "difficulty breathing",
    "high temperature": "fever",
}


def normalize_input(text: str) -> str:
    text = str(text or "").strip().lower()

    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)

    return re.sub(r"\s+", " ", text).strip()


# ============================================================
# INTENT ROUTER
# ============================================================

INTENT_PATTERNS = {
    "symptom_assessment": [
        "i have",
        "i am having",
        "i feel",
        "symptoms",
        "fever",
        "cough",
        "headache",
        "pain",
        "dizziness",
        "vomiting",
    ],
    "lab_interpretation": [
        "lab report",
        "blood test",
        "hba1c",
        "hemoglobin",
        "cholesterol",
        "creatinine",
        "platelet",
        "wbc",
        "rbc",
    ],
    "medication": [
        "medicine",
        "medication",
        "tablet",
        "drug",
        "dosage",
        "dose",
        "side effect",
    ],
    "insurance": [
        "insurance",
        "policy",
        "premium",
        "coverage",
        "claim",
        "life cover",
        "health cover",
    ],
    "general_health": [
        "what is",
        "explain",
        "prevention",
        "health",
        "how can i",
    ],
}


def detect_intent(text: str) -> str:
    clean = normalize_input(text)

    scores: Dict[str, int] = {}

    for intent, patterns in INTENT_PATTERNS.items():
        scores[intent] = sum(pattern in clean for pattern in patterns)

    best = max(scores, key=scores.get)

    return best if scores[best] > 0 else "general_health"


# ============================================================
# SAFETY / EMERGENCY ENGINE
# ============================================================

EMERGENCY_RULES = {
    "chest pain": "Chest pain",
    "difficulty breathing": "Difficulty breathing",
    "unconscious": "Loss of consciousness",
    "fainted": "Fainting",
    "severe bleeding": "Severe bleeding",
    "seizure": "Seizure",
    "blue lips": "Blue or gray lips",
    "severe allergic reaction": "Possible severe allergic reaction",
    "stroke symptoms": "Possible stroke symptoms",
}


def emergency_check(text: str) -> List[str]:
    clean = normalize_input(text)

    return sorted(
        {
            label
            for phrase, label in EMERGENCY_RULES.items()
            if phrase in clean
        }
    )


def check_risk(user_input: str) -> List[str]:
    """
    Backward-compatible version of the original check_risk().
    """
    if severity_df is None or "Symptom" not in severity_df.columns:
        return []

    weight_col = None

    for candidate in ("weight", "Weight", "severity", "Severity"):
        if candidate in severity_df.columns:
            weight_col = candidate
            break

    if weight_col is None:
        return []

    text = normalize_input(user_input)
    matches = []

    for _, row in severity_df.iterrows():
        symptom = normalize_input(row["Symptom"])

        try:
            weight = float(row[weight_col])
        except (TypeError, ValueError):
            continue

        if symptom and symptom in text and weight > 5:
            matches.append(symptom)

    return sorted(set(matches))


def assess_risk(text: str) -> RiskResult:
    red_flags = emergency_check(text)
    severity_matches = check_risk(text)

    if red_flags:
        level = "emergency"
    elif len(severity_matches) >= 2:
        level = "high"
    elif severity_matches:
        level = "moderate"
    else:
        level = "low"

    return RiskResult(
        level=level,
        emergency=bool(red_flags),
        red_flags=red_flags,
        severity_matches=severity_matches,
    )


# ============================================================
# SYMPTOM EXTRACTION
# ============================================================

# User-facing symptom phrases -> common model feature concepts.
# The final mapping is always resolved against ml_columns, so the
# trained model receives its original feature names.
SYMPTOM_ALIASES = {
    "fever": ["fever", "high fever", "high temperature", "temperature", "feverish"],
    "cough": ["cough", "coughing", "dry cough", "wet cough"],
    "fatigue": ["fatigue", "tiredness", "very tired", "extreme tiredness"],
    "headache": ["headache", "head ache", "head pain"],
    "body ache": ["body ache", "body aches", "body pain", "muscle pain"],
    "sore throat": ["sore throat", "throat pain", "pain in throat", "throat hurts"],
    "runny nose": ["runny nose", "running nose", "nose is running"],
    "sneezing": ["sneezing", "sneeze"],
    "shortness of breath": ["shortness of breath", "difficulty breathing", "breathlessness", "breathing problem", "trouble breathing"],
    "wheezing": ["wheezing", "wheeze"],
    "chest pain": ["chest pain", "pain in chest"],
    "nausea": ["nausea", "feeling nauseous", "feel nauseous"],
    "vomiting": ["vomiting", "vomit", "throwing up", "throw up"],
    "diarrhea": ["diarrhea", "diarrhoea", "loose motion", "loose motions"],
    "abdominal pain": ["abdominal pain", "stomach pain", "belly pain", "pain in stomach"],
    "loss of taste": ["loss of taste", "cannot taste", "can't taste", "lost taste"],
    "loss of smell": ["loss of smell", "cannot smell", "can't smell", "lost smell"],
    "dizziness": ["dizziness", "dizzy", "lightheaded", "light headed", "feeling dizzy"],
    "chills": ["chills", "shivering", "shivering chills"],
    "joint pain": ["joint pain", "painful joints"],
    "skin rash": ["skin rash", "rash", "rash on skin"],
}


def _feature_key(value: str) -> str:
    """Normalize a model feature for semantic comparison."""
    value = str(value or "").lower().strip()
    value = value.replace("_", " ").replace("-", " ")
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def extract_known_symptoms(text: str) -> List[str]:
    """Extract symptoms and return the exact trained-model feature names."""
    clean = normalize_input(text)
    clean_key = _feature_key(clean)

    if not clean_key or not ml_columns:
        logger.warning(
            "Symptom extraction unavailable | text=%r | ml_columns=%d",
            text,
            len(ml_columns),
        )
        return []

    # Build normalized lookup for every feature in the trained model.
    feature_lookup = {
        _feature_key(column): column
        for column in ml_columns
        if str(column).strip()
    }

    found: List[str] = []

    def contains_phrase(phrase: str) -> bool:
        phrase_key = _feature_key(phrase)
        if not phrase_key:
            return False
        return bool(
            re.search(
                rf"(?<![a-z0-9]){re.escape(phrase_key)}(?![a-z0-9])",
                clean_key,
            )
        )

    # 1. Alias/semantic matching.
    for canonical, aliases in SYMPTOM_ALIASES.items():
        matched = any(contains_phrase(alias) for alias in aliases)
        if not matched:
            continue

        # Prefer exact canonical feature.
        if canonical in feature_lookup:
            found.append(feature_lookup[canonical])
            continue

        # Match aliases to the actual feature vocabulary.
        for feature_key, original in feature_lookup.items():
            if feature_key == canonical:
                found.append(original)
                break

            # e.g. "shortness of breath" vs "shortness_of_breath"
            if canonical in feature_key or feature_key in canonical:
                found.append(original)
                break

    # 2. Direct matching against every trained feature.
    # This catches features not included in SYMPTOM_ALIASES.
    for feature_key, original in feature_lookup.items():
        if not feature_key or original in found:
            continue

        if re.search(
            rf"(?<![a-z0-9]){re.escape(feature_key)}(?![a-z0-9])",
            clean_key,
        ):
            found.append(original)

    found = list(dict.fromkeys(found))

    logger.info("Symptom extraction | input=%r", text)
    logger.info("Symptom extraction | normalized=%r", clean_key)
    logger.info("Symptom extraction | matched=%s", found)
    logger.info("Symptom extraction | count=%d", len(found))

    return found


def create_ml_input(text: str) -> pd.DataFrame:
    """Create the exact feature vector expected by the trained model."""
    active = set(extract_known_symptoms(text))

    values = [
        1 if column in active else 0
        for column in ml_columns
    ]

    logger.info(
        "ML feature vector | active=%d | total=%d",
        sum(values),
        len(values),
    )

    return pd.DataFrame(
        [values],
        columns=ml_columns,
    )


# ============================================================
# RANDOM FOREST PREDICTION
# ============================================================

def create_ml_input(text: str) -> pd.DataFrame:
    clean = normalize_input(text)

    values = []

    for column in ml_columns:
        symptom = normalize_input(column)
        pattern = r"\b" + re.escape(symptom) + r"\b"
        values.append(1 if symptom and re.search(pattern, clean) else 0)

    return pd.DataFrame([values], columns=ml_columns)


def confidence_label(score: float) -> str:
    if score >= 0.80:
        return "high"
    if score >= 0.60:
        return "moderate"
    return "low"


def predict_ml(text: str) -> List[ConditionResult]:
    if model_ml is None:
        return []

    try:
        input_data = create_ml_input(text)

        if not hasattr(model_ml, "predict_proba"):
            prediction = model_ml.predict(input_data)[0]

            return [
                ConditionResult(
                    name=str(prediction),
                    score=0.0,
                    source="random_forest",
                    confidence_label="unknown",
                )
            ]

        probabilities = model_ml.predict_proba(input_data)[0]
        classes = list(model_ml.classes_)
        top_indices = np.argsort(probabilities)[::-1][:3]

        return [
            ConditionResult(
                name=str(classes[i]),
                score=round(float(probabilities[i]), 4),
                source="random_forest",
                confidence_label=confidence_label(float(probabilities[i])),
            )
            for i in top_indices
        ]

    except Exception as exc:
        logger.exception("ML prediction failed: %s", exc)
        return []


# ============================================================
# RULE-BASED DISEASE MATCHER
# ============================================================

def predict_disease(user_input: str) -> Optional[str]:
    """
    Improved version of the original predict_disease().
    """

    if symptoms_df is None or symptoms_df.empty:
        return None

    disease_col = None

    for candidate in ("Disease", "prognosis", "Prognosis"):
        if candidate in symptoms_df.columns:
            disease_col = candidate
            break

    if disease_col is None:
        return None

    known = {normalize_input(x) for x in extract_known_symptoms(user_input)}

    if not known:
        return None

    best_match = None
    max_matches = 0

    symptom_cols = [c for c in symptoms_df.columns if c != disease_col]

    for _, row in symptoms_df.iterrows():
        row_symptoms = {
            normalize_input(row[col])
            for col in symptom_cols
            if pd.notna(row[col]) and str(row[col]).strip()
        }

        matches = len(known.intersection(row_symptoms))

        if matches > max_matches:
            max_matches = matches
            best_match = row[disease_col]

    return str(best_match) if max_matches > 0 else None


# ============================================================
# DESCRIPTION / PRECAUTIONS
# ============================================================

def get_description(disease: Optional[str]) -> str:
    if not disease or desc_df is None:
        return ""

    if "Disease" not in desc_df.columns or "Description" not in desc_df.columns:
        return ""

    result = desc_df[
        desc_df["Disease"].astype(str).str.lower()
        == disease.lower()
    ]

    return str(result["Description"].iloc[0]) if not result.empty else ""


def get_precautions(disease: Optional[str]) -> List[str]:
    if not disease or prec_df is None or "Disease" not in prec_df.columns:
        return []

    result = prec_df[
        prec_df["Disease"].astype(str).str.lower()
        == disease.lower()
    ]

    if result.empty:
        return []

    return [
        str(value)
        for value in result.iloc[0, 1:].tolist()
        if pd.notna(value) and str(value).strip()
    ]


# ============================================================
# TEXT HELPERS
# ============================================================

def simplify_answer(text: str, max_sentences: int = 3) -> str:
    if not text:
        return ""

    clean = re.sub(r"\s+", " ", str(text)).strip()
    sentences = re.split(r"(?<=[.!?])\s+", clean)

    return " ".join(sentences[:max_sentences])


def format_output(text: str) -> str:
    if not text:
        return ""

    parts = re.split(r"(?<=[.!?])\s+", str(text).strip())

    return "\n".join(
        "• " + part.strip()
        for part in parts
        if len(part.strip()) > 5
    )


# ============================================================
# FAISS RETRIEVAL
# ============================================================

def rag_search(query: str) -> List[Dict[str, Any]]:
    if index is None or not answers:
        return []

    try:
        embedding_model = get_embedding_model()

        vector = embedding_model.encode(
            [normalize_input(query)]
        ).astype("float32")

        # IMPORTANT:
        # Keep embedding/index preprocessing identical to the process
        # used when rag_index.faiss was originally created.
        distances, indices = index.search(vector, RAG_TOP_K)

        results = []

        for distance, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(answers):
                continue

            answer = answers[idx].strip()

            if not answer:
                continue

            results.append(
                {
                    "text": simplify_answer(answer),
                    "distance": round(float(distance), 4),
                    "document_index": int(idx),
                }
            )

        return results

    except Exception as exc:
        logger.exception("RAG search failed: %s", exc)
        return []


# ============================================================
# EVIDENCE FUSION
# ============================================================

def fuse_conditions(
    ml_results: List[ConditionResult],
    rule_condition: Optional[str],
) -> List[ConditionResult]:

    combined: Dict[str, float] = {}
    sources: Dict[str, List[str]] = {}

    for result in ml_results:
        combined[result.name] = (
            combined.get(result.name, 0.0)
            + (result.score * 0.70)
        )

        sources.setdefault(result.name, []).append("random_forest")

    if rule_condition:
        combined[rule_condition] = (
            combined.get(rule_condition, 0.0) + 0.30
        )

        sources.setdefault(rule_condition, []).append("rule_engine")

    ranked = sorted(
        combined.items(),
        key=lambda item: item[1],
        reverse=True,
    )[:3]

    return [
        ConditionResult(
            name=name,
            score=round(min(score, 1.0), 4),
            source="+".join(sorted(set(sources[name]))),
            confidence_label=confidence_label(min(score, 1.0)),
        )
        for name, score in ranked
    ]


# ============================================================
# OPTIONAL OPEN-WEIGHT MODEL
# ============================================================

def generate_open_model_guidance(
    user_input: str,
    intent: str,
    risk: RiskResult,
    conditions: List[ConditionResult],
    rag_results: List[Dict[str, Any]],
) -> Optional[str]:

    model = get_open_model()

    if model is None:
        return None

    condition_context = "\n".join(
        f"- {c.name}: {c.confidence_label} model confidence"
        for c in conditions
    ) or "No reliable candidate condition."

    evidence_context = "\n".join(
        f"- {r['text']}"
        for r in rag_results[:3]
    ) or "No retrieved evidence."

    prompt = f"""
You are the patient-friendly explanation component of AI Chikitsalya.

You provide health information and screening support, NOT a confirmed
medical diagnosis.

Patient message:
{user_input}

Intent:
{intent}

Risk level:
{risk.level}

Red flags:
{", ".join(risk.red_flags) if risk.red_flags else "None detected"}

Structured model candidates:
{condition_context}

Retrieved medical evidence:
{evidence_context}

Rules:
- Never say the patient definitely has a disease.
- Never invent facts not present above.
- Do not prescribe medication or dosage.
- Prioritize emergency care if red flags are present.
- Explain uncertainty.
- Encourage appropriate professional care.
- Keep the answer concise and patient friendly.

Respond using:
1. What this may suggest
2. Information still needed
3. Safe next steps
4. Warning signs
"""

    try:
        result = model(
            prompt,
            max_new_tokens=300,
            do_sample=False,
        )

        if not result:
            return None

        generated = result[0].get("generated_text", "").strip()

        if generated.startswith(prompt):
            generated = generated[len(prompt):].strip()

        return generated or None

    except Exception as exc:
        logger.exception("Open-model inference failed: %s", exc)
        return None


# ============================================================
# SAFETY VALIDATOR
# ============================================================

def validate_response(response: Dict[str, Any]) -> Dict[str, Any]:
    response["disclaimer"] = (
        "AI Chikitsalya provides AI-assisted health information and "
        "screening support. It does not provide a confirmed medical "
        "diagnosis. Medical decisions should be made with a qualified "
        "healthcare professional."
    )

    if response.get("risk", {}).get("emergency"):
        response["urgent_action"] = (
            "Potential emergency warning signs were detected. Seek urgent "
            "medical evaluation or contact local emergency services. Do not "
            "delay care while waiting for an AI assessment."
        )

    return response


# ============================================================
# MAIN MEDICAL AI FUNCTION
# ============================================================

def ask(user_input: str) -> Dict[str, Any]:
    """
    Main function for FastAPI.

    Returns structured JSON-compatible data.
    """

    if not user_input or not str(user_input).strip():
        return {
            "status": "error",
            "message": "Please describe your medical or health question.",
        }

    clean = normalize_input(user_input)

    # --------------------------------------------------------
    # 1. SAFETY FIRST
    # --------------------------------------------------------

    risk = assess_risk(clean)

    if risk.emergency:
        return validate_response(
            {
                "status": "urgent",
                "intent": "emergency",
                "risk": asdict(risk),
                "known_symptoms": extract_known_symptoms(clean),
                "possible_conditions": [],
                "rag": [],
                "guidance": [
                    "Potential emergency warning signs were detected.",
                    "Seek urgent medical evaluation.",
                    "Do not rely on AI alone in an emergency.",
                ],
                "model_version": "hybrid-v2",
            }
        )

    # --------------------------------------------------------
    # 2. INTENT ROUTING
    # --------------------------------------------------------

    intent = detect_intent(clean)

    # --------------------------------------------------------
    # 3. EXISTING RANDOM FOREST
    # --------------------------------------------------------

    ml_results = predict_ml(clean)

    # --------------------------------------------------------
    # 4. EXISTING RULE ENGINE
    # --------------------------------------------------------

    rule_condition = predict_disease(clean)

    # --------------------------------------------------------
    # 5. FUSE MODEL + RULE EVIDENCE
    # --------------------------------------------------------

    conditions = fuse_conditions(
        ml_results,
        rule_condition,
    )

    # --------------------------------------------------------
    # 6. EXISTING FAISS / MEDQUAD RAG
    # --------------------------------------------------------

    rag_results = rag_search(clean)

    # --------------------------------------------------------
    # 7. CONDITION INFORMATION
    # --------------------------------------------------------

    primary_condition = (
        conditions[0].name
        if conditions
        else rule_condition
    )

    description = get_description(primary_condition)
    precautions = get_precautions(primary_condition)

    # --------------------------------------------------------
    # 8. OPTIONAL SMALL OPEN MODEL
    # --------------------------------------------------------

    open_model_guidance = generate_open_model_guidance(
        user_input=clean,
        intent=intent,
        risk=risk,
        conditions=conditions,
        rag_results=rag_results,
    )

    # --------------------------------------------------------
    # 9. CHEAP DETERMINISTIC FALLBACK
    # --------------------------------------------------------

    guidance: List[str] = []

    if open_model_guidance:
        guidance.append(open_model_guidance)
    else:
        if description:
            guidance.append(simplify_answer(description))

        guidance.extend(precautions[:4])

        if rag_results:
            guidance.extend(
                r["text"]
                for r in rag_results[:2]
            )

        if not guidance:
            guidance.append(
                "There is not enough information for a useful assessment. "
                "Please provide more detail or consult a healthcare professional."
            )

    # --------------------------------------------------------
    # 10. STRUCTURED RESPONSE
    # --------------------------------------------------------

    response = {
        "status": "success",
        "intent": intent,
        "risk": asdict(risk),
        "known_symptoms": extract_known_symptoms(clean),
        "possible_conditions": [
            asdict(condition)
            for condition in conditions
        ],
        "rule_based_condition": rule_condition,
        "description": simplify_answer(description),
        "precautions": precautions,
        "rag": rag_results,
        "guidance": guidance,
        "open_model_enabled": bool(OPEN_MODEL_NAME),
        "model_version": "hybrid-v2",
    }

    return validate_response(response)


# ============================================================
# TEXT WRAPPER FOR OLD FRONTEND / CHATBOT CODE
# ============================================================

def ask_text(user_input: str) -> str:
    """
    Use this if your existing application expects the old string response.
    """

    result = ask(user_input)

    if result.get("status") == "error":
        return result["message"]

    if result.get("status") == "urgent":
        return (
            "🚨 POTENTIAL EMERGENCY\n\n"
            + "\n".join(result["guidance"])
            + "\n\n"
            + result["disclaimer"]
        )

    output: List[str] = []

    conditions = result.get("possible_conditions", [])

    if conditions:
        output.append("🩺 Possible Conditions:")

        for condition in conditions:
            output.append(
                f"• {condition['name']} "
                f"({condition['confidence_label']} model confidence)"
            )

    if result.get("description"):
        output.extend(
            [
                "",
                "About:",
                result["description"],
            ]
        )

    if result.get("precautions"):
        output.append("")
        output.append("Care Guidance:")

        for precaution in result["precautions"][:4]:
            output.append(f"• {precaution}")

    if result.get("guidance"):
        output.append("")
        output.append("Additional Guidance:")

        for item in result["guidance"]:
            output.append(f"• {item}")

    output.extend(
        [
            "",
            result["disclaimer"],
        ]
    )

    return "\n".join(output)


# ============================================================
# STARTUP INFORMATION
# ============================================================

logger.info("AI Chikitsalya Medical AI ready.")
logger.info(
    "RandomForest=%s | RAG=%s | OpenModel=%s",
    model_ml is not None,
    index is not None,
    bool(OPEN_MODEL_NAME),
)


if __name__ == "__main__":
    print(
        ask_text(
            "I have fever, cough and body pain for two days."
        )
    )