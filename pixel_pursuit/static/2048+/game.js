
import { Board } from './board.js';
import { submitScore, unlockAchievement } from "/static/js/api.js";
import { burstConfetti } from "/static/js/achievement.js";

// Mobile Swipe Controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const swipeThreshold = 30; 

// Game Controls
let achievement512Unlocked = false;
let achievement1024Unlocked = false;
let achievement50MovesUnlocked = false;
let achievementThinIceUnlocked = false;
let achievementCornerUnlocked = false;
let highestCornerMoveStreak = 0;
let started = false;
let over = false;
let boardModel = new Board(5);
let undoHistory = [];
let deleteMode = false;
let swapMode = false;
let swapFirst = null;
let abilityCooldown = 0;
let moveCount = 0;
let actions = {
    undo: {
        uses: 3,
        ready: false
    },
    delete: {
        uses: 3,
        ready: true
    },
    swap: {
        uses: 3,
        ready: true
    },
    ball: {
        uses: 1,
        ready: false
    },
};

// Ball Variables
let ballEnabled = true;
let ball = null;
let ballX = 0;
let ballY = 0;
let ballDX = 4;
let ballDY = 3;
let trail = [];
let ballSize = 20;
const maxTrail = 25;
let ballLoopStarted = false;

// UI Elements
let achieveModalOpen = false;
let winModalOpen = false;
let winGame = false;
const boardDiv = document.getElementById("board");
const cardDiv = document.getElementById("board-card");
const achievementModal = new bootstrap.Modal(document.getElementById('achievementModal'));
const endGameModal = new bootstrap.Modal(document.getElementById('endGameModal'));
const winGameModal = new bootstrap.Modal(document.getElementById('winModal'));

// ==============================
// Display Screens
// ==============================

function drawRulesScreen() {
    let controlText = 'Use the <strong>arrow keys</strong>'
    let startText = 'Press SPACE'
    if (window.innerWidth <= 768) {
        controlText = '<strong>Swipe</strong>'
        startText = 'Click'
    }
    boardDiv.removeAttribute("style");
    boardDiv.innerHTML = `
        <div class="mb-0">
            <h1>2048+ Rules</h1>
        </div>
        <div class="mb-2">
            <p class="mb-0">${controlText} to slide the tiles.</p>
            <p class="mb-0">Tiles with the same number merge together.</p>
            <p class="mb-0">Each merge increases your score.</p>
        </div>
        <div class="mb-2">
            <p class="mb-0"><strong>Reach 2048 to win!</strong></p>
        </div>
        <div class="mb-2">
            <p class="mb-1">A green ball will randomly cover tiles.</p>
            <p class="mb-0">Undo/Delete/Swap each have <strong>3</strong> uses.</p>
            <p class="mb-0">Only one special move every <strong>10</strong> moves.</p>
            <p class="mb-1">Remove Ball <strong>unlocks</strong> at 1024.</p>
        </div>
        <div>
            <h3 class="mb-0">${startText} to Continue</h3>
        </div>
    `;
}

function drawAchieveScreen(msg) {
    let contText = 'Press SPACE'
    if (window.innerWidth <= 768) {
        contText = 'Click'
    }
    document.getElementById('achievementContinue').innerHTML = contText + ' to go back to the game.';
    document.getElementById('achievementMsg').innerHTML = msg;
  
    achievementModal.show();
    achieveModalOpen = true;
}

function drawWinScreen(msg) {
    let contText = 'Press SPACE'
    if (window.innerWidth <= 768) {
        contText = 'Click'
    }
    document.getElementById('winContinue').innerHTML = contText + ' to go back to the game.';
  
    winGameModal.show();
    winModalOpen = true;
}


// ==============================
// Game Logic
// ==============================

function gameStart() {
    if (started) return;
    started = true;

    boardModel.spawn();
    boardModel.spawn();
    
    console.log("Game started!");
    boardDiv.innerHTML = "";
    boardDiv.classList.remove("title");
    boardDiv.classList.add("game");
    cardDiv.classList.remove("card-title");
    cardDiv.classList.add("card-game");
    
    const ballLayer = document.createElement("div");
    ballLayer.id = "ball-layer";
    boardDiv.appendChild(ballLayer);

    let board = [];
    let size = boardDiv.offsetWidth / 5;
    boardDiv.style.gridTemplateColumns = `repeat(5, ${size}px)`;
    boardDiv.style.gridTemplateRows = `repeat(5, ${size}px)`;

    for (let r = 0; r < 5; r++) {
        let row = [];
        for (let c = 0; c < 5; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile")
            tile.addEventListener("click", () => {
                handleTileClick(r, c); // for delete & swap
            });
            boardDiv.append(tile);
            row.push(tile);
        }
        board.push(row);
    }
    renderBoard();
    ballSize = size * 1.15;
    initBall();
}

function restartGame() {
    started = false;
    over = false;

    boardModel = new Board(5);
    undoHistory = [];

    deleteMode = false;
    swapMode = false;
    swapFirst = null;

    abilityCooldown = 0;
    moveCount = 0;

    actions = {
        undo: { uses: 3, ready: false },
        delete: { uses: 3, ready: true },
        swap: { uses: 3, ready: true },
        ball: { uses: 1, ready: false },
    };
    

    // Reset Style
    boardDiv.classList.remove("game");
    boardDiv.classList.add("title");
    cardDiv.classList.remove("card-game");
    cardDiv.classList.add("card-title");
    drawRulesScreen();
}

function renderBoard() {
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            let tileDiv = document.getElementById(`${r}-${c}`);
            let value = boardModel.board[r][c].getValue();

            tileDiv.textContent = value === 0 ? "" : value;
            tileDiv.className = "tile";

            if (value > 0) {
                tileDiv.classList.add("tile-" + Math.min(value, 4096));
            }
        }
    }
}

function updateActions() {
    for (const key in actions) {
        let { uses, ready } = actions[key];
        if (abilityCooldown > 0) {
            document.querySelectorAll(`.${key}-ready`).forEach((el) => {
                el.innerText = `CD-${abilityCooldown}`;
            });
        } else {
            document.querySelectorAll(`.${key}-ready`).forEach((el) => {
                el.innerText = ready ? 'READY' : 'LOCKED';
            });
        }
        document.querySelectorAll(`.${key}-use`).forEach((el) => {
            el.innerText = uses;
        });

    }
}

function updateScores() {
    document.querySelectorAll(".score").forEach((btn) => {
        let score = boardModel.getScore();
        if (btn.dataset.score != score) {
            submitScore('2048+', score)
            btn.innerText = score;
            btn.dataset.score = score;
            btn.classList.remove("score-animate");
            void btn.offsetWidth;
            btn.classList.add("score-animate");
        }
    })

}

function updateMoves() {
    document.querySelectorAll(".moves").forEach((btn) => {
        if (btn.dataset.moves != moveCount) {
            btn.innerText = moveCount;
            btn.dataset.moves = moveCount;
            btn.classList.remove("score-animate");
            void btn.offsetWidth;
            btn.classList.add("score-animate");
        }
    })
}

function updateCooldown() {
    document.querySelectorAll(".cooldown").forEach((btn) => {
        if (btn.dataset.cool != abilityCooldown) {
            btn.innerText = abilityCooldown;
            btn.dataset.cool = abilityCooldown;
            btn.classList.remove("score-animate");
            void btn.offsetWidth;
            btn.classList.add("score-animate");
        }
    })
}

function updateHighest() {
    document.querySelectorAll(".highest").forEach((btn) => {
        let high = getLargestTile();
        if (btn.dataset.high != high) {
            btn.innerText = high;
            btn.dataset.high = high;
            btn.classList.remove("score-animate");
            void btn.offsetWidth;
            btn.classList.add("score-animate");
        }
    })

}

function getLargestTile() {
    let max = 0;

    for (let r = 0; r < boardModel.grids; r++) {
        for (let c = 0; c < boardModel.grids; c++) {
            const value = boardModel.board[r][c].getValue();
            if (value > max) {
                max = value;
            }
        }
    }
    if (max >= 512) {
        actions.ball.ready = true;
        updateActions();
    }
    if (max >= 2048 && !winGame) {
        winGame = true;
        document.getElementById("background").classList.add("rainbow");
        drawWinScreen();
        burstConfetti();
    }
    return max;
}

function highestTileInCorner() {
    const corners = [
        boardModel.board[0][0].getValue(),
        boardModel.board[0][4].getValue(),
        boardModel.board[4][0].getValue(),
        boardModel.board[4][4].getValue()
    ];

    const max = getLargestTile();
    return corners.includes(max);
}

// ==============================
// Ball Functions
// ==============================

function toggleBall() {
    ballEnabled = !ballEnabled;

    const layer = document.getElementById("ball-layer");
    if (!layer) return;

    layer.style.display = ballEnabled ? "block" : "none";

    if (ballEnabled && !ball) {
        initBall();
    }
}

function initBall() {
    const layer = document.getElementById("ball-layer");

    ball = document.createElement("div");
    ball.className = "ball";

    ball.style.width = ballSize + "px";
    ball.style.height = ballSize + "px";

    layer.appendChild(ball);

    const size = boardDiv.offsetWidth;

    ballX = Math.random() * (size - ballSize);
    ballY = Math.random() * (size - ballSize);

    if (!ballLoopStarted) {
        ballLoopStarted = true;
        requestAnimationFrame(updateBall);
    }
}

function updateBall() {
    if (ballEnabled) {
        const layer = document.getElementById("ball-layer");
        if (layer) {
            const boardSize = boardDiv.offsetWidth;
            const max = boardSize - ballSize;

            createTrail(layer, ballX, ballY);

            ballX += ballDX;
            ballY += ballDY;

            // bounce X
            if (ballX <= 0) {
                ballX = 0;
                ballDX *= -1;
            } else if (ballX >= max) {
                ballX = max;
                ballDX *= -1;
            }

            // bounce Y
            if (ballY <= 0) {
                ballY = 0;
                ballDY *= -1;
            } else if (ballY >= max) {
                ballY = max;
                ballDY *= -1;
            }

            ball.style.left = ballX + "px";
            ball.style.top = ballY + "px";

            trail.forEach((el, i) => {
                const scale = Math.sqrt((i + 1) / trail.length);
                el.style.transform = `scale(${scale})`;
                el.style.opacity = scale;
            });
        }
    }

    requestAnimationFrame(updateBall);
}

function createTrail(layer, x, y) {
    const t = document.createElement("div");
    t.className = "trail";

    t.style.width = ballSize + "px";
    t.style.height = ballSize + "px";

    t.style.left = x + "px";
    t.style.top = y + "px";
    layer.appendChild(t);

    trail.push(t);

    if (trail.length > maxTrail) {
        const old = trail.shift();
        old.remove();
    }
}

// ==============================
// Action Handling
// ==============================

function handleAction(action) {
    if (abilityCooldown === 0) {
        if (action === "undo" && actions.undo.uses > 0) {
            actions.undo.uses--;
            if (undoHistory.length === 0) return;
            const snapshot = undoHistory.shift();
            restoreSnapshot(snapshot);
            abilityCooldown = 10;
        }
        if (action === "delete" && actions.delete.uses > 0) {
            deleteMode = true;            
            swapMode = false;
            selectAction(action, true);
        }
        if (action === "swap" && actions.swap.uses > 0) {
            swapMode = true;
            deleteMode = false;
            selectAction(action, true);
        }
        if (action === "ball" && actions.ball.uses > 0 && actions.ball.ready) {
            actions.ball.uses--;
            toggleBall();
        }
        updateCooldown();
        updateActions();
        updateScores();
        updateHighest();
        updateMoves();
    }
}

function selectAction(action, set) {
    document.querySelectorAll(".action").forEach((btn) => {
        if (btn.dataset.action === action && set) {
            btn.classList.add("action-selected");
        } else {
            btn.classList.remove("action-selected");
        }
    })
}

function handleTileClick(r, c) {
    // Delete Tile Action
    if (deleteMode) {
        const value = boardModel.board[r][c].getValue();
        if (value === 0) return; // nothing to delete
    
        // Save snapshot for undo
        const snapshot = createSnapshot();
        undoHistory.unshift(snapshot);
        if (undoHistory.length > 3) undoHistory.pop();

        // Delete tile
        boardModel.board[r][c].setValue(0);
        abilityCooldown = 10;
        actions.delete.uses--;
        selectAction('delete', false);
    }
 
    // Swap Tile Action
    if (swapMode) {
        if (!swapFirst) {
            swapFirst = { r, c };
            document.getElementById(`${r}-${c}`).classList.add("tile-selected");
            return;
        }

        const r1 = swapFirst.r;
        const c1 = swapFirst.c;

        const r2 = r;
        const c2 = c;

        if (r1 === r2 && c1 === c2) {
            swapFirst = null;
            return;
        }

        // swap values
        const temp = boardModel.board[r1][c1].getValue();
        boardModel.board[r1][c1].setValue(boardModel.board[r][c].getValue());
        boardModel.board[r][c].setValue(temp);

        swapFirst = null;
        swapMode = false;
        abilityCooldown = 10;
        actions.swap.uses--;
        selectAction('swap', false);
    }
    renderBoard();
    updateActions();
    updateCooldown();
}

// History for Undo Action
function createSnapshot() {
    return {
        boardValues: boardModel.copyBoardValues(),
        score: boardModel.getScore ? boardModel.getScore() : 0,
        moveCount: moveCount,

        trail: trail.map(t => ({
            x: parseFloat(t.style.left),
            y: parseFloat(t.style.top)
        }))
    };
}

function restoreSnapshot(snapshot) {
    // Restore board
    for (let r = 0; r < boardModel.grids; r++) {
        for (let c = 0; c < boardModel.grids; c++) {
            boardModel.board[r][c].setValue(
                snapshot.boardValues[r][c]
            );
        }
    }

    // Restore game state
    moveCount = snapshot.moveCount;
    boardModel.setScore(snapshot.score);

    // Clear old trail
    const layer = document.getElementById("ball-layer");
    trail.forEach(t => t.remove());
    trail = [];

    // Recreate trail
    snapshot.trail.forEach(p => {
        createTrail(layer, p.x, p.y);
    });

    renderBoard();
}

function checkAchievements() {
    const highTile = getLargestTile();

    // 512 tile
    if (highTile >= 512 && !achievement512Unlocked) {
        achievement512Unlocked = true;
        unlockAchievement(21).then(handleAchievementResponse);
    }

    // 1024 tile
    if (highTile >= 1024 && !achievement1024Unlocked) {
        achievement1024Unlocked = true;
        unlockAchievement(22).then(handleAchievementResponse);
    }

    // 50 moves
    if (moveCount >= 50 && !achievement50MovesUnlocked) {
        achievement50MovesUnlocked = true;
        unlockAchievement(23).then(handleAchievementResponse);
    }

    // Thin Ice (your blackOut condition)
    if (boardModel.blackOut?.() && !boardModel.gameOver?.() && !achievementThinIceUnlocked) {
        achievementThinIceUnlocked = true;
        unlockAchievement(24).then(handleAchievementResponse);
    }

    // Corner streak
    if (highestTileInCorner()) {
        highestCornerMoveStreak++;
    } else {
        highestCornerMoveStreak = 0;
    }

    if (highestCornerMoveStreak >= 10 && !achievementCornerUnlocked) {
        achievementCornerUnlocked = true;
        unlockAchievement(25).then(handleAchievementResponse);
    }
}

// Achievemet handling
function handleAchievementResponse(data) {
    if (data.status === "success") {
        burstConfetti(); // Show confetti
        drawAchieveScreen(data.name); // Show message
    }
}

function triggerGameOver() {
    console.log("Game over!");
    if (over) return;
    over = true;

    let resultTitle = "Game Over";
    let resultText = `Final Score: ${boardModel.getScore()}<br>Moves: ${moveCount}`;

    document.getElementById("result-title").innerHTML = resultTitle;
    document.getElementById("result-body").innerHTML = resultText;

    endGameModal.show();

    document.getElementById("newGameBtn").onclick = () => {
        endGameModal.hide();
        restartGame();
    };
}

function afterMove(result) {
    updateScores();
    updateMoves();
    updateActions();
    updateHighest();
    checkAchievements();

    if (boardModel.gameOver()) {
        triggerGameOver();
    }
}

// ==============================
// Input Handling
// ==============================

function handleTouchStart(e) {
    if (!started) {
        gameStart();
        return;
    }
    if (achieveModalOpen) {
        achievementModal.hide();
    }
    if (winModalOpen) {
        winGameModal.hide();
    }

    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
}

function handleTouchEnd(e) {
    if (!started) return;

    const t = e.changedTouches[0];
    touchEndX = t.clientX;
    touchEndY = t.clientY;

    handleSwipe();
}

function handleSwipe() {
    if (over) return;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) < swipeThreshold && Math.abs(dy) < swipeThreshold) {
        return; // too small
    }

    let snapshot = createSnapshot();
    let oldBoard = boardModel.copyBoard();

    let result = null;

    if (Math.abs(dx) > Math.abs(dy)) {
        // horizontal
        if (dx > 0) {
            result = boardModel.right();
        } else {
            result = boardModel.left();
        }
    } else {
        // vertical
        if (dy > 0) {
            result = boardModel.down();
        } else {
            result = boardModel.up();
        }
    }

    if (boardModel.boardChanged(oldBoard)) {
        actions.undo.ready = true;
        undoHistory.unshift(snapshot);
        while (undoHistory.length > 3) undoHistory.pop();
        moveCount++;
    }

    if (result?.moved) {
        if (abilityCooldown > 0) {
            abilityCooldown--;
        }

        const spawnResult = boardModel.spawn();
        result.highlights.push(...spawnResult.highlights);

        result.highlights.forEach(({ to }) => {
            const [r, c] = to;
            const tileDiv = document.getElementById(`${r}-${c}`);
            tileDiv.classList.remove("tile-pop");
            void tileDiv.offsetWidth;
            tileDiv.classList.add("tile-pop");
        });
        
    }
    afterMove(result);
}

const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
document.addEventListener("keydown", function (e) {
    // prevent scrolling during game
    if (started && arrowKeys.includes(e.key)) {
        e.preventDefault();
    }
    // pre-game key
    if (e.code === "Space" && !started) {
        e.preventDefault(); 
        gameStart();
    }
    if (e.code === "Space" && achieveModalOpen) {
        achievementModal.hide();
    }
    if (e.code === "Space" && winModalOpen) {
        winGameModal.hide();
    }
    if (e.key === "Escape" && (deleteMode || swapMode)) {
        deleteMode = false;
        swapMode = false;
        renderBoard();
    }
    if (!started) return;
    if (over) return;
    let oldBoard = boardModel.copyBoard()
    let snapshot = createSnapshot();
    let result = false;
    switch (e.key) {
        case "ArrowUp":
            result = boardModel.up();
            break;
        case "ArrowDown":
            result = boardModel.down();
            break;
        case "ArrowLeft":
            result = boardModel.left();
            break;
        case "ArrowRight":
            result = boardModel.right();
            break;
    }

    if (boardModel.boardChanged(oldBoard)) {
        actions.undo.ready = true;
        undoHistory.unshift(snapshot);
        while (undoHistory.length > 3) {
            undoHistory.pop();
        }
        moveCount++;
    }

    if (result?.moved) {
        if (abilityCooldown > 0) {
            abilityCooldown--;
            updateCooldown();
        }

        const spawnResult = boardModel.spawn();
        result.highlights.push(...spawnResult.highlights);

        renderBoard();

        result.highlights.forEach(({ to }) => {
            const [r, c] = to;
            const tileDiv = document.getElementById(`${r}-${c}`);
            tileDiv.classList.remove("tile-pop");
            void tileDiv.offsetWidth;
            tileDiv.classList.add("tile-pop");
        });

    }
    afterMove(result);
});

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".action").forEach((btn) => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action
            handleAction(action)
        })
    })
});


boardDiv.addEventListener("click", gameStart);
document.addEventListener("touchstart", handleTouchStart, { passive: true });
document.addEventListener("touchend", handleTouchEnd, { passive: true });

document.addEventListener("touchmove", (e) => {
    if (started) e.preventDefault();
}, { passive: false });

drawRulesScreen()
