import React, { useState, Suspense } from 'react';
import { useSabumiStore } from '../../store/useSabumiStore';
import { X, Building2, Hammer } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function SabumiPreviewModel({ url, scale }: { url: string, scale: number }) {
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [url, scene]);

  return <primitive object={clonedScene} position={[0, -0.5, 0]} scale={scale} />;
}

interface HouseCatalogModalProps {
  landId: string;
  onClose: () => void;
}

const CATALOG_ITEMS = [
  { id: 'rtb', name: 'Rumah Tumbuh', price: 700, modelUrl: '/models/rtb.glb' },
  { id: 'RBK21', name: 'Rumah RBK21', price: 800, modelUrl: '/models/RBK21.glb' },
  { id: 'mbb1', name: 'Rumah MBB1', price: 1000, modelUrl: '/models/mbb1.glb' },
];

export const HouseCatalogModal: React.FC<HouseCatalogModalProps> = ({ landId, onClose }) => {
  const { gold, buildOnLand } = useSabumiStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  const selectedItem = CATALOG_ITEMS[selectedIndex];

  const handleBuild = () => {
    buildOnLand(landId, 'housing', selectedItem.modelUrl, scaleMultiplier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-stone-400 hover:text-white bg-stone-800 p-1 rounded-full">
          <X size={24} />
        </button>

        {/* 3D Preview Panel */}
        <div className="flex-1 bg-stone-950 min-h-[300px] md:min-h-[500px] relative">
          <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            
            <Suspense fallback={
              <mesh castShadow receiveShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color={selectedIndex === 0 ? "orange" : selectedIndex === 1 ? "lightblue" : "lightgreen"} />
              </mesh>
            }>
              <SabumiPreviewModel url={selectedItem.modelUrl} scale={scaleMultiplier} />
            </Suspense>
            
            <OrbitControls makeDefault autoRotate autoRotateSpeed={2.0} target={[0, 0, 0]} />
          </Canvas>
          <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
            <p className="text-xs text-stone-500 bg-black/50 inline-block px-2 py-1 rounded">
              Tarik untuk memutar, scroll untuk zoom.
            </p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full md:w-80 p-6 flex flex-col bg-stone-900">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Building2 className="text-blue-400" /> Katalog Rumah
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
            {CATALOG_ITEMS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedIndex === index 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-stone-700 bg-stone-800 hover:border-stone-500'
                }`}
              >
                <h3 className="font-bold text-lg text-white">{item.name}</h3>
                <p className="text-yellow-400 font-semibold">{item.price} G</p>
              </button>
            ))}
          </div>

          <div className="border-t border-stone-700 pt-4 mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-400 text-sm">Ukuran Asli:</span>
              <select 
                value={scaleMultiplier} 
                onChange={(e) => setScaleMultiplier(Number(e.target.value))}
                className="bg-stone-800 text-white p-1 rounded border border-stone-700 text-sm w-32"
              >
                <option value={1000}>Sangat Kecil (x1000)</option>
                <option value={100}>Kecil (x100)</option>
                <option value={1}>Meter (Normal)</option>
                <option value={0.01}>Sentimeter (x0.01)</option>
                <option value={0.001}>Milimeter (x0.001)</option>
              </select>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-400">Total Biaya:</span>
              <span className="text-2xl font-bold text-yellow-400">{selectedItem.price} G</span>
            </div>
            
            <button
              onClick={handleBuild}
              disabled={gold < selectedItem.price}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-stone-700 disabled:text-stone-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Hammer size={20} />
              {gold >= selectedItem.price ? 'Bangun Rumah Ini' : 'Gold Tidak Cukup'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
