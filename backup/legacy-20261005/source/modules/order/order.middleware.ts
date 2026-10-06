import { NextFunction, Request, Response } from "express";
import { container } from "../container";
import { USER_TYPES } from "../user/user.types";
import { UserRepository } from "../user/user.repository";
import { OrderRepository } from "./order.repository";
import { ORDER_TYPES } from "./order.types";
import { EmployeeSelectBasic } from "../employee/employee.select";

export const middleware = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  const orderId = req.params.orderId;

  const orderRepository = container.get<OrderRepository>(ORDER_TYPES.OrderRepository);
  const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);

  if (userId && orderId) {
    const user = await userRepository.findByOption({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        employeeId: true,
        employee: EmployeeSelectBasic,
      },
      relations: {
        employee: true,
      },
    });
    console.log(`User ${userId} is accessing order ${orderId}`);
    const checkAccess = await orderRepository.findOne({
      //   where: {
      //     id: orderId,
      //     employeeId: user.employeeId,
      //   },
    });
  }
  next();
};
