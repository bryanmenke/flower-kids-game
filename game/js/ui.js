// UI - Garden tray, accessory tray, overlays

const UI = {
  trayElement: null,
  trayItems: [],
  currentTray: 'garden', // 'garden' | 'accessory'

  // Accessory tray
  accessoryTrayElement: null,
  accessoryTrayItems: [],
  selectedAnimal: null,
  selectedDecoration: null,

  init() {
    this.createGardenTray();
    this.createAccessoryTray();
  },

  createGardenTray() {
    const overlay = document.getElementById('ui-overlay');

    this.trayElement = document.createElement('div');
    this.trayElement.id = 'garden-tray';
    this.trayElement.className = 'tray';
    overlay.appendChild(this.trayElement);

    this.refreshGardenTray();
  },

  refreshGardenTray() {
    // Clear and rebuild with plants + unlocked decorations
    this.trayElement.innerHTML = '';
    this.trayItems = [];

    // Plant buttons
    PlantTypes.forEach((type, index) => {
      const btn = document.createElement('div');
      btn.className = 'tray-item';
      btn.dataset.type = 'plant';
      btn.dataset.index = index;

      const iconCanvas = document.createElement('canvas');
      const iconSize = 70;
      iconCanvas.width = iconSize;
      iconCanvas.height = iconSize;
      const iconCtx = iconCanvas.getContext('2d');
      type.icon(iconCtx, iconSize / 2, iconSize / 2, iconSize * 0.45);
      btn.appendChild(iconCanvas);

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectPlantType(index);
      });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectPlantType(index);
      });

      this.trayElement.appendChild(btn);
      this.trayItems.push(btn);
    });

    // Unlocked decoration buttons
    const decos = Rewards.getUnlockedByType('decoration');
    decos.forEach((deco) => {
      const btn = document.createElement('div');
      btn.className = 'tray-item';
      btn.dataset.type = 'decoration';
      btn.dataset.id = deco.id;

      const iconCanvas = document.createElement('canvas');
      const iconSize = 70;
      iconCanvas.width = iconSize;
      iconCanvas.height = iconSize;
      const iconCtx = iconCanvas.getContext('2d');
      const def = DecorationDefs[deco.id];
      if (def) {
        def.draw(iconCtx, iconSize / 2, iconSize / 2, iconSize * 0.8);
      }
      btn.appendChild(iconCanvas);

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectDecoration(deco.id);
      });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectDecoration(deco.id);
      });

      this.trayElement.appendChild(btn);
      this.trayItems.push(btn);
    });
  },

  selectPlantType(index) {
    GameAudio.ensure();
    this.selectedDecoration = null;
    // Toggle selection
    if (Plants.selectedType === index) {
      Plants.selectedType = -1;
    } else {
      Plants.selectedType = index;
    }

    // Update visual selection
    this.trayItems.forEach((btn) => {
      btn.classList.toggle('selected',
        (btn.dataset.type === 'plant' && parseInt(btn.dataset.index) === Plants.selectedType) ||
        (btn.dataset.type === 'decoration' && btn.dataset.id === this.selectedDecoration)
      );
    });
  },

  selectDecoration(decoId) {
    GameAudio.ensure();
    Plants.selectedType = -1;
    if (this.selectedDecoration === decoId) {
      this.selectedDecoration = null;
    } else {
      this.selectedDecoration = decoId;
    }
    this.trayItems.forEach(btn => {
      btn.classList.toggle('selected',
        (btn.dataset.type === 'decoration' && btn.dataset.id === this.selectedDecoration) ||
        (btn.dataset.type === 'plant' && parseInt(btn.dataset.index) === Plants.selectedType)
      );
    });
  },

  // --- Accessory Tray ---

  createAccessoryTray() {
    const overlay = document.getElementById('ui-overlay');

    this.accessoryTrayElement = document.createElement('div');
    this.accessoryTrayElement.id = 'accessory-tray';
    this.accessoryTrayElement.className = 'tray';
    this.accessoryTrayElement.style.display = 'none';
    overlay.appendChild(this.accessoryTrayElement);
  },

  showAccessoryTray(animal) {
    this.selectedAnimal = animal;
    this.hideGardenTray();

    // Clear existing items
    this.accessoryTrayElement.innerHTML = '';
    this.accessoryTrayItems = [];

    // Add unlocked accessories
    const accessories = Rewards.getUnlockedByType('accessory');
    for (const acc of accessories) {
      const btn = document.createElement('div');
      btn.className = 'tray-item';
      if (animal.accessory === acc.id) btn.classList.add('selected');

      const iconCanvas = document.createElement('canvas');
      const iconSize = 70;
      iconCanvas.width = iconSize;
      iconCanvas.height = iconSize;
      const iconCtx = iconCanvas.getContext('2d');
      const def = AccessoryDefs[acc.id];
      if (def) {
        def.draw(iconCtx, iconSize / 2, iconSize / 2, iconSize * 0.8);
      }
      btn.appendChild(iconCanvas);

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.equipAccessory(acc.id);
      });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.equipAccessory(acc.id);
      });

      this.accessoryTrayElement.appendChild(btn);
      this.accessoryTrayItems.push({ btn, id: acc.id });
    }

    // Show empty tray if no accessories unlocked
    if (accessories.length === 0) {
      const empty = document.createElement('div');
      empty.style.color = 'rgba(255,255,255,0.4)';
      empty.style.fontSize = '14px';
      empty.style.textAlign = 'center';
      empty.style.width = '100%';
      empty.textContent = '';
      this.accessoryTrayElement.appendChild(empty);
    }

    this.accessoryTrayElement.style.display = 'flex';
    this.currentTray = 'accessory';
  },

  hideAccessoryTray() {
    if (this.accessoryTrayElement) this.accessoryTrayElement.style.display = 'none';
    this.selectedAnimal = null;
    this.showGardenTray();
  },

  equipAccessory(accId) {
    if (!this.selectedAnimal) return;
    // Toggle: if same accessory, remove it
    if (this.selectedAnimal.accessory === accId) {
      this.selectedAnimal.accessory = null;
    } else {
      this.selectedAnimal.accessory = accId;
      GameAudio.playAccessoryPlace();
    }
    // Refresh tray selection state
    this.accessoryTrayItems.forEach(item => {
      item.btn.classList.toggle('selected', this.selectedAnimal && this.selectedAnimal.accessory === item.id);
    });
  },

  // Show/hide trays
  showGardenTray() {
    if (this.trayElement) this.trayElement.style.display = 'flex';
    this.currentTray = 'garden';
  },

  hideGardenTray() {
    if (this.trayElement) this.trayElement.style.display = 'none';
  },
};
