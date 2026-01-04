import React, { useState } from 'react';
import { Puzzle } from '../../types.ts';

interface TutorialModalProps {
  puzzle: Puzzle;
  onSolve: () => void;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ puzzle, onSolve, onClose }) => {
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === puzzle.correctAnswer.trim().toLowerCase()) {
      setIsCorrect(true);
      setTimeout(onSolve, 2500);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
      <div className={`max-w-2xl w-full bg-slate-900 border-2 ${isCorrect ? 'border-green-500' : error ? 'border-red-500' : 'border-slate-700'} rounded-3xl shadow-2xl transition-all duration-300`}>
        {isCorrect ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto text-green-500">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-black text-white">GEM COLLECTED</h2>
            <p className="text-slate-300">{puzzle.explanation}</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-black text-cyan-400">{puzzle.title}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Tutorial</h3>
                <p className="text-lg text-slate-200 leading-relaxed">{puzzle.tutorial}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Knowledge Check</h3>
                <p className="text-white font-medium">{puzzle.task}</p>
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <input 
                    autoFocus
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="Type your answer..."
                  />
                  <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 px-8 rounded-xl font-bold text-white transition-all">
                    ACTIVATE
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorialModal;