
import { CryptoTopic, GemData, BuildingData, NPCData, MonolithData, PuzzleType } from './types';

export const WORLD_SIZE = 300;
export const ROAD_WIDTH = 10;
export const BLOCK_SIZE = 25;
export const GRID_INTERVAL = ROAD_WIDTH + BLOCK_SIZE;
export const SAFE_ZONE_RADIUS = 15;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export const isOnRoad = (x: number, z: number) => {
  const relX = Math.abs(x % GRID_INTERVAL);
  const relZ = Math.abs(z % GRID_INTERVAL);
  const threshold = BLOCK_SIZE / 2;
  return relX > threshold || relZ > threshold;
};

// Generate 50 Gems
export const GEMS: GemData[] = Array.from({ length: 50 }).map((_, i) => {
  const topics = Object.values(CryptoTopic);
  let x, z;
  do {
    x = rand(-WORLD_SIZE/2 + 10, WORLD_SIZE/2 - 10);
    z = rand(-WORLD_SIZE/2 + 10, WORLD_SIZE/2 - 10);
  } while (isOnRoad(x, z));

  return {
    id: `gem-${i}`,
    position: [x, 1, z],
    topic: topics[i % topics.length],
    collected: false
  };
});

// Fix: Added missing export for MONOLITHS used in App.tsx
export const MONOLITHS: MonolithData[] = [
  { id: 'm1', position: [GRID_INTERVAL, 0, GRID_INTERVAL], type: PuzzleType.CAESAR, label: 'Ancient Caesar Slab', solved: false },
  { id: 'm2', position: [-GRID_INTERVAL, 0, GRID_INTERVAL], type: PuzzleType.HASHING, label: 'Hashing Fountain', solved: false },
  { id: 'm3', position: [GRID_INTERVAL, 0, -GRID_INTERVAL], type: PuzzleType.VIGENERE, label: 'Vigenere Obelisk', solved: false },
  { id: 'm4', position: [-GRID_INTERVAL, 0, -GRID_INTERVAL], type: PuzzleType.ASYMMETRIC, label: 'Asymmetric Gate', solved: false },
  { id: 'm5', position: [0, 0, GRID_INTERVAL * 2], type: PuzzleType.SUBSTITUTION, label: 'Substitution Totem', solved: false },
];

// Generate Buildings
export const BUILDINGS: BuildingData[] = [];

// Fix: Use correct building generation logic and defined halfBlocks variable
const halfBlocks = Math.floor(WORLD_SIZE / GRID_INTERVAL);
for (let i = -halfBlocks; i <= halfBlocks; i++) {
  for (let j = -halfBlocks; j <= halfBlocks; j++) {
    const centerX = i * GRID_INTERVAL;
    const centerZ = j * GRID_INTERVAL;
    if (Math.abs(centerX) < SAFE_ZONE_RADIUS && Math.abs(centerZ) < SAFE_ZONE_RADIUS) continue;
    
    const numBuildings = Math.floor(rand(1, 3));
    for (let k = 0; k < numBuildings; k++) {
      const bScale: [number, number, number] = [rand(8, 12), rand(15, 45), rand(8, 12)];
      const offsetX = (Math.random() - 0.5) * (BLOCK_SIZE - bScale[0] - 2);
      const offsetZ = (Math.random() - 0.5) * (BLOCK_SIZE - bScale[2] - 2);
      
      BUILDINGS.push({
        id: `b-${i}-${j}-${k}`,
        position: [centerX + offsetX, 0, centerZ + offsetZ],
        scale: bScale,
        color: '#ffffff' // Set to pure white as requested
      });
    }
  }
}

const SKIN_TONES = ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642'];

// Optimized NPC count: 40
export const NPCS: NPCData[] = Array.from({ length: 40 }).map((_, i) => {
    const blockIdxX = Math.floor(rand(-halfBlocks, halfBlocks));
    const blockIdxZ = Math.floor(rand(-halfBlocks, halfBlocks));
    const isEdgeX = Math.random() > 0.5;
    const x = blockIdxX * GRID_INTERVAL + (isEdgeX ? (BLOCK_SIZE / 2 + 1) : rand(-BLOCK_SIZE/2, BLOCK_SIZE/2));
    const z = blockIdxZ * GRID_INTERVAL + (!isEdgeX ? (BLOCK_SIZE / 2 + 1) : rand(-BLOCK_SIZE/2, BLOCK_SIZE/2));
    
    return {
        id: `npc-${i}`,
        position: [x, 0, z],
        color: `hsl(${rand(0, 360)}, 45%, 50%)`,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        skinColor: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]
    };
});
