import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../logger";
import { EmailJobData } from "@/queue/processors/EmailJobProcessor";

dotenv.config();

// Tạo transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT || "465", 10), // Cổng SMTP
  secure: true, // true cho SSL
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error("Error connecting to mail server:", error);
  } else {
    logger.info("📧 Server is ready to take our messages");
  }
});

// convert to class EmailUtils
export class EmailUtils {
  static async sendEmail(data: EmailJobData) {
    try {
      // Gửi email qua Nodemailer
      await transporter.sendMail({
        from: `"Xuân Lộc" <${process.env.MAIL_USERNAME}>`, // Tên người gửi và email
        to: data.to,
        subject: data.subject,
        html: data.content,
        attachments: data.attachments,
      });

      // console.log(`Email sent to ${email}: ${info.messageId}`);
    } catch (error) {
      console.error(`Error sending email to ${data.to}: `, error);
    }
  }
}
