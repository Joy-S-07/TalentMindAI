/**
 * models/RankingHistory.js - Stores ranking run metadata + CSV data per user.
 *
 * Each document represents one completed ranking job so the user
 * can revisit and re-download CSVs from their profile.
 * The actual CSV strings are stored directly so they survive Flask restarts.
 */

const mongoose = require("mongoose");

const rankingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      default: "Untitled Job",
      trim: true,
    },
    jobDescriptionSnippet: {
      type: String,
      default: "",
      maxlength: 500,
    },
    totalCandidates: {
      type: Number,
      default: 0,
    },
    returnedCandidates: {
      type: Number,
      default: 0,
    },
    fileName: {
      type: String,
      default: "",
    },
    // Raw CSV data strings stored directly in the database
    csvTop10: {
      type: String,
      default: "",
    },
    csvTop50: {
      type: String,
      default: "",
    },
    csvTop100: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index: one entry per (user, job)
rankingHistorySchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("RankingHistory", rankingHistorySchema);
