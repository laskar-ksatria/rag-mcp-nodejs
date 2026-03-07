import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
async function main() {
    const server = new McpServer({
        name: "rag-mcp-nodejs",
        version: "1.0.0",
    });
    server.registerTool("echo", {
        title: "Echo Text",
        inputSchema: { text: z.string().describe("Text yang akan di-echo.") },
        description: "Mengembalikan kembali text yang dikirim.",
    }, async ({ text }) => ({
        content: [
            {
                type: "text",
                text,
            },
        ],
    }));
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
