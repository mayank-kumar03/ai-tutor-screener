import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder(onRecordingComplete) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  
  const transcriptRef = useRef('');

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      transcriptRef.current = '';

      // Set up Web Speech API for transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
         setError("Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.");
         return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           transcriptRef.current += finalTranscript + ' ';
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;

      // Also get getUserMedia just for the visualizer pulse effect
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(Math.min(average / 128, 1));
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      // Start the actual speech recognition
      recognition.start();
      setIsRecording(true);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow microphone access in your browser settings to proceed.');
      } else {
        setError('An unexpected error occurred while trying to access the microphone.');
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setAudioLevel(0);

    if (onRecordingComplete && isRecording) {
      // Pass the transcribed text directly
      onRecordingComplete(transcriptRef.current.trim());
    }
  }, [isRecording, onRecordingComplete]);

  return {
    isRecording,
    error,
    audioLevel,
    startRecording,
    stopRecording,
  };
}
