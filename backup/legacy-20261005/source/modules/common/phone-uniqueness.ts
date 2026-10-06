import { BadRequestError } from "@/shared/types/errors";
import type { IEntityManager } from "@/shared/types/interfaces";
import { In, Not } from "typeorm";

export type PhoneOwner = "employee" | "customer";

interface PhoneRepository {
  count(where: Record<string, unknown>, manager?: IEntityManager): Promise<number>;
}

const normalizePhoneNumber = (phone: string): string => {
  if (phone.startsWith("+84")) return `0${phone.slice(3)}`;
  if (phone.startsWith("84")) return `0${phone.slice(2)}`;
  return phone;
};

export async function validateUniquePhone(
  phone: string | null | undefined,
  owner: PhoneOwner,
  ownerId: string | undefined,
  manager: IEntityManager | undefined,
  employeeRepository: PhoneRepository,
  customerRepository: PhoneRepository,
): Promise<void> {
  const trimmedPhone = phone?.trim();
  if (!trimmedPhone) return;

  const normalizedPhone = normalizePhoneNumber(trimmedPhone);
  const phoneCandidates = new Set([trimmedPhone, normalizedPhone]);

  if (normalizedPhone.startsWith("0") && normalizedPhone.length > 1) {
    const internationalPhone = normalizedPhone.slice(1);
    phoneCandidates.add(`84${internationalPhone}`);
    phoneCandidates.add(`+84${internationalPhone}`);
  }

  const employeeWhere: Record<string, unknown> = { phone: In([...phoneCandidates]) };
  const customerWhere: Record<string, unknown> = { phone: In([...phoneCandidates]) };

  if (owner === "employee" && ownerId) employeeWhere.id = Not(ownerId);
  if (owner === "customer" && ownerId) customerWhere.id = Not(ownerId);

  const [employeeCount, customerCount] = await Promise.all([
    employeeRepository.count(employeeWhere, manager),
    customerRepository.count(customerWhere, manager),
  ]);

  if (employeeCount > 0 || customerCount > 0) {
    throw new BadRequestError("Số điện thoại đã được sử dụng cho nhân viên hoặc khách hàng khác");
  }
}
