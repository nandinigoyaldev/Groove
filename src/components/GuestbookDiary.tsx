import React, { useState, useEffect } from 'react';
import type { GuestbookEntry } from '../types';
import * as Icons from 'lucide-react';

interface GuestbookDiaryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestbookDiary: React.FC<GuestbookDiaryProps> = ({ isOpen, onClose }) => {
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
          { id: '1', name: 'Nandini', message: 'Welcome to my scrapbook! Leave a note here in my journal. ☕🍃', timestamp: new Date().toLocaleDateString() },
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
      <div
        className={`diary-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <div className={`diary-container ${isOpen ? 'open' : ''}`}>
        <div className="diary-book">
          {/* Close button */}
          <button className="diary-close-btn" onClick={onClose}>
            <Icons.X size={18} />
          </button>

          {/* Left Page (Sign Form) */}
          <div className="diary-page page-left">
            <h2 className="diary-title">
              <Icons.BookOpen size={18} /> Scrapbook Journal
            </h2>
            <p className="diary-intro">Write a warm message, sign your name, and pin it to my diary!</p>
            
            <form onSubmit={handleSubmit} className="diary-form">
              <div className="diary-field">
                <label>Visitor Name</label>
                <input
                  type="text"
                  placeholder="e.g., Alice Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="diary-field">
                <label>Journal Message</label>
                <textarea
                  placeholder="Leave your notes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="diary-submit-btn" disabled={status === 'loading'}>
                {status === 'loading' ? 'Inscribing...' : 'Pin Message'}
              </button>
              {status === 'success' && (
                <div className="diary-success-msg">Message pinned successfully!</div>
              )}
            </form>
          </div>

          {/* Right Page (Comments) */}
          <div className="diary-page page-right">
            <h3 className="diary-heading">Previous Entries</h3>
            <div className="diary-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div key={entry.id} className="diary-note-card">
                    <div className="note-header">
                      <span className="note-name">{entry.name}</span>
                      <span className="note-time">{entry.timestamp}</span>
                    </div>
                    <p className="note-msg">"{entry.message}"</p>
                  </div>
                ))
              ) : (
                <div className="note-empty">The diary is empty. Be the first to leave a message!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
