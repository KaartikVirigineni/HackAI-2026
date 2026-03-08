import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY environment variable" }, { status: 500 });
  }

  try {
    const { history, prompt, syllabusContext } = await req.json();

    if (!prompt) {
        return NextResponse.json({ error: "No prompt provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // Include system instruction if a syllabus was uploaded
      systemInstruction: syllabusContext 
        ? `You are an expert cybersecurity tutor in the neon "CyberArena" system. 
           Your primary directive is to help this agent prepare for their cybersecurity exams using the provided syllabus context. 
           Be encouraging, extremely knowledgeable, and use a slight cyberpunk/hacker tone.
           
           === SYLLABUS CONTEXT PROVIDED BY AGENT ===
           ${syllabusContext}
           ==========================================
           
           Answer their questions drawing primarily on the topics listed in this syllabus.`
        : `You are an expert cybersecurity tutor in the neon "CyberArena" system. 
           Help the agent learn cybersecurity concepts. Be encouraging, highly knowledgeable, and use a slight cyberpunk/hacker tone.`
    });

    // history should now be cleanly formatted alternating "user" / "model" turns
    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(prompt);
    const text = result.response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
