import React, { useState, Suspense } from 'react';
import { useSabumiStore, LandData } from '../../store/useSabumiStore';
import { LandDetailModal } from './LandDetailModal';
import { MarketMenu } from './MarketMenu';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Text, Sky } from '@react-three/drei';
import { ModelBlock } from '../ModelBlock';

// --- Sabumi Base House Model ---
function SabumiHouseModel({ url, scale }: { url: string, scale: number }) {
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [url, scene]);
  return <primitive object={clonedScene} position={[0, -0.5, 0]} scale={scale} />;
}

// --- 3D Land Tile ---
const LandTile = ({ land, onSelect }: { land: LandData, onSelect: () => void }) => {
  // Center grid at 0,0, tile spacing = 15 units
  const posX = (land.x - 2) * 15;
  const posZ = (land.y - 2) * 15;

  let color = '#57534e'; // stone-500 (Empty/Unclaimed)
  if (land.status === 'constructing') color = '#78350f'; // amber-900 (Dirt)
  if (land.type === 'housing') color = '#3f6212'; // lime-900 (Claimed residential)
  if (land.type === 'farm') color = land.status === 'producing' ? '#14532d' : '#166534'; // green-900
  if (land.type === 'market') color = '#9a3412'; // orange-900 (Market paving)

  let label = `Kavling ${land.x},${land.y}`;
  if (land.status === 'empty') label = 'Lahan Kosong';
  if (land.type === 'market') label = 'Pasar';
  if (land.type === 'farm') label = 'Kebun';

  return (
    <group position={[posX, 0, posZ]}>
      {/* The Land Plane (Thinner, sits on ground) */}
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }} receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[14.5, 0.1, 14.5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Floating Label */}
      <Text 
        position={[0, 0.3, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={1.5} 
        color={land.status === 'empty' ? '#a8a29e' : 'white'} 
        anchorX="center" 
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Render the Base House Model if built */}
      {(land.status === 'built' || land.status === 'producing') && land.type === 'housing' && land.modelUrl && (
        <Suspense fallback={null}>
          <SabumiHouseModel url={land.modelUrl} scale={land.modelScale || 1} />
        </Suspense>
      )}

      {/* Render the Custom Blocks built in the Constructor */}
      {land.customBlocks && land.customBlocks.map(block => (
        <group key={block.id} position={block.position} rotation={block.rotation}>
          <ModelBlock 
            type={block.type} 
            position={[0,0,0]} 
            rotation={[0,0,0]} 
            scale={block.scale}
            blockId={block.id}
          />
        </group>
      ))}
    </group>
  );
};

export const SabumiMap = ({ onExit, onEnterConstructor }: { onExit: () => void, onEnterConstructor: () => void }) => {
  const { lands, gold, bmcInternal, inventory, claimInitialLand } = useSabumiStore();
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);

  // Auto-claim the first land if not claimed
  React.useEffect(() => {
    claimInitialLand();
  }, [claimInitialLand]);

  return (
    <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center">
      {/* HUD Header */}
      <div className="absolute top-0 left-0 w-full p-4 bg-stone-900/80 border-b border-stone-800 flex justify-between items-center z-10 backdrop-blur">
        <div className="flex gap-4">
          <div className="bg-stone-800 px-4 py-2 rounded-lg border border-stone-700 font-bold text-yellow-400">
            {gold} G
          </div>
          <div className="bg-stone-800 px-4 py-2 rounded-lg border border-stone-700 font-bold text-green-400">
            {bmcInternal} BMC
          </div>
        </div>
        
        <div className="bg-stone-800 px-4 py-2 rounded-lg border border-stone-700">
          <span className="text-stone-400 text-sm">Inventori: </span>
          <span className="font-bold text-white">
            {inventory.find(i => i.productCode === 'bamboo')?.quantity || 0} Bambu
          </span>
        </div>

        <button onClick={onExit} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold text-white">
          Keluar Desa
        </button>
      </div>

      {/* 3D Map Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 20, 40], fov: 45 }}>
          <Sky sunPosition={[100, 20, 100]} turbidity={0.3} rayleigh={0.5} />
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[50, 50, 50]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
            shadow-camera-far={200}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />
          <Environment preset="park" />
          
          {/* Ground Plane (Rumput Dasar) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="#2d5a27" roughness={1} />
          </mesh>

          {/* Render all lands */}
          {lands.map((land) => (
            <LandTile 
              key={land.id} 
              land={land} 
              onSelect={() => setSelectedLandId(land.id)} 
            />
          ))}

          <OrbitControls 
            makeDefault
            target={[0, 0, 0]}
            maxPolarAngle={Math.PI / 2.1} // Prevent camera from going under ground
            minPolarAngle={Math.PI / 6}
            minDistance={10}
            maxDistance={100}
          />
        </Canvas>
      </div>

      {selectedLandId && (
        lands.find(l => l.id === selectedLandId)?.type === 'market' ? (
          <MarketMenu onClose={() => setSelectedLandId(null)} />
        ) : (
          <LandDetailModal 
            landId={selectedLandId} 
            onClose={() => setSelectedLandId(null)} 
            onEnterConstructor={onEnterConstructor}
          />
        )
      )}
    </div>
  );
};
