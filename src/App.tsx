import { useState } from 'react';
import type { Project } from './types';
import { VinylPlayer } from './components/VinylPlayer';
import { CodeInspector } from './components/CodeInspector';
import { ParticleSystem } from './components/ParticleSystem';
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
    title: 'Hotel',
    description: 'A luxurious dark-themed hotel desk with interactive room keys and custom access cards.',
    longDescription: 'Browse boutique rooms as mechanical key tags hanging on hooks. Checking in generates a gorgeous custom digital entry keycard pass with custom typewriter sounds and writes to a live guest registry ledger.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Vite'],
    themeColor: '#b45309',
    gradient: '#faf9f5',
    particleType: 'sparkles',
    url: '/projects/hotel-landing/index.html',
  },
  {
    id: 'paradigm-shift',
    title: 'Wave',
    description: 'A vintage 8-step analog drum machine and audio sequencer.',
    longDescription: 'Program beats on an interactive retro synthesizer console. Toggle glowing step LEDs across four sound tracks (Kick, Snare, Hi-hat, Beep), adjust tempo (BPM) dynamically, and hear Web Audio API synthesis.',
    tech: ['HTML', 'CSS', 'Web Audio API', 'JavaScript'],
    themeColor: '#3b82f6',
    gradient: '#faf9f5',
    particleType: 'lasers',
    url: '/projects/paradigm-shift/index.html',
  },
  {
    id: 'dice-tumbler',
    title: 'Crank',
    description: 'A mechanical polyhedral dice shaker and probability ledger.',
    longDescription: 'Roll polyhedral dice inside an antique mahogany shaker cabinet. Create custom text-decision decks, adjust dice skins, crank the mechanical winding gear, and watch organic gravity physics with full statistical tracking.',
    tech: ['HTML', 'CSS', 'Web Audio API', 'JavaScript'],
    themeColor: '#d97706',
    gradient: '#faf9f5',
    particleType: 'sparkles',
    url: '/projects/dice-tumbler/index.html',
  },
];

export default function App() {
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(PROJECTS[0]);
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
      {/* Dynamic Background Particle System */}
      {selectedProject && (
        <ParticleSystem
          type={selectedProject.particleType}
          color={selectedProject.themeColor}
        />
      )}

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
          onSelectProject={setSelectedProject}
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
