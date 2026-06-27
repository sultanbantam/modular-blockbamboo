import React from 'react';
import { useSabumiStore } from '../../store/useSabumiStore';
import { X, Hammer, Sprout, Building2, Trees, Trash2, RotateCw } from 'lucide-react';

interface SabumiBuildUIProps {
  landId: string;
  placingItem: string | null;
  setPlacingItem: (item: string | null) => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  onExit: () => void;
}

export const SabumiBuildUI: React.FC<SabumiBuildUIProps> = ({ 
  landId, 
  placingItem, 
  setPlacingItem, 
  selectedObjectId,
  setSelectedObjectId,
  onExit 
}) => {
  const { lands, removePlacedObject, updatePlacedObject } = useSabumiStore();
  const land = lands.find(l => l.id === landId);

  const ITEMS = [
    { id: 'mbb1', name: 'Rumah MBB1', icon: <Building2 />, type: 'house' },
    { id: 'RBK21', name: 'Rumah RBK21', icon: <Building2 />, type: 'house' },
    { id: 'rtb', name: 'Rumah Tumbuh', icon: <Building2 />, type: 'house' },
  ];

  if (!land) return null;

  const handleRotate = () => {
    if (!selectedObjectId) return;
    const obj = land.placedObjects?.find(o => o.id === selectedObjectId);
    if (obj) {
      const currentRot = obj.rotation[1];
      updatePlacedObject(landId, selectedObjectId, {
        rotation: [obj.rotation[0], currentRot + Math.PI / 2, obj.rotation[2]]
      });
    }
  };

  const handleDelete = () => {
    if (selectedObjectId) {
      removePlacedObject(landId, selectedObjectId);
      setSelectedObjectId(null);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 bg-stone-900/80 border-b border-stone-800 flex justify-between items-center backdrop-blur pointer-events-auto">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-green-400">Mode Membangun: Kavling {land.x}, {land.y}</h2>
          <span className="text-stone-400 text-sm">
            {selectedObjectId ? "Objek dipilih. Anda dapat memutar atau menghapusnya." : "Pilih objek di bawah dan klik di tanah untuk meletakkan. Klik objek yang sudah ada untuk mengedit."}
          </span>
        </div>
        <button onClick={onExit} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold text-white flex items-center gap-2">
          <X size={20} /> Selesai
        </button>
      </div>

      {/* Edit Selected Object Panel */}
      {selectedObjectId ? (
        <div className="p-4 bg-stone-900/90 border-t border-blue-500 backdrop-blur pointer-events-auto flex justify-center gap-4">
          <button 
            onClick={handleRotate} 
            className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
          >
            <RotateCw size={20} /> Putar 90°
          </button>
          <button 
            onClick={handleDelete} 
            className="flex items-center gap-2 p-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
          >
            <Trash2 size={20} /> Hapus Objek
          </button>
          <button 
            onClick={() => setSelectedObjectId(null)} 
            className="flex items-center gap-2 p-3 bg-stone-700 hover:bg-stone-600 text-white rounded-lg font-bold ml-4"
          >
            Batal
          </button>
        </div>
      ) : (
        /* Catalog Bottom Bar */
        <div className="p-4 bg-stone-900/90 border-t border-stone-800 backdrop-blur pointer-events-auto overflow-x-auto">
          <div className="flex gap-4 max-w-5xl mx-auto">
            {ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setPlacingItem(placingItem === item.id ? null : item.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl min-w-[120px] transition-all ${
                  placingItem === item.id 
                    ? 'bg-green-600 border-2 border-green-400 text-white shadow-[0_0_15px_rgba(74,222,128,0.5)]' 
                    : 'bg-stone-800 border-2 border-stone-700 text-stone-300 hover:bg-stone-700 hover:border-stone-500'
                }`}
              >
                <div className={placingItem === item.id ? 'text-white' : 'text-green-400'}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm text-center">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
