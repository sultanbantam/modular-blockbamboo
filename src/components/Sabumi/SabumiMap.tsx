import React, { useState, Suspense, useRef } from 'react';
import { useSabumiStore, LandData, PlacedObject } from '../../store/useSabumiStore';
import { LandDetailModal } from './LandDetailModal';
import { MarketMenu } from './MarketMenu';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Text, Sky } from '@react-three/drei';
import { ModelBlock } from '../ModelBlock';
import { SabumiBuildUI } from './SabumiBuildUI';
import * as THREE from 'three';

// --- Sabumi Base House Model (Legacy or General GLB) ---
function SabumiHouseModel({ url, scale, position, rotation }: { url: string, scale: number, position?: [number,number,number], rotation?: [number,number,number] }) {
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [url, scene]);
  return <primitive object={clonedScene} position={position || [0, -0.5, 0]} scale={scale} rotation={rotation || [0,0,0]} />;
}

// --- Dynamic Placed Object ---
function PlacedObjectRender({ obj, isSelected, onClick }: { obj: PlacedObject, isSelected: boolean, onClick?: (e: ThreeEvent<MouseEvent>) => void }) {
  // If it's a known GLB model from public/models, render it
  if (obj.modelUrl.endsWith('.glb')) {
    return (
      <group onClick={onClick}>
        <Suspense fallback={null}>
          <SabumiHouseModel url={obj.modelUrl} scale={obj.scale[0]} position={obj.position} rotation={obj.rotation} />
        </Suspense>
        {isSelected && (
          <mesh position={obj.position}>
            <boxGeometry args={[4, 4, 4]} />
            <meshBasicMaterial color="#3b82f6" wireframe />
          </mesh>
        )}
      </group>
    );
  }
  return null;
}

// --- Preview Object ---
function PreviewObject({ url, position }: { url: string, position: [number, number, number] }) {
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => {
            const mat = m.clone();
            mat.transparent = true;
            mat.opacity = 0.5;
            return mat;
          });
        } else if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
          (mesh.material as THREE.Material).transparent = true;
          (mesh.material as THREE.Material).opacity = 0.5;
        }
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} position={position} />;
}

// --- 3D Land Tile ---
const LandTile = ({ 
  land, 
  onSelect, 
  isBuildMode, 
  placingItem, 
  onPlaceObject 
}: { 
  land: LandData, 
  onSelect: () => void,
  isBuildMode: boolean,
  placingItem: string | null,
  selectedObjectId: string | null,
  onPlaceObject: (pos: [number,number,number]) => void,
  onSelectObject: (id: string) => void
}) => {
  // Center grid at 0,0, tile spacing = 15 units
  const posX = (land.x - 2) * 15;
  const posZ = (land.y - 2) * 15;

  const [previewPos, setPreviewPos] = useState<[number, number, number] | null>(null);

  let color = '#57534e'; // stone-500 (Empty/Unclaimed)
  if (land.status === 'constructing') color = '#78350f'; // amber-900 (Dirt)
  if (land.type === 'housing') color = '#3f6212'; // lime-900 (Claimed residential)
  if (land.type === 'farm') color = land.status === 'producing' ? '#14532d' : '#166534'; // green-900
  if (land.type === 'market') color = '#9a3412'; // orange-900 (Market paving)

  let label = `Kavling ${land.x},${land.y}`;
  if (land.status === 'empty') label = 'Lahan Kosong';
  if (land.type === 'market') label = 'Pasar';
  if (land.type === 'farm') label = 'Kebun';

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isBuildMode || !placingItem) return;
    e.stopPropagation();
    // Simple snap to grid (0.5 units)
    const x = Math.round(e.point.x * 2) / 2 - posX;
    const z = Math.round(e.point.z * 2) / 2 - posZ;
    setPreviewPos([x, 0, z]);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isBuildMode && placingItem && previewPos) {
      onPlaceObject(previewPos);
      setPreviewPos(null);
    } else if (!isBuildMode) {
      onSelect();
    }
  };

  return (
    <group position={[posX, 0, posZ]}>
      {/* The Land Plane (Thinner, sits on ground) */}
      <mesh 
        onClick={handleClick} 
        onPointerMove={handlePointerMove}
        onPointerOut={() => setPreviewPos(null)}
        receiveShadow 
        position={[0, 0.05, 0]}
      >
        <boxGeometry args={[14.5, 0.1, 14.5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* Grid Helper in Build Mode */}
      {isBuildMode && (
        <gridHelper args={[14.5, 14.5, '#4ade80', '#22c55e']} position={[0, 0.11, 0]} />
      )}

      {/* Floating Label (Hidden in build mode) */}
      {!isBuildMode && (
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
      )}

      {/* Render Legacy Base House Model if built */}
      {!isBuildMode && (land.status === 'built' || land.status === 'producing') && land.type === 'housing' && land.modelUrl && (
        <Suspense fallback={null}>
          <SabumiHouseModel url={land.modelUrl} scale={land.modelScale || 1} />
        </Suspense>
      )}

      {/* Render Placed Objects */}
      {land.placedObjects && land.placedObjects.map(obj => (
        <PlacedObjectRender 
          key={obj.id} 
          obj={obj} 
          isSelected={isBuildMode && selectedObjectId === obj.id}
          onClick={(e) => {
            if (isBuildMode) {
              e.stopPropagation();
              onSelectObject(obj.id);
            }
          }}
        />
      ))}

      {/* Render Preview Object */}
      {isBuildMode && placingItem && previewPos && (
        <Suspense fallback={null}>
          <PreviewObject url={`/models/${placingItem}.glb`} position={previewPos} />
        </Suspense>
      )}
    </group>
  );
};

// --- Camera Controller to animate to selected land ---
const CameraController = ({ targetLand }: { targetLand: LandData | null }) => {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current && targetLand) {
      const posX = (targetLand.x - 2) * 15;
      const posZ = (targetLand.y - 2) * 15;
      
      const targetVec = new THREE.Vector3(posX, 0, posZ);
      controlsRef.current.target.lerp(targetVec, 0.05);
      
      // Move camera closer when editing
      const cameraPos = new THREE.Vector3(posX, 15, posZ + 20);
      controlsRef.current.object.position.lerp(cameraPos, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault
      target={[0, 0, 0]}
      maxPolarAngle={Math.PI / 2.1} // Prevent camera from going under ground
      minPolarAngle={Math.PI / 6}
      minDistance={10}
      maxDistance={100}
    />
  );
};

export const SabumiMap = ({ onExit, onEnterConstructor }: { onExit: () => void, onEnterConstructor: () => void }) => {
  const { lands, gold, bmcInternal, inventory, claimInitialLand, addPlacedObject } = useSabumiStore();
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
  const [buildModeLandId, setBuildModeLandId] = useState<string | null>(null);
  const [placingItem, setPlacingItem] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  React.useEffect(() => {
    claimInitialLand();
  }, [claimInitialLand]);

  const handlePlaceObject = (landId: string, position: [number, number, number]) => {
    if (placingItem) {
      addPlacedObject(landId, {
        type: 'house',
        modelUrl: `/models/${placingItem}.glb`,
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      });
      // Optionally deselect after place: setPlacingItem(null);
    }
  };

  const handleSelectObject = (objectId: string) => {
    setSelectedObjectId(objectId);
    setPlacingItem(null);
  };

  const editingLand = buildModeLandId ? lands.find(l => l.id === buildModeLandId) || null : null;

  return (
    <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center">
      {/* Standard HUD Header */}
      {!buildModeLandId && (
        <div className="absolute top-0 left-0 w-full p-4 bg-stone-900/80 border-b border-stone-800 flex justify-between items-center z-10 backdrop-blur pointer-events-auto">
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
      )}

      {/* Sabumi Build UI */}
      {buildModeLandId && (
        <SabumiBuildUI 
          landId={buildModeLandId} 
          placingItem={placingItem} 
          setPlacingItem={(item) => {
            setPlacingItem(item);
            if (item) setSelectedObjectId(null);
          }} 
          selectedObjectId={selectedObjectId}
          setSelectedObjectId={setSelectedObjectId}
          onExit={() => {
            setBuildModeLandId(null);
            setPlacingItem(null);
            setSelectedObjectId(null);
          }} 
        />
      )}

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
              isBuildMode={buildModeLandId === land.id}
              placingItem={placingItem}
              selectedObjectId={selectedObjectId}
              onPlaceObject={(pos) => handlePlaceObject(land.id, pos)}
              onSelectObject={handleSelectObject}
            />
          ))}

          <CameraController targetLand={editingLand} />
        </Canvas>
      </div>

      {/* Modals */}
      {selectedLandId && !buildModeLandId && (
        lands.find(l => l.id === selectedLandId)?.type === 'market' ? (
          <MarketMenu onClose={() => setSelectedLandId(null)} />
        ) : (
          <LandDetailModal 
            landId={selectedLandId} 
            onClose={() => setSelectedLandId(null)} 
            onEnterBuildMode={() => {
              setBuildModeLandId(selectedLandId);
              setSelectedLandId(null);
            }}
            onEnterConstructor={onEnterConstructor}
          />
        )
      )}
    </div>
  );
};
