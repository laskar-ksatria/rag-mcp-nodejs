import { config } from "dotenv";

config();

export const env = {
  OPENAI_APIKEY: process.env.OPENAI_APIKEY,
  AI_MODEL: process.env.AI_MODEL,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  OPENROUTERAI_APIKEY: process.env.OPENROUTERAI_APIKEY,
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,
};
