import { SSEService } from "@/modules/sse/sse.service";
import { SSE_TYPES } from "@/modules/sse/sse.types";
import { Utils } from "@/shared/utils/utils";
import { ProgressCallback } from "../types";
import { container } from "@/modules/container";

/**
 * Helper class for managing job progress with SSE
 */
export class ProgressHelper {
  private sseService: SSEService;
  private sseName: string;
  private userId: string;

  constructor(userId: string) {
    this.sseService = container.get<SSEService>(SSE_TYPES.SSEService);
    this.sseName = Utils.generateRandomString(8);
    this.userId = userId;

    // Send SSE name to client immediately for registration
    this.sendJobStarted();
  }

  /**
   * Get SSE name for client to register listener
   */
  getSSEName(): string {
    return this.sseName;
  }

  /**
   * Send job started event
   */
  private sendJobStarted(): void {
    this.sseService.sendToUser(this.userId, "job-started", {
      sseName: this.sseName,
      message: "Job started",
      timestamp: Date.now(),
    });
  }

  /**
   * Create progress callback function
   */
  createCallback(): ProgressCallback {
    return (progress: number, message: string, data?: Record<string, any>) => {
      this.sseService.sendToUser(this.userId, this.sseName, {
        message,
        progress,
        ...data,
      });
    };
  }

  /**
   * Send progress update
   */
  sendProgress(
    progress: number,
    message: string,
    data?: {
      total?: number;
      success?: number;
      failed?: number;
      [key: string]: any;
    },
  ): void {
    this.sseService.sendToUser(this.userId, this.sseName, {
      message,
      progress,
      ...data,
    });
  }

  /**
   * Send completion
   */
  sendCompleted(data?: Record<string, any>): void {
    this.sseService.sendToUser(this.userId, this.sseName, {
      message: "Job completed",
      progress: 100,
      completed: true,
      ...data,
    });
  }

  /**
   * Send error
   */
  sendError(error: string | Error): void {
    const errorMessage = error instanceof Error ? error.message : error;
    this.sseService.sendToUser(this.userId, this.sseName, {
      message: `Job failed: ${errorMessage}`,
      progress: 0,
      error: true,
      errorMessage,
    });
  }
}
