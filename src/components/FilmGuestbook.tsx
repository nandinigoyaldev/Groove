import React, { useState, useEffect } from 'react';
import type { GuestbookEntry } from '../types';
import * as Icons from 'lucide-react';

interface FilmGuestbookProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilmGuestbook: React.FC<FilmGuestbookProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      fetchEntries();
    }
  }, [isOpen]);

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
          { id: '1', name: 'Nandini (Dev)', message: 'Aperture Showcase initialized. Develop your thoughts here! 🎞️🖤', timestamp: new Date().toLocaleDateString() },
        ];
        setEntries(initialMock);
        localStorage.setItem('nexus_guestbook', JSON.stringify(initialMock));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        throw new Error('API server post failure');
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

  return (
    <>
      {/* Backdrop */}
      <div className={`film-backdrop ${isOpen ? 'show' : ''}`} onClick={onClose} />

      {/* Film Negative Strip Drawer */}
      <div className={`film-strip-container ${isOpen ? 'open' : ''}`}>
        <div className="film-strip-chassis">
          {/* Film Canister controls */}
          <div className="film-canister glass">
            <div className="canister-top" />
            <div className="canister-label">
              <h3>KODAK 400</h3>
              <p>Guest Log</p>
            </div>
            <button className="canister-close-btn" onClick={onClose}>
              <Icons.X size={18} />
            </button>

            {/* Inscribe form inside canister */}
            <form onSubmit={handleSubmit} className="canister-form">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <textarea
                placeholder="Inscribe message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button type="submit" className="canister-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Exposing...' : 'Develop Note'}
              </button>
              {status === 'success' && <span className="canister-success">Logged!</span>}
            </form>
          </div>

          {/* Film Roll strip */}
          <div className="film-negatives-strip">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <div key={entry.id} className="film-frame">
                  {/* Sprocket holes */}
                  <div className="sprockets sprockets-top">
                    {[...Array(6)].map((_, i) => <div key={i} className="sprocket-hole" />)}
                  </div>

                  <div className="frame-content">
                    <span className="frame-meta">ISO 400 // {entry.timestamp}</span>
                    <p className="frame-msg">"{entry.message}"</p>
                    <span className="frame-sign">— {entry.name}</span>
                  </div>

                  <div className="sprockets sprockets-bottom">
                    {[...Array(6)].map((_, i) => <div key={i} className="sprocket-hole" />)}
                  </div>
                </div>
              ))
            ) : (
              <div className="film-frame-empty">Film strip unexposed. Write a log!</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
