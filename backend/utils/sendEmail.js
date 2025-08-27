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

console.log("📥 sendEmail.js loaded");

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

// Your existing envs
const EMAIL_USER = process.env.GODADDY_EMAIL_USER || "";
const EMAIL_PASS = process.env.GODADDY_EMAIL_PASS || "";

// Optional overrides (ignored if not set)
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const SMTP_EHLO_NAME = process.env.SMTP_EHLO_NAME; // optional
const TLS_REJECT_UNAUTH =
  process.env.SMTP_TLS_REJECT_UNAUTH === "false" ? false : true;

// Build the two tried-and-true GoDaddy configs
function buildAttempts() {
  return [
    {
      label: "GoDaddy SMTPS 465 (LOGIN)",
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true, // SSL
      requireTLS: false,
      authMethod: "LOGIN",
    },
    {
      label: "GoDaddy STARTTLS 587 (LOGIN)",
      host: "smtpout.secureserver.net",
      port: 587,
      secure: false, // STARTTLS
      requireTLS: true,
      authMethod: "LOGIN",
    },
  ];
}

async function createTransportAndSend(cfg, mailOptions) {
  const { host, port, secure, requireTLS, authMethod, label } = cfg;

  console.log("📧 Trying SMTP", {
    label,
    host,
    port,
    secure,
    requireTLS,
    authMethod,
    user: mask(EMAIL_USER),
    from: mask(EMAIL_FROM),
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS,
    name: SMTP_EHLO_NAME || undefined,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    authMethod, // Force LOGIN; PLAIN can 535 on some tenants
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: TLS_REJECT_UNAUTH },
  });

  try {
    // Some providers 535 on verify — if that happens, we’ll still try sendMail
    await transporter.verify().catch((e) => {
      console.warn("⚠️ SMTP verify warning:", simplify(e));
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
    return info;
  } catch (err) {
    console.error("❌ sendMail failed:", simplify(err));
    throw err;
  }
}

/**
 * Send email (no breaking changes):
 * - required: { to, subject, text }
 * - optional: { html } if you pass it from the caller
 */
const sendEmail = async ({ to, subject, text, html }) => {
  console.log("📨 sendEmail() called with:", { to, subject });

  if (!to || typeof to !== "string")
    throw new Error("❌ No recipient email address provided (sendEmail.to)");
  if (!subject || typeof subject !== "string")
    throw new Error("❌ No subject provided (sendEmail.subject)");
  if (!text || typeof text !== "string")
    throw new Error("❌ No email body text provided (sendEmail.text)");
  if (!EMAIL_USER || !EMAIL_PASS)
    throw new Error("❌ Missing GODADDY_EMAIL_USER or GODADDY_EMAIL_PASS env vars");

  const mailOptions = {
    from: `"BlinqFix Support" <${EMAIL_FROM}>`, // should be same mailbox for GoDaddy
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  };

  console.log(
    "📦 mailOptions:",
    JSON.stringify(
      { ...mailOptions, text: `${text.slice(0, 80)}${text.length > 80 ? "…" : ""}` },
      null,
      2
    )
  );

  const attempts = buildAttempts();
  const errors = [];

  for (const cfg of attempts) {
    try {
      await createTransportAndSend(cfg, mailOptions);
      return; // success
    } catch (err) {
      errors.push({ cfg: cfg.label, err: simplify(err) });
      // Try next config
    }
  }

  console.error("❌ All SMTP attempts failed. Summary:", errors);
  const first = errors[0]?.err || {};
  throw new Error(first.message || "SMTP send failed");
};

export default sendEmail;
