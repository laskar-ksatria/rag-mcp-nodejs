import OpenAI from "openai";
import { encodingForModel } from "js-tiktoken";
import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { env } from "./env.js";

export interface IContructorsPayload {
  apikey: string;
  model: string;
  embeddingModel: string;
  provider: "openrouter" | "openai";
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
  private apiKey: string = "";
  private pineconeKey: string = "";
  private embeddingModel: string = "";
  private model: string = "";
  private MCP_AI: OpenAI;
  private history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  // Contructors
  constructor(args: IContructorsPayload) {
    this.apiKey = args.apikey;
    this.model = args.model;
    this.embeddingModel = args.embeddingModel;
    if (args.provider === "openrouter") {
      this.MCP_AI = new OpenAI({
        apiKey: args.apikey,
        baseURL: `https://openrouter.ai/api/v1`,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3005",
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

  // AI Config
  private aiConfig(
    content: OpenAI.Chat.ChatCompletionMessageParam[],
  ): OpenAI.Chat.ChatCompletionCreateParamsNonStreaming {
    // const rulesMd = readFileSync("./RULES.md", "utf-8");
    return {
      model: this.model,
      tool_choice: "auto",
      max_tokens: 2000,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null,
      stream: false,
      messages: [
        // ...basicPrompt,
        // { role: "system", content: rulesMd },
        ...content,
      ],
      // tools: [...BASIC_TOOLS],
    };
  }

  // ================================================================================================== //
  // CHUNK TEXT
  // ================================================================================================== //
  chunkByToken(text: string, maxTokens = 512, overlap = 50): string[] {
    const enc = encodingForModel("text-embedding-3-small");
    const tokens = Array.from(enc.encode(text));
    const chunks: string[] = [];
    let start = 0;
    while (start < tokens.length) {
      const slice = tokens.slice(start, start + maxTokens);
      chunks.push(enc.decode(slice));
      start += maxTokens - overlap;
    }
    return chunks;
  }

  // ================================================================================================== //
  // GET_RESPONSE
  // ================================================================================================== //
  async get_response(content: string) {
    try {
    } catch (error) {}
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
        // this.saveToJSON(response?.data);
        // SAVE TO RAG
        const pinecone = new Pinecone({
          apiKey: env.PINECONE_API_KEY as string,
        });
        const index = pinecone.index("node-rag");
        const vectors: PineconeRecord<RecordMetadata>[] = [
          {
            id: `chunk-${Date.now()}-rag`,
            values: response.data[0]?.embedding,
            metadata: {
              text: chunkText[0],
              createdAt: new Date().toISOString(),
            },
          },
        ];
        await index.upsert({ records: vectors });
        return response?.data;
      } else {
        console.log(response);
        return response?.data;
      }
    } catch (error) {}
  }
}

export default AI;
