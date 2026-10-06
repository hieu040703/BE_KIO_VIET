import { injectable, inject } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { CustomerRepository } from "./customer.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { CUSTOMER_TYPES } from "./customer.types";
import { COMMON_TYPES } from "../common/common.types";
import { Customer } from "@/database/models/Customer";
import { CustomerRelations, CustomerSelectFull } from "./customer.select";
import { IEntityManager } from "@/shared/types/interfaces";
import { IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { DeepPartial } from "typeorm";
import { CommonService } from "../common/common.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/shared/types/errors";
import { CreateUserDto } from "../user/user.validator";
import { AuthUtils } from "@/shared/utils/auth.utils";
import { UserRoleEnum } from "@/shared/constants/constance";
import { USER_TYPES } from "../user/user.types";
import { UserService } from "../user/user.service";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { UpdateClientCustomerProfileDto } from "./customer.validator";

@injectable()
export class CustomerService extends BaseService<Customer> {
  protected relations = CustomerRelations;
  protected selectedFields = CustomerSelectFull;
  constructor(
    @inject(CUSTOMER_TYPES.CustomerRepository) private customerRepository: CustomerRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
    @inject(COMMON_TYPES.CommonService) private commonService: CommonService,
    @inject(USER_TYPES.UserService) private userService: UserService,
  ) {
    super(customerRepository);
  }

  /**
   * Gắn thêm "Đơn hàng gần nhất" (hợp đồng mới nhất theo timeAt) cho từng customer trong trang.
   * Chạy 1 query duy nhất (DISTINCT ON) cho cả page — chạy sau khi findWithPagination trả data.
   */
  protected async attachMoreDataToEntities(entities: Customer[], options: IFindOptions<Customer>, req?: Request): Promise<void> {
    if (!entities?.length) return;

    const customerIds = entities.map((c) => c.id).filter(Boolean);
    if (!customerIds.length) return;

    const latestOrders = await this.customerRepository.getLatestOrdersByCustomerIds(customerIds);
    const latestOrderMap = new Map(latestOrders.map((o) => [o.customerId, o]));

    for (const customer of entities) {
      (customer as any).latestOrder = latestOrderMap.get(customer.id) ?? null;
    }
  }

  async validateBeforeCreate(data: DeepPartial<Customer>, req?: Request, manager?: IEntityManager): Promise<void> {
    await this.commonService.validateUniquePhone(data.phone, "customer", undefined, manager);

    if (!data.code) {
      const code = await this.commonService.getCode("Customer");
      data.code = code.data.code;
    } else {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.customerRepository.fieldExists("code", data.code, manager);
      if (codeExists) {
        throw new BadRequestError("Mã chi nhánh đã tồn tại");
      }
    }
  }

  async actionAfterCreate(data: Customer, req?: Request, manager?: IEntityManager): Promise<void> {
    // create account for customer
    const passwordHash = await AuthUtils.hashPassword("123456");
    const dataCreateUser: CreateUserDto = {
      customerId: data.id,
      name: data.name,
      username: data.phone,
      password: passwordHash,
      role: UserRoleEnum.USER,
    };

    await this.userService.create(dataCreateUser, req, manager);
  }

  async validateBeforeUpdate(
    id: string,
    data: Partial<Customer>,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<void> {
    const existingCustomer = await this.customerRepository.findById(id, manager);
    if (!existingCustomer) {
      throw new NotFoundError("Khách hàng không tồn tại");
    }

    if (data.code && data.code !== existingCustomer.code) {
      // Kiểm tra mã đã tồn tại
      const codeExists = await this.customerRepository.fieldExistsExcludingId("code", data.code, id, manager);
      if (codeExists) {
        throw new BadRequestError("Mã khách hàng đã được sử dụng");
      }
    }

    if (data.phone !== undefined) {
      await this.commonService.validateUniquePhone(data.phone, "customer", id, manager);
    }
  }

  async updateClientProfile(
    data: UpdateClientCustomerProfileDto,
    req?: Request,
    manager?: IEntityManager,
  ) {
    const customerId = req?.user?.customerId;
    if (!customerId) {
      throw new ForbiddenError("User does not have an associated customer ID");
    }

    const existingCustomer = await this.customerRepository.findById(customerId, manager, false, req);
    if (!existingCustomer) {
      throw new NotFoundError("Khách hàng không tồn tại");
    }

    const updateData: Partial<Customer> = {
      customName: data.customName,
      address: data.address,
      email: data.email,
      dob: data.dob,
      businessCode: data.businessCode,
      gender: data.gender,
    };

    await this.customerRepository.update(customerId, updateData, manager);

    const updatedCustomer = await this.customerRepository.findById(customerId, manager, false, req);

    return ApiResponseHandler.updateSuccess("OK", updatedCustomer ?? existingCustomer);
  }
}
