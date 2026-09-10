// Web Audio API Synthesizer Engine for Groove Vinyl Console

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private crackleNode: AudioBufferSourceNode | null = null;
  private crackleGain: GainNode | null = null;
  private isMuted: boolean = true;
  private isLofiActive: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(muteState: boolean) {
    this.isMuted = muteState;
    if (!this.isMuted) {
      this.init();
      if (this.ambientGain) this.ambientGain.gain.setValueAtTime(0.15, this.ctx!.currentTime);
      if (this.noiseGain) this.noiseGain.gain.setValueAtTime(0.08, this.ctx!.currentTime);
      if (this.crackleGain && this.isLofiActive) this.crackleGain.gain.setValueAtTime(0.06, this.ctx!.currentTime);
    } else {
      if (this.ambientGain) this.ambientGain.gain.setValueAtTime(0, this.ctx!.currentTime);
      if (this.noiseGain) this.noiseGain.gain.setValueAtTime(0, this.ctx!.currentTime);
      if (this.crackleGain) this.crackleGain.gain.setValueAtTime(0, this.ctx!.currentTime);
    }
  }

  // Procedure-synthesized white/pink noise for rain soundscape
  private createRainNoise() {
    if (!this.ctx) return null;
    
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = this.isMuted ? 0 : 0.08;

    whiteNoise.connect(filter);
    filter.connect(this.noiseGain);
    this.noiseGain.connect(this.ctx.destination);
    
    whiteNoise.start(0);
    return whiteNoise;
  }

  // Procedural vinyl crackle & needle dust pops
  private createVinylCrackle() {
    if (!this.ctx) return null;

    const bufferSize = 3 * this.ctx.sampleRate;
    const crackleBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = crackleBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const r = Math.random();
      if (r > 0.9985) {
        output[i] = (Math.random() * 2 - 1) * 0.7; // vinyl pop click
      } else if (r > 0.99) {
        output[i] = (Math.random() * 2 - 1) * 0.2; // soft hiss
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.015; // background surface noise
      }
    }

    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.2;

    this.crackleGain = this.ctx.createGain();
    this.crackleGain.gain.value = this.isMuted ? 0 : 0.06;

    crackleSource.connect(filter);
    filter.connect(this.crackleGain);
    this.crackleGain.connect(this.ctx.destination);

    crackleSource.start(0);
    return crackleSource;
  }

  public toggleLofiMode(active: boolean) {
    this.isLofiActive = active;
    this.init();
    if (!this.ctx) return;

    if (this.crackleNode) {
      try { this.crackleNode.stop(); } catch(e){}
      this.crackleNode = null;
    }

    if (active) {
      if (this.isMuted) {
        this.toggleMute(false);
      }
      this.crackleNode = this.createVinylCrackle();
    }
  }

  public setAmbiance(type: 'rain' | 'sparkles' | 'grid' | 'lasers') {
    this.init();
    if (!this.ctx) return;

    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); } catch(e){}
      this.ambientOsc = null;
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch(e){}
      this.noiseNode = null;
    }

    if (type === 'rain') {
      this.noiseNode = this.createRainNoise();
    } else {
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      
      this.ambientOsc.type = type === 'lasers' ? 'sawtooth' : 'sine';
      const frequency = type === 'grid' ? 110 : type === 'lasers' ? 85 : 220;
      this.ambientOsc.frequency.value = frequency;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'lasers' ? 300 : 400;

      this.ambientGain.gain.value = this.isMuted ? 0 : 0.15;

      this.ambientOsc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      
      this.ambientOsc.start(0);
    }
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playHover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

export const synthAudio = new AudioEngine();
