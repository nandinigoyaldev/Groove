const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'guestbook.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  const initialData = [
    {
      id: '1',
      name: 'Nandini (Dev)',
      message: 'Welcome to the gallery! I hope you enjoy checking out these sub-projects. ✨',
      timestamp: new Date().toLocaleDateString()
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

// GET entries
app.get('/api/guestbook', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read data' });
    }
    res.json(JSON.parse(data));
  });
});

// POST new entry
app.post('/api/guestbook', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  const newEntry = {
    id: Date.now().toString(),
    name: name.trim(),
    message: message.trim(),
    timestamp: new Date().toLocaleDateString()
  };

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read database' });
    }

    const db = JSON.parse(data);
    db.unshift(newEntry);

    fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Failed to write to database' });
      }
      res.status(201).json(db);
    });
  });
});

// Serve frontend assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
