const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || process.env.APP_PORT || 3000;

// CORS
app.use(cors({
  origin: '*',
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
  }
}

// Email transporter
let emailTransporter;

function createEmailTransporter() {
    try {
        emailTransporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: process.env.EMAIL_AUTH_REQUIRED === 'true' ? {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            } : undefined,
            tls: { rejectUnauthorized: false }
        });
        console.log('✅ Email transporter configured');
    } catch (error) {
        console.error('❌ Email transporter error:', error.message);
    }
}
// Helper: Send booking confirmation email to customer
async function sendBookingConfirmationEmail(bookingData) {
    if (!emailTransporter) {
        console.warn('⚠️ Email transporter not configured - skipping email send');
        return false;
    }

    try {
        const { name, email, service, date, message, bookingId } = bookingData;

        if (!email) {
            console.warn('⚠️ No email provided - skipping confirmation email');
            return false;
        }

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Relaks Nałęczów" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Potwierdzenie rezerwacji - Relaks Nałęczów (#${bookingId})`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: white; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Relaks Nałęczów</h1>
              <h2>Potwierdzenie rezerwacji</h2>
            </div>
            <div class="content">
              <p>Dziękujemy za złożenie rezerwacji, <strong>${name}</strong>!</p>
              
              <div class="details">
                <h3>Szczegóły rezerwacji:</h3>
                <p><strong>Numer rezerwacji:</strong> #${bookingId}</p>
                <p><strong>Usługa:</strong> ${service}</p>
                ${date ? `<p><strong>Data:</strong> ${new Date(date).toLocaleString('pl-PL')}</p>` : ''}
                ${message ? `<p><strong>Wiadomość:</strong> ${message}</p>` : ''}
              </div>
              
              <p>Skontaktujemy się z Tobą w ciągu 24 godzin w celu potwierdzenia terminu.</p>
              
              <p>W razie pytań prosimy o kontakt:</p>
              <p>📞 Telefon: +48 123 456 789<br>
                 📧 Email: bertk.tarka@gmail.com<br>
                 📍 Adres: Nałęczów, ul. Spa 123</p>
            </div>
            <div class="footer">
              <p>Wiadomość wygenerowana automatycznie. Prosimy nie odpowiadać.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Potwierdzenie rezerwacji - Relaks Nałęczów (#${bookingId})

Dziękujemy za złożenie rezerwacji, ${name}!

Szczegóły rezerwacji:
- Numer rezerwacji: #${bookingId}
- Usługa: ${service}
${date ? `- Data: ${new Date(date).toLocaleString('pl-PL')}` : ''}
${message ? `- Wiadomość: ${message}` : ''}

Skontaktujemy się z Tobą w ciągu 24 godzin w celu potwierdzenia terminu.

W razie pytań prosimy o kontakt:
📞 Telefon: +48 123 456 789
📧 Email: baretk.tarka@gmail.com
📍 Adres: Nałęczów, ul. Spa 123

Wiadomość wygenerowana automatycznie. Prosimy nie odpowiadać.
      `
        };

        const info = await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email sent to ${email}, Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error('❌ Confirmation email sending error:', error);
        return false;
    }
}

// Helper: Send booking notification to admin (******)
async function sendAdminNotification(bookingData) {
    if (!emailTransporter) {
        console.warn('⚠️ Email transporter not configured - skipping admin notification');
        return false;
    }

    try {
        const { name, email, phone, service, date, message, bookingId } = bookingData;

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Relaks Nałęczów" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL, // Twój stały adres email
            subject: `📋 Nowa rezerwacja #${bookingId} - ${name}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: white; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .customer-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Nowa rezerwacja!</h1>
              <p>Numer rezerwacji: #${bookingId}</p>
            </div>
            <div class="content">
              <div class="customer-info">
                <h3>Dane klienta:</h3>
                <p><strong>Imię i nazwisko:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email || '<i>nie podano</i>'}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
              </div>
              
              <div class="details">
                <h3>Szczegóły rezerwacji:</h3>
                <p><strong>Usługa:</strong> ${service}</p>
                ${date ? `<p><strong>Preferowana data:</strong> ${new Date(date).toLocaleString('pl-PL')}</p>` : ''}
                ${message ? `<p><strong>Wiadomość od klienta:</strong> ${message}</p>` : ''}
                <p><strong>Data złożenia rezerwacji:</strong> ${new Date().toLocaleString('pl-PL')}</p>
              </div>
              
              <p><strong>Status:</strong> <span style="color: #ffc107; font-weight: bold;">OCZEKUJE NA POTWIERDZENIE</span></p>
              
              <p style="margin-top: 20px; padding: 10px; background: #fff3cd; border-radius: 5px;">
                <strong>⚠️ Wymagana akcja:</strong> Skontaktuj się z klientem w ciągu 24 godzin.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
📋 NOWA REZERWACJA #${bookingId}

DANE KLIENTA:
- Imię i nazwisko: ${name}
- Email: ${email || 'nie podano'}
- Telefon: ${phone}

SZCZEGÓŁY REZERWACJI:
- Usługa: ${service}
${date ? `- Preferowana data: ${new Date(date).toLocaleString('pl-PL')}` : ''}
${message ? `- Wiadomość od klienta: ${message}` : ''}
- Data złożenia: ${new Date().toLocaleString('pl-PL')}

Status: OCZEKUJE NA POTWIERDZENIE

⚠️ WYMAGANA AKCJA: Skontaktuj się z klientem w ciągu 24 godzin.
      `
        };

        const info = await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Admin notification sent to bertk.tarka@gmail.com for booking #${bookingId}`);
        return true;

    } catch (error) {
        console.error('❌ Admin notification email error:', error);
        return false;
    }
}


// Helper: Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper: Generate MFA code
function generateMFACode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store active MFA codes in memory (in production use Redis)
const mfaCodes = new Map(); // { username: { code, expiry } }

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
      getBookings: 'GET /api/bookings',
      testimonials: 'GET /api/testimonials',
      gallery: 'GET /api/gallery',
      adminLogin: 'POST /api/admin/login',
      adminVerifyMFA: 'POST /api/admin/verify-mfa'
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
      'SELECT id, icon, title, description, price, duration, image_url as image FROM services ORDER BY id'
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

// Get testimonials
app.get('/api/testimonials', async (req, res) => {
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
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Testimonials error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd pobierania opinii',
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get gallery
app.get('/api/gallery', async (req, res) => {
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
      'SELECT * FROM gallery ORDER BY id'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Gallery error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd pobierania galerii',
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

      // Prepare booking data for emails
      const bookingData = {
          bookingId: result.insertId,
          name,
          email,
          phone,
          service,
          date,
          message
      };

      // Send emails asynchronously (don't wait for response)
      Promise.all([
          sendBookingConfirmationEmail(bookingData),
          sendAdminNotification(bookingData)
      ]).then(([confirmationResult, adminResult]) => {
          console.log(`📧 Emails sent - Confirmation: ${confirmationResult}, Admin: ${adminResult}`);
      }).catch(error => {
          console.error('❌ Email sending error:', error);
      });

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

// Get bookings (requires auth - simplified for now)
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

// === ADMIN AUTHENTICATION ===

// Admin login - Step 1
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Login i hasło są wymagane' 
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
    
    // Hash the password
    const passwordHash = hashPassword(password);
    
    // Check user credentials
    const [users] = await connection.query(
      'SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?',
      [username, passwordHash]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Nieprawidłowy login lub hasło' 
      });
    }

    const user = users[0];

    // Generate MFA code
    const mfaCode = generateMFACode();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store MFA code
    mfaCodes.set(username, { code: mfaCode, expiry, userId: user.id });

    // In production, send MFA code via SMS/Email
    console.log(`MFA Code for ${username}: ${mfaCode}`);

    res.json({ 
      success: true, 
      message: 'Kod MFA został wygenerowany',
      mfaCode: mfaCode, // In production, don't send this!
      requireMFA: true
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Błąd podczas logowania',
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Admin login - Step 2: Verify MFA
app.post('/api/admin/verify-mfa', async (req, res) => {
  const { username, mfaCode } = req.body;

  if (!username || !mfaCode) {
    return res.status(400).json({ 
      success: false, 
      error: 'Login i kod MFA są wymagane' 
    });
  }

  // Check if MFA code exists
  const storedMFA = mfaCodes.get(username);
  
  if (!storedMFA) {
    return res.status(401).json({ 
      success: false, 
      error: 'Kod MFA nie został wygenerowany lub wygasł' 
    });
  }

  // Check if expired
  if (Date.now() > storedMFA.expiry) {
    mfaCodes.delete(username);
    return res.status(401).json({ 
      success: false, 
      error: 'Kod MFA wygasł' 
    });
  }

  // Verify code
  if (storedMFA.code !== mfaCode) {
    return res.status(401).json({ 
      success: false, 
      error: 'Nieprawidłowy kod MFA' 
    });
  }

  // Code is valid - clean up
  mfaCodes.delete(username);

  // In production, generate JWT token here
  const sessionToken = crypto.randomBytes(32).toString('hex');

  res.json({ 
    success: true, 
    message: 'Zalogowano pomyślnie',
    sessionToken: sessionToken,
    user: {
      username: username,
      userId: storedMFA.userId
    }
  });
});

// Catch all 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
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
    createEmailTransporter();

    app.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('================================');
        console.log(`✅ Server: http://localhost:${PORT}`);
        console.log(`   Database: ${pool ? '✅ OK' : '❌ Error'}`);
        console.log(`   Email: ${emailTransporter ? '✅ Configured' : '❌ Not configured'}`);
        console.log('================================');
        console.log('');
        console.log('Dostępne endpointy:');
        console.log(`  GET  /api/health`);
        console.log(`  GET  /api/services`);
        console.log(`  GET  /api/testimonials`);
        console.log(`  GET  /api/gallery`);
        console.log(`  POST /api/bookings`);
        console.log(`  GET  /api/bookings`);
        console.log(`  POST /api/admin/login`);
        console.log(`  POST /api/admin/verify-mfa`);
        console.log('');
        console.log('📧 Email destinations:');
        console.log(`   • Customer confirmation → email from form`);
        console.log(`   • Admin notification → bertk.tarka@gmail.com`);
        console.log('');
    });
}

startServer();