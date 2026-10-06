import { BaseRepository } from "@/shared/base/BaseRepository";
import { OrderEmployee } from "@/database/models/OrderEmployee";
import { FindOptionsSelect, In, SelectQueryBuilder } from "typeorm";
import {
  OrderEmployeeSelectFull,
  OrderEmployeeRelations,
} from "./orderEmployee.select";
import { injectable, inject } from "inversify";
import { EmployeeSelectBasic } from "@/modules/employee/employee.select";
import { USER_TYPES } from "@/modules/user/user.types";
import { UserRepository } from "@/modules/user/user.repository";
import { User } from "@/database/models/User";
import { TIME_KEEPING_TYPES } from "@/modules/timeKeeping/timeKeeping.types";
import { TimeKeepingRepository } from "@/modules/timeKeeping/timeKeeping.repository";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { OrderEmployeeStatusEnum } from "@/shared/constants/constance";

@injectable()
export class OrderEmployeeRepository extends BaseRepository<OrderEmployee> {
  protected entityClass = OrderEmployee;
  protected selectedFields = OrderEmployeeSelectFull;
  protected relations = OrderEmployeeRelations;

  constructor(
    @inject(USER_TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TIME_KEEPING_TYPES.TimeKeepingRepository)
    private timeKeepingRepository: TimeKeepingRepository,
  ) {
    super();
    this.setOptions();
  }

  setOptions(
    selectedFields?: FindOptionsSelect<OrderEmployee> | undefined,
  ): void {
    this.selectedFields = selectedFields || OrderEmployeeSelectFull;
    this.relations = OrderEmployeeRelations;
  }

  protected async extendQueryBuilder(
    qb: SelectQueryBuilder<OrderEmployee>,
    options: IFindOptions<OrderEmployee>,
    req?: Request,
  ): Promise<void> {
    const orderId = req?.params?.orderId as string;

    if (orderId) {
      qb.andWhere(`entity."orderId" = :orderId`, { orderId });
    }

    //? sắp xếp ưu tiên theo isLeader trước, sau đó mới đến createdAt
    if (!options.sortBy) {
      qb.addOrderBy(`entity."isLeader"`, "DESC");
      qb.addOrderBy(`entity."createdAt"`, "DESC");
    } else if (options.sortBy === "isLeader") {
      qb.addOrderBy(`entity."isLeader"`, options.sortOrder || "DESC");
    }
  }

  async getAllUsersByOrderId(
    orderId: string,
    manager?: IEntityManager,
  ): Promise<User[]> {
    const employees = await this.findByOptions(
      {
        where: { orderId },
        select: {
          id: true,
          orderId: true,
          employeeId: true,
          employee: EmployeeSelectBasic,
        },
        relations: {
          employee: true,
        },
      },
      manager,
    );

    // lấy danh sách user tương ứng với các employee
    return await this.userRepository.findByOptions(
      {
        where: {
          employeeId: In(employees.map((e) => e.employeeId)),
        },
        select: {
          id: true,
          name: true,
        },
      },
      manager,
    );
  }

  async hasEmployeesWithoutSalary(
    orderId: string,
    manager?: IEntityManager,
  ): Promise<boolean> {
    const executor = manager ?? this.getRepository().manager;
    const [result] = await executor.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM "order_employees"
          WHERE "orderId" = $1
            AND "deletedAt" IS NULL
            AND ("salary" IS NULL OR "salary" <= 0)
        ) AS "exists"
      `,
      [orderId],
    );

    return result?.exists === true;
  }

  async hasConfirmedEmployeesWithoutCheckout(
    orderId: string,
    manager?: IEntityManager,
  ): Promise<boolean> {
    const executor = manager ?? this.getRepository().manager;
    const [result] = await executor.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM "order_employees"
          WHERE "orderId" = $1
            AND "deletedAt" IS NULL
            AND "status" = $2::"order_employees_status_enum"
            AND "checkOutAt" IS NULL
        ) AS "exists"
      `,
      [orderId, OrderEmployeeStatusEnum.CONFIRMED],
    );

    return result?.exists === true;
  }

  /**
   * Kết thúc công việc của toàn bộ nhân viên bằng một lệnh SQL.
   * CTE đồng thời đồng bộ timekeeping để tránh save(array) tạo nhiều query song song
   * trên cùng QueryRunner của transaction.
   */
  async completeEmployeesForOrder(
    orderId: string,
    endTime: string,
    manager?: IEntityManager,
  ): Promise<string[]> {
    const executor = manager ?? this.getRepository().manager;
    const rows = (await executor.query(
      `
        WITH updated_order_employees AS (
          UPDATE "order_employees"
          SET
            "endTime" = $2::time,
            "totalHours" = CASE
              WHEN "startTime" IS NULL OR "startTime" = $2::time THEN "totalHours"
              ELSE ROUND(
                GREATEST(
                  (
                    EXTRACT(
                      EPOCH FROM (
                        CASE
                          WHEN $2::time > "startTime"
                            THEN $2::time - "startTime"
                          ELSE $2::time - "startTime" + INTERVAL '24 hours'
                        END
                      )
                    ) / 3600
                  ) - COALESCE("breakTime", 0),
                  0
                )::numeric,
                2
              )::double precision
            END,
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE "orderId" = $1
            AND "deletedAt" IS NULL
          RETURNING "id", "employeeId", "endTime", "totalHours"
        ),
        updated_time_keepings AS (
          UPDATE "time_keepings" AS tk
          SET
            "endTime" = updated."endTime",
            "totalHours" = updated."totalHours",
            "updatedAt" = CURRENT_TIMESTAMP
          FROM updated_order_employees AS updated
          WHERE tk."orderEmployeeId" = updated."id"
            AND tk."deletedAt" IS NULL
          RETURNING tk."id"
        )
        SELECT DISTINCT "employeeId"
        FROM updated_order_employees
      `,
      [orderId, endTime],
    )) as Array<{ employeeId: string }>;

    return rows.map((row) => row.employeeId);
  }
}
