// lib/ai-client.ts (SERVER ONLY)
import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY, 
});
