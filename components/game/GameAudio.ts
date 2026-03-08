/**
 * GameAudio — Procedural sound effects for Phishing Pier using Web Audio API.
 * No audio files needed — all sounds are synthesized on the fly.
 */
export class GameAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private footstepInterval: ReturnType<typeof setInterval> | null = null;
  private movingLastFrame = false;
  private logicBombInterval: ReturnType<typeof setInterval> | null = null;

  private get ac(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private get out(): GainNode {
    this.ac; // ensure created
    return this.masterGain!;
  }

  /** Resume AudioContext (required after user gesture on some browsers) */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ──────────────────────────────────────────────
  // Core oscillator helpers
  // ──────────────────────────────────────────────

  private playTone({
    freq = 440,
    type = 'sine' as OscillatorType,
    duration = 0.1,
    gainStart = 0.3,
    gainEnd = 0,
    detune = 0,
    delay = 0,
    freqEnd,
  }: {
    freq?: number; type?: OscillatorType; duration?: number;
    gainStart?: number; gainEnd?: number; detune?: number;
    delay?: number; freqEnd?: number;
  }) {
    const ac = this.ac;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 0.001), t + duration);
    osc.detune.value = detune;

    g.gain.setValueAtTime(gainStart, t);
    g.gain.exponentialRampToValueAtTime(Math.max(gainEnd, 0.001), t + duration);

    osc.connect(g);
    g.connect(this.out);
    osc.start(t);
    osc.stop(t + duration);
  }

  private playNoise(duration: number, gainValue: number, bandpassFreq?: number, delay = 0) {
    const ac = this.ac;
    const t = ac.currentTime + delay;
    const bufLen = ac.sampleRate * duration;
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);

    const source = ac.createBufferSource();
    source.buffer = buf;

    const g = ac.createGain();
    g.gain.setValueAtTime(gainValue, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);

    if (bandpassFreq !== undefined) {
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = bandpassFreq;
      filter.Q.value = 5;
      source.connect(filter);
      filter.connect(g);
    } else {
      source.connect(g);
    }

    g.connect(this.out);
    source.start(t);
    source.stop(t + duration);
  }

  // ──────────────────────────────────────────────
  // Sound effects
  // ──────────────────────────────────────────────

  /** Single footstep click for movement */
  footstep() {
    this.resume();
    this.playNoise(0.04, 0.15, 1800);
    this.playTone({ freq: 120, type: 'sine', duration: 0.04, gainStart: 0.2, gainEnd: 0 });
  }

  /**
   * Call each frame with `isMoving`. Handles footstep interval automatically —
   * starts/stops the loop based on movement state.
   */
  tickMovement(isMoving: boolean) {
    if (isMoving && !this.movingLastFrame) {
      this.footstepInterval = setInterval(() => this.footstep(), 280);
    } else if (!isMoving && this.movingLastFrame) {
      if (this.footstepInterval) clearInterval(this.footstepInterval);
      this.footstepInterval = null;
    }
    this.movingLastFrame = isMoving;
  }

  stopFootsteps() {
    if (this.footstepInterval) clearInterval(this.footstepInterval);
    this.footstepInterval = null;
    this.movingLastFrame = false;
  }

  /** Beep when entering task range */
  taskNearby() {
    this.resume();
    this.playTone({ freq: 880, type: 'sine', duration: 0.08, gainStart: 0.2, gainEnd: 0 });
    this.playTone({ freq: 1100, type: 'sine', duration: 0.08, gainStart: 0.15, gainEnd: 0, delay: 0.09 });
  }

  /** Chime when a task is completed successfully */
  taskComplete() {
    this.resume();
    [523, 659, 784, 1047].forEach((f, i) => {
      this.playTone({ freq: f, type: 'triangle', duration: 0.25, gainStart: 0.3, gainEnd: 0, delay: i * 0.08 });
    });
  }

  /** Wrong answer / action blocked */
  error() {
    this.resume();
    this.playTone({ freq: 160, type: 'sawtooth', duration: 0.15, gainStart: 0.3, gainEnd: 0 });
    this.playTone({ freq: 140, type: 'sawtooth', duration: 0.15, gainStart: 0.3, gainEnd: 0, delay: 0.15 });
  }

  /** Emergency meeting / Bridge call siren */
  emergencyMeeting() {
    this.resume();
    for (let i = 0; i < 4; i++) {
      this.playTone({ freq: 880, type: 'sawtooth', duration: 0.15, gainStart: 0.4, gainEnd: 0.1, delay: i * 0.35 });
      this.playTone({ freq: 660, type: 'sawtooth', duration: 0.15, gainStart: 0.4, gainEnd: 0.1, delay: i * 0.35 + 0.18 });
    }
  }

  /** Red team kill / elimination sound */
  kill() {
    this.resume();
    this.playTone({ freq: 400, type: 'sawtooth', duration: 0.06, gainStart: 0.5, gainEnd: 0.1 });
    this.playNoise(0.15, 0.35, 600);
    this.playTone({ freq: 80, type: 'sine', duration: 0.3, gainStart: 0.4, gainEnd: 0, delay: 0.05, freqEnd: 30 });
  }

  /** Body reported */
  bodyReported() {
    this.resume();
    this.playTone({ freq: 200, type: 'sine', duration: 0.4, gainStart: 0.5, gainEnd: 0, freqEnd: 80 });
    this.playNoise(0.2, 0.2, 300, 0.05);
  }

  /** Game start fanfare */
  gameStart() {
    this.resume();
    [262, 330, 392, 523, 659].forEach((f, i) => {
      this.playTone({ freq: f, type: 'square', duration: 0.18, gainStart: 0.25, gainEnd: 0, delay: i * 0.1 });
    });
    this.playTone({ freq: 784, type: 'square', duration: 0.5, gainStart: 0.3, gainEnd: 0, delay: 0.55 });
  }

  /** Victory fanfare (Blue team wins) */
  victory() {
    this.resume();
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => {
      this.playTone({ freq: f, type: 'triangle', duration: 0.25, gainStart: 0.3, gainEnd: 0.05, delay: i * 0.12 });
    });
  }

  /** Defeat sound (Red team wins) */
  defeat() {
    this.resume();
    [400, 350, 300, 250, 200].forEach((f, i) => {
      this.playTone({ freq: f, type: 'sawtooth', duration: 0.3, gainStart: 0.3, gainEnd: 0.05, delay: i * 0.15 });
    });
  }

  /** Logic bomb ticking — call startLogicBombTick/stopLogicBombTick */
  startLogicBombTick() {
    this.resume();
    if (this.logicBombInterval) return;
    let interval = 800;
    const tick = () => {
      this.playTone({ freq: 1200, type: 'square', duration: 0.04, gainStart: 0.35, gainEnd: 0 });
      interval = Math.max(200, interval - 20); // speeds up over time
      this.logicBombInterval = setTimeout(tick, interval) as unknown as ReturnType<typeof setInterval>;
    };
    tick();
  }

  stopLogicBombTick() {
    if (this.logicBombInterval) {
      clearTimeout(this.logicBombInterval as unknown as ReturnType<typeof setTimeout>);
      clearInterval(this.logicBombInterval);
      this.logicBombInterval = null;
    }
  }

  /** Logic bomb defused */
  bombDefused() {
    this.resume();
    this.stopLogicBombTick();
    [440, 550, 660, 880].forEach((f, i) => {
      this.playTone({ freq: f, type: 'triangle', duration: 0.2, gainStart: 0.4, gainEnd: 0, delay: i * 0.07 });
    });
  }

  /** Sabotage activated (red team) */
  sabotageActivated() {
    this.resume();
    this.playTone({ freq: 300, type: 'sawtooth', duration: 0.08, gainStart: 0.4, gainEnd: 0.1 });
    this.playTone({ freq: 200, type: 'sawtooth', duration: 0.08, gainStart: 0.4, gainEnd: 0.1, delay: 0.1 });
    this.playNoise(0.12, 0.2, 400, 0.2);
  }

  /** Vote cast in meeting */
  voteCast() {
    this.resume();
    this.playTone({ freq: 660, type: 'sine', duration: 0.12, gainStart: 0.25, gainEnd: 0 });
  }

  /** Player ejected */
  playerEjected() {
    this.resume();
    this.playTone({ freq: 220, type: 'sawtooth', duration: 0.6, gainStart: 0.5, gainEnd: 0, freqEnd: 50 });
    this.playNoise(0.3, 0.3, 200, 0.1);
  }

  destroy() {
    this.stopFootsteps();
    this.stopLogicBombTick();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
