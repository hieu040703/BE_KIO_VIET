export const RAG_TYPES = {
  RagService: Symbol.for("RagService"),
  RagController: Symbol.for("RagController"),
  RagRouter: Symbol.for("RagRouter"),
  RagSyncService: Symbol.for("RagSyncService"),
  RagChainService: Symbol.for("RagChainService"),
  RagCacheService: Symbol.for("RagCacheService"),
  RagDocumentService: Symbol.for("RagDocumentService"),
  RagDocumentController: Symbol.for("RagDocumentController"),
};

// Alias từ LangChain PGVectorStore MetadataFilter để dùng nội bộ
export type MetadataFilter = Record<
  string,
  | string
  | number
  | boolean
  | {
      in?: (string | number | boolean)[];
      notIn?: (string | number | boolean)[];
      gt?: number;
      gte?: number;
      lt?: number;
      lte?: number;
      neq?: string | number | boolean;
    }
>;
