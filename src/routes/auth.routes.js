import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { registerUser, loginUser, getCurrentUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

// Manual auth routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Protected route to get the current user
router.route("/me").get(protect, getCurrentUser);

// Logout route to clear the cookie
router.route("/logout").post((req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
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
        return res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent("Authentication failed")}`
        );
      }

      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      if (!isProduction) {
        console.log("Google OAuth token set:", token);
      }
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`);
    } catch (err) {
      next(err);
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
        return res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=${encodeURIComponent("Authentication failed")}`
        );
      }

      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      if (!isProduction) {
        console.log("GitHub OAuth token set:", token);
      }
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`);
    } catch (err) {
      next(err);
    }
  }
);

export default router;