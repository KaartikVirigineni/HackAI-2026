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
      You are an expert cybersecurity instructor in a futuristic, neon simulation called "CyberArena". 
      Your task is to generate an educational scenario about "Phishing Attacks". 
      The content should take about 5-8 minutes to read and be highly engaging.
      It MUST be strictly formatted as a JSON object with the following schema:
      {
        "title": "A catchy title for the phishing module",
        "description": "A short introductory blurb",
        "contentBlocks": [
           {
              "id": 1,
              "text": "Detailed, paragraph-long explanation of a specific phishing concept. Use markdown formatting like bolding for key terms."
           }
        ],
        "discussionQuestions": [
          {
             "id": 1,
             "insertAfterBlockId": 1,
             "question": "A scenario-based multiple choice question to test their understanding of the preceding text.",
             "options": [
                {"id": "A", "text": "First possible answer..."},
                {"id": "B", "text": "Second possible answer..."},
                {"id": "C", "text": "Third possible answer..."},
                {"id": "D", "text": "Fourth possible answer..."}
             ],
             "correctOptionId": "C",
             "explanation": "A detailed explanation of why this option is correct and why the others are wrong."
          }
        ]
      }
      Generate exactly 5 content blocks, and exactly 3 discussion questions. Put question 1 after block 1, question 2 after block 3, and question 3 after block 5.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate learning content" }, { status: 500 });
  }
}
