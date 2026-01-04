
import React, { useMemo } from 'react';
import { BuildingData } from '../../types';

interface BuildingProps {
  data: BuildingData;
}

const Building: React.FC<BuildingProps> = ({ data }) => {
  const { scale, color, windowColor, style, position } = data;
  const width = scale[0];
  const height = scale[1];
  const depth = scale[2];

  const windows = useMemo(() => {
    const windowList = [];
    const rows = Math.floor(height / 2.5);
    const colsW = Math.floor(width / 2);
    const colsD = Math.floor(depth / 2);

    // Skip bottom row for doors/ground floor
    for (let r = 1; r < rows; r++) {
      const y = r * 2.5 + 1.25;

      // Front and Back Windows
      for (let c = 0; c < colsW; c++) {
        const x = (c - (colsW - 1) / 2) * 2;
        // Front
        windowList.push(
          <mesh key={`f-${r}-${c}`} position={[x, y, depth / 2 + 0.01]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color={windowColor} emissive={windowColor} emissiveIntensity={Math.random() > 0.3 ? 0.5 : 0} />
          </mesh>
        );
        // Back
        windowList.push(
          <mesh key={`b-${r}-${c}`} position={[x, y, -depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color={windowColor} emissive={windowColor} emissiveIntensity={Math.random() > 0.3 ? 0.5 : 0} />
          </mesh>
        );
      }

      // Left and Right Windows
      for (let c = 0; c < colsD; c++) {
        const z = (c - (colsD - 1) / 2) * 2;
        // Right
        windowList.push(
          <mesh key={`r-${r}-${c}`} position={[width / 2 + 0.01, y, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color={windowColor} emissive={windowColor} emissiveIntensity={Math.random() > 0.3 ? 0.5 : 0} />
          </mesh>
        );
        // Left
        windowList.push(
          <mesh key={`l-${r}-${c}`} position={[-width / 2 - 0.01, y, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial color={windowColor} emissive={windowColor} emissiveIntensity={Math.random() > 0.3 ? 0.5 : 0} />
          </mesh>
        );
      }
    }
    return windowList;
  }, [width, height, depth, windowColor]);

  const architecturalDetails = useMemo(() => {
    const details = [];
    
    // Roof top details
    if (style === 'industrial' || style === 'skyscraper') {
      details.push(
        <mesh key="vent" position={[0, height + 0.5, 0]}>
          <boxGeometry args={[width * 0.4, 1, depth * 0.4]} />
          <meshStandardMaterial color="#444" />
        </mesh>
      );
    }

    if (style === 'classic') {
       // Decorative cornice
       details.push(
         <mesh key="cornice" position={[0, height - 0.1, 0]}>
           <boxGeometry args={[width + 0.4, 0.2, depth + 0.4]} />
           <meshStandardMaterial color={color} roughness={0.5} />
         </mesh>
       );
    }

    // Door at ground level (Front)
    details.push(
      <mesh key="door" position={[0, 1.1, depth / 2 + 0.02]}>
        <planeGeometry args={[1.5, 2.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    );

    return details;
  }, [style, width, height, depth, color]);

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Main Structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} metalness={style === 'skyscraper' ? 0.6 : 0.2} roughness={0.4} />
      </mesh>

      {/* Windows and Doors */}
      {windows}
      {architecturalDetails}
    </group>
  );
};

export default Building;
