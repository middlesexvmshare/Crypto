
import React, { useState } from 'react';
import { Puzzle } from '../../types';

interface PuzzleModalProps {
  puzzle: Puzzle;
  onSolve: () => void;
  onClose: () => void;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ puzzle, onSolve, onClose }) => {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === puzzle.correctAnswer.trim().toLowerCase()) {
      setIsCorrect(true);
      setError(false);
      setTimeout(() => {
        onSolve();
      }, 3000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  if (isCorrect) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
        <div className="max-w-xl w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <h2 className="text-4xl font-black text-white">CIPHER CRACKED!</h2>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left">
            <h3 className="text-cyan-400 font-bold uppercase text-xs mb-2">The Oracle Explains:</h3>
            <p className="text-slate-300 italic">{puzzle.explanation}</p>
          </div>
          <p className="text-slate-400 animate-pulse font-bold">Resonating with the monolith...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className={`max-w-2xl w-full bg-slate-900 border-2 ${error ? 'border-red-500' : 'border-slate-700'} rounded-3xl shadow-2xl overflow-hidden transition-colors duration-200`}>
        <div className="flex justify-between items-center p-6 bg-slate-800/50 border-b border-slate-700">
          <div>
            {/* Fix: Using topic instead of type from Puzzle interface */}
            <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">{puzzle.topic} CHALLENGE</span>
            <h2 className="text-2xl font-black text-white leading-tight">{puzzle.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Fix: Using tutorial instead of instruction from Puzzle interface */}
            <p className="text-slate-300 leading-relaxed font-medium">
              {puzzle.tutorial}
            </p>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group">
              <div className="absolute top-2 right-4 text-[10px] font-bold text-slate-600 uppercase">Encrypted Output</div>
              {/* Fix: Using task instead of encryptedText from Puzzle interface */}
              <p className="text-cyan-400 font-mono text-xl break-all tracking-wider selection:bg-cyan-900">
                {puzzle.task}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Your Decryption</label>
              <input 
                type="text" 
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                placeholder="Enter decrypted text..."
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
              >
                SUBMIT TO ORACLE
              </button>
              <button 
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
              >
                {showHint ? 'HIDE HINT' : 'GET HINT'}
              </button>
            </div>
          </form>

          {showHint && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-in slide-in-from-top-2">
              <p className="text-amber-200 text-sm flex gap-2">
                {/* Fix: hint property doesn't exist on Puzzle interface, providing a generic message */}
                <span className="font-bold">💡 HINT:</span> Re-read the tutorial carefully for clues about the cipher mechanics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzleModal;
