import admin from "@/shared/config/firebase";
import type { MulticastMessage, SendResponse } from "firebase-admin/messaging";
import { inject, injectable } from "inversify";
import { TokenRepository } from "@/modules/token/token.repository";
import { IsNull, Not } from "typeorm";
import { TOKEN_TYPES } from "@/modules/token/token.types";
import { container } from "@/modules/container";
import { formatOrderNotificationTitle } from "@/shared/utils/notification.utils";

interface SendNotificationData {
  userId?: string;
  topic?: string;
  title: string;
  content: string;
  imageUrl?: string;
  orderCode?: string | null;
  data?: any;
}

interface SendNotificationWithTokenData {
  token: string;
  title: string;
  content: string;
  imageUrl?: string;
  orderCode?: string | null;
  data?: any;
}

type IMessageTokens = MulticastMessage;

interface IMessageTopic {
  topic: string;
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  data: { score: string; time: string };
  android: { priority: "high" };
  apns: { payload: { aps: { sound: "default" } } };
}

@injectable()
export class FirebaseUtils {
  static async SentFirebaseWithUser(option: SendNotificationData) {
    const { userId, title, content, orderCode, data } = option;
    const notificationTitle = formatOrderNotificationTitle(orderCode, title);

    const tokenRepository = container.get<TokenRepository>(TOKEN_TYPES.TokenRepository);

    const result = await tokenRepository.findByOptions({
      where: {
        userId: userId,
        firebaseToken: Not(IsNull()),
      },
    });

    // if (result.length === 0) throw new Error("Token not found!");
    if (result.length > 0) {
      const tokens = result.map((token) => token.firebaseToken).filter((token) => token !== null);

      // FCM yêu cầu data chỉ chứa string values (không được có undefined/null/object)
      const stringifiedData: Record<string, string> | undefined = data
        ? Object.fromEntries(
            Object.entries(data)
              .filter(([, v]) => v !== undefined && v !== null)
              .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]),
          )
        : undefined;

      const message: IMessageTokens = {
        tokens: tokens,
        notification: {
          title: notificationTitle,
          body: content,
        },
        android: {
          notification: {
            channelId: "high_importance_channel",
            sound: "sound_chat",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "sound_chat.wav",
            },
          },
        },
        ...(stringifiedData && { data: stringifiedData }),
      };

      const chunkSize = 100;
      const failedTokens: string[] = [];

      for (let i = 0; i < tokens.length; i += chunkSize) {
        const tokenChunk = tokens.slice(i, i + chunkSize);
        const multicastMessage = { ...message, tokens: tokenChunk };

        try {
          const response = await admin.messaging().sendEachForMulticast(multicastMessage);

          if (response.failureCount > 0) {
            response.responses.forEach((resp: SendResponse, idx: number) => {
              if (!resp.success) {
                const errorCode = resp.error?.code || "unknown";
                const errorMsg = resp.error?.message || "unknown error";
                // console.error(`Token failed [${tokenChunk[idx]}]: code=${errorCode}, message=${errorMsg}`);
                failedTokens.push(tokenChunk[idx]);
              }
            });
            // console.error(`Chunk ${i / chunkSize + 1}: ${response.failureCount} token(s) failed`);
          } else {
            // console.log(`Chunk ${i / chunkSize + 1}: All messages sent successfully`);
          }
        } catch (error) {
          // console.error(`Chunk ${i / chunkSize + 1}: Error sending message:`, error);
        }
      }

      return failedTokens;
    }
  }

  static async SentFirebaseWithToken(option: SendNotificationWithTokenData) {
    const { title, content, orderCode, data, token } = option;
    const notificationTitle = formatOrderNotificationTitle(orderCode, title);

    // FCM yêu cầu data chỉ chứa string values (không được có undefined/null/object)
    const stringifiedData: Record<string, string> | undefined = data
      ? Object.fromEntries(
          Object.entries(data)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]),
        )
      : undefined;

    const message: IMessageTokens = {
      tokens: [token],
      notification: {
        title: notificationTitle,
        body: content,
      },
      android: {
        notification: {
          channelId: "high_importance_channel",
          sound: "sound_chat",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "sound_chat.wav",
          },
        },
      },
      ...(stringifiedData && { data: stringifiedData }),
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log("✅ Thông báo đã gửi thành công:", response);
      console.log(response.responses[0].error);
      return true;
    } catch (error: any) {
      console.error("❌ Lỗi khi gửi thông báo:", error.message);
      return false;
    }
  }

  static async SentFirebaseWithTopic(option: SendNotificationData) {
    const { title, content, imageUrl, orderCode, data, topic } = option;
    const notificationTitle = formatOrderNotificationTitle(orderCode, title);

    const message: any = {
      topic: topic as string,
      notification: { title: notificationTitle, body: content, imageUrl: imageUrl },
      data: data,
      android: { priority: "high" as "high" },
      apns: { payload: { aps: { sound: "default" } } },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log("✅ Thông báo đã gửi thành công:", response);
      return true;
    } catch (error: any) {
      console.error("❌ Lỗi khi gửi thông báo:", error.message);
      return false;
    }
  }
}
