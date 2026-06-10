import { useGameStore, BlockType } from '@/store/useGameStore';
import { Box } from '@react-three/drei';
import React from 'react';

const UNIT = 0.3;

const woodMaterial = <meshStandardMaterial color="#c29b62" roughness={0.8} />;
const bambooMaterial = <meshStandardMaterial color="#d4b872" roughness={0.7} />;

export function ProceduralBlock({ type, position, rotation }: { type: BlockType, position: [number, number, number], rotation: [number, number, number] }) {
  // Simple placeholders
  switch (type) {
    case 's30':
      return (
        <group position={position} rotation={rotation}>
          <Box args={[UNIT, UNIT, UNIT]} position={[0, UNIT/2, 0]}>
            {woodMaterial}
          </Box>
        </group>
      );
    case 's60':
      return (
        <group position={position} rotation={rotation}>
          <Box args={[UNIT, UNIT*2, UNIT]} position={[0, UNIT, 0]}>
            {woodMaterial}
          </Box>
        </group>
      );
    case 'plus30':
      return (
        <group position={position} rotation={rotation}>
          <Box args={[UNIT, UNIT, UNIT]} position={[0, UNIT/2, 0]}>
            {bambooMaterial}
          </Box>
          <Box args={[UNIT*1.2, UNIT*0.8, UNIT*0.2]} position={[0, UNIT/2, 0]}>
            {bambooMaterial}
          </Box>
          <Box args={[UNIT*0.2, UNIT*0.8, UNIT*1.2]} position={[0, UNIT/2, 0]}>
            {bambooMaterial}
          </Box>
        </group>
      );
    case 'l30':
      return (
        <group position={position} rotation={rotation}>
          <Box args={[UNIT, UNIT, UNIT]} position={[0, UNIT/2, 0]}>
            <meshStandardMaterial color="#8b5a2b" />
          </Box>
        </group>
      );
    default:
      return (
        <group position={position} rotation={rotation}>
          <Box args={[UNIT, UNIT, UNIT]} position={[0, UNIT/2, 0]}>
            <meshStandardMaterial color="#aaaaaa" />
          </Box>
        </group>
      );
  }
}
