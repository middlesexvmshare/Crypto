import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { InstancedMesh, Object3D, Matrix4 } from 'three';
import { BuildingData } from '../../types.ts';

interface BuildingProps {
  data: BuildingData;
}

const Building: React.FC<BuildingProps> = ({ data }) => {
  const { position, scale, color } = data;
  const [w, h, d] = scale;
  const meshRef = useRef<InstancedMesh>(null);

  // Reusable object for matrix calculations
  const tempObject = useMemo(() => new Object3D(), []);

  const windowData = useMemo(() => {
    const matrices: Matrix4[] = [];
    const windowW = 0.8;
    const windowH = 1.2;
    const spacingX = 2.5;
    const spacingY = 4.0;

    const sides = [
      { axis: 'z', pos: d / 2 + 0.01, rot: 0, width: w }, // Front
      { axis: 'z', pos: -d / 2 - 0.01, rot: Math.PI, width: w }, // Back
      { axis: 'x', pos: w / 2 + 0.01, rot: Math.PI / 2, width: d }, // Right
      { axis: 'x', pos: -w / 2 - 0.01, rot: -Math.PI / 2, width: d }, // Left
    ];

    sides.forEach((side) => {
      const cols = Math.floor(side.width / spacingX);
      const rows = Math.floor((h - 5) / spacingY);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const xPos = (c - (cols - 1) / 2) * spacingX;
          const yPos = 5 + r * spacingY;

          tempObject.position.set(
            side.axis === 'z' ? xPos : side.pos,
            yPos,
            side.axis === 'z' ? side.pos : xPos
          );
          tempObject.rotation.set(0, side.rot, 0);
          tempObject.updateMatrix();
          matrices.push(tempObject.matrix.clone());
        }
      }
    });

    return { matrices, windowW, windowH };
  }, [w, h, d, tempObject]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      windowData.matrices.forEach((matrix, i) => {
        meshRef.current!.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [windowData]);

  const doorPos: [number, number, number] = [0, 1.5, d / 2 + 0.02];

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Optimized Main Structure */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} metalness={0.05} roughness={0.8} />
      </mesh>

      {/* Roof Ledge - Simplified */}
      <mesh position={[0, h, 0]}>
        <boxGeometry args={[w + 0.3, 0.2, d + 0.3]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Instanced Windows - HUGE performance win */}
      {windowData.matrices.length > 0 && (
        <instancedMesh
          ref={meshRef}
          args={[undefined, undefined, windowData.matrices.length]}
        >
          <planeGeometry args={[windowData.windowW, windowData.windowH]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </instancedMesh>
      )}

      {/* Optimized Entrance Door */}
      <mesh position={doorPos}>
        <planeGeometry args={[2.2, 3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} />
      </mesh>
    </group>
  );
};

export default Building;