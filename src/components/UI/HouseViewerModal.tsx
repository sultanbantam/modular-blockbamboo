import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { BlockType, useGameStore } from '@/store/useGameStore';

interface HouseViewerModalProps {
  type: BlockType;
  name: string;
  onClose: () => void;
}

function HouseModel({ type }: { type: BlockType }) {
  const { scene } = useGLTF(`/models/${type}.glb`);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    // Calculate bounding box of the cloned scene
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      // Scale down (or up) so the largest dimension is 15 units
      setScale(15 / maxDim);
    }
  }, [clonedScene]);

  return (
    <Center>
      <primitive object={clonedScene} scale={scale} />
    </Center>
  );
}

export function HouseViewerModal({ type, name, onClose }: HouseViewerModalProps) {
  const setBaseModelUrl = useGameStore(state => state.setBaseModelUrl);

  const handleUseAsBaseModel = () => {
    setBaseModelUrl(`/models/${type}.glb`);
    alert(`${name} telah dipasang sebagai Model Dasar (Template) di area kerja Anda.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-900 absolute top-0 w-full z-10">
          <h2 className="text-xl font-bold text-amber-500">Preview 3D: {name}</h2>
          <button onClick={onClose} className="p-2 bg-stone-800 text-stone-400 hover:text-white rounded-full">
            ✕
          </button>
        </div>

        <div className="flex-1 w-full h-full bg-stone-950 mt-[73px]">
          <Canvas shadows camera={{ position: [15, 10, 15], fov: 50 }}>
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <HouseModel type={type} />
            </Suspense>
            <OrbitControls makeDefault autoRotate autoRotateSpeed={1.0} />
          </Canvas>
        </div>
        
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-400 text-sm">Gunakan mouse (klik & geser) untuk memutar, scroll untuk zoom in/out.</p>
          <div className="flex gap-2">
            <button onClick={handleUseAsBaseModel} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors">
              Gunakan sebagai Template Kerja
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-lg transition-colors">
              Tutup Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
