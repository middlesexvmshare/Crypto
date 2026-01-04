
import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group, Mesh, Quaternion } from 'three';
import { Text } from '@react-three/drei';
import { NPCData } from '../../types';

interface NPCProps {
  data: NPCData;
}

const GREETINGS = [
  "Hello Agent!",
  "Stay safe out there.",
  "Cryptos are everywhere!",
  "Nice weather today.",
  "Looking for gems?",
  "Watch out for glitches!",
  "Code is power."
];

const NPC: React.FC<NPCProps> = ({ data }) => {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);

  // Current movement target
  const [target, setTarget] = useState(() => new Vector3(
    data.position[0] + (Math.random() - 0.5) * 20,
    0,
    data.position[2] + (Math.random() - 0.5) * 20
  ));

  const [isGreeting, setIsGreeting] = useState(false);
  const greetingText = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);

  const isMale = data.gender === 'male';
  const shoulderWidth = isMale ? 0.6 : 0.45;
  const hipWidth = isMale ? 0.4 : 0.55;

  useFrame((state, delta) => {
    if (groupRef.current) {
      const currentPos = groupRef.current.position;
      const distToPlayer = currentPos.distanceTo(camera.position);

      // Sync position back to the data object for Player collision detection
      data.position[0] = currentPos.x;
      data.position[2] = currentPos.z;

      if (distToPlayer < 5) {
        // --- PLAYER AWARENESS MODE ---
        setIsGreeting(true);
        
        // Smoothly rotate to face the player
        const lookTarget = new Vector3(camera.position.x, 0, camera.position.z);
        const direction = new Vector3().subVectors(lookTarget, currentPos).normalize();
        const targetQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), direction);
        groupRef.current.quaternion.slerp(targetQuaternion, 0.1);

        // Idle breathing animation
        const idleT = state.clock.elapsedTime * 2;
        groupRef.current.position.y = Math.sin(idleT) * 0.02;
        
        // Reset limb rotations to neutral
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
        
      } else {
        // --- PATROL MODE ---
        setIsGreeting(false);
        const distToTarget = currentPos.distanceTo(target);
        
        if (distToTarget > 0.5) {
          const moveDir = new Vector3().subVectors(target, currentPos).normalize();
          groupRef.current.position.add(moveDir.multiplyScalar(delta * 1.8));
          
          // Face the movement direction
          const targetQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), moveDir);
          groupRef.current.quaternion.slerp(targetQuaternion, 0.1);

          // Walking Animation
          const t = state.clock.elapsedTime * 8;
          if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t) * 0.5;
          if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
          if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t + Math.PI) * 0.4;
          if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t) * 0.4;
        } else {
          // Pick a new target if reached
          setTarget(new Vector3(
            data.position[0] + (Math.random() - 0.5) * 30,
            0,
            data.position[2] + (Math.random() - 0.5) * 30
          ));
          
          // Idle animation while standing still
          const idleT = state.clock.elapsedTime * 2;
          groupRef.current.position.y = Math.sin(idleT) * 0.02;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
      {/* Speech Bubble / Greeting */}
      {isGreeting && (
        <group position={[0, 2.4, 0]}>
          <Text
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
          >
            {greetingText}
          </Text>
          <mesh position={[0, -0.05, -0.01]}>
             <planeGeometry args={[1.4, 0.4]} />
             <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* Torso - Main Body */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[shoulderWidth, 0.6, 0.25]} />
        <meshStandardMaterial color={data.color} roughness={0.7} />
      </mesh>

      {/* Hips / Waist */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[hipWidth, 0.2, 0.25]} />
        <meshStandardMaterial color={data.color} roughness={0.7} />
      </mesh>

      {/* Head Assembly */}
      <group position={[0, 1.65, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial color={data.skinColor} />
        </mesh>

        {/* Eyes (Black pixels) */}
        <mesh position={[0.1, 0.08, 0.18]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.1, 0.08, 0.18]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 0, 0.19]}>
          <boxGeometry args={[0.05, 0.08, 0.05]} />
          <meshStandardMaterial color={data.skinColor} />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.1, 0.18]}>
          <boxGeometry args={[0.12, 0.03, 0.02]} />
          <meshStandardMaterial color="#883333" />
        </mesh>

        {/* Fashion Accessory: Hat */}
        {data.hasHat && (
          <group position={[0, 0.18, 0]}>
             <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.2, 16]} />
                <meshStandardMaterial color="#1e293b" />
             </mesh>
             <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.02, 16]} />
                <meshStandardMaterial color="#1e293b" />
             </mesh>
          </group>
        )}
      </group>

      {/* Right Arm */}
      <group position={[shoulderWidth/2 + 0.08, 1.4, 0]} ref={rightArmRef}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color={data.color} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color={data.skinColor} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group position={[-(shoulderWidth/2 + 0.08), 1.4, 0]} ref={leftArmRef}>
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color={data.color} />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color={data.skinColor} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[hipWidth/4, 0.7, 0]} ref={rightLegRef}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0, -0.65, 0.05]} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.32]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-hipWidth/4, 0.7, 0]} ref={leftLegRef}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0, -0.65, 0.05]} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.32]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  );
};

export default NPC;
