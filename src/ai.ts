import OpenAI from "openai";
import { encodingForModel, TiktokenModel } from "js-tiktoken";
import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { env } from "./env.js";

export type TProvider = "openrouter" | "openai" | null;
export interface IContructorsPayload {
  apikey: string;
  embeddingModel: string;
  provider: TProvider;
  pineconeKey: string;
  pineconeIndex: string;
}

/**
 * Ai Controller
 * Contructor parameters
 * apikey: string
 * model: string
 * embeddingModel: string
 * provider:  "openrouter" | "openai"
 */
class AI {
  // States
  private pineconeKey: string = "";
  private embeddingModel: string = "";
  private pineconeIndex: string = "";
  private MCP_AI: OpenAI;
  private provider: "openrouter" | "openai" | null = null;

  // Contructors
  constructor(args: IContructorsPayload) {
    this.embeddingModel = args.embeddingModel;
    this.provider = args.provider;
    this.pineconeKey = args.pineconeKey;
    this.pineconeIndex = args.pineconeIndex;
    if (args.provider === "openrouter") {
      this.MCP_AI = new OpenAI({
        apiKey: args.apikey,
        baseURL: `https://openrouter.ai/api/v1`,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "OpenRouter RAG",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    } else {
      this.MCP_AI = new OpenAI({
        apiKey: args.apikey,
        defaultHeaders: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }
  }

  // ================================================================================================== //
  // CHUNK TEXT
  // ================================================================================================== //
  chunkByToken(text: string, maxTokens?: number, overlap?: number): string[] {
    const defaultMax = env.RAG_CHUNK_MAX_TOKENS
      ? Number(env.RAG_CHUNK_MAX_TOKENS)
      : 512;
    const defaultOverlap = 50;
    const limit = maxTokens ?? defaultMax;
    const overlapTokens = overlap ?? defaultOverlap;

    let model: TProvider | string = null;
    if (this.provider === "openrouter") {
      model = this.embeddingModel.split("/")[1];
    } else model = this.provider;
    const enc = encodingForModel(model as TiktokenModel);
    const tokens = Array.from(enc.encode(text));
    const chunks: string[] = [];
    let start = 0;
    while (start < tokens.length) {
      const slice = tokens.slice(start, start + limit);
      chunks.push(enc.decode(slice));
      start += limit - overlapTokens;
    }
    return chunks;
  }

  // ================================================================================================== //
  // SAVE_TO_RAG
  // ================================================================================================== //
  async save_to_rag(content: string) {
    try {
      const chunkText = this.chunkByToken(content);
      const response = await this.MCP_AI.embeddings.create({
        model: this.embeddingModel,
        input: chunkText,
      });
      if (response?.data[0]?.object === "embedding") {
        const pinecone = new Pinecone({
          apiKey: env.PINECONE_API_KEY as string,
        });
        const index = pinecone.index(this.pineconeIndex);
        const vectors: PineconeRecord<RecordMetadata>[] = [
          {
            id: `${Date.now()}`,
            values: response.data[0]?.embedding,
            metadata: {
              text: chunkText[0],
              createdAt: new Date().toISOString(),
            },
          },
        ];
        await index.upsert({ records: vectors });
        return "Document successfully saved!";
      } else return `${response?.data[0] || "Unexpected error"} `;
    } catch (error: any) {
      return `${error}`;
      // return error?.error?.message || "Unexpected error!";
    }
  }
  // ================================================================================================== //
  // SEARCH_DOCUMENT
  // ================================================================================================== //
  async search_documents(content: string) {
    try {
      const chunkText = this.chunkByToken(content);
      const response = await this.MCP_AI.embeddings.create({
        model: this.embeddingModel,
        input: chunkText,
      });
      if (response?.data[0]?.object === "embedding") {
        const questionVector = response.data[0].embedding;
        // search
        const pinecone = new Pinecone({ apiKey: this.pineconeKey });
        const index = pinecone.index(this.pineconeIndex);
        const results = await index.query({
          vector: questionVector,
          topK: 3,
          includeMetadata: true,
        });

        // Get text from metadata
        const relevantChunks = results.matches.map((match) => ({
          text: match.metadata?.text as string,
          score: match.score,
        }));
        const context = relevantChunks.map((c) => c.text).join("\n\n");
        return context;
      } else {
        return response?.data[0] || "Unexpected error";
      }
    } catch (error) {
      return `${error}` || "Unexpected error";
    }
  }
}

export default AI;
