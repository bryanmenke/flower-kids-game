// Starlight Garden - Main Entry Point

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const Game = {
  width: 0,
  height: 0,
  time: 0,
  deltaTime: 0,
  lastTime: 0,
  stars: [],
  state: 'playing', // 'title', 'playing'
};

// Resize canvas to fill screen at device pixel ratio
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  Game.width = window.innerWidth;
  Game.height = window.innerHeight;
  canvas.width = Game.width * dpr;
  canvas.height = Game.height * dpr;
  canvas.style.width = Game.width + 'px';
  canvas.style.height = Game.height + 'px';
  ctx.scale(dpr, dpr);
}

// Generate background stars
function initStars() {
  Game.stars = [];
  for (let i = 0; i < 150; i++) {
    Game.stars.push({
      x: Math.random() * Game.width,
      y: Math.random() * Game.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 2 + 1,
      twinkleOffset: Math.random() * Math.PI * 2,
    });
  }
}

// Draw background gradient and stars
function drawBackground() {
  // Deep space gradient
  const grad = ctx.createRadialGradient(
    Game.width / 2, Game.height / 2, 0,
    Game.width / 2, Game.height / 2, Game.height
  );
  grad.addColorStop(0, '#1a1a4e');
  grad.addColorStop(1, '#0a0a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, Game.width, Game.height);

  // Twinkling stars
  for (const star of Game.stars) {
    const twinkle = Math.sin(Game.time * star.twinkleSpeed + star.twinkleOffset);
    const alpha = star.alpha * (0.5 + 0.5 * twinkle);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
    ctx.fill();
  }
}

// Main game loop
function gameLoop(timestamp) {
  const time = timestamp / 1000;
  Game.deltaTime = Math.min(time - Game.lastTime, 0.1); // cap at 100ms
  Game.lastTime = time;
  Game.time = time;

  // Clear and draw
  ctx.clearRect(0, 0, Game.width, Game.height);
  drawBackground();
  Planet.update(Game.deltaTime);
  Planet.draw(ctx);

  requestAnimationFrame(gameLoop);
}

// Initialize
function init() {
  resizeCanvas();
  initStars();
  Planet.init();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initStars();
    Planet.resize();
  });
  Game.lastTime = performance.now() / 1000;
  requestAnimationFrame(gameLoop);
}

init();
