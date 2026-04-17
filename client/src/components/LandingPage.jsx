import React from 'react';
import { Mic, Play, MessageCircle, BookOpen, Headphones, Sparkles } from 'lucide-react';
import Globe from './Globe';

export default function LandingPage({ onStart }) {
  return (
    <div className="bg-amber-50 min-h-screen flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12 md:py-24 relative z-10">
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-[10%] text-orange-400/20 animate-float hidden md:block">
          <MessageCircle size={80} />
        </div>
        <div className="absolute bottom-20 left-[15%] text-yellow-500/20 animate-float-delayed hidden md:block">
          <BookOpen size={64} />
        </div>
        <div className="absolute top-20 right-[15%] text-orange-500/20 animate-float-slow hidden md:block">
          <Headphones size={96} />
        </div>
        <div className="absolute bottom-32 right-[10%] text-amber-500/20 animate-float hidden md:block">
          <Sparkles size={72} />
        </div>

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center space-y-8 relative z-20 border border-white/50">
          
          {/* Animated Mic Container */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-orange-300 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 bg-orange-200 rounded-full animate-pulse opacity-40"></div>
            <div className="relative w-full h-full bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-sm border border-orange-200 z-10">
              <Mic size={40} className="animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
          AI Tutor Screener
        </h1>
        
        <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
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
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-orange-500 font-pj rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 hover:bg-orange-600 hover:shadow-lg active:translate-y-1 active:scale-95"
          >
            <Play className="w-5 h-5 mr-2 -ml-1 group-hover:animate-pulse" />
            Start Interview
          </button>
        </div>
      </div>
      </div>

      <div className="w-full bg-[#0a0a0a] text-white py-24 relative overflow-hidden flex flex-col items-center border-t border-slate-800/50">
        <div className="relative z-10 text-center max-w-4xl px-6 mb-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Trusted by Edtechy Partner <span className="text-orange-500">❤️</span> Loved by Teachers
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xl font-medium">
             <div className="flex flex-col items-center"><span className="text-3xl text-orange-400 font-black">200K+</span> Students</div>
             <div className="flex flex-col items-center"><span className="text-3xl text-green-400 font-black">4.9+ ★</span> Trustpilot</div>
             <div className="flex flex-col items-center"><span className="text-3xl text-fuchsia-400 font-black">80+</span> Countries</div>
          </div>
        </div>
        
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 pointer-events-none mt-20">
          <Globe />
        </div>
      </div>
    </div>
  );
}
