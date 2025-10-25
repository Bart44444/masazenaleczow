// debug.js - Test połączenia z bazą danych
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('=== DIAGNOSTYKA POŁĄCZENIA ===\n');
  
  // 1. Test zmiennych środowiskowych
  console.log('1. Zmienne środowiskowe:');
  console.log('   DB_HOST:', process.env.DB_HOST || '❌ BRAK');
  console.log('   DB_USER:', process.env.DB_USER || '❌ BRAK');
  console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '✓ Ustawione' : '❌ BRAK');
  console.log('   DB_NAME:', process.env.DB_NAME || '❌ BRAK');
  console.log('   PORT:', process.env.PORT || 3000);
  console.log('');

  // 2. Test połączenia z bazą
  console.log('2. Test połączenia z bazą danych...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('   ✅ Połączenie z bazą OK');
    
    // Test zapytania
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('   ✅ Zapytanie testowe OK:', rows[0]);
    
    await connection.end();
  } catch (error) {
    console.error('   ❌ Błąd połączenia z bazą:');
    console.error('   ', error.message);
    console.error('   Kod błędu:', error.code);
    console.error('');
    console.log('   Możliwe przyczyny:');
    console.log('   - Nieprawidłowe dane w pliku .env');
    console.log('   - Baza danych nie istnieje');
    console.log('   - Użytkownik nie ma uprawnień');
    console.log('   - MySQL nie działa na serwerze');
  }
  
  console.log('');
  console.log('3. Informacje o środowisku:');
  console.log('   Node.js:', process.version);
  console.log('   Platform:', process.platform);
  console.log('   CWD:', process.cwd());
  console.log('   __dirname:', __dirname);
  
  console.log('\n=== KONIEC DIAGNOSTYKI ===');
}

testConnection();