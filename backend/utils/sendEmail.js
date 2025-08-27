// // //latest
// import nodemailer from "nodemailer";

// console.log("📥 sendEmail.js loaded");

// const sendEmail = async ({ to, subject, text }) => {
//   console.log("📨 sendEmail() called with:", { to, subject });

//   if (!to || typeof to !== "string") {
//     throw new Error("❌ No recipient email address provided (sendEmail.to)");
//   }
//   if (!subject || typeof subject !== "string") {
//     throw new Error("❌ No subject provided (sendEmail.subject)");
//   }
//   if (!text || typeof text !== "string") {
//     throw new Error("❌ No email body text provided (sendEmail.text)");
//   }

//   const emailUser = process.env.GODADDY_EMAIL_USER;
//   const emailPass = process.env.GODADDY_EMAIL_PASS;

//   console.log("🔐 EMAIL_USER:", emailUser);
//   console.log("🔐 EMAIL_PASS:", emailPass ? "✅ SET" : "❌ MISSING");

//   const mailOptions = {
//     from: `"BlinqFix Support" <${emailUser}>`,
//     to,
//     subject,
//     text,
//   };

//   console.log("📦 mailOptions:", JSON.stringify(mailOptions, null, 2));

//   let transporter;

//   try {
//     transporter = nodemailer.createTransport({
//       host: "smtpout.secureserver.net",
//       port: 465,
//       secure: true, // SSL
//       auth: {
//         user: emailUser,
//         pass: emailPass,
//       },
//     });

//     console.log("🚚 Transporter created");

//     await transporter.verify();
//     console.log("✅ Transporter verified and ready");
//   } catch (err) {
//     console.error("❌ Transporter setup failed:", err.message);
//     console.error("📛 Full transporter error:", err);
//     throw err;
//   }

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent successfully:", info.messageId);
//   } catch (err) {
//     console.error("❌ sendMail failed:", err.message);
//     console.error("📛 Full sendMail error:", err);
//     throw err;
//   }
// };

// export default sendEmail;


// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

// Node 18+ has global fetch; if you're on older Node, polyfill fetch.
const hasFetch = typeof fetch === "function";

const mask = (v) => {
  if (!v) return v;
  const at = v.indexOf("@");
  return at > 2 ? v.slice(0, 2) + "****" + v.slice(at) : "***";
};
const simplify = (err) => ({
  message: err?.message,
  code: err?.code,
  responseCode: err?.responseCode,
  command: err?.command,
  response: err?.response,
});

/* -------------------- ENV -------------------- */
// Primary (your existing)
const SMTP_USER = process.env.GODADDY_EMAIL_USER || "";
const SMTP_PASS = process.env.GODADDY_EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;

// Optional SMTP overrides
const SMTP_HOST = process.env.SMTP_HOST;                        // if set, we try it first
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_SECURE = process.env.SMTP_SECURE;                    // "true" | "false"
const SMTP_EHLO_NAME = process.env.SMTP_EHLO_NAME;              // optional
const TLS_REJECT_UNAUTH = process.env.SMTP_TLS_REJECT_UNAUTH === "false" ? false : true;

// Provider API (Resend) — ZERO SMTP needed if set
const EMAIL_DRIVER = (process.env.EMAIL_DRIVER || "").toLowerCase(); // "resend" | "smtp" | ""
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";             // set this to enable API send
const RESEND_FROM = process.env.RESEND_FROM || EMAIL_FROM;           // recommended: a verified sender

/* -------------------- RESEND (API) -------------------- */
async function sendViaResend({ to, subject, text, html }) {
  if (!hasFetch) {
    throw new Error("Global fetch not available; cannot use Resend API on this Node version.");
  }
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not set");
  }
  const body = {
    from: RESEND_FROM,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  };

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`Resend API error ${resp.status}: ${errText || resp.statusText}`);
  }

  const data = await resp.json().catch(() => ({}));
  console.log("✅ Resend API accepted", data);
}

/* -------------------- SMTP (GoDaddy / custom) -------------------- */
function buildSmtpAttempts() {
  const attempts = [];

  // If overrides are set, try them first
  if (SMTP_HOST && SMTP_PORT !== undefined) {
    const secure =
      SMTP_SECURE === "true" ? true : SMTP_SECURE === "false" ? false : SMTP_PORT === 465;
    attempts.push({
      label: "OVERRIDE",
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure,
      requireTLS: !secure,
      authMethod: "LOGIN",
    });
  }

  // GoDaddy common working combos
  attempts.push({
    label: "GoDaddy SMTPS 465 (LOGIN)",
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    requireTLS: false,
    authMethod: "LOGIN",
  });
  attempts.push({
    label: "GoDaddy STARTTLS 587 (LOGIN)",
    host: "smtpout.secureserver.net",
    port: 587,
    secure: false,
    requireTLS: true,
    authMethod: "LOGIN",
  });

  return attempts;
}

async function trySmtpSend(cfg, mailOptions) {
  const { label, host, port, secure, requireTLS, authMethod } = cfg;

  console.log("📧 Trying SMTP", {
    label,
    host,
    port,
    secure,
    requireTLS,
    authMethod,
    user: mask(SMTP_USER),
    from: mask(mailOptions.from),
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true:465 SSL, false:587 STARTTLS
    requireTLS,
    name: SMTP_EHLO_NAME || undefined, // optional
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    authMethod, // Force LOGIN (PLAIN often 535s)
    pool: false,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: TLS_REJECT_UNAUTH },
  });

  // Some providers barf on verify — don't fail the send if verify errors:
  try {
    await transporter.verify();
    console.log("✅ SMTP verify OK");
  } catch (e) {
    console.warn("⚠️ SMTP verify warning:", simplify(e));
  }

  const info = await transporter.sendMail(mailOptions);
  console.log("✅ SMTP email sent", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });
}

/* -------------------- PUBLIC API -------------------- */
/**
 * Send email (no breaking changes):
 * - required: { to, subject, text }
 * - optional: { html } (will be used if provided)
 */
export default async function sendEmail({ to, subject, text, html }) {
  console.log("📨 sendEmail() called with:", { to, subject });

  if (!to || typeof to !== "string") throw new Error("❌ sendEmail.to is required");
  if (!subject || typeof subject !== "string") throw new Error("❌ sendEmail.subject is required");
  if (!text || typeof text !== "string") throw new Error("❌ sendEmail.text is required");

  const mailOptions = {
    from: `"BlinqFix Support" <${EMAIL_FROM}>`, // should be the authenticated mailbox for SMTP providers
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  };

  // 1) If explicitly asked to use RESEND, or API key present and driver not forced to "smtp":
  if ((EMAIL_DRIVER === "resend" || !!RESEND_API_KEY) && EMAIL_DRIVER !== "smtp") {
    try {
      console.log("🟦 Using Resend API driver");
      await sendViaResend({ to, subject, text, html });
      return;
    } catch (apiErr) {
      console.error("❌ Resend API failed:", simplify(apiErr));
      // Fall back to SMTP if creds exist; else bubble error
      if (!SMTP_USER || !SMTP_PASS) throw apiErr;
      console.log("↩️ Falling back to SMTP after Resend failure");
    }
  }

  // 2) SMTP path (your original behavior)
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "❌ Missing SMTP creds: GODADDY_EMAIL_USER or GODADDY_EMAIL_PASS. Set RESEND_API_KEY to use API driver instead."
    );
  }

  const attempts = buildSmtpAttempts();
  const errors = [];
  for (const cfg of attempts) {
    try {
      await trySmtpSend(cfg, mailOptions);
      return; // success
    } catch (err) {
      console.error("❌ SMTP attempt failed:", cfg.label, simplify(err));
      errors.push({ cfg: cfg.label, err: simplify(err) });
      // next attempt
    }
  }

  console.error("❌ All SMTP attempts failed. Summary:", errors);
  const first = errors[0]?.err || {};
  throw new Error(first.message || "SMTP send failed");
}
