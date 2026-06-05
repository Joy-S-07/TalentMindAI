def analyze_skill_gap(role, candidate_skills):

    role_skills = {
        "cloud engineer": [
            "Azure",
            "Docker",
            "Kubernetes",
            "Python"
        ],

        "data engineer": [
            "SQL",
            "Python",
            "Azure Synapse",
            "Data Factory"
        ]
    }

    required = role_skills.get(
        role.lower(),
        []
    )

    missing = []

    for skill in required:

        if skill not in candidate_skills:
            missing.append(skill)

    return {
        "required_skills": required,
        "missing_skills": missing
    }