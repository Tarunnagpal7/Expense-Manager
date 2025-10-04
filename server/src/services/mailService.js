import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class MailService {
  static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false, // true if port is 465, false otherwise
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendMail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Expense Tracker" <${process.env.SMTP_USER}>`, // ✅ fixed interpolation
        to,
        subject,
        html,
      });
      console.log("📧 Email sent:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      throw error;
    }
  }
}

export { MailService };
