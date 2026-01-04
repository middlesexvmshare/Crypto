
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Float, Text } from '@react-three/drei';
import { GemData } from '../../types';

interface GemProps {
  data: GemData;
}

const Gem: React.FC<GemProps> = ({ data }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  if (data.collected) return null;

  return (
    <group position={data.position}>
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <mesh ref={meshRef} castShadow>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial 
            color="#22d3ee" 
            emissive="#22d3ee" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      </Float>
      <pointLight color="#22d3ee" intensity={2} distance={5} />
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="#22d3ee"
        anchorX="center"
        anchorY="middle"
      >
        {data.topic}
      </Text>
    </group>
  );
};

export default Gem;
