const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.APP_PORT || 3000;

// CORS
app.use(cors({
  origin: '*', // Zezwalaj na wszystkie w testach, potem ogranicz
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Database pool
let pool;

async function createPool() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 10000
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Database connected');
    connection.release();
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    // Nie przerywaj - pozwól serwerowi działać bez bazy (dla testów)
  }
}

// === ROUTES ===

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Relaks Nałęczów API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      services: 'GET /api/services',
      bookings: 'POST /api/bookings',
      getBookings: 'GET /api/bookings'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: pool ? 'connected' : 'disconnected'
  });
});

// Get services
app.get('/api/services', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ 
      success: false, 
      error: 'Baza danych niedostępna' 
    });
  }
  
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM services WHERE active = 1 ORDER BY display_order'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Services error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd pobierania usług',
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
  console.log('Booking request:', req.body);
  
  const { name, phone, email, service, date, message } = req.body;

  if (!name || !phone || !service) {
    return res.status(400).json({ 
      success: false, 
      error: 'Imię, telefon i usługa są wymagane' 
    });
  }

  if (!pool) {
    return res.status(503).json({ 
      success: false, 
      error: 'Baza danych niedostępna' 
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO bookings (name, phone, email, service, date, message, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [name, phone, email || null, service, date || null, message || null]
    );

    console.log('✅ Booking created:', result.insertId);

    res.json({ 
      success: true, 
      message: 'Rezerwacja została przyjęta',
      bookingId: result.insertId 
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd podczas tworzenia rezerwacji',
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get bookings
app.get('/api/bookings', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ 
      success: false, 
      error: 'Baza danych niedostępna' 
    });
  }
  
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd pobierania rezerwacji',
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Catch all 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    hint: 'Dostępne endpointy: GET /, GET /api/health, GET /api/services, POST /api/bookings'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Błąd serwera',
    message: err.message
  });
});

// Start
async function startServer() {
  await createPool();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('================================');
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`   Database: ${pool ? '✅ OK' : '❌ Error'}`);
    console.log('================================');
    console.log('');
    console.log('Dostępne endpointy:');
    console.log(`  GET  http://localhost:${PORT}/`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  GET  http://localhost:${PORT}/api/services`);
    console.log(`  POST http://localhost:${PORT}/api/bookings`);
    console.log('');
  });
}

startServer();