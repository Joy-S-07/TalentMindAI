def get_learning_path(role):

    paths = {
        "cloud engineer": [
            "Azure Fundamentals",
            "AZ-204",
            "AZ-305"
        ],
        "data engineer": [
            "SQL Basics",
            "DP-203",
            "Big Data Concepts"
        ]
    }

    return {
        "role": role,
        "path": paths.get(
            role.lower(),
            ["Python Basics", "AI Fundamentals"]
        )
    }