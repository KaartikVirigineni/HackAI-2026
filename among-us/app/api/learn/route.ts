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
      You are an expert cybersecurity instructor in a futuristic, neon simulation called "CrashOut". 
      Your task is to generate ONE comprehensive educational lesson about a Cybersecurity concept.
      
      Instructions: ${instructions}
      The lesson content should be substantial, providing about 15 minutes of reading material. 
      It should be engaging, informative, and include practical examples.
      Break the content into logical sections with clear headings.

      It MUST be strictly formatted as a JSON object with the following schema:
      {
        "id": "A unique random string ID for this lesson",
        "topic": "The general topic (e.g., 'Advanced Phishing Techniques', 'Zero Trust Architecture')",
        "title": "A compelling title for the lesson",
        "content": "The long-form educational content in Markdown format. Use headings (##), bolding (**), and lists to structure it effectively.",
        "difficulty": "Beginner, Intermediate, or Advanced",
        "questions": [
          {
            "id": "q1",
            "question": "A challenging MCQ question based on the content above.",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 0,
            "explanation": "A detailed explanation of why the answer is correct and why others are not."
          }
        ]
      }
      Generate at least 3-4 distinct MCQs in the 'questions' array.
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
