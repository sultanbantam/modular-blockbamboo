import { useGameStore } from '@/store/useGameStore';
import { usePiStore } from '@/store/usePiStore';
import { useState } from 'react';

export function PiDashboard({ onClose }: { onClose: () => void }) {
  const { piBalance } = useGameStore();
  const { user, isAuthenticated, login } = usePiStore();
  const [activeTab, setActiveTab] = useState<'dompet' | 'staking'>('dompet');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <span className="text-purple-500">π</span> Pi Dashboard
          </h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Auth State */}
        {!isAuthenticated ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-purple-400">π</span>
            </div>
            <h3 className="text-lg font-bold text-stone-200 mb-2">Belum Terhubung</h3>
            <p className="text-stone-400 text-sm mb-6">Hubungkan akun Pi Network Anda untuk menyimpan progres, membeli blueprint, dan mendapatkan reward.</p>
            <button onClick={login} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-purple-900/50">
              Login dengan Pi
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-stone-800 bg-stone-950">
              <button 
                onClick={() => setActiveTab('dompet')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'dompet' ? 'text-purple-400 border-b-2 border-purple-500 bg-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Dompet In-Game
              </button>
              <button 
                onClick={() => setActiveTab('staking')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'staking' ? 'text-purple-400 border-b-2 border-purple-500 bg-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Staking / Reward
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'dompet' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center text-stone-300 font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-stone-400">Pemain</div>
                      <div className="font-bold text-stone-200">@{user?.username}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-900/40 to-stone-900 border border-purple-800/30 rounded-xl p-6 text-center shadow-inner relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-7xl text-purple-500/10 rotate-12">π</div>
                    <div className="text-sm text-purple-300/80 mb-1">Saldo Reward In-Game</div>
                    <div className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                      {piBalance.toFixed(2)} <span className="text-2xl text-purple-400">π</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 text-center">
                    Saldo ini didapatkan dari menyelesaikan tantangan merakit dengan cepat. Dapat digunakan untuk membeli blueprint premium atau di-stake!
                  </p>
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
                      <input type="number" placeholder="Jumlah π" className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-200 focus:outline-none focus:border-purple-500" />
                      <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold transition whitespace-nowrap">
                        Stake
                      </button>
                    </div>
                  </div>

                  <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-center">
                    <div className="text-sm text-stone-400 mb-1">Total Sedang Di-stake</div>
                    <div className="text-xl font-bold text-stone-300">0.00 π</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
