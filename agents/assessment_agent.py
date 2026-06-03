def assess_readiness(score, hours):

    score = int(score)
    hours = int(hours)

    readiness = (score * 0.7) + (hours * 1.2)

    if readiness > 80:
        status = "Ready"
    elif readiness > 50:
        status = "Almost Ready"
    else:
        status = "Needs Improvement"

    return {
        "readiness_score": readiness,
        "status": status
    }