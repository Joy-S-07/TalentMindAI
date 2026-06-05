/**
 * controllers/auth.controller.js - Authentication controller.
 *
 * Exports: register, login, forgotPassword, resetPassword
 */

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/mailer.util");

// ── Helper: generate JWT ────────────────────────────────────────────

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

// ── Register ────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[auth/register]", error.message);
    res.status(500).json({ success: false, error: "Registration failed." });
  }
};

// ── Login ───────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password.",
      });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[auth/login]", error.message);
    res.status(500).json({ success: false, error: "Login failed." });
  }
};

// ── Forgot Password ────────────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email address.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No account found with that email.",
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Construct reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">TalentMind — Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #ea580c; 
                  color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;
                  font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #ea580c;">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px;">
          This link expires in 10 minutes. If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "TalentMind — Password Reset Request",
        message,
      });

      res.json({
        success: true,
        message: "Password reset email sent.",
      });
    } catch (emailError) {
      // Email sending failed — clean up the token
      console.error("[auth/forgotPassword] Email error:", emailError.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: "Email could not be sent. Please try again later.",
      });
    }
  } catch (error) {
    console.error("[auth/forgotPassword]", error.message);
    res.status(500).json({ success: false, error: "Server error." });
  }
};

// ── Reset Password ──────────────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  try {
    // Hash the token from the URL to compare with DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token.",
      });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters.",
      });
    }

    // Set new password and clear token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Return a new JWT so user is logged in immediately
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("[auth/resetPassword]", error.message);
    res.status(500).json({ success: false, error: "Password reset failed." });
  }
};
