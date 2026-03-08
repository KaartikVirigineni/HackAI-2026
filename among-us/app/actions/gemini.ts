"use server";

import { ai } from "@/app/lib/gemini";

export async function generateCyberQuestion() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-lite",
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
