CREATE DATABASE relaks_naleczow;
USE relaks_naleczow;

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  service VARCHAR(100),
  date DATE,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);