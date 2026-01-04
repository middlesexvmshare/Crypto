
import React from 'react';
import { TreeData } from '../../types';

interface TreeProps {
  data: TreeData;
}

const Tree: React.FC<TreeProps> = ({ data }) => {
  return (
    <group position={data.position} scale={data.scale}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#422006" />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1.2, 2.5, 8]} />
        <meshStandardMaterial color="#064e3b" />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 8]} />
        <meshStandardMaterial color="#065f46" />
      </mesh>
    </group>
  );
};

export default Tree;
