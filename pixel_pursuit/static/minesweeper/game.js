import { submitScore, unlockAchievement } from "/static/js/api.js";
import { showAchievement, burstConfetti } from "/static/js/achievement.js";

let firstClick = true;

let board = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let minesLocation = [];

let tilesClicked = 0;
let flagEnabled = false;

let gameOver = false;
let difficulty = 1;

let totalWins = 0;
let winStreak = 0;
let lossStreak = 0;

let time = 0;
let timerInterval = null;
let bestTime = null;

const boardDiv = document.getElementById("board");

// ==============================
// SETUP
// ==============================


function setMines(safeTileId) {
    let minesLeft = minesCount;

    while (minesLeft > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();
        
        if (id === safeTileId) continue;

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}


function startGame() {
    board = [];
    
    boardDiv.innerHTML = "";
    let width = boardDiv.offsetWidth;
    let size = width / columns;
    boardDiv.style.gridTemplateColumns = `repeat(${columns}, ${size}px)`;
    boardDiv.style.gridTemplateRows = `repeat(${rows}, ${size}px)`;

    setMineCount(minesCount);
    setWinCount(totalWins);
    setTime("00:00")
    setBest(bestTime === null ? "--:--" : formatTime(bestTime))
    
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            boardDiv.append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}


function restartGame() {
    clearInterval(timerInterval);

    firstClick = true;
    board = [];
    minesLocation = [];
    tilesClicked = 0;
    gameOver = false;
    time = 0;
    
    boardDiv.innerHTML = ""; 

    setTime('00:00')
    flagEnabled = true;
    setFlag()


    startGame();
}

// ==============================
// GAME LOGIC
// ==============================

function clickTile() {
    if (gameOver) return;

    let tile = this;

    if (flagEnabled) {
        const flagged = tile.dataset.flagged === "true";

        tile.dataset.flagged = (!flagged).toString();
        tile.innerText = flagged ? "" : "🚩";

        return;
    }

    if (firstClick) {
        setMines(tile.id);
        disableButtons(true);
        firstClick = false;
        startTimer();
    }

    if (tile.dataset.flagged !== "true") {
        if (minesLocation.includes(tile.id)) {
            handleGameEnd("loss");
        }
        
        let coords = tile.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        checkMine(r, c);
    }
}

function revealMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";
            }
        }
    }
}


function checkMine (r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    minesFound += checkTile(r-1, c-1);
    minesFound += checkTile(r-1, c);
    minesFound += checkTile(r-1, c+1);

    minesFound += checkTile(r, c-1);
    minesFound += checkTile(r, c+1);

    minesFound += checkTile(r+1, c-1);
    minesFound += checkTile(r+1, c);
    minesFound += checkTile(r+1, c+1);

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        board[r][c].innerText = "";

        checkMine(r-1, c-1);
        checkMine(r-1, c);
        checkMine(r-1, c+1);

        checkMine(r, c-1);
        checkMine(r, c+1);

        checkMine(r+1, c-1);
        checkMine(r+1, c);
        checkMine(r+1, c+1);
    }

    if (tilesClicked == rows * columns - minesCount) {
        gameOver = true;
        handleGameEnd("win");
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}

// ==============================
// ACHIEVEMENTS, SCORING & END GAME
// ==============================

function checkAchievements() {
    if (winStreak >= 1) {
        unlockAchievement(20).then(handleAchievementResponse); //api call
    }
    if (winStreak >= 1 && difficulty === 3) {
        unlockAchievement(19).then(handleAchievementResponse); //api call
    }
    if (winStreak >= 3) {
        unlockAchievement(16).then(handleAchievementResponse); //api call
    }
    if (lossStreak >= 3) {
        unlockAchievement(17).then(handleAchievementResponse); //api call
    }
    if (winStreak >= 1 && time <= 30) {
        unlockAchievement(18).then(handleAchievementResponse); //api call
    }
}

// Achievemet handling
function handleAchievementResponse(data) {
    if (data.status === "success") {
        burstConfetti(); // Show confetti
        showAchievement(data.name, data.description); // Show message
    }
}

function handleGameEnd(result) {
    disableButtons(false);
    gameOver = true;
    stopTimer();

    let resultTitle = '';
    let resultText = '';
    if (result === "win") {
        winStreak++;
        lossStreak = 0;
    
        totalWins++;
        setWinCount(totalWins);

        if (bestTime === null || time < bestTime) {
            bestTime = time;
            setBest(formatTime(bestTime));
        }
        resultTitle = '✅ Cleared ✅';
        resultText = `You have a win streak of <strong>${winStreak}</strong>!<br>
                            <strong>Best Time: ${formatTime(bestTime)}</strong>`;

    } else if (result === "loss") {
        revealMines();
        submitScore("Minesweeper", calculateScore()); //api call
        resultTitle = '💥 GAME OVER 💥';
        resultText = `You had a win streak of <strong>${winStreak}</strong>!<br>
                            <strong>Best Time: ${formatTime(bestTime)}</strong>`;
        lossStreak++;
        winStreak = 0;
    }
    checkAchievements();
    // Update modal text
    document.getElementById("result-title").innerHTML = resultTitle;
    document.getElementById("result-body").innerHTML = resultText;

    // Show modal
    const endModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('endGameModal')
    );
    endModal.show();

    document.getElementById("newGameBtn").onclick = () => {
        endModal.hide();
        restartGame();
    };

    return;
}

function calculateScore() {
    const timeFactor = 60 / (bestTime + 60);
    const streakFactor = 1 + winStreak * 0.12;
    const base = 80;
    
    return Math.round(base * difficulty * timeFactor * streakFactor);
}

// ==============================
// UPDATE UI
// ==============================

function setFlag() {
    if (flagEnabled) {
        flagEnabled = false;
        document.querySelectorAll(".flag-button").forEach((btn) => {
            btn.classList.add("light-pink")
            btn.classList.remove("dark-pink")
        })
    }
    else {
        flagEnabled = true;
        document.querySelectorAll(".flag-button").forEach((btn) => {
            btn.classList.add("dark-pink")
            btn.classList.remove("light-pink")
        })
    }
}
function setMineCount(time) {
    document.querySelectorAll(".mines-count").forEach((btn) => {
        btn.innerText = time;
    })
}

function setWinCount(count) {
    document.querySelectorAll(".win-count").forEach((btn) => {
        btn.innerText = count;
    })
}

function setBest(time) {
    document.querySelectorAll(".best-time").forEach((btn) => {
        btn.innerText = time;
    })
}

// ==============================
// TIMER FUNCTIONS
// ==============================

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        time++;

        let minutes = Math.floor(time / 60);
        let seconds = time % 60;

        let formatted =
            minutes.toString().padStart(2, "0") +
            ":" +
            seconds.toString().padStart(2, "0");
        setTime(formatted);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(t) {
    let minutes = Math.floor(t / 60);
    let seconds = t % 60;

    return (
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0") 
    );
}

function setTime(time) {
    document.querySelectorAll(".timer").forEach((btn) => {
        btn.innerText = time;
    })
}

// ==============================
// DIFFICULTY BUTTONS
// ==============================

function setDifficulty(level) {
    console.log(level)
    if (level === "easy") {
        difficulty = 1;
        rows = 8;
        columns = 8;
        minesCount = 10;
    }

    else if (level === "medium") {
        difficulty = 2;
        rows = 12;
        columns = 12;
        minesCount = 25;
    }

    else if (level === "hard") {
        difficulty = 3;
        rows = 16;
        columns = 16;
        minesCount = 40;
    }

    restartGame();
}

function disableButtons(disable) {
    document.querySelectorAll(".difficulty").forEach((btn) => {
        if (disable) {
            btn.setAttribute("disabled", "");
        } else {
            btn.removeAttribute("disabled");
        }
    })
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".difficulty").forEach((btn) => {
        btn.addEventListener("click", () => {
            console.log(!gameOver, !firstClick)
            if (!gameOver && !firstClick) return
            const mode = btn.dataset.difficulty
            setDifficulty(mode)
        })
    })
});


window.onload = function() {
    console.log(document.querySelector(".flag-button"))
    document.querySelectorAll(".flag-button").forEach((btn) => {
        btn.addEventListener("click", setFlag);
    })    
    document.querySelectorAll(".restart-button").forEach((btn) => {
        btn.addEventListener("click", restartGame);
    })
    startGame();
}
