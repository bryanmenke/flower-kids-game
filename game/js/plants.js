// Plants - Plant data, growth state machine, placement, hit testing
// Depends on: Camera, PlantRenderer, Game

const PlantTypes = [
  { id: 'rose',       name: 'Rose',       bloomColors: ['#cc1133','#ff6699','#f5f0e8','#ffcc22','#ff6644','#990022','#ff88bb','#ffaa44','#dd55aa','#eeddff'] },
  { id: 'tulip',      name: 'Tulip',      bloomColors: ['#dd1133','#ffcc00','#ff66aa','#7733bb','#ff6622','#f0e8e0','#ff3366','#ee8844','#44aacc','#aabb44'] },
  { id: 'lily',       name: 'Lily',       bloomColors: ['#ffffff','#ff8866','#ffccaa','#ff55aa','#eedd44','#dd88cc','#ffaa88','#cc99ff','#88ddaa','#ff6666'] },
  { id: 'orchid',     name: 'Orchid',     bloomColors: ['#cc44cc','#ffffff','#ff88dd','#8855cc','#ffaa55','#44bbaa','#ff66aa','#ddaaff','#ff4466','#88ccff'] },
  { id: 'daffodil',   name: 'Daffodil',   bloomColors: ['#ffdd00','#ffffff','#ffaa22','#ffee88','#ff8844','#eeff44','#ffcc55','#ddff88','#ffbb66','#ffffaa'] },
  { id: 'dahlia',     name: 'Dahlia',     bloomColors: ['#dd2255','#ff8844','#ffcc22','#cc44aa','#ff4466','#ee6688','#aa3388','#ff6622','#dd66cc','#ffaadd'] },
  { id: 'hydrangea',  name: 'Hydrangea',  bloomColors: ['#6688cc','#cc6699','#88bbdd','#aa88cc','#ddaacc','#5599bb','#7766aa','#99ccdd','#bb88bb','#aaddee'] },
  { id: 'peony',      name: 'Peony',      bloomColors: ['#ff88aa','#ffccdd','#ff5577','#ee99bb','#ffaacc','#dd6688','#ff77aa','#ffddee','#cc5588','#ffbbcc'] },
  { id: 'daisy',      name: 'Daisy',      bloomColors: ['#ffffff','#ffaacc','#ccaaee','#fff8aa','#aaddff','#ffddcc','#ddffaa','#ffccee','#bbddff','#ffffcc'] },
  { id: 'sunflower',  name: 'Sunflower',  bloomColors: ['#ffcc00','#ff9922','#fff44f','#cc3300','#fff8e0','#ff7733','#ffdd44','#eeaa00','#ffbb22','#ddcc00'] },
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
      colorIndex: Math.floor(Math.random() * 10), // random color variant 0-5
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

  // Remove a plant from the garden
  removePlant(plant) {
    const idx = this.items.indexOf(plant);
    if (idx >= 0) this.items.splice(idx, 1);
  },

  // Hit-test: find plant near screen coordinates
  // Returns plant or null. Checks all plants, returns closest to tap.
  findPlantAt(screenX, screenY) {
    let closest = null;
    let closestDist = Infinity;
    for (const plant of this.items) {
      const pos = Camera.worldToScreen(plant.angle, plant.depth);
      if (!pos.visible) continue;
      const hitRadius = 200 * pos.scale;
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
    PlantRenderer.draw(ctx, plant.typeIndex, plant.growthStage, plant.growthProgress, scale, Game.time, plant.colorIndex);
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
      const radius = 80 * pos.scale * pulse;
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
