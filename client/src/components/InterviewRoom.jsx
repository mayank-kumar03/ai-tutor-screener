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
  const [showNextButton, setShowNextButton] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleRecordingComplete = async (transcriptText) => {
    if (!transcriptText) {
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

  const handleEndInterview = async () => {
    if (chatHistory.length === 0) return;
    setIsEvaluating(true);
    setBackendError('');

    // Ensure any ongoing recording or speech is stopped before ending interview
    if (isRecording) stopRecording();
    if (isAiSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

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
          // Show Next Question button instead of auto-starting recording
          setShowNextButton(true);
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
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6 text-gray-800 relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>

      <div className="z-10 w-full max-w-3xl flex flex-col items-center">
        
        {/* Error State */}
        {(micError || backendError) && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-[1.5rem] mb-8 flex items-start gap-3 w-full max-w-lg backdrop-blur-sm z-20 shadow-sm">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-sm opacity-90 mt-1">{micError || backendError}</p>
              {micError && (
                <button 
                  onClick={startRecording}
                  className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm transition-colors font-semibold"
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
                className="absolute inset-0 bg-orange-500 rounded-full opacity-30 blur-xl transition-transform duration-75"
                style={{ transform: `scale(${pulseScale * 1.2})` }}
              ></div>
              <div 
                className="absolute inset-4 bg-yellow-400 rounded-full opacity-40 blur-md transition-transform duration-75"
                style={{ transform: `scale(${pulseScale})` }}
              ></div>
            </>
          )}
          
          {/* Core Avatar */}
          <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl border-4 border-white backdrop-blur-sm transition-all duration-200 ${isAiSpeaking ? 'bg-yellow-400' : 'bg-orange-500'}`}>
             {isAiSpeaking ? <Volume2 className="w-12 h-12 text-gray-800 animate-pulse" /> : (isRecording ? <Mic className="w-12 h-12 text-white" /> : <MicOff className="w-12 h-12 text-orange-200 opacity-80" />)}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
            {micError ? 'Interview Paused' : (isAiSpeaking ? 'AI is speaking...' : (isTranscribing ? 'Processing...' : (isRecording ? 'Listening...' : 'Ready')))}
          </h2>
          <p className="text-gray-500 text-sm h-5 font-medium">
             {isRecording && !isAiSpeaking ? 'Speak clearly into your microphone' : (isTranscribing ? 'Please wait' : '')}
          </p>
        </div>

          {/* Controls */}
          <div className="flex gap-4 items-center">
            {/* Stop Recording button */}
            {isRecording && (
              <button
                onClick={stopRecording}
                disabled={isTranscribing || isAiSpeaking || isEvaluating}
                className="p-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                title="Stop Recording"
              >
                <MicOff size={24} />
              </button>
            )}
            {/* Next Question button */}
            {showNextButton && (
              <button
                onClick={() => {
                  setShowNextButton(false);
                  startRecording();
                }}
                disabled={isTranscribing || isAiSpeaking || isEvaluating}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Next Question
              </button>
            )}
            {/* End Interview button */}
            {chatHistory.length > 0 && (
              <button
                onClick={handleEndInterview}
                disabled={isTranscribing || isAiSpeaking || isEvaluating}
                className="px-6 py-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition"
              >
                {isEvaluating ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                {isEvaluating ? 'Evaluating...' : 'End Interview'}
              </button>
            )}
          </div>

        {/* Conversation Display */}
        <div className="mt-12 w-full max-w-2xl flex flex-col gap-4">
          {aiReply && (
            <div className="bg-white border border-gray-200 rounded-[2rem] p-6 backdrop-blur-sm shadow-md">
              <h3 className="text-sm font-bold text-orange-500 mb-2 uppercase tracking-wider">AI Recruiter:</h3>
              <p className="text-lg leading-relaxed text-gray-800">{aiReply}</p>
            </div>
          )}
          
          {(transcription || isTranscribing) && !isAiSpeaking && (
            <div className="bg-orange-50/50 border border-orange-200 rounded-[2rem] p-6 backdrop-blur-sm shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">You:</h3>
              {isTranscribing && !transcription ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="italic">Processing...</span>
                </div>
              ) : (
                <p className="text-lg leading-relaxed text-gray-800">{transcription}</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
