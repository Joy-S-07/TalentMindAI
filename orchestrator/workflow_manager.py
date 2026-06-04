from agents.candidate_agent import rank_candidates
from agents.learning_agent import get_learning_path
from agents.assessment_agent import assess_readiness
from agents.insights_agent import generate_insights
from agents.knowledge_agent import analyze_skill_gap


def generate_workforce_report(role, candidates):

    ranked = rank_candidates(role, candidates)

    if len(ranked) == 0:
        return {
            "error": "No candidates found"
        }

    top_candidate = ranked[0]

    skills = ["Python", "Azure"]

    gap = analyze_skill_gap(
        role,
        skills
    )

    learning = get_learning_path(role)

    assessment = assess_readiness(
        85,
        40
    )

    insights = generate_insights()

    return {
        "role": role,
        "top_candidate": top_candidate,
        "skill_gap": gap,
        "learning_path": learning,
        "assessment": assessment,
        "insights": insights
    }