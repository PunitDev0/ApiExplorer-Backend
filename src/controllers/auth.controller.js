import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../Models/User.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const isProduction = process.env.NODE_ENV === "production";

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email already registered' 
    });
  }

  const user = new User({ email, password, name });
  await user.save();

  const token = generateTokenAndSetCookie(res, user._id);
  
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: userResponse,
    token,
  });
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = generateTokenAndSetCookie(res, user._id);
  
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: userResponse,
    token,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // Get token from cookies
  const token = req?.cookies?.token;

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token found",
    });
  }

  try {
    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await User.findById(decoded.userId).select("-password");

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    // Handle JWT verification errors (e.g., invalid or expired token)
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
});

export { registerUser, loginUser, getCurrentUser };