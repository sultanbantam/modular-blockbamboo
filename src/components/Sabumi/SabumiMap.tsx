import React, { useState } from 'react';
import { useSabumiStore, LandData } from '../../store/useSabumiStore';
import { LandDetailModal } from './LandDetailModal';
import { MarketMenu } from './MarketMenu';
import { Sprout, Home, ShoppingBag, Pickaxe } from 'lucide-react';

export const SabumiMap = ({ onExit, onEnterConstructor }: { onExit: () => void, onEnterConstructor: () => void }) => {
  const { lands, gold, bmcInternal, inventory, claimInitialLand } = useSabumiStore();
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);

  // Auto-claim the first land if not claimed
  React.useEffect(() => {
    claimInitialLand();
  }, [claimInitialLand]);

  const getLandColor = (land: LandData) => {
    if (land.status === 'constructing') return 'bg-yellow-800 border-yellow-600';
    if (land.type === 'housing') return 'bg-blue-900 border-blue-600';
    if (land.type === 'farm') {
      if (land.status === 'producing') return 'bg-green-800 border-green-500';
      return 'bg-emerald-900 border-emerald-700';
    }
    if (land.type === 'market') return 'bg-amber-900 border-amber-600';
    return 'bg-stone-800 border-stone-700 hover:bg-stone-700';
  };

  const getLandIcon = (land: LandData) => {
    if (land.status === 'constructing') return <Pickaxe size={20} className="text-yellow-500" />;
    if (land.type === 'housing') return <Home size={20} className="text-blue-400" />;
    if (land.type === 'farm') return <Sprout size={20} className="text-green-400" />;
    if (land.type === 'market') return <ShoppingBag size={20} className="text-amber-400" />;
    return null;
  };

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

      {/* Iso-like Map Grid */}
      <div className="relative transform rotate-x-60 rotate-z-45 scale-125 mt-10 transition-transform duration-500">
        <div className="grid grid-cols-5 gap-1 p-4">
          {lands.map((land) => (
            <div
              key={land.id}
              onClick={() => setSelectedLandId(land.id)}
              className={`w-16 h-16 border-2 flex items-center justify-center cursor-pointer transition-colors shadow-sm rounded-sm ${getLandColor(land)}`}
            >
              <div className="transform -rotate-z-45 -rotate-x-60 drop-shadow-md">
                {getLandIcon(land)}
              </div>
            </div>
          ))}
        </div>
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
