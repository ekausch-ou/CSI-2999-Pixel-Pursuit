import { Yahtzee } from "/static/yahtzee/yahtzee.js";
import { submitScore, unlockAchievement } from "/static/js/api.js";
import { showAchievement, burstConfetti } from "/static/js/achievement.js";

const diceContainer = document.getElementById("diceContainer");
const rollBtn = document.getElementById("rollBtn");
const rollsLeftSpan = document.getElementById("rollsLeft");
const scoreInputs = document.querySelectorAll(".score-input");
const containerRect = diceContainer.getBoundingClientRect();
const spacingX = (containerRect.width - 70) / (6);
const diceTray = document.getElementById("diceTray");

const CATEGORY_MAP = {
  ones: 0,
  twos: 1,
  threes: 2,
  fours: 3,
  fives: 4,
  sixes: 5,
  ok3: 6,
  ok4: 7,
  fh: 8,
  ss: 9,
  ls: 10,
  chance: 11,
  yahtzee: 12
};

const diceImages = [];
for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `/static/yahtzee/assets/dice_${i}.svg`;
    diceImages[i] = img;
}

const game = new Yahtzee();
let dice = [];
let rollsLeft = 3;
let isRolling = false;

// ==============================
// Dice Creation
// ==============================

for (let i = 0; i < 5; i++) {
    const die = {
        value: 1,
        held: false,
        el: document.createElement("div"),
        vx: (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10),
        vy: (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10),
        x: spacingX * (i + 1),
        y: containerRect.height / 2,
        angle: 0,
        spin: (Math.random() - 0.5) * 10
    };

    die.el.style.left = die.x + "px";
    die.el.style.top = die.y + "px";
    die.el.className = "die";

    // random starting position
    die.el.style.position = "absolute";
    die.el.style.left = Math.random() * 200 + "px";
    die.el.style.top = Math.random() * 100 + "px";
    die.el.style.display = "none";  // hide until first roll

    die.imgEl = document.createElement("img");
    die.imgEl.src = diceImages[1].src;
    die.imgEl.width = 70;
    die.imgEl.height = 70;
    die.el.appendChild(die.imgEl);
    
    die.el.addEventListener("click", () => {
        if (!isRolling && rollsLeft != 0) {
            die.held = !die.held;
            if (die.held) {
                // Move to tray
                diceTray.appendChild(die.el);
                die.el.style.position = "relative";  // Tray positioning
                die.el.style.left = "0px";
                die.el.style.top = "0px";
                die.el.style.marginBottom = "10px";  // Spacing in tray
            } else {
                // Move back to dice container
                diceContainer.appendChild(die.el);
                die.el.style.position = "absolute";  // Dice container positioning
                
                die.x = Math.random() * 200;
                die.y = Math.random() * 100;
                die.el.style.left = die.x + "px";
                die.el.style.top = die.y + "px";
            }
            die.el.classList.toggle("held", die.held);
        }
    });

    diceContainer.appendChild(die.el);
    dice.push(die);
}

// ==============================
// Dice Manipulation
// ==============================

function moveAllDiceToTray() {
    dice.forEach(d => {
        if (!d.held) {
            d.held = true;
            diceTray.appendChild(d.el);
            d.el.style.position = "relative";
            d.el.style.left = "0px";
            d.el.style.top = "0px";
            d.el.style.marginBottom = "10px";
            d.el.classList.add("held");
        }
    });
}

function updateDiceDisplay() {
    dice.forEach((d) => {
        d.imgEl.src = diceImages[d.value].src;
        d.el.classList.toggle("held", d.held);
    });
}

function handleDiceCollisions() {
    for (let i = 0; i < dice.length; i++) {
        for (let j = i + 1; j < dice.length; j++) {
            const d1 = dice[i];
            const d2 = dice[j];
            if (d1.held || d2.held) continue; // skip held dice

            const dx = d2.x - d1.x;
            const dy = d2.y - d1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = 70; // dice width/height

            if (distance < minDist) {
                // Flip direction on hit
                const angle = Math.atan2(dy, dx);
                const overlap = minDist - distance;

                // Move dice apart
                d1.x -= Math.cos(angle) * overlap / 2;
                d1.y -= Math.sin(angle) * overlap / 2;
                d2.x += Math.cos(angle) * overlap / 2;
                d2.y += Math.sin(angle) * overlap / 2;

                // Flip velocities along collision axis
                const vx1Old = d1.vx, vy1Old = d1.vy;
                d1.vx = -vx1Old * 0.9;
                d1.vy = -vy1Old * 0.9;
                const vx2Old = d2.vx, vy2Old = d2.vy;
                d2.vx = -vx2Old * 0.9;
                d2.vy = -vy2Old * 0.9;
            }
        }
    }
}

// Roll animation
let animationFrames = 60;
function rollDiceAnimation() {
    const rect = diceContainer.getBoundingClientRect();

    if (animationFrames > 0) {
        dice.forEach((d, i) => {
            if (!d.held) {
                if (animationFrames % 5 == 0) {
                    d.value = Math.floor(Math.random() * 6) + 1;
                    game.dice[i] = d.value;
                }

                // movement
                d.x += d.vx;
                d.y += d.vy;

                // bounce
                if (d.x <= 0 || d.x >= rect.width - 80) d.vx *= -1;
                if (d.y <= 0 || d.y >= rect.height - 80) d.vy *= -1;

                // physics (slowdown)
                d.vx *= 0.99;
                d.vy *= 0.99;

                handleDiceCollisions();

                // apply position
                d.el.style.left = d.x + "px";
                d.el.style.top = d.y + "px";

                // rotation
                d.angle += d.spin;
                d.el.style.transform = `rotate(${d.angle}deg)`;
            }
        });

        animationFrames--;
        updateDiceDisplay();
        requestAnimationFrame(rollDiceAnimation);
    } else {
        isRolling = false;

        // Sanp to 0 deg when done moving
        dice.forEach(d => d.el.style.transform = "rotate(0deg)");

        rollsLeft--;
        rollsLeftSpan.textContent = rollsLeft;
        
        // Move all dice to tray if no rolls left
        if (rollsLeft === 0) {
            moveAllDiceToTray();
        }

        updateScoreHints();         
    }
}


// ==============================
// Achievments, Scoring & End Game
// ==============================

function checkAchievements(category, score) {
    // High Roller (max possible in a turn: 50 for Yahtzee)
    if (score === 50) {
        unlockAchievement(1).then(handleAchievementResponse); //api call
    }

    // Full House Master
    if (category === "fh" && score === 25) {
        unlockAchievement(2).then(handleAchievementResponse); //api call
    }
    
    // Better Luck Next Time
    if (score === 0) {
        unlockAchievement(3).then(handleAchievementResponse); //api call
    }

    // First Yahtzee
    if (category === "yahtzee" && score === 50) {
        unlockAchievement(4).then(handleAchievementResponse); //api call
    }

    // Upper Section Hero: total upper score >= 63
    if (category === "bonus" && score >= 35) {
        unlockAchievement(5).then(handleAchievementResponse); //api call
    }
}

// Achievemet handling
function handleAchievementResponse(data) {
    if (data.status === "success") {
        burstConfetti(); // Show confetti
        showAchievement(data.name, data.description); // Show message
    }
}

function checkEndGame() {
    if (game.isGameEnd()) {
        const upperScore = game.getUpperScore();
        const lowerScore = game.getLowerScore();
        const bonus = upperScore >= 63 ? 35 : 0;
        const finalScore = upperScore + lowerScore + bonus;
        document.getElementById("finalScore").textContent = finalScore;
        submitScore("Yahtzee", finalScore); //api call
        // Show end game modal
        const modalEG = new bootstrap.Modal(document.getElementById('endGameModal'));
        modalEG.show();
    }
}

//Score selection handler
function updateScoreHints() {
    const possibleScores = game.getPossibleScores();
    // green clickable for remaining score fields
    scoreInputs.forEach(input => {
        const cat = input.dataset.category;
        if (possibleScores.hasOwnProperty(cat)) {
            input.value = possibleScores[cat];
            input.style.border = "2px solid green";
            input.style.cursor = "pointer"
        } else {
            input.style.border = "none";
            input.style.cursor = "default"
        }
    });

    const upperScore = game.getUpperScore();
    const lowerScore = game.getLowerScore();
    const bonus = upperScore >= 63 ? 35 : 0;

    // Update totals
    document.getElementById("upperTotal").textContent = upperScore;
    document.getElementById("lowerTotal").textContent = lowerScore;
    document.querySelector('input[data-category="bonus"]').value = bonus;
    document.getElementById("grandTotal").textContent = upperScore + lowerScore + bonus;
}

//Score input handlers
scoreInputs.forEach(input => {
    input.onclick = () => {
        const cat = input.dataset.category;
        if (!game.available[CATEGORY_MAP[cat]]) return; // already scored

        // Score the dice
        game.scoreDice(CATEGORY_MAP[cat]);

        // --- ACHIEVEMENTS ---
        const score = game.scores[CATEGORY_MAP[cat]]; // get actual scored points
        checkAchievements(cat, score);

        // Clear tray & reset dice
        diceTray.innerHTML = "";
        dice.forEach(d => {
            d.held = false;
            d.el.classList.remove("held");
            if (!diceContainer.contains(d.el)) {
                diceContainer.appendChild(d.el);
                d.el.style.position = "absolute";
                d.x = Math.random() * (diceContainer.offsetWidth - 70);
                d.y = Math.random() * (diceContainer.offsetHeight - 70);
                d.el.style.left = d.x + "px";
                d.el.style.top = d.y + "px";
            }
            d.el.style.display = "none";
        });

        // Reset rolls
        rollsLeft = 3;
        rollsLeftSpan.textContent = rollsLeft;

        updateDiceDisplay();
        updateScoreHints();
        checkEndGame();
    };
});

rollBtn.onclick = () => {
    if (rollsLeft > 0 && !isRolling) {
        // Show dice if hidden
        dice.forEach(d => d.el.style.display = "block");

        // reset velocity for all dice that are not held
        dice.forEach(d => {
            if (!d.held) {
                d.vx = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10);
                d.vy = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10);
                d.spin = (Math.random() - 0.5) * 10; // optional: reset spin too
            }
        });

        isRolling = true;
        animationFrames = 60;
        rollDiceAnimation();
    }
};

document.getElementById("newGameBtn").onclick = () => {
    // Reset game logic
    game.newGame();

    // Clear dice tray
    diceTray.innerHTML = "";

    // Reset dice
    dice.forEach(d => {
        d.held = false;
        d.el.classList.remove("held");
        if (!diceContainer.contains(d.el)) {
            diceContainer.appendChild(d.el);
            d.el.style.position = "absolute";
            d.x = Math.random() * (diceContainer.offsetWidth - 70);
            d.y = Math.random() * (diceContainer.offsetHeight - 70);
            d.el.style.left = d.x + "px";
            d.el.style.top = d.y + "px";
        }
        d.el.style.display = "none";
    });

    rollsLeft = 3;
    rollsLeftSpan.textContent = rollsLeft;

    updateDiceDisplay();
    updateScoreHints();

    // Hide modal
    const modalEl = bootstrap.Modal.getInstance(document.getElementById('endGameModal'));
    modalEl.hide();
};

// Initialize display
updateDiceDisplay();
