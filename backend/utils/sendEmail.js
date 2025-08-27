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

import nodemailer from "nodemailer";

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

/* ------------ ENV ------------ */
// Your existing creds
const RAW_USER = process.env.GODADDY_EMAIL_USER || "";
const RAW_PASS = process.env.GODADDY_EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || RAW_USER;

// Optional overrides
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_SECURE = process.env.SMTP_SECURE; // "true"|"false"
const SMTP_EHLO_NAME = process.env.SMTP_EHLO_NAME;
const TLS_REJECT_UNAUTH = process.env.SMTP_TLS_REJECT_UNAUTH === "false" ? false : true;

// Optional API sender (no SMTP)
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || EMAIL_FROM;

// Trim and detect whitespace issues (very common cause of 535)
const USER = RAW_USER;
const PASS = RAW_PASS;
const userHasEdgeWS = /^\s|\s$/.test(USER);
const passHasEdgeWS = /^\s|\s$/.test(PASS);

function platformHint(user) {
  // crude hint: many M365 mailboxes sign in at outlook.office365.com
  const domain = String(user.split("@")[1] || "").toLowerCase();
  if (domain.endsWith(".onmicrosoft.com")) return "m365";
  // heuristic only; you may still be on M365 via custom domain
  return "unknown";
}

/* ------------ Resend (API) ------------- */
async function sendViaResend({ to, subject, text, html }) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  if (typeof fetch !== "function") throw new Error("fetch not available for Resend API");
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, text, ...(html ? { html } : {}) }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`Resend API error ${resp.status}: ${errText || resp.statusText}`);
  }
  const data = await resp.json().catch(() => ({}));
  console.log("✅ [sendEmail] Resend accepted", data);
}

/* ------------ SMTP attempts ------------- */
function buildAttempts() {
  const attempts = [];
  if (SMTP_HOST && SMTP_PORT !== undefined) {
    const secure =
      SMTP_SECURE === "true" ? true :
      SMTP_SECURE === "false" ? false :
      (SMTP_PORT === 465);
    attempts.push({
      label: `OVERRIDE ${SMTP_HOST}:${SMTP_PORT} secure=${secure}`,
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure,
      requireTLS: !secure,
      authMethod: "LOGIN",
    });
  }
  // GoDaddy common combos
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
  // If mailbox is M365, these are the right ones (will only be used if you set SMTP_HOST)
  if (!SMTP_HOST && platformHint(USER) === "m365") {
    console.warn("ℹ️ [sendEmail] User looks M365-ish; consider SMTP_HOST=smtp.office365.com, SMTP_PORT=587, SMTP_SECURE=false and enabling Authenticated SMTP + App Password if MFA.");
  }
  return attempts;
}

async function trySmtpOnce(cfg, mailOptions, userMasked) {
  const { label, host, port, secure, requireTLS, authMethod } = cfg;
  console.log("📧 [sendEmail] Attempt:", {
    label, host, port, secure, requireTLS, authMethod,
    user: userMasked,
    from: mask(mailOptions.from),
    to: mask(mailOptions.to),
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS,
    name: SMTP_EHLO_NAME || undefined,
    auth: { user: USER, pass: PASS },
    authMethod,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: TLS_REJECT_UNAUTH },
  });

  try {
    await transporter.verify().catch((e) => {
      console.warn("⚠️  [sendEmail] verify warning:", label, simplify(e));
    });
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [sendEmail] SMTP sent", {
      label, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response,
    });
    return info;
  } catch (err) {
    const s = simplify(err);
    console.error("❌ [sendEmail] SMTP failed:", label, s);
    const e = new Error(`${label}: ${s.message || "sendMail failed"}`);
    e.code = s.code; e.responseCode = s.responseCode; e.command = s.command; e.response = s.response;
    throw e;
  }
}

/* ------------ Public API (no breaking changes) ------------- */
export default async function sendEmail({ to, subject, text, html }) {
  console.log("📨 [sendEmail] called:", { to: mask(to), subject });

  if (!to || typeof to !== "string") throw new Error("sendEmail.to is required");
  if (!subject || typeof subject !== "string") throw new Error("sendEmail.subject is required");
  if (!text || typeof text !== "string") throw new Error("sendEmail.text is required");

  // Early diagnostics
  console.log("🧪 [sendEmail] env snapshot:", {
    EMAIL_FROM: mask(EMAIL_FROM),
    userMasked: mask(USER),
    userHasEdgeWS,
    passHasEdgeWS,
    hasSMTPUser: !!USER,
    hasSMTPPass: !!PASS,
    TLS_REJECT_UNAUTH,
    overrideHost: SMTP_HOST,
    overridePort: SMTP_PORT,
    overrideSecure: SMTP_SECURE,
    resendKey: RESEND_API_KEY ? "set" : "unset",
  });
  if (userHasEdgeWS || passHasEdgeWS) {
    console.error("🚫 [sendEmail] Detected leading/trailing whitespace in SMTP creds. Fix env values exactly.");
  }
  if (!USER || !PASS) {
    if (RESEND_API_KEY) {
      console.log("ℹ️ [sendEmail] No SMTP creds; using Resend API.");
      await sendViaResend({ to, subject, text, html });
      return;
    }
    throw new Error("Missing SMTP credentials (GODADDY_EMAIL_USER/PASS).");
  }

  const mailOptions = {
    from: `"BlinqFix Support" <${EMAIL_FROM}>`, // should be the same mailbox for GoDaddy
    to, subject, text, ...(html ? { html } : {}),
  };

  // If you set RESEND_API_KEY, try API first so you can ship today
  if (RESEND_API_KEY) {
    try {
      console.log("🟦 [sendEmail] Using Resend API first");
      await sendViaResend({ to, subject, text, html });
      return;
    } catch (apiErr) {
      console.error("❌ [sendEmail] Resend failed; falling back to SMTP:", simplify(apiErr));
    }
  }

  // SMTP attempts
  const attempts = buildAttempts();
  const errors = [];
  for (const cfg of attempts) {
    try {
      await trySmtpOnce(cfg, mailOptions, mask(USER));
      return;
    } catch (err) {
      errors.push({ attempt: cfg.label, err: simplify(err) });
    }
  }
  console.error("🚨 [sendEmail] All SMTP attempts failed:", errors);
  const first = errors[0]?.err || {};
  const e = new Error(first.message || "SMTP send failed");
  e.code = first.code; e.responseCode = first.responseCode; e.command = first.command; e.response = first.response;
  throw e;
}
