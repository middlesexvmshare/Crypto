
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Stars } from '@react-three/drei';
import GameWorld from './components/World/GameWorld';
import HUD from './components/UI/HUD';
import TutorialModal from './components/UI/TutorialModal';
import { GemData, Puzzle, PlayerStats } from './types';
import { GEMS } from './constants';
import { generateTutorial } from './services/geminiService';

const App: React.FC = () => {
  const [gems, setGems] = useState<GemData[]>(GEMS);
  const [activeTutorial, setActiveTutorial] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [stats, setStats] = useState<PlayerStats>({
    gemsCollected: [],
    score: 0,
    level: 1
  });
  const [gameStarted, setGameStarted] = useState(false);
  
  // Track last gem for "nudging" on cancel
  const [lastGemPosition, setLastGemPosition] = useState<[number, number, number] | null>(null);
  const [nudgeTrigger, setNudgeTrigger] = useState(0);

  const handleInteract = useCallback(async (gem: GemData) => {
    if (gem.collected) return;
    
    // Release pointer to allow interacting with the UI
    document.exitPointerLock?.();
    setIsLocked(false);
    setLoading(true);
    setLastGemPosition(gem.position);

    try {
      const tutorial = await generateTutorial(gem.topic);
      setActiveTutorial(tutorial);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSolve = useCallback(() => {
    if (!activeTutorial) return;

    setStats(prev => ({
      ...prev,
      gemsCollected: [...prev.gemsCollected, activeTutorial.id],
      score: prev.score + 250,
      level: Math.floor((prev.score + 250) / 1000) + 1
    }));
    
    setGems(prev => prev.map(g => {
       if (g.topic === activeTutorial.topic) return { ...g, collected: true };
       return g;
    }));

    setActiveTutorial(null);
    setLastGemPosition(null);
  }, [activeTutorial]);

  const handleCancel = useCallback(() => {
    setActiveTutorial(null);
    // Increment trigger to signal Player component to nudge
    setNudgeTrigger(prev => prev + 1);
  }, []);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-8">
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-600">
          CRYPTO CITY
        </h1>
        <p className="text-xl mb-8 text-slate-300 max-w-md text-center">
          The city's security layers have been fragmented. Find the 50 hidden Gems to restore order and master the art of cryptography.
        </p>
        <button 
          onClick={() => setGameStarted(true)}
          className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold text-xl transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
        >
          Begin Patrol
        </button>
      </div>
    );
  }

  const isModalOpen = activeTutorial !== null || loading;

  return (
    <div className="w-full h-screen relative bg-slate-950">
      <Canvas 
        shadows 
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        onCreated={({ camera }) => {
          // Force camera to look horizontally forward along the Z axis at start
          camera.lookAt(0, 1.6, -10);
        }}
      >
        <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        
        <GameWorld 
          gems={gems} 
          onInteract={handleInteract} 
          isPaused={isModalOpen || !isLocked}
          nudgeTarget={lastGemPosition}
          nudgeTrigger={nudgeTrigger}
        />
        
        {!isModalOpen && (
          <PointerLockControls 
            onLock={() => setIsLocked(true)} 
            onUnlock={() => setIsLocked(false)} 
          />
        )}
      </Canvas>

      <HUD stats={stats} loading={loading} />

      {!isLocked && !isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40">
          <div className="text-center p-8 rounded-3xl bg-slate-900/90 border border-slate-700 shadow-2xl max-w-sm">
            <div className="mb-6 inline-flex p-4 bg-cyan-500/20 rounded-full text-cyan-400">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">System Offline</h2>
            <p className="text-slate-400 mb-6">Click to initialize your neural link and resume patrol.</p>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">WASD: MOVE</div>
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">MOUSE: LOOK</div>
            </div>
          </div>
        </div>
      )}

      {/* Crosshair for first-person targeting */}
      {isLocked && !isModalOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 opacity-50">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute -top-3 -left-3 w-6 h-6 border border-white/20 rounded-full"></div>
        </div>
      )}

      {activeTutorial && (
        <TutorialModal 
          puzzle={activeTutorial} 
          onSolve={handleSolve} 
          onClose={handleCancel} 
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-md">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-slate-700">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-white font-medium text-lg">Extracting Data from Gem...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
