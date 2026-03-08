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

    const systemInstruction = `You are an expert cybersecurity tutor in the neon "CrashOut" system. 
       Help the agent learn cybersecurity concepts. Be encouraging, highly knowledgeable, and use a slight cyberpunk/hacker tone.${
       syllabusContext ? ` The user has provided their syllabus document. Answer their questions drawing primarily on the topics listed in it.` : ''
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalPrompt: any = prompt;

    if (syllabusContext) {
      const inlineDataPart = { inlineData: { data: syllabusContext.data, mimeType: syllabusContext.mimeType } };
      if (history && history.length > 0) {
        history[0].parts.unshift(inlineDataPart);
        history[0].parts.unshift({ text: "Here is the syllabus document context for this session:\n" });
      } else {
        finalPrompt = [
            inlineDataPart,
            { text: "Use the above syllabus document for context.\n\n" + prompt }
        ];
      }
    }

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
      },
      history: history || [],
    });

    const result = await chat.sendMessage({ message: finalPrompt });
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
