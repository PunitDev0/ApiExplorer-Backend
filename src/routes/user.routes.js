import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

router.route('/register').post(registerUser);

// Google Sign-In
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email, name: req.user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('jwt', token, {
            httpOnly: true, // Prevents JavaScript access
            secure: process.env.NODE_ENV === 'production', // Use Secure in production (HTTPS)
            sameSite: 'strict', // Prevents CSRF
            maxAge: 3600000 // 1 hour in milliseconds
        });
        res.redirect('http://localhost:3000');
    }
);

// GitHub Sign-In
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
    passport.authenticate('github', { session: false, failureRedirect: '/auth/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email, name: req.user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        res.redirect('http://localhost:3000');
    }
);

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('http://localhost:3000/login');
});

// Check current user
router.get('/user', (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

export default router;