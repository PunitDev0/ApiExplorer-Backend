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
  console.log(req.body);
  
  const { email, password } = req.body;

  // Step 1: Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Step 2: Find user and select password explicitly
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  try {
    // Step 3: Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Step 4: Generate token and strip password
    const token = generateTokenAndSetCookie(res, user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    // Step 5: Respond with success
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token found",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
});

export { registerUser, loginUser, getCurrentUser };