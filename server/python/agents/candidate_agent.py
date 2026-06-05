def rank_candidates(job, candidates):

    required = job.lower().split()

    results = []

    for c in candidates:

        score = 0

        for skill in c["skills"]:

            skill_lower = skill.lower()

            if skill_lower in required:
                score += 25

            if skill_lower == "python":
                score += 10

            if skill_lower == "azure":
                score += 10

        results.append({
            "name": c["name"],
            "score": score
        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results