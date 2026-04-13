// UI - Garden tray, accessory tray, parent reset button
// Depends on: Plants, PlantTypes, Rewards, RewardPool, DecorationDefs, DecorationIds,
//             AnimalRenderer, GameAudio, Storage

const UI = {
  trayElement: null,
  accessoryTrayElement: null,
  currentTray: 'garden',    // 'garden' | 'accessory'
  selectedAnimal: null,     // animal object for accessory equip
  selectedDecoration: null, // decoration id string for placement

  init() {
    this.createGardenTray();
    this.createAccessoryTray();
    this.createResetButton();
  },

  createGardenTray() {
    const overlay = document.getElementById('ui-overlay');
    const tray = document.createElement('div');
    tray.id = 'garden-tray';
    tray.className = 'tray';
    overlay.appendChild(tray);
    this.trayElement = tray;
    this.refreshGardenTray();
  },

  refreshGardenTray() {
    const tray = this.trayElement;
    tray.innerHTML = '';

    // Plant type buttons
    for (let i = 0; i < PlantTypes.length; i++) {
      const pType = PlantTypes[i];
      // Skip rare types that aren't unlocked
      if (pType.seedId && !Rewards.isUnlocked(pType.seedId)) continue;

      const btn = document.createElement('div');
      btn.className = 'tray-item';
      if (Plants.selectedType === i) btn.classList.add('selected');

      // Draw plant icon on a mini canvas
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.translate(60, 90);
      // Draw bloom stage (stage 4) as icon
      PlantRenderer.draw(mCtx, i, 4, 1.0, 1.2, 0);
      btn.appendChild(miniCanvas);

      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        GameAudio.ensure();
        this.selectPlantType(i);
      });

      tray.appendChild(btn);
    }

    // Unlocked decoration buttons
    const unlockedDecos = Rewards.getUnlockedByType('decoration');
    for (const reward of unlockedDecos) {
      const decoId = reward.itemId;
      const def = DecorationDefs[decoId];
      if (!def) continue;

      const btn = document.createElement('div');
      btn.className = 'tray-item';
      if (this.selectedDecoration === decoId) btn.classList.add('selected');

      // Draw decoration icon
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.translate(60, 80);
      def.draw(mCtx, 60, 0);
      btn.appendChild(miniCanvas);

      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        GameAudio.ensure();
        this.selectDecoration(decoId);
      });

      tray.appendChild(btn);
    }
  },

  selectPlantType(index) {
    if (Plants.selectedType === index) {
      Plants.selectedType = -1; // deselect
    } else {
      Plants.selectedType = index;
      this.selectedDecoration = null;
    }
    this.refreshGardenTray();
  },

  selectDecoration(decoId) {
    if (this.selectedDecoration === decoId) {
      this.selectedDecoration = null; // deselect
    } else {
      this.selectedDecoration = decoId;
      Plants.selectedType = -1;
    }
    this.refreshGardenTray();
  },

  createAccessoryTray() {
    const overlay = document.getElementById('ui-overlay');
    const tray = document.createElement('div');
    tray.id = 'accessory-tray';
    tray.className = 'tray';
    tray.style.display = 'none';
    overlay.appendChild(tray);
    this.accessoryTrayElement = tray;
  },

  showAccessoryTray(animal) {
    this.selectedAnimal = animal;
    this.currentTray = 'accessory';
    this.trayElement.style.display = 'none';
    this.accessoryTrayElement.style.display = '';
    this.accessoryTrayElement.innerHTML = '';

    // "Remove accessory" button if animal has one
    if (animal.accessory) {
      const removeBtn = document.createElement('div');
      removeBtn.className = 'tray-item';
      removeBtn.style.borderColor = 'rgba(255, 100, 100, 0.5)';
      // X icon
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.strokeStyle = '#ff6666';
      mCtx.lineWidth = 6;
      mCtx.lineCap = 'round';
      mCtx.beginPath();
      mCtx.moveTo(40, 40);
      mCtx.lineTo(80, 80);
      mCtx.moveTo(80, 40);
      mCtx.lineTo(40, 80);
      mCtx.stroke();
      removeBtn.appendChild(miniCanvas);

      removeBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.equipAccessory(null);
      });
      this.accessoryTrayElement.appendChild(removeBtn);
    }

    // Unlocked accessories
    const unlockedAcc = Rewards.getUnlockedByType('accessory');
    const accessoryIds = ['crown', 'bow', 'sunglasses', 'wreath', 'wings', 'cape',
                          'scarf', 'collar', 'tophat', 'butterfly', 'backpack', 'halo'];

    for (const accId of accessoryIds) {
      // Check if unlocked
      const isUnlocked = unlockedAcc.some(r => r.itemId === accId);
      if (!isUnlocked) continue;

      const btn = document.createElement('div');
      btn.className = 'tray-item';
      if (animal.accessory === accId) btn.classList.add('selected');

      // Draw accessory icon
      const miniCanvas = document.createElement('canvas');
      miniCanvas.width = 120;
      miniCanvas.height = 120;
      const mCtx = miniCanvas.getContext('2d');
      mCtx.translate(60, 60);
      // Draw the accessory at a reasonable icon size
      AnimalRenderer.drawAccessory(mCtx, animal.typeIndex, accId, 80, 0);
      btn.appendChild(miniCanvas);

      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.equipAccessory(accId);
      });

      this.accessoryTrayElement.appendChild(btn);
    }

    // Close button (tap outside or back button)
    const closeBtn = document.createElement('div');
    closeBtn.className = 'tray-item';
    closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 120;
    miniCanvas.height = 120;
    const mCtx = miniCanvas.getContext('2d');
    mCtx.fillStyle = '#aaaaaa';
    mCtx.font = '48px sans-serif';
    mCtx.textAlign = 'center';
    mCtx.textBaseline = 'middle';
    mCtx.fillText('\u2190', 60, 60); // left arrow
    closeBtn.appendChild(miniCanvas);

    closeBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.hideAccessoryTray();
    });
    this.accessoryTrayElement.appendChild(closeBtn);
  },

  hideAccessoryTray() {
    this.selectedAnimal = null;
    this.currentTray = 'garden';
    this.accessoryTrayElement.style.display = 'none';
    this.trayElement.style.display = '';
  },

  equipAccessory(accId) {
    if (!this.selectedAnimal) return;
    if (this.selectedAnimal.accessory === accId) {
      // Toggle off
      this.selectedAnimal.accessory = null;
    } else {
      this.selectedAnimal.accessory = accId;
    }
    GameAudio.playAccessoryPlace();
    Storage.save();
    // Refresh the accessory tray to update selection state
    this.showAccessoryTray(this.selectedAnimal);
  },

  showGardenTray() {
    this.trayElement.style.display = '';
  },

  hideGardenTray() {
    this.trayElement.style.display = 'none';
  },

  createResetButton() {
    const overlay = document.getElementById('ui-overlay');
    const btn = document.createElement('div');
    btn.id = 'reset-btn';
    btn.style.cssText = 'position:absolute;top:8px;right:8px;width:40px;height:40px;opacity:0;z-index:100;';

    let pressTimer = null;
    btn.addEventListener('pointerdown', () => {
      pressTimer = setTimeout(() => {
        if (confirm('Reset garden? All progress will be lost.')) {
          Storage.clearSave();
          window.location.reload();
        }
      }, 2000);
    });
    btn.addEventListener('pointerup', () => clearTimeout(pressTimer));
    btn.addEventListener('pointercancel', () => clearTimeout(pressTimer));
    btn.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    overlay.appendChild(btn);
  },
};
