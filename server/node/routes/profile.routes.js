/**
 * routes/profile.routes.js - User profile routes (protected).
 *
 * GET  /api/profile       → Get current user's profile
 * PUT  /api/profile       → Update current user's profile
 */

const { Router } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = Router();

// ── Auth middleware (inline for this route file) ─────────────────────
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

// ── GET /api/profile ────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle || "",
        institution: user.institution || "",
        githubUrl: user.githubUrl || "",
        portfolio: user.portfolio || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("[profile/get]", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch profile." });
  }
});

// ── PUT /api/profile ────────────────────────────────────────────────
router.put("/", protect, async (req, res) => {
  try {
    const allowedFields = ["name", "handle", "institution", "githubUrl", "portfolio", "bio", "avatar"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle || "",
        institution: user.institution || "",
        githubUrl: user.githubUrl || "",
        portfolio: user.portfolio || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "That handle is already taken." });
    }
    console.error("[profile/put]", error.message);
    res.status(500).json({ success: false, error: "Failed to update profile." });
  }
});

module.exports = router;
