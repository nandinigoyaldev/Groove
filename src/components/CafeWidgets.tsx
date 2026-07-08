import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2, VolumeX } from 'lucide-react';
import { synthAudio } from '../lib/audio';

// Custom cozy audio engine
class LofiSynth {
  private ctx: AudioContext | null = null;
  private vinylGain: GainNode | null = null;
  private chordInterval: any = null;
  private isPlaying = false;

  public start(muteState: boolean) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create crackling vinyl noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Crackle pops + white noise
      const crackle = Math.random() > 0.9995 ? (Math.random() * 2 - 1) * 0.4 : 0;
      const hiss = (Math.random() * 2 - 1) * 0.01;
      output[i] = crackle + hiss;
    }

    const vinylNoise = this.ctx.createBufferSource();
    vinylNoise.buffer = noiseBuffer;
    vinylNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.value = muteState ? 0 : 0.12;

    vinylNoise.connect(filter);
    filter.connect(this.vinylGain);
    this.vinylGain.connect(this.ctx.destination);
    vinylNoise.start();

    // Play cozy lofi chord pads periodically
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [146.83, 174.61, 220.00, 261.63], // Dmin7
      [164.81, 196.00, 246.94, 293.66], // Emin7
      [174.61, 220.00, 261.63, 329.63]  // Fmaj7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.ctx || muteState) return;
      const now = this.ctx.currentTime;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      notes.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        // Cozy low pass filter to make it warm
        const lpf = this.ctx!.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 350;

        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.04, now + 1.5); // Slow attack
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5); // Long release

        osc.connect(lpf);
        lpf.connect(oscGain);
        oscGain.connect(this.ctx!.destination);
        
        osc.start(now);
        osc.stop(now + 6);
      });
    };

    playChord();
    this.chordInterval = setInterval(playChord, 6000);
  }

  public setMute(muted: boolean) {
    if (this.vinylGain) {
      this.vinylGain.gain.value = muted ? 0 : 0.12;
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

const lofiEngine = new LofiSynth();

export const CafeWidgets: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Steaming Coffee Cup Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = 120);
    const height = (canvas.height = 100);

    // Particle structure for rising steam
    interface SteamParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      radius: number;
    }

    const steam: SteamParticle[] = [];

    const drawCoffeeMug = () => {
      if (!ctx) return;
      ctx.fillStyle = '#b45309'; // Warm brown terracotta mug
      ctx.strokeStyle = '#fef3c7'; // Ivory border line
      ctx.lineWidth = 2;

      // Draw mug body
      ctx.beginPath();
      ctx.arc(width / 2, height - 30, 20, 0, Math.PI, false);
      ctx.lineTo(width / 2 - 20, height - 55);
      ctx.lineTo(width / 2 + 20, height - 55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw mug handle
      ctx.beginPath();
      ctx.arc(width / 2 + 20, height - 42, 8, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
    };

    const updateSteam = () => {
      if (Math.random() < 0.08) {
        steam.push({
          x: width / 2 + (Math.random() * 12 - 6),
          y: height - 58,
          vx: Math.random() * 0.4 - 0.2,
          vy: -(Math.random() * 0.6 + 0.4),
          alpha: 0.8,
          radius: Math.random() * 3 + 2,
        });
      }

      steam.forEach((s, idx) => {
        s.y += s.vy;
        s.x += s.vx + Math.sin(s.y * 0.05) * 0.2; // Sine wave drift
        s.alpha -= 0.01;

        if (s.alpha <= 0 || s.y < 10) {
          steam.splice(idx, 1);
        }
      });
    };

    const drawSteam = () => {
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      steam.forEach((s) => {
        ctx.globalAlpha = s.alpha * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      updateSteam();
      drawSteam();
      drawCoffeeMug();
      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleTogglePlay = () => {
    synthAudio.playClick();
    if (isPlaying) {
      lofiEngine.stop();
      setIsPlaying(false);
    } else {
      lofiEngine.start(isMuted);
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    synthAudio.playClick();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    lofiEngine.setMute(newMuted);
  };

  return (
    <div className="cafe-widgets-panel">
      {/* Steam cup */}
      <div className="coffee-widget">
        <canvas ref={canvasRef} />
        <span className="coffee-label">Cozy Brew</span>
      </div>

      {/* Lofi Radio */}
      <div className="radio-widget glass">
        <div className="radio-cassette">
          <div className={`spindle ${isPlaying ? 'spin' : ''}`} />
          <div className={`spindle ${isPlaying ? 'spin' : ''}`} />
        </div>
        <div className="radio-controls">
          <button className="radio-btn" onClick={handleTogglePlay}>
            {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          <button className="radio-btn" onClick={handleToggleMute} disabled={!isPlaying}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
        <span className="radio-label">Lofi Radio // Vintage tape</span>
      </div>
    </div>
  );
};
