const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('./db');

const SECRET = 'REPLACE_THIS_WITH_A_SECRET_KEY';

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

  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password and create user
    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password_hash: hash
    });

    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, email }, SECRET, { expiresIn: '7d' });
    res.json({ token });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
}; 