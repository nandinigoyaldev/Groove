import React, { useState, useEffect } from 'react';
import type { Project, GuestbookEntry } from '../types';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { synthAudio } from '../lib/audio';

interface VinylPlayerProps {
  projects: Project[];
  onOpenProject: (proj: Project) => void;
  onSelectProject?: (proj: Project | null) => void;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({ projects, onOpenProject, onSelectProject }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLinerNotes, setShowLinerNotes] = useState(false);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isMuted, setIsMuted] = useState(true);

  // Load entries for Guestbook record
  useEffect(() => {
    fetchEntries();
    if (onSelectProject) {
      onSelectProject(projects[0]);
    }
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/guestbook');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        throw new Error('API server unavailable');
      }
    } catch (error) {
      const localData = localStorage.getItem('nexus_guestbook');
      if (localData) {
        setEntries(JSON.parse(localData));
      } else {
        const initialMock: GuestbookEntry[] = [
          { id: '1', name: 'Nandini', message: 'Welcome to Spins! Place the guest log on the platter. 📻🌿', timestamp: new Date().toLocaleDateString() },
        ];
        setEntries(initialMock);
        localStorage.setItem('nexus_guestbook', JSON.stringify(initialMock));
      }
    }
  };

  const handleSignRegistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus('loading');
    const newEntry: GuestbookEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toLocaleDateString(),
    };

    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        const updated = await response.json();
        setEntries(updated);
        setStatus('success');
      } else {
        throw new Error('API server error');
      }
    } catch (error) {
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('nexus_guestbook', JSON.stringify(updatedEntries));
      setStatus('success');
    }

    setName('');
    setMessage('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleSelectRecord = (idx: number) => {
    synthAudio.playClick();
    setSelectedIdx(idx);
    setIsPlaying(false);
    setShowLinerNotes(false);
    
    const proj = idx < projects.length ? projects[idx] : null;
    if (onSelectProject) {
      onSelectProject(proj);
    }
    if (proj) {
      synthAudio.setAmbiance(proj.particleType);
    }
  };

  const handlePlayRecord = () => {
    synthAudio.playClick();
    setIsPlaying(true);
    
    // Play a vinyl scratch sound trigger
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
    oscGain.gain.setValueAtTime(0.08, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.35);

    // If guestbook record, show liner log booklet
    if (selectedIdx === projects.length) {
      setTimeout(() => {
        setShowLinerNotes(true);
      }, 1000);
    } else {
      // Enter project sandbox
      setTimeout(() => {
        onOpenProject(projects[selectedIdx]);
      }, 1200);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    synthAudio.toggleMute(nextMute);
    if (!nextMute) {
      const proj = selectedIdx < projects.length ? projects[selectedIdx] : null;
      if (proj) {
        synthAudio.setAmbiance(proj.particleType);
      }
    }
  };

  const getRecordColor = (idx: number) => {
    if (idx === projects.length) return '#1f2937'; // Charcoal guestbook vinyl
    const colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
    return colors[idx % colors.length];
  };

  return (
    <div className="vinyl-console">
      {/* Crate Slot */}
      <div className="record-crate glass">
        <h3 className="crate-header">VINYL ARCHIVE</h3>
        <div className="crate-rack">
          {projects.map((proj, idx) => (
            <div
              key={proj.id}
              className={`crate-sleeve ${selectedIdx === idx ? 'active' : ''}`}
              onClick={() => handleSelectRecord(idx)}
            >
              <div className="sleeve-artwork" style={{ background: `linear-gradient(135deg, ${proj.themeColor}1a, ${proj.themeColor}88)` }}>
                <span className="art-title">{proj.title}</span>
                <span className="art-cat">LP // 0{idx + 1}</span>
              </div>
            </div>
          ))}

          {/* Guestbook special record */}
          <div
            className={`crate-sleeve guest-sleeve ${selectedIdx === projects.length ? 'active' : ''}`}
            onClick={() => handleSelectRecord(projects.length)}
          >
            <div className="sleeve-artwork guestbook-art">
              <span className="art-title">Guest Registry</span>
              <span className="art-cat">LP // GUEST</span>
            </div>
          </div>
        </div>

        {/* Selected Record Spec Sheet (Back of Sleeve) */}
        <div className="sleeve-back-details">
          {selectedIdx < projects.length ? (
            <>
              <h2 className="sleeve-title">{projects[selectedIdx].title}</h2>
              <p className="sleeve-desc">{projects[selectedIdx].description}</p>
              <div className="sleeve-meta">
                <span>SYSTEM // OPERATIONAL</span>
                <span>CATALOG // 0{selectedIdx + 1}</span>
              </div>
            </>
          ) : (
            <>
              <h2 className="sleeve-title">Community Guest Book</h2>
              <p className="sleeve-desc">Place this LP on the platter to sign your name and view comments.</p>
              <div className="sleeve-meta">
                <span>SYSTEM // PUBLIC</span>
                <span>CATALOG // GUEST</span>
              </div>
            </>
          )}
          <button className="play-sleeve-btn" onClick={handlePlayRecord} disabled={isPlaying}>
            <Play size={13} fill="currentColor" /> Play Album
          </button>
        </div>
      </div>

      {/* Turntable Platter Visual */}
      <div className="turntable-chassis glass">
        <div className={`turntable-platter ${isPlaying ? 'spin' : ''}`}>
          <div className="vinyl-grooves" />
          
          {/* Placed Record Label Center */}
          <div
            className="vinyl-center-label"
            style={{
              backgroundColor: getRecordColor(selectedIdx),
            }}
          >
            <div className="label-core" />
            <span className="label-name">
              {selectedIdx < projects.length ? projects[selectedIdx].title : 'Guest Registry'}
            </span>
          </div>
        </div>

        {/* Tonearm mechanical arm */}
        <div className={`tonearm-arm ${isPlaying ? 'play-pos' : ''}`}>
          <div className="tonearm-base" />
          <div className="tonearm-weight" />
          <div className="tonearm-needle" />
        </div>

        {/* Vintage Audio Toggle Control */}
        <div className="turntable-audio-control">
          <button
            className={`audio-retro-btn ${isMuted ? 'muted' : 'active'}`}
            onClick={handleToggleMute}
            title={isMuted ? "Unmute system audio" : "Mute system audio"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isMuted ? 'AUDIO OFF' : 'AUDIO ON'}</span>
            <span className={`led-dot ${isMuted ? 'off' : 'on'}`} />
          </button>
        </div>

        <div className="turntable-branding">SPINS // LP-80</div>
      </div>

      {/* Guestbook Liner Notes Log Overlay */}
      {showLinerNotes && (
        <div className="liner-notes-overlay glass">
          <button className="liner-close" onClick={() => setShowLinerNotes(false)}>Close Liner Notes</button>
          <div className="liner-columns">
            {/* Form */}
            <form onSubmit={handleSignRegistry} className="liner-form">
              <h3>SIGN REGISTRY</h3>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Inscribe a note..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button type="submit" className="liner-submit">Inscribe Note</button>
              {status === 'success' && <span className="liner-success">Registry updated.</span>}
            </form>

            {/* List */}
            <div className="liner-registry">
              <h3>PREVIOUS SIGNATURES</h3>
              <div className="registry-cards">
                {entries.map((entry) => (
                  <div key={entry.id} className="registry-entry">
                    <div className="entry-header">
                      <span className="entry-name">{entry.name}</span>
                      <span className="entry-date">{entry.timestamp}</span>
                    </div>
                    <p className="entry-msg">"{entry.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
