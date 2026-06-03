from flask import Flask, render_template, request, jsonify
import json
from agents.candidate_agent import rank_candidates
from agents.learning_agent import get_learning_path
from agents.assessment_agent import assess_readiness

app = Flask(__name__)

# Load data
def load_json(file):
    with open(file, "r") as f:
        return json.load(f)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/candidate")
def candidate():
    return render_template("candidate.html")

@app.route("/learning")
def learning():
    return render_template("learning.html")

@app.route("/assessment")
def assessment():
    return render_template("assessment.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


# API ROUTES

@app.route("/api/rank", methods=["POST"])
def rank():
    data = request.json
    job = data["job"]
    candidates = load_json("data/candidates.json")

    result = rank_candidates(job, candidates)
    return jsonify(result)


@app.route("/api/learning", methods=["POST"])
def learning_api():
    data = request.json
    role = data["role"]

    result = get_learning_path(role)
    return jsonify(result)


@app.route("/api/assessment", methods=["POST"])
def assessment_api():
    data = request.json

    result = assess_readiness(
        data["score"],
        data["hours"]
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)