import React from 'react';
import { Mic, Play } from 'lucide-react';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center space-y-8">
        <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
          <Mic size={40} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
          AI Tutor Screener
        </h1>
        
        <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
          Welcome! This is a brief 10-minute voice interview to evaluate your communication skills. 
          Our AI assistant will ask you a few questions. Please make sure you are in a quiet environment 
          and your microphone is working.
        </p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm max-w-md mx-auto flex gap-3 items-start text-left">
           <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <p>Your browser will ask for microphone permissions when you click start. We do not store your audio permanently.</p>
        </div>

        <div className="pt-6">
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-1"
          >
            <Play className="w-5 h-5 mr-2 -ml-1 group-hover:animate-pulse" />
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}
