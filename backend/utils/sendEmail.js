// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtpout.secureserver.net",
//   port: 465,
//   secure: true, // use SSL
//   auth: {
//     user: process.env.GODADDY_EMAIL_USER, // e.g., support@yourdomain.com
//     pass: process.env.GODADDY_EMAIL_PASS, // your email password or app password
//   },
// });

// /**
//  * Sends an email
//  * @param {Object} options
//  * @param {string} options.to - Recipient email
//  * @param {string} options.subject - Email subject
//  * @param {string} options.text - Plain text body
//  */
// const sendEmail = async ({ to, subject, text }) => {
//   if (!to || typeof to !== "string") {
//     throw new Error("No recipient email address provided (sendEmail.to)");
//   }
//   if (!subject || typeof subject !== "string") {
//     throw new Error("No subject provided (sendEmail.subject)");
//   }
//   if (!text || typeof text !== "string") {
//     throw new Error("No email body text provided (sendEmail.text)");
//   }

//   const mailOptions = {
//     from: `"BlinqFix Support" <${process.env.GODADDY_EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//   };

//   console.log("📧 Sending email to:", to); // ✅ Log recipient
//   await transporter.sendMail(mailOptions);
// };

// export default sendEmail;


import nodemailer from "nodemailer";

// Log environment values (for production debugging)
console.log("🔐 EMAIL_USER:", process.env.GODADDY_EMAIL_USER);
console.log("🔐 EMAIL_PASS:", process.env.GODADDY_EMAIL_PASS ? "SET" : "MISSING");

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.GODADDY_EMAIL_USER,
    pass: process.env.GODADDY_EMAIL_PASS,
  },
});

// Verify SMTP connection immediately at startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP verification failed:", err);
  } else {
    console.log("✅ SMTP transporter is ready to send mail");
  }
});

/**
 * Sends an email using configured transporter
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 */
const sendEmail = async ({ to, subject, text }) => {
  if (!to || typeof to !== "string") {
    throw new Error("❌ No recipient email address provided (sendEmail.to)");
  }
  if (!subject || typeof subject !== "string") {
    throw new Error("❌ No subject provided (sendEmail.subject)");
  }
  if (!text || typeof text !== "string") {
    throw new Error("❌ No email body text provided (sendEmail.text)");
  }

  const mailOptions = {
    from: `"BlinqFix Support" <${process.env.GODADDY_EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  console.log("📧 Sending email to:", to);
  console.log("📦 Mail options:", mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err; // rethrow so calling function knows it failed
  }
};

export default sendEmail;
