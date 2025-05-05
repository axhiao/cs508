import mysql from 'mysql2/promise';
import dbConfig from '@/config/database';

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
};

// Test the connection when the module is loaded
testConnection();

export default pool; 
