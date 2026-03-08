import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { string, z } from "zod";
import { config } from "zod";
import AI from "./ai.js";
import { env } from "./env.js";

const PROVIDER_OPTIONS = ["openai", "openrouter"] as const;
type ProviderOption = (typeof PROVIDER_OPTIONS)[number];

function parseProvider(value: string | undefined): ProviderOption {
  const v = (value ?? "").toLowerCase();
  if (v === "openai" || v === "openrouter") return v;
  throw new Error(
    `Invalid PROVIDER: "${value}". Must be one of: ${PROVIDER_OPTIONS.join(", ")}`,
  );
}

async function main() {
  config();

  const provider = parseProvider(env.PROVIDER);

  const CallAI = new AI({
    apikey: env.APIKEY,
    embeddingModel: env.EMBEDDING_MODEL,
    pineconeIndex: env.PINECONE_INDEX,
    pineconeKey: env.PINECONE_API_KEY,
    provider,
  });

  const server = new McpServer({
    name: "rag-mcp-nodejs",
    version: "1.0.0",
  });

  // ================================================================================================================= //
  // TOOLS
  // ================================================================================================================= //

  // 1. SAVE_DOCUMENT ---------------------------------------------------- >
  server.registerTool(
    "save_document_to_rag",
    {
      title: "Save Document To RAG",
      description: "Save document or information to RAG",
      inputSchema: {
        text: z
          .string()
          .describe("Document or information that would be save to RAG"),
      },
    },
    async ({ text }: { text: string }) => {
      const response = await CallAI.save_to_rag(text);
      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    },
  );

  // 2. SEARCH_DOCUMENT ------------------------------------------------ >
  server.registerTool(
    "search_document_on_rag",
    {
      title: "Search Document On RAG",
      description: "Search Document on RAG with keyword",
      inputSchema: {
        keyword: z
          .string()
          .describe("Query / keyword that will search on RAG with similarity"),
      },
    },
    async ({ keyword }: { keyword: string }) => {
      const response = await CallAI.search_documents(keyword);
      return {
        content: [{ type: "text", text: response as string }],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
