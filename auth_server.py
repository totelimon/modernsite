from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
import jwt
import datetime
import os

app = Flask(__name__)
CORS(app)

SECRET_KEY = 'REPLACE_THIS_WITH_A_SECRET_KEY'

# Initialize database
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'All fields required.'}), 400
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Check if email already exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Email already registered.'}), 400
    
    # Hash password and create user
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    cursor.execute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        (username, email, password_hash.decode('utf-8'))
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Generate JWT token
    token = jwt.encode(
        {'id': user_id, 'email': email, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY,
        algorithm='HS256'
    )
    
    return jsonify({'token': token})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'All fields required.'}), 400
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Get user by email
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'Invalid credentials.'}), 400
    
    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
        return jsonify({'error': 'Invalid credentials.'}), 400
    
    # Generate JWT token
    token = jwt.encode(
        {'id': user[0], 'email': user[2], 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY,
        algorithm='HS256'
    )
    
    return jsonify({'token': token})

if __name__ == '__main__':
    init_db()
    print("Auth server running on http://localhost:3000")
    app.run(host='0.0.0.0', port=3000, debug=True) 