import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { BlockType } from '@/store/useGameStore';

interface HouseViewerModalProps {
  type: BlockType;
  name: string;
  onClose: () => void;
}

function HouseModel({ type }: { type: BlockType }) {
  const { scene } = useGLTF(`/models/${type}.glb`);
  return <primitive object={scene} />;
}

export function HouseViewerModal({ type, name, onClose }: HouseViewerModalProps) {
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
          <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
            <color attach="background" args={['#111']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <Stage environment="city" intensity={0.5} adjustCamera>
              <HouseModel type={type} />
            </Stage>
            <OrbitControls makeDefault autoRotate />
          </Canvas>
        </div>
        
        <div className="p-4 bg-stone-900 border-t border-stone-800 text-center flex justify-between items-center">
          <p className="text-stone-400 text-sm">Gunakan mouse (klik & geser) untuk memutar, scroll untuk zoom in/out.</p>
          <button onClick={onClose} className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-lg transition-colors">
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  );
}
