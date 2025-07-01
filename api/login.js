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

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields required.' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials.' });
  }
  
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(400).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({ token });
}; 