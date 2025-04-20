import { asyncHandler } from "../utils/asyncHandler.js";
import User from '../Models/User.js'
const registerUser = asyncHandler( (async (req , res) => {
    
    try {
        const { email, password, name } = req.body;
    
        // Validate input
        if (!email || !name || !password) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email, name, and password are required' 
          });
        }
    
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already registered' 
          });
        }
    
        // Create new user
        const user = new User({
          email,
          password, // Will be hashed by pre-save hook
          name
        });
    
        // Save user to database
        await user.save();
    
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
    
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          user: userResponse
        });
    
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error during registration',
          error: error.message 
        });
      }
}))

export {registerUser};