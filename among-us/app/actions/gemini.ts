"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCyberQuestion() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a short, single-sentence question about cybersecurity concepts, suitable for an interview or study session. Do not include the answer. Return only the question itself.",
    });

    if (response && response.text) {
      return response.text.trim();
    }
  } catch (error) {
    console.error("Failed to generate question from Gemini:", error);
  }

  // Fallback question in case of failure
  return "What is the difference between symmetric and asymmetric encryption?";
}
