from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Fired once per Flask request to avoid log flooding
_debug_logged = False

# Free-text fields to mine from a candidate dict when building the corpus
_CANDIDATE_TEXT_FIELDS = ("summary", "bio", "description", "about", "overview", "profile")


def _candidate_to_text(candidate: dict) -> str:
    """
    Build a single string representation of a candidate for TF-IDF.
    Concatenates: current_title + skills_set + any free-text fields.
    """
    parts: list[str] = []

    title = candidate.get("current_title") or ""
    if title:
        parts.append(title)

    skills = candidate.get("skills_set") or set()
    if skills:
        parts.append(" ".join(sorted(skills)))

    for field in _CANDIDATE_TEXT_FIELDS:
        value = candidate.get("_raw", {}).get(field) if "_raw" in candidate else candidate.get(field)
        if value and isinstance(value, str):
            parts.append(value)

    return " ".join(parts)


def build_tfidf_scorer(jd_profile: dict, all_candidates: list[dict]):
    """
    Pre-computes a TF-IDF matrix for the entire candidate pool.
    """
    global _debug_logged
    _debug_logged = False   # reset per request so first candidate always logs
    jd_text = jd_profile.get("raw_text") or " ".join(jd_profile.get("tokens", []))

    candidate_texts = [_candidate_to_text(c) for c in all_candidates]

    corpus = [jd_text] + candidate_texts

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)

    jd_vector = tfidf_matrix[0]           # shape (1, n_features)
    candidate_vectors = tfidf_matrix[1:]   # shape (n_candidates, n_features)

    # cosine_similarity returns shape (1, n_candidates); flatten to 1-D
    similarities: np.ndarray = cosine_similarity(jd_vector, candidate_vectors).flatten()

    return similarities


# ---------------------------------------------------------------------------
# ML domain synonym expansion — maps a JD requirement to equivalent
# candidate skill names that mean the same thing
# ---------------------------------------------------------------------------
_ML_SYNONYMS: dict[str, set[str]] = {
    "machine learning": {
        "pytorch", "tensorflow", "keras", "scikit-learn", "sklearn",
        "xgboost", "lightgbm", "catboost", "mlflow", "ml",
        "model training", "feature engineering", "jax",
    },
    "deep learning": {
        "pytorch", "tensorflow", "keras", "neural network", "cnn",
        "rnn", "lstm", "transformer", "bert", "gpt", "jax",
    },
    "nlp": {
        "transformers", "bert", "gpt", "spacy", "nltk", "hugging face",
        "text classification", "named entity recognition", "ner",
        "natural language processing", "llm", "langchain",
    },
    "computer vision": {
        "opencv", "image classification", "object detection",
        "yolo", "cnn", "image segmentation", "detectron",
    },
    "mlops": {
        "mlflow", "kubeflow", "airflow", "docker", "kubernetes",
        "model deployment", "model serving", "ci/cd", "bentoml",
        "triton", "ray serve", "wandb",
    },
    "data science": {
        "python", "pandas", "numpy", "scipy", "jupyter", "r",
        "statistical modeling", "a/b testing", "sql",
    },
    "generative ai": {
        "llm", "gpt", "openai", "anthropic", "langchain", "rag",
        "stable diffusion", "fine-tuning", "prompt engineering",
    },
}


def compute_semantic_score(candidate: dict, jd_profile: dict, tfidf_score: float) -> float:
    """
    Semantic relevance score in [0, 1].

    Component weights
    -----------------
    A) Title relevance          0.40  — strongest signal; uses exact-role bonuses
    B) Skill relevance F1       0.30  — with ML synonym expansion
    C) TF-IDF cosine similarity 0.15
    D) Experience fit           0.10
    E) Seniority match          0.05
    """
    cand_skills: set[str] = candidate.get("skills_set") or set()
    jd_required: set[str] = jd_profile.get("required_skills") or set()
    jd_tokens: set[str]   = set(jd_profile.get("tokens") or [])
    jd_raw: str           = (jd_profile.get("raw_text") or "").lower()

    # ── A) Title relevance (0.40) ─────────────────────────────────────────
    title = candidate.get("current_title", "").lower()
    title_words = title.replace("-", " ").split()

    # Exact role bonuses — ordered most-specific first
    if "senior machine learning" in title or "staff ml" in title or "principal ml" in title:
        title_score = 0.95
    elif "machine learning engineer" in title or ("ml" in title_words and "engineer" in title_words):
        title_score = 0.90
    elif "machine learning" in title:
        title_score = 0.85
    elif "ml engineer" in title or "ai engineer" in title:
        title_score = 0.80
    elif "deep learning" in title or "nlp engineer" in title:
        title_score = 0.70
    elif "data scientist" in title:
        title_score = 0.65
    elif "research engineer" in title or "research scientist" in title:
        title_score = 0.60
    elif "data engineer" in title:
        title_score = 0.35
    elif "software engineer" in title or "backend engineer" in title:
        title_score = 0.20
    else:
        # Fall back to token overlap against JD vocabulary
        overlap = len(set(title_words) & jd_tokens)
        title_score = min(overlap / max(len(title_words), 1), 0.30)

    # If the JD doesn't mention ML at all, cap the ML-title bonuses
    if title_score > 0.50 and "machine learning" not in jd_raw and "ml" not in jd_raw:
        title_score = min(title_score, 0.50)

    title_component = title_score * 0.40

    # ── B) Skill relevance F1 with synonym expansion (0.30) ───────────────
    # Expand required skills with domain synonyms
    expanded_required: set[str] = set(jd_required)
    for core_skill, synonyms in _ML_SYNONYMS.items():
        if core_skill in jd_required or core_skill in jd_raw:
            expanded_required.update(synonyms)

    # Also pull skill_assessment_scores keys as additional candidate signals
    raw_signals: dict = (candidate.get("_raw") or {}).get("redrob_signals") or {}
    sa_keys: set[str] = {
        k.lower().replace("_", " ")
        for k in (raw_signals.get("skill_assessment_scores") or {}).keys()
    }
    combined_cand: set[str] = cand_skills | sa_keys

    if expanded_required and combined_cand:
        ov        = len(combined_cand & expanded_required)
        precision = ov / len(combined_cand)
        recall    = ov / len(expanded_required)
        f1        = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    else:
        ov  = 0
        f1  = 0.0
    skill_component = f1 * 0.30

    # ── C) TF-IDF cosine similarity (0.15) ────────────────────────────────
    tfidf_component = float(np.clip(tfidf_score, 0.0, 1.0)) * 0.15

    # ── D) Experience fit (0.10) ──────────────────────────────────────────
    years     = candidate.get("years_experience") or 0
    min_years = jd_profile.get("min_years") or 3
    if years >= min_years:
        exp_score = min(1.0, years / max(min_years * 2, 8))
    else:
        exp_score = (years / max(min_years, 1)) * 0.7   # penalty for under-experienced
    exp_component = exp_score * 0.10

    # ── E) Seniority match (0.05) ─────────────────────────────────────────
    diff            = abs((candidate.get("seniority_level") or 2) - (jd_profile.get("seniority_level") or 3))
    seniority_score = max(0.0, 1.0 - diff * 0.25)
    sen_component   = seniority_score * 0.05

    total = title_component + skill_component + tfidf_component + exp_component + sen_component

    # ── Debug log for first candidate per request ─────────────────────────
    global _debug_logged
    if not _debug_logged:
        _debug_logged = True
        logger.debug(
            "SEMANTIC BREAKDOWN  "
            "title=%.3f×0.40=%.3f  "
            "skill_f1=%.3f×0.30=%.3f  "
            "tfidf=%.3f×0.15=%.3f  "
            "exp=%.3f×0.10=%.3f  "
            "seniority=%.3f×0.05=%.3f  "
            "→ total=%.4f  "
            "| cand_skills=%d  expanded_req=%d  overlap=%d  title=%r",
            title_score, title_component,
            f1, skill_component,
            float(np.clip(tfidf_score, 0.0, 1.0)), tfidf_component,
            exp_score, exp_component,
            seniority_score, sen_component,
            total,
            len(combined_cand), len(expanded_required), ov, title,
        )

    return round(float(np.clip(total, 0.0, 1.0)), 6)
