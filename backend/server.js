require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/database");
const { logAction } = require("./middleware/auditLog");

// Routes
const authRoutes = require("./routes/auth");
const citizenRoutes = require("./routes/citizen");
const authorityRoutes = require("./routes/authority");
const surveillanceRoutes = require("./routes/surveillance");

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logAction);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/authority", authorityRoutes);
app.use("/api/surveillance", surveillanceRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VigilLens Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to VigilLens API",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 VigilLens running on port ${PORT}`);
});