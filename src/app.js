import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo"; // For persistent session store
import passport from "passport";
import connectDB from "./DB/DB_Connection.js";
import "./config/passport.js"; // Passport config import

const app = express();

// Trust proxies for production (Render, Vercel, etc.)
app.set("trust proxy", 1);

// Setup CORS options
const corsOptions = {
    origin: 'https://apiexplorer.vercel.app', // Replace with your frontend URL
    credentials: true, // Allow cookies and session data
  };
  
  // Apply CORS middleware
  app.use(cors(corsOptions));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Session setup with MongoDB store
app.use(
  session({
    secret: process.env.JWT_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Your MongoDB connection string
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Cross-origin in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB()
  .then(() => console.log("DB connected ho gaya!"))
  .catch((err) => console.log("DB connection mein dikkat:", err));

// Routes
import authRouter from "./routes/auth.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";
import request from "./routes/request.routes.js";
import collectionRoutes from "./routes/collection.route.js";
import errorExplain from "./routes/apiErrorExplain.route.js";

app.use("/api/auth", authRouter);
app.use("/api", workspaceRouter);
app.use("/api", request);
app.use("/api", errorExplain);
app.use("/api/collections", collectionRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend chal raha hai bhai!");
});

export { app };