// Base classes
import { TransactionManager } from "@/shared/base/TransactionManager";

// Common utils
import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { COMMON_TYPES } from "./common.types";
import { FirebaseUtils } from "@/shared/utils/firebase/firebase.utils";
import { FirebaseRouter } from "@/shared/utils/firebase/firebase.route";
import { CommonController } from "./common.controller";
import { CommonRouter } from "./common.route";
import { CommonService } from "./common.service";
import { FileUploadRepository } from "./fileUpload.repository";
import { FileUploadService } from "./fileUpload.service";
import { FileUploadController } from "./fileUpload.controller";
import { CommonRepository } from "./common.repository";
import { CodeService } from "./code.service";

const commonModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<TransactionManager>(COMMON_TYPES.TransactionManager).to(TransactionManager);
  options.bind<FirebaseUtils>(COMMON_TYPES.FirebaseUtils).to(FirebaseUtils);
  options.bind<FirebaseRouter>(COMMON_TYPES.FirebaseRouter).to(FirebaseRouter);
  options.bind<CommonController>(COMMON_TYPES.CommonController).to(CommonController);
  options.bind<CommonService>(COMMON_TYPES.CommonService).to(CommonService);
  options.bind<CommonRouter>(COMMON_TYPES.CommonRouter).to(CommonRouter);
  options.bind<CommonRepository>(COMMON_TYPES.CommonRepository).to(CommonRepository);
  options.bind<CodeService>(COMMON_TYPES.CodeService).to(CodeService);

  // File upload
  options.bind<FileUploadRepository>(COMMON_TYPES.FileUploadRepository).to(FileUploadRepository);
  options.bind<FileUploadService>(COMMON_TYPES.FileUploadService).to(FileUploadService);
  options.bind<FileUploadController>(COMMON_TYPES.FileUploadController).to(FileUploadController);
});

export { commonModule };
