
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';

interface AvatarProps {
  position: Vector3;
  rotation: number;
  moving: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ position, rotation, moving }) => {
  const groupRef = useRef<Group>(null);
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.lerp(position, 0.2);
      groupRef.current.rotation.y = rotation;
    }

    if (moving && leftLegRef.current && rightLegRef.current) {
      const t = state.clock.elapsedTime * 10;
      leftLegRef.current.rotation.x = Math.sin(t) * 0.5;
      rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
    } else if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = 0;
      rightLegRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh ref={rightLegRef} position={[0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

export default Avatar;
