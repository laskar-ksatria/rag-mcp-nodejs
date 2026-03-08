import { config } from "dotenv";

config();

export const env = {
  PINECONE_API_KEY: `${process.env.PINECONE_API_KEY}`,
  APIKEY: `${process.env.APIKEY}`,
  EMBEDDING_MODEL: `${process.env.EMBEDDING_MODEL}`,
  PINECONE_INDEX: `${process.env.PINECONE_INDEX}`,
  RAG_CHUNK_MAX_TOKENS: `${process.env.RAG_CHUNK_MAX_TOKENS}`,
  PROVIDER: `${process.env.PROVIDER}`,
};
