// Plants - Plant data, growth state machine, placement, hit testing
// Depends on: Camera, PlantRenderer, Game

const PlantTypes = [
  { id: 'roseBush',       name: 'Rose Bush',        bloomColors: ['#cc3355', '#ff6688', '#ee4466', '#ffaacc', '#ffffff'] },
  { id: 'sunflower',      name: 'Sunflower',        bloomColors: ['#ffcc22', '#ffdd44', '#eeaa00', '#ffee66', '#ffffff'] },
  { id: 'tulipCluster',   name: 'Tulip Cluster',    bloomColors: ['#ff2244', '#ffdd00', '#ff69b4', '#9933cc', '#ff6600'] },
  { id: 'daisyPatch',     name: 'Daisy Patch',      bloomColors: ['#ffffff', '#ffff66', '#88dd44', '#ffccee', '#aaeeff'] },
  { id: 'lavender',       name: 'Lavender',         bloomColors: ['#9966cc', '#bb88dd', '#7744aa', '#ddbbff', '#ffffff'] },
  // Rare types — unlocked via seed rewards
  { id: 'rainbowTree',    name: 'Rainbow Tree',     bloomColors: ['#ff4444', '#ff8844', '#ffcc44', '#44cc44', '#4488ff', '#8844cc'], seedId: 'seed_rainbowTree' },
  { id: 'fireworkFlower',  name: 'Firework Flower', bloomColors: ['#ff4422', '#ff8844', '#ffcc22', '#ffffff', '#ffee88'], seedId: 'seed_fireworkFlower' },
];

const Plants = {
  items: [],       // { typeIndex, angle, depth, growthStage, growthProgress, growthAnimating, plantedTime }
  selectedType: -1, // index into PlantTypes, -1 = none

  addPlant(typeIndex, angle, depth) {
    const plant = {
      typeIndex,
      angle,
      depth,
      growthStage: 0,       // 0=seed, 1=sprout, 2=young, 3=mature, 4=bloom
      growthProgress: 1.0,  // start fully "arrived" in seed stage
      growthAnimating: false,
      plantedTime: Game.time,
    };
    this.items.push(plant);
    return plant;
  },

  // Water a plant: advance growth stage, trigger grow animation
  // Returns true if watered, false if already fully bloomed
  waterPlant(plant) {
    if (plant.growthStage >= 4) return false;
    plant.growthStage++;
    plant.growthProgress = 0;
    plant.growthAnimating = true;
    return true;
  },

  // Check if a plant is fully bloomed
  isBloomed(plant) {
    return plant.growthStage >= 4;
  },

  // Count total blooms
  bloomCount() {
    let count = 0;
    for (const p of this.items) {
      if (p.growthStage >= 4) count++;
    }
    return count;
  },

  update(dt) {
    // Animate growth transitions
    for (const plant of this.items) {
      if (plant.growthAnimating) {
        plant.growthProgress += dt * 2.0; // 0.5s to fully animate
        if (plant.growthProgress >= 1.0) {
          plant.growthProgress = 1.0;
          plant.growthAnimating = false;
        }
      }
    }
  },

  // Hit-test: find plant near screen coordinates
  // Returns plant or null. Checks all plants, returns closest to tap.
  findPlantAt(screenX, screenY) {
    let closest = null;
    let closestDist = Infinity;
    for (const plant of this.items) {
      const pos = Camera.worldToScreen(plant.angle, plant.depth);
      if (!pos.visible) continue;
      const hitRadius = 80 * pos.scale;
      const dx = screenX - pos.x;
      const dy = screenY - (pos.y - hitRadius * 0.5); // center hitbox on plant body
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitRadius && dist < closestDist) {
        closest = plant;
        closestDist = dist;
      }
    }
    return closest;
  },

  // Draw all plants, sorted by depth (furthest first)
  // Returns array of { plant, x, y, scale } for depth-sorting in main.js render pipeline
  getSortedDrawList() {
    const list = [];
    for (const plant of this.items) {
      const pos = Camera.worldToScreen(plant.angle, plant.depth);
      if (!pos.visible) continue;
      list.push({ plant, x: pos.x, y: pos.y, scale: pos.scale });
    }
    return list;
  },

  // Draw a single plant at screen position
  drawPlant(ctx, plant, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    PlantRenderer.draw(ctx, plant.typeIndex, plant.growthStage, plant.growthProgress, scale, Game.time);
    ctx.restore();
  },

  // Draw placement hints when a type is selected
  drawPlacementHints(ctx) {
    if (this.selectedType < 0) return;
    const time = Game.time;
    // Show 8 pulsing circles on the ground surface
    for (let i = 0; i < 8; i++) {
      const angle = Camera.rotation + (i / 8 - 0.5) * Camera.visibleArc * 0.7;
      const depth = 0.3 + (i % 3) * 0.2;
      const pos = Camera.worldToScreen(angle, depth);
      if (!pos.visible) continue;
      const pulse = 0.7 + Math.sin(time * 3 + i) * 0.3;
      const radius = 15 * pos.scale * pulse;
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(time * 2 + i * 0.7) * 0.1;
      ctx.fillStyle = '#aaffaa';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
};
