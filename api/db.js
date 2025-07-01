// Shared in-memory database for all API functions
// In production, use a real database like MongoDB Atlas or Supabase

const mongoose = require('mongoose');

// MongoDB connection string - you'll replace this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@your-cluster.mongodb.net/modernsite?retryWrites=true&w=majority';

console.log('MongoDB URI configured:', !!process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB successfully!');
}).catch((error) => {
  console.error('MongoDB connection error:', error.message);
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('MongoDB connection opened!');
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = { User, db }; 