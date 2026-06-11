import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { usePiStore } from '@/store/usePiStore';
import { yjsManager } from '@/store/yjsProvider';

export function MultiplayerLobby({ onClose }: { onClose: () => void }) {
  const { roomId, setRoomId, onlineUsers } = useGameStore();
  const { user } = usePiStore();
  const [joinCode, setJoinCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleCreateRoom = () => {
    setIsConnecting(true);
    const newRoomId = 'bamboo-room-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Assign a random color for the user's cursor
    const userColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const username = user?.username || 'Pioneer';

    try {
      yjsManager.connect(newRoomId, username, userColor);
      setRoomId(newRoomId);
    } catch(err) {
      console.error(err);
      alert('Gagal membuat ruangan.');
    } finally {
      setIsConnecting(false);
      onClose();
    }
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    setIsConnecting(true);
    
    const formattedCode = joinCode.trim().startsWith('bamboo-room-') 
      ? joinCode.trim() 
      : 'bamboo-room-' + joinCode.trim().toUpperCase();

    const userColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const username = user?.username || 'Pioneer';

    try {
      yjsManager.connect(formattedCode, username, userColor);
      setRoomId(formattedCode);
    } catch(err) {
      console.error(err);
      alert('Gagal bergabung ke ruangan.');
    } finally {
      setIsConnecting(false);
      onClose();
    }
  };

  const handleDisconnect = () => {
    yjsManager.disconnect();
    setRoomId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-800/30">
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <span className="text-2xl">🤝</span> Mode Co-Op (Multiplayer)
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {roomId ? (
            <div className="text-center space-y-4">
              <div className="bg-green-900/20 border border-green-800/50 p-4 rounded-xl">
                <p className="text-stone-300 text-sm mb-1">Anda terhubung di Ruang:</p>
                <p className="text-2xl font-mono font-bold text-green-400 tracking-wider">
                  {roomId.replace('bamboo-room-', '')}
                </p>
                <p className="text-xs text-stone-500 mt-2">Berikan kode di atas kepada teman untuk bergabung!</p>
              </div>

              <div className="text-left bg-stone-800/50 p-4 rounded-xl border border-stone-700">
                <p className="text-sm text-stone-300 mb-2 font-bold">Rekan Tim ({onlineUsers.length}):</p>
                <div className="space-y-2">
                  {onlineUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.color }}></div>
                      <span className="text-stone-200 text-sm">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-left bg-stone-800/50 p-4 rounded-xl border border-stone-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-stone-300 font-bold flex items-center gap-2">
                    <span>🎁</span> Kas Proyek (Prize Pool)
                  </p>
                  <span className="text-amber-400 font-bold">{useGameStore.getState().prizePoolBalance} {usePiStore.getState().authMethod === 'bamboochain' ? 'BMC' : 'π'}</span>
                </div>
                <button
                  onClick={() => {
                    const amount = 1; // Fixed amount to bypass prompt issues in Pi Browser
                    setIsConnecting(true);
                    usePiStore.getState().purchaseProfile('prizepool_donation', amount, 
                      () => {
                        useGameStore.getState().fundPrizePool(amount);
                        const currency = usePiStore.getState().authMethod === 'bamboochain' ? 'BMC' : 'Pi';
                        alert(`Terima kasih! Anda berhasil menyumbang ${amount} ${currency} ke Kas Proyek.`);
                        setIsConnecting(false);
                      },
                      (err) => {
                        console.error(err);
                        alert('Gagal melakukan donasi: ' + err.message);
                        setIsConnecting(false);
                      }
                    );
                  }}
                  disabled={isConnecting}
                  className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 border border-amber-600/50 rounded-lg text-sm font-bold transition flex justify-center items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Donasi Pi ke Kas
                </button>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full py-3 bg-red-900/40 hover:bg-red-800 text-red-300 rounded-xl font-bold transition border border-red-900/50"
              >
                Tinggalkan Ruangan
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-sm text-stone-300">Buat ruang baru dan undang teman untuk membangun bersama.</p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isConnecting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Buat Ruang Baru (Host)
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-stone-700 flex-1"></div>
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">ATAU</span>
                <div className="h-px bg-stone-700 flex-1"></div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-stone-300 block">Gabung ke Ruang Teman:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Masukkan Kode (Misal: X9F2A)"
                    className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-stone-200 font-mono focus:outline-none focus:border-amber-500 uppercase"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={isConnecting || !joinCode}
                    className="px-6 py-3 bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-white rounded-xl font-bold transition"
                  >
                    Gabung
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
