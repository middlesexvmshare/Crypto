
import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';

const Clouds: React.FC = () => {
  const cloudGroup = React.useRef<Group>(null);

  const cloudsData = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 400,
        60 + Math.random() * 20,
        (Math.random() - 0.5) * 400
      ] as [number, number, number],
      scale: 5 + Math.random() * 8,
      speed: 0.1 + Math.random() * 0.2
    }));
  }, []);

  useFrame((state, delta) => {
    if (cloudGroup.current) {
      cloudGroup.current.children.forEach((cloud, i) => {
        cloud.position.x += cloudsData[i].speed * delta * 5;
        if (cloud.position.x > 250) cloud.position.x = -250;
      });
    }
  });

  return (
    <group ref={cloudGroup}>
      {cloudsData.map((data, i) => (
        <group key={i} position={data.position}>
          {/* Simple fluffy cloud made of 3 spheres */}
          <mesh scale={data.scale}>
            <sphereGeometry args={[1, 7, 7]} />
            <meshStandardMaterial color="white" transparent opacity={0.8} />
          </mesh>
          <mesh position={[1.5 * data.scale * 0.1, 0, 0]} scale={data.scale * 0.8}>
            <sphereGeometry args={[1, 7, 7]} />
            <meshStandardMaterial color="white" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-1.5 * data.scale * 0.1, 0, 0]} scale={data.scale * 0.8}>
            <sphereGeometry args={[1, 7, 7]} />
            <meshStandardMaterial color="white" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Clouds;
