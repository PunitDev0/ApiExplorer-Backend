// backend/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../Models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Try to read from req.cookies
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 2. Fallback to raw cookie string parsing
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, curr) => {
      const [key, value] = curr.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token not found',
    });
  }

  console.log(token);
  

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
});