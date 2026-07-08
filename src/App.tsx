import { useState } from 'react';
import type { Project } from './types';
import { VinylPlayer } from './components/VinylPlayer';
import { CodeInspector } from './components/CodeInspector';
import { synthAudio } from './lib/audio';
import * as Icons from 'lucide-react';

const PROJECTS: Project[] = [
  {
    id: 'aura-weather',
    title: 'Cloud',
    description: 'A vintage weather radio console with weather-synthesized AM frequencies.',
    longDescription: 'Get atmospheric weather readouts. Features a bakelite dial receiver frame, a temperature-controlled analog needle gauge, and weather-synthesized AM audio (rain hiss for wet cities, warm sine tones for sun, and auto-rickshaw honks for Delhi).',
    tech: ['HTML', 'CSS', 'JavaScript', 'Weather API'],
    themeColor: '#10b981',
    gradient: '#faf9f5', // Cozy cream
    particleType: 'rain',
    url: '/projects/aura-weather/index.html',
  },
  {
    id: 'rock-paper-scissors',
    title: 'Earth',
    description: 'A classic game built as a vintage cassette deck with pitch-bend TAPE TILT.',
    longDescription: 'Play rock-paper-scissors on a tactile 1980s tape console. Features spinning cassette reels, responsive click sound waves, and a rare TAPE TILT switch that bends pitch down 35% and activates cheat mode.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Local Storage'],
    themeColor: '#ef4444',
    gradient: '#faf9f5',
    particleType: 'grid',
    url: '/projects/rock-paper-scissors/game.html',
  },
  {
    id: 'hotel-landing',
    title: 'Hearth',
    description: 'A vintage hotel key cabinet landing page with selection chimes.',
    longDescription: 'Browse rooms as brass key tags hanging on reception pegs. Selecting a key triggers a swing animation and a synthesized bell chime, auto-filling the registry ledger form.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Vite'],
    themeColor: '#b45309',
    gradient: '#faf9f5',
    particleType: 'sparkles',
    url: '/projects/hotel-landing/index.html',
  },
  {
    id: 'paradigm-shift',
    title: 'Paradigm Shift',
    description: 'A futuristic interactive layout shifting standard perspectives.',
    longDescription: 'Modern web layout template inspired by innovative shifts. Integrates sleek variables and dynamic parallax design components.',
    tech: ['HTML', 'SASS', 'JavaScript', 'Responsive Grid'],
    themeColor: '#3b82f6',
    gradient: '#faf9f5',
    particleType: 'lasers',
    url: '/projects/paradigm-shift/index.html',
  },
];

export default function App() {
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

  const handleOpenProject = (proj: Project) => {
    setOpenProject(proj);
    setSandboxCode(null);
  };

  const handleRunCode = (code: string) => {
    setSandboxCode(code);
  };

  return (
    <div className="gallery-app spins-theme">
      {/* Background Grid Overlay */}
      <div className="board-overlay-grid" />

      {/* Navigation Header */}
      <nav className="gallery-nav">
        <div className="nav-left">
          <h1 className="nav-brand">
            <Icons.Disc size={20} color="#b45309" className="spin-slow" /> Groove
          </h1>
          <span className="nav-tagline">Analog Crate</span>
        </div>
        <div className="nav-right">
          <span className="nav-credit">Curated by @nandini</span>
        </div>
      </nav>

      {/* Turntable & Crate Dashboard */}
      <main className="spins-main">
        <VinylPlayer
          projects={PROJECTS}
          onOpenProject={handleOpenProject}
        />
      </main>

      {/* Fullscreen sandboxed app preview frame */}
      {openProject && (
        <div className="fullscreen-app-overlay">
          <div className="overlay-navbar">
            <span className="overlay-title">
              <Icons.Eye size={16} /> Platter Live // {openProject.title}
            </span>
            <div className="overlay-controls">
              <button
                className={`overlay-btn ${showCode ? 'active' : ''}`}
                onClick={() => {
                  synthAudio.playClick();
                  setShowCode(!showCode);
                }}
              >
                <Icons.Code size={16} /> Edit Album Code
              </button>
              <button
                className="overlay-btn overlay-close"
                onClick={() => {
                  synthAudio.playClick();
                  setOpenProject(null);
                  setShowCode(false);
                }}
              >
                <Icons.X size={16} /> Close Platter
              </button>
            </div>
          </div>
          <div className="overlay-body">
            <iframe
              title={openProject.title}
              src={sandboxCode ? undefined : openProject.url}
              srcDoc={sandboxCode || undefined}
              className="overlay-iframe"
              sandbox="allow-scripts allow-same-origin"
            />
            {showCode && (
              <CodeInspector
                projectId={openProject.id}
                onRunCode={handleRunCode}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
