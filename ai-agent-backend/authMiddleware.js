// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export const parseAuthToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.auth = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.auth = null;
      return next();
    }

    // Get Clerk's public key from environment variables
    const CLERK_PEM_PUBLIC_KEY = process.env.CLERK_PEM_PUBLIC_KEY;
    
    const decoded = jwt.verify(token, CLERK_PEM_PUBLIC_KEY);
    req.auth = {
      userId: decoded.sub // Clerk uses 'sub' for user ID
    };
    next();
  } catch (error) {
    console.error('Auth token parsing error:', error);
    req.auth = null;
    next();
  }
};