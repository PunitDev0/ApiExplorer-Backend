import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import winston from "winston";
import connectDB from "./DB/DB_Connection.js";
import "./config/passport.js"; // Passport config import
import "dotenv/config"; // Load environment variables

const app = express();

// Initialize Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// In development, also log to console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// // Validate critical environment variables
// const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "CORS_URL"];
// const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
// if (missingEnvVars.length > 0) {
//   logger.error(`Missing environment variables: ${missingEnvVars.join(", ")}`);
//   process.exit(1);
// }

// Define CORS origin
const BASE_URL = process.env.CORS_URL; // e.g., https://your-frontend.com

// Trust proxies for production (e.g., Render, Vercel, AWS)
app.set("trust proxy", 1);

// Setup CORS options
const corsOptions = {
  origin: BASE_URL,
  credentials: true, // Allow cookies and session data
  optionsSuccessStatus: 200, // For legacy browser support
};

// Middleware setup
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Compress responses
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } })); // HTTP request logging
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Session setup with MongoDB store
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    }).on("error", (err) => {
      logger.error("MongoStore error:", err);
    }),
    cookie: {
      secure: true, // Always secure in production
      sameSite: "None", // Required for cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevent client-side access
    },
  })
);

// Initialize Passport after session
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB()
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

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
  res.json({ message: "Backend is running!" });
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});



// // Graceful shutdown
// process.on("SIGTERM", () => {
//   logger.info("SIGTERM received. Shutting down gracefully...");
//   server.close(() => {
//     logger.info("Server closed.");
//     process.exit(0);
//   });
// });

export { app };