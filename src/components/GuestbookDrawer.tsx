import React, { useState, useEffect } from 'react';
import type { GuestbookEntry } from '../types';
import * as Icons from 'lucide-react';

interface GuestbookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestbookDrawer: React.FC<GuestbookDrawerProps> = ({ isOpen, onClose }) => {
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
          { id: '1', name: 'Nandini (Dev)', message: 'Welcome to the gallery! I hope you enjoy checking out these sub-projects. ✨', timestamp: new Date().toLocaleDateString() },
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
      <div
        className={`drawer-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`drawer-container glass-dark ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2><Icons.BookOpen size={20} /> Guestbook</h2>
          <button className="drawer-close" onClick={onClose}>
            <Icons.X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <form onSubmit={handleSubmit} className="drawer-form">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="drawer-input"
              required
            />
            <textarea
              placeholder="Leave a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="drawer-input drawer-textarea"
              required
            />
            <button type="submit" className="drawer-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Signing...' : 'Sign Guestbook'}
            </button>
            {status === 'success' && (
              <span className="drawer-success">Successfully signed!</span>
            )}
          </form>

          <div className="drawer-entries-divider">Messages</div>

          <div className="drawer-list">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <div key={entry.id} className="drawer-card">
                  <div className="drawer-card-header">
                    <span className="drawer-card-name">{entry.name}</span>
                    <span className="drawer-card-time">{entry.timestamp}</span>
                  </div>
                  <p className="drawer-card-msg">{entry.message}</p>
                </div>
              ))
            ) : (
              <div className="drawer-empty">Be the first to sign the guestbook!</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
