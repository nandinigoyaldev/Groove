import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Pin } from 'lucide-react';
import { synthAudio } from '../lib/audio';
import type { Project } from '../types';

interface Snapshot {
  id: string;
  projectTitle: string;
  projectTheme: string;
  projectTech: string[];
  timestamp: string;
  x: number;
  y: number;
  isDeveloping: boolean;
}

interface PolaroidCameraProps {
  activeProject: Project;
}

export const PolaroidCamera: React.FC<PolaroidCameraProps> = ({ activeProject }) => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  // Procedural shutter sound trigger
  const playShutterSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Part 1: Click sound (shutter opening)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    clickGain.gain.setValueAtTime(0.1, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.06);

    // Part 2: White noise burst (mechanical shutter action)
    const bufferSize = ctx.sampleRate * 0.1;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now + 0.04);
    noiseSource.stop(now + 0.16);
  };

  const handleTakeSnapshot = () => {
    playShutterSound();
    
    // Create new snapshot positioned near the camera
    const newSnapshot: Snapshot = {
      id: Date.now().toString(),
      projectTitle: activeProject.title,
      projectTheme: activeProject.themeColor,
      projectTech: activeProject.tech,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      x: 100 + Math.random() * 50,
      y: 120 + Math.random() * 50,
      isDeveloping: true,
    };

    setSnapshots((prev) => [...prev, newSnapshot]);

    // "Develop" the photo over 4 seconds
    setTimeout(() => {
      setSnapshots((prev) =>
        prev.map((s) => (s.id === newSnapshot.id ? { ...s, isDeveloping: false } : s))
      );
    }, 4000);
  };

  const handleRemoveSnapshot = (id: string) => {
    synthAudio.playClick();
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  // Draggable snapshot hook
  const DragSnapshot: React.FC<{ snap: Snapshot }> = ({ snap }) => {
    const [pos, setPos] = useState({ x: snap.x, y: snap.y });
    const dragRef = useRef({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragRef.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
      e.preventDefault();
    };

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          setPos({
            x: e.clientX - dragRef.current.x,
            y: e.clientY - dragRef.current.y,
          });
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);

    return (
      <div
        className="draggable-polaroid"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          position: 'absolute',
          zIndex: 100,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        <button className="polaroid-close" onClick={() => handleRemoveSnapshot(snap.id)}>
          <X size={12} />
        </button>
        <div className="polaroid-pin"><Pin size={12} color="#786659" /></div>
        <div
          className={`polaroid-photo-area ${snap.isDeveloping ? 'developing' : ''}`}
          style={{ background: `linear-gradient(135deg, ${snap.projectTheme}44 0%, ${snap.projectTheme}ee 100%)` }}
        >
          <div className="photo-content">
            <span className="photo-label">{snap.projectTitle}</span>
            <span className="photo-time">{snap.timestamp}</span>
          </div>
        </div>
        <div className="polaroid-caption-area">
          <input
            type="text"
            className="polaroid-caption-input"
            placeholder="Write a caption..."
            defaultValue={snap.isDeveloping ? 'Developing...' : `Memory of ${snap.projectTitle}`}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Camera Widget */}
      <div className="camera-widget glass" onClick={handleTakeSnapshot}>
        <Camera size={20} color="#b45309" />
        <span className="camera-lbl">Snapshot Camera</span>
      </div>

      {/* Render Draggable Polaroids */}
      {snapshots.map((snap) => (
        <DragSnapshot key={snap.id} snap={snap} />
      ))}
    </>
  );
};
