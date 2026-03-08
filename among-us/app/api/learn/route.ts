import { NextRequest, NextResponse } from "next/server";
import { checkApiKey, generateJsonContent } from "@/app/lib/aiProvider";

export async function GET(req: NextRequest) {
  const authError = await checkApiKey();
  if (authError) return authError;

  const url = new URL(req.url);
  const feedback = url.searchParams.get('feedback'); // 'up', 'down', or null
  
  let instructions = 'Generate a new flashcard.';
  if (feedback === 'up') {
    instructions = 'The user liked the previous flashcard. Make the next one slightly more difficult and on a similar or advanced related topic.';
  } else if (feedback === 'down') {
    instructions = 'The user found the previous flashcard too difficult or unhelpful. Make the next one easier and cover fundamental concepts.';
  }

  try {
    const prompt = `
      You are an expert cybersecurity instructor in a futuristic, neon simulation called "CyberArena". 
      Your task is to generate ONE single educational flashcard about a Cybersecurity concept.
      
      Instructions: ${instructions}

      It MUST be strictly formatted as a JSON object with the following schema:
      {
        "id": "A unique random string ID for this card",
        "topic": "The general topic (e.g., 'Phishing', 'Cryptography', 'Network Security')",
        "question": "A concise, engaging question or scenario.",
        "answer": "The correct answer or explanation.",
        "difficulty": "Beginner, Intermediate, or Advanced"
      }
    `;

    const text = await generateJsonContent(prompt);

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate flashcard" }, { status: 500 });
  }
}
