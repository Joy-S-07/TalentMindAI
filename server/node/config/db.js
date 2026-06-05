/**
 * config/db.js - MongoDB connection using Mongoose.
 *
 * Retries connection on failure instead of crashing the server,
 * so the app stays alive while you fix Atlas Network Access.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail faster (10s instead of 30s)
    });
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[db] MongoDB connection error: ${error.message}`);
    console.error(`[db] ⚠ If using Atlas, make sure your IP is whitelisted:`);
    console.error(`[db]   Atlas → Network Access → Add IP Address → Allow Access from Anywhere`);
    console.error(`[db] Retrying in 5 seconds...`);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
