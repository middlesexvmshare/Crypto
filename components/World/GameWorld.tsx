import React, { useMemo } from 'react';
import Gem from './Gem.tsx';
import NPC from './NPC.tsx';
import Player from './Player.tsx';
import Clouds from './Clouds.tsx';
import Building from './Building.tsx';
import Monolith from './Monolith.tsx';
import { GemData, MonolithData } from '../../types.ts';
import { WORLD_SIZE, BUILDINGS, NPCS, GRID_INTERVAL, BLOCK_SIZE, ROAD_WIDTH } from '../../constants.ts';

interface GameWorldProps {
  gems: GemData[];
  monoliths: MonolithData[];
  onInteract: (gem: GemData) => void;
  onMonolithInteract: (monolith: MonolithData) => void;
  isPaused: boolean;
  nudgeTarget: [number, number, number] | null;
  nudgeTrigger: number;
}

const GameWorld: React.FC<GameWorldProps> = ({ 
  gems, 
  monoliths,
  onInteract, 
  onMonolithInteract,
  isPaused, 
  nudgeTarget, 
  nudgeTrigger 
}) => {
  const roadElements = useMemo(() => {
    const items = [];
    const count = Math.floor(WORLD_SIZE / GRID_INTERVAL);
    const halfBlock = BLOCK_SIZE / 2;
    const halfRoad = ROAD_WIDTH / 2;
    const markerY = 0.05;

    for (let i = -count; i <= count; i++) {
      const roadCoord = i * GRID_INTERVAL + halfBlock + halfRoad;

      items.push(
        <mesh key={`hr-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, roadCoord]} receiveShadow>
          <planeGeometry args={[WORLD_SIZE, ROAD_WIDTH]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      );

      for (let x = -WORLD_SIZE / 2; x < WORLD_SIZE / 2; x += 15) {
        items.push(
          <mesh key={`hr-dash-${i}-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x + 7, markerY, roadCoord]}>
            <planeGeometry args={[3, 0.2]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        );
      }

      items.push(
        <mesh key={`vr-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[roadCoord, 0.02, 0]} receiveShadow>
          <planeGeometry args={[ROAD_WIDTH, WORLD_SIZE]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      );

      for (let j = -count; j <= count; j++) {
        const blockX = i * GRID_INTERVAL;
        const blockZ = j * GRID_INTERVAL;

        items.push(
          <mesh key={`curb-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[blockX, 0.03, blockZ]} receiveShadow>
            <planeGeometry args={[BLOCK_SIZE + 1.5, BLOCK_SIZE + 1.5]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.8} />
          </mesh>
        );

        items.push(
          <mesh key={`grass-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[blockX, 0.04, blockZ]} receiveShadow>
            <planeGeometry args={[BLOCK_SIZE - 1.5, BLOCK_SIZE - 1.5]} />
            <meshStandardMaterial color="#348332" roughness={1} />
          </mesh>
        );
      }
    }
    return items;
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[WORLD_SIZE * 2, WORLD_SIZE * 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {roadElements}
      
      <Clouds />

      {BUILDINGS.map((b) => (
        <Building key={b.id} data={b} />
      ))}

      {NPCS.map(npc => <NPC key={npc.id} data={npc} />)}
      {gems.map((g) => <Gem key={g.id} data={g} />)}
      
      {monoliths.map((m) => (
        <Monolith key={m.id} data={m} onInteract={() => onMonolithInteract(m)} />
      ))}

      {/* Fix: use nudgeTarget prop instead of the undefined lastGemPosition variable */}
      <Player 
        isPaused={isPaused} 
        gems={gems} 
        monoliths={monoliths}
        onApproach={onInteract} 
        onMonolithApproach={onMonolithInteract}
        nudgeTarget={nudgeTarget}
        nudgeTrigger={nudgeTrigger}
      />
    </>
  );
};

export default GameWorld;