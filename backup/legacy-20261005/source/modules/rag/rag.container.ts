import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RagService } from "./rag.service";
import { RagController } from "./rag.controller";
import { RagRouter } from "./rag.route";
import { RagSyncService } from "./rag.sync.service";
import { RagChainService } from "./rag.chain.service";
import { RagCacheService } from "./rag.cache.service";
import { RagDocumentService } from "./ragDocument.service";
import { RagDocumentController } from "./ragDocument.controller";
import { RAG_TYPES } from "./rag.types";

const ragModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RagSyncService>(RAG_TYPES.RagSyncService).to(RagSyncService);
  options.bind<RagChainService>(RAG_TYPES.RagChainService).to(RagChainService);
  options.bind<RagCacheService>(RAG_TYPES.RagCacheService).to(RagCacheService);
  options.bind<RagService>(RAG_TYPES.RagService).to(RagService);
  options.bind<RagController>(RAG_TYPES.RagController).to(RagController);
  options.bind<RagRouter>(RAG_TYPES.RagRouter).to(RagRouter);
  options.bind<RagDocumentService>(RAG_TYPES.RagDocumentService).to(RagDocumentService);
  options.bind<RagDocumentController>(RAG_TYPES.RagDocumentController).to(RagDocumentController);
});

export { ragModule };
