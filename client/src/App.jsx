import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import InterviewRoom from './components/InterviewRoom';
import Dashboard from './components/Dashboard';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="w-full min-h-screen font-sans bg-slate-50 text-slate-900">
      <Routes>
        <Route 
          path="/" 
          element={
            !started ? (
              <LandingPage onStart={() => setStarted(true)} />
            ) : (
              <InterviewRoom />
            )
          } 
        />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
