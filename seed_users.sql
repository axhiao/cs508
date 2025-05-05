USE goods_trading;

-- Sample Users (passwords are hashed versions of 'password123')
INSERT INTO users (username, email, password_hash, wallet_balance) VALUES
('john_doe', 'john@example.com', '$2b$10$8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM', 1000.00),
('jane_smith', 'jane@example.com', '$2b$10$8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM', 1000.00),
('bob_wilson', 'bob@example.com', '$2b$10$8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM', 1000.00),
('alice_brown', 'alice@example.com', '$2b$10$8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM', 1000.00),
('charlie_davis', 'charlie@example.com', '$2b$10$8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM', 1000.00); 