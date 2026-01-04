import React, { useState, useCallback } from 'react';
import htm from 'htm';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import GameWorld from './components/World/GameWorld.js';
import HUD from './components/UI/HUD.js';
import TutorialModal from './components/UI/TutorialModal.js';
import { GEMS, MONOLITHS } from './constants.js';
import { generateTutorial } from './services/geminiService.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [gems, setGems] = useState(GEMS);
  const [monoliths, setMonoliths] = useState(MONOLITHS);
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [stats, setStats] = useState({
    gemsCollected: [],
    score: 0,
    level: 1
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [lastGemPosition, setLastGemPosition] = useState(null);
  const [nudgeTrigger, setNudgeTrigger] = useState(0);

  const handleInteract = useCallback(async (gem) => {
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

  const handleMonolithInteract = useCallback(async (monolith) => {
    if (monolith.solved) return;
    document.exitPointerLock?.();
    setIsLocked(false);
    setLoading(true);
    try {
      const tutorial = await generateTutorial(monolith.type);
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
    setGems(prev => prev.map(g => g.topic === activeTutorial.topic ? { ...g, collected: true } : g));
    setMonoliths(prev => prev.map(m => m.type === activeTutorial.topic ? { ...m, solved: true } : m));
    setActiveTutorial(null);
    setLastGemPosition(null);
  }, [activeTutorial]);

  const handleCancel = useCallback(() => {
    setActiveTutorial(null);
    setNudgeTrigger(prev => prev + 1);
  }, []);

  if (!gameStarted) {
    return html`
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-900 p-8 relative overflow-hidden">
        <div className="z-10 text-center">
          <h1 className="text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700">
            CRYPTO CITY
          </h1>
          <p className="text-slate-400 mb-12 font-bold tracking-[0.3em] uppercase text-sm">ESM Native Edition</p>
          <button onClick=${() => setGameStarted(true)} className="px-16 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black text-2xl text-white transition-all shadow-2xl">
            BEGIN PATROL
          </button>
        </div>
      </div>
    `;
  }

  const isModalOpen = activeTutorial !== null || loading || showPauseMenu;

  return html`
    <div className="w-full h-screen relative bg-sky-300">
      <${Canvas} shadows camera=${{ position: [0, 1.6, 0], fov: 70 }}>
        <${Sky} sunPosition=${[100, 80, 20]} />
        <ambientLight intensity=${0.9} />
        <directionalLight position=${[50, 100, 50]} intensity=${2.5} castShadow />
        <${GameWorld} 
          gems=${gems} 
          monoliths=${monoliths}
          onInteract=${handleInteract} 
          onMonolithInteract=${handleMonolithInteract}
          isPaused=${isModalOpen || !isLocked}
          nudgeTarget=${lastGemPosition}
          nudgeTrigger=${nudgeTrigger}
        />
        ${!isModalOpen && html`<${PointerLockControls} onLock=${() => setIsLocked(true)} onUnlock=${() => setIsLocked(false)} />`}
      </${Canvas}>

      <${HUD} stats=${stats} loading=${loading} />
      ${activeTutorial && html`<${TutorialModal} puzzle=${activeTutorial} onSolve=${handleSolve} onClose=${handleCancel} />`}
      ${loading && html`
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50 backdrop-blur-md">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-800 font-bold">Extracting Data...</p>
          </div>
        </div>
      `}
    </div>
  `;
};

export default App;