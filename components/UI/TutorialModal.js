import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const TutorialModal = ({ puzzle, onSolve, onClose }) => {
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === puzzle.correctAnswer.toLowerCase()) {
      setIsCorrect(true);
      setTimeout(onSolve, 2000);
    }
  };

  return html`
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 shadow-2xl">
        ${isCorrect ? html`
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-green-400">CIPHER CRACKED!</h2>
            <p className="text-slate-300">${puzzle.explanation}</p>
          </div>
        ` : html`
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-cyan-400">${puzzle.title}</h2>
            <p className="text-slate-200">${puzzle.tutorial}</p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
               <p className="text-cyan-400 font-mono">${puzzle.task}</p>
            </div>
            <form onSubmit=${handleSubmit} className="flex gap-2">
              <input value=${answer} onChange=${e => setAnswer(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white" placeholder="Solution..." />
              <button className="bg-cyan-600 px-6 rounded-xl font-bold text-white">SUBMIT</button>
            </form>
          </div>
        `}
      </div>
    </div>
  `;
};

export default TutorialModal;