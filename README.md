# 🎙️ AI Tutor Screener

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

An intelligent, voice-driven AI interviewer designed to screen tutor candidates. Instead of grading deep mathematical knowledge, this AI agent engages in a natural 10-minute conversation to evaluate crucial soft skills: **communication clarity, patience, warmth, ability to simplify, and English fluency.**

---

## 🚀 The Problem & Solution

**The Problem:** Screening hundreds of tutor candidates manually via 10-minute calls is expensive, slow, hard to scale, and prone to human bias. 
**The Solution:** A browser-based AI voice agent that simulates a real tutoring scenario (e.g., "Explain fractions to a 9-year-old"), listens to the candidate's response, asks follow-up questions, handles edge cases (choppy audio, long tangents), and generates a structured, evidence-based evaluation rubric.

## ✨ Key Features

- **🗣️ Real-time Voice Interaction:** Push-to-talk or voice-activity-detected conversations. No typing allowed.
- **🧠 Adaptive Conversational AI:** The agent listens, adapts, and probes further. It reacts naturally to one-word answers or confusing explanations.
- **📊 Automated Assessment Rubric:** Generates a detailed breakdown of the candidate's soft skills with specific transcript quotes as evidence.
- **🛡️ Secure & Scalable:** API keys remain hidden, and the system is designed to handle messy reality (interruptions, bad audio).

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Web MediaRecorder API
- **Backend:** Node.js, Express.js
- **Speech-to-Text (STT):** OpenAI Whisper API (or browser Web Speech API)
- **Conversational Brain:** OpenAI GPT-4 / Anthropic Claude
- **Text-to-Speech (TTS):** ElevenLabs API / Google Cloud TTS
- **Storage:** MongoDB (for storing transcripts and evaluations)

---

## 📂 Project Structure

```text
ai-tutor-screener/
│
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # UI: AudioVisualizer, InterviewStart, ReportCard
│   │   ├── hooks/           # useAudioRecorder, useSpeechToText
│   │   ├── pages/           # InterviewRoom, Dashboard
│   │   └── App.js
│   └── package.json
│
├── backend/                 # Node/Express API
│   ├── controllers/         # Audio processing, AI interaction, Evaluation
│   ├── routes/              # /api/transcribe, /api/chat, /api/evaluate
│   ├── services/            # OpenAI service, ElevenLabs service
│   ├── .env.example
│   └── server.js
│
└── README.md