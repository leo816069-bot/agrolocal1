CREATE DATABASE IF NOT EXISTS agrolocal;
USE agrolocal;

CREATE TABLE IF NOT EXISTS vendedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(20),
    encargado VARCHAR(100),
    ubicacion VARCHAR(255),
    productos TEXT,
    foto_granja LONGTEXT 
);