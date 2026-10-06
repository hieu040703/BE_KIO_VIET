import { injectable } from "inversify";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import { getPgVectorPool } from "./rag.pgvector.pool";
import { createEmbeddings, createLLM, resolveProvider, validateProvider } from "./rag.providers";
import type { RagProvider } from "./rag.providers";
import { RagAnswerSchema, RagAnswerDto } from "./rag.validator";
import type { MetadataFilter } from "./rag.types";

const TABLE_NAME = "service_order_vectors";

function buildFilterFromQuery(filters?: {
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): MetadataFilter | undefined {
  if (!filters) return undefined;
  const f: MetadataFilter = {};
  if (filters.type) f["type"] = filters.type;
  if (filters.status) f["status"] = filters.status;
  return Object.keys(f).length > 0 ? f : undefined;
}

@injectable()
export class RagChainService {
  private getVectorStore(provider: RagProvider, filter?: MetadataFilter): Promise<PGVectorStore> {
    return PGVectorStore.initialize(createEmbeddings(provider), {
      pool: getPgVectorPool(),
      tableName: TABLE_NAME,
      skipInitializationCheck: true,
      distanceStrategy: "cosine",
      columns: {
        contentColumnName: "content",
        vectorColumnName: "embedding",
        metadataColumnName: "metadata",
        idColumnName: "id",
      },
      ...(filter ? { filter } : {}),
    });
  }

  /**
   * Thực hiện RAG query: retrieval → prompt → structured output.
   * Trả về RagAnswerDto với confidence "low" nếu context yếu.
   * @param providerOverride - ghi đè provider (để trống = dùng RAG_PROVIDER trong .env)
   */
  async query(
    userQuery: string,
    filters?: { type?: string; status?: string; dateFrom?: string; dateTo?: string },
    k = config.RAG_RETRIEVAL_K,
    providerOverride?: RagProvider,
  ): Promise<RagAnswerDto> {
    const provider = resolveProvider(providerOverride);
    validateProvider(provider);

    const metadataFilter = buildFilterFromQuery(filters);
    const vectorStore = await this.getVectorStore(provider, metadataFilter);
    const retriever = vectorStore.asRetriever({ k });
    const llm = createLLM(provider);

    // Structured output chain với fallback về low confidence
    const systemPrompt = `Bạn là chuyên gia định giá dịch vụ bốc xếp hàng hóa của công ty Thiên Bảo.
      Nhiệm vụ: Dựa trên các đơn hàng tham chiếu trong context, trả lời câu hỏi của người dùng.

      Quy tắc bắt buộc:
      1. Chỉ sử dụng thông tin trong context được cung cấp. Không bịa đặt.
      2. Trả về confidence = "low" nếu context ít hơn 2 đơn hàng liên quan hoặc không phù hợp với câu hỏi.
      3. Trả về confidence = "medium" nếu có 2-4 đơn hàng liên quan.
      4. Trả về confidence = "high" nếu có ≥5 đơn hàng liên quan và dữ liệu đủ tin cậy.
      5. suggested_price phải là số VNĐ nguyên dương nếu có, null nếu không liên quan đến định giá.
      6. reference_ids là danh sách serviceOrderId từ metadata của context.

      Luôn trả lời bằng JSON hợp lệ với đúng schema yêu cầu.

      Context:
      {context}`;

    const humanTemplate = `Câu hỏi: {query}

      Hãy trả lời theo JSON schema sau (bắt buộc đúng format):
      {{
        "answer": "string",
        "confidence": "high" | "medium" | "low",
        "suggested_price": number | null,
        "reasoning": "string",
        "reference_ids": ["string"]
      }}`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", humanTemplate],
    ]);

    const formatDocs = (docs: Document[]): string => {
      if (docs.length === 0) return "Không có dữ liệu tham chiếu phù hợp.";
      return docs
        .map((d, i) => `--- Đơn hàng ${i + 1} (ID: ${d.metadata?.serviceOrderId ?? "N/A"}) ---\n${d.pageContent}`)
        .join("\n\n");
    };

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocs),
        query: new RunnablePassthrough(),
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    // Retry 3 lần với backoff
    let attempt = 0;
    while (attempt < 3) {
      try {
        const rawOutput = await chain.invoke(userQuery);
        return this.parseAndValidateOutput(rawOutput);
      } catch (err) {
        attempt++;
        if (attempt < 3) {
          const delay = 1000 * Math.pow(2, attempt);
          logger.warn(`[RAG Chain] Query failed (attempt ${attempt}), retry in ${delay}ms`, err);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          logger.error("[RAG Chain] Query failed after 3 attempts", err);
          return this.fallbackResponse(userQuery);
        }
      }
    }

    return this.fallbackResponse(userQuery);
  }

  private parseAndValidateOutput(raw: string): RagAnswerDto {
    try {
      // Tách JSON từ response (LLM đôi khi bọc thêm markdown code block)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in LLM output");

      const parsed = JSON.parse(jsonMatch[0]);
      return RagAnswerSchema.parse(parsed);
    } catch (err) {
      logger.warn("[RAG Chain] Failed to parse LLM output, returning fallback", { raw, err });
      return {
        answer: raw || "Không thể xử lý câu hỏi.",
        confidence: "low",
        suggested_price: null,
        reasoning: "Lỗi parse output từ LLM.",
        reference_ids: [],
      };
    }
  }

  private fallbackResponse(query: string): RagAnswerDto {
    return {
      answer: "Xin lỗi, hệ thống tạm thời không thể xử lý câu hỏi này. Vui lòng thử lại sau.",
      confidence: "low",
      suggested_price: null,
      reasoning: "Lỗi kết nối đến AI service sau 3 lần thử.",
      reference_ids: [],
    };
  }
}
