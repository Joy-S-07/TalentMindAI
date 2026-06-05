/**
 * utils/mailer.util.js
 *
 * Sends email via Gmail OAuth2.
 * Falls back to Ethereal (preview-only) if OAuth2 fails.
 * Reset link is ALWAYS printed to console.
 */

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// ── Build a fresh OAuth2 transport each call ─────────────────────────
async function buildOAuth2Transport() {
  const oauth2 = new (google.auth.OAuth2)(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  });
}

// ── Main sendEmail ───────────────────────────────────────────────────
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"TalentMind" <${process.env.GMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Always log to console so link is never lost
  const urlMatch = options.message.match(/href="([^"]+)"/);
  console.log(`\n[mailer] ── Email ──────────────────────────────────────`);
  console.log(`[mailer] TO:      ${options.email}`);
  console.log(`[mailer] SUBJECT: ${options.subject}`);
  if (urlMatch) console.log(`[mailer] LINK:    ${urlMatch[1]}`);
  console.log(`[mailer] ────────────────────────────────────────────────\n`);

  // 1. Try Gmail OAuth2
  try {
    const transport = await buildOAuth2Transport();
    await transport.sendMail(mailOptions);
    console.log(`[mailer] ✓ Sent via Gmail → ${options.email}`);
    return;
  } catch (err) {
    console.warn(`[mailer] Gmail failed (${err.message}) — trying Ethereal fallback.`);
  }

  // 2. Ethereal fallback (preview in browser, no real delivery)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const fallback = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await fallback.sendMail(mailOptions);
    console.log(`[mailer] ✓ Sent via Ethereal (test mode).`);
    console.log(`[mailer] 👉 Preview: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.warn(`[mailer] Ethereal also failed: ${err.message}`);
    console.warn(`[mailer] ⚠ Use the LINK above to manually reset password.`);
  }
};

// ── Startup verification (non-fatal) ────────────────────────────────
async function verifyMailer() {
  try {
    const transport = await buildOAuth2Transport();
    await transport.verify();
    console.log("[mailer] ✓ Gmail OAuth2 verified.");
  } catch (err) {
    console.warn(`[mailer] Gmail OAuth2 not available: ${err.message}`);
    console.warn(`[mailer] ℹ Ethereal fallback active — reset links will print to console.`);
  }
}

module.exports = sendEmail;
module.exports.verifyMailer = verifyMailer;
