import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { GenderType } from "@/shared/constants/constance";
import { CustomerService } from "../customer.service";

describe("CustomerService.updateClientProfile", () => {
  it("updates only the allowed self-profile fields", async () => {
    const existingCustomer = {
      id: "customer-1",
      code: "KH001",
      name: "Cong ty Thien Bao",
      phone: "0900000000",
      taxCode: "TAX-001",
      customName: null,
      address: null,
      email: null,
      dob: null,
      businessCode: null,
      gender: null,
    };

    const updatedCustomer = {
      ...existingCustomer,
      customName: "Thiên Bảo Logistics",
      address: { country: "Vietnam", detail: "123 Nguyen Hue" },
      email: "client@example.com",
      dob: new Date("1998-01-20"),
      businessCode: "BIZ-123",
      gender: GenderType.FEMALE,
    };

    const customerRepository = {
      findById: jest.fn().mockResolvedValue(updatedCustomer),
      update: jest.fn().mockResolvedValue(updatedCustomer),
      setOptions: jest.fn(),
    } as any;

    const service = new CustomerService(customerRepository, {} as any, {} as any, {} as any);

    const result = await (service as any).updateClientProfile(
      {
        customName: "Thiên Bảo Logistics",
        address: { country: "Vietnam", detail: "123 Nguyen Hue" },
        email: "client@example.com",
        dob: new Date("1998-01-20"),
        businessCode: "BIZ-123",
        gender: GenderType.FEMALE,
        name: "Hack Name",
        phone: "0999999999",
        taxCode: "HACK-TAX",
        code: "HACK-CODE",
      },
      {
        user: {
          customerId: "customer-1",
        },
      } as any,
    );

    expect(customerRepository.update).toHaveBeenCalledWith(
      "customer-1",
      {
        customName: "Thiên Bảo Logistics",
        address: { country: "Vietnam", detail: "123 Nguyen Hue" },
        email: "client@example.com",
        dob: new Date("1998-01-20"),
        businessCode: "BIZ-123",
        gender: GenderType.FEMALE,
      },
      undefined,
    );

    expect(result.data).toMatchObject({
      id: "customer-1",
      code: "KH001",
      name: "Cong ty Thien Bao",
      phone: "0900000000",
      taxCode: "TAX-001",
      customName: "Thiên Bảo Logistics",
      email: "client@example.com",
      businessCode: "BIZ-123",
      gender: GenderType.FEMALE,
    });
  });
});
