import { submitScore, unlockAchievement } from "/static/js/api.js";
import { showAchievement, burstConfetti } from "/static/js/achievement.js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const chickenImg = new Image();
chickenImg.src = "/static/plucking_chicken/assets/chicken.gif";

const handImg = new Image();
handImg.src = "/static/plucking_chicken/assets/hand.png";

const fullHeartImg = new Image();
fullHeartImg.src = "/static/plucking_chicken/assets/heart_full.png";

const emptyHeartImg = new Image();
emptyHeartImg.src = "/static/plucking_chicken/assets/heart_empty.png";

const backgroundImg = new Image();
backgroundImg.src = "/static/plucking_chicken/assets/background.png";

// Load audio
const combo_audio = new Audio("/static/plucking_chicken/assets/combo.ogg");
combo_audio.volume = 0.3;
combo_audio.loop = true;

const start_audio = new Audio("/static/plucking_chicken/assets/start.ogg");
start_audio.volume = 0.3;
start_audio.loop = true;

const wrong_audio = new Audio("/static/plucking_chicken/assets/wrong.ogg");
wrong_audio.volume = 0.3;

const correct_audio = new Audio("/static/plucking_chicken/assets/correct.ogg");
correct_audio.volume = 0.3;

// Game variables
let gameStarted = false;
let score = 0;
let mistakes = 0;
let combo = 0;
let combo_mult = 0;
let first_correct = false;

let chickenX = 400;
let chickenY = 250;
let chickenDirection = "right";

let handX = GAME_WIDTH - 100;
let handY = 50;
let handActive = false;
let handTimer = 0;
let handTarget = {x: 0, y: 0};

// Buttons (x: 0, y:0) dynamic placement based on screen size
const startButton = {x: 0, y: 0, width: 200, height: 60};
const leftButton = {x: 0, y: 0, width: 120, height: 50};
const rightButton = {x: 0, y: 0, width: 120, height: 50};

const rules = [
    "Guess which way the chicken turns Left or Right Correct = +5 points",
    "when you reach 5 correct In a row you go into bonus rounds",
    "Incorrect guess you lose 5 points, 5 mistakes = GAME OVER"
];

// Mouse click handler
canvas.addEventListener("click", (e) => {
    handleInput(e.clientX, e.clientY);
});

// Touchscreen handler
canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY);
    e.preventDefault();
});

// Handle click events
function handleInput(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();

    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    if(!gameStarted){
        if(mouseX > startButton.x && mouseX < startButton.x + startButton.width &&
           mouseY > startButton.y && mouseY < startButton.y + startButton.height){
            gameStarted = true;
            start_audio.play();
        }
    } else {
        let guess = null;

        if(mouseX > leftButton.x && mouseX < leftButton.x + leftButton.width &&
           mouseY > leftButton.y && mouseY < leftButton.y + leftButton.height){
            guess = "left";
        } else if(mouseX > rightButton.x && mouseX < rightButton.x + rightButton.width &&
                  mouseY > rightButton.y && mouseY < rightButton.y + rightButton.height){
            guess = "right";
        }

        if(guess){
            handleGuess(guess);
        }
    }
}

// Handle Guess
function handleGuess(guess) {
    const result = Math.random() < 0.5 ? "left" : "right";
    chickenDirection = result;

    handActive = true;
    handTimer = 20;
    handTarget = {x: chickenX + 40, y: chickenY + 40};

    // Correct Guess
    if(guess === result && gameStarted == true){
        // First correct guess achievement 
        if (first_correct == false) {
            unlockAchievement(11).then(handleAchievementResponse); //api call
        }
        first_correct = true;
        correct_audio.currentTime = 0;
        correct_audio.play();
        combo += 1 ;
        score += (5 * combo_mult);
    } else { // Wrong Guess
        wrong_audio.currentTime = 0;
        wrong_audio.play();
        score -= 5;
        if (score <= 0) {
            score = 0; // No negative scores
        }
        combo = 0;
        mistakes += 1;
    }

    // Combo Mode
    if(combo >= 5){ 
        unlockAchievement(13).then(handleAchievementResponse); //api call
        combo_mult = 2
        start_audio.pause();
        combo_audio.play();
    } else {
        combo_mult = 1
        combo_audio.pause();
        start_audio.play();
    }

    // Reach Combo 15 Achievement 
    if(combo >= 15){
        unlockAchievement(14).then(handleAchievementResponse); //api call
    }
    // Reach Score 50 Achievement 
    if(score >= 50){
        unlockAchievement(12).then(handleAchievementResponse); //api call
    }
    // Game Over
    if(mistakes >= 5){
        start_audio.pause();
        combo_audio.pause();
        unlockAchievement(15).then(handleAchievementResponse); //api call
        submitScore("Plucking Chicken", score); //api call
        gameStarted = false;
        score = 0;
        combo = 0;
        mistakes = 0;
        return;
    }
}

// Achievemet handling
function handleAchievementResponse(data) {
    if (data.status === "success") {
        burstConfetti(); // Show confetti
        showAchievement(data.name, data.description); // Show message
    }
}

// Draw start screen
function drawStart(){
    ctx.drawImage(backgroundImg,0,0,GAME_WIDTH,GAME_HEIGHT);

    // Title
    ctx.fillStyle = "black";
    ctx.font = "50px sans-serif";
    const titleText = "Plucking Chicken";
    const titleWidth = ctx.measureText(titleText).width;
    ctx.fillText(titleText, (GAME_WIDTH - titleWidth) / 2, 180);

    // Rules
    ctx.font = "20px sans-serif";
    let y = 15;
    for(let line of rules){
        ctx.fillText(line, 20, y += 30);
    }

    // Start Button
    startButton.x = (GAME_WIDTH - startButton.width) / 2;
    startButton.y = (GAME_HEIGHT - startButton.height) / 2 + 50;
    ctx.fillStyle = "yellow";
    ctx.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);
    
    ctx.fillStyle = "black";
    const startText = "START";
    const startTextWidth = ctx.measureText(startText).width;
    ctx.fillText(startText, startButton.x + (startButton.width - startTextWidth)/2, startButton.y + 40);
}

// Draw game
function drawGame(){
    ctx.drawImage(backgroundImg,0,0,GAME_WIDTH,GAME_HEIGHT);

    // Chicken
    ctx.save();
    ctx.translate(chickenX + 60, chickenY + 60); // move origin to chicken center (half of 120x120)
    if(chickenDirection === "left"){
        ctx.scale(-1,1); // flip horizontally
    }
    ctx.drawImage(chickenImg, -60, -60, 120, 120); // draw centered
    ctx.restore();

    // Hand
    ctx.drawImage(handImg, handX, handY, 140,140);

    // Buttons
    leftButton.x = (GAME_WIDTH / 4) - (leftButton.width / 2);
    leftButton.y = GAME_HEIGHT - leftButton.height - 50;
    rightButton.x = (3 * GAME_WIDTH / 4) - (rightButton.width / 2);
    rightButton.y = GAME_HEIGHT - rightButton.height - 50;
    
    ctx.fillStyle = "white";
    ctx.fillRect(leftButton.x,leftButton.y,leftButton.width,leftButton.height);
    ctx.fillRect(rightButton.x,rightButton.y,rightButton.width,rightButton.height);

    ctx.fillStyle = "black";
    ctx.font = "20px sans-serif";
    ctx.fillText("LEFT", leftButton.x+30, leftButton.y+30);
    ctx.fillText("RIGHT", rightButton.x+25, rightButton.y+30);

    // Score and combo
    ctx.fillText("Score: " + score, 30, 40);
    ctx.fillText("Combo: " + combo, 30, 70);
    
    drawHearts()
}

function drawHearts() {
    let startX = GAME_WIDTH - 60;
    let startY = 30;
    for (let i = 0; i < 5; i++) {
        if (i < mistakes) {
            ctx.drawImage(emptyHeartImg, startX, startY, 25, 22);
        } else {
            ctx.drawImage(fullHeartImg, startX, startY, 25, 22);
        }
        startX -= 30;
    }
}

// Game loop
function gameLoop(){
    if(!gameStarted){
        drawStart();
    } else {
        drawGame();
    }

    // Hand animation
    if(handActive){
        handX += (handTarget.x - handX) * 0.2;
        handY += (handTarget.y - handY) * 0.2;
        handTimer--;
        if(handTimer <= 0){
            handActive = false;
            handX = GAME_WIDTH - 100;
            handY = 50;
        }
    }

    requestAnimationFrame(gameLoop);
}

// Dynamic canvas for different screen sizes
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const scaleX = rect.width / GAME_WIDTH;
    const scaleY = rect.height / GAME_HEIGHT;

    ctx.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
}

// Set canvas and start game
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
gameLoop();