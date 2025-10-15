# masazenaleczow
 Masaże Nałęczów Home Page Adam Proceder 2025
# 🌿 RELAKS NAŁĘCZÓW - Kompletna Instrukcja Wdrożenia

## 📦 Struktura Projektu

```
relaks-naleczow/
├── index.html                 # Główna strona (pełny kod)
├── README.md                  # Ta instrukcja
├── assets/
│   └── logo.png              # Logo (opcjonalne)
├── backend/                   # Opcjonalny backend
│   ├── server.js             # Node.js server
│   ├── package.json          # Zależności
│   └── config/
│       └── database.js       # Konfiguracja DB
└── docs/
    └── deployment.md         # Szczegółowe wdrożenie
```

-----

## 🚀 SZYBKI START (5 minut)

### Opcja 1: Hosting Statyczny (NAJŁATWIEJSZE)

#### **A) Netlify (POLECANE)**

1. **Utwórz konto na [Netlify.com](https://netlify.com)**
1. **Przeciągnij folder z `index.html` na dashboard**
1. **Gotowe!** Strona online w 30 sekund

**LUB przez CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### **B) Vercel**

1. **Zainstaluj Vercel CLI:**

```bash
npm i -g vercel
```

1. **Deploy:**

```bash
vercel --prod
```

#### **C) GitHub Pages**

1. **Utwórz repo na GitHub**
1. **Wrzuć `index.html`:**

```bash
git init
git add index.html
git commit -m "Initial commit"
git remote add origin https://github.com/TWOJE_KONTO/relaks-naleczow.git
git push -u origin main
```

1. **Settings → Pages → Deploy from branch: main**
1. **Strona dostępna na: `https://TWOJE_KONTO.github.io/relaks-naleczow`**

-----

## 🔐 PANEL ADMINISTRACYJNY

### Domyślne Dane Logowania:

```
🔑 Login:    admin
🔒 Hasło:    admin123
📱 MFA:      Generowany automatycznie (6 cyfr)
```

### Jak Się Zalogować:

1. Kliknij **“Panel”** w prawym górnym rogu menu
1. Wprowadź login i hasło
1. Kliknij **“Dalej”**
1. Zobaczysz kod MFA na ekranie (np. `456789`)
1. Przepisz ten kod do pola poniżej
1. Kliknij **“Weryfikuj”**
1. ✅ Jesteś w panelu!

### Funkcje Panelu:

- ✏️ **Edytuj Usługi** - dodawaj/usuwaj masaże
- 💰 **Edytuj Cennik** - synchronizowane z usługami
- 🖼️ **Edytuj Galerię** - zarządzaj zdjęciami
- ⭐ **Edytuj Opinie** - dodawaj testimoniale
- 📅 **Rezerwacje** - podgląd (wymaga backend)

### Zmiana Hasła (WAŻNE dla produkcji):

Edytuj w `index.html` linię ~760:

```javascript
// ZNAJDŹ:
if (login === 'admin' && password === 'admin123') {

// ZMIEŃ NA:
if (login === 'admin' && password === 'TWOJE_NOWE_HASLO') {
```

-----

## 🎨 PERSONALIZACJA

### 1. Zmiana Kolorów

W sekcji `<style>` znajdź `:root` (linia ~26):

```css
:root {
    --primary: #2d5016;      /* Główny zielony */
    --secondary: #4a7c2c;    /* Jasny zielony */
    --accent: #8b7355;       /* Brązowy akcent */
    --beige: #f5f1e8;        /* Tło beżowe */
    --light-green: #e8f5e9;  /* Jasny zielony */
}
```

### 2. Zmiana Danych Kontaktowych

Znajdź sekcję `#contact` (linia ~430):

```html
<!-- Zmień na swoje dane: -->
<strong>Adres</strong><br>
ul. Zdrojowa 12, 24-150 Nałęczów

<strong>Telefon</strong><br>
+48 123 456 789

<strong>Email</strong><br>
kontakt@relaksnaleczow.pl
```

### 3. Zmiana Logo

```html
<!-- Linia ~180, zamień: -->
<div class="logo">
    <i class="fas fa-spa"></i>
    Relaks Nałęczów
</div>

<!-- NA: -->
<div class="logo">
    <img src="assets/logo.png" alt="Logo" style="height: 40px;">
</div>
```

### 4. Dodawanie Usług

**Automatycznie przez Panel Admin** lub ręcznie w JavaScript (linia ~570):

```javascript
services: [
    {
        icon: 'fa-spa',
        title: 'Nowa Usługa',
        description: 'Opis usługi...',
        price: '200 zł',
        duration: '60 min',
        image: 'https://images.unsplash.com/photo-...'
    }
]
```

### 5. Zmiana Mapy Google

Linia ~450, wygeneruj nowy embed na [Google Maps](https://www.google.com/maps):

```html
<iframe src="TWÓJ_LINK_EMBED" ...></iframe>
```

-----

## 📱 INTEGRACJE

### WhatsApp

Zmień numer w linii ~920:

```javascript
whatsappBtn.href = 'https://wa.me/48123456789';
// NA:
whatsappBtn.href = 'https://wa.me/TWOJ_NUMER';
```

### Google Analytics

Dodaj przed `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Facebook Pixel

```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'TWOJE_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

-----

## 🗄️ BACKEND (Opcjonalny)

### Node.js + Express + MySQL

#### 1. Instalacja

```bash
mkdir backend && cd backend
npm init -y
npm install express mysql2 bcrypt jsonwebtoken cors dotenv
```

#### 2. `server.js`

```javascript
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
```

#### 3. Baza Danych

```sql
CREATE DATABASE relaks_naleczow;
USE relaks_naleczow;

CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  icon VARCHAR(50),
  title VARCHAR(100),
  description TEXT,
  price VARCHAR(20),
  duration VARCHAR(20),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  service VARCHAR(100),
  date DATE,
  message TEXT,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE testimonials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  text TEXT,
  stars INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Uruchomienie

```bash
node server.js
```

-----

## 📧 EMAIL & SMS

### SendGrid (Email)

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'klient@email.com',
  from: 'kontakt@relaksnaleczow.pl',
  subject: 'Potwierdzenie rezerwacji',
  html: '<strong>Dziękujemy za rezerwację!</strong>',
};

sgMail.send(msg);
```

### Twilio (SMS)

```bash
npm install twilio
```

```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

client.messages.create({
  body: 'Potwierdzenie rezerwacji na masaż!',
  from: '+48123456789',
  to: '+48987654321'
});
```

-----

## 🔒 BEZPIECZEŃSTWO

### 1. SSL/HTTPS

**Netlify/Vercel:** Automatyczne SSL ✅

**Własny serwer:**

```bash
sudo certbot --nginx -d relaksnaleczow.pl
```

### 2. Environment Variables

Utwórz `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=twoje_haslo
JWT_SECRET=super_tajny_klucz_123
SENDGRID_API_KEY=SG.xxxxx
TWILIO_SID=ACxxxxx
TWILIO_AUTH=xxxxx
```

### 3. Backup Bazy Danych

```bash
# Codziennie o 2:00
0 2 * * * mysqldump -u root -p relaks_naleczow > backup_$(date +\%Y\%m\%d).sql
```

-----

## 📊 SEO & MARKETING

### 1. Google Search Console

1. Idź na [search.google.com/search-console](https://search.google.com/search-console)
1. Dodaj swoją domenę
1. Zweryfikuj właściciela
1. Prześlij sitemap.xml

### 2. Google My Business

1. [business.google.com](https://business.google.com)
1. Dodaj firmę: “Relaks Nałęczów”
1. Zweryfikuj adres
1. Dodaj zdjęcia i godziny otwarcia

### 3. Facebook Business

1. Utwórz stronę Facebook
1. Dodaj przycisk “Zarezerwuj”
1. Link do strony

-----

## 🐛 TROUBLESHOOTING

### Problem: Panel Admin się nie otwiera

✅ **Rozwiązanie:** Sprawdź czy JavaScript nie jest zablokowany w przeglądarce

### Problem: Formularz nie wysyła danych

✅ **Rozwiązanie:** Otwórz konsolę (F12) i sprawdź błędy. Dane są logowane do konsoli.

### Problem: Zdjęcia się nie ładują

✅ **Rozwiązanie:** Sprawdź połączenie internetowe lub zamień URL na lokalne pliki

### Problem: Mapa nie wyświetla się

✅ **Rozwiązanie:** Wygeneruj nowy iframe embed z Google Maps

### Problem: Dark mode nie działa

✅ **Rozwiązanie:** Wyczyść cache przeglądarki (Ctrl+Shift+Del)

-----

## 📞 WSPARCIE

**Email:** support@relaksnaleczow.pl  
**Tel:** +48 123 456 789  
**Dokumentacja:** README.md

-----

## 📝 CHANGELOG

### v1.0.0 (2025-01-15)

- ✅ Pierwsza wersja produkcyjna
- ✅ Panel Admin z MFA
- ✅ 6 usług masażu
- ✅ Galeria, FAQ, Statystyki
- ✅ Responsywny design
- ✅ Dark mode

-----

## 📄 LICENCJA

© 2025 Relaks Nałęczów. Wszystkie prawa zastrzeżone.

-----

## ✅ CHECKLIST PRZED URUCHOMIENIEM

- [ ] Zmieniono hasło admina
- [ ] Zaktualizowano dane kontaktowe
- [ ] Dodano własne logo
- [ ] Skonfigurowano mapę Google
- [ ] Zmieniono numer WhatsApp
- [ ] Dodano Google Analytics
- [ ] Przetestowano formularz
- [ ] Zweryfikowano na mobile
- [ ] Włączono SSL/HTTPS
- [ ] Utworzono backup

-----

🎉 **GOTOWE! Strona jest wdrożona i działa!** 🌿

Powodzenia z salonem masażu! 💚