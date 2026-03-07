import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function GET() {
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable" }, { status: 500 });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
         responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are an expert cybersecurity instructor running a rapid-fire "Trivia" simulation in a futuristic, neon environment called "CyberArena".
      Your task is to generate exactly 5 distinct, highly engaging multiple-choice questions covering a variety of beginner-to-intermediate cybersecurity topics (e.g., malware types, network security, cryptography basics, social engineering, physical security).

      The output MUST be strictly formatted as a JSON array of 5 objects with the following schema:
      [
        {
           "id": 1,
           "question": "A scenario-based or direct multiple choice question to test their cybersecurity knowledge.",
           "options": [
              {"id": "A", "text": "First possible answer..."},
              {"id": "B", "text": "Second possible answer..."},
              {"id": "C", "text": "Third possible answer..."},
              {"id": "D", "text": "Fourth possible answer..."}
           ],
           "correctOptionId": "C",
           "explanation": "A detailed, 1-2 sentence explanation of why this option is correct and why the others are wrong."
        }
      ]
      Generate exactly 5 question objects in this array format.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate trivia content" }, { status: 500 });
  }
}
