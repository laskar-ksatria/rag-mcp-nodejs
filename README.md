# RAG MCP Server

MCP (Model Context Protocol) server for RAG (Retrieval-Augmented Generation) using Pinecone, OpenAI-compatible embedding APIs, and the official MCP SDK. Save documents and search by semantic similarity via MCP tools.

## Tools

| Tool                     | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `save_to_rag`            | Chunk text, create embeddings, and save to Pinecone.   |
| `search_document_on_rag` | Search documents by keyword using semantic similarity. |

## Installation

```bash
npm install rag-mcp-nodejs
# or
npx rag-mcp-nodejs
```

## Environment Variables

### Required

| Variable           | Description                                                | Example                                                   |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------- |
| `APIKEY`           | OpenAI or OpenRouter API key for embeddings                | `sk-...`                                                  |
| `EMBEDDING_MODEL`  | Embedding model ID                                         | `text-embedding-3-small`, `openai/text-embedding-3-small` |
| `PINECONE_API_KEY` | Pinecone API key                                           | `...`                                                     |
| `PINECONE_INDEX`   | Pinecone index name (dimension must match embedding model) | `rag-index`                                               |
| `PROVIDER`         | AI provider (allowed values: `openai`, `openrouter`)       | `openai` or `openrouter`                                  |

> **Important:** Create your Pinecone index with the same dimension as your embedding model.

### Embedding models and vector dimensions

Use the **Dimension** column when creating your Pinecone index.

| Model                                            | Dimension | Provider                 |
| ------------------------------------------------ | --------- | ------------------------ |
| `text-embedding-3-small`                         | 1536      | OpenAI, OpenRouter       |
| `text-embedding-3-large`                         | 3072      | OpenAI, OpenRouter       |
| `text-embedding-ada-002`                         | 1536      | OpenAI, OpenRouter       |
| `text-embedding-3-small` (with dimensions param) | 512–1536  | OpenAI                   |
| `voyage-3`                                       | 1024      | Voyage (via OpenRouter)  |
| `nomic-embed-text-v1.5`                          | 768       | Nomic (via OpenRouter)   |
| `mistral-embed`                                  | 1024      | Mistral (via OpenRouter) |
| `cohere/embed-english-v3.0`                      | 1024      | Cohere (via OpenRouter)  |

For OpenRouter, use the model ID format, e.g. `openai/text-embedding-3-small` or `voyage/voyage-3`.

### Optional

| Variable               | Description                           | Default |
| ---------------------- | ------------------------------------- | ------- |
| `RAG_CHUNK_MAX_TOKENS` | Max tokens per chunk before embedding | `512`   |
| `RAG_CHUNK_OVERLAP`    | Overlap tokens between chunks         | `50`    |

## Usage

### Run the server

```bash
npm run build
npm start
```

Or with env file:

```bash
# .env
APIKEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
PINECONE_API_KEY=...
PINECONE_INDEX=rag-index
PROVIDER=openai
```

```bash
npm start
```

### Add to MCP clients

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "rag": {
      "command": "node",
      "args": ["/path/to/rag-mcp-nodejs/dist/index.js"],
      "env": {
        "APIKEY": "sk-...",
        "EMBEDDING_MODEL": "text-embedding-3-small",
        "PINECONE_API_KEY": "...",
        "PINECONE_INDEX": "rag-index",
        "PROVIDER": "openai"
      }
    }
  }
}
```

**Cursor** (`.cursor/mcp.json` or MCP settings):

```json
{
  "mcpServers": {
    "rag": {
      "command": "node",
      "args": ["/path/to/rag-mcp-nodejs/dist/index.js"],
      "env": {
        "APIKEY": "sk-...",
        "EMBEDDING_MODEL": "text-embedding-3-small",
        "PINECONE_API_KEY": "...",
        "PINECONE_INDEX": "rag-index",
        "PROVIDER": "openai"
      }
    }
  }
}
```

### Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run server (from compiled JS)
npm start

# Run server (dev, from TypeScript)
npm run dev

# Run sample client
npm run client
```

## Project structure

```
src/
├── index.ts    # MCP server entry, tools registration
├── ai.ts       # AI controller (chunking, embeddings, Pinecone)
├── env.ts      # Environment loading
└── client.ts   # Example MCP client for testing
dist/           # Compiled output (after npm run build)
```

## Publish to npm

Before publishing:

1. Add `files` to `package.json` to include only `dist/` and docs:

```json
 "files": ["dist", "README.md"]
```

2. Ensure `npm run build` succeeds and `dist/` is committed or built on publish.
3. Add `bin` entry for `npx rag-mcp-nodejs` (optional):

```json
 "bin": { "rag-mcp-nodejs": "dist/index.js" }
```

Note: MCP servers are usually run via `node dist/index.js`; a `bin` is optional. 4. Set a unique package name (npm may require scoped name, e.g. `@yourname/rag-mcp-nodejs`). 5. Add `repository`, `homepage`, and `engines.node` in `package.json` (optional but recommended).

## Requirements

- Node.js >= 18
- Pinecone account
- OpenAI or OpenRouter API key

## License

ISC
