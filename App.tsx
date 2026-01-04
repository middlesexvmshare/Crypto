
import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import GameWorld from './components/World/GameWorld';
import HUD from './components/UI/HUD';
import TutorialModal from './components/UI/TutorialModal';
import { GemData, Puzzle, PlayerStats, MonolithData } from './types';
import { GEMS, MONOLITHS } from './constants';
import { generateTutorial } from './services/geminiService';

const App: React.FC = () => {
  const [gems, setGems] = useState<GemData[]>(GEMS);
  const [monoliths, setMonoliths] = useState<MonolithData[]>(MONOLITHS);
  const [activeTutorial, setActiveTutorial] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [stats, setStats] = useState<PlayerStats>({
    gemsCollected: [],
    score: 0,
    level: 1
  });
  const [gameStarted, setGameStarted] = useState(false);
  
  const [lastGemPosition, setLastGemPosition] = useState<[number, number, number] | null>(null);
  const [nudgeTrigger, setNudgeTrigger] = useState(0);

  const handleInteract = useCallback(async (gem: GemData) => {
    if (gem.collected) return;
    
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

  const handleMonolithInteract = useCallback(async (monolith: MonolithData) => {
    if (monolith.solved) return;
    
    document.exitPointerLock?.();
    setIsLocked(false);
    setLoading(true);

    try {
      const tutorial = await generateTutorial(monolith.type as any);
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

    setMonoliths(prev => prev.map(m => {
        if (m.type === (activeTutorial.topic as any)) return { ...m, solved: true };
        return m;
    }));

    setActiveTutorial(null);
    setLastGemPosition(null);
  }, [activeTutorial]);

  const handleCancel = useCallback(() => {
    setActiveTutorial(null);
    setNudgeTrigger(prev => prev + 1);
  }, []);

  const handleResume = () => {
    setShowPauseMenu(false);
  };

  const handleExit = () => {
    setGameStarted(false);
    setShowPauseMenu(false);
    setStats({
      gemsCollected: [],
      score: 0,
      level: 1
    });
    setGems(GEMS);
    setMonoliths(MONOLITHS);
  };

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
    if (!activeTutorial && !loading) {
      setShowPauseMenu(true);
    }
  }, [activeTutorial, loading]);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-900 p-8 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="z-10 text-center">
          <h1 className="text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 drop-shadow-sm">
            CRYPTO CITY
          </h1>
          <p className="text-slate-400 mb-12 font-bold tracking-[0.3em] uppercase text-sm">Clear Skies Patrol Edition</p>
          
          <div className="flex flex-col items-center gap-10">
            <button 
              onClick={() => setGameStarted(true)}
              className="group relative px-16 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black text-2xl text-white transition-all shadow-2xl active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">BEGIN PATROL</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

            {/* Controls Hint Box */}
            <div className="flex gap-8 items-center bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-[2rem] shadow-xl animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-8 h-8 flex items-center justify-center border-2 border-slate-300 rounded-md font-bold text-slate-400 bg-slate-50 shadow-sm">W</div>
                </div>
                <div className="flex gap-1">
                  <div className="w-8 h-8 flex items-center justify-center border-2 border-slate-300 rounded-md font-bold text-slate-400 bg-slate-50 shadow-sm">A</div>
                  <div className="w-8 h-8 flex items-center justify-center border-2 border-slate-300 rounded-md font-bold text-slate-400 bg-slate-50 shadow-sm">S</div>
                  <div className="w-8 h-8 flex items-center justify-center border-2 border-slate-300 rounded-md font-bold text-slate-400 bg-slate-50 shadow-sm">D</div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Movement</span>
              </div>
              
              <div className="h-10 w-px bg-slate-200"></div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-12 border-2 border-slate-300 rounded-full flex justify-center pt-2 bg-slate-50 shadow-sm">
                  <div className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Look Around</span>
              </div>

              <div className="h-10 w-px bg-slate-200"></div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center border-2 border-indigo-200 rounded-xl bg-indigo-50 text-indigo-500 shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Collect Gems</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isModalOpen = activeTutorial !== null || loading || showPauseMenu;

  return (
    <div className="w-full h-screen relative bg-sky-300">
      <Canvas 
        shadows 
        camera={{ position: [0, 1.6, 0], fov: 70 }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 1.6, -10);
          gl.setClearColor('#87ceeb');
        }}
      >
        <Sky 
          sunPosition={[100, 80, 20]} 
          turbidity={0.5} 
          rayleigh={0.5} 
          mieCoefficient={0.005} 
          mieDirectionalG={0.8}
        />
        
        <ambientLight intensity={0.9} />
        <directionalLight 
          position={[50, 100, 50]} 
          intensity={2.5} 
          color="#fffcf0"
          castShadow 
          shadow-mapSize={[512, 512]}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
        />
        
        <GameWorld 
          gems={gems} 
          monoliths={monoliths}
          onInteract={handleInteract} 
          onMonolithInteract={handleMonolithInteract}
          isPaused={isModalOpen || !isLocked}
          nudgeTarget={lastGemPosition}
          nudgeTrigger={nudgeTrigger}
        />
        
        {!isModalOpen && (
          <PointerLockControls 
            onLock={() => setIsLocked(true)} 
            onUnlock={handleUnlock} 
          />
        )}
      </Canvas>

      <HUD stats={stats} loading={loading} />

      {!isLocked && !isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-900/40 backdrop-blur-sm z-40">
          <div className="text-center p-8 rounded-3xl bg-white/90 border border-white shadow-2xl max-w-sm">
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">System Ready</h2>
            <p className="text-slate-600 mb-6">Click anywhere to resume.</p>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-slate-500">WASD: MOVE</div>
              <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-slate-500">MOUSE: LOOK</div>
            </div>
          </div>
        </div>
      )}

      {showPauseMenu && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-lg z-[60]">
          <div className="bg-slate-900 border-2 border-slate-700 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-8 animate-in zoom-in duration-200">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Paused</h2>
              <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleResume}
                className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-black rounded-2xl transition-all shadow-lg active:scale-95"
              >
                RESUME PATROL
              </button>
              <button 
                onClick={handleExit}
                className="w-full py-4 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 font-bold rounded-2xl transition-all active:scale-95"
              >
                EXIT TO HOME
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              Cryptoverse Session v1.0
            </div>
          </div>
        </div>
      )}

      {isLocked && !isModalOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 opacity-80">
          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
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
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50 backdrop-blur-md">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-800 font-bold text-lg tracking-tight">Extracting Data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
