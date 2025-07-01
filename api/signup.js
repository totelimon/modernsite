const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = 'REPLACE_THIS_WITH_A_SECRET_KEY';

// In-memory storage (in production, use a proper database)
let users = [];

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required.' });
  }

  // Check if email already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

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
}; 