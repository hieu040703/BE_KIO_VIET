import admin from "@/shared/config/firebase";
import {
  MessagingClientErrorCode,
  type MulticastMessage,
  type SendResponse,
} from "firebase-admin/messaging";
import { container } from "@/modules/container";
import { TokenRepository } from "@/modules/token/token.repository";
import { TOKEN_TYPES } from "@/modules/token/token.types";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";

export const FIREBASE_TOKEN_CLEANUP_CRON = "0 0 1 * * *";
export const FIREBASE_TOKEN_CLEANUP_BATCH_SIZE = 500;

const PERMANENT_FIREBASE_TOKEN_ERROR_CODES = new Set([
  `messaging/${MessagingClientErrorCode.INVALID_REGISTRATION_TOKEN.code}`,
  `messaging/${MessagingClientErrorCode.REGISTRATION_TOKEN_NOT_REGISTERED.code}`,
]);

export interface FirebaseTokenCleanupRecord {
  id: string;
  firebaseToken: string | null;
}

export interface FirebaseTokenCleanupJobDeps {
  findFirebaseTokens: (
    afterId: string | undefined,
    limit: number,
  ) => Promise<FirebaseTokenCleanupRecord[]>;
  validateFirebaseTokens: (tokens: string[]) => Promise<string[]>;
  clearFirebaseTokens: (tokens: string[]) => Promise<number>;
}

export interface ProcessFirebaseTokenCleanupOptions {
  batchSize?: number;
}

export interface ProcessFirebaseTokenCleanupResult {
  tokensChecked: number;
  tokensRemoved: number;
  batches: number;
}

export function isPermanentFirebaseTokenError(error?: { code?: string } | null): boolean {
  return Boolean(error?.code && PERMANENT_FIREBASE_TOKEN_ERROR_CODES.has(error.code));
}

export async function validateFirebaseTokens(tokens: string[]): Promise<string[]> {
  if (tokens.length === 0) {
    return [];
  }

  const message: MulticastMessage = {
    tokens,
    data: { tokenValidation: "true" },
  };
  const response = await admin.messaging().sendEachForMulticast(message, true);

  return response.responses.reduce<string[]>((invalidTokens, sendResponse: SendResponse, index) => {
    if (isPermanentFirebaseTokenError(sendResponse.error)) {
      invalidTokens.push(tokens[index]);
    }
    return invalidTokens;
  }, []);
}

export async function processFirebaseTokenCleanup(
  deps: FirebaseTokenCleanupJobDeps,
  options: ProcessFirebaseTokenCleanupOptions = {},
): Promise<ProcessFirebaseTokenCleanupResult> {
  const batchSize = Math.min(
    FIREBASE_TOKEN_CLEANUP_BATCH_SIZE,
    Math.max(1, Math.floor(options.batchSize ?? FIREBASE_TOKEN_CLEANUP_BATCH_SIZE)),
  );
  let afterId: string | undefined;
  let tokensChecked = 0;
  let tokensRemoved = 0;
  let batches = 0;

  while (true) {
    const records = await deps.findFirebaseTokens(afterId, batchSize);
    if (records.length === 0) {
      break;
    }

    batches += 1;
    tokensChecked += records.length;
    const tokens = [
      ...new Set(
        records
          .map((record) => record.firebaseToken)
          .filter((token): token is string => Boolean(token)),
      ),
    ];
    const invalidTokens = await deps.validateFirebaseTokens(tokens);

    if (invalidTokens.length > 0) {
      tokensRemoved += await deps.clearFirebaseTokens([...new Set(invalidTokens)]);
    }

    afterId = records[records.length - 1].id;
  }

  return { tokensChecked, tokensRemoved, batches };
}

async function process(): Promise<ProcessFirebaseTokenCleanupResult> {
  const tokenRepository = container.get<TokenRepository>(TOKEN_TYPES.TokenRepository);

  return processFirebaseTokenCleanup({
    findFirebaseTokens: (afterId, limit) => tokenRepository.findFirebaseTokens(afterId, limit),
    validateFirebaseTokens,
    clearFirebaseTokens: (tokens) => tokenRepository.clearFirebaseTokens(tokens),
  });
}

let job: Cron | null = null;
let isProcessing = false;

export const JobFirebaseTokenCleanup = {
  start: () => {
    if (!job) {
      job = new Cron(
        FIREBASE_TOKEN_CLEANUP_CRON,
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          if (isProcessing) {
            logger.warn("FIREBASE TOKEN CLEANUP JOB: previous run is still processing");
            return;
          }

          isProcessing = true;
          logger.info("START FIREBASE TOKEN CLEANUP JOB: " + new Date().toISOString());
          try {
            const result = await process();
            logger.info(
              `FIREBASE TOKEN CLEANUP JOB: checked ${result.tokensChecked} token(s), removed ${result.tokensRemoved} token(s)`,
            );
          } catch (error) {
            logger.error("Error in Firebase Token Cleanup Job:", error);
          } finally {
            isProcessing = false;
          }
        },
      );
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP FIREBASE TOKEN CLEANUP JOB");
    }
  },
};
