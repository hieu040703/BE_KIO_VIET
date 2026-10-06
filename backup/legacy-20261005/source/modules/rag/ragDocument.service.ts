import { injectable } from "inversify";
import fs from "fs/promises";
import { createHash } from "crypto";
import { Document } from "@langchain/core/documents";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import DatabaseConfig from "@/database/database";
import { RagDocument, RagDocumentStatus } from "@/database/models/RagDocument";
import type { IRagDocumentVectorMetadata } from "@/database/models/RagDocumentVector";
import { config } from "@/shared/config/env";
import logger from "@/shared/utils/logger";
import redisHelper from "@/shared/utils/redis.helper";
import { getPgVectorPool } from "./rag.pgvector.pool";
import { createEmbeddings, createLLM, resolveProvider, validateProvider } from "./rag.providers";
import type { RagProvider } from "./rag.providers";
import { RagDocumentAnswerSchema, RagDocumentAnswerDto } from "./rag.validator";

const TABLE_NAME = "rag_document_vectors";
const CONTENT_COL = "content";
const VECTOR_COL = "embedding";
const METADATA_COL = "metadata";
const ID_COL = "id";

/** Kích thước chunk mặc định (ký tự) */
const DEFAULT_CHUNK_SIZE = 1000;
/** Độ chồng lấp giữa các chunk (ký tự) */
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Chia văn bản thành các chunk với kích thước và overlap cho trước.
 * Ưu tiên cắt tại dấu xuống dòng (paragraph), nếu không thì cắt tại câu, cuối cùng là ký tự.
 */
function chunkText(
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  chunkOverlap: number = DEFAULT_CHUNK_OVERLAP,
): string[] {
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  const separators = ["\n\n", "\n", ". ", "。", " "];

  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= chunkSize) {
      chunks.push(remaining);
      break;
    }

    // Tìm vị trí cắt tốt nhất trong khoảng chunkSize
    let cutPos = chunkSize;

    // Ưu tiên cắt tại separator gần chunkSize nhất
    for (const sep of separators) {
      const searchStart = Math.max(0, chunkSize - 200);
      const idx = remaining.lastIndexOf(sep, chunkSize);
      if (idx > searchStart) {
        cutPos = idx + sep.length;
        break;
      }
    }

    // Nếu không tìm được separator phù hợp, cắt cứng tại chunkSize
    if (cutPos <= 0 || cutPos > chunkSize + 100) {
      cutPos = chunkSize;
    }

    chunks.push(remaining.substring(0, cutPos));

    // Tính overlap: lùi lại overlap ký tự
    const nextStart = Math.max(0, cutPos - chunkOverlap);
    remaining = remaining.substring(nextStart);
  }

  return chunks;
}

export interface UploadDocumentInput {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  fileUrl?: string;
  category?: string;
  providerOverride?: RagProvider;
}

export interface UploadDocumentResult {
  document: RagDocument;
  chunkCount: number;
}

export interface DocumentQueryResult {
  data: RagDocumentAnswerDto;
  query_hash: string;
  cache_hit: boolean;
  latency_ms: number;
}

/**
 * Kiểm tra text có bị lỗi font/garbled không (tỉ lệ ký tự không in được > threshold).
 * Khoảng in được: ASCII + Vietnamese Latin (U+00C0–U+1EF9) + whitespace.
 */
function isTextGarbled(text: string, threshold = 0.3): boolean {
  if (text.length === 0) return true;
  const nonPrintable = text.replace(/[\x20-\x7E\u00C0-\u1EF9\s]/g, "");
  return nonPrintable.length / text.length > threshold;
}

/**
 * OCR PDF bằng tesseract.js: chuyển từng trang PDF → ảnh → OCR.
 * Dùng vie+eng để nhận diện tiếng Việt.
 */
async function ocrPdfWithTesseract(filePath: string): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  const sharp = (await import("sharp")).default;

  // Lấy số trang từ metadata
  const meta = await sharp(filePath).metadata();
  const pageCount = meta.pages ?? 1;
  logger.info("[RAG Doc] OCR PDF pages", { filePath, pageCount });

  const worker = await Tesseract.createWorker("vie+eng");
  const texts: string[] = [];

  try {
    for (let page = 0; page < pageCount; page++) {
      const pngBuf = await sharp(filePath, { page, density: 200 })
        .resize({ width: 2000, withoutEnlargement: true })
        .png()
        .toBuffer();

      const { data } = await worker.recognize(pngBuf);
      texts.push(data.text);
      logger.info("[RAG Doc] OCR page done", { page: page + 1, totalPages: pageCount, chars: data.text.length });
    }
  } finally {
    await worker.terminate();
  }

  return texts.join("\n");
}

/**
 * OCR ảnh bằng tesseract.js (vie+eng).
 */
async function ocrImageWithTesseract(filePath: string): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  const worker = await Tesseract.createWorker("vie+eng");

  try {
    const { data } = await worker.recognize(filePath);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Trích xuất text từ file — tự chọn parser phù hợp:
 * - Text/JSON/CSV/HTML → đọc UTF-8
 * - DOCX → mammoth
 * - PDF → pdf-parse, nếu lỗi font → OCR bằng tesseract (vie+eng)
 * - Ảnh (png/jpg/...) → OCR bằng tesseract
 */
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

  const effectiveType =
    mimeType === "application/octet-stream" || !mimeType
      ? (() => {
          const map: Record<string, string> = {
            txt: "text/plain",
            csv: "text/csv",
            json: "application/json",
            html: "text/html",
            htm: "text/html",
            xml: "application/xml",
            md: "text/markdown",
            yml: "text/yaml",
            yaml: "text/yaml",
            js: "application/javascript",
            ts: "application/typescript",
            pdf: "application/pdf",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            gif: "image/gif",
            bmp: "image/bmp",
            webp: "image/webp",
            tiff: "image/tiff",
          };
          return map[ext] ?? mimeType;
        })()
      : mimeType;

  logger.info("[RAG Doc] Extracting text", { effectiveType, ext, originalMime: mimeType });

  // ── Text-based ─────────────────────────────────────────────────────
  const textTypes = [
    "text/plain",
    "text/csv",
    "text/html",
    "text/xml",
    "application/json",
    "application/xml",
    "text/markdown",
    "text/yaml",
    "application/javascript",
    "application/typescript",
  ];
  if (textTypes.includes(effectiveType) || effectiveType.startsWith("text/")) {
    const content = await fs.readFile(filePath, "utf-8");
    if (effectiveType === "application/json") {
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch {
        return content;
      }
    }
    return content;
  }

  // ── DOCX ───────────────────────────────────────────────────────────
  if (effectiveType.includes("wordprocessingml") || ext === "docx") {
    const { extractRawText } = await import("mammoth");
    const result = await extractRawText({ buffer: await fs.readFile(filePath) });
    return result.value;
  }

  // ── PDF: pdf-parse → nếu lỗi font → OCR ───────────────────────────
  if (effectiveType === "application/pdf" || ext === "pdf") {
    // Thử pdf-parse trước (nhanh)
    try {
      const pdfParse = (await import("pdf-parse")) as any;
      const data = await pdfParse(await fs.readFile(filePath));
      const text = data.text?.trim() || "";

      if (text.length > 50 && !isTextGarbled(text)) {
        logger.info("[RAG Doc] pdf-parse OK", { chars: text.length });
        return text;
      }
      logger.warn("[RAG Doc] pdf-parse produced garbled/empty text, falling back to OCR");
    } catch (err) {
      logger.warn("[RAG Doc] pdf-parse failed, falling back to OCR", err);
    }

    // Fallback: OCR toàn bộ trang PDF
    return await ocrPdfWithTesseract(filePath);
  }

  // ── Ảnh: OCR trực tiếp ─────────────────────────────────────────────
  if (effectiveType.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff"].includes(ext)) {
    return await ocrImageWithTesseract(filePath);
  }

  // ── Fallback ───────────────────────────────────────────────────────
  logger.warn("[RAG Doc] Unknown type, trying UTF-8 read", { effectiveType, filePath });
  return await fs.readFile(filePath, "utf-8");
}

@injectable()
export class RagDocumentService {
  private getVectorStore(provider: RagProvider): Promise<PGVectorStore> {
    return PGVectorStore.initialize(createEmbeddings(provider), {
      pool: getPgVectorPool(),
      tableName: TABLE_NAME,
      skipInitializationCheck: true,
      distanceStrategy: "cosine",
      columns: {
        contentColumnName: CONTENT_COL,
        vectorColumnName: VECTOR_COL,
        metadataColumnName: METADATA_COL,
        idColumnName: ID_COL,
      },
    });
  }

  /**
   * Upload & xử lý tài liệu:
   * 1. Lưu metadata vào DB (PENDING)
   * 2. Trích xuất text từ file
   * 3. Chunk text
   * 4. Embedding & lưu vào pgvector
   * 5. Cập nhật trạng thái COMPLETED
   */
  async uploadAndProcess(input: UploadDocumentInput): Promise<UploadDocumentResult> {
    const provider = resolveProvider(input.providerOverride);
    validateProvider(provider);

    const repo = DatabaseConfig.getRepository(RagDocument);

    // 1. Tạo document record (PENDING)
    const doc = repo.create({
      fileName: input.fileName,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      filePath: input.filePath,
      fileUrl: input.fileUrl ?? null,
      status: RagDocumentStatus.PENDING,
      provider,
      category: input.category ?? null,
    });

    await repo.save(doc);
    logger.info("[RAG Doc] Document record created", { docId: doc.id, fileName: input.originalName });

    try {
      // Cập nhật trạng thái PROCESSING
      await repo.update(doc.id, { status: RagDocumentStatus.PROCESSING });

      // 2. Trích xuất text
      const text = await extractTextFromFile(input.filePath, input.mimeType);
      const totalChars = text.length;

      if (totalChars === 0) {
        throw new Error("File content is empty");
      }

      logger.info("[RAG Doc] Text extracted", { docId: doc.id, totalChars });

      // 3. Chunk text
      const chunks = chunkText(text, DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP);
      logger.info("[RAG Doc] Text chunked", { docId: doc.id, chunkCount: chunks.length });

      // 4. Tạo Document objects với metadata
      const docs: Document<IRagDocumentVectorMetadata>[] = chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          documentId: doc.id,
          chunkIndex: index,
          fileName: input.originalName,
          mimeType: input.mimeType,
          category: input.category ?? null,
        },
      }));

      // 5. Embedding & lưu vào pgvector
      const vectorStore = await this.getVectorStore(provider);
      const embeddings = createEmbeddings(provider);

      // Embed theo batch để tránh timeout API (Gemini ~100 texts/batch, OpenAI ~2048)
      const BATCH = 100;
      for (let i = 0; i < docs.length; i += BATCH) {
        const batch = docs.slice(i, i + BATCH);
        const texts = batch.map((d) => d.pageContent);

        let attempt = 0;
        let vectors: number[][] = [];
        while (attempt < 3) {
          try {
            vectors = await embeddings.embedDocuments(texts);
            break;
          } catch (err) {
            attempt++;
            if (attempt >= 3) throw err;
            logger.warn(`[RAG Doc] Embed batch failed (attempt ${attempt}), retrying...`, {
              docId: doc.id,
              batchStart: i,
            });
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
          }
        }

        const nullIdx = vectors.findIndex((v) => !v || v.length === 0);
        if (nullIdx >= 0) {
          logger.warn("[RAG Doc] Empty embedding detected", {
            docId: doc.id,
            chunkIndex: i + nullIdx,
            textPreview: texts[nullIdx]?.substring(0, 100),
          });
        }

        await vectorStore.addVectors(vectors, batch);
        logger.info("[RAG Doc] Batch embedded", {
          docId: doc.id,
          batchStart: i,
          batchSize: batch.length,
          totalChunks: docs.length,
        });
      }

      // 6. Cập nhật trạng thái COMPLETED
      const embeddingModel = provider === "openai" ? config.OPENAI_EMBEDDING_MODEL : config.GEMINI_EMBEDDING_MODEL;

      await repo.update(doc.id, {
        status: RagDocumentStatus.COMPLETED,
        chunkCount: chunks.length,
        totalChars,
        embeddingModel,
      });

      logger.info("[RAG Doc] Processing completed", {
        docId: doc.id,
        chunkCount: chunks.length,
        totalChars,
        provider,
      });

      // Reload để lấy data mới nhất
      const updated = await repo.findOneByOrFail({ id: doc.id });

      return {
        document: updated,
        chunkCount: chunks.length,
      };
    } catch (error) {
      logger.error("[RAG Doc] Processing failed", { docId: doc.id, error });
      await repo.update(doc.id, { status: RagDocumentStatus.FAILED });
      throw error;
    }
  }

  /**
   * RAG query với cache → retrieval → LLM synthesis.
   * Flow giống hệt ServiceOrder RAG: cache check → vector search → LLM answer → cache store.
   */
  async queryDocuments(
    query: string,
    options?: {
      k?: number;
      documentIds?: string[];
      category?: string;
      providerOverride?: RagProvider;
    },
  ): Promise<DocumentQueryResult> {
    const start = Date.now();
    const provider = resolveProvider(options?.providerOverride);
    validateProvider(provider);

    const k = options?.k ?? config.RAG_RETRIEVAL_K;

    // ── 1. Cache check ──────────────────────────────────────────────────
    const cacheKey = this.buildDocCacheKey(query, options);
    try {
      const cached = await redisHelper.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached) as RagDocumentAnswerDto;
        const latency_ms = Date.now() - start;
        logger.info("[RAG Doc] Cache hit", { query_hash: cacheKey, latency_ms, confidence: data.confidence });
        return { data, query_hash: cacheKey, cache_hit: true, latency_ms };
      }
    } catch (err) {
      logger.warn("[RAG Doc] Cache GET error", { cacheKey, err });
    }

    // ── 2. Build metadata filter ────────────────────────────────────────
    const filter: Record<string, any> = {};
    if (options?.documentIds && options.documentIds.length > 0) {
      filter.documentId = { in: options.documentIds };
    }
    if (options?.category) {
      filter.category = options.category;
    }

    // ── 3. Retrieval + LLM synthesis ────────────────────────────────────
    const vectorStore = await this.getVectorStore(provider);
    const retriever = vectorStore.asRetriever({
      k,
      ...(Object.keys(filter).length > 0 ? { filter } : {}),
    });
    const llm = createLLM(provider);

    const systemPrompt = `Bạn là trợ lý AI của công ty Thiên Bảo, chuyên trả lời câu hỏi dựa trên tài liệu nội bộ.
      Nhiệm vụ: Dựa trên các đoạn văn bản (chunks) được cung cấp trong context, trả lời câu hỏi của người dùng một cách chính xác.

      Quy tắc bắt buộc:
      1. CHỈ sử dụng thông tin trong context. KHÔNG bịa đặt, không suy đoán ngoài context.
      2. Nếu context không đủ thông tin để trả lời, hãy nói rõ điều đó và trả về confidence = "low".
      3. confidence = "high" nếu có ≥5 chunks liên quan và câu trả lời chắc chắn.
      4. confidence = "medium" nếu có 2-4 chunks liên quan.
      5. confidence = "low" nếu <2 chunks hoặc context không liên quan.
      6. reference_document_ids: danh sách documentId từ metadata của context.
      7. reference_chunks: danh sách chunkIndex từ metadata của context.

      Luôn trả lời bằng JSON hợp lệ với đúng schema.

      Context:
      {context}`;

    const humanTemplate = `Câu hỏi: {query}

      Hãy trả lời theo JSON schema sau (bắt buộc đúng format):
      {{
        "answer": "string",
        "confidence": "high" | "medium" | "low",
        "reasoning": "string",
        "reference_document_ids": ["string"],
        "reference_chunks": [0]
      }}`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", humanTemplate],
    ]);

    const formatDocs = (docs: Document[]): string => {
      if (docs.length === 0) return "Không có tài liệu tham chiếu phù hợp.";
      return docs
        .map(
          (d, i) =>
            `--- Tài liệu ${i + 1} (file: ${d.metadata?.fileName ?? "N/A"}, documentId: ${d.metadata?.documentId ?? "N/A"}, chunk: ${d.metadata?.chunkIndex ?? 0}) ---\n${d.pageContent}`,
        )
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
    let answer: RagDocumentAnswerDto;
    let attempt = 0;
    while (attempt < 3) {
      try {
        const rawOutput = await chain.invoke(query);
        answer = this.parseDocAnswer(rawOutput);
        break;
      } catch (err) {
        attempt++;
        if (attempt >= 3) {
          logger.error("[RAG Doc] LLM chain failed after 3 attempts", err);
          answer = this.fallbackDocAnswer(query);
          break;
        }
        const delay = 1000 * Math.pow(2, attempt);
        logger.warn(`[RAG Doc] LLM chain failed (attempt ${attempt}), retrying in ${delay}ms`, err);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    const latency_ms = Date.now() - start;

    // ── 4. Cache store ───────────────────────────────────────────────────
    try {
      await redisHelper.set(cacheKey, JSON.stringify(answer!), config.RAG_CACHE_TTL);
    } catch (err) {
      logger.warn("[RAG Doc] Cache SET error", { cacheKey, err });
    }

    logger.info("[RAG Doc] LLM chain executed", {
      query_hash: cacheKey,
      latency_ms,
      confidence: answer!.confidence,
      refDocs: answer!.reference_document_ids,
    });

    return { data: answer!, query_hash: cacheKey, cache_hit: false, latency_ms };
  }

  /** Parse LLM output → RagDocumentAnswerDto */
  private parseDocAnswer(raw: string): RagDocumentAnswerDto {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in LLM output");
      return RagDocumentAnswerSchema.parse(JSON.parse(jsonMatch[0]));
    } catch (err) {
      logger.warn("[RAG Doc] Failed to parse LLM output", { raw, err });
      return {
        answer: raw || "Không thể xử lý câu hỏi.",
        confidence: "low",
        reasoning: "Lỗi parse output từ LLM.",
        reference_document_ids: [],
        reference_chunks: [],
      };
    }
  }

  /** Fallback khi LLM chain thất bại hoàn toàn */
  private fallbackDocAnswer(query: string): RagDocumentAnswerDto {
    return {
      answer: "Xin lỗi, hệ thống tạm thời không thể xử lý câu hỏi này. Vui lòng thử lại sau.",
      confidence: "low",
      reasoning: "Lỗi kết nối đến AI service sau 3 lần thử.",
      reference_document_ids: [],
      reference_chunks: [],
    };
  }

  /** Tạo cache key từ query + options */
  private buildDocCacheKey(query: string, options?: Record<string, any>): string {
    const payload = JSON.stringify({ query, ...(options ?? {}) });
    return `rag:doc:query:${createHash("sha256").update(payload).digest("hex")}`;
  }

  /**
   * Lấy danh sách tài liệu đã upload (có phân trang).
   */
  async listDocuments(options?: {
    page?: number;
    limit?: number;
    status?: RagDocumentStatus;
    category?: string;
  }): Promise<{ documents: RagDocument[]; total: number }> {
    const repo = DatabaseConfig.getRepository(RagDocument);
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const where: Record<string, any> = {};

    if (options?.status) where.status = options.status;
    if (options?.category) where.category = options.category;

    const [documents, total] = await repo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { documents, total };
  }

  /**
   * Xóa tài liệu và tất cả vector chunks liên quan.
   */
  async deleteDocument(documentId: string): Promise<void> {
    const repo = DatabaseConfig.getRepository(RagDocument);
    const doc = await repo.findOneByOrFail({ id: documentId });

    // Xóa vector chunks (dùng raw SQL vì PGVectorStore không có API delete by metadata)
    const pool = getPgVectorPool();
    await pool.query(`DELETE FROM "rag_document_vectors" WHERE metadata->>'documentId' = $1`, [documentId]);

    // Soft delete document
    await repo.softDelete(documentId);

    logger.info("[RAG Doc] Document deleted", { docId: documentId, fileName: doc.originalName });
  }
}
