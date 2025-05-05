
# Used Goods Trading Platform

This documentation provides a comprehensive guide for developing the Used Goods Trading Platform. The implementation focuses on the basic functionality required for a course project while maintaining a clean architecture and following best practices.

---

## Project Overview

This document outlines the development specifications for a used goods trading platform built with Next.js, Tailwind CSS, and MySQL. The platform allows users to buy and sell used items in a virtual marketplace environment. This is just a course project. So you just need to implement some basic functions of this web application to my professor. It's not for practical use. I have helped you set up the mysql mcp. If you need to talk to mysql, you can talk to it and you should have the write permission. Create some fake data if you need it for the demo. 

## Tech Stack

- **Frontend**: Next.js with React components, Tailwind CSS for styling
- **Backend**: Next.js API routes
- **Database**: MySQL
- **Authentication**: JWT-based authentication
- **Image Storage**: Local file system (for course project simplicity)

## Main Functions

### 1. User Management
- User registration with username, email, and password
- User authentication (login/logout)
- User profile management
- Virtual wallet for transactions

### 2. Listing Management
- Create new listings for used goods
- Edit existing listings
- Delete listings
- View detailed information about listings
- Search and filter listings by categories, price, condition, etc.

### 3. Transaction System
- Make offers on listed items
- Accept or reject offers
- Complete transactions using virtual currency
- Transaction history tracking

### 4. Review and Rating System
- Rate users after completed transactions
- Leave reviews for sellers/buyers
- View user ratings and reviews

### 5. Messaging System
- Direct messaging between users
- Notifications for offers, messages, and transaction updates


## configuration 
```
DATABASE_URL="mysql://root:my123456@127.0.0.1:3306/goods_trading"
JWT_SECRET="x8kZkRo9L8m4mD4JH3nX8kD2z7RmUo9PfZt0Q6aFvV0="
```
## Database Schema

```sql
-- Database Creation
CREATE DATABASE IF NOT EXISTS goods_trading;
USE goods_trading;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    wallet_balance DECIMAL(10, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Categories Table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Listings Table
CREATE TABLE listings (
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
);

-- Listing Images Table
CREATE TABLE listing_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE
);

-- Offers Table
CREATE TABLE offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    buyer_id INT NOT NULL,
    offer_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

-- Transactions Table
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    seller_id INT NOT NULL,
    buyer_id INT NOT NULL,
    offer_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
    FOREIGN KEY (seller_id) REFERENCES users(user_id),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    FOREIGN KEY (offer_id) REFERENCES offers(offer_id)
);

-- Messages Table
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

-- Reviews Table
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    transaction_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_id) REFERENCES users(user_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_type ENUM('Message', 'Offer', 'Transaction', 'Review', 'System') NOT NULL,
    reference_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Sample Data Insertion for Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Furniture', 'Home and office furniture'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books, textbooks, and publications'),
('Sports', 'Sports equipment and gear');
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user info

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/listings` - Get user's listings
- `GET /api/users/:id/transactions` - Get user's transactions

### Listings
- `GET /api/listings` - Get all listings (with filtering)
- `GET /api/listings/:id` - Get specific listing details
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/categories` - Get all categories

### Offers
- `POST /api/offers` - Create new offer
- `GET /api/offers/received` - Get offers received
- `GET /api/offers/sent` - Get offers sent
- `PUT /api/offers/:id` - Update offer status
- `DELETE /api/offers/:id` - Delete offer

### Transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id` - Update transaction status

### Messages
- `POST /api/messages` - Send new message
- `GET /api/messages/:userId` - Get conversation with specific user
- `PUT /api/messages/:id/read` - Mark message as read

### Reviews
- `POST /api/reviews` - Create new review
- `GET /api/reviews/user/:id` - Get reviews for a user

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## Application Structure 



```
cs508_proj/
├── public/
│   ├── images/
│   └── uploads/         # For storing listing images
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API Routes
│   │   │   ├── auth/    # Authentication endpoints
│   │   │   ├── listings/
│   │   │   ├── offers/
│   │   │   ├── transactions/
│   │   │   ├── messages/
│   │   │   ├── reviews/
│   │   │   └── users/
│   │   ├── (routes)/    # Front-end routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── listings/
│   │   │   ├── profile/
│   │   │   ├── messages/
│   │   │   └── transactions/
│   │   ├── layout.js
│   │   └── page.js      # Home page
│   ├── components/      # Reusable React components
│   │   ├── ui/          # UI components
│   │   ├── forms/       # Form components
│   │   ├── listings/    # Listing-related components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utility functions and helpers
│   │   ├── db.js        # Database connection
│   │   ├── auth.js      # Authentication utilities
│   │   └── validators.js # Input validation
│   └── models/          # Data models and database interactions
│       ├── user.js
│       ├── listing.js
│       ├── offer.js
│       ├── transaction.js
│       ├── message.js
│       └── review.js
├── middleware.js        # Next.js middleware for auth
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```


