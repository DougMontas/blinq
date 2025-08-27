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

// current envs you’re using
const SMTP_USER = process.env.GODADDY_EMAIL_USER || "";
const SMTP_PASS = process.env.GODADDY_EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;

// optional overrides (if you set them)
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_SECURE = process.env.SMTP_SECURE; // "true" | "false"
const SMTP_EHLO_NAME = process.env.SMTP_EHLO_NAME; // optional
const TLS_REJECT_UNAUTH = process.env.SMTP_TLS_REJECT_UNAUTH === "false" ? false : true;

// build the two GoDaddy attempts (plus one override if provided)
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

async function tryOnce(cfg, mailOptions) {
  const { label, host, port, secure, requireTLS, authMethod } = cfg;

  console.log("📧 [sendEmail] Attempt:", {
    label,
    host,
    port,
    secure,
    requireTLS,
    authMethod,
    user: mask(SMTP_USER),
    from: mask(mailOptions.from),
    to: mask(mailOptions.to),
    subject: mailOptions.subject,
  });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,                  // true:465 SSL, false:587 STARTTLS
    requireTLS,              // STARTTLS path when secure=false
    name: SMTP_EHLO_NAME || undefined,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    authMethod,              // Force LOGIN (PLAIN often 535s)
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: TLS_REJECT_UNAUTH },
  });

  // Some providers fail verify() even though sendMail works; log but don’t fail early
  try {
    await transporter.verify();
    console.log("✅ [sendEmail] verify OK:", label);
  } catch (e) {
    console.warn("⚠️  [sendEmail] verify warning:", label, simplify(e));
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [sendEmail] sent:", {
      label,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
    return info;
  } catch (err) {
    const s = simplify(err);
    // Re-throw with the attempt label attached so the route can include it
    const e = new Error(`${label}: ${s.message || "sendMail failed"}`);
    e.code = s.code;
    e.responseCode = s.responseCode;
    e.command = s.command;
    e.response = s.response;
    e.attempt = label;
    console.error("❌ [sendEmail] attempt failed:", label, s);
    throw e;
  }
}

/**
 * No breaking changes: same signature & behavior
 * Required: { to, subject, text }
 * Optional: { html }
 */
export default async function sendEmail({ to, subject, text, html }) {
  console.log("📨 [sendEmail] called:", { to: mask(to), subject });

  if (!to || typeof to !== "string")
    throw new Error("❌ sendEmail.to is required");
  if (!subject || typeof subject !== "string")
    throw new Error("❌ sendEmail.subject is required");
  if (!text || typeof text !== "string")
    throw new Error("❌ sendEmail.text is required");

  if (!SMTP_USER || !SMTP_PASS) {
    console.error("❌ [sendEmail] missing SMTP creds", {
      GODADDY_EMAIL_USER_set: !!SMTP_USER,
      GODADDY_EMAIL_PASS_set: !!SMTP_PASS,
    });
    throw new Error("Missing SMTP credentials");
  }

  const mailOptions = {
    from: `"BlinqFix Support" <${EMAIL_FROM}>`, // must usually equal SMTP_USER mailbox
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  };

  console.log("🧪 [sendEmail] env snapshot:", {
    EMAIL_FROM: mask(EMAIL_FROM),
    TLS_REJECT_UNAUTH,
  });

  const attempts = buildAttempts();
  const errors = [];

  for (const cfg of attempts) {
    try {
      await tryOnce(cfg, mailOptions);
      return; // success
    } catch (err) {
      errors.push({
        attempt: cfg.label,
        err: {
          message: err.message,
          code: err.code,
          responseCode: err.responseCode,
          command: err.command,
          // response may contain provider text like "535 authentication rejected"
          response: err.response,
        },
      });
    }
  }

  console.error("🚨 [sendEmail] All attempts failed:", errors);
  // Throw the first error so the route can display something concrete
  const first = errors[0]?.err || {};
  const e = new Error(first.message || "SMTP send failed");
  e.code = first.code;
  e.responseCode = first.responseCode;
  e.command = first.command;
  e.response = first.response;
  throw e;
}
