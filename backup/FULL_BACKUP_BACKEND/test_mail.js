require('dotenv').config();
const nodemailer = require('nodemailer');

async function quickTest() {
  console.log('\n🧪 Szybki test SMTP\n');
  
  // Konfiguracja
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: process.env.EMAIL_AUTH_REQUIRED === 'true' ? {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    } : undefined,
    tls: { rejectUnauthorized: false }
  };
  
  console.log('Konfiguracja:', config.host + ':' + config.port);
  console.log('Autentykacja:', config.auth ? 'TAK' : 'NIE');
    console.log(process.env.EMAIL_FROM);
    console.log(process.env.ADMIN_EMAIL);
  const transporter = nodemailer.createTransport(config);
  
  try {
    // Test połączenia
    console.log('⏳ Testowanie połączenia...');
    await transporter.verify();
    console.log('✅ Połączenie OK\n');
    
    // Wysyłka
    console.log('⏳ Wysyłanie emaila...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'Test SMTP - ' + new Date().toLocaleString('pl-PL'),
      html: '<h1>✅ Test OK!</h1><p>Email wysłany o ' + new Date().toLocaleString('pl-PL') + '</p>',
      text: 'Test OK! Email wysłany o ' + new Date().toLocaleString('pl-PL')
    });
    
    console.log('✅ Email wysłany!');
    console.log('   ID:', info.messageId);
    console.log('   Do:', process.env.ADMIN_EMAIL);
    console.log('\n✅ SUKCES!\n');
    
  } catch (error) {
    console.error('❌ BŁĄD:', error.message);
    console.log('\nSprawdź:');
    console.log('1. Czy serwer SMTP działa');
    console.log('2. Poprawność EMAIL_USER i EMAIL_PASS');
    console.log('3. Czy port', config.port, 'jest otwarty\n');
    process.exit(1);
  }
}

quickTest();