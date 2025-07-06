const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bg = new Image();
bg.src = "assets/background.jpg";

const bg2 = new Image();
bg2.src = "assets/background2.jpg";

const bg3 = new Image();
bg3.src = "assets/background3.png";

const bg4 = new Image();
bg4.src = "assets/background4.png";

const ground = new Image();
ground.src = "assets/ground.png";

const mushroomWalk = new Image();
mushroomWalk.src = "assets/mushroom_walk.png";

const mushroomIdle = new Image();
mushroomIdle.src = "assets/mushroom_idle.png";

const rock = new Image();
rock.src = "assets/rock.png";

const log = new Image();
log.src = "assets/log.png";

const GROUND_DRAW_Y = 350;
const PLAYER_GROUND_Y = 300;

let groundX = 0;
let bgX = 0;
let playerX = 100;
let playerY = PLAYER_GROUND_Y;
let velocityY = 0;

const gravityUp = 0.09;
const gravityDown = 0.07;

let isJumping = false;
let isAlive = true;

const jumpPower = -5;

let playerFrame = 0;
let frameCount = 0;
let keys = {};

const obstacles = [];

let score = 0;
let scoreTimer = 0;

let obstacleSpeed = 4;
let spawnRate = 1500;
let obstacleSpawner;
let difficultyLevel = 1;

const MAX_SPEED = 8;
const MIN_SPAWN_RATE = 1000;

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "Space" && !isJumping && isAlive) {
    velocityY = jumpPower;
    isJumping = true;
  }

  if (e.code === "KeyR" && !isAlive) {
    location.reload();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function spawnObstacle() {
  if (!isAlive) return;

  const type = Math.random() < 0.5 ? rock : log;

  obstacles.push({
    x: canvas.width,
    y: GROUND_DRAW_Y - 22,
    width: 72,
    height: 72,
    image: type,
  });
}

function adjustDifficulty() {
  if (!isAlive) return;

  if (score % 300 === 0 && score !== 0 && obstacleSpeed < MAX_SPEED) {
    obstacleSpeed += 0.2;
  }

  if (score % 500 === 0 && score !== 0 && spawnRate > MIN_SPAWN_RATE) {
    spawnRate -= 50;
    clearInterval(obstacleSpawner);
    obstacleSpawner = setInterval(spawnObstacle, spawnRate);
  }

  difficultyLevel = Math.floor(score / 400) + 1;
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function getCurrentBackground() {
  if (difficultyLevel >= 10) return bg4;
  if (difficultyLevel >= 6) return bg3;
  if (difficultyLevel >= 3) return bg2;
  return bg;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bgX -= 1;
  if (bgX <= -canvas.width) bgX = 0;

  const currentBg = getCurrentBackground();
  ctx.drawImage(currentBg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(currentBg, bgX + canvas.width, 0, canvas.width, canvas.height);

  groundX -= 2;
  if (groundX <= -canvas.width) groundX = 0;
  ctx.drawImage(ground, groundX, GROUND_DRAW_Y, canvas.width, 50);
  ctx.drawImage(
    ground,
    groundX + canvas.width,
    GROUND_DRAW_Y,
    canvas.width,
    50
  );

  if (velocityY < 0) {
    velocityY += gravityUp;
  } else {
    velocityY += gravityDown;
  }
  playerY += velocityY;

  if (playerY >= PLAYER_GROUND_Y) {
    playerY = PLAYER_GROUND_Y;
    isJumping = false;
  }

  let usingSprite = mushroomIdle;
  let totalFrames = 9;
  let frameWidth = mushroomIdle.width / totalFrames;

  const isWalking = !isJumping && isAlive;

  if (isWalking) {
    usingSprite = mushroomWalk;
    totalFrames = 4;
    frameWidth = mushroomWalk.width / totalFrames;
  }

  frameCount++;
  if (frameCount % 10 === 0) {
    playerFrame = (playerFrame + 1) % totalFrames;
  }

  ctx.drawImage(
    usingSprite,
    playerFrame * frameWidth,
    0,
    frameWidth,
    usingSprite.height,
    playerX,
    playerY,
    100,
    100
  );

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obstacleSpeed;
    ctx.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);

    const playerRect = { x: playerX, y: playerY, width: 64, height: 64 };
    const obsRect = {
      x: obs.x,
      y: obs.y,
      width: obs.width,
      height: obs.height,
    };

    if (checkCollision(playerRect, obsRect)) {
      isAlive = false;
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }

  if (isAlive) {
    scoreTimer++;
    if (scoreTimer % 6 === 0) {
      score++;
    }
    adjustDifficulty();
  }

  ctx.fillStyle = "#fff";
  ctx.font = "20px 'Press Start 2P', monospace";
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.fillText(`Level: ${difficultyLevel}`, 20, 70);

  if (!isAlive) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "20px 'Press Start 2P', monospace";

    ctx.fillText("Game Over", canvas.width / 2, 200);
    ctx.fillText("Press R to Restart", canvas.width / 2, 240);

    ctx.textAlign = "start";
  }

  requestAnimationFrame(gameLoop);
}

obstacleSpawner = setInterval(spawnObstacle, spawnRate);

bg.onload = () => {
  gameLoop();
};
