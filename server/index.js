import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI recruiter for Cuemath, conducting a 10-minute automated screening interview for prospective online math tutors. Your goal is to evaluate their soft skills: communication, patience, warmth, simplicity, and English fluency. You are not testing deep technical math knowledge, but rather how they explain concepts.

Rules:
1. Ask behavioral and teaching questions (e.g., 'Explain fractions to a 9-year-old', 'How do you handle a distracted student?').
2. Keep your responses extremely concise (under 2 sentences).
3. Follow up on vague answers, and handle one-word replies gracefully by gently probing for more detail.
4. Be welcoming, professional, and encouraging.
5. Only ask one question at a time. Wait for their response.
6. Begin the interview by welcoming them and asking the first question.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { history } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'History array is required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
       return res.status(500).json({ error: 'Gemini API key not configured. Please add it to server/.env' });
    }

    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // If history is empty, we must send a prompt to kick off the conversation.
    // Gemini API requires at least one user message to start.
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: "Hello, I am ready to begin the interview." }]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    const replyText = response.text;

    // No longer generating TTS audio on the backend.
    res.json({
      reply: replyText
    });

  } catch (error) {
    console.error('Error during chat completion:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

const EVALUATION_PROMPT = `Act as an expert HR assessor. Analyze the following interview transcript and score the candidate out of 10 on: Clarity, Warmth, Simplicity, Patience, and Fluency.

Return ONLY a structured JSON object exactly matching this schema:
{
  "scores": {
    "Clarity": <number>,
    "Warmth": <number>,
    "Simplicity": <number>,
    "Patience": <number>,
    "Fluency": <number>
  },
  "overallScore": <number>,
  "passFailRecommendation": "Pass" | "Fail",
  "evidence": {
    "Clarity": "<quote or explanation>",
    "Warmth": "<quote or explanation>",
    "Simplicity": "<quote or explanation>",
    "Patience": "<quote or explanation>",
    "Fluency": "<quote or explanation>"
  },
  "summary": "<a brief overall summary of the candidate's performance>"
}`;

app.post('/api/evaluate', async (req, res) => {
  try {
    const { history } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'History array is required' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
       return res.status(500).json({ error: 'Gemini API key not configured.' });
    }

    const transcript = history.map(msg => `${msg.role === 'assistant' ? 'AI Recruiter' : 'Candidate'}: ${msg.content}`).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Transcript:\n${transcript}`,
      config: {
        systemInstruction: EVALUATION_PROMPT,
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    const evaluationJSON = JSON.parse(response.text);
    res.json(evaluationJSON);

  } catch (error) {
    console.error('Error during evaluation:', error);
    res.status(500).json({ error: 'Failed to generate evaluation' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
