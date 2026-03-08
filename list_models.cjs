/* eslint-disable @typescript-eslint/no-require-imports */
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const envLines = fs.readFileSync('.env.local', 'utf8').split('\n');
let apiKey = '';
for (const line of envLines) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.split('=')[1].trim().replace(/^"|"$/g, '');
  }
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  const models = await ai.models.list();
  for await (const m of models) {
    console.log(m.name);
  }
}

run().catch(console.error);
