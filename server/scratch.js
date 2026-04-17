import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  const res = await ai.models.list();
  for await (const model of res) {
    console.log(model.name);
  }
}
run().catch(console.error);
