const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameContainer = document.getElementById("gameContainer");

const startGameBtn = document.getElementById("startGameBtn");
const startRoundBtn = document.getElementById("startRoundBtn");

const leftScoreEl = document.getElementById("leftScore");
const rightScoreEl = document.getElementById("rightScore");
const winnerMessage = document.getElementById("winnerMessage");

const modeSelect = document.getElementById("gameMode");
const cpuLevelSelect = document.getElementById("cpuLevel");
const winScoreSelect = document.getElementById("winScore");
const themeSelect = document.getElementById("themeSelect");
const themeToggle = document.getElementById("themeToggle");

let mode = "pvp";
let cpuLevel = "medium";
let winScore = 5;

let running = false;
let paused = false;

// Paddles
let left = { x: 20, y: 200, w: 15, h: 100, dy: 0 };
let right = { x: 765, y: 200, w: 15, h: 100, dy: 0 };

// Ball
let ball = { x: 400, y: 250, size: 12, vx: 0, vy: 0 };

let sL = 0, sR = 0;

// Start Menu
startGameBtn.onclick = () => {
    mode = modeSelect.value;
    cpuLevel = cpuLevelSelect.value;
    winScore = parseInt(winScoreSelect.value);

    // theme
    document.body.classList.remove("theme-classic","theme-neon","theme-retro","theme-minimal");
    document.body.classList.add("theme-" + themeSelect.value);

    menu.classList.add("hidden");
    gameContainer.classList.remove("hidden");
};

// Light/Dark toggle
themeToggle.onclick = () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
};

// Reset ball
function resetBall() {
    ball.x = 400;
    ball.y = 250;
    ball.vx = Math.random() > 0.5 ? 5 : -5;
    ball.vy = (Math.random() > 0.5 ? 3 : -3);
}

// Start round
startRoundBtn.onclick = () => {
    winnerMessage.classList.add("hidden");
    resetBall();
    running = true;
    paused = false;
    gameLoop();
};

// CPU AI
function cpuMove() {
    const speed = cpuLevel === "easy" ? 2 : cpuLevel === "medium" ? 4 : 6;

    if (ball.y < right.y + right.h/2) right.y -= speed;
    else if (ball.y > right.y + right.h/2) right.y += speed;

    right.y = Math.max(0, Math.min(400, right.y));
}

// Keyboard Controls
document.addEventListener("keydown", (e) => {
    if (e.key === " ") paused = !paused;

    if (mode === "pvp") {
        if (e.key === "w") left.dy = -5;
        if (e.key === "s") left.dy = 5;
        if (e.key === "ArrowUp") right.dy = -5;
        if (e.key === "ArrowDown") right.dy = 5;
    } else {
        if (e.key === "ArrowUp") left.dy = -5;
        if (e.key === "ArrowDown") left.dy = 5;
    }
});

document.addEventListener("keyup", (e) => {
    if (["w","s","ArrowUp","ArrowDown"].includes(e.key)) {
        left.dy = 0;
        right.dy = 0;
    }
});

// Mobile Controls
document.getElementById("touchUp").ontouchstart = () => left.dy = -5;
document.getElementById("touchUp").ontouchend = () => left.dy = 0;

document.getElementById("touchDown").ontouchstart = () => left.dy = 5;
document.getElementById("touchDown").ontouchend = () => left.dy = 0;

// Draw
function draw() {
    ctx.clearRect(0,0,800,500);

    ctx.fillStyle = "white";

    ctx.fillRect(left.x, left.y, left.w, left.h);
    ctx.fillRect(right.x, right.y, right.w, right.h);
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

// Update + collision
function update() {
    if (!running || paused) return;

    left.y += left.dy;
    right.y += right.dy;

    left.y = Math.max(0, Math.min(400, left.y));
    right.y = Math.max(0, Math.min(400, right.y));

    if (mode === "cpu") cpuMove();

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce walls
    if (ball.y <= 0 || ball.y + ball.size >= 500) ball.vy *= -1;

    // Paddle collisions
    if (ball.x <= left.x + left.w &&
        ball.y + ball.size >= left.y &&
        ball.y <= left.y + left.h) {
        ball.vx *= -1;
    }

    if (ball.x + ball.size >= right.x &&
        ball.y + ball.size >= right.y &&
        ball.y <= right.y + right.h) {
        ball.vx *= -1;
    }

    // Scoring
    if (ball.x < 0) {
        sR++;
        endRound();
    }

    if (ball.x > 800) {
        sL++;
        endRound();
    }

    leftScoreEl.textContent = sL;
    rightScoreEl.textContent = sR;
}

function endRound() {
    running = false;

    if (sL >= winScore || sR >= winScore) {
        winnerMessage.classList.remove("hidden");
        winnerMessage.textContent = sL > sR ? "Left Player Wins!" : "Right Player Wins!";
    }
}

// Game Loop
function gameLoop() {
    if (!running) return;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}
