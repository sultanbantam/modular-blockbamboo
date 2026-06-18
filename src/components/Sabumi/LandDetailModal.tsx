import React, { useState, useEffect } from 'react';
import { useSabumiStore, LandData, LandType } from '../../store/useSabumiStore';
import { Building2, X, Hammer, Sprout, ShoppingBag, Pickaxe, Coins } from 'lucide-react';
import { HouseCatalogModal } from './HouseCatalogModal';

interface LandDetailModalProps {
  landId: string;
  onClose: () => void;
  onEnterConstructor: () => void; // Call this when building to open the 3D mode
}

export const LandDetailModal: React.FC<LandDetailModalProps> = ({ landId, onClose, onEnterConstructor }) => {
  const { lands, buildOnLand, startProduction, harvestProduction } = useSabumiStore();
  const land = lands.find(l => l.id === landId);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    if (!land || !land.productionEndTime) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, land.productionEndTime! - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [land?.productionEndTime]);

  if (!land) return null;

  const handleBuild = (type: LandType) => {
    if (type === 'housing') {
      setShowCatalog(true);
    } else {
      buildOnLand(landId, type);
    }
  };

  const handlePlant = () => {
    startProduction(landId, 'bamboo', 10000); // 10 seconds for prototype
  };

  const handleHarvest = () => {
    harvestProduction(landId, 5); // yield 5 bamboo
  };

  if (showCatalog) {
    return (
      <HouseCatalogModal 
        landId={landId} 
        onClose={() => {
          setShowCatalog(false);
          onClose(); // Close both modals after selection
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-stone-800 p-6 rounded-xl border border-stone-600 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-1 text-green-400 flex items-center gap-2">
          <Building2 />
          Kavling {land.x}, {land.y}
        </h2>
        
        <div className="mb-4 text-stone-300">
          Status: <span className="font-semibold text-white capitalize">{land.status.replace('_', ' ')}</span>
        </div>

        {land.status === 'empty' && (
          <div className="space-y-3">
            <p className="text-sm text-stone-400">Lahan ini masih kosong. Apa yang ingin Anda bangun?</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleBuild('housing')} className="p-3 bg-stone-700 hover:bg-stone-600 rounded flex flex-col items-center gap-1">
                <Hammer size={20} className="text-blue-400" />
                <span>Rumah (100G)</span>
              </button>
              <button onClick={() => handleBuild('farm')} className="p-3 bg-stone-700 hover:bg-stone-600 rounded flex flex-col items-center gap-1">
                <Sprout size={20} className="text-green-400" />
                <span>Kebun (100G)</span>
              </button>
              <button onClick={() => handleBuild('market')} className="p-3 bg-stone-700 hover:bg-stone-600 rounded flex flex-col items-center gap-1 col-span-2">
                <ShoppingBag size={20} className="text-yellow-400" />
                <span>Pasar (100G)</span>
              </button>
            </div>
          </div>
        )}

        {land.status === 'constructing' && (
          <div className="text-center py-4">
            <Pickaxe size={32} className="mx-auto mb-2 text-yellow-500 animate-bounce" />
            <p>Sedang membangun {land.type}...</p>
            <p className="text-xl font-bold mt-2">{(timeLeft / 1000).toFixed(1)}s</p>
          </div>
        )}

        {land.status === 'built' && land.type === 'farm' && (
          <div className="space-y-3">
            <p>Kebun siap ditanami!</p>
            <button onClick={handlePlant} className="w-full p-3 bg-green-600 hover:bg-green-500 rounded text-white font-bold flex items-center justify-center gap-2">
              <Sprout /> Tanam Bibit Bambu
            </button>
          </div>
        )}

        {land.status === 'producing' && land.type === 'farm' && (
          <div className="text-center py-4">
            <Sprout size={32} className="mx-auto mb-2 text-green-400 animate-pulse" />
            <p>Tanaman sedang tumbuh...</p>
            {timeLeft > 0 ? (
              <p className="text-xl font-bold mt-2">{(timeLeft / 1000).toFixed(1)}s</p>
            ) : (
              <button onClick={handleHarvest} className="mt-4 w-full p-3 bg-yellow-500 hover:bg-yellow-400 text-stone-900 rounded font-bold">
                PANEN SEKARANG
              </button>
            )}
          </div>
        )}

        {land.status === 'built' && land.type === 'housing' && (
          <div className="space-y-3 text-center">
            <p className="text-stone-300">Rumah Anda sudah berdiri.</p>
            <button 
              onClick={() => {
                import('../../store/useGameStore').then(({ useGameStore }) => {
                  const state = useGameStore.getState();
                  state.setBaseModelUrl(land.modelUrl || null);
                  state.setBaseModelScale(land.modelScale || 1);
                  onEnterConstructor();
                });
              }} 
              className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold flex items-center justify-center gap-2"
            >
              <Hammer /> Buka 3D Constructor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
