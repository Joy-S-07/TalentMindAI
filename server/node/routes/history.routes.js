/**
 * routes/history.routes.js - Ranking history CRUD (protected).
 *
 * GET    /api/history          → List all ranking runs for the user
 * POST   /api/history          → Save a new ranking run
 * DELETE /api/history/:id      → Delete a specific ranking run
 */

const { Router } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RankingHistory = require("../models/RankingHistory");

const router = Router();

// ── Auth middleware ──────────────────────────────────────────────────
async function protect(req, res, next) {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authorized." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, error: "User not found." });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token." });
  }
}

// ── GET /api/history ────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const history = await RankingHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, history });
  } catch (error) {
    console.error("[history/get]", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch history." });
  }
});

// ── POST /api/history ───────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { jobId, jobTitle, jobDescriptionSnippet, totalCandidates, returnedCandidates, fileName } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, error: "jobId is required." });
    }

    // Upsert: if the user already has this jobId saved, update it
    const entry = await RankingHistory.findOneAndUpdate(
      { userId: req.user._id, jobId },
      {
        userId: req.user._id,
        jobId,
        jobTitle: jobTitle || "Untitled Job",
        jobDescriptionSnippet: (jobDescriptionSnippet || "").slice(0, 500),
        totalCandidates: totalCandidates || 0,
        returnedCandidates: returnedCandidates || 0,
        fileName: fileName || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error("[history/post]", error.message);
    res.status(500).json({ success: false, error: "Failed to save history." });
  }
});

// ── DELETE /api/history/:id ─────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const entry = await RankingHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // ensure user can only delete their own
    });

    if (!entry) {
      return res.status(404).json({ success: false, error: "Entry not found." });
    }

    res.json({ success: true, message: "Deleted." });
  } catch (error) {
    console.error("[history/delete]", error.message);
    res.status(500).json({ success: false, error: "Failed to delete entry." });
  }
});

module.exports = router;
