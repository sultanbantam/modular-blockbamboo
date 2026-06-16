import React from 'react';
import { useSabumiStore } from '../../store/useSabumiStore';
import { ShoppingBag, Coins, X } from 'lucide-react';

interface MarketMenuProps {
  onClose: () => void;
}

export const MarketMenu: React.FC<MarketMenuProps> = ({ onClose }) => {
  const { inventory, gold, sellItem, buyItem } = useSabumiStore();

  const handleSell = (productCode: string) => {
    // Sell 1 item for 10 Gold as a prototype
    sellItem(productCode, 1, 10);
  };

  const handleBuySeed = () => {
    buyItem('bamboo_seed', 1, 5); // 5 Gold per seed
  };

  const bambooInv = inventory.find(i => i.productCode === 'bamboo')?.quantity || 0;
  const seedInv = inventory.find(i => i.productCode === 'bamboo_seed')?.quantity || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-stone-800 p-6 rounded-xl border border-stone-600 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-amber-400 flex items-center gap-2">
          <ShoppingBag />
          Pasar SABUMI
        </h2>

        <div className="bg-stone-900 p-3 rounded mb-4 flex justify-between items-center border border-stone-700">
          <span className="text-stone-400">Saldo Anda</span>
          <span className="text-yellow-400 font-bold flex items-center gap-1">
            <Coins size={16} /> {gold} G
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-stone-200 mb-2 border-b border-stone-700 pb-1">Jual Hasil Panen</h3>
            <div className="flex items-center justify-between bg-stone-700 p-3 rounded">
              <div>
                <p className="font-bold text-white">Bambu</p>
                <p className="text-xs text-stone-300">Dimiliki: {bambooInv}</p>
                <p className="text-xs text-yellow-400">Harga: 10G / unit</p>
              </div>
              <button 
                onClick={() => handleSell('bamboo')}
                disabled={bambooInv <= 0}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded text-white font-bold"
              >
                Jual 1
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-stone-200 mb-2 border-b border-stone-700 pb-1">Beli Keperluan</h3>
            <div className="flex items-center justify-between bg-stone-700 p-3 rounded">
              <div>
                <p className="font-bold text-white">Bibit Bambu</p>
                <p className="text-xs text-stone-300">Dimiliki: {seedInv}</p>
                <p className="text-xs text-yellow-400">Harga: 5G / unit</p>
              </div>
              <button 
                onClick={handleBuySeed}
                disabled={gold < 5}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded text-white font-bold"
              >
                Beli 1
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
