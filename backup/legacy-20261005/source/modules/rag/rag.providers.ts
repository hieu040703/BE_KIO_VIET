import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { config } from "@/shared/config/env";

export type RagProvider = "gemini" | "openai";

const OPENAI_DEFAULT_BASE_URL = "https://api.openai.com/v1";

function normalizeOpenAIBaseURL(baseURL?: string): string {
  const raw = (baseURL ?? "").trim();
  if (!raw) return OPENAI_DEFAULT_BASE_URL;

  const noTrailingSlash = raw.replace(/\/+$/, "");
  return /\/v1$/i.test(noTrailingSlash) ? noTrailingSlash : `${noTrailingSlash}/v1`;
}

function getOpenAIApiKey(): string {
  // LM Studio/OpenAI-compatible servers often ignore API key but SDK still expects one.
  return config.OPENAI_API_KEY || "lm-studio";
}

/**
 * Trả về provider đang dùng theo thứ tự ưu tiên:
 * 1. Tham số truyền vào (per-request override)
 * 2. RAG_PROVIDER trong .env
 * 3. Fallback: "gemini"
 */
export function resolveProvider(override?: RagProvider): RagProvider {
  return override ?? config.RAG_PROVIDER ?? "gemini";
}

/**
 * Validate API key cho provider được chọn.
 * Throw rõ ràng để dễ debug.
 */
export function validateProvider(provider: RagProvider): void {
  if (provider === "gemini" && !config.GEMINI_API_KEY) {
    throw new Error("[RAG] GEMINI_API_KEY chưa được cấu hình trong .env");
  }
  if (provider === "openai" && !config.OPENAI_API_KEY && !config.OPENAI_BASE_URL.trim()) {
    throw new Error("[RAG] OPENAI_API_KEY chưa được cấu hình trong .env (hoặc OPENAI_BASE_URL đang trống)");
  }
}

/**
 * Tạo Embeddings instance theo provider.
 *
 * ⚠️ Lưu ý dimension:
 * - Gemini text-embedding-004  → 768 dims  (RAG_VECTOR_DIMENSIONS=768)
 * - OpenAI text-embedding-3-small → 1536 dims (RAG_VECTOR_DIMENSIONS=1536)
 *
 * Nếu đổi provider lần đầu cần chạy lại migration và resync toàn bộ vector.
 */
export function createEmbeddings(provider: RagProvider): EmbeddingsInterface {
  if (provider === "openai") {
    const baseURL = normalizeOpenAIBaseURL(config.OPENAI_BASE_URL);

    return new OpenAIEmbeddings({
      apiKey: getOpenAIApiKey(),
      model: config.OPENAI_EMBEDDING_MODEL,
      dimensions: config.RAG_VECTOR_DIMENSIONS,
      configuration: {
        baseURL,
      },
    });
  }

  // default: gemini
  return new GoogleGenerativeAIEmbeddings({
    apiKey: config.GEMINI_API_KEY,
    model: config.GEMINI_EMBEDDING_MODEL,
  });
}

/**
 * Tạo Chat LLM instance theo provider.
 */
export function createLLM(provider: RagProvider): BaseChatModel {
  if (provider === "openai") {
    const baseURL = normalizeOpenAIBaseURL(config.OPENAI_BASE_URL);

    return new ChatOpenAI({
      apiKey: getOpenAIApiKey(),
      model: config.OPENAI_LLM_MODEL,
      temperature: 0.1,
      configuration: { baseURL },
    });
  }

  // default: gemini
  return new ChatGoogleGenerativeAI({
    apiKey: config.GEMINI_API_KEY,
    model: config.GEMINI_LLM_MODEL,
    temperature: 0.1,
  });
}
