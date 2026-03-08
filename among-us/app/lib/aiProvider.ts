import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
export const model = "gemini-3.1-flash-lite-preview";

if (!apiKey) {
  console.warn("Missing GEMINI_API_KEY environment variable. AI features may fail.");
}

// Universal Gemini provider instance
export const ai = new GoogleGenAI({ apiKey });

export async function checkApiKey() {
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable" }, { status: 500 });
  }
  return null;
}

export async function generateJsonContent(prompt: string) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });
  return response.text;
}

export async function generateCyberQuestion() {
  try {
    const response = await ai.models.generateContent({
      model,
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
