const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const SECRET = 'REPLACE_THIS_WITH_A_SECRET_KEY';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// SQLite DB setup
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) return console.error(err.message);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required.' });

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (row) return res.status(400).json({ error: 'Email already registered.' });

    const hash = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error.' });
        const token = jwt.sign({ id: this.lastID, email }, SECRET, { expiresIn: '7d' });
        res.json({ token });
      }
    );
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'All fields required.' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
    if (!bcrypt.compareSync(password, user.password_hash))
      return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`)); 