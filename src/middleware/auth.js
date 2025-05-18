// middleware/auth.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log(token);
  
  if (!token) {
    return res.status(401).json({ message: "Token nahi mila bhai! Login kar pehle!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log();
    
    req.user = { _id: decoded.userId }; // Set req.user._id
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token bhai!" });
  }
};