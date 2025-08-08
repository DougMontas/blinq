import nodemailer from "nodemailer";

console.log("📥 sendEmail.js loaded");

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

  const emailUser = process.env.GODADDY_EMAIL_USER;
  const emailPass = process.env.GODADDY_EMAIL_PASS;

  console.log("🔐 EMAIL_USER:", emailUser);
  console.log("🔐 EMAIL_PASS:", emailPass ? "✅ SET" : "❌ MISSING");

  const mailOptions = {
    from: `"BlinqFix Support" <${emailUser}>`,
    to,
    subject,
    text,
  };

  console.log("📦 mailOptions:", JSON.stringify(mailOptions, null, 2));

  let transporter;

  try {
    transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true, // SSL
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    console.log("🚚 Transporter created");

    await transporter.verify();
    console.log("✅ Transporter verified and ready");
  } catch (err) {
    console.error("❌ Transporter setup failed:", err.message);
    console.error("📛 Full transporter error:", err);
    throw err;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("❌ sendMail failed:", err.message);
    console.error("📛 Full sendMail error:", err);
    throw err;
  }
};

export default sendEmail;
