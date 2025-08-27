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

// ---------- helpers ----------
const mask = (v) => {
  if (!v) return v;
  const at = v.indexOf("@");
  return at > 2 ? v.slice(0, 2) + "****" + v.slice(at) : "***";
};

const boolOr = (v, fallback) => {
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
};

function simplify(err) {
  return {
    message: err?.message,
    code: err?.code,
    responseCode: err?.responseCode,
    command: err?.command,
    response: err?.response,
  };
}

// ---------- env ----------
const USER = process.env.GODADDY_EMAIL_USER || "";
const PASS = process.env.GODADDY_EMAIL_PASS || "";
const OVERRIDE_HOST = process.env.SMTP_HOST;               // optional
const OVERRIDE_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const OVERRIDE_SECURE = process.env.SMTP_SECURE;           // "true"/"false"
const EMAIL_FROM = process.env.EMAIL_FROM || USER;         // must be a mailbox you own
const TLS_REJECT_UNAUTH = boolOr(process.env.SMTP_TLS_REJECT_UNAUTH, true);

// ---------- transporter factory with fallbacks ----------
async function tryCreateAndSend(config, mailOptions) {
  const {
    host, port, secure, authMethod, requireTLS = false, name,
  } = config;

  console.log("📧 Trying SMTP config", {
    host, port, secure, authMethod, requireTLS, name, user: mask(USER), from: mask(EMAIL_FROM),
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    name,              // optional EHLO name, sometimes helps
    requireTLS,        // forces STARTTLS when secure=false
    auth: { user: USER, pass: PASS },
    authMethod,        // 'PLAIN' or 'LOGIN' (let's choose explicitly)
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: TLS_REJECT_UNAUTH },
  });

  try {
    await transporter.verify();
    console.log("✅ SMTP verify OK");
  } catch (err) {
    console.error("❌ SMTP verify failed:", simplify(err));
    throw err;
  }

  try {
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

// Build fallback list. If overrides are present, try them first.
function buildAttempts() {
  const attempts = [];

  if (OVERRIDE_HOST && OVERRIDE_PORT !== undefined) {
    const secure = OVERRIDE_SECURE === "true" ? true :
                   OVERRIDE_SECURE === "false" ? false :
                   (OVERRIDE_PORT === 465);
    attempts.push({ host: OVERRIDE_HOST, port: OVERRIDE_PORT, secure, authMethod: "PLAIN" });
    attempts.push({ host: OVERRIDE_HOST, port: OVERRIDE_PORT, secure, authMethod: "LOGIN" });
  }

  // GoDaddy common combos
  attempts.push({ host: "smtpout.secureserver.net", port: 465, secure: true,  authMethod: "PLAIN" });
  attempts.push({ host: "smtpout.secureserver.net", port: 465, secure: true,  authMethod: "LOGIN" });
  attempts.push({ host: "smtpout.secureserver.net", port: 587, secure: false, authMethod: "LOGIN", requireTLS: true });

  return attempts;
}

// ---------- main ----------
const sendEmail = async ({ to, subject, text }) => {
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
  if (!USER || !PASS) {
    throw new Error("❌ Missing GODADDY_EMAIL_USER or GODADDY_EMAIL_PASS env vars");
  }

  const mailOptions = {
    from: `"BlinqFix Support" <${EMAIL_FROM}>`, // must be your authenticated mailbox for many providers
    to,
    subject,
    text,
  };

  console.log("📦 mailOptions:", JSON.stringify({ ...mailOptions, text: `${text.slice(0, 80)}${text.length > 80 ? "…" : ""}` }, null, 2));

  const attempts = buildAttempts();
  const errors = [];

  for (const cfg of attempts) {
    try {
      await tryCreateAndSend(cfg, mailOptions);
      return; // success
    } catch (err) {
      errors.push({ cfg, err: simplify(err) });
      // If it's a straight auth reject (535), no need to try same host/port with same method again
      continue;
    }
  }

  console.error("❌ All SMTP attempts failed. Summary:", errors);
  const first = errors[0]?.err || {};
  throw new Error(first.message || "SMTP send failed");
};

export default sendEmail;
