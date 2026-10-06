/**
 * Example: EmailJobProcessor refactored using BaseProcessor
 *
 * This demonstrates how to migrate from old processor to new BaseProcessor
 */

import { Job } from "bull";
import { BaseProcessor } from "../base/BaseProcessor";
import { EmailUtils } from "@/shared/utils/email/sendMail.utils";
import { ProgressJobData } from "../types";

export interface EmailJobData extends ProgressJobData {
  to: string;
  subject: string;
  content: string;
  template?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

/**
 * ✅ NEW: Extend BaseProcessor instead of implementing JobProcessor
 * Benefits:
 * - Automatic SSE progress tracking
 * - Built-in logging with job context
 * - Error handling with retry logic
 * - Progress helper utilities
 */
export class EmailJobProcessorExample extends BaseProcessor<EmailJobData> {
  async process(job: Job<EmailJobData>): Promise<any> {
    const startTime = Date.now();

    // ✅ Create context with logger and progress callback
    const context = this.createContext(job);
    const progressHelper = this.getProgressHelper(job);

    try {
      // ✅ Use built-in logging method
      this.logStart(job, `Sending email to: ${job.data.to}`);

      // ✅ Send progress via context (automatically tracked by SSE)
      context.progress(10, "Preparing email...");

      const emailData = job.data;

      // Validate email data
      if (!this.validateEmail(emailData)) {
        throw new Error("Invalid email data");
      }

      context.progress(30, "Connecting to email service...");

      // Send email
      await EmailUtils.sendEmail(emailData);

      context.progress(80, "Email sent, waiting for confirmation...");

      // Wait for delivery confirmation (simulate)
      await new Promise((resolve) => setTimeout(resolve, 500));

      context.progress(100, "Email delivered successfully!");

      const result = {
        sent: true,
        recipient: emailData.to,
        timestamp: new Date(),
      };

      // ✅ Use built-in logging for completion
      this.logComplete(job, Date.now() - startTime, result);

      // ✅ Send completion via progress helper
      if (progressHelper) {
        progressHelper.sendCompleted(result);
      }

      return result;
    } catch (error: any) {
      // ✅ Use built-in error handling
      // This will:
      // - Log the error with context
      // - Send error notification via SSE
      // - Re-throw for Bull retry logic
      await this.handleError(job, error, progressHelper);
    }
  }

  /**
   * Helper method for email validation
   */
  private validateEmail(data: EmailJobData): boolean {
    return !!(data.to && data.subject && data.content);
  }
}

/**
 * COMPARISON: Old vs New
 *
 * OLD WAY (Without BaseProcessor):
 * ❌ 50+ lines of boilerplate
 * ❌ Manual SSE setup
 * ❌ Manual logging
 * ❌ Manual error handling
 *
 * export class EmailJobProcessor implements JobProcessor<EmailJobData> {
 *   async process(job: Job<EmailJobData>): Promise<any> {
 *     const emailData = job.data;
 *
 *     // Manual SSE setup
 *     const sseService = container.get<SSEService>(SSE_TYPES.SSEService);
 *     const sseName = Utils.generateRandomString(8);
 *
 *     sseService.sendToUser(job.data.userId, "job-started", {
 *       sseName: sseName,
 *       message: "Job started",
 *       timestamp: Date.now(),
 *     });
 *
 *     const sendProgress = (progress: number, message: string) => {
 *       sseService.sendToUser(job.data.userId, sseName, {
 *         message,
 *         progress,
 *       });
 *     };
 *
 *     try {
 *       // Manual logging
 *       logger.info(`Sending email to: ${emailData.to}`);
 *
 *       sendProgress(10, "Preparing email...");
 *
 *       await EmailUtils.sendEmail(emailData);
 *
 *       sendProgress(100, "Email sent!");
 *
 *       logger.info(`Email sent successfully to ${emailData.to}`, {
 *         jobId: job.id,
 *         subject: emailData.subject,
 *       });
 *
 *       return {
 *         sent: true,
 *         recipient: emailData.to,
 *         timestamp: new Date(),
 *       };
 *     } catch (error: any) {
 *       // Manual error handling
 *       logger.error(`Failed to send email:`, error);
 *       sseService.sendToUser(job.data.userId, sseName, {
 *         error: true,
 *         message: error.message,
 *       });
 *       throw error;
 *     }
 *   }
 * }
 *
 * NEW WAY (With BaseProcessor):
 * ✅ 30 lines of actual logic
 * ✅ Automatic SSE handling
 * ✅ Built-in logging methods
 * ✅ Centralized error handling
 * ✅ Type-safe context
 * ✅ Reusable utilities
 */
