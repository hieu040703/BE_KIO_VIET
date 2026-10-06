import { Job } from "bull";
import { JobProcessor } from "../base/BaseQueue";
import { EmailUtils } from "@/shared/utils/email/sendMail.utils";

export interface EmailJobData {
  to: string;
  subject: string;
  content: string;
  template?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

export class EmailJobProcessor implements JobProcessor<EmailJobData> {
  async process(job: Job<EmailJobData>): Promise<any> {
    const emailData = job.data;

    // Simulate email sending
    console.log(`Sending email to: ${emailData.to}`);
    console.log(`Subject: ${emailData.subject}`);

    // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
    await EmailUtils.sendEmail(emailData);

    console.log(`Email sent successfully to ${emailData.to}`, {
      jobId: job.id,
      subject: emailData.subject,
    });

    return {
      sent: true,
      recipient: emailData.to,
      timestamp: new Date(),
    };
  }
}
