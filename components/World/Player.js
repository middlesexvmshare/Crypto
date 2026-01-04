import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { BUILDINGS, NPCS, WORLD_SIZE } from '../../constants.js';

const Player = ({ isPaused, gems, monoliths, onApproach, onMonolithApproach, nudgeTarget, nudgeTrigger }) => {
  const { camera } = useThree();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const velocity = useRef(new Vector3());
  const lastInteractTime = useRef(0);
  const playerRadius = 0.7;

  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
      }
    };
    const onKeyUp = (e) => {
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

  useFrame((state, delta) => {
    if (isPaused) return;
    const speed = 20;
    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
    const sideVector = new Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed).applyQuaternion(camera.quaternion);
    direction.y = 0;
    velocity.current.lerp(direction, 10 * delta);
    camera.position.add(velocity.current.clone().multiplyScalar(delta));
    camera.position.y = 1.6;

    const now = Date.now();
    if (now - lastInteractTime.current > 1000) {
      for (const g of gems) {
        if (g.collected) continue;
        if (camera.position.distanceTo(new Vector3(...g.position)) < 2) {
          onApproach(g);
          lastInteractTime.current = now;
          return;
        }
      }
    }
  });

  return null;
};

export default Player;