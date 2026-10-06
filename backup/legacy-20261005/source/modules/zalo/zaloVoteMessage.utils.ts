import { Order } from "@/database/models/Order";

export interface ZaloVoteRecipient {
  customerId: string;
  customerName: string;
  phone: string;
  tripId: string;
  driverId?: string;
  tripIds: string[];
}

export function normalizeZaloPhoneNumber(phoneNumber: string): string {
  let normalized = phoneNumber.trim();

  if (normalized.startsWith("+84")) {
    normalized = "84" + normalized.slice(3);
  } else if (normalized.startsWith("0")) {
    normalized = "84" + normalized.slice(1);
  }

  return normalized;
}

export function buildZaloVoteRecipients(order: Order[]): ZaloVoteRecipient[] {
  const recipientsByCustomer = new Map<string, ZaloVoteRecipient>();
  const sortedTrips = [...order].sort((a, b) => new Date(b.timeAt).getTime() - new Date(a.timeAt).getTime());

  for (const trip of sortedTrips) {
    if (!trip.id || !trip.customerId || !trip.customer?.phone) {
      continue;
    }

    const existingRecipient = recipientsByCustomer.get(trip.customerId);

    if (existingRecipient) {
      existingRecipient.tripIds.push(trip.id);
      continue;
    }

    recipientsByCustomer.set(trip.customerId, {
      customerId: trip.customerId,
      customerName: trip.customer.name || "Quý khách",
      phone: normalizeZaloPhoneNumber(trip.customer.phone),
      tripId: trip.id,
      tripIds: [trip.id],
    });
  }

  return Array.from(recipientsByCustomer.values());
}
