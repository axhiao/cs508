const pool = require('./db');

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS goods_trading');
    await connection.query('USE goods_trading');

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        wallet_balance DECIMAL(10, 2) DEFAULT 1000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        avatar_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS listings (
        listing_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        seller_id INT NOT NULL,
        category_id INT NOT NULL,
        condition_type ENUM('New', 'Like New', 'Good', 'Fair', 'Poor') NOT NULL,
        location VARCHAR(100),
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(user_id),
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
      )
    `);

    // Insert sample categories
    await connection.query(`
      INSERT IGNORE INTO categories (name, description) VALUES
      ('Electronics', 'Electronic devices and accessories'),
      ('Furniture', 'Home and office furniture'),
      ('Clothing', 'Apparel and fashion items'),
      ('Books', 'Books, textbooks, and publications'),
      ('Sports', 'Sports equipment and gear')
    `);

    // Insert sample users (password: password123)
    await connection.query(`
      INSERT IGNORE INTO users (username, email, password_hash, wallet_balance) VALUES
      ('john_doe', 'john@example.com', '$2a$10$X7UrH5QxX5QxX5QxX5QxX.5QxX5QxX5QxX5QxX5QxX5QxX5QxX5Qx', 1000.00),
      ('jane_smith', 'jane@example.com', '$2a$10$X7UrH5QxX5QxX5QxX5QxX.5QxX5QxX5QxX5QxX5QxX5QxX5QxX5Qx', 1000.00),
      ('bob_wilson', 'bob@example.com', '$2a$10$X7UrH5QxX5QxX5QxX5QxX.5QxX5QxX5QxX5QxX5QxX5QxX5QxX5Qx', 1000.00)
    `);

    // Insert sample listings
    await connection.query(`
      INSERT IGNORE INTO listings (title, description, price, seller_id, category_id, condition_type, location) VALUES
      ('iPhone 12 Pro', 'Excellent condition, comes with original box and accessories', 699.99, 1, 1, 'Like New', 'New York'),
      ('Leather Sofa', 'Comfortable 3-seater sofa, barely used', 499.99, 2, 2, 'Good', 'Los Angeles'),
      ('Nike Running Shoes', 'Size 10, worn only twice', 79.99, 3, 5, 'Like New', 'Chicago'),
      ('Python Programming Book', 'Clean copy, no highlights', 29.99, 1, 4, 'Good', 'Boston'),
      ('Gaming Laptop', 'High-performance gaming laptop, 1 year old', 899.99, 2, 1, 'Good', 'Seattle')
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase(); 