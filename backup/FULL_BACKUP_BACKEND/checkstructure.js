const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Połączono z bazą danych\n');
    
    // Sprawdź tabele
    console.log('=== TABELE W BAZIE ===');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(tables);
    console.log('');
    
    // Sprawdź strukturę tabeli bookings
    try {
      console.log('=== STRUKTURA TABELI bookings ===');
      const [columns] = await connection.query('DESCRIBE bookings');
      console.table(columns);
      console.log('');
      
      // Pokaż przykładowe dane
      const [rows] = await connection.query('SELECT * FROM bookings LIMIT 3');
      if (rows.length > 0) {
        console.log('=== PRZYKŁADOWE DANE ===');
        console.table(rows);
      } else {
        console.log('Tabela jest pusta');
      }
      
    } catch (error) {
      console.log('❌ Tabela bookings nie istnieje');
      console.log('Musisz ją utworzyć - użyj fix-database.sql\n');
    }
    
    // Sprawdź strukturę tabeli services
    try {
      console.log('\n=== STRUKTURA TABELI services ===');
      const [columns] = await connection.query('DESCRIBE services');
      console.table(columns);
      
      const [rows] = await connection.query('SELECT * FROM services LIMIT 3');
      if (rows.length > 0) {
        console.log('=== PRZYKŁADOWE USŁUGI ===');
        console.table(rows);
      } else {
        console.log('Tabela services jest pusta - dodaj usługi');
      }
      
    } catch (error) {
      console.log('❌ Tabela services nie istnieje');
      console.log('Musisz ją utworzyć - użyj setup.sql\n');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error('\nSprawdź:');
    console.error('1. Czy plik .env ma poprawne dane');
    console.error('2. Czy baza danych istnieje');
    console.error('3. Czy użytkownik ma uprawnienia\n');
  }
}

checkStructure();