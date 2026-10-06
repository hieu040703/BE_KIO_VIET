import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { OrderCommentController } from "./orderComment.controller";
import { OrderCommentRepository } from "./orderComment.repository";
import { OrderCommentReadStateRepository } from "./orderCommentReadState.repository";
import { OrderCommentRouter } from "./orderComment.route";
import { OrderCommentService } from "./orderComment.service";
import { ORDER_COMMENT_TYPES } from "./orderComment.types";

const orderCommentModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<OrderCommentService>(ORDER_COMMENT_TYPES.OrderCommentService).to(OrderCommentService);
  options.bind<OrderCommentController>(ORDER_COMMENT_TYPES.OrderCommentController).to(OrderCommentController);
  options.bind<OrderCommentRepository>(ORDER_COMMENT_TYPES.OrderCommentRepository).to(OrderCommentRepository);
  options
    .bind<OrderCommentReadStateRepository>(ORDER_COMMENT_TYPES.OrderCommentReadStateRepository)
    .to(OrderCommentReadStateRepository);
  options.bind<OrderCommentRouter>(ORDER_COMMENT_TYPES.OrderCommentRouter).to(OrderCommentRouter);
});

export { orderCommentModule };
