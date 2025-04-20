import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import connectDB from "./DB/DB_Connection.js";
import './config/passport.js'; // Passport config import karo

const app = express();

// CORS setup
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// Middleware setup
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Session setup for Passport
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Passport initialize karo
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connect karo
connectDB()
    .then(() => console.log("DB connected ho gaya!"))
    .catch((err) => console.log("DB connection mein dikkat:", err));

// Routes
import authRouter from './routes/auth.routes.js';
import workspaceRouter from './routes/workspace.routes.js';
import request from './routes/request.routes.js';
import collectionRoutes from "./routes/collection.route.js";
import errorExplain from './routes/apiErrorExplain.route.js'
app.use('/auth', authRouter);
app.use('/api', workspaceRouter);
app.use('/api', request);
app.use('/api', errorExplain);

app.use("/api/collections", collectionRoutes);
// Test route
app.get('/', (req, res) => {
    res.send("Backend chal raha hai bhai!");
});



export { app };