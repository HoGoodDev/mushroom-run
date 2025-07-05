const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bg = new Image();
bg.src = "assets/background.jpg";

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

let groundX = 0;
let bgX = 0;
let playerX = 100;
let playerY = 300;
let velocityY = 0;

const gravityUp = 0.1; // lighter gravity while rising
const gravityDown = 0.07; // stronger gravity while falling

let isJumping = false;
let isAlive = true;

const jumpPower = -6;
const groundY = 300;

let playerFrame = 0;
let frameCount = 0;
let keys = {};

const obstacles = [];

// Score tracking
let score = 0;
let scoreTimer = 0;

// Input handlers
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

// Spawn obstacles every 1.5 seconds
function spawnObstacle() {
  if (!isAlive) return;

  const type = Math.random() < 0.5 ? rock : log;

  // Bigger obstacles & lower on ground to make it easier to jump over
  obstacles.push({
    x: canvas.width,
    y: groundY + -12, // lower than before (was +20)
    width: 150, // bigger width (increased from 72)
    height: 150, // bigger height (increased from 72)
    image: type,
  });
}

setInterval(spawnObstacle, 1500);

// Simple AABB collision detection
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Scroll background
  bgX -= 1;
  if (bgX <= -canvas.width) bgX = 0;
  ctx.drawImage(bg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, bgX + canvas.width, 0, canvas.width, canvas.height);

  // Scroll ground
  groundX -= 2;
  if (groundX <= -canvas.width) groundX = 0;
  ctx.drawImage(ground, groundX, 350, canvas.width, 50);
  ctx.drawImage(ground, groundX + canvas.width, 350, canvas.width, 50);

  // Apply gravity with smooth jump/fall
  if (velocityY < 0) {
    velocityY += gravityUp;
  } else {
    velocityY += gravityDown;
  }
  playerY += velocityY;

  if (playerY >= groundY) {
    playerY = groundY;
    isJumping = false;
  }

  // Determine sprite & animation frames
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

  // Draw player sprite frame
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

  // Update and draw obstacles with smaller collision hitboxes
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= 4;
    ctx.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);

    const playerRect = { x: playerX, y: playerY, width: 64, height: 64 };

    const hitboxMarginX = 20; // shrink horizontal hitbox by 20px each side
    const hitboxMarginY = 15; // shrink vertical hitbox by 15px each side

    const obsRect = {
      x: obs.x + hitboxMarginX,
      y: obs.y + hitboxMarginY,
      width: obs.width - hitboxMarginX * 2,
      height: obs.height - hitboxMarginY * 2,
    };

    if (checkCollision(playerRect, obsRect)) {
      isAlive = false;
    }

    // Remove obstacles that go off screen
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }

  // Score updates only if alive
  if (isAlive) {
    scoreTimer++;
    if (scoreTimer % 6 === 0) {
      // roughly 10 points per second at 60fps
      score++;
    }
  }

  // Draw score
  ctx.fillStyle = "#fff";
  ctx.font = "20px 'Press Start 2P', monospace";
  ctx.fillText(`Score: ${score}`, 20, 40);
  // Draw game over screen if dead
  if (!isAlive) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center"; // Center horizontally
    ctx.font = "20px 'Press Start 2P', monospace";

    ctx.fillText("Game Over", canvas.width / 2, 200);
    ctx.fillText("Press R to Restart", canvas.width / 2, 240);

    ctx.textAlign = "start";
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop after background loads
bg.onload = () => {
  gameLoop();
};
