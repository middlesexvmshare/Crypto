import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const HUD = ({ stats, loading }) => {
  return html`
    <div className="absolute top-0 left-0 w-full pointer-events-none p-6 flex justify-between items-start z-30">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 text-indigo-400 font-black text-xl">
            ${stats.level}
          </div>
          <div>
            <h2 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Patrol Status</h2>
            <p className="text-white font-bold text-lg">${stats.score} XP</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default HUD;