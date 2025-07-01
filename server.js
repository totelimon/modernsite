const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const SECRET = 'REPLACE_THIS_WITH_A_SECRET_KEY';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// In-memory storage for demo (in production, use a proper database)
const users = [];

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required.' });

  // Check if email already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) return res.status(400).json({ error: 'Email already registered.' });

  const hash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password_hash: hash,
    created_at: new Date()
  };
  
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'All fields required.' });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
  
  if (!bcrypt.compareSync(password, user.password_hash))
    return res.status(400).json({ error: 'Invalid credentials.' });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// User info endpoint
app.get('/api/user', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = 8000;
  app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));
}

// For Vercel deployment
module.exports = app; 