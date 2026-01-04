
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { GemData } from '../../types';
import { BUILDINGS, TREES, VEHICLES, NPCS, WORLD_SIZE } from '../../constants';

interface PlayerProps {
  isPaused: boolean;
  gems: GemData[];
  onApproach: (gem: GemData) => void;
  nudgeTarget: [number, number, number] | null;
  nudgeTrigger: number;
}

const Player: React.FC<PlayerProps> = ({ isPaused, gems, onApproach, nudgeTarget, nudgeTrigger }) => {
  const { camera } = useThree();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const velocity = useRef(new Vector3());
  const lastInteractTime = useRef(0);
  
  // Collision dimensions
  const playerRadius = 0.75;
  const npcRadius = 0.45;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const checkCollision = (x: number, z: number) => {
    const halfWorld = WORLD_SIZE / 2;
    // World Boundaries
    if (Math.abs(x) > halfWorld - 2 || Math.abs(z) > halfWorld - 2) return true;

    // Building Collision
    for (const b of BUILDINGS) {
      const minX = b.position[0] - b.scale[0] / 2 - playerRadius;
      const maxX = b.position[0] + b.scale[0] / 2 + playerRadius;
      const minZ = b.position[2] - b.scale[2] / 2 - playerRadius;
      const maxZ = b.position[2] + b.scale[2] / 2 + playerRadius;
      if (x > minX && x < maxX && z > minZ && z < maxZ) return true;
    }

    // Vehicle Collision
    for (const v of VEHICLES) {
      const w = v.rotation === 0 ? 1.8 : 4;
      const l = v.rotation === 0 ? 4 : 1.8;
      const minX = v.position[0] - w / 2 - playerRadius;
      const maxX = v.position[0] + w / 2 + playerRadius;
      const minZ = v.position[2] - l / 2 - playerRadius;
      const maxZ = v.position[2] + l / 2 + playerRadius;
      if (x > minX && x < maxX && z > minZ && z < maxZ) return true;
    }

    // NPC Collision (checking real-time synced positions)
    for (const npc of NPCS) {
      const dx = x - npc.position[0];
      const dz = z - npc.position[2];
      const distSq = dx * dx + dz * dz;
      const combinedRadius = playerRadius + npcRadius;
      if (distSq < combinedRadius * combinedRadius) return true;
    }

    // Tree Trunk Collision
    for (const t of TREES) {
      const trunkRadius = 0.4;
      const dx = x - t.position[0];
      const dz = z - t.position[2];
      const distSq = dx * dx + dz * dz;
      const combinedRadius = playerRadius + trunkRadius;
      if (distSq < combinedRadius * combinedRadius) return true;
    }

    return false;
  };

  useEffect(() => {
    if (nudgeTrigger > 0 && nudgeTarget) {
      const gemPos = new Vector3(...nudgeTarget);
      const playerPos = camera.position.clone();
      const dir = new Vector3().subVectors(playerPos, gemPos).normalize();
      dir.y = 0;
      const targetPos = gemPos.clone().add(dir.multiplyScalar(4));
      
      if (!checkCollision(targetPos.x, targetPos.z)) {
        camera.position.x = targetPos.x;
        camera.position.z = targetPos.z;
      } else {
        const backDir = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
        backDir.y = 0;
        const fallbackPos = playerPos.clone().add(backDir.multiplyScalar(3));
        if (!checkCollision(fallbackPos.x, fallbackPos.z)) {
          camera.position.x = fallbackPos.x;
          camera.position.z = fallbackPos.z;
        }
      }
      lastInteractTime.current = Date.now();
    }
  }, [nudgeTrigger]);

  useFrame((state, delta) => {
    if (isPaused) return;

    const speed = 22;
    const friction = 12;

    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
    const sideVector = new Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyQuaternion(camera.quaternion);

    direction.y = 0;
    velocity.current.lerp(direction, friction * delta);
    
    const moveStep = velocity.current.clone().multiplyScalar(delta);
    
    // Check collisions independently for sliding effect
    const nextX = camera.position.x + moveStep.x;
    const nextZ = camera.position.z + moveStep.z;

    if (!checkCollision(nextX, camera.position.z)) {
      camera.position.x = nextX;
    } else {
      velocity.current.x = 0;
    }

    if (!checkCollision(camera.position.x, nextZ)) {
      camera.position.z = nextZ;
    } else {
      velocity.current.z = 0;
    }
    
    camera.position.y = 1.6;

    // Proximity interaction with Gems
    const now = Date.now();
    if (now - lastInteractTime.current > 1000) {
      for (const g of gems) {
        if (g.collected) continue;
        const dx = camera.position.x - g.position[0];
        const dz = camera.position.z - g.position[2];
        const distSq = dx * dx + dz * dz;
        if (distSq < 6.25) { // 2.5 meters squared
          onApproach(g);
          lastInteractTime.current = now;
          break;
        }
      }
    }
  });

  return null;
};

export default Player;
