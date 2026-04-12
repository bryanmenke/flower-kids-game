// GameAudio - Web Audio API synthesizer for all game sounds

const GameAudio = {
  ctx: null,
  masterGain: null,
  ambientGain: null,
  sfxGain: null,
  initialized: false,
  ambientNodes: [],

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.15;
    this.ambientGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.masterGain);

    this.initialized = true;
    this.startAmbient();
  },

  ensure() {
    if (!this.initialized) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  startAmbient() {
    const ctx = this.ctx;

    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    const padFilter = ctx.createBiquadFilter();
    pad.type = 'sine';
    pad.frequency.value = 220;
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 400;
    padGain.gain.value = 0.3;
    pad.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(this.ambientGain);
    pad.start();
    this.ambientNodes.push(pad);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain);
    lfoGain.connect(pad.frequency);
    lfo.start();
    this.ambientNodes.push(lfo);

    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 880;
    shimmerGain.gain.value = 0.05;
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.ambientGain);
    shimmer.start();
    this.ambientNodes.push(shimmer);

    const shimmerLfo = ctx.createOscillator();
    const shimmerLfoGain = ctx.createGain();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.value = 0.3;
    shimmerLfoGain.gain.value = 0.04;
    shimmerLfo.connect(shimmerLfoGain);
    shimmerLfoGain.connect(shimmerGain.gain);
    shimmerLfo.start();
    this.ambientNodes.push(shimmerLfo);
  },

  playPlantPop() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);
  },

  playStarCatch() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  },

  _shimmerOsc: null,
  _shimmerGain: null,
  _shimmerLfo: null,
  startDragShimmer() {
    this.ensure();
    if (this._shimmerOsc) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 1200;
    gain.gain.value = 0.1;
    lfo.type = 'sine';
    lfo.frequency.value = 6;
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    lfo.start();
    this._shimmerOsc = osc;
    this._shimmerGain = gain;
    this._shimmerLfo = lfo;
  },

  stopDragShimmer() {
    if (this._shimmerOsc) {
      this._shimmerGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      this._shimmerOsc.stop(this.ctx.currentTime + 0.35);
      this._shimmerLfo.stop(this.ctx.currentTime + 0.35);
      this._shimmerOsc = null;
      this._shimmerGain = null;
      this._shimmerLfo = null;
    }
  },

  playBloom(plantType) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const baseFreqs = [
      [523, 659, 784],
      [587, 740, 880],
      [659, 830, 988],
      [698, 880, 1047],
      [784, 988, 1175],
    ];
    const freqs = baseFreqs[plantType % baseFreqs.length];

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.3);
    });

    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freqs[0] * 2 + Math.random() * 500;
      const t = now + 0.3 + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.45);
    }
  },

  playGiftStarAppear() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    [0, 0.12].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1319;
      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
  },

  playGiftStarOpen() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880, 1109, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = now + i * 0.07;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  },

  playAnimalArrive(animalType) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const melodies = [
      [659, 784, 880, 1047],
      [784, 659, 784, 988],
      [880, 784, 880, 1175],
    ];
    const notes = melodies[animalType % melodies.length];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.15;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  },

  playAnimalTap(animalType, soundIndex) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const sounds = [
      // Fox: yip, bark, howl
      [
        () => { this._playTone('sine', 880, 0.15, 0.3); },
        () => { this._playTone('square', 440, 0.1, 0.25); this._playTone('square', 460, 0.1, 0.25); },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.5);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.65);
        },
      ],
      // Bunny: squeak, boing, chirp
      [
        () => { this._playTone('sine', 1200, 0.08, 0.25); },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.35);
        },
        () => { this._playTone('sine', 1047, 0.06, 0.2); this._playTone('sine', 1319, 0.06, 0.2); },
      ],
      // Kitten: mew, purr, trill
      [
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.25);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.35);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 180;
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          lfo.frequency.value = 25;
          lfoGain.gain.value = 30;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          lfo.start(now);
          osc.stop(now + 0.65);
          lfo.stop(now + 0.65);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          for (let j = 0; j < 6; j++) {
            osc.frequency.setValueAtTime(j % 2 === 0 ? 800 : 1000, now + j * 0.05);
          }
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.4);
        },
      ],
    ];

    const animalSounds = sounds[animalType % sounds.length];
    animalSounds[soundIndex % 3]();
  },

  playAccessoryPlace() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this._playTone('square', 1500, 0.02, 0.15);
    setTimeout(() => {
      this._playTone('sine', 2000, 0.05, 0.2);
      this._playTone('sine', 2400, 0.05, 0.18);
    }, 30);
  },

  playSpinWhoosh(speed) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 100 + Math.abs(speed) * 2;
    filter.type = 'lowpass';
    filter.frequency.value = 300 + Math.abs(speed) * 5;
    gain.gain.setValueAtTime(Math.min(0.1, Math.abs(speed) * 0.001), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  },

  _playTone(type, freq, duration, fadeOut) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (fadeOut || duration));
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + (fadeOut || duration) + 0.05);
  },
};
