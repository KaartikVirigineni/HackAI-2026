import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("Missing GEMINI_API_KEY environment variable. AI features may fail.");
}

// Universal Gemini provider instance
export const ai = new GoogleGenAI({ apiKey });
