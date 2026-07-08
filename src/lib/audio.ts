// Web Audio API Synthesizer Engine for Nexus OS / Atelier Gallery

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private noiseGain: GainNode | null = null;
  private isMuted: boolean = true;

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
    } else {
      if (this.ambientGain) this.ambientGain.gain.setValueAtTime(0, this.ctx!.currentTime);
      if (this.noiseGain) this.noiseGain.gain.setValueAtTime(0, this.ctx!.currentTime);
    }
  }

  // Procedure-synthesized white noise for rain soundscape
  private createRainNoise() {
    if (!this.ctx) return;
    
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter formula
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain booster
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to make it sound like rain (lowpass filter)
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

  public setAmbiance(type: 'rain' | 'sparkles' | 'grid' | 'lasers') {
    this.init();
    if (!this.ctx) return;

    // Clean previous ambient sources
    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); } catch(e){}
      this.ambientOsc = null;
    }
    if (this.noiseNode) {
      try { (this.noiseNode as any).stop(); } catch(e){}
      this.noiseNode = null;
    }

    // Set new ambiance
    if (type === 'rain') {
      // Play low rain rumble
      this.noiseNode = this.createRainNoise() as any;
    } else {
      // Play ambient harmonic oscillator pads
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      
      this.ambientOsc.type = type === 'lasers' ? 'sawtooth' : 'sine';
      // Retro uses lower frequency, space uses warm tones
      const frequency = type === 'grid' ? 110 : type === 'lasers' ? 85 : 220;
      this.ambientOsc.frequency.value = frequency;

      // Filter high pitch buzzes
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

  // Procedural UI interaction click sound
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

  // Procedural UI card hover sound
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
