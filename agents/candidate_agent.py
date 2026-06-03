def rank_candidates(job, candidates):

    required = job.lower().split()

    results = []

    for c in candidates:

        match = 0

        for skill in c["skills"]:
            if skill.lower() in required:
                match += 1

        score = int((match / len(required)) * 100)

        results.append({
            "name": c["name"],
            "score": score
        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results