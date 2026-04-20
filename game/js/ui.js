// UI - Tabbed menu with flower/decoration/accessory sub-menus, parent reset button
// Depends on: Plants, PlantTypes, PlantRenderer, Rewards, RewardPool,
//             DecorationDefs, DecorationIds, AnimalRenderer, GameAudio, Storage

const UI = {
  tabBarElement: null,
  subTrayElement: null,
  activeTab: null,           // 'flowers' | 'decorations' | 'accessories' | null
  selectedAnimal: null,      // animal object for accessory equip
  selectedDecoration: null,  // decoration id string for placement

  init() {
    this.createTabBar();
    this.createSubTray();
    this.createResetButton();
  },

  // --- Tab Bar (always visible at bottom) ---
  createTabBar() {
    var overlay = document.getElementById('ui-overlay');
    var bar = document.createElement('div');
    bar.id = 'tab-bar';
    overlay.appendChild(bar);
    this.tabBarElement = bar;
    this._renderTabBar();
  },

  _renderTabBar() {
    var bar = this.tabBarElement;
    bar.innerHTML = '';
    var self = this;
    var tabs = [
      { id: 'flowers', drawIcon: this._drawFlowerIcon },
      { id: 'decorations', drawIcon: this._drawDecorationIcon },
      { id: 'accessories', drawIcon: this._drawAccessoryIcon },
    ];

    for (var i = 0; i < tabs.length; i++) {
      (function(tab) {
        var btn = document.createElement('div');
        btn.className = 'tab-btn';
        if (self.activeTab === tab.id) btn.classList.add('active');

        var c = document.createElement('canvas');
        c.width = 142;
        c.height = 142;
        c.style.width = '71px';
        c.style.height = '71px';
        var cx = c.getContext('2d');
        tab.drawIcon(cx, 71, 71);
        btn.appendChild(c);

        btn.addEventListener('pointerdown', function(e) {
          e.stopPropagation();
          GameAudio.ensure();
          if (self.activeTab === tab.id) {
            // Toggle off
            self.activeTab = null;
            self.selectedAnimal = null;
          } else {
            // If switching to accessories without an animal, just show the tab
            self.activeTab = tab.id;
            if (tab.id !== 'accessories') self.selectedAnimal = null;
          }
          self._renderTabBar();
          self._renderSubTray();
        });

        bar.appendChild(btn);
      })(tabs[i]);
    }
  },

  // --- Sub Tray (above tab bar, shows items for active tab) ---
  createSubTray() {
    var overlay = document.getElementById('ui-overlay');
    var tray = document.createElement('div');
    tray.id = 'sub-tray';
    overlay.appendChild(tray);
    this.subTrayElement = tray;
    this._renderSubTray();
  },

  _renderSubTray() {
    var tray = this.subTrayElement;
    tray.innerHTML = '';

    if (!this.activeTab) {
      tray.style.display = 'none';
      return;
    }
    tray.style.display = '';

    if (this.activeTab === 'flowers') {
      this._renderFlowerItems(tray);
    } else if (this.activeTab === 'decorations') {
      this._renderDecorationItems(tray);
    } else if (this.activeTab === 'accessories') {
      this._renderAccessoryItems(tray);
    }
  },

  // --- Flower Sub-Menu ---
  _renderFlowerItems(tray) {
    var self = this;
    for (var i = 0; i < PlantTypes.length; i++) {
      (function(idx) {
        var pType = PlantTypes[idx];
        if (pType.seedId && !Rewards.isUnlocked(pType.seedId)) return;

        var btn = document.createElement('div');
        btn.className = 'tray-item';
        if (Plants.selectedType === idx) btn.classList.add('selected');

        var c = document.createElement('canvas');
        c.width = 142;
        c.height = 142;
        c.style.width = '71px';
        c.style.height = '71px';
        var cx = c.getContext('2d');
        // Clip to canvas so stem is hidden, only bloom visible
        cx.save();
        cx.beginPath();
        cx.rect(0, 0, 142, 142);
        cx.clip();
        cx.translate(71, 135);
        PlantRenderer.draw(cx, idx, 4, 1.0, 0.51, 0, 0);
        cx.restore();
        btn.appendChild(c);

        btn.addEventListener('pointerdown', function(e) {
          e.stopPropagation();
          GameAudio.ensure();
          self.selectPlantType(idx);
        });

        tray.appendChild(btn);
      })(i);
    }
  },

  // --- Decoration Sub-Menu ---
  _renderDecorationItems(tray) {
    var self = this;
    var unlockedDecos = Rewards.getUnlockedByType('decoration');
    for (var i = 0; i < unlockedDecos.length; i++) {
      (function(reward) {
        var decoId = reward.itemId;
        var def = DecorationDefs[decoId];
        if (!def) return;

        var btn = document.createElement('div');
        btn.className = 'tray-item';
        if (self.selectedDecoration === decoId) btn.classList.add('selected');

        var c = document.createElement('canvas');
        c.width = 142;
        c.height = 142;
        c.style.width = '71px';
        c.style.height = '71px';
        var cx = c.getContext('2d');
        cx.translate(71, 120);
        def.draw(cx, 109, 0);
        btn.appendChild(c);

        btn.addEventListener('pointerdown', function(e) {
          e.stopPropagation();
          GameAudio.ensure();
          self.selectDecoration(decoId);
        });

        tray.appendChild(btn);
      })(unlockedDecos[i]);
    }

    if (unlockedDecos.length === 0) {
      // Show placeholder message (subtle visual, no text)
      var empty = document.createElement('div');
      empty.className = 'tray-item tray-empty';
      var c = document.createElement('canvas');
      c.width = 142;
      c.height = 142;
      c.style.width = '71px';
      c.style.height = '71px';
      var cx = c.getContext('2d');
      // Draw a faded gift star icon to hint "earn rewards"
      cx.globalAlpha = 0.2;
      cx.fillStyle = '#ff44aa';
      cx.beginPath();
      for (var j = 0; j < 5; j++) {
        var a = (j / 5) * Math.PI * 2 - Math.PI / 2;
        var r = 61;
        var ri = 27;
        cx.lineTo(71 + Math.cos(a) * r, 71 + Math.sin(a) * r);
        var a2 = a + Math.PI / 5;
        cx.lineTo(71 + Math.cos(a2) * ri, 71 + Math.sin(a2) * ri);
      }
      cx.closePath();
      cx.fill();
      cx.globalAlpha = 1;
      empty.appendChild(c);
      tray.appendChild(empty);
    }
  },

  // --- Accessory Sub-Menu ---
  _renderAccessoryItems(tray) {
    var self = this;
    var animal = this.selectedAnimal;

    if (!animal) {
      // No animal selected — show hint (paw icon, faded)
      var hint = document.createElement('div');
      hint.className = 'tray-item tray-empty';
      var c = document.createElement('canvas');
      c.width = 142;
      c.height = 142;
      c.style.width = '71px';
      c.style.height = '71px';
      var cx = c.getContext('2d');
      cx.globalAlpha = 0.2;
      this._drawPawPrint(cx, 71, 71, 61);
      cx.globalAlpha = 1;
      hint.appendChild(c);
      tray.appendChild(hint);
      return;
    }

    // "Remove accessory" button if animal has one
    if (animal.accessory) {
      var removeBtn = document.createElement('div');
      removeBtn.className = 'tray-item tray-remove';
      var c = document.createElement('canvas');
      c.width = 142;
      c.height = 142;
      c.style.width = '71px';
      c.style.height = '71px';
      var cx = c.getContext('2d');
      cx.strokeStyle = '#ff6666';
      cx.lineWidth = 10;
      cx.lineCap = 'round';
      cx.beginPath();
      cx.moveTo(32, 32);
      cx.lineTo(110, 110);
      cx.moveTo(110, 32);
      cx.lineTo(32, 110);
      cx.stroke();
      removeBtn.appendChild(c);

      removeBtn.addEventListener('pointerdown', function(e) {
        e.stopPropagation();
        self.equipAccessory(null);
      });
      tray.appendChild(removeBtn);
    }

    // Unlocked accessories
    var unlockedAcc = Rewards.getUnlockedByType('accessory');
    var accessoryIds = ['crown', 'bow', 'sunglasses', 'wreath', 'wings', 'cape',
                        'scarf', 'collar', 'tophat', 'butterfly', 'backpack', 'halo'];

    for (var i = 0; i < accessoryIds.length; i++) {
      (function(accId) {
        var isUnlocked = unlockedAcc.some(function(r) { return r.itemId === accId; });
        if (!isUnlocked) return;

        var btn = document.createElement('div');
        btn.className = 'tray-item';
        if (animal.accessory === accId) btn.classList.add('selected');

        var c = document.createElement('canvas');
        c.width = 142;
        c.height = 142;
        c.style.width = '71px';
        c.style.height = '71px';
        var cx = c.getContext('2d');
        cx.translate(71, 71);
        AnimalRenderer.drawAccessory(cx, animal.typeIndex, accId, 170, 0);
        btn.appendChild(c);

        btn.addEventListener('pointerdown', function(e) {
          e.stopPropagation();
          self.equipAccessory(accId);
        });

        tray.appendChild(btn);
      })(accessoryIds[i]);
    }

    // Back button
    var closeBtn = document.createElement('div');
    closeBtn.className = 'tray-item tray-back';
    var bc = document.createElement('canvas');
    bc.width = 142;
    bc.height = 142;
    bc.style.width = '71px';
    bc.style.height = '71px';
    var bx = bc.getContext('2d');
    // Draw a left-pointing arrow
    bx.strokeStyle = '#aaaaaa';
    bx.lineWidth = 12;
    bx.lineCap = 'round';
    bx.lineJoin = 'round';
    bx.beginPath();
    bx.moveTo(95, 32);
    bx.lineTo(47, 71);
    bx.lineTo(95, 110);
    bx.stroke();
    closeBtn.appendChild(bc);

    closeBtn.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
      self.hideAccessoryTray();
    });
    tray.appendChild(closeBtn);
  },

  selectPlantType(index) {
    if (Plants.selectedType === index) {
      Plants.selectedType = -1;
    } else {
      Plants.selectedType = index;
      this.selectedDecoration = null;
    }
    this._renderSubTray();
  },

  selectDecoration(decoId) {
    if (this.selectedDecoration === decoId) {
      this.selectedDecoration = null;
    } else {
      this.selectedDecoration = decoId;
      Plants.selectedType = -1;
    }
    this._renderSubTray();
  },

  showAccessoryTray(animal) {
    this.selectedAnimal = animal;
    this.activeTab = 'accessories';
    this._renderTabBar();
    this._renderSubTray();
  },

  hideAccessoryTray() {
    this.selectedAnimal = null;
    this.activeTab = null;
    this._renderTabBar();
    this._renderSubTray();
  },

  equipAccessory(accId) {
    if (!this.selectedAnimal) return;
    if (this.selectedAnimal.accessory === accId) {
      this.selectedAnimal.accessory = null;
    } else {
      this.selectedAnimal.accessory = accId;
    }
    GameAudio.playAccessoryPlace();
    Storage.save();
    this._renderSubTray();
  },

  // Called after game state changes (bloom, reward unlock, etc.)
  refreshGardenTray() {
    this._renderSubTray();
  },

  showGardenTray() {
    // no-op for compatibility
  },

  hideGardenTray() {
    // no-op for compatibility
  },

  // --- Tab Icon Drawing Functions ---

  _drawFlowerIcon(ctx, cx, cy) {
    // Simple 5-petal flower
    var petalR = 32;
    var centerR = 16;
    // Petals
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      var px = cx + Math.cos(a) * petalR * 0.6;
      var py = cy + Math.sin(a) * petalR * 0.6;
      ctx.fillStyle = '#ff88bb';
      ctx.beginPath();
      ctx.arc(px, py, petalR * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 4, centerR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawDecorationIcon(ctx, cx, cy) {
    // Magic wand with star
    // Wand stick
    ctx.strokeStyle = '#ddbbee';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 30, cy + 40);
    ctx.lineTo(cx - 15, cy - 20);
    ctx.stroke();
    // Star at tip
    var sx = cx - 18;
    var sy = cy - 25;
    var sr = 28;
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      var ri = sr * 0.4;
      ctx.lineTo(sx + Math.cos(a) * sr, sy + Math.sin(a) * sr);
      var a2 = a + Math.PI / 5;
      ctx.lineTo(sx + Math.cos(a2) * ri, sy + Math.sin(a2) * ri);
    }
    ctx.closePath();
    ctx.fill();
    // Sparkle dots
    ctx.fillStyle = 'rgba(255,255,200,0.6)';
    [[sx + 22, sy - 10], [sx - 8, sy - 22], [sx + 15, sy + 15]].forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  _drawAccessoryIcon(ctx, cx, cy) {
    // Paw print with tiny crown
    UI._drawPawPrint(ctx, cx, cy + 10, 40);
    // Tiny crown above
    ctx.fillStyle = '#ffcc22';
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 22);
    ctx.lineTo(cx - 14, cy - 38);
    ctx.lineTo(cx - 6, cy - 28);
    ctx.lineTo(cx, cy - 40);
    ctx.lineTo(cx + 6, cy - 28);
    ctx.lineTo(cx + 14, cy - 38);
    ctx.lineTo(cx + 20, cy - 22);
    ctx.closePath();
    ctx.fill();
    // Crown jewels
    ctx.fillStyle = '#ff4466';
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44ddff';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 28, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44dd66';
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 28, 2.5, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawPawPrint(ctx, cx, cy, size) {
    var s = size / 40;
    ctx.fillStyle = '#ddccaa';
    // Main pad
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8 * s, 18 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Toe pads
    var toes = [[-14, -8], [-5, -16], [5, -16], [14, -8]];
    for (var i = 0; i < toes.length; i++) {
      ctx.beginPath();
      ctx.arc(cx + toes[i][0] * s, cy + toes[i][1] * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  createResetButton() {
    var overlay = document.getElementById('ui-overlay');
    var btn = document.createElement('div');
    btn.id = 'reset-btn';
    btn.style.cssText = 'position:absolute;top:12px;right:12px;width:54px;height:54px;opacity:0.5;z-index:100;border-radius:50%;background:rgba(255,60,60,0.25);border:2px solid rgba(255,60,60,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;';
    var iconCanvas = document.createElement('canvas');
    iconCanvas.width = 80;
    iconCanvas.height = 80;
    iconCanvas.style.cssText = 'width:36px;height:36px;pointer-events:none;';
    var ic = iconCanvas.getContext('2d');
    ic.strokeStyle = '#ff6666';
    ic.lineWidth = 8;
    ic.lineCap = 'round';
    ic.beginPath();
    ic.moveTo(18, 18);
    ic.lineTo(62, 62);
    ic.moveTo(62, 18);
    ic.lineTo(18, 62);
    ic.stroke();
    btn.appendChild(iconCanvas);

    btn.addEventListener('pointerdown', function(e) {
      e.stopPropagation();
      Storage.clearSave();
      window.location.reload();
    });
    overlay.appendChild(btn);
  },
};
