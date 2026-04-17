import React, { useEffect, useState, useRef } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Mic, MicOff, AlertCircle, Loader2, Volume2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InterviewRoom() {
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEndInterview = async () => {
    if (chatHistory.length === 0) return;
    setIsEvaluating(true);
    setBackendError('');

    try {
      const response = await fetch('http://localhost:3001/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate interview');
      }

      const result = await response.json();
      navigate('/admin/dashboard', { state: { result } });
    } catch (err) {
      console.error(err);
      setBackendError(err.message);
      setIsEvaluating(false);
    }
  };

  const fetchAiResponse = async (history) => {
    setIsTranscribing(true);
    setBackendError('');
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
      });

      if (!response.ok) {
         throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const newReply = data.reply;
      setAiReply(newReply);
      setChatHistory([...history, { role: 'assistant', content: newReply }]);

      // Use Browser Text-to-Speech
      if ('speechSynthesis' in window) {
        setIsAiSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(newReply);
        
        // Optional: Customize voice to sound more professional if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices[0];
        if (preferredVoice) {
           utterance.voice = preferredVoice;
        }

        utterance.rate = 1.0;

        utterance.onend = () => {
          setIsAiSpeaking(false);
          startRecording(); // Automatically let user speak next
        };
        
        utterance.onerror = (e) => {
          console.error("Speech synthesis error", e);
          setIsAiSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback if no speech synthesis is available
        console.warn("Speech Synthesis not supported in this browser.");
      }

    } catch (err) {
      console.error(err);
      setBackendError(err.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleRecordingComplete = async (transcriptText) => {
    if (!transcriptText) {
       // If no text was picked up, maybe prompt user to speak again
       return;
    }

    setBackendError('');
    setTranscription(transcriptText);
    
    try {
      const newHistory = [...chatHistory, { role: 'user', content: transcriptText }];
      setChatHistory(newHistory);
      
      await fetchAiResponse(newHistory);
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setBackendError(err.message);
    }
  };

  const { isRecording, error: micError, audioLevel, startRecording, stopRecording } = useAudioRecorder(handleRecordingComplete);

  const initRef = useRef(false);

  // Initialize interview on mount
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      setHasStarted(true);
      
      // Ensure voices are loaded (Chrome sometimes needs a moment)
      window.speechSynthesis.getVoices();
      
      fetchAiResponse([]);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop speaking if component unmounts
      }
    };
  }, []);

  // Visualizer scale based on audio level
  const pulseScale = 1 + (audioLevel * 0.5); // Max scale 1.5

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>

      <div className="z-10 w-full max-w-3xl flex flex-col items-center">
        
        {/* Error State */}
        {(micError || backendError) && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-start gap-3 w-full max-w-lg backdrop-blur-sm z-20">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-300">Error</h3>
              <p className="text-sm opacity-90 mt-1">{micError || backendError}</p>
              {micError && (
                <button 
                  onClick={startRecording}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Avatar/Visualizer */}
        <div className="relative mb-12 mt-8 flex items-center justify-center w-64 h-64">
          {/* Outer glowing rings */}
          {isRecording && !micError && (
            <>
              <div 
                className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 blur-xl transition-transform duration-75"
                style={{ transform: `scale(${pulseScale * 1.2})` }}
              ></div>
              <div 
                className="absolute inset-4 bg-indigo-400 rounded-full opacity-30 blur-md transition-transform duration-75"
                style={{ transform: `scale(${pulseScale})` }}
              ></div>
            </>
          )}
          
          {/* Core Avatar */}
          <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-800/50 backdrop-blur-sm transition-all duration-200 ${isAiSpeaking ? 'bg-fuchsia-600' : 'bg-indigo-600'}`}>
             {isAiSpeaking ? <Volume2 className="w-12 h-12 text-white animate-pulse" /> : (isRecording ? <Mic className="w-12 h-12 text-white" /> : <MicOff className="w-12 h-12 text-indigo-300 opacity-50" />)}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-medium tracking-wide">
            {micError ? 'Interview Paused' : (isAiSpeaking ? 'AI is speaking...' : (isTranscribing ? 'Processing...' : (isRecording ? 'Listening...' : 'Ready')))}
          </h2>
          <p className="text-slate-400 text-sm h-5">
             {isRecording && !isAiSpeaking ? 'Speak clearly into your microphone' : (isTranscribing ? 'Please wait' : '')}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing || isAiSpeaking || isEvaluating}
            className={`p-4 rounded-full transition-all duration-200 ${
              isTranscribing || isAiSpeaking || isEvaluating ? 'bg-slate-700 text-slate-500 cursor-not-allowed' :
              isRecording 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300' 
                : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button
            onClick={handleEndInterview}
            disabled={isTranscribing || isAiSpeaking || isEvaluating || chatHistory.length === 0}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-200 flex items-center gap-2 ${
              isTranscribing || isAiSpeaking || isEvaluating || chatHistory.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300'
            }`}
          >
            {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {isEvaluating ? 'Evaluating...' : 'End Interview'}
          </button>
        </div>

        {/* Conversation Display */}
        <div className="mt-12 w-full max-w-2xl flex flex-col gap-4">
          {aiReply && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm shadow-xl">
              <h3 className="text-sm font-semibold text-fuchsia-400 mb-2 uppercase tracking-wider">AI Recruiter:</h3>
              <p className="text-lg leading-relaxed text-slate-200">{aiReply}</p>
            </div>
          )}
          
          {(transcription || isTranscribing) && !isAiSpeaking && (
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-indigo-400 mb-2 uppercase tracking-wider">You:</h3>
              {isTranscribing && !transcription ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="italic">Processing...</span>
                </div>
              ) : (
                <p className="text-lg leading-relaxed text-indigo-100">{transcription}</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
