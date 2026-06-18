import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { BlockType, useGameStore } from '@/store/useGameStore';

interface HouseViewerModalProps {
  type: BlockType;
  name: string;
  onClose: () => void;
}

function HouseModel({ type, scale }: { type: BlockType, scale: number }) {
  const { scene } = useGLTF(`/models/${type}.glb`);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} position={[0, -0.5, 0]} scale={scale} />;
}

export function HouseViewerModal({ type, name, onClose }: HouseViewerModalProps) {
  const setBaseModelUrl = useGameStore(state => state.setBaseModelUrl);
  const setBaseModelScale = useGameStore(state => state.setBaseModelScale);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  const handleUseAsBaseModel = () => {
    setBaseModelUrl(`/models/${type}.glb`);
    setBaseModelScale(scaleMultiplier);
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
          <Canvas shadows camera={{ position: [25, 15, 25], fov: 50 }}>
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <HouseModel type={type} scale={scaleMultiplier} />
            </Suspense>
            <OrbitControls makeDefault autoRotate autoRotateSpeed={1.0} target={[0, 0, 0]} />
          </Canvas>
        </div>
        
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-sm">Ukuran Asli:</span>
            <select 
              value={scaleMultiplier} 
              onChange={(e) => setScaleMultiplier(Number(e.target.value))}
              className="bg-stone-800 text-white p-1.5 rounded border border-stone-700 text-sm"
            >
              <option value={1000}>Sangat Kecil (x1000)</option>
              <option value={100}>Kecil (x100)</option>
              <option value={1}>Meter (Normal)</option>
              <option value={0.01}>Sentimeter (x0.01)</option>
              <option value={0.001}>Milimeter (x0.001)</option>
            </select>
          </div>
          <p className="text-stone-400 text-xs hidden lg:block">Gunakan mouse (klik & geser) untuk memutar, scroll untuk zoom in/out.</p>
          <div className="flex gap-2 w-full md:w-auto">
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
