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

console.log("📥 sendEmail.js loaded (reads EMAIL_SMTP_* overrides)");

/**
 * EXACT same API as before.
 * Required: { to, subject, text }
 * Optional: { html }
 */
export default async function sendEmail({ to, subject, text, html }) {
  console.log("📨 sendEmail() called with:", {
    to: typeof to === "string" ? mask(to) : to,
    subject,
    textLen: typeof text === "string" ? text.length : 0,
    hasHtml: !!html,
  });

  if (!to || typeof to !== "string") {
    throw new Error("❌ No recipient email address provided (sendEmail.to)");
  }
  if (!subject || typeof subject !== "string") {
    throw new Error("❌ No subject provided (sendEmail.subject)");
  }
  if (!text || typeof text !== "string") {
    throw new Error("❌ No email body text provided (sendEmail.text)");
  }

  // Read your existing creds, trimmed to avoid invisible whitespace issues
  const emailUser = (process.env.GODADDY_EMAIL_USER || "").trim();
  const emailPass = (process.env.GODADDY_EMAIL_PASS || "").trim();

  if (!emailUser || !emailPass) {
    console.error("❌ Missing SMTP creds", {
      GODADDY_EMAIL_USER_set: !!emailUser,
      GODADDY_EMAIL_PASS_set: !!emailPass,
    });
    throw new Error("Missing SMTP credentials");
  }

  // Read YOUR override names: EMAIL_SMTP_HOST/PORT/SECURE
  // (If not set, we’ll fall back to GoDaddy defaults)
  const rawHost   = process.env.EMAIL_SMTP_HOST; // e.g. "smtp.secureserver.net" (your file)
  const rawPort   = process.env.EMAIL_SMTP_PORT; // e.g. "465"
  const rawSecure = process.env.EMAIL_SMTP_SECURE; // "true" or "false"

  const port   = rawPort != null ? Number(rawPort) : undefined;
  const secure = rawSecure != null
    ? (String(rawSecure).toLowerCase() === "true")
    : (port === 465 || port === undefined); // infer to true if 465/undefined

  const primaryHost = rawHost || "smtpout.secureserver.net"; // default GoDaddy outbound host
  const primaryPort = port ?? 465;
  const primarySecure = secure;

  // EXACT same "from" semantics as your original working code
  const mailOptions = {
    from: `"BlinqFix Support" <${emailUser}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  };

  console.log("🧪 SMTP env snapshot:", {
    EMAIL_SMTP_HOST: rawHost || "(unset, using default)",
    EMAIL_SMTP_PORT: rawPort || "(unset, default 465)",
    EMAIL_SMTP_SECURE: rawSecure || `(inferred ${primarySecure})`,
    from: mask(mailOptions.from),
    user: mask(emailUser),
  });

  // Build attempt list:
  // 1) Your EMAIL_SMTP_* (or default)
  // 2) If your host is "smtp.secureserver.net", also try the common "smtpout.secureserver.net"
  // 3) Try STARTTLS 587 on smtpout (a frequent working path)
  const attempts = [
    {
      label: `PRIMARY ${primaryHost}:${primaryPort} secure=${primarySecure}`,
      host: primaryHost,
      port: primaryPort,
      secure: primarySecure,
      requireTLS: !primarySecure,
    },
  ];

  if (primaryHost === "smtp.secureserver.net") {
    attempts.push({
      label: "FALLBACK smtpout.secureserver.net:465 secure=true",
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      requireTLS: false,
    });
  }

  attempts.push({
    label: "FALLBACK smtpout.secureserver.net:587 STARTTLS",
    host: "smtpout.secureserver.net",
    port: 587,
    secure: false,
    requireTLS: true,
  });

  // Try each attempt in order
  let lastErr;
  for (const cfg of attempts) {
    const { label, host, port, secure, requireTLS } = cfg;

    console.log("🚚 Creating transporter:", {
      label,
      host,
      port,
      secure,
      requireTLS,
      user: mask(emailUser),
    });

    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,              // true:465 SMTPS, false:587 STARTTLS
        requireTLS,          // force STARTTLS if secure=false
        auth: { user: emailUser, pass: emailPass },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });

      // Some providers fail verify but still accept sendMail — log but don’t abort
      try {
        await transporter.verify();
        console.log("✅ Transporter verify OK:", label);
      } catch (verifyErr) {
        console.warn("⚠️  Transporter verify warning (will still send):", label, simplify(verifyErr));
      }
    } catch (createErr) {
      console.error("❌ Transporter creation failed:", label, simplify(createErr));
      lastErr = createErr;
      continue;
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent:", {
        label,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });
      return; // success, stop here
    } catch (sendErr) {
      console.error("❌ sendMail failed:", label, simplify(sendErr));
      lastErr = sendErr;
      // fall through to next attempt
    }
  }

  // If we got here, all attempts failed; throw the last error for the route to catch
  throw lastErr || new Error("SMTP send failed");
}
