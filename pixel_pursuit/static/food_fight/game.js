import { submitScore, unlockAchievement } from "/static/js/api.js";
import { showAchievement, burstConfetti } from "/static/js/achievement.js";

// ==============================
// PLAYER & FIGHTER DATA
// ==============================

let fighters = []
let players = []
let currentOpponent = null
let currentPlayer = null
let usedOpponents = [];

// End game score modifiers
const ENEMY_POINTS = 100; 
const HEALTH_POINTS = 1; 
const ENERGY_POINTS = 1; 


const MAX_ENERGY = 100
const ENERGY_REGEN = 10
const PLAYER_HEALTH = 120
let player_health = PLAYER_HEALTH
let player_energy = MAX_ENERGY
let opp_health = 0
let enemies_defeated = 0

let isDefending = false
let nextAttackBoost = false

// ==============================
// FETCH FIGHTERS
// ==============================

fetch("/static/food_fight/fighters.json")
    .then(res => res.json())
    .then(data => {
        fighters = data.fighters
        // do not spawn yet
    })

// ==============================
// FETCH PLAYERS & SHOW SELECTION
// ==============================

fetch("/static/food_fight/players.json")
    .then(res => res.json())
    .then(data => {
        players = data.players
        showPlayerSelection()
    })

function showPlayerSelection() {
    const container = document.getElementById("playerCardsContainer")
    container.innerHTML = ""

    players.forEach(player => {
        const card = document.createElement("div")
        card.className = "card player-card p-2 text-center ms-2 me-2"
        card.innerHTML = `
        <div class="card-body p-1">
            <img src="${player.image}" alt="${player.name}" class="card-img-top" style="max-height: 300px;">
            <h5 class="card-title">${player.name}</h5>
            <p class="card-text">${player.nickname}</p>
        </div>     
        `
        card.addEventListener("click", () => selectPlayer(player))
        container.appendChild(card)
    })
}

function selectPlayer(player) {
    currentPlayer = {
        name: player.name,
        nickname: player.nickname,
        image: player.image,
        attacks: player.attacks,
        ability: player.ability,
        health: PLAYER_HEALTH
    }

    player_energy = MAX_ENERGY
    player_health = PLAYER_HEALTH
    
    updateEnergyDisplay()
    
    // Hide selection overlay
    document.getElementById("playerCardsWrapper").style.display = "none"

    // Show player and enemy
    document.querySelector(".fighter.player").classList.remove("hidden")
    document.querySelector(".fighter.enemy").classList.remove("hidden")

    // Update player sprite
    document.getElementById("playerSprite").src = currentPlayer.image
    document.getElementById("playerHP").style.width = "100%"

    updateLog(`You selected ${currentPlayer.name}!`)

    // Set attack buttons for this player
    const attackButtons = document.querySelectorAll(".attack")
    currentPlayer.attacks.forEach((atk, i) => {
        if (attackButtons[i]) {
            attackButtons[i].innerText = `${atk.name} - ${atk.cost}⚡`
            attackButtons[i].dataset.moveIndex = i
        }
    })
    
    const defendBtn = document.querySelector('.special')
    if (currentPlayer.ability) {
        defendBtn.innerText = `${currentPlayer.ability.name} - ${currentPlayer.ability.cost}⚡`
    } else {
        defendBtn.innerText = "Defend"
    }

    spawnOpponent()
    document.getElementById("battleLog").value ="Stand is open!\n" + "Points are calculated based on levels completed, remaining energy, and remaining health.";
}

// ==============================
// SPAWN RANDOM OPPONENT
// ==============================

function randomOpponent() {
    if (enemies_defeated > 4) {
        gameEnd();
        return;
    }

    let base;
    do { // no duplicates
        base = fighters[Math.floor(Math.random() * fighters.length)];
    } while (usedOpponents.includes(base.name));
    usedOpponents.push(base.name);

    const difficultyMultiplier = 1 + enemies_defeated * 0.3  // +30% stronger per defeated enemy
    
    player_energy = MAX_ENERGY
    player_health = PLAYER_HEALTH
    
    setTimeout(yourTurn, 500)

    return {
        name: base.name,
        nickname: base.nickname,
        image: base.image,
        attacks: base.attacks.map(atk => ({
            ...atk,
            damage: Math.floor(atk.damage * difficultyMultiplier) // apply modifier to increase dificulty as battles progress
        })),
        header: base.header,
        tagline: base.tagline,
        health: Math.floor(100 * difficultyMultiplier) // apply modifier to increase dificulty as battles progress
    }
}

function spawnOpponent() {
    currentOpponent = randomOpponent()
    opp_health = currentOpponent.health

    // Update UI
    document.getElementById("enemyName").innerText = currentOpponent.nickname
    document.getElementById("enemySprite").src = currentOpponent.image
    updateLog(currentOpponent.header)
    updateHealthBars()
}

// ==============================
// PLAYER ACTIONS
// ==============================

function playerAttack(moveIndex) {
    const attack = currentPlayer.attacks[moveIndex]
    let damage = attack.damage + Math.floor(Math.random() * 5)
    
    disableButtons(true)
    updateLog(`You used ${attack.name}! ${attack.flavor} (${damage} damage)`)

    if (player_energy < attack.cost) {
        updateLog("Not enough energy! ⚡")
        return
    }

    player_energy -= attack.cost

    if (nextAttackBoost) {
        damage = Math.floor(damage * 1.5)
        nextAttackBoost = false
    }

    opp_health -= damage
    
    if (opp_health <= 0) {
        enemies_defeated++
        updateLog(`You defeated ${currentOpponent.name}!`)
        document.getElementById("enemySprite").src = '/static/food_fight/assets/smoke.png'
        document.querySelector(".fighter.enemy").classList.add("fade-out")
        updateBattleTracker()  // update the stars
        setTimeout(spawnOpponent, 1500)
        return
    }

    updateEnergyDisplay()
    updateHealthBars()
    
    showTurnMessage(`${currentOpponent.name}'s Turn!`);
    setTimeout(enemyTurn, 2500)
}

function handleAbility() {
    if (!currentPlayer?.ability) return
    
    const ability = currentPlayer.ability

    if (player_energy < ability.cost) {
        updateLog("Not enough energy!")
        return
    }

    disableButtons(true)
    player_energy -= ability.cost
    updateEnergyDisplay()

    if (ability.type === "heal") {
        player_health = Math.min(player_health + ability.heal, PLAYER_HEALTH)
        updateLog(`You used ${ability.name}! Healed ${ability.heal}`)
    } 
    else if (ability.type === "defend") {
        isDefending = true
        updateLog(`You used ${ability.name}! Incoming damage reduced`)
    } 
    else if (ability.type === "evade") {
        isDefending = true
        nextAttackBoost = true
        updateLog(`You used ${ability.name}! Reduced damage & next attack boosted`)
    }

    showTurnMessage(`${currentOpponent.name}'s Turn!`);
    setTimeout(enemyTurn, 2500);
}

function handleRecharge() {
    player_energy = Math.min(player_energy + 30, MAX_ENERGY);
    updateEnergyDisplay();
    
    updateLog(`Recharged 30⚡!`);
    
    showTurnMessage(`${currentOpponent.name}'s Turn!`);
    setTimeout(enemyTurn, 2500);
}
function regenerateEnergy() {
    if (!currentPlayer) return;
    player_energy = Math.min(player_energy + ENERGY_REGEN, MAX_ENERGY);
    updateEnergyDisplay();
};

// ==============================
// ENEMY TURN
// ==============================

function enemyTurn() {
    if (!currentOpponent) return;
    updateHealthBars();

    const attack = currentOpponent.attacks[Math.floor(Math.random() * currentOpponent.attacks.length)];
    let damage = attack.damage + Math.floor(Math.random() * 5);
    damage = 11000
    // Turtle: Passive damage shield
    if (currentPlayer.passive?.type === "high_defense") {
        damage = Math.floor(damage * (1 - currentPlayer.passive.reduction))
    };
    
    // Tiger: Passive low defense
    if (currentPlayer.passive?.type === "low_defense") {
        damage = Math.floor(damage * 1.2);
    };


    // Check if player is defending
    if (isDefending) {
        damage = Math.floor(damage * 0.5); // reduce damage by 50%
        isDefending = false;          // reset defense after use
    };

    // Apply damage
    player_health -= damage
    if (player_health <= 0) {
        player_health = 0;
        document.querySelector(".fighter.player").classList.add("fade-out")
        updateLog(`${currentOpponent.name} hit you for ${damage} damage! You were defeated! Game Over.`);
        updateHealthBars();
        gameEnd();
        return;
    };

    updateLog(`${currentOpponent.name} hit you for ${damage} damage!`);
    updateHealthBars();

    yourTurn();
}

function yourTurn() {
    checkAchievements()
    regenerateEnergy()
    disableButtons(false)
    checkEnergy()
    showTurnMessage("Your Turn!")
}
// ==============================
// Update UI
// ==============================

function updateHealthBars() {
    const enemyBar = document.getElementById("enemyHP")
    const playerBar = document.getElementById("playerHP")

    if (currentOpponent) {
        enemyBar.style.width = `${Math.max(0, (opp_health / currentOpponent.health) * 100)}%`
    }
    if (currentPlayer) {
        playerBar.style.width = `${Math.max(0, (player_health / PLAYER_HEALTH) * 100)}%`
    }
}

function updateLog(text) {
    const battleLog = document.getElementById("battleLog")
    battleLog.value = text + "\n" + battleLog.value
    battleLog.scrollTop = 0 // keep view at the top
}

function updateEnergyDisplay() {
    const title = document.getElementById("actionsTitle")
    title.innerText = `Actions (${player_energy}⚡)`
}

function checkEnergy() {
    let minEnergy = 100;
    document.querySelector(".special").classList.remove("hidden")
    document.querySelector(".recharge").classList.add("hidden")
    
    for (let i = 0; i < currentPlayer.attacks.length; i++) {
        let attackEnergy = currentPlayer.attacks[i].cost;
        
        // Find the button for this attack
        let btn = document.querySelector(`.attack[data-move="${i+1}"]`);

        // Disable button if not enough energy\
        console.log(i)
        if (player_energy < attackEnergy) {
            if (btn) {
                btn.classList.add("disabled");
                document.querySelector(".special").classList.add("hidden")
                document.querySelector(".recharge").classList.remove("hidden")
            }
        } else {
            if (btn) {
                btn.classList.remove("disabled");
            }
        }
    }
}

function disableButtons(disable) {
    document.querySelectorAll(".move-btn").forEach((btn) => {
        if (disable) {
            btn.setAttribute("disabled", "");
        } else {
            btn.removeAttribute("disabled");
        }
    })
}

function updateBattleTracker() {
    for (let i = 1; i <= 5; i++) {
        const circle = document.getElementById(`circle-${i}`)
        if (i <= enemies_defeated) {
            circle.classList.add("circle-complete")
        } else {
            circle.classList.remove("circle-complete")
        }
        const circle_mobile = document.getElementById(`circle-mobile-${i}`)
        if (i <= enemies_defeated) {
            circle_mobile.classList.add("circle-complete")
        } else {
            circle_mobile.classList.remove("circle-complete")
        }
    }
}


// ==============================
// Achievments, Scoring & End Game
// ==============================

function checkAchievements() {
    // First Blood
    if (enemies_defeated === 1) {
        unlockAchievement(6) //api call
    }

    // First Loss
    if (enemies_defeated === 0 && player_health <= 0) {
        unlockAchievement(7).then(handleAchievementResponse); //api call
    }

    // Win as Shark
    if (currentPlayer.name === "Shark" && enemies_defeated > 4) {
        unlockAchievement(8).then(handleAchievementResponse); //api call
    }
    
    // Win as Tiger
    if (currentPlayer.name === "Tiger" && enemies_defeated > 4) {
        unlockAchievement(9).then(handleAchievementResponse); //api call
    }
    // Win as Turtle
    if (currentPlayer.name === "Turtle" && enemies_defeated > 4) {
        unlockAchievement(10).then(handleAchievementResponse); //api call
    }
}

// Achievemet handling
function handleAchievementResponse(data) {
    if (data.status === "success") {
        burstConfetti(); // Show confetti
        showAchievement(data.name, data.description); // Show message
    }
}

function showTurnMessage(message) {
    // Create a new toast element
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white border-0';
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';

    toast.innerHTML = `
        <div class="toast-body fs-2">
            ${message}
        </div>
    `;

    // Add toast to container
    const container = document.getElementById('turn-toast-container');
    container.appendChild(toast);

    // Initialize Bootstrap Toast
    const bsToast = new bootstrap.Toast(toast, { delay: 1000, autohide: true });
    bsToast.show();

    // Remove toast element after it hides
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function gameEnd() {
    // Calculate score
    const score = (enemies_defeated * ENEMY_POINTS) + (player_health * HEALTH_POINTS) + (player_energy * ENERGY_POINTS);
    submitScore("Food Fighter", score); //api call
    checkAchievements() 
    // Update modal text
    const resultText = `You defeated ${enemies_defeated} enemies!<br>
                        <strong>High Score: ${score}</strong>`;
    document.getElementById("battleResult").innerHTML = resultText;

    // Show modal
    const endModal = new bootstrap.Modal(document.getElementById('endGameModal'));
    endModal.show();

    document.getElementById("newBattleBtn").onclick = () => {
        endModal.hide();
        resetGame();
    };
}

function resetGame() {
    // Show selection overlay
    document.getElementById("playerCardsWrapper").style.display = "block"

    // Hide player and enemy
    document.querySelector(".fighter.player").classList.add("hidden")
    document.querySelector(".fighter.player").classList.remove("fade-out")
    document.querySelector(".fighter.enemy").classList.add("hidden")
    document.querySelector(".fighter.enemy").classList.remove("fade-out")

    showPlayerSelection()
    updateHealthBars()
    updateEnergyDisplay()
    
}
// ==============================
// BUTTON EVENTS
// ==============================

document.querySelectorAll(".attack").forEach((btn) => {
    btn.addEventListener("click", () => {
        if (!currentPlayer || !currentOpponent) return
        const attack = parseInt(btn.dataset.moveIndex)
        playerAttack(attack)
    })
})
document.querySelector(".special").addEventListener("click", () => {
    if (!currentPlayer || !currentOpponent) return
    handleAbility()
})
document.querySelector(".recharge").addEventListener("click", () => {
    if (!currentPlayer || !currentOpponent) return
    handleRecharge()
})
