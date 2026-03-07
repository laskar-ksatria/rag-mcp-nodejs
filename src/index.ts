import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { string, z } from "zod";
import { config } from "zod";

async function main() {
  config();

  const server = new McpServer({
    name: "rag-mcp-nodejs",
    version: "1.0.0",
  });

  // ================================================================================================================= //
  // TOOLS
  // ================================================================================================================= //

  // 1. CONNECTION_TEST ---------------------------------------------------- >
  server.registerTool(
    "echo",
    {
      title: "Echo Text",
      inputSchema: { text: z.string().describe("Text yang akan di-echo.") },
      description: "Mengembalikan kembali text yang dikirim.",
    },
    async ({ text }: { text: string }) => ({
      content: [
        {
          type: "text",
          text,
        },
      ],
    }),
  );

  // 2. SAVE_DOCUMENT ---------------------------------------------------- >
  server.registerTool(
    "save_to_rag",
    {
      title: "Save To RAG",
      description: "Save document or information to RAG",
      inputSchema: {
        text: z
          .string()
          .describe("Document or information that would be save to RAG"),
      },
    },
    async ({ text }: { text: string }) => {
      return {
        content: [{ type: "text", text: `${text} already save` }],
      };
    },
  );

  // 2. SEARCH_DOCUMENT ------------------------------------------------ >
  server.registerTool(
    "search_document",
    {
      title: "Search Document",
      description: "Search Document on RAG",
      inputSchema: {
        text: z
          .string()
          .describe("Query / text that will search on RAG with similarity"),
      },
    },
    async ({ text }: { text: string }) => {
      return {
        content: [{ type: "text", text: `${text}` }],
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
