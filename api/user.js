const jwt = require('jsonwebtoken');
const { User } = require('./db');

const SECRET = 'REPLACE_THIS_WITH_A_SECRET_KEY';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });
    
  } catch (error) {
    console.error('User info error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.status(500).json({ error: 'Server error getting user info.' });
  }
}; 