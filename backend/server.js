const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'relaks_naleczow'
});

// API Endpoints
app.get('/api/services', (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/bookings', (req, res) => {
  const { name, phone, email, service, date, message } = req.body;
  db.query(
    'INSERT INTO bookings (name, phone, email, service, date, message) VALUES (?, ?, ?, ?, ?, ?)',
    [name, phone, email, service, date, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, id: result.insertId });
    }
  );
});

app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body;
  // Implementacja autoryzacji
  // ...
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
