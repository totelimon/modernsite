const jwt = require('jsonwebtoken');

const SECRET = 'REPLACE_THIS_WITH_A_SECRET_KEY';

// In-memory storage (in production, use a proper database)
let users = [];

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

  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}; 