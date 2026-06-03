function rankCandidates() {

    fetch("/api/rank", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            job: document.getElementById("job").value
        })
    })

    .then(res => res.json())
    .then(data => {

        document.getElementById("result").innerHTML =
            JSON.stringify(data, null, 2);
    });
}


function getLearning() {

    fetch("/api/learning", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            role: document.getElementById("role").value
        })
    })

    .then(res => res.json())
    .then(data => {

        document.getElementById("result").innerHTML =
            JSON.stringify(data, null, 2);
    });
}


function checkAssessment() {

    fetch("/api/assessment", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            score: document.getElementById("score").value,
            hours: document.getElementById("hours").value
        })
    })

    .then(res => res.json())
    .then(data => {

        document.getElementById("result").innerHTML =
            JSON.stringify(data, null, 2);
    });
}