import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group, Mesh, Quaternion } from 'three';
import { Text } from '@react-three/drei';
import { NPCData } from '../../types.ts';

interface NPCProps {
  data: NPCData;
}

const GREETINGS = ["Hello Agent!", "Stay safe.", "Searching?"];

const NPC: React.FC<NPCProps> = ({ data }) => {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);

  const [target, setTarget] = useState(() => new Vector3(
    data.position[0] + (Math.random() - 0.5) * 15,
    0,
    data.position[2] + (Math.random() - 0.5) * 15
  ));

  const [isGreeting, setIsGreeting] = useState(false);
  const greetingText = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

  useFrame((state, delta) => {
    if (groupRef.current) {
      const currentPos = groupRef.current.position;
      const distToPlayer = currentPos.distanceTo(camera.position);

      data.position[0] = currentPos.x;
      data.position[2] = currentPos.z;

      if (distToPlayer < 4) {
        setIsGreeting(true);
        const lookTarget = new Vector3(camera.position.x, 0, camera.position.z);
        const direction = new Vector3().subVectors(lookTarget, currentPos).normalize();
        const targetQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), direction);
        groupRef.current.quaternion.slerp(targetQuaternion, 0.1);
        
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      } else {
        setIsGreeting(false);
        const distToTarget = currentPos.distanceTo(target);
        
        if (distToTarget > 0.5) {
          const moveDir = new Vector3().subVectors(target, currentPos).normalize();
          groupRef.current.position.add(moveDir.multiplyScalar(delta * 1.5));
          const targetQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), moveDir);
          groupRef.current.quaternion.slerp(targetQuaternion, 0.1);

          const t = state.clock.elapsedTime * 6;
          if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t) * 0.4;
          if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.4;
        } else {
          setTarget(new Vector3(
            data.position[0] + (Math.random() - 0.5) * 20,
            0,
            data.position[2] + (Math.random() - 0.5) * 20
          ));
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
      {isGreeting && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
        >
          {greetingText}
        </Text>
      )}

      {/* Simplified Body */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.2]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* Simplified Head */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={data.skinColor} />
      </mesh>

      {/* Simple Legs */}
      <mesh ref={leftLegRef} position={[-0.15, 0.4, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh ref={rightLegRef} position={[0.15, 0.4, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
};

export default NPC;