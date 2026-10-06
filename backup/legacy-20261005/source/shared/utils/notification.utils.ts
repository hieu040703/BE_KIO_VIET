const ALERT_TITLE_PREFIX = "⚠️";

export function formatAlertNotificationTitle(title: string): string {
  return title.startsWith(ALERT_TITLE_PREFIX)
    ? title
    : `${ALERT_TITLE_PREFIX} ${title}`;
}

export function formatOrderNotificationTitle(
  orderCode: string | null | undefined,
  title: string,
): string {
  if (!orderCode) {
    return title;
  }

  const prefix = `[${orderCode}]:`;
  return title.startsWith(prefix) ? title : `${prefix} ${title}`;
}

export function buildOrderMentionNotification(
  order: { code?: string | null; name?: string | null },
  sender?: { name?: string | null; username?: string | null } | null,
): { title: string; content: string } {
  const orderName = order.name || order.code || "hợp đồng";
  const senderName = sender?.name || sender?.username || "Người dùng";

  return {
    title: order.code ? `[${order.code}] bạn có tin nhắn mới` : "Bạn có tin nhắn mới",
    content: `${senderName} đã nhắc đến bạn trong hợp đồng ${orderName}`,
  };
}
