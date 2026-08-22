"""
AI CHIKITSALYA - Unified Medical AI Engine
------------------------------------------
Single-file hybrid medical AI engine.

EDGE / LOW-COST:
- symptom normalization
- synonym mapping
- emergency/red-flag detection
- risk scoring
- rule-based symptom matching
- lightweight ML disease classifier

ADVANCED / ONLINE:
- FAISS medical knowledge retrieval
- MiniLM embeddings
- optional LLM/image integration hooks

Important behavior:
- Low-confidence ML output is NOT presented as a diagnosis.
- The engine returns targeted follow-up questions when information is insufficient.
- RAG results are filtered so weak/unrelated retrieval is not blindly shown.
- Structured output is designed for the FastAPI backend.
"""

import os
import re
import time
import logging
from typing import Optional, Dict, List, Any, Tuple

import numpy as np
import pandas as pd
import joblib

try:
    import faiss
except ImportError:
    faiss = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "disease_model.pkl")
COLS_PATH = os.path.join(BASE_DIR, "feature_columns.pkl")

FAISS_PATH = os.path.join(BASE_DIR, "rag_index.faiss")
QA_CSV = os.path.join(BASE_DIR, "medquad_qa.csv")

DESCRIPTION_CSV = os.path.join(BASE_DIR, "symptom_Description.csv")
PRECAUTION_CSV = os.path.join(BASE_DIR, "symptom_precaution.csv")
SEVERITY_CSV = os.path.join(BASE_DIR, "Symptom-severity.csv")
DATASET_CSV = os.path.join(BASE_DIR, "dataset.csv")
TRAINING_CSV = os.path.join(BASE_DIR, "Training.csv")

EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "all-MiniLM-L6-v2",
)

RAG_TOP_K = max(1, int(os.getenv("RAG_TOP_K", "3")))

# Cosine similarity threshold. Increase this if retrieval is still noisy.
RAG_SIMILARITY_THRESHOLD = float(
    os.getenv("RAG_SIMILARITY_THRESHOLD", "0.45")
)

# These are decision-support thresholds, NOT medical probabilities.
HIGH_CONFIDENCE_THRESHOLD = float(
    os.getenv("HIGH_CONFIDENCE_THRESHOLD", "0.70")
)
MODERATE_CONFIDENCE_THRESHOLD = float(
    os.getenv("MODERATE_CONFIDENCE_THRESHOLD", "0.40")
)

# Minimum number of recognizable symptoms before we allow a
# disease-specific rule match.
MIN_RULE_SYMPTOMS = max(
    1, int(os.getenv("MIN_RULE_SYMPTOMS", "1"))
)


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("AI-Chikitsalya")


# ============================================================
# GLOBAL STATE
# ============================================================

model_ml = None
ml_columns: List[str] = []

desc_df = pd.DataFrame()
prec_df = pd.DataFrame()
severity_df = pd.DataFrame()
symptoms_df = pd.DataFrame()

faiss_index = None
answers: List[str] = []

_embedding_model = None

MODEL_STATUS = {
    "initialization_started": False,
    "initialization_complete": False,
    "initialization_error": None,
    "datasets": False,
    "disease_model": False,
    "feature_columns": False,
    "faiss": False,
    "medical_knowledge": False,
    "embedding_model": False,
}


# ============================================================
# SYMPTOM NORMALIZATION
# ============================================================

SYMPTOM_SYNONYMS = {
    "high temperature": "fever",
    "temperature": "fever",
    "feverish": "fever",

    "body ache": "body pain",
    "body aches": "body pain",
    "bodypain": "body pain",

    "head ache": "headache",
    "head pain": "headache",

    "throat pain": "sore throat",
    "throat hurts": "sore throat",
    "pain in throat": "sore throat",

    "breathlessness": "difficulty breathing",
    "shortness of breath": "difficulty breathing",
    "breathing problem": "difficulty breathing",
    "trouble breathing": "difficulty breathing",

    "throwing up": "vomiting",
    "throw up": "vomiting",
    "vomit": "vomiting",
    "vommit": "vomiting",
    "vomitting": "vomiting",

    "stomach ache": "stomach pain",
    "belly pain": "stomach pain",

    "runny nose": "runny nose",
    "blocked nose": "nasal congestion",

    "loose motions": "diarrhea",
    "loose motion": "diarrhea",

    "feeling dizzy": "dizziness",
    "light headed": "dizziness",
    "lightheaded": "dizziness",

    "skin rash": "skin rash",
    "rash on skin": "skin rash",

    "weak": "weakness",
    "feeling weak": "weakness",
}


def normalize_input(text: str) -> str:
    """Normalize common natural-language symptom expressions."""
    if not text:
        return ""

    text = str(text).lower().strip()

    # Normalize punctuation while retaining useful phrase boundaries.
    text = re.sub(r"[_/]+", " ", text)
    text = re.sub(r"[^\w\s.,'-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    # Longest phrases first.
    for old, new in sorted(
        SYMPTOM_SYNONYMS.items(),
        key=lambda item: len(item[0]),
        reverse=True,
    ):
        text = re.sub(
            rf"\b{re.escape(old)}\b",
            new,
            text,
        )

    return text


def _normalize_feature_name(value: Any) -> str:
    """Normalize a model feature name for comparison."""
    value = str(value).lower().strip()
    value = value.replace("_", " ").replace("-", " ")
    value = re.sub(r"\s+", " ", value)
    return value


def extract_active_features(text: str) -> List[str]:
    """
    Convert natural-language symptoms into the exact feature names
    expected by the trained disease model.
    """

    normalized = normalize_input(text)

    active = []

    # Common semantic mappings
    semantic_map = {
        "fever": [
            "fever",
            "high fever",
            "high_fever",
            "mild fever",
            "temperature",
        ],

        "cough": [
            "cough",
            "dry cough",
            "wet cough",
        ],

        "sore throat": [
            "sore throat",
            "throat pain",
            "throat hurts",
        ],

        "body pain": [
            "body pain",
            "body ache",
            "body aches",
        ],

        "headache": [
            "headache",
            "head pain",
        ],

        "vomiting": [
            "vomiting",
            "vomit",
            "throwing up",
        ],

        "diarrhea": [
            "diarrhea",
            "loose motion",
            "loose motions",
        ],

        "difficulty breathing": [
            "difficulty breathing",
            "breathlessness",
            "shortness of breath",
            "breathing problem",
        ],

        "chest pain": [
            "chest pain",
        ],

        "runny nose": [
            "runny nose",
        ],

        "sneezing": [
            "sneezing",
            "sneeze",
        ],

        "dizziness": [
            "dizziness",
            "dizzy",
            "lightheaded",
        ],

        "weakness": [
            "weakness",
            "weak",
            "feeling weak",
        ],
    }

    normalized_features = {
        col: _normalize_feature_name(col)
        for col in ml_columns
    }

    for canonical, phrases in semantic_map.items():

        found = any(
            re.search(
                rf"(?<!\w){re.escape(phrase)}(?!\w)",
                normalized,
            )
            for phrase in phrases
        )

        if not found:
            continue

        # Find the actual feature expected by the trained model.
        for original_col, normalized_col in normalized_features.items():

            # Direct canonical match
            if normalized_col == canonical:
                active.append(original_col)
                break

            # fever -> high fever / high_fever
            if canonical == "fever":
                if normalized_col in {
                    "fever",
                    "high fever",
                    "high feverish",
                    "high fever temperature",
                }:
                    active.append(original_col)
                    break

            # Generic phrase containment
            if canonical in normalized_col:
                active.append(original_col)
                break

    # --------------------------------------------------------
    # Direct matching as a fallback
    # --------------------------------------------------------

    for original_col, normalized_col in normalized_features.items():

        if original_col in active:
            continue

        if re.search(
            rf"(?<!\w){re.escape(normalized_col)}(?!\w)",
            normalized,
        ):
            active.append(original_col)

    return list(dict.fromkeys(active))



# ============================================================
# DATA LOADING
# ============================================================

def load_csv(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        logger.warning("CSV not found: %s", path)
        return pd.DataFrame()

    try:
        df = pd.read_csv(path)
        logger.info(
            "Loaded %s (%d rows)",
            os.path.basename(path),
            len(df),
        )
        return df
    except Exception as exc:
        logger.exception(
            "Failed loading %s: %s",
            path,
            exc,
        )
        return pd.DataFrame()


def load_data() -> None:
    global desc_df, prec_df, severity_df, symptoms_df

    logger.info("Loading medical datasets...")

    desc_df = load_csv(DESCRIPTION_CSV)
    prec_df = load_csv(PRECAUTION_CSV)
    severity_df = load_csv(SEVERITY_CSV)
    symptoms_df = load_csv(DATASET_CSV)


# ============================================================
# ML MODEL
# ============================================================

def load_disease_model() -> None:
    global model_ml, ml_columns

    logger.info("Loading disease prediction model...")

    if os.path.exists(MODEL_PATH) and os.path.exists(COLS_PATH):
        try:
            model_ml = joblib.load(MODEL_PATH)
            ml_columns = list(joblib.load(COLS_PATH))

            MODEL_STATUS["disease_model"] = True
            MODEL_STATUS["feature_columns"] = True

            logger.info(
                "Disease model loaded successfully (%d features)",
                len(ml_columns),
            )
            return

        except Exception as exc:
            logger.exception(
                "Pre-trained model loading failed: %s",
                exc,
            )

    # Fallback only for development/demo use.
    if not os.path.exists(TRAINING_CSV):
        logger.error("Training dataset unavailable.")
        return

    try:
        from sklearn.ensemble import RandomForestClassifier

        train_df = pd.read_csv(TRAINING_CSV)

        if "prognosis" not in train_df.columns:
            logger.error(
                "Training dataset does not contain 'prognosis'."
            )
            return

        X = train_df.drop("prognosis", axis=1)
        y = train_df["prognosis"]

        model_ml = RandomForestClassifier(
            n_estimators=20,
            random_state=42,
            n_jobs=1,
        )
        model_ml.fit(X, y)

        ml_columns = list(X.columns)

        MODEL_STATUS["disease_model"] = True
        MODEL_STATUS["feature_columns"] = True

        logger.warning(
            "Fallback Random Forest trained for development use."
        )

    except Exception as exc:
        logger.exception(
            "Fallback training failed: %s",
            exc,
        )


# ============================================================
# FAISS / RAG
# ============================================================

def load_rag() -> None:
    global faiss_index, answers

    if faiss is None:
        logger.warning("FAISS is not installed.")
        return

    if not os.path.exists(FAISS_PATH):
        logger.warning("FAISS index not found.")
        return

    if not os.path.exists(QA_CSV):
        logger.warning("Medical QA dataset not found.")
        return

    try:
        logger.info("Loading FAISS medical knowledge...")

        faiss_index = faiss.read_index(FAISS_PATH)

        qa_df = pd.read_csv(
            QA_CSV,
            usecols=["Answer"],
        )

        answers = (
            qa_df["Answer"]
            .fillna("")
            .astype(str)
            .tolist()
        )

        MODEL_STATUS["faiss"] = True
        MODEL_STATUS["medical_knowledge"] = True

        logger.info(
            "FAISS loaded: %d vectors / %d answers",
            faiss_index.ntotal,
            len(answers),
        )

        if faiss_index.ntotal != len(answers):
            logger.warning(
                "FAISS vector count (%d) differs from answer count (%d).",
                faiss_index.ntotal,
                len(answers),
            )

    except Exception as exc:
        logger.exception(
            "FAISS initialization failed: %s",
            exc,
        )


def get_embedding_model():
    global _embedding_model

    if SentenceTransformer is None:
        logger.warning(
            "sentence-transformers is unavailable."
        )
        return None

    if _embedding_model is None:
        logger.info(
            "Loading embedding model: %s",
            EMBEDDING_MODEL_NAME,
        )
        start = time.time()

        try:
            _embedding_model = SentenceTransformer(
                EMBEDDING_MODEL_NAME
            )
            MODEL_STATUS["embedding_model"] = True

            logger.info(
                "Embedding model loaded in %.2fs",
                time.time() - start,
            )

        except Exception as exc:
            logger.exception(
                "Embedding model failed: %s",
                exc,
            )
            return None

    return _embedding_model


def simplify_answer(
    text: str,
    max_sentences: int = 3,
) -> str:
    if not text:
        return ""

    # Normalize common broken whitespace from CSV text.
    text = re.sub(r"\s+", " ", str(text)).strip()

    sentences = [
        s.strip()
        for s in re.split(r"(?<=[.!?])\s+", text)
        if s.strip()
    ]

    return " ".join(
        sentences[:max_sentences]
    )


def search_medical_knowledge(
    query: str,
) -> Dict[str, Any]:
    """
    Retrieve medical knowledge only when similarity is strong enough.

    The previous implementation could inject weakly related records such as
    Q fever content into a generic fever/cough question. This version returns
    an empty result when the retrieval signal is weak.
    """
    if faiss_index is None or not answers:
        return {
            "text": "",
            "used": False,
            "matches": [],
        }

    model = get_embedding_model()

    if model is None:
        return {
            "text": "",
            "used": False,
            "matches": [],
        }

    try:
        vector = model.encode(
            [normalize_input(query)],
            normalize_embeddings=True,
        )

        vector = np.asarray(
            vector,
            dtype="float32",
        )

        distances, indices = faiss_index.search(
            vector,
            min(RAG_TOP_K, faiss_index.ntotal),
        )

        matches = []

        for similarity, index_id in zip(
            distances[0],
            indices[0],
        ):
            index_id = int(index_id)

            if index_id < 0 or index_id >= len(answers):
                continue

            similarity = float(similarity)

            if similarity < RAG_SIMILARITY_THRESHOLD:
                continue

            answer = simplify_answer(
                answers[index_id]
            )

            if not answer:
                continue

            matches.append({
                "similarity": round(similarity, 4),
                "text": answer,
            })

        if not matches:
            return {
                "text": "",
                "used": False,
                "matches": [],
            }

        # Deduplicate near-identical snippets.
        unique_text = []
        seen = set()

        for item in matches:
            key = item["text"].lower()
            if key not in seen:
                seen.add(key)
                unique_text.append(item["text"])

        return {
            "text": " ".join(unique_text),
            "used": True,
            "matches": matches,
        }

    except Exception as exc:
        logger.exception(
            "RAG search failed: %s",
            exc,
        )
        return {
            "text": "",
            "used": False,
            "matches": [],
        }


# ============================================================
# SAFETY ENGINE
# ============================================================

EMERGENCY_RULES = [
    "chest pain",
    "difficulty breathing",
    "severe breathing problem",
    "unconscious",
    "loss of consciousness",
    "heavy bleeding",
    "severe bleeding",
    "severe pain",
    "stroke",
    "seizure",
    "fainted",
    "cannot breathe",
    "blue lips",
]


def emergency_check(text: str) -> Dict[str, Any]:
    normalized = normalize_input(text)

    matched = [
        rule
        for rule in EMERGENCY_RULES
        if re.search(
            rf"(?<!\w){re.escape(rule)}(?!\w)",
            normalized,
        )
    ]

    if matched:
        return {
            "emergency": True,
            "severity": "HIGH",
            "matched_rules": matched,
            "message": (
                "Emergency warning detected. "
                "Seek immediate professional medical help."
            ),
        }

    return {
        "emergency": False,
        "severity": "NORMAL",
        "matched_rules": [],
        "message": "",
    }


# ============================================================
# RISK ENGINE
# ============================================================

def check_risk(
    user_input: str,
) -> Dict[str, Any]:
    if severity_df.empty:
        return {
            "risk_score": 0,
            "risk_level": "LOW",
            "high_risk_symptoms": [],
        }

    text = normalize_input(user_input)
    high_risk = []
    score = 0.0

    try:
        for _, row in severity_df.iterrows():
            symptom = _normalize_feature_name(
                row.get("Symptom", "")
            )

            if not symptom:
                continue

            try:
                weight = float(
                    row.get("weight", 0)
                )
            except (TypeError, ValueError):
                weight = 0.0

            if re.search(
                rf"(?<!\w){re.escape(symptom)}(?!\w)",
                text,
            ):
                if weight > 5:
                    high_risk.append(symptom)
                    score += weight

    except Exception as exc:
        logger.warning(
            "Risk calculation failed: %s",
            exc,
        )

    if score >= 15:
        level = "HIGH"
    elif score >= 7:
        level = "MODERATE"
    else:
        level = "LOW"

    return {
        "risk_score": round(score, 2),
        "risk_level": level,
        "high_risk_symptoms": sorted(set(high_risk)),
    }


# ============================================================
# RULE-BASED SYMPTOM ENGINE
# ============================================================

def _dataset_symptom_columns() -> List[str]:
    """
    Find symptom columns in dataset.csv without using disease labels,
    descriptions, or unrelated fields.
    """
    if symptoms_df.empty:
        return []

    disease_columns = {
        "disease",
        "prognosis",
        "diagnosis",
        "condition",
    }

    columns = []

    for col in symptoms_df.columns:
        if str(col).strip().lower() in disease_columns:
            continue
        columns.append(str(col))

    return columns


def predict_disease_rule(
    user_input: str,
) -> Optional[str]:
    """
    Conservative rule-based matcher.

    Unlike the old implementation, this does NOT search the entire row
    including disease names. It compares only symptom columns and chooses
    the disease with the strongest symptom overlap.
    """
    if symptoms_df.empty:
        return None

    normalized = normalize_input(user_input)
    active = set(
        _normalize_feature_name(x)
        for x in extract_active_features(normalized)
    )

    # If model columns are unavailable, fall back to symptom-severity names.
    if not active and not severity_df.empty:
        for value in severity_df.get("Symptom", []):
            symptom = _normalize_feature_name(value)
            if symptom and re.search(
                rf"(?<!\w){re.escape(symptom)}(?!\w)",
                normalized,
            ):
                active.add(symptom)

    if len(active) < MIN_RULE_SYMPTOMS:
        return None

    disease_col = None
    for candidate in ["Disease", "disease", "prognosis", "Prognosis"]:
        if candidate in symptoms_df.columns:
            disease_col = candidate
            break

    if disease_col is None:
        return None

    symptom_cols = _dataset_symptom_columns()

    best_disease = None
    best_score = 0.0
    best_matches = 0

    for _, row in symptoms_df.iterrows():
        row_symptoms = set()

        for col in symptom_cols:
            value = row.get(col)

            if pd.isna(value):
                continue

            feature = _normalize_feature_name(value)

            if not feature:
                feature = _normalize_feature_name(col)

            if feature:
                row_symptoms.add(feature)

        matches = len(active.intersection(row_symptoms))

        if matches == 0:
            continue

        # Reward overlap but penalize very broad rows.
        coverage = matches / max(len(active), 1)
        score = coverage + (0.05 * matches)

        if score > best_score:
            best_score = score
            best_matches = matches
            best_disease = row.get(disease_col)

    if best_matches >= MIN_RULE_SYMPTOMS and best_disease:
        return str(best_disease)

    return None


# ============================================================
# ML PREDICTION
# ============================================================

def predict_ml(
    user_input: str,
) -> Dict[str, Any]:
    if model_ml is None:
        return {
            "disease": "Unknown",
            "confidence": 0.0,
            "active_features": [],
            "top_predictions": [],
        }

    try:
        text = normalize_input(user_input)
        active_features = extract_active_features(text)

        logger.info("Input: %s", text)
        logger.info("Active symptoms: %s", active_features)
        logger.info(
            "Active feature count: %d",
            len(active_features),
        )

        input_vector = [
            1 if col in active_features else 0
            for col in ml_columns
        ]

        if sum(input_vector) == 0:
            return {
                "disease": "Unknown",
                "confidence": 0.0,
                "active_features": [],
                "top_predictions": [],
            }

        input_data = pd.DataFrame(
            [input_vector],
            columns=ml_columns,
        )

        probabilities = model_ml.predict_proba(
            input_data
        )[0]

        top_indices = np.argsort(
            probabilities
        )[::-1][:3]

        top_predictions = [
            {
                "disease": str(model_ml.classes_[idx]),
                "confidence": round(
                    float(probabilities[idx]),
                    4,
                ),
            }
            for idx in top_indices
        ]

        best = top_predictions[0]

        logger.info(
            "Top prediction: %s | score: %.3f",
            best["disease"],
            best["confidence"],
        )
        logger.info(
    "MODEL FEATURES: %s",
    ml_columns[:100]
)

        logger.info(
            "NORMALIZED INPUT: %s",
            text
        )

        logger.info(
            "ACTIVE FEATURES: %s",
            active_features
        )
        return {
            "disease": best["disease"],
            "confidence": best["confidence"],
            "active_features": active_features,
            "top_predictions": top_predictions,
        }

    except Exception as exc:
        logger.exception(
            "ML prediction failed: %s",
            exc,
        )
        return {
            "disease": "Unknown",
            "confidence": 0.0,
            "active_features": [],
            "top_predictions": [],
        }


# ============================================================
# MEDICAL KNOWLEDGE
# ============================================================

def get_description(disease: str) -> str:
    if desc_df.empty or not disease:
        return ""

    try:
        result = desc_df[
            desc_df["Disease"].astype(str).str.strip().str.lower()
            == str(disease).strip().lower()
        ]

        if not result.empty:
            return str(result["Description"].iloc[0])

    except Exception:
        pass

    return ""


def get_precautions(disease: str) -> List[str]:
    if prec_df.empty or not disease:
        return []

    try:
        result = prec_df[
            prec_df["Disease"].astype(str).str.strip().str.lower()
            == str(disease).strip().lower()
        ]

        if not result.empty:
            return [
                str(value).strip()
                for value in result.iloc[0, 1:].dropna().tolist()
                if str(value).strip()
            ]

    except Exception:
        pass

    return []


# ============================================================
# FOLLOW-UP QUESTIONS
# ============================================================

def generate_follow_up_questions(
    active_features: List[str],
) -> List[str]:
    """
    Generate targeted questions based on what the patient has already
    reported. These are clarification questions, not a diagnosis.
    """
    normalized = {
        _normalize_feature_name(x)
        for x in active_features
    }

    questions = []

    if "fever" in normalized:
        questions.append(
            "How long have you had the fever, and if measured, what is the temperature?"
        )

    if "cough" in normalized:
        questions.append(
            "Is the cough dry or producing mucus?"
        )

    if (
        "difficulty breathing" in normalized
        or "shortness of breath" in normalized
    ):
        questions.append(
            "Is your breathing getting worse or limiting normal activity?"
        )

    if "chest pain" in normalized:
        questions.append(
            "Is the chest pain severe, sudden, or associated with sweating or fainting?"
        )

    if "vomiting" in normalized:
        questions.append(
            "How many times have you vomited, and are you able to keep fluids down?"
        )

    if "diarrhea" in normalized:
        questions.append(
            "How long has the diarrhea lasted, and are there signs of dehydration?"
        )

    if not questions:
        questions.extend([
            "How long have you had these symptoms?",
            "Are the symptoms getting better, worse, or staying the same?",
            "Are you taking any medicines or do you have any known medical conditions?",
        ])

    return questions[:3]


# ============================================================
# RESPONSE FORMAT
# ============================================================

def format_output(text: str) -> str:
    if not text:
        return ""

    parts = [
        x.strip()
        for x in re.split(r"(?<=[.!?])\s+", text)
        if len(x.strip()) > 5
    ]

    return "\n".join(
        f"• {part}"
        for part in parts
    )


# ============================================================
# CLINICAL RESPONSE ENGINE
# ============================================================

def generate_response(
    user_input: str,
) -> Dict[str, Any]:

    clean_input = normalize_input(user_input)

    if not clean_input:
        return {
            "reply": "Please describe your symptoms or medical question.",
            "condition": None,
            "ml_prediction": "Unknown",
            "confidence": 0.0,
            "assessment_status": "needs_more_information",
            "active_features": [],
            "top_predictions": [],
            "follow_up_questions": [
                "What symptoms are you experiencing?",
                "How long have you had them?",
                "Are the symptoms getting better or worse?",
            ],
            "risk": {
                "risk_score": 0,
                "risk_level": "UNKNOWN",
                "high_risk_symptoms": [],
            },
            "emergency": {
                "emergency": False,
                "severity": "NORMAL",
                "matched_rules": [],
                "message": "",
            },
            "edge_ai": True,
            "rag_used": False,
        }

    # --------------------------------------------------------
    # SAFETY FIRST
    # --------------------------------------------------------

    emergency = emergency_check(clean_input)
    risk = check_risk(clean_input)

    # --------------------------------------------------------
    # EDGE ML
    # --------------------------------------------------------

    ml_result = predict_ml(clean_input)

    confidence = float(
        ml_result.get("confidence", 0.0)
    )

    if confidence >= HIGH_CONFIDENCE_THRESHOLD:
        assessment_status = "high_confidence"
    elif confidence >= MODERATE_CONFIDENCE_THRESHOLD:
        assessment_status = "moderate_confidence"
    else:
        assessment_status = "needs_more_information"

    # --------------------------------------------------------
    # RULE ENGINE
    # --------------------------------------------------------

    rule_prediction = predict_disease_rule(
        clean_input
    )

    # IMPORTANT:
    # Do not override a low-confidence ML result with a weak rule result.
    # A disease-specific condition is only exposed when the overall
    # assessment is sufficiently supported.
    condition = None

    if (
        assessment_status == "high_confidence"
        and ml_result["disease"] != "Unknown"
    ):
        condition = ml_result["disease"]

    elif (
        assessment_status == "moderate_confidence"
        and rule_prediction
    ):
        condition = rule_prediction

    elif (
        assessment_status == "moderate_confidence"
        and ml_result["disease"] != "Unknown"
    ):
        condition = ml_result["disease"]

    # --------------------------------------------------------
    # RAG
    # --------------------------------------------------------

    rag = search_medical_knowledge(
        clean_input
    )

    # Don't expose generic retrieved knowledge as if it confirms
    # a disease. RAG is supporting information only.
    rag_text = rag.get("text", "")
    rag_used = bool(rag.get("used", False))

    # --------------------------------------------------------
    # FOLLOW-UP
    # --------------------------------------------------------

    follow_up_questions = []

    if (
        assessment_status == "needs_more_information"
        or len(ml_result["active_features"]) < 2
    ):
        follow_up_questions = generate_follow_up_questions(
            ml_result["active_features"]
        )

    # --------------------------------------------------------
    # BUILD RESPONSE
    # --------------------------------------------------------

    response_parts = []

    if emergency["emergency"]:
        response_parts.append(
            "🚨 EMERGENCY WARNING\n"
            "Your reported symptoms contain a potential red flag. "
            "Please seek immediate professional medical help."
        )

    if condition:
        response_parts.append(
            f"🩺 Possible Condition: {condition}"
        )

        description = get_description(condition)

        if description:
            response_parts.append(
                "\nAbout:\n"
                + simplify_answer(description)
            )

        precautions = get_precautions(condition)

        if precautions:
            response_parts.append(
                "\nCare Advice:\n"
                + "\n".join(
                    f"• {p}"
                    for p in precautions
                )
            )

    else:
        response_parts.append(
            "ℹ️ More information is needed before "
            "AI Chikitsalya can provide a condition-specific assessment."
        )

    if risk["risk_level"] != "LOW":
        response_parts.append(
            f"\nRisk Level: {risk['risk_level']}"
        )

    if follow_up_questions:
        response_parts.append(
            "\nTo improve the assessment, please answer:"
            + "\n"
            + "\n".join(
                f"{i}. {question}"
                for i, question in enumerate(
                    follow_up_questions,
                    start=1,
                )
            )
        )

    if rag_used and rag_text:
        response_parts.append(
            "\nRelevant Medical Information:\n"
            + format_output(rag_text)
        )

    response_parts.append(
        "\nAI Assessment:\n"
        f"Status: {assessment_status}\n"
        f"Model score: {confidence * 100:.1f}%"
    )

    response_parts.append(
        "\n⚕️ AI Chikitsalya provides health information "
        "and decision support. It does not replace a "
        "qualified medical professional."
    )

    return {
        "reply": "\n".join(response_parts),

        "condition": condition,

        "ml_prediction": ml_result["disease"],

        "confidence": confidence,

        "assessment_status": assessment_status,

        "active_features": ml_result["active_features"],

        "top_predictions": ml_result["top_predictions"],

        "follow_up_questions": follow_up_questions,

        "risk": risk,

        "emergency": emergency,

        "edge_ai": True,

        "rag_used": rag_used,

        "rag_matches": rag.get("matches", []),
    }


# ============================================================
# PUBLIC API
# ============================================================

def ask(user_input: str) -> str:
    return generate_response(user_input)["reply"]


def analyze(user_input: str) -> Dict[str, Any]:
    return generate_response(user_input)


# ============================================================
# MODEL STATUS
# ============================================================

def get_model_status() -> Dict[str, Any]:
    status = dict(MODEL_STATUS)

    status.update({
        "embedding_model_name": EMBEDDING_MODEL_NAME,

        "rag_vectors": (
            int(faiss_index.ntotal)
            if faiss_index is not None
            else 0
        ),

        "medical_knowledge_records": len(answers),

        "ml_features": len(ml_columns),

        "architecture": "Hybrid Edge + Cloud",

        "thresholds": {
            "high_confidence": HIGH_CONFIDENCE_THRESHOLD,
            "moderate_confidence": MODERATE_CONFIDENCE_THRESHOLD,
            "rag_similarity": RAG_SIMILARITY_THRESHOLD,
        },

        "edge_components": [
            "Symptom Normalization",
            "Symptom Engine",
            "Risk Engine",
            "Emergency Detection",
            "Disease Classifier",
        ],

        "cloud_components": [
            "FAISS RAG",
            "MiniLM Embeddings",
            "LLM Integration Hook",
            "Medical Image Analysis Hook",
        ],
    })

    return status


# ============================================================
# INITIALIZATION
# ============================================================

def initialize() -> None:
    """Initialize the medical engine safely.

    IMPORTANT:
    This function is NOT called during module import.
    FastAPI controls initialization so Render can bind its port first.
    """
    global MODEL_STATUS

    if MODEL_STATUS.get("initialization_started"):
        logger.info("Medical engine initialization already started.")
        return

    MODEL_STATUS["initialization_started"] = True
    MODEL_STATUS["initialization_error"] = None

    logger.info("=" * 60)
    logger.info("🚀 Initializing AI CHIKITSALYA")
    logger.info("Hybrid Edge + Cloud Medical AI")
    logger.info("=" * 60)

    start = time.time()

    try:
        # --------------------------------------------------------
        # 1. DATASETS
        # --------------------------------------------------------
        logger.info("[1/4] Loading medical datasets...")
        load_data()
        MODEL_STATUS["datasets"] = True
        logger.info("✓ Medical datasets ready")

        # --------------------------------------------------------
        # 2. DISEASE MODEL
        # --------------------------------------------------------
        logger.info("[2/4] Loading disease prediction model...")
        load_disease_model()

        if MODEL_STATUS["disease_model"]:
            logger.info(
                "✓ Disease model ready | features=%d",
                len(ml_columns),
            )
        else:
            logger.warning("⚠ Disease model is unavailable")

        # --------------------------------------------------------
        # 3. FAISS
        # --------------------------------------------------------
        logger.info("[3/4] Loading FAISS medical knowledge...")
        load_rag()

        if MODEL_STATUS["faiss"]:
            logger.info(
                "✓ FAISS ready | vectors=%d",
                int(faiss_index.ntotal)
                if faiss_index is not None
                else 0,
            )
        else:
            logger.warning(
                "⚠ FAISS unavailable; ML prediction can continue"
                " without RAG"
            )

        # --------------------------------------------------------
        # 4. EMBEDDINGS
        # --------------------------------------------------------
        logger.info(
            "[4/4] MiniLM will load lazily on first RAG request: %s",
            EMBEDDING_MODEL_NAME,
        )

        MODEL_STATUS["initialization_complete"] = True

        elapsed = time.time() - start

        logger.info("=" * 60)
        logger.info("⚕️ AI CHIKITSALYA READY")
        logger.info("Initialization time: %.2fs", elapsed)
        logger.info("Model status: %s", MODEL_STATUS)
        logger.info("=" * 60)

    except Exception as exc:
        MODEL_STATUS["initialization_error"] = str(exc)
        MODEL_STATUS["initialization_complete"] = False

        logger.exception(
            "AI Chikitsalya initialization failed: %s",
            exc,
        )


def is_ready() -> bool:
    """Return True when the core medical engine is ready."""
    return bool(
        MODEL_STATUS.get("initialization_complete")
        and MODEL_STATUS.get("disease_model")
    )


def get_model_status() -> Dict[str, Any]:
    """Return detailed model/engine status for the FastAPI backend."""
    status = dict(MODEL_STATUS)

    status.update({
        "ready": is_ready(),

        "embedding_model_name": EMBEDDING_MODEL_NAME,

        "rag_vectors": (
            int(faiss_index.ntotal)
            if faiss_index is not None
            else 0
        ),

        "medical_knowledge_records": len(answers),

        "ml_features": len(ml_columns),

        "architecture": "Hybrid Edge + Cloud",

        "thresholds": {
            "high_confidence": HIGH_CONFIDENCE_THRESHOLD,
            "moderate_confidence": MODERATE_CONFIDENCE_THRESHOLD,
            "rag_similarity": RAG_SIMILARITY_THRESHOLD,
        },

        "edge_components": [
            "Symptom Normalization",
            "Symptom Engine",
            "Risk Engine",
            "Emergency Detection",
            "Disease Classifier",
        ],

        "cloud_components": [
            "FAISS RAG",
            "MiniLM Embeddings",
            "LLM Integration Hook",
            "Medical Image Analysis Hook",
        ],
    })

    return status


# IMPORTANT:
# There is intentionally NO initialize() call here.
#
# FastAPI should explicitly call:
#
#     medical_ai.initialize()
#
# from its startup/background initialization logic.
#
# This prevents importing medical_ai.py from blocking the HTTP
# server before Render can detect the assigned $PORT.