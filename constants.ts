
import { CryptoTopic, GemData, BuildingData, NPCData, TreeData, VehicleData } from './types';

export const WORLD_SIZE = 300;
export const ROAD_WIDTH = 10;
export const BLOCK_SIZE = 25;
export const GRID_INTERVAL = ROAD_WIDTH + BLOCK_SIZE; // 35
export const SAFE_ZONE_RADIUS = 15;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export const isOnRoad = (x: number, z: number) => {
  const relX = Math.abs(x % GRID_INTERVAL);
  const relZ = Math.abs(z % GRID_INTERVAL);
  const threshold = BLOCK_SIZE / 2;
  return relX > threshold || relZ > threshold;
};

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

const BUILDING_STYLES: BuildingData['style'][] = ['modern', 'classic', 'industrial', 'skyscraper'];
const WINDOW_COLORS = ['#fbbf24', '#bae6fd', '#38bdf8', '#ffffff', '#fef3c7'];

export const BUILDINGS: BuildingData[] = [];
const blocksCount = Math.floor(WORLD_SIZE / GRID_INTERVAL);
for (let i = -blocksCount; i <= blocksCount; i++) {
  for (let j = -blocksCount; j <= blocksCount; j++) {
    const centerX = i * GRID_INTERVAL;
    const centerZ = j * GRID_INTERVAL;
    if (Math.abs(centerX) < SAFE_ZONE_RADIUS && Math.abs(centerZ) < SAFE_ZONE_RADIUS) continue;
    
    const numBuildings = Math.floor(rand(1, 4));
    for (let k = 0; k < numBuildings; k++) {
      const style = BUILDING_STYLES[Math.floor(Math.random() * BUILDING_STYLES.length)];
      let height = rand(10, 30);
      if (style === 'skyscraper') height = rand(40, 80);
      if (style === 'industrial') height = rand(8, 15);
      
      const bScale: [number, number, number] = [rand(8, 12), height, rand(8, 12)];
      const offsetX = (Math.random() - 0.5) * (BLOCK_SIZE - bScale[0] - 2);
      const offsetZ = (Math.random() - 0.5) * (BLOCK_SIZE - bScale[2] - 2);
      
      BUILDINGS.push({
        id: `b-${i}-${j}-${k}`,
        position: [centerX + offsetX, 0, centerZ + offsetZ],
        scale: bScale,
        style,
        windowColor: WINDOW_COLORS[Math.floor(Math.random() * WINDOW_COLORS.length)],
        color: `hsl(${rand(200, 260)}, ${rand(10, 30)}%, ${rand(15, 30)}%)`
      });
    }
  }
}

export const VEHICLES: VehicleData[] = [];
for (let i = -blocksCount; i <= blocksCount; i++) {
  for (let j = -blocksCount; j <= blocksCount; j++) {
    const centerX = i * GRID_INTERVAL;
    const centerZ = j * GRID_INTERVAL;
    if (Math.random() > 0.3) {
      const parkX = centerX + (Math.random() - 0.5) * BLOCK_SIZE;
      const parkZ = centerZ + (BLOCK_SIZE / 2) + 1.5;
      if (Math.abs(parkX) < WORLD_SIZE/2 && Math.abs(parkZ) < WORLD_SIZE/2) {
        VEHICLES.push({
          id: `vh-${i}-${j}`,
          position: [parkX, 0, parkZ],
          rotation: Math.PI / 2,
          color: `hsl(${rand(0, 360)}, 50%, 45%)`
        });
      }
    }
    if (Math.random() > 0.3) {
      const parkX = centerX + (BLOCK_SIZE / 2) + 1.5;
      const parkZ = centerZ + (Math.random() - 0.5) * BLOCK_SIZE;
      if (Math.abs(parkX) < WORLD_SIZE/2 && Math.abs(parkZ) < WORLD_SIZE/2) {
        VEHICLES.push({
          id: `vv-${i}-${j}`,
          position: [parkX, 0, parkZ],
          rotation: 0,
          color: `hsl(${rand(0, 360)}, 50%, 45%)`
        });
      }
    }
  }
}

export const TREES: TreeData[] = [];
for (let i = -blocksCount; i <= blocksCount; i++) {
  for (let j = -blocksCount; j <= blocksCount; j++) {
    const centerX = i * GRID_INTERVAL;
    const centerZ = j * GRID_INTERVAL;
    const corners = [[BLOCK_SIZE/2, BLOCK_SIZE/2], [-BLOCK_SIZE/2, BLOCK_SIZE/2], [BLOCK_SIZE/2, -BLOCK_SIZE/2], [-BLOCK_SIZE/2, -BLOCK_SIZE/2]];
    corners.forEach(([cx, cz], k) => {
        if (Math.random() > 0.4) {
            TREES.push({
                id: `tree-${i}-${j}-${k}`,
                position: [centerX + cx + 1, 0, centerZ + cz + 1],
                scale: rand(0.8, 1.2)
            });
        }
    });
  }
}

const SKIN_TONES = ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642'];

export const NPCS: NPCData[] = Array.from({ length: 200 }).map((_, i) => {
    let x, z;
    const blockIdxX = Math.floor(rand(-blocksCount, blocksCount));
    const blockIdxZ = Math.floor(rand(-blocksCount, blocksCount));
    const isEdgeX = Math.random() > 0.5;
    x = blockIdxX * GRID_INTERVAL + (isEdgeX ? (BLOCK_SIZE / 2 + 1) : rand(-BLOCK_SIZE/2, BLOCK_SIZE/2));
    z = blockIdxZ * GRID_INTERVAL + (!isEdgeX ? (BLOCK_SIZE / 2 + 1) : rand(-BLOCK_SIZE/2, BLOCK_SIZE/2));
    
    return {
        id: `npc-${i}`,
        position: [x, 0, z],
        color: `hsl(${rand(0, 360)}, 40%, 60%)`,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        hasHat: Math.random() > 0.7,
        skinColor: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]
    };
});
