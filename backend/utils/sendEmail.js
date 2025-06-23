// utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.GODADDY_EMAIL_USER, // e.g., support@yourdomain.com
      pass: process.env.GODADDY_EMAIL_PASS, // your email password or app password
    },
  });

/**
 * Sends an email
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.text
 */
const sendEmail = async ({ to, subject, text }) => {
  const mailOptions = {
    from: `"BlinqFix Support" <${process.env.GODADDY_EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
