import { UserRoleEnum } from "@/shared/constants/constance";

export interface OrderLeaderChatUser {
  role: UserRoleEnum;
  employeeId: string | null;
}

export interface OrderLeaderChatCursor {
  timeAt: Date;
  id: string;
}

export interface OrderLeaderChatNotificationRecipients {
  recipientIds: string[];
  taggedRecipientIds: string[];
  genericRecipientIds: string[];
}

export function canAccessOrderLeaderChat(
  user: OrderLeaderChatUser,
  orderLeaderEmployeeIds: string[],
  createdByEmployeeId?: string | null,
): boolean {
  if (user.role === UserRoleEnum.ADMIN) {
    return true;
  }

  return Boolean(
    user.employeeId &&
      (orderLeaderEmployeeIds.includes(user.employeeId) || user.employeeId === createdByEmployeeId),
  );
}

export function getOrderLeaderChatNotificationRecipients(
  participantUserIds: string[],
  senderUserId: string,
  tags?: string[] | null,
): OrderLeaderChatNotificationRecipients {
  const recipientIds = [
    ...new Set(participantUserIds.filter((userId) => userId !== senderUserId)),
  ];
  const taggedRecipientIds = [
    ...new Set(
      (tags || []).filter(
        (userId) => userId !== senderUserId && recipientIds.includes(userId),
      ),
    ),
  ];
  const taggedRecipientIdSet = new Set(taggedRecipientIds);

  return {
    recipientIds,
    taggedRecipientIds,
    genericRecipientIds: recipientIds.filter((userId) => !taggedRecipientIdSet.has(userId)),
  };
}

export function isMessageAfterCursor(
  message: OrderLeaderChatCursor,
  cursor: OrderLeaderChatCursor,
): boolean {
  const messageTime = message.timeAt.getTime();
  const cursorTime = cursor.timeAt.getTime();

  return messageTime > cursorTime || (messageTime === cursorTime && message.id > cursor.id);
}
