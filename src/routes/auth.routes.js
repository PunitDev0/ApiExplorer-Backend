import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { registerUser, loginUser, getCurrentUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Manual auth routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Protected route to get the current user
router.route("/me").get(protect, getCurrentUser);

// Logout route to clear the cookie
router.route("/logout").post((req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Make sure secure flag is true in production
    sameSite: "None",
    path: "/",
    expires: new Date(0), // Expire the cookie immediately
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Google OAuth routes
router.route("/google").get(
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.route("/google/callback").get(
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`,
  }),
  (req, res, next) => {
    try {
      if (!req.user) {
        // If authentication failed, redirect with error message
        const errorMessage = req.authInfo?.message || "Authentication failed";
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent(errorMessage)}`);
      }

      // Create a JWT token
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      // Set the token in the cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure flag for production
        sameSite: "None", // Important for cross-site cookie handling
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // Token expiration (1 week)
      });

      res.redirect(process.env.FRONTEND_URL || "http://localhost:3000/");
    } catch (error) {
      next(error); // Pass the error to the global error handler
    }
  }
);

// GitHub OAuth routes
router.route("/github").get(
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.route("/github/callback").get(
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`,
  }),
  (req, res, next) => {
    try {
      if (!req.user) {
        // If authentication failed, redirect with error message
        const errorMessage = req.authInfo?.message || "Authentication failed";
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent(errorMessage)}`);
      }

      // Create a JWT token
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      // Set the token in the cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure flag for production
        sameSite: "None", // Important for cross-site cookie handling
        maxAge: 7 * 24 * 60 * 60 * 1000, // Token expiration (1 week)
      });

      res.redirect(process.env.FRONTEND_URL || "http://localhost:3000/");
    } catch (error) {
      next(error); // Pass the error to the global error handler
    }
  }
);

export default router;
