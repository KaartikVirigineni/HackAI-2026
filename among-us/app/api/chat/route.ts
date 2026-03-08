import { NextResponse } from "next/server";
import { ai, checkApiKey, model } from "@/app/lib/aiProvider";

export async function POST(req: Request) {
  const authError = await checkApiKey();
  if (authError) return authError;

  try {
    const { history, prompt, syllabusContext } = await req.json();

    if (!prompt) {
        return NextResponse.json({ error: "No prompt provided." }, { status: 400 });
    }

    const systemInstruction = syllabusContext 
        ? `You are an expert cybersecurity tutor in the neon "CyberArena" system. 
           Your primary directive is to help this agent prepare for their cybersecurity exams using the provided syllabus context. 
           Be encouraging, extremely knowledgeable, and use a slight cyberpunk/hacker tone.
           
           === SYLLABUS CONTEXT PROVIDED BY AGENT ===
           ${syllabusContext}
           ==========================================
           
           Answer their questions drawing primarily on the topics listed in this syllabus.`
        : `You are an expert cybersecurity tutor in the neon "CyberArena" system. 
           Help the agent learn cybersecurity concepts. Be encouraging, highly knowledgeable, and use a slight cyberpunk/hacker tone.`;

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
      },
      history: history || [],
    });

    const result = await chat.sendMessage({ message: prompt });
    const text = result.text;

    return NextResponse.json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process chat" }, 
      { status: 500 }
    );
  }
}
