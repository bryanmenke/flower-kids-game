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

  ctx.clearRect(0, 0, Game.width, Game.height);
  drawBackground();

  ShootingStars.update(Game.deltaTime);
  Planet.update(Game.deltaTime);
  Planet.draw(ctx);
  Plants.drawPlacementHints(ctx);
  Plants.draw(ctx);

  // Ambient particles around bloomed plants
  for (const plant of Plants.items) {
    if (plant.state === 'bloomed') {
      const pos = Planet.surfacePoint(plant.angle);
      if (pos.visible) {
        Particles.emitAmbient(pos.x, pos.y, PlantTypes[plant.typeIndex].glowColor);
      }
    }
  }

  ShootingStars.draw(ctx);
  Particles.update(Game.deltaTime);
  Particles.draw(ctx);

  requestAnimationFrame(gameLoop);
}

// Initialize
function init() {
  resizeCanvas();
  initStars();
  Planet.init();

  Input.init();
  UI.init();

  Input.onTap = (x, y) => {
    GameAudio.init();

    // Check if tapping a shooting star
    const starIndex = ShootingStars.hitTest(x, y);
    if (starIndex >= 0) {
      ShootingStars.catchStar(starIndex);
      GameAudio.playStarCatch();
      Particles.emit(x, y, { count: 12, color: '#ffffaa', speed: 60, life: 0.4, size: 3 });
      return;
    }

    // If holding droplet, try to water a plant
    if (ShootingStars.droplet) {
      // Droplet is dragged, not tapped - skip
      return;
    }

    // If a plant type is selected and tap is on planet, place it
    if (Plants.selectedType >= 0 && Planet.hitTest(x, y)) {
      const typeIndex = Plants.selectedType;
      const angle = Planet.screenToSurfaceAngle(x, y);
      Plants.addPlant(typeIndex, angle);
      GameAudio.playPlantPop();
      const pos = Planet.surfacePoint(angle);
      Particles.emit(pos.x, pos.y, { count: 8, color: PlantTypes[typeIndex].color, speed: 30, life: 0.5, size: 3 });
      Plants.selectedType = -1;
      UI.trayItems.forEach(btn => btn.classList.remove('selected'));
      return;
    }
  };

  Input.onDragStart = (x, y) => {
    // Check if starting drag on a shooting star
    const starIndex = ShootingStars.hitTest(x, y);
    if (starIndex >= 0) {
      ShootingStars.catchStar(starIndex);
      GameAudio.playStarCatch();
      GameAudio.startDragShimmer();
      Particles.emit(x, y, { count: 12, color: '#ffffaa', speed: 60, life: 0.4, size: 3 });
    }
  };

  Input.onDragMove = (x, y, dx, dy) => {
    if (ShootingStars.isDraggingDroplet) {
      ShootingStars.moveDroplet(x, y);
    } else if (Planet.hitTest(x, y)) {
      Planet.rotationVelocity = dx * 0.01;
    }
  };

  Input.onDragEnd = (x, y, velX, velY) => {
    if (ShootingStars.isDraggingDroplet) {
      GameAudio.stopDragShimmer();
      const plant = ShootingStars.releaseDroplet(x, y);
      if (plant) {
        // Bloom the plant!
        Plants.bloomPlant(plant);
        const pos = Planet.surfacePoint(plant.angle);
        GameAudio.playBloom(plant.typeIndex);
        Particles.emitBloom(pos.x, pos.y, PlantTypes[plant.typeIndex].bloomColors);
      }
    }
  };

  Input.onSwipe = (velX, velY) => {
    if (!ShootingStars.isDraggingDroplet) {
      GameAudio.ensure();
      Planet.spin(velX);
      GameAudio.playSpinWhoosh(velX);
    }
  };

  window.addEventListener('resize', () => {
    resizeCanvas();
    initStars();
    Planet.resize();
  });
  Game.lastTime = performance.now() / 1000;
  requestAnimationFrame(gameLoop);
}

init();
