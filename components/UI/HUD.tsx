import React from 'react';
import { PlayerStats } from '../../types.ts';

interface HUDProps {
  stats: PlayerStats;
  loading: boolean;
}

const HUD: React.FC<HUDProps> = ({ stats, loading }) => {
  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none p-6 flex justify-between items-start select-none z-30">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 text-indigo-400 font-black text-xl">
            {stats.level}
          </div>
          <div>
            <h2 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Patrol Status</h2>
            <p className="text-white font-bold text-lg">{stats.score} XP</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl">
        <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Gems Recovered</h3>
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-6 h-6 rotate-45 border ${i < stats.gemsCollected.length ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-slate-800 border-slate-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center space-y-2">
        <div className="px-6 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
          Scouring City Grid...
        </div>
      </div>
    </div>
  );
};

export default HUD;