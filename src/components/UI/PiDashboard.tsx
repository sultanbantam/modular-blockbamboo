import { usePiStore } from '@/store/usePiStore';
import { useGameStore } from '@/store/useGameStore';
import { useState } from 'react';

export function PiDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'staking'>('wallet');
  const { user, bmcBalance, authMethod } = usePiStore();
  const { prizePoolBalance } = useGameStore();
  
  // Fake balance for Pi demo
  const piBalance = 12.5;

  const currencySymbol = authMethod === 'bamboochain' ? 'BMC' : 'π';
  const displayBalance = authMethod === 'bamboochain' ? bmcBalance : piBalance;
  const currencyColor = authMethod === 'bamboochain' ? 'text-green-500' : 'text-purple-500';
  const currencyColorSoft = authMethod === 'bamboochain' ? 'text-green-400' : 'text-purple-400';
  const currencyBg = authMethod === 'bamboochain' ? 'bg-green-500' : 'bg-purple-500';
  const dashboardTitle = authMethod === 'bamboochain' ? 'BaMbooChain Dashboard' : 'Pi Dashboard';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className={currencyColor}>{authMethod === 'bamboochain' ? '🌿' : 'π'}</span> {dashboardTitle}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* User Info */}
        <div className="bg-stone-800/50 p-4 border-b border-stone-800 flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${currencyBg} flex items-center justify-center text-white font-bold text-xl`}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="text-stone-200 font-bold">{user?.username || 'Pioneer'}</div>
            <div className="text-xs text-stone-500 font-mono">{user?.uid?.substring(0, 12)}...</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-800">
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'wallet' ? `text-${currencyColor.split('-')[1]}-400 border-b-2 border-${currencyColor.split('-')[1]}-500` : 'text-stone-500 hover:text-stone-300'}`}
          >
            Dompet In-Game
          </button>
          <button 
            onClick={() => setActiveTab('staking')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'staking' ? `text-${currencyColor.split('-')[1]}-400 border-b-2 border-${currencyColor.split('-')[1]}-500` : 'text-stone-500 hover:text-stone-300'}`}
          >
            Staking / Reward
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div className="bg-stone-800 rounded-xl p-6 border border-stone-700 relative overflow-hidden">
                <div className={`absolute -top-4 -right-4 text-7xl ${currencyColor.replace('500', '500/10')} rotate-12`}>{currencySymbol}</div>
                <div className="relative z-10">
                  <div className="text-stone-400 text-sm mb-1">Saldo Tersedia</div>
                  <div className="text-4xl font-bold text-white flex items-baseline gap-2">
                    {displayBalance.toFixed(2)} <span className={`text-2xl ${currencyColorSoft}`}>{currencySymbol}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 rounded-xl font-bold transition-colors border border-stone-700 flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                  <span className="text-sm">Deposit</span>
                </button>
                <button className="bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 rounded-xl font-bold transition-colors border border-stone-700 flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                  <span className="text-sm">Withdraw</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'staking' && (
            <div className="space-y-4">
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
                <h3 className="font-bold text-stone-200 mb-2">Kunci Saldo (Staking)</h3>
                <p className="text-xs text-stone-400 mb-4">
                  Kunci saldo in-game Anda selama 3D, 7D, 1M untuk mendapatkan bonus dan reward menarik!
                </p>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    id="stakeAmount"
                    placeholder={`Jumlah ${currencySymbol}`} 
                    className={`w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-200 focus:outline-none focus:border-${currencyColor.split('-')[1]}-500`} 
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('stakeAmount') as HTMLInputElement;
                      if (input && input.value) {
                        usePiStore.getState().stakeBalance(parseFloat(input.value));
                        input.value = '';
                      }
                    }}
                    className={`${currencyBg} hover:opacity-90 text-white font-bold px-4 rounded transition-colors`}
                  >
                    Stake
                  </button>
                </div>
              </div>

              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 flex justify-between items-center">
                <span className="text-stone-300 text-sm">Total Sedang Di-stake</span>
                <div className="text-xl font-bold text-stone-300">
                  {usePiStore.getState().stakedBalance.toFixed(2)} {currencySymbol}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
