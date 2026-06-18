import React, { useState, Suspense } from 'react';
import { useSabumiStore, LandData } from '../../store/useSabumiStore';
import { LandDetailModal } from './LandDetailModal';
import { MarketMenu } from './MarketMenu';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Text } from '@react-three/drei';
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

  let color = '#292524'; // stone-800
  if (land.status === 'constructing') color = '#854d0e'; // yellow-800
  if (land.type === 'housing') color = '#1e3a8a'; // blue-900
  if (land.type === 'farm') color = land.status === 'producing' ? '#166534' : '#064e3b';
  if (land.type === 'market') color = '#78350f'; // amber-900

  let label = `Kavling ${land.x},${land.y}`;
  if (land.status === 'empty') label = 'Lahan Kosong';
  if (land.type === 'market') label = 'Pasar';
  if (land.type === 'farm') label = 'Kebun';

  return (
    <group position={[posX, 0, posZ]}>
      {/* The Land Plane */}
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }} receiveShadow>
        <boxGeometry args={[14, 0.5, 14]} />
        <meshStandardMaterial color={color} />
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
        <Canvas shadows camera={{ position: [0, 40, 50], fov: 45 }}>
          <color attach="background" args={['#1c1917']} /> {/* stone-900 */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[20, 40, 20]} intensity={1} castShadow />
          <Environment preset="city" />

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
            maxPolarAngle={Math.PI / 2.5} // Prevent camera from going under ground
            minDistance={20}
            maxDistance={150}
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
