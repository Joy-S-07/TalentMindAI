/**
 * routes/auth.routes.js - Authentication routes.
 *
 * POST   /api/auth/register              → Register
 * POST   /api/auth/login                 → Login
 * POST   /api/auth/forgotpassword        → Send reset email
 * PUT    /api/auth/resetpassword/:resetToken → Reset password
 */

const { Router } = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
