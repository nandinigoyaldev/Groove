import React, { useState, useEffect } from 'react';
import { Camera, Sliders, Play, RotateCw } from 'lucide-react';
import type { Project } from '../types';
import { synthAudio } from '../lib/audio';

interface CameraViewfinderProps {
  projects: Project[];
  activeProject: Project;
  onActiveProjectChange: (proj: Project) => void;
  onOpenProject: (proj: Project) => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  projects,
  activeProject,
  onActiveProjectChange,
  onOpenProject,
}) => {
  const [focusLevel, setFocusLevel] = useState(0); // 0 = sharp, 10 = blurry
  const [isRotating, setIsRotating] = useState(false);

  // Auto-focus effect when changing projects (simulating lens refocusing)
  useEffect(() => {
    setFocusLevel(10);
    const timer = setTimeout(() => {
      setFocusLevel(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeProject]);

  const handleNextProject = () => {
    synthAudio.playClick();
    setIsRotating(true);
    const idx = projects.findIndex((p) => p.id === activeProject.id);
    const nextIdx = (idx + 1) % projects.length;
    onActiveProjectChange(projects[nextIdx]);
    setTimeout(() => setIsRotating(false), 500);
  };

  const getApertureStat = (id: string) => {
    switch (id) {
      case 'aura-weather': return 'f/4.0';
      case 'rock-paper-scissors': return 'f/1.8';
      case 'hotel-landing': return 'f/2.8';
      case 'paradigm-shift': return 'f/5.6';
      default: return 'f/2.8';
    }
  };

  return (
    <div className="camera-console glass">
      {/* Viewfinder Frame */}
      <div className="viewfinder-container">
        <div className="viewfinder-lens-rim">
          <div
            className="viewfinder-display"
            style={{
              filter: `blur(${focusLevel}px)`,
              transition: 'filter 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* Project Frame inside lens */}
            <div className="lens-project-header">
              <span className="lens-tech">{activeProject.tech[0]}</span>
              <span className="lens-aperture">{getApertureStat(activeProject.id)}</span>
            </div>
            
            <h2 className="lens-title">{activeProject.title}</h2>
            <p className="lens-desc">{activeProject.description}</p>
            
            <button className="shutter-trigger-btn" onClick={() => onOpenProject(activeProject)}>
              <Play size={14} fill="currentColor" /> CAPTURE & ENTER
            </button>
          </div>

          {/* Viewfinder overlays (crosshair, guidelines) */}
          <div className="lens-crosshair" />
          <div className="lens-grid-line h-line" />
          <div className="lens-grid-line v-line" />
          <div className="lens-rec-dot" />
          <span className="lens-rec-lbl">REC</span>
        </div>
      </div>

      {/* Camera Side Dials */}
      <div className="camera-dials">
        {/* Focus adjustment slider */}
        <div className="dial-group">
          <label className="dial-label"><Sliders size={12} /> Manual Focus</label>
          <input
            type="range"
            min="0"
            max="10"
            value={focusLevel}
            onChange={(e) => setFocusLevel(Number(e.target.value))}
            className="focus-slider"
          />
          <span className="dial-value">{focusLevel === 0 ? 'AUTO FOCUS LOCKED' : `${focusLevel * 10}% Blur`}</span>
        </div>

        {/* Rotate dial for projects */}
        <div className="dial-group">
          <label className="dial-label"><RotateCw size={12} /> Dial Ring</label>
          <button className={`lens-rotate-btn ${isRotating ? 'spin' : ''}`} onClick={handleNextProject}>
            <Camera size={18} />
          </button>
          <span className="dial-value">ISO 400 // Rotate Lens</span>
        </div>
      </div>
    </div>
  );
};
