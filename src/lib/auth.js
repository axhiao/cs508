import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import authConfig from '@/config/auth';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwtSecret);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password with hash
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
}; 