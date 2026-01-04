export const WORLD_SIZE = 300;
export const ROAD_WIDTH = 10;
export const BLOCK_SIZE = 25;
export const GRID_INTERVAL = ROAD_WIDTH + BLOCK_SIZE;
export const SAFE_ZONE_RADIUS = 15;

const rand = (min, max) => Math.random() * (max - min) + min;

export const GEMS = Array.from({ length: 30 }).map((_, i) => ({
  id: `gem-${i}`,
  position: [rand(-100, 100), 1, rand(-100, 100)],
  topic: ['Encryption Basics', 'Symmetric Ciphers', 'Hashing', 'Signatures'][i % 4],
  collected: false
}));

export const MONOLITHS = [
  { id: 'm1', position: [20, 0, 20], type: 'CAESAR', label: 'Ancient Slab', solved: false }
];

export const BUILDINGS = Array.from({ length: 20 }).map((_, i) => ({
  id: `b-${i}`,
  position: [rand(-120, 120), 0, rand(-120, 120)],
  scale: [10, rand(10, 40), 10],
  color: '#334155'
}));

export const NPCS = [];