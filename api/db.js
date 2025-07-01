// Shared in-memory database for all API functions
// In production, use a real database like MongoDB Atlas or Supabase

let users = [];

const db = {
  // Add a new user
  createUser: (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      created_at: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  // Find user by email
  findUserByEmail: (email) => {
    return users.find(user => user.email === email);
  },

  // Find user by ID
  findUserById: (id) => {
    return users.find(user => user.id === id);
  },

  // Get all users (for debugging)
  getAllUsers: () => {
    return users;
  }
};

module.exports = db; 