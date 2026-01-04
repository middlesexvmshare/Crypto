import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text, Float } from '@react-three/drei';
import { MonolithData, PuzzleType } from '../../types.ts';

interface MonolithProps {
  data: MonolithData;
  onInteract: () => void;
}

const Monolith: React.FC<MonolithProps> = ({ data, onInteract }) => {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (glowRef.current) {
        glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  const getColor = (type: PuzzleType) => {
    if (data.solved) return '#4ade80'; // Green for solved
    switch (type) {
      case PuzzleType.CAESAR: return '#3b82f6';
      case PuzzleType.HASHING: return '#f59e0b';
      case PuzzleType.VIGENERE: return '#8b5cf6';
      case PuzzleType.ASYMMETRIC: return '#ec4899';
      case PuzzleType.SUBSTITUTION: return '#06b6d4';
      default: return '#ffffff';
    }
  };

  const color = getColor(data.type);

  return (
    <group position={data.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[1, 3, 1]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      </Float>

      {/* Label above */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {data.label}
        {data.solved ? ' (COMPLETED)' : ''}
      </Text>

      {/* Base Glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>

      {/* Interactive Trigger Area Visualization (Pulse) */}
      {!data.solved && (
        <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
            <ringGeometry args={[1.8, 2, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default Monolith;