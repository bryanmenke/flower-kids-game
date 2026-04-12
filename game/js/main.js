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
  state: 'title', // 'title', 'transition', 'playing'
  titleAlpha: 1,
  transitionTimer: 0,
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
  const grad = ctx.createRadialGradient(
    Game.width / 2, Game.height / 2, 0,
    Game.width / 2, Game.height / 2, Game.height
  );
  grad.addColorStop(0, '#1a1a4e');
  grad.addColorStop(1, '#0a0a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, Game.width, Game.height);

  for (const star of Game.stars) {
    const twinkle = Math.sin(Game.time * star.twinkleSpeed + star.twinkleOffset);
    const alpha = star.alpha * (0.5 + 0.5 * twinkle);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
    ctx.fill();
  }
}

// Auto-save after any state change
function autoSave() {
  Storage.save();
}

function drawTitleScreen() {
  // Small planet in center
  const scale = 0.5;
  const origRadius = Planet.radius;
  Planet.radius = origRadius * scale;
  Planet.y = Game.height * 0.4;
  Planet.draw(ctx);
  Planet.radius = origRadius;
  Planet.y = Game.height * 0.4;

  // Pulsing play button (star shape below planet)
  const pulse = 0.9 + Math.sin(Game.time * 2) * 0.1;
  const btnX = Game.width / 2;
  const btnY = Game.height * 0.65;
  const btnSize = 40 * pulse;

  // Button glow
  const glow = ctx.createRadialGradient(btnX, btnY, 0, btnX, btnY, btnSize * 2);
  glow.addColorStop(0, 'rgba(255, 230, 100, 0.5)');
  glow.addColorStop(1, 'rgba(255, 230, 100, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(btnX, btnY, btnSize * 2, 0, Math.PI * 2);
  ctx.fill();

  // Star button
  ctx.fillStyle = '#ffdd44';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / 5;
    ctx.lineTo(btnX + Math.cos(outerAngle) * btnSize, btnY + Math.sin(outerAngle) * btnSize);
    ctx.lineTo(btnX + Math.cos(innerAngle) * btnSize * 0.45, btnY + Math.sin(innerAngle) * btnSize * 0.45);
  }
  ctx.closePath();
  ctx.fill();

  // Inner shine
  ctx.fillStyle = '#fff8cc';
  ctx.beginPath();
  ctx.arc(btnX, btnY, btnSize * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop(timestamp) {
  const time = timestamp / 1000;
  Game.deltaTime = Math.min(time - Game.lastTime, 0.1);
  Game.lastTime = time;
  Game.time = time;

  ctx.clearRect(0, 0, Game.width, Game.height);
  drawBackground();

  if (Game.state === 'title') {
    Planet.update(Game.deltaTime);
    drawTitleScreen();
    Particles.update(Game.deltaTime);
    Particles.draw(ctx);
    requestAnimationFrame(gameLoop);
    return;
  }

  if (Game.state === 'transition') {
    Game.transitionTimer += Game.deltaTime;
    const t = Math.min(1, Game.transitionTimer);
    const ease = 1 - Math.pow(1 - t, 3);
    Planet.radius = Math.min(Game.width, Game.height) * (0.125 + ease * 0.125);
    Planet.update(Game.deltaTime);
    Planet.draw(ctx);
    Particles.update(Game.deltaTime);
    Particles.draw(ctx);

    if (t >= 1) {
      Game.state = 'playing';
      Planet.resize();
      UI.init();
    }
    requestAnimationFrame(gameLoop);
    return;
  }

  // Playing state
  ShootingStars.update(Game.deltaTime);
  Planet.update(Game.deltaTime);
  Animals.update(Game.deltaTime);
  Rewards.update(Game.deltaTime);

  Planet.draw(ctx);
  Decorations.draw(ctx);
  Plants.drawPlacementHints(ctx);
  Plants.draw(ctx);
  Animals.draw(ctx);
  Decorations.drawAccessories(ctx);

  for (const plant of Plants.items) {
    if (plant.state === 'bloomed') {
      const pos = Planet.surfacePoint(plant.angle);
      if (pos.visible) {
        Particles.emitAmbient(pos.x, pos.y, PlantTypes[plant.typeIndex].glowColor);
      }
    }
  }

  ShootingStars.draw(ctx);
  Rewards.draw(ctx);
  Particles.update(Game.deltaTime);
  Particles.draw(ctx);

  requestAnimationFrame(gameLoop);
}

function init() {
  resizeCanvas();
  initStars();
  Planet.init();
  Input.init();

  // Check for saved game
  if (Storage.hasSave()) {
    Storage.load();
    Game.state = 'playing';
    UI.init();
    UI.refreshGardenTray();
  } else {
    Game.state = 'title';
  }

  Input.onTap = (x, y) => {
    GameAudio.init();

    if (Game.state === 'title') {
      Game.state = 'transition';
      Game.transitionTimer = 0;
      return;
    }

    if (Game.state !== 'playing') return;

    // If in accessory mode, tapping planet background dismisses it
    if (UI.currentTray === 'accessory') {
      if (!Animals.handleTap(x, y)) {
        UI.hideAccessoryTray();
      }
      return;
    }

    // Check gift stars first
    if (Rewards.handleTap(x, y)) {
      UI.refreshGardenTray();
      autoSave();
      return;
    }

    // Check shooting stars
    const starIndex = ShootingStars.hitTest(x, y);
    if (starIndex >= 0) {
      ShootingStars.catchStar(starIndex);
      GameAudio.playStarCatch();
      Particles.emit(x, y, { count: 12, color: '#ffffaa', speed: 60, life: 0.4, size: 3 });
      return;
    }

    // Check animals
    const animal = Animals.handleTap(x, y);
    if (animal) {
      if (Rewards.getUnlockedByType('accessory').length > 0) {
        UI.showAccessoryTray(animal);
      }
      return;
    }

    // Place decoration
    if (UI.selectedDecoration && Planet.hitTest(x, y)) {
      const angle = Planet.screenToSurfaceAngle(x, y);
      Decorations.placeDecoration(UI.selectedDecoration, angle);
      GameAudio.playAccessoryPlace();
      const pos = Planet.surfacePoint(angle);
      Particles.emit(pos.x, pos.y, { count: 6, color: '#ffffcc', speed: 25, life: 0.4, size: 2 });
      UI.selectedDecoration = null;
      UI.trayItems.forEach(btn => btn.classList.remove('selected'));
      autoSave();
      return;
    }

    // Place plant
    if (Plants.selectedType >= 0 && Planet.hitTest(x, y)) {
      const typeIndex = Plants.selectedType;
      const angle = Planet.screenToSurfaceAngle(x, y);
      Plants.addPlant(typeIndex, angle);
      GameAudio.playPlantPop();
      const pos = Planet.surfacePoint(angle);
      Particles.emit(pos.x, pos.y, { count: 8, color: PlantTypes[typeIndex].color, speed: 30, life: 0.5, size: 3 });
      Plants.selectedType = -1;
      UI.trayItems.forEach(btn => btn.classList.remove('selected'));
      autoSave();
      return;
    }
  };

  Input.onDragStart = (x, y) => {
    if (Game.state !== 'playing') return;
    const starIndex = ShootingStars.hitTest(x, y);
    if (starIndex >= 0) {
      ShootingStars.catchStar(starIndex);
      GameAudio.playStarCatch();
      GameAudio.startDragShimmer();
      Particles.emit(x, y, { count: 12, color: '#ffffaa', speed: 60, life: 0.4, size: 3 });
    }
  };

  Input.onDragMove = (x, y, dx, dy) => {
    if (Game.state !== 'playing') return;
    if (ShootingStars.isDraggingDroplet) {
      ShootingStars.moveDroplet(x, y);
    } else if (Planet.hitTest(x, y)) {
      Planet.rotationVelocity = dx * 0.01;
    }
  };

  Input.onDragEnd = (x, y, velX, velY) => {
    if (Game.state !== 'playing') return;
    if (ShootingStars.isDraggingDroplet) {
      GameAudio.stopDragShimmer();
      const plant = ShootingStars.releaseDroplet(x, y);
      if (plant) {
        Plants.bloomPlant(plant);
        const pos = Planet.surfacePoint(plant.angle);
        GameAudio.playBloom(plant.typeIndex);
        Particles.emitBloom(pos.x, pos.y, PlantTypes[plant.typeIndex].bloomColors);
        Rewards.onBloom();
        autoSave();
      }
    }
  };

  Input.onSwipe = (velX, velY) => {
    if (Game.state !== 'playing') return;
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
