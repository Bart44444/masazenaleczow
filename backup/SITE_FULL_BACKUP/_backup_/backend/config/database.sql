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