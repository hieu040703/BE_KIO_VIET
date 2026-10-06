import { injectable, inject } from "inversify";
import { In, IsNull, Not } from "typeorm";
import { BaseService } from "@/shared/base/BaseService";
import { CallNavigationRepository } from "./callNavigation.repository";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { CALL_NAVIGATION_TYPES } from "./callNavigation.types";
import { COMMON_TYPES } from "../common/common.types";
import { CUSTOMER_TYPES } from "../customer/customer.types";
import { CustomerRepository } from "../customer/customer.repository";
import { CallNavigation } from "@/database/models/CallNavigation";
import { CallNavigationRelations, CallNavigationSelectFull } from "./callNavigation.select";
import { CreateCallNavigationDto } from "./callNavigation.validator";
import { Order } from "@/database/models/Order";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { BadRequestError, NotFoundError } from "@/shared/types/errors";
import { OrderStatusEnum } from "@/shared/constants/constance";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import { EMPLOYEE_TYPES } from "../employee/employee.types";
import { EmployeeRepository } from "../employee/employee.repository";

@injectable()
export class CallNavigationService extends BaseService<CallNavigation> {
  protected relations = CallNavigationRelations;
  protected selectedFields = CallNavigationSelectFull;
  constructor(
    @inject(CALL_NAVIGATION_TYPES.CallNavigationRepository)
    private callNavigationRepository: CallNavigationRepository,
    @inject(CUSTOMER_TYPES.CustomerRepository)
    private customerRepository: CustomerRepository,
    @inject(EMPLOYEE_TYPES.EmployeeRepository) private employeeRepository: EmployeeRepository,
    @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager,
  ) {
    super(callNavigationRepository);
  }

  /**
   * Phải có bản ghi trong CallNavigation thì mới điều hướng gọi qua số trung gian, gọi từ bên ngoài thì sẽ điều hướng về hotline.
   * Nhân viên gọi điện cho khách hàng từ app, hệ thống sẽ lựa chọn 1 số điện thoại trong danh sách để nhân viên gọi vào số này liên lạc với khách hàng
   * hiện tại có 3 số điện thoại được cấu hình trong biến môi trường STRINGEE_REAL_NUMBER, khi nhân viên thực hiện cuộc gọi thì sẽ lấy 1 số điện thoại trong 3 số này để gọi, nếu số điện thoại đó đang có cuộc gọi đến khách hàng khác thì sẽ lấy số khác
   * nếu 1 khách hàng mà đang có 3 phiên cuộc gọi  ưu tiên thì sẽ không cho nhân viên nào khác gọi đến khách hàng đó nữa (khách hàng chỉ đặt tối đa 3 đơn cùng lúc)
   * @param order
   * @param userId
   * @param manager
   * @returns
   */
  async makeCallToCustomer(
    order: Order,
    userId: string,
    manager?: IEntityManager,
  ): Promise<ApiResponse<{ phone: string }>> {
    const stringeeRealPhoneNumbers = config.STRINGEE_REAL_NUMBER.split(",").map((num) => num.trim());

    // nếu đơn hàng đã kết thúc thì không gọi được nữa
    if (
      order.status === OrderStatusEnum.CANCELED ||
      order.status === OrderStatusEnum.COMPLETED ||
      order.completedByEmployeeId !== null
    ) {
      throw new BadRequestError("Hợp đồng đã hết thời gian kết nối, không thể thực hiện cuộc gọi");
    }

    const customer = await this.customerRepository.findById(order.customerId, manager);

    if (!customer) {
      throw new NotFoundError("Khách hàng không tồn tại");
    }

    const customerPhone = order.customerPhone || customer.phone;

    let phone = stringeeRealPhoneNumbers[0]; // mặc định lấy số điện thoại đầu tiên để gọi

    // tìm nhân viên có tk userId
    const emp = await this.employeeRepository.findByUserId(userId);
    if (!emp) {
      throw new BadRequestError("Dữ liệu nhân viên không hợp lệ");
    }

    if (!emp.phone) {
      throw new BadRequestError(`Vui lòng cập nhật số điện thoại cho quản lý chi nhánh ${emp.zaloName || emp.name}`);
    }

    // tìm tất cả các điều hướng cho đơn hàng này
    let navigations = await this.callNavigationRepository.findByOptions(
      {
        where: {
          orderId: order.id,
          expiresAt: IsNull(), // chỉ lấy những cuộc gọi vẫn còn hiệu lực
        },
      },
      manager,
    );

    // trường hợp đã tạo điều hướng cho 1 hoặc nhiều nhân viên cho đơn hàng này rồi
    if (navigations.length > 0) {
      // tìm điều hướng của người dùng userId
      const navigation = navigations.find((n) => n.userId === userId);

      if (navigation) {
        logger.info(
          `Đã tồn tại điều hướng cuộc gọi cho nhân viên ${userId} và chuyến đi ${order.id}, sử dụng số điện thoại stringee ${navigation.stringeePhone} để gọi khách hàng ${customer.id}`,
        );
        //! trường hợp này là nhân viên nhấn nút gọi cho khách hàng, nên sẽ chuyển priority về 1 để ưu tiên hiển thị cuộc gọi này, các điều hướng khác của nhân viên này sẽ được chuyển về priority 0
        // đã tồn tại điều hướng cuộc gọi cho chuyến đi này rồi thì ưu tiên sử dụng điều hướng đó để gọi, đồng thời update lại priority của điều hướng này thành 1 để ưu tiên hiển thị cuộc gọi này
        await this.callNavigationRepository.update(navigation.id, { priority: 1 }, manager);
        phone = navigation.stringeePhone;

        // update tất cả các điều hướng khác của nhân viên này về priority 0 để ưu tiên điều hướng của chuyến đi này
        const navigationUpdates = await this.callNavigationRepository.findByOptions(
          {
            where: {
              userId: userId,
              id: Not(navigation.id),
            },
          },
          manager,
        );

        if (navigationUpdates.length > 0) {
          await this.callNavigationRepository.updateOptions(
            { priority: 0 },
            {
              id: Not(navigation.id),
            },
            manager,
          );
        }
      } else {
        // nếu chưa có điều hướng cho nhân viên này thì tạo mới, số điện thoại stringee phải giữ nguyên như điều hướng của nhân viên khác đã tạo cho chuyến đi này, không được thay đổi số điện thoại stringee để tránh việc 1 khách hàng có nhiều nhân viên gọi đến cùng lúc
        phone = navigations[0].stringeePhone;

        const dataCreateCallNavigation: CreateCallNavigationDto = {
          customerId: customer.id,
          userId: userId,
          employeePhone: emp.phone,
          phone: customerPhone,
          stringeePhone: phone,
          expiresAt: null, // khi đơn hàng hoàn thành thì sẽ cập nhật hết hạn
          orderId: order.id, // liên kết với chuyến đi nếu có
          priority: 1, // ưu tiên hiển thị cuộc gọi này
        };

        await this.callNavigationRepository.create(dataCreateCallNavigation, manager);
      }
    } else {
      // trường hợp chưa tạo bất kỳ điều hướng nào cho đơn hàng này, tạo lần đầu lúc tạo đơn
      // lấy tất cả các điều hướng của khách hàng còn khả dụng
      const availableCall = await this.callNavigationRepository.findByOptions(
        {
          where: {
            customerId: customer.id,
            phone: customerPhone,
            expiresAt: IsNull(), // chỉ lấy những cuộc gọi vẫn còn hiệu lực
          },
        },
        manager,
      );

      // lấy mảng stringee phone duy nhất
      const stringeePhoneUsed: string[] = [];
      if (availableCall.length > 0) {
        for (const call of availableCall) {
          if (!stringeePhoneUsed.includes(call.stringeePhone)) {
            stringeePhoneUsed.push(call.stringeePhone);
          }
        }
      }

      // phiên cho khách hàng đã đạt đến số lượng tối đa
      if (stringeePhoneUsed.length >= stringeeRealPhoneNumbers.length) {
        // throw new BadRequestError("Khách hàng đang có nhiều cuộc gọi đến, vui lòng thử lại sau");
        phone = config.HOTLINE_NUMBER;
      } else {
        const availablePhoneNumbers = stringeeRealPhoneNumbers.filter((num) => !stringeePhoneUsed.includes(num));
        if (availablePhoneNumbers.length === 0) {
          // throw new BadRequestError("Không còn số điện thoại nào khả dụng để gọi khách hàng, vui lòng thử lại sau")
          phone = config.HOTLINE_NUMBER;
        } else {
          phone = availablePhoneNumbers[0]; // lấy số điện thoại đầu tiên trong danh sách số khả dụng
        }
      }

      // tạo phiên cho cuộc gọi
      const dataCreateCallNavigation: CreateCallNavigationDto = {
        customerId: customer.id,
        userId: userId,
        employeePhone: emp.phone,
        phone: customerPhone,
        stringeePhone: phone,
        expiresAt: null, // khi đơn hàng hoàn thành thì sẽ cập nhật hết hạn
        orderId: order.id, // liên kết với chuyến đi nếu có
        priority: 1, // ưu tiên hiển thị cuộc gọi này
      };

      await this.callNavigationRepository.create(dataCreateCallNavigation, manager);
    }

    return ApiResponseHandler.createSuccess("OK", { phone });
  }

  async stopCallNavigationByOrder(orderId: string, manager?: IEntityManager): Promise<void> {
    const cns = await this.callNavigationRepository.findByOptions(
      {
        where: {
          orderId,
        },
      },
      manager,
    );

    if (cns.length > 0) {
      await this.callNavigationRepository.updateMany(
        cns.map((c) => c.id),
        { expiresAt: new Date() },
        manager,
      );
    }
  }
}
