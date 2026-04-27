import { submitScore, unlockAchievement } from "/static/js/api.js";
import { showAchievement, burstConfetti } from "/static/js/achievement.js";

// Load audio
const water_splash = new Audio("/static/tidal tap/assets/water_splash.ogg");
water_splash.volume = 0.6;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const SCREEN_W = 480;
const SCREEN_H = 640;

let bgX = 0;
const BG_SPEED = 2; 
const GRAVITY = 0.45;
const FLAP = -8.5;
const PIPE_SPEED = 3;
const PIPE_SPAWN = 90;
const GAP = 180;
const PIPE_W = 80;

let frame = 0;
let score = 0;
let state = "menu";

const fishImg = new Image();
fishImg.src = "/static/tidal tap/assets/fish.png";

const bgImg = new Image();
bgImg.src = "/static/tidal tap/assets/background.png";

const seaweedImg = new Image();
seaweedImg.src = "/static/tidal tap/assets/seaweed.png";

class Fish {
    constructor() {
        this.x = 100;
        this.y = SCREEN_H / 2;
        this.vel = 0;
        this.w = 70;
        this.h = 55;
    }

    flap() {
        water_splash.currentTime = 0;
        water_splash.play();
        this.vel = FLAP;
    }

    update() {
        this.vel += GRAVITY;
        this.y += this.vel;
    }

    draw() {
        ctx.drawImage(fishImg, this.x, this.y, this.w, this.h);
    }

    dead() {
        return this.y < 0 || this.y + this.h > SCREEN_H;
    }
}

class Pipe {
    constructor() {
        this.x = SCREEN_W;
        this.passed = false;

        const gapY = Math.random() * (SCREEN_H - 260) + 130;
        this.top = gapY - GAP/2;
        this.bottom = gapY + GAP/2;
    }

    update() {
        this.x -= PIPE_SPEED;
    }

    draw() {
        // top
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(seaweedImg, this.x, -this.top, PIPE_W, this.top);

        // bottom
        ctx.restore();
        ctx.drawImage(seaweedImg, this.x, this.bottom, PIPE_W, SCREEN_H - this.bottom);
    }

    offscreen() {
        return this.x + PIPE_W < 0;
    }

    collide(fish) {
        //compensate for imperfect hitboxes
        const paddingX = 15;
        const paddingY = 12;

        const fx = fish.x + paddingX;
        const fy = fish.y + paddingY;
        const fw = fish.w - paddingX * 2;
        const fh = fish.h - paddingY * 2;

        return (
            fx < this.x + PIPE_W &&
            fx + fw > this.x &&
            (fy < this.top || fy + fh > this.bottom)
        );
    }
}

let fish = new Fish();
let pipes = [];

function reset() {
    fish = new Fish();
    pipes = [];
    score = 0;
    frame = 0;
}

function update() {
    if (state !== "playing") return;

    frame++;

    if (frame % PIPE_SPAWN === 0) {
        pipes.push(new Pipe());
    }

    fish.update();

    pipes.forEach(p => p.update());
    pipes = pipes.filter(p => !p.offscreen());

    pipes.forEach(p => {
        if (!p.passed && p.x + PIPE_W < fish.x) {
            p.passed = true;
            score++;
        }

        if (p.collide(fish)) {
            state = "dead";
        }
    });

    if (state === "playing") {
        bgX += BG_SPEED;

        if (bgX >= bgImg.width) {
            bgX = 0;
        }
    }

    if (fish.dead()) {
        state = "dead";
    }
}

function draw() {
    ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
    
    // background
    ctx.drawImage(bgImg, bgX, 0,  SCREEN_W, SCREEN_H, 0, 0, SCREEN_W, SCREEN_H);
    if (bgX + SCREEN_W > bgImg.width) {
        let overflow = (bgX + SCREEN_W) - bgImg.width;
        ctx.drawImage(bgImg, 0, 0, overflow, SCREEN_H, SCREEN_W - overflow, 0, overflow, SCREEN_H);
    }
    
    if (state === "menu") {
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("Tidal Tap", 120, 200);

        ctx.font = "20px Arial";
        ctx.fillText("Click or SPACE to start", 130, 300);
    }

    if (state === "playing") {
        pipes.forEach(p => p.draw());
        fish.draw();

        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(score, 420, 40);
    }

    if (state === "dead") {
        submitScore("Tidal Tap", score);
        pipes.forEach(p => p.draw());
        fish.draw();

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

        ctx.fillStyle = "red";
        ctx.font = "48px Arial";
        ctx.fillText("Game Over", 120, 250);

        ctx.fillStyle = "white";
        ctx.font = "28px Arial";
        ctx.fillText("Score: " + score, 170, 320);
        ctx.fillText("Click to restart", 140, 380);
    }
}

// ==============================
// ACHIEVEMENTS, SCORING & END GAME
// ==============================

function checkAchievements() {
    if (score >= 10) {
        unlockAchievement(26).then(handleAchievementResponse); //api call
    }
    if (score >= 20) {
        unlockAchievement(27).then(handleAchievementResponse); //api call
    }
    if (score >= 30) {
        unlockAchievement(28).then(handleAchievementResponse); //api call
    }
    if (score >= 40) {
        unlockAchievement(29).then(handleAchievementResponse); //api call
    }
    if (score >= 50) {
        unlockAchievement(30).then(handleAchievementResponse); //api call
    }
}

// Achievemet handling
function handleAchievementResponse(data) {
    if (data.status === "success") {
        burstConfetti(); // Show confetti
        showAchievement(data.name, data.description); // Show message
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
    checkAchievements();
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        if (state === "menu") {
            reset();
            state = "playing";
        } else if (state === "playing") {
            fish.flap();
        } else if (state === "dead") {
            reset();
            state = "playing";
        }
    }
});

canvas.addEventListener("mousedown", () => {
    if (state === "menu") {
        reset();
        state = "playing";
    } else if (state === "playing") {
        fish.flap();
    } else if (state === "dead") {
        reset();
        state = "playing";
    }
});

loop();