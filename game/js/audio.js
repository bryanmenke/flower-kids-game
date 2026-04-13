// GameAudio - Web Audio API synthesizer: music box lullaby + all game SFX
// IMPORTANT: This object is named GameAudio, NOT Audio (would shadow browser native)

const GameAudio = {
  ctx: null,
  masterGain: null,
  musicGain: null,
  sfxGain: null,
  initialized: false,
  musicNodes: [],
  musicTimer: null,
  _shimmerOsc: null,
  _shimmerGain: null,
  _shimmerLfo: null,

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.25;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.masterGain);

    this.initialized = true;
    this.startMusicBox();
  },

  ensure() {
    if (!this.initialized) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  // --- Music Box Lullaby ---

  // Pentatonic melody in C major: C4=262, D4=294, E4=330, G4=392, A4=440
  // C5=523, D5=587, E5=659, G5=784, A5=880
  _pentatonic: [262, 294, 330, 392, 440, 523, 587, 659, 784, 880],

  // Base melody pattern (indices into _pentatonic)
  // 16 notes per loop at 65 BPM = ~14.8 seconds per loop
  _melodyBase: [
    0, 2, 4, 5,   // C4 E4 G4 A4 (ascending)
    5, 4, 2, 1,   // A4 G4 E4 D4 (descending)
    5, 7, 4, 6,   // A4 E5 G4 D5 (variation with octave jumps)
    4, 2, 1, 0    // G4 E4 D4 C4 (resolve)
  ],

  // Chord pads: C major and A minor triads (low octave)
  _padChords: [
    [131, 165, 196], // C3 E3 G3 (C major) — bars 1-4
    [131, 165, 196], // C major — bars 5-8
    [110, 131, 165], // A2 C3 E3 (A minor) — bars 9-12
    [131, 165, 196], // C major — bars 13-16
  ],

  _musicBoxNote(freq, startTime, duration) {
    const ctx = this.ctx;
    // Fundamental
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    gain1.gain.setValueAtTime(0.35, startTime);
    gain1.gain.exponentialRampToValueAtTime(0.15, startTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc1.connect(gain1);
    gain1.connect(this.musicGain);
    osc1.start(startTime);
    osc1.stop(startTime + duration + 0.05);

    // Metallic overtone at 3x frequency
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 3;
    gain2.gain.setValueAtTime(0.08, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.5);
    osc2.connect(gain2);
    gain2.connect(this.musicGain);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.5 + 0.05);
  },

  _scheduleMelodyLoop() {
    if (!this.initialized) return;
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.1;
    const bpm = 65;
    const beatDuration = 60 / bpm;
    const noteDuration = beatDuration * 0.9;

    // Generate melody with slight variation
    const melody = this._melodyBase.slice();
    // Randomly shift 2-3 notes to neighbors
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * melody.length);
      const shift = Math.random() < 0.5 ? -1 : 1;
      melody[idx] = Math.max(0, Math.min(this._pentatonic.length - 1, melody[idx] + shift));
    }
    // Occasionally jump a note up an octave
    if (Math.random() < 0.4) {
      const idx = Math.floor(Math.random() * melody.length);
      if (melody[idx] + 5 < this._pentatonic.length) melody[idx] += 5;
    }

    // Schedule melody notes
    for (let i = 0; i < melody.length; i++) {
      const freq = this._pentatonic[melody[i]];
      const isLastNote = i === melody.length - 1;
      const dur = isLastNote ? noteDuration * 2 : noteDuration;
      this._musicBoxNote(freq, now + i * beatDuration, dur);
    }

    // Schedule pad chords (one per 4 beats)
    for (let c = 0; c < 4; c++) {
      const chord = this._padChords[c];
      const chordStart = now + c * 4 * beatDuration;
      const chordDur = 4 * beatDuration;
      for (const freq of chord) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.04, chordStart);
        gain.gain.linearRampToValueAtTime(0.06, chordStart + chordDur * 0.5);
        gain.gain.linearRampToValueAtTime(0.001, chordStart + chordDur);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(chordStart);
        osc.stop(chordStart + chordDur + 0.1);
      }
    }

    // Schedule next loop
    const loopDuration = melody.length * beatDuration;
    this.musicTimer = setTimeout(() => this._scheduleMelodyLoop(), (loopDuration - 0.5) * 1000);
  },

  startMusicBox() {
    this._scheduleMelodyLoop();
    this._startBreathingLFO();
  },

  _startBreathingLFO() {
    // Master volume breathes with slow LFO (~0.05 Hz, +/-10% gain)
    if (!this.initialized) return;
    const ctx = this.ctx;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // 0.05 Hz = 20 second cycle
    lfoGain.gain.value = 0.05;  // +/- 10% of master (0.5 * 0.1 = 0.05)
    lfo.connect(lfoGain);
    lfoGain.connect(this.masterGain.gain);
    lfo.start();
    this._breathingLFO = lfo;
  },

  stopMusic() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  },

  // Brief brightness boost on player action
  actionBrightness() {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.35, now);
    this.musicGain.gain.linearRampToValueAtTime(0.25, now + 2);
  },

  // --- SFX ---

  playPlantPop() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // Earthy "pop" - deeper than before
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
    this.actionBrightness();
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
    gain.gain.value = 0.08;
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

  // Bloom sound — unique chord per plant type (7 types)
  playBloom(plantType) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const chords = [
      [262, 330, 392],           // 0: Rose Bush — C major
      [294, 370, 440],           // 1: Sunflower — D major
      [330, 415, 494],           // 2: Willow Tree — E major
      [349, 440, 523],           // 3: Mushroom — F major
      [392, 494, 587],           // 4: Lavender — G major
      [262, 330, 392, 523],      // 5: Rainbow Tree — C major spread (4 notes)
      [220, 294, 370, 440],      // 6: Firework Flower — warm D spread (4 notes)
    ];
    const freqs = chords[plantType % chords.length];

    // Main chord
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.6);
    });

    // Sparkle overtones
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freqs[0] * 2 + Math.random() * 400;
      const t = now + 0.3 + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.45);
    }
    this.actionBrightness();
  },

  // Water splash sound (new — plays when watering advances a non-bloom stage)
  playWaterSplash() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // White noise burst filtered to sound like water
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.25);
  },

  // Growth sound (small chime for non-bloom stage advances)
  playGrowth() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
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
    this.actionBrightness();
  },

  // Animal arrival — melodic flourish per type
  playAnimalArrive(animalType) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const melodies = [
      [659, 784, 880, 1047],     // 0: Fox — bright ascending
      [784, 659, 784, 988],      // 1: Bunny — bouncy
      [880, 784, 880, 1175],     // 2: Kitten — playful
      [523, 440, 523, 659],      // 3: Owl — low wise
      [1047, 1175, 1319, 1568],  // 4: Deer — crystalline high
      [330, 294, 330, 392],      // 5: Bear — warm low
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
    this.actionBrightness();
  },

  // Animal tap sounds — 3 per animal type, cycle 1->2->3->1...
  playAnimalTap(animalType, soundIndex) {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const sounds = [
      // 0: Fox — yip, bark, howl
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
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.65);
        },
      ],
      // 1: Bunny — squeak, boing, chirp
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
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.35);
        },
        () => { this._playTone('sine', 1047, 0.06, 0.2); this._playTone('sine', 1319, 0.06, 0.2); },
      ],
      // 2: Kitten — mew, purr, trill
      [
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.25);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.35);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = 180;
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          lfo.frequency.value = 25; lfoGain.gain.value = 30;
          lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); lfo.start(now);
          osc.stop(now + 0.65); lfo.stop(now + 0.65);
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
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.4);
        },
      ],
      // 3: Owl — soft hoot, double hoot, low call
      [
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(280, now + 0.3);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.45);
        },
        () => {
          [0, 0.2].forEach(d => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 320;
            gain.gain.setValueAtTime(0.2, now + d);
            gain.gain.exponentialRampToValueAtTime(0.001, now + d + 0.18);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(now + d); osc.stop(now + d + 0.22);
          });
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(250, now);
          osc.frequency.linearRampToValueAtTime(200, now + 0.6);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.75);
        },
      ],
      // 4: Deer — crystal chime, bell cascade, wind chime
      [
        () => {
          [1319, 1568, 1760].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = f;
            gain.gain.setValueAtTime(0.15, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.5);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(now + i * 0.04); osc.stop(now + i * 0.04 + 0.55);
          });
        },
        () => {
          [1760, 1568, 1319, 1175].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = f;
            const t = now + i * 0.08;
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(t); osc.stop(t + 0.45);
          });
        },
        () => {
          for (let i = 0; i < 5; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 1200 + Math.random() * 800;
            const t = now + i * 0.06;
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain); gain.connect(this.sfxGain);
            osc.start(t); osc.stop(t + 0.55);
          }
        },
      ],
      // 5: Bear — low rumble, snuffle, happy grumble
      [
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = 120;
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          lfo.frequency.value = 15; lfoGain.gain.value = 20;
          lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); lfo.start(now);
          osc.stop(now + 0.55); lfo.stop(now + 0.55);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass'; filter.frequency.value = 400;
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.25);
        },
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(180, now + 0.2);
          osc.frequency.linearRampToValueAtTime(140, now + 0.4);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain); gain.connect(this.sfxGain);
          osc.start(now); osc.stop(now + 0.55);
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

  playDecorationPlace() {
    this.ensure();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // Warm thud + sparkle for placing a decoration
    this._playTone('sine', 200, 0.1, 0.08);
    this._playTone('sine', 400, 0.05, 0.06);
    setTimeout(() => {
      this._playTone('sine', 800, 0.03, 0.15);
      this._playTone('sine', 1200, 0.03, 0.12);
    }, 80);
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
    gain.gain.setValueAtTime(Math.min(0.08, Math.abs(speed) * 0.0008), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.45);
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
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + (fadeOut || duration) + 0.05);
  },
};
