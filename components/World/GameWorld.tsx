
import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import Gem from './Gem';
import NPC from './NPC';
import Tree from './Tree';
import Vehicle from './Vehicle';
import Building from './Building';
import Player from './Player';
import { GemData } from '../../types';
import { WORLD_SIZE, BUILDINGS, NPCS, TREES, VEHICLES, GRID_INTERVAL, BLOCK_SIZE, ROAD_WIDTH } from '../../constants';

interface GameWorldProps {
  gems: GemData[];
  onInteract: (gem: GemData) => void;
  isPaused: boolean;
  nudgeTarget: [number, number, number] | null;
  nudgeTrigger: number;
}

const GameWorld: React.FC<GameWorldProps> = ({ gems, onInteract, isPaused, nudgeTarget, nudgeTrigger }) => {
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
          <meshStandardMaterial color="#121212" roughness={1} />
        </mesh>
      );

      for (let x = -WORLD_SIZE / 2; x < WORLD_SIZE / 2; x += 6) {
        items.push(
          <mesh key={`hr-dash-${i}-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x + 3, markerY, roadCoord]}>
            <planeGeometry args={[2, 0.2]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.2} />
          </mesh>
        );
      }

      items.push(
        <mesh key={`vr-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[roadCoord, 0.02, 0]} receiveShadow>
          <planeGeometry args={[ROAD_WIDTH, WORLD_SIZE]} />
          <meshStandardMaterial color="#121212" roughness={1} />
        </mesh>
      );

      for (let z = -WORLD_SIZE / 2; z < WORLD_SIZE / 2; z += 6) {
        items.push(
          <mesh key={`vr-dash-${i}-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[roadCoord, markerY, z + 3]}>
            <planeGeometry args={[0.2, 2]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.2} />
          </mesh>
        );
      }

      for (let j = -count; j <= count; j++) {
        const intersectionX = i * GRID_INTERVAL + halfBlock + halfRoad;
        const intersectionZ = j * GRID_INTERVAL + halfBlock + halfRoad;

        const crossingOffsets = [
          { x: 0, z: halfBlock + 1.5, rot: 0 },
          { x: 0, z: -(halfBlock + 1.5), rot: 0 },
          { x: halfBlock + 1.5, z: 0, rot: Math.PI / 2 },
          { x: -(halfBlock + 1.5), z: 0, rot: Math.PI / 2 },
        ];

        crossingOffsets.forEach((offset, k) => {
          const px = intersectionX + offset.x;
          const pz = intersectionZ + offset.z;
          if (Math.abs(px) < WORLD_SIZE / 2 && Math.abs(pz) < WORLD_SIZE / 2) {
            for (let s = -2; s <= 2; s++) {
              items.push(
                <mesh 
                  key={`zebra-${i}-${j}-${k}-${s}`} 
                  rotation={[-Math.PI / 2, 0, offset.rot]} 
                  position={[px + (offset.rot === 0 ? s * 1.2 : 0), markerY, pz + (offset.rot !== 0 ? s * 1.2 : 0)]}
                >
                  <planeGeometry args={[0.6, 3]} />
                  <meshStandardMaterial color="#ffffff" roughness={1} />
                </mesh>
              );
            }
            items.push(
              <mesh 
                key={`stopline-${i}-${j}-${k}`} 
                rotation={[-Math.PI / 2, 0, offset.rot]} 
                position={[px + (offset.rot === 0 ? 0 : (offset.x > 0 ? -2.5 : 2.5)), markerY, pz + (offset.rot === 0 ? (offset.z > 0 ? -2.5 : 2.5) : 0)]}
              >
                <planeGeometry args={[ROAD_WIDTH * 0.8, 0.4]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
              </mesh>
            );
          }
        });

        items.push(
          <mesh key={`p-${i}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[i * GRID_INTERVAL, 0.03, j * GRID_INTERVAL]} receiveShadow>
            <planeGeometry args={[BLOCK_SIZE + 2, BLOCK_SIZE + 2]} />
            <meshStandardMaterial color="#262626" roughness={0.9} />
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
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {roadElements}

      {BUILDINGS.map((b) => <Building key={b.id} data={b} />)}
      {TREES.map(tree => <Tree key={tree.id} data={tree} />)}
      {VEHICLES.map(v => <Vehicle key={v.id} data={v} />)}
      {NPCS.map(npc => <NPC key={npc.id} data={npc} />)}
      {gems.map((g) => <Gem key={g.id} data={g} />)}

      <Player 
        isPaused={isPaused} 
        gems={gems} 
        onApproach={onInteract} 
        nudgeTarget={nudgeTarget}
        nudgeTrigger={nudgeTrigger}
      />
    </>
  );
};

export default GameWorld;
