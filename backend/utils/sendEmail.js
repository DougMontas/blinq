// //latest
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

console.log("📥 sendEmail.js loaded");

// Reuse one transporter across sends
let transporter = null;

const getEnvBool = (v, fallback) => {
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
};

const getTransporter = async () => {
  if (transporter) return transporter;

  // Primary (GoDaddy-style) creds
  const emailUser = process.env.GODADDY_EMAIL_USER;
  const emailPass = process.env.GODADDY_EMAIL_PASS;

  // Optional overrides
  const host = process.env.SMTP_HOST || "smtpout.secureserver.net";
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
  const secure = getEnvBool(process.env.SMTP_SECURE, port === 465);
  const fromAddr = process.env.EMAIL_FROM || emailUser; // many providers require from == auth user
  const tlsRejectUnauth = getEnvBool(process.env.SMTP_TLS_REJECT_UNAUTH, true);

  if (!emailUser || !emailPass) {
    // Keep same behavior: throw like your current code would later.
    throw new Error("❌ Missing GODADDY_EMAIL_USER or GODADDY_EMAIL_PASS env vars");
  }

  console.log("📧 SMTP config", {
    host,
    port,
    secure,
    user: mask(emailUser),
    from: mask(fromAddr),
    tlsRejectUnauth,
  });

  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true:465 (SSL), false:587 (STARTTLS)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: tlsRejectUnauth },
  });

  try {
    await transporter.verify();
    console.log("✅ Transporter verified and ready");
  } catch (err) {
    console.error("❌ Transporter setup failed:", err?.message);
    console.error("📛 Transporter error details:", {
      code: err?.code,
      responseCode: err?.responseCode,
      command: err?.command,
      response: err?.response,
    });
    throw err;
  }

  // Expose chosen from for the sender
  transporter.__from = fromAddr;
  return transporter;
};

const mask = (v) => {
  if (!v) return v;
  const at = v.indexOf("@");
  return at > 2 ? v.slice(0, 2) + "****" + v.slice(at) : "***";
};

/**
 * Send email (no breaking changes):
 * - required: { to, subject, text }
 * - optional: { html } will be included if provided by caller
 */
const sendEmail = async ({ to, subject, text, html }) => {
  console.log("📨 sendEmail() called with:", { to, subject });

  if (!to || typeof to !== "string") {
    throw new Error("❌ No recipient email address provided (sendEmail.to)");
  }
  if (!subject || typeof subject !== "string") {
    throw new Error("❌ No subject provided (sendEmail.subject)");
  }
  if (!text || typeof text !== "string") {
    throw new Error("❌ No email body text provided (sendEmail.text)");
  }

  const emailUser = process.env.GODADDY_EMAIL_USER;
  const emailPass = process.env.GODADDY_EMAIL_PASS;

  console.log("🔐 EMAIL_USER:", emailUser);
  console.log("🔐 EMAIL_PASS:", emailPass ? "✅ SET" : "❌ MISSING");

  const tx = await getTransporter();

  const mailOptions = {
    from: `"BlinqFix Support" <${tx.__from || emailUser}>`, // ensure deliverable FROM
    to,
    subject,
    text,
    ...(html ? { html } : {}), // include html only if provided
  };

  console.log("📦 mailOptions:", JSON.stringify({ ...mailOptions, text: text.slice(0, 60) + (text.length > 60 ? "…" : "") }, null, 2));

  try {
    const info = await tx.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (err) {
    console.error("❌ sendMail failed:", err?.message);
    console.error("📛 Full sendMail error:", {
      code: err?.code,
      responseCode: err?.responseCode,
      command: err?.command,
      response: err?.response,
    });
    throw err;
  }
};

export default sendEmail;
