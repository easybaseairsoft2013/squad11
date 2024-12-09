// Csapatok és tárgyak definiálása
const teams = [
    "alfa", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel",
    "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa"
];

const items = [
    { name: "Muníció / Ammo", code: "AMMO2024" },
    { name: "Élelmiszer / Food", code: "FOOD1945" },
    { name: "Elsősegély / Medic", code: "MEDIC123" },
    { name: "Fegyver / Weapon", code: "WEAPON9" },
    { name: "Rádió / Radio", code: "RADIO999" },
    { name: "Térkép / Map", code: "MAP456" },
    { name: "Távcső / Scope", code: "SCOPE1" },
    { name: "Lőszer / Bullet", code: "BULLET4" },
    { name: "Generátor / Generator", code: "GENPOWER" },
    { name: "Hálózati eszköz / Network Device", code: "NETCOM" }
];

// Pontszámok inicializálása és visszatöltése
let scores = JSON.parse(localStorage.getItem("scores")) || {};
teams.forEach(team => {
    if (!(team in scores)) {
        scores[team] = 0; // Ha nincs elmentve, kezdje nullával
    }
});

// Állapot mentése és visszatöltése
const saveState = () => {
    const state = [];
    document.querySelectorAll(".team").forEach(teamDiv => {
        const teamState = { id: teamDiv.id, items: [] };
        teamDiv.querySelectorAll(".item").forEach(itemDiv => {
            const input = itemDiv.querySelector("input");
            const statusSpan = itemDiv.querySelector(".status");
            const progressWidth = itemDiv.querySelector(".progress").style.width;

            teamState.items.push({
                itemCode: input.dataset.item,
                value: input.value,
                disabled: input.disabled,
                statusText: statusSpan.textContent,
                statusColor: statusSpan.style.color,
                progressWidth: progressWidth
            });
        });
        state.push(teamState);
    });
    localStorage.setItem("gameState", JSON.stringify(state));
    localStorage.setItem("scores", JSON.stringify(scores)); // Pontszámok mentése
};

const loadState = () => {
    const state = JSON.parse(localStorage.getItem("gameState"));
    if (state) {
        state.forEach(teamState => {
            const teamDiv = document.getElementById(teamState.id);
            if (teamDiv) {
                teamState.items.forEach((itemState, index) => {
                    const itemDiv = teamDiv.querySelectorAll(".item")[index];
                    if (itemDiv) {
                        const input = itemDiv.querySelector("input");
                        const statusSpan = itemDiv.querySelector(".status");
                        const progress = itemDiv.querySelector(".progress");

                        input.value = itemState.value;
                        input.disabled = itemState.disabled;
                        statusSpan.textContent = itemState.statusText;
                        statusSpan.style.color = itemState.statusColor;
                        progress.style.width = itemState.progressWidth;
                    }
                });
            }
        });
    }
};

// Csapatok és tárgyak megjelenítése
const teamContainer = document.getElementById("team-container");
teams.forEach(team => {
    const teamDiv = document.createElement("div");
    teamDiv.className = "team";
    teamDiv.id = team;

    const teamTitle = document.createElement("h2");
    teamTitle.textContent = team.charAt(0).toUpperCase() + team.slice(1);
    teamDiv.appendChild(teamTitle);

    const teamItems = document.createElement("div");
    teamItems.className = "team-items";

    items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";

        const itemLabel = document.createElement("span");
        itemLabel.textContent = `${item.name}:`;

        const itemInput = document.createElement("input");
        itemInput.type = "text";
        itemInput.setAttribute("data-item", item.code);

        const statusSpan = document.createElement("span");
        statusSpan.className = "status";

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        const progress = document.createElement("div");
        progress.className = "progress";
        progressBar.appendChild(progress);

        itemDiv.appendChild(itemLabel);
        itemDiv.appendChild(itemInput);
        itemDiv.appendChild(statusSpan);
        itemDiv.appendChild(progressBar);
        teamItems.appendChild(itemDiv);
    });

    teamDiv.appendChild(teamItems);
    teamContainer.appendChild(teamDiv);
});

// Pontszámok megjelenítése
const scoreList = document.getElementById("score-list");
const updateScores = () => {
    scoreList.innerHTML = "";
    for (const [team, score] of Object.entries(scores)) {
        const scoreItem = document.createElement("li");
        scoreItem.textContent = `${team.charAt(0).toUpperCase() + team.slice(1)}: ${score} pont / points`;
        scoreList.appendChild(scoreItem);
    }
};
updateScores();

// Nullázó gomb jelszóval
document.getElementById("reset-button").addEventListener("click", () => {
    const password = prompt("Add meg a jelszót a nullázáshoz: / Enter the password to reset:");
    const correctPassword = "airsoft123"; // Jelszó itt állítható be

    if (password === correctPassword) {
        if (confirm("Biztosan nullázod az összes adatot? / Are you sure you want to reset all data?")) {
            localStorage.clear(); // Töröljük az összes adatot
            location.reload(); // Újratöltjük az oldalt
        }
    } else {
        alert("Helytelen jelszó! / Incorrect password!");
    }
});

// Játéklogika
document.querySelectorAll(".item input").forEach(input => {
    input.addEventListener("change", function () {
        const correctCode = this.dataset.item;
        const statusSpan = this.nextElementSibling;
        const progressBar = this.nextElementSibling.nextElementSibling.querySelector(".progress");
        const teamId = this.closest(".team").id;

        if (this.value === correctCode) {
            statusSpan.textContent = "Ellenőrzés folyamatban... / Checking...";
            statusSpan.style.color = "orange";

            let progress = 0;
            const interval = setInterval(() => {
                progress += 1;
                progressBar.style.width = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                    statusSpan.textContent = "Tárgy kivonva! +1 pont / Item extracted! +1 point";
                    statusSpan.style.color = "green";
                    this.disabled = true;
                    this.parentElement.style.backgroundColor = "#d4edda";
                    scores[teamId] += 1;
                    updateScores();
                    saveState();
                }
            }, 600); // 60 másodperc alatt eléri a 100%-ot
        } else {
            statusSpan.textContent = "Hibás jelszó! / Incorrect code!";
            statusSpan.style.color = "red";
        }
    });
});

// Oldal betöltésekor az állapot visszatöltése
loadState();
