import React from 'react';
import { VehicleData } from '../../types.ts';

interface VehicleProps {
  data: VehicleData;
}

const Vehicle: React.FC<VehicleProps> = ({ data }) => {
  return (
    <group position={data.position} rotation={[0, data.rotation, 0]}>
      {/* Base Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.7, 4]} />
        <meshStandardMaterial color={data.color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Cabin/Windows */}
      <mesh position={[0, 0.9, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.6, 2]} />
        <meshStandardMaterial color="#0f172a" metalness={1} roughness={0} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, 0.2, 1.2], [0.9, 0.2, 1.2], [-0.9, 0.2, -1.2], [0.9, 0.2, -1.2]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.3, 12]} />
              <meshStandardMaterial color="#000" />
          </mesh>
      ))}
      {/* Headlights (Off when parked) */}
      <mesh position={[0.6, 0.5, 1.95]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
      <mesh position={[-0.6, 0.5, 1.95]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.6, 0.5, -1.95]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#400" />
      </mesh>
      <mesh position={[-0.6, 0.5, -1.95]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#400" />
      </mesh>
    </group>
  );
};

export default Vehicle;