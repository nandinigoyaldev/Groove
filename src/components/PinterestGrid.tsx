import React, { useState, useEffect } from 'react';
import type { Project, GuestbookEntry } from '../types';
import { Search, Pin, Heart, ArrowRight } from 'lucide-react';
import { synthAudio } from '../lib/audio';

interface PinterestGridProps {
  projects: Project[];
  onOpenProject: (proj: Project) => void;
}

interface VibePin {
  id: string;
  type: 'vibe';
  title: string;
  desc: string;
  image: string;
  tags: string[];
}

export const PinterestGrid: React.FC<PinterestGridProps> = ({ projects, onOpenProject }) => {
  const [search, setSearch] = useState('');
  const [savedPins, setSavedPins] = useState<string[]>([]);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    fetchEntries();
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
          { id: '1', name: 'Nandini', message: 'Welcome to Pinetab! Log your message directly in the guestbook pin! ☕🌿', timestamp: 'Today' },
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
      timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
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

  const toggleSavePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    synthAudio.playClick();
    if (savedPins.includes(id)) {
      setSavedPins((prev) => prev.filter((p) => p !== id));
    } else {
      setSavedPins((prev) => [...prev, id]);
    }
  };

  const getThemeImage = (id: string) => {
    switch (id) {
      case 'aura-weather':
        return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=400&q=80'; // Aesthetic cloudy storm
      case 'rock-paper-scissors':
        return 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&q=80'; // Chalkboard gaming style
      case 'hotel-landing':
        return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80'; // Cozy resort lobby
      case 'paradigm-shift':
        return 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=400&q=80'; // Aesthetic abstract vector art
      default:
        return '';
    }
  };

  // Aesthetic decorative vibe pins
  const vibePins: VibePin[] = [
    {
      id: 'vibe-1',
      type: 'vibe',
      title: 'Warm Tea & Soft Rain',
      desc: 'Taking a cozy breather. Keep creating, keep coding.',
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80',
      tags: ['#cozy', '#rainy', '#relaxation'],
    },
    {
      id: 'vibe-2',
      type: 'vibe',
      title: 'Indoor Plants & Ceramics',
      desc: 'Surround your workspace with life and warm clay hues.',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
      tags: ['#plants', '#ceramic', '#workspace'],
    },
    {
      id: 'vibe-3',
      type: 'vibe',
      title: 'Aesthetic Lofi Evenings',
      desc: 'Soft yellow desk lights and cassette tape soundtracks.',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
      tags: ['#lofi', '#lights', '#ambient'],
    },
  ];

  // Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tech.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVibes = vibePins.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pinetab-container">
      {/* Search Header */}
      <header className="pinetab-header">
        <div className="pinetab-search-bar">
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Search aesthetic projects or vibes (e.g. #cozy, weather, html)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Masonry Grid */}
      <div className="pinetab-masonry">
        {/* Project Pins */}
        {filteredProjects.map((proj) => (
          <div key={proj.id} className="pin-card" onClick={() => onOpenProject(proj)}>
            <div className="pin-image-wrapper">
              <img src={getThemeImage(proj.id)} alt={proj.title} className="pin-image" />
              <div className="pin-overlay">
                <button
                  className={`pin-save-btn ${savedPins.includes(proj.id) ? 'saved' : ''}`}
                  onClick={(e) => toggleSavePin(proj.id, e)}
                >
                  {savedPins.includes(proj.id) ? 'Saved' : 'Save'}
                </button>
                <div className="pin-link">
                  <span>Enter Sandbox</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
            <div className="pin-footer">
              <h3 className="pin-title">{proj.title}</h3>
              <p className="pin-desc">{proj.description}</p>
              <div className="pin-tags">
                {proj.tech.map((t, i) => (
                  <span key={i} className="pin-tag-link">#{t.toLowerCase().replace(' ', '')}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Guestbook Card Pin */}
        <div className="pin-card guestbook-pin">
          <div className="pin-header-cozy">
            <Pin size={16} color="#b45309" />
            <span>COMMUNITY REGISTRY</span>
          </div>
          
          <form onSubmit={handleSignRegistry} className="pin-form">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              placeholder="Write a warm note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button type="submit" className="pin-form-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Posting...' : 'Post Note'}
            </button>
            {status === 'success' && <span className="pin-form-success">Note posted successfully!</span>}
          </form>

          {/* Comments List */}
          <div className="pin-registry-list">
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="pin-registry-item">
                <div className="p-header">
                  <span className="p-name">{entry.name}</span>
                  <span className="p-date">{entry.timestamp}</span>
                </div>
                <p className="p-msg">"{entry.message}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Aesthetic Vibe Pins */}
        {filteredVibes.map((v) => (
          <div key={v.id} className="pin-card vibe-card">
            <div className="pin-image-wrapper">
              <img src={v.image} alt={v.title} className="pin-image" />
              <div className="pin-overlay">
                <button
                  className={`pin-save-btn ${savedPins.includes(v.id) ? 'saved' : ''}`}
                  onClick={(e) => toggleSavePin(v.id, e)}
                >
                  <Heart size={14} fill={savedPins.includes(v.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            <div className="pin-footer">
              <h3 className="pin-title">{v.title}</h3>
              <p className="pin-desc">{v.desc}</p>
              <div className="pin-tags">
                {v.tags.map((t, i) => (
                  <span key={i} className="pin-tag-link">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
