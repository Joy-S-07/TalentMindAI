function rankCandidates() {

    const job = document.getElementById("job").value;

    fetch("/api/rank", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            job: job
        })
    })

    .then(res => res.json())

    .then(data => {

        let output = "";

        data.forEach((candidate, index) => {

            output += `
            <div class="candidate-card">

                <h3>#${index + 1} ${candidate.name}</h3>

                <p class="score">
                    Match Score: ${candidate.score}%
                </p>

            </div>
            `;
        });

        document.getElementById("result").innerHTML = output;

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

function generateReport(){

const role =
document.getElementById(
"role"
).value;

fetch(
"/api/workforce",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({
role:role
})
}
)

.then(res=>res.json())

.then(data=>{

document.getElementById(
"result"
).innerHTML = `

<div class="candidate-card">

<h2>
Role:
${data.role}
</h2>

<h3>
Top Candidate:
${data.top_candidate.name}
</h3>

<p>
Match Score:
${data.top_candidate.score}%
</p>

<hr>

<h3>
Missing Skills
</h3>

<p>
${data.skill_gap.missing_skills}
</p>

<hr>

<h3>
Learning Path
</h3>

<p>
${data.learning_path.path}
</p>

<hr>

<h3>
Readiness
</h3>

<p>
${data.assessment.status}
</p>

</div>

`;

});

}