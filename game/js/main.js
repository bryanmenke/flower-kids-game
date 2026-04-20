// main.js - Game loop, state machine, depth-sorted render pipeline, input wiring
// This is the last file loaded. All modules are available as globals.
// Depends on: ALL modules

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const Game = {
  width: 0,
  height: 0,
  time: 0,
  deltaTime: 0,
  lastTime: 0,
  state: 'title',          // 'title' | 'transition' | 'playing'
  transitionTimer: 0,
  transitionDuration: 1.5,  // seconds for title->playing zoom
};

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  Game.width = window.innerWidth;
  Game.height = window.innerHeight;
  Camera.resize(Game.width, Game.height);
  Starfield.resize();
  PlanetSurface.resize();
}

function autoSave() {
  Storage.save();
}

// --- Title Screen ---
function drawTitleScreen(ctx) {
  const w = Game.width;
  const h = Game.height;
  const time = Game.time;

  // Space background
  Starfield.draw(ctx);

  // Curved horizon at bottom third
  const horizonY = h * 0.65;
  ctx.save();

  // Ground preview
  const grad = ctx.createLinearGradient(0, horizonY, 0, h);
  grad.addColorStop(0, '#3a6b2a');
  grad.addColorStop(0.3, '#2d5520');
  grad.addColorStop(0.7, '#4a3a25');
  grad.addColorStop(1, '#2a1e14');
  ctx.fillStyle = grad;
  ctx.beginPath();
  // Slightly wavy horizon
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 20) {
    const bump = Math.sin(x * 0.02 + 1) * 8 + Math.sin(x * 0.05 + 3) * 4;
    ctx.lineTo(x, horizonY + bump);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Silhouette plants along horizon
  ctx.fillStyle = 'rgba(20, 40, 15, 0.6)';
  for (let i = 0; i < 8; i++) {
    const px = w * 0.1 + i * w * 0.1;
    const py = horizonY + Math.sin(px * 0.02 + 1) * 8;
    ctx.save();
    ctx.translate(px, py);
    // Simple plant silhouette
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, -15 - i * 3);
    ctx.lineTo(5, -15 - i * 3);
    ctx.closePath();
    ctx.fill();
    // Leaves
    ctx.beginPath();
    ctx.ellipse(-8, -10 - i * 2, 6, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -12 - i * 2, 6, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  // Pulsing "tap to play" star in center
  const pulse = 0.85 + Math.sin(time * 2.5) * 0.15;
  const starSize = 35 * pulse;
  const cx = w / 2;
  const cy = h * 0.4;

  // Star glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, starSize * 3);
  glow.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
  glow.addColorStop(1, 'rgba(255, 255, 200, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, starSize * 3, 0, Math.PI * 2);
  ctx.fill();

  // Star shape
  ctx.fillStyle = '#ffeeaa';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const r = starSize;
    const ri = starSize * 0.4;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    const a2 = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a2) * ri, cy + Math.sin(a2) * ri);
  }
  ctx.closePath();
  ctx.fill();

  // White core
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(cx, cy, starSize * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

// --- Transition: zoom from title to playing ---
function drawTransition(ctx) {
  const progress = Game.transitionTimer / Game.transitionDuration;
  const ease = progress * (2 - progress); // ease-out

  // Blend from title horizon position to playing horizon
  const titleHorizonY = Game.height * 0.65;
  const playHorizonY = Camera.horizonY;
  const currentHorizon = titleHorizonY + (playHorizonY - titleHorizonY) * ease;

  // Draw starfield (fades/shifts as camera descends)
  Starfield.draw(ctx);

  // Ground expands upward
  const grad = ctx.createLinearGradient(0, currentHorizon, 0, Game.height);
  grad.addColorStop(0, '#3a6b2a');
  grad.addColorStop(0.3, '#2d5520');
  grad.addColorStop(0.7, '#4a3a25');
  grad.addColorStop(1, '#2a1e14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, currentHorizon, Game.width, Game.height - currentHorizon);

  // Fade to white at end of transition
  if (progress > 0.7) {
    ctx.save();
    ctx.globalAlpha = (progress - 0.7) / 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, Game.width, Game.height);
    ctx.restore();
  }
}

// --- Playing State Render Pipeline ---
function drawPlaying(ctx) {
  // 1. Clear
  ctx.clearRect(0, 0, Game.width, Game.height);

  // 2. Sky background (starfield above horizon)
  Starfield.draw(ctx);

  // 3. Ground below horizon
  PlanetSurface.draw(ctx);

  // 4. Collect all surface objects for depth sorting
  const surfaceObjects = [];

  // Plants
  const plantList = Plants.getSortedDrawList();
  for (const item of plantList) {
    surfaceObjects.push({
      y: item.y,
      depth: item.plant.depth,
      type: 'plant',
      data: item,
    });
  }

  // Animals
  const animalList = Animals.getSortedDrawList();
  for (const item of animalList) {
    surfaceObjects.push({
      y: item.y,
      depth: item.animal.depth,
      type: 'animal',
      data: item,
    });
  }

  // Decorations
  const decoList = Decorations.getSortedDrawList();
  for (const item of decoList) {
    surfaceObjects.push({
      y: item.y,
      depth: item.deco.depth,
      type: 'decoration',
      data: item,
    });
  }

  // 5. Sort by depth (furthest first = smallest depth = near horizon)
  surfaceObjects.sort((a, b) => a.depth - b.depth);

  // 6. Draw each object back-to-front
  for (const obj of surfaceObjects) {
    switch (obj.type) {
      case 'plant':
        Plants.drawPlant(ctx, obj.data.plant, obj.data.x, obj.data.y, obj.data.scale);
        break;
      case 'animal':
        Animals.drawAnimal(ctx, obj.data.animal, obj.data.x, obj.data.y, obj.data.scale);
        break;
      case 'decoration':
        Decorations.drawDecoration(ctx, obj.data.deco, obj.data.x, obj.data.y, obj.data.scale);
        break;
    }
  }

  // Plant placement hints (on top of ground objects)
  Plants.drawPlacementHints(ctx);

  // 7. Shooting stars & water droplet (in sky, on top of everything below)
  ShootingStars.draw(ctx);

  // 8. Gift stars
  Rewards.draw(ctx);

  // 9. Particles on top of everything
  Particles.draw(ctx);

  // 10. Long-press removal progress indicator (plants or decorations)
  if ((_longPressPlant || _longPressDeco) && !_longPressFired && Input.isDown) {
    const elapsed = performance.now() - _longPressStartTime;
    const progress = Math.min(1, elapsed / LONG_PRESS_DURATION);
    const target = _longPressPlant || _longPressDeco;
    const pos = Camera.worldToScreen(target.angle, target.depth);
    if (pos.visible) {
      const radius = 200 * pos.scale;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - radius * 0.5, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();
      // Pulsing red tint on the area
      ctx.fillStyle = `rgba(255, 80, 80, ${0.1 + progress * 0.15})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - radius * 0.5, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Ambient sparkle for bloomed plants
  for (const item of plantList) {
    if (item.plant.growthStage >= 4) {
      const colors = PlantTypes[item.plant.typeIndex].bloomColors;
      Particles.emitAmbient(item.x, item.y, colors[0]);
    }
  }
}

// --- Game Loop ---
function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  if (Game.lastTime === 0) Game.lastTime = timestamp;
  const rawDt = (timestamp - Game.lastTime) / 1000;
  Game.deltaTime = Math.min(rawDt, 0.1); // cap at 100ms
  Game.lastTime = timestamp;
  Game.time += Game.deltaTime;

  const dt = Game.deltaTime;

  ctx.clearRect(0, 0, Game.width, Game.height);

  if (Game.state === 'title') {
    Starfield.update(dt);
    drawTitleScreen(ctx);
  } else if (Game.state === 'transition') {
    Game.transitionTimer += dt;
    Starfield.update(dt);
    drawTransition(ctx);
    if (Game.transitionTimer >= Game.transitionDuration) {
      Game.state = 'playing';
    }
  } else if (Game.state === 'playing') {
    // Update all systems
    Camera.update(dt);
    Starfield.update(dt);
    ShootingStars.update(dt);
    Plants.update(dt);
    Animals.update(dt);
    Rewards.update(dt);
    Particles.update(dt);

    // Check long-press removal (plants or decorations, 2 seconds)
    if ((_longPressPlant || _longPressDeco) && !_longPressFired && Input.isDown) {
      const elapsed = performance.now() - _longPressStartTime;
      if (elapsed >= LONG_PRESS_DURATION) {
        if (_longPressPlant) {
          const pos = Camera.worldToScreen(_longPressPlant.angle, _longPressPlant.depth);
          if (pos.visible) {
            Particles.emit(pos.x, pos.y, {
              count: 12,
              colors: ['#88ff88', '#ffffff', '#aaddaa'],
              speed: 60,
              life: 0.8,
              size: 4,
              gravity: 20,
              spread: Math.PI * 2,
              angle: -Math.PI / 2,
            });
          }
          Plants.removePlant(_longPressPlant);
        } else if (_longPressDeco) {
          const pos = Camera.worldToScreen(_longPressDeco.angle, _longPressDeco.depth);
          if (pos.visible) {
            Particles.emit(pos.x, pos.y, {
              count: 12,
              colors: ['#ffaacc', '#ffffff', '#ddbbff'],
              speed: 60,
              life: 0.8,
              size: 4,
              gravity: 20,
              spread: Math.PI * 2,
              angle: -Math.PI / 2,
            });
          }
          Decorations.removeDecoration(_longPressDeco);
        }
        _longPressFired = true;
        _longPressPlant = null;
        _longPressDeco = null;
        autoSave();
      }
    }

    // Draw
    drawPlaying(ctx);
  }
}

// --- Input Wiring ---
// Interaction state for drag-animal and long-press-to-remove
let _draggingAnimal = null;      // animal being dragged, or null
let _draggingAnimalOffX = 0;     // screen offset from animal center to touch point
let _draggingAnimalOffY = 0;
let _longPressPlant = null;      // plant under finger for long-press removal
let _longPressDeco = null;       // decoration under finger for long-press removal
let _longPressStartTime = 0;     // performance.now() when press started
let _longPressStartX = 0;
let _longPressStartY = 0;
let _longPressFired = false;     // true once the removal has triggered
const LONG_PRESS_DURATION = 2000;  // ms
const LONG_PRESS_MOVE_THRESHOLD = 20; // px — cancel if finger moves more than this

function initInput() {
  // TAP
  Input.onTap = (x, y) => {
    GameAudio.ensure();

    if (Game.state === 'title') {
      Game.state = 'transition';
      Game.transitionTimer = 0;
      GameAudio.init();
      return;
    }

    if (Game.state !== 'playing') return;

    // If long-press already fired, consume this tap
    if (_longPressFired) return;

    // Priority 1: Gift stars
    if (Rewards.handleTap(x, y)) {
      autoSave();
      UI.refreshGardenTray();
      return;
    }

    // Priority 2: Animals (show accessory tray)
    const animal = Animals.handleTap(x, y);
    if (animal) {
      UI.showAccessoryTray(animal);
      return;
    }

    // Priority 3: Place decoration
    if (UI.selectedDecoration && Camera.isOnGround(x, y)) {
      const world = Camera.screenToWorld(x, y);
      if (world) {
        Decorations.placeDecoration(UI.selectedDecoration, world.angle, world.depth);
        GameAudio.playDecorationPlace();
        UI.selectedDecoration = null;
        UI.refreshGardenTray();
        autoSave();
      }
      return;
    }

    // Priority 4: Plant seed
    if (Plants.selectedType >= 0 && Camera.isOnGround(x, y)) {
      const world = Camera.screenToWorld(x, y);
      if (world) {
        Plants.addPlant(Plants.selectedType, world.angle, world.depth);
        GameAudio.playPlantPop();
        autoSave();
      }
      return;
    }

    // Priority 5: Tap on sky shooting star
    if (Camera.isInSky(x, y)) {
      const starIdx = ShootingStars.hitTest(x, y);
      if (starIdx >= 0) {
        ShootingStars.catchStar(starIdx);
      }
    }
  };

  // DRAG START
  Input.onDragStart = (x, y) => {
    if (Game.state !== 'playing') return;

    _draggingAnimal = null;
    _longPressPlant = null;
    _longPressDeco = null;
    _longPressFired = false;

    // Priority 1: Try to catch a shooting star
    const starIdx = ShootingStars.hitTest(x, y);
    if (starIdx >= 0) {
      ShootingStars.catchStar(starIdx);
      return;
    }

    // Priority 2: Try to grab an animal for dragging
    const animal = Animals.findAnimalAt(x, y);
    if (animal) {
      _draggingAnimal = animal;
      const pos = Camera.worldToScreen(animal.angle, animal.depth);
      _draggingAnimalOffX = pos.x - x;
      _draggingAnimalOffY = pos.y - y;
      return;
    }

    // Priority 3: Start long-press tracking on a plant or decoration
    const plant = Plants.findPlantAt(x, y);
    if (plant) {
      _longPressPlant = plant;
      _longPressStartTime = performance.now();
      _longPressStartX = x;
      _longPressStartY = y;
      return;
    }

    const deco = Decorations.findDecorationAt(x, y);
    if (deco) {
      _longPressDeco = deco;
      _longPressStartTime = performance.now();
      _longPressStartX = x;
      _longPressStartY = y;
    }
  };

  // DRAG MOVE
  Input.onDragMove = (x, y, dx, dy) => {
    if (Game.state !== 'playing') return;

    if (ShootingStars.isDraggingDroplet) {
      ShootingStars.moveDroplet(x, y);
    } else if (_draggingAnimal) {
      // Move the animal to follow the finger (convert screen to world)
      const targetX = x + _draggingAnimalOffX;
      const targetY = y + _draggingAnimalOffY;
      if (Camera.isOnGround(targetX, targetY)) {
        const world = Camera.screenToWorld(targetX, targetY);
        if (world) {
          Animals.moveAnimalTo(_draggingAnimal, world.angle, world.depth);
        }
      }
    } else {
      // Cancel long-press if finger moved too far
      if (_longPressPlant || _longPressDeco) {
        const ldx = x - _longPressStartX;
        const ldy = y - _longPressStartY;
        if (Math.sqrt(ldx * ldx + ldy * ldy) > LONG_PRESS_MOVE_THRESHOLD) {
          _longPressPlant = null;
          _longPressDeco = null;
        }
      }
      // Rotate camera
      Camera.spin(-dx);
    }
  };

  // DRAG END
  Input.onDragEnd = (x, y) => {
    if (Game.state !== 'playing') return;

    if (ShootingStars.isDraggingDroplet) {
      const result = ShootingStars.releaseDroplet(x, y);
      if (result && result.plant) {
        const watered = Plants.waterPlant(result.plant);
        if (watered) {
          // Check if plant just bloomed (reached stage 4)
          if (result.plant.growthStage >= 4) {
            // Bloom effects
            const pos = Camera.worldToScreen(result.plant.angle, result.plant.depth);
            const bloomColors = PlantTypes[result.plant.typeIndex].bloomColors;
            Particles.emitBloom(pos.x, pos.y, bloomColors);
            GameAudio.playBloom(result.plant.typeIndex);

            // Special effects for mushroom spores
            if (result.plant.typeIndex === 3) {
              Particles.emitSpores(pos.x, pos.y);
            }
            // Special effects for firework flower sparks
            if (result.plant.typeIndex === 6) {
              Particles.emitSparks(pos.x, pos.y);
            }

            Rewards.onBloom();
            UI.refreshGardenTray();
          } else {
            // Growth sound (not bloom)
            GameAudio.playGrowth();
          }
          autoSave();
        }
      }
    } else if (_draggingAnimal) {
      // Place animal at final position
      const targetX = x + _draggingAnimalOffX;
      const targetY = y + _draggingAnimalOffY;
      if (Camera.isOnGround(targetX, targetY)) {
        const world = Camera.screenToWorld(targetX, targetY);
        if (world) {
          Animals.moveAnimalTo(_draggingAnimal, world.angle, world.depth);
        }
      }
      _draggingAnimal = null;
      autoSave();
    }

    // Clear long-press state
    _longPressPlant = null;
    _longPressDeco = null;
    _longPressFired = false;
  };

  // SWIPE
  Input.onSwipe = (dx, dy) => {
    if (Game.state !== 'playing') return;
    // Don't swipe while dragging an animal
    if (_draggingAnimal) return;
    Camera.spin(-dx * 2);
    GameAudio.playSpinWhoosh(Math.abs(dx));
  };
}

// --- Init ---
function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize systems
  Starfield.init(Game.width, Game.height);
  PlanetSurface.init(Game.width, Game.height);
  Input.init(canvas);
  initInput();

  // Load save
  if (Storage.hasSave()) {
    Storage.load();
  }

  UI.init();

  // Start game loop
  requestAnimationFrame(gameLoop);
}

init();
