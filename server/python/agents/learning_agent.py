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
            "Azure Synapse"
        ],

        "ai engineer": [
            "Python",
            "Machine Learning",
            "Azure AI Engineer Associate"
        ],

        "devops engineer": [
            "Git",
            "Docker",
            "AZ-400"
        ],

        "software engineer": [
            "Data Structures",
            "System Design",
            "Cloud Fundamentals"
        ],

        "cybersecurity engineer": [
            "Network Security",
            "Ethical Hacking",
            "SC-900"
        ]
    }

    return {
        "role": role,
        "path": paths.get(
            role.lower(),
            ["Python Basics", "AI Fundamentals"]
        )
    }