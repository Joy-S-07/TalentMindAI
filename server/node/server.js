/**
 * server.js - Main Express entry point for TalentMind.
 *
 * Runs on port 4000 (configurable via .env).
 * Connects to MongoDB Atlas, sets up JWT auth, proxies ranking to Flask.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Load environment variables FIRST
dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const { verifyMailer } = require("./utils/mailer.util");

// ── Connect to MongoDB ──────────────────────────────────────────────
connectDB();

// ── Verify mailer on startup ─────────────────────────────────────────
verifyMailer();

// ── App ─────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// ── Routes ──────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// ── Health check ────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "talentmind-server",
    port: PORT,
  });
});

// ── Global error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err.message);
  res.status(500).json({ success: false, error: err.message });
});

// ── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] TalentMind server listening on http://localhost:${PORT}`);
});
