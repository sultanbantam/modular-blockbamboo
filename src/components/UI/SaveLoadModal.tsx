import { useGameStore } from '@/store/useGameStore';
import { useState } from 'react';

export function SaveLoadModal({ onClose }: { onClose: () => void }) {
  const { savedSlots, saveSlot, loadSlot, deleteSlot } = useGameStore();
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotName, setSlotName] = useState("");

  const handleSave = (slotId: string, isNew: boolean) => {
    if (isNew) {
      setEditingSlotId(slotId);
      setSlotName(`Desain ${slotId.replace('slot-', '')}`);
    } else {
      const name = prompt("Masukkan nama desain:", "Desain Baru");
      if (name) {
        saveSlot(slotId, name);
      }
    }
  };

  const submitSave = (slotId: string) => {
    if (slotName.trim()) {
      saveSlot(slotId, slotName.trim());
      setEditingSlotId(null);
    }
  };

  const slots = ['slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5'];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-bold text-amber-500 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Save & Load Desain
        </h2>

        <div className="flex flex-col gap-3">
          {slots.map(slotId => {
            const savedData = savedSlots.find(s => s.id === slotId);
            
            return (
              <div key={slotId} className="bg-stone-800 p-4 rounded-xl border border-stone-700 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  {editingSlotId === slotId ? (
                    <div className="flex gap-2 w-full">
                      <input 
                        type="text" 
                        value={slotName}
                        onChange={(e) => setSlotName(e.target.value)}
                        className="bg-stone-900 border border-stone-700 text-white rounded px-3 py-1 flex-1 outline-none focus:border-amber-500"
                        placeholder="Nama desain..."
                        autoFocus
                      />
                      <button onClick={() => submitSave(slotId)} className="bg-amber-600 text-white px-3 rounded font-bold">Simpan</button>
                      <button onClick={() => setEditingSlotId(null)} className="text-stone-400">Batal</button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-bold text-stone-200">{savedData ? savedData.name : `Slot ${slotId.replace('slot-', '')} (Kosong)`}</h3>
                        {savedData && <p className="text-xs text-stone-500">{savedData.date} • {savedData.blocks.length} Balok</p>}
                      </div>
                      
                      <div className="flex gap-2">
                        {savedData ? (
                          <>
                            <button 
                              onClick={() => {
                                if (confirm(`Timpa data desain ${savedData.name}?`)) {
                                  setEditingSlotId(slotId);
                                  setSlotName(savedData.name);
                                }
                              }}
                              className="text-stone-400 hover:text-amber-500 p-2 bg-stone-900 rounded"
                              title="Timpa (Save Over)"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            </button>
                            <button 
                              onClick={() => {
                                loadSlot(slotId);
                                onClose();
                              }}
                              className="text-green-400 hover:text-green-300 p-2 bg-stone-900 rounded font-bold"
                              title="Muat (Load)"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                            <button 
                              onClick={() => confirm("Hapus desain ini?") && deleteSlot(slotId)}
                              className="text-red-400 hover:text-red-300 p-2 bg-stone-900 rounded"
                              title="Hapus (Delete)"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingSlotId(slotId);
                              setSlotName(`Desain ${slotId.replace('slot-', '')}`);
                            }}
                            className="text-amber-500 hover:text-amber-400 font-bold px-3 py-1 bg-stone-900 rounded border border-amber-900"
                          >
                            Simpan (Save)
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-between gap-2">
          <button 
            onClick={() => {
              const data = localStorage.getItem('blockbamboo-storage');
              if (data) {
                navigator.clipboard.writeText(data);
                alert("Data berhasil disalin ke Clipboard! Tempel (Paste) kode ini di Pi Browser untuk memindahkannya.");
              } else {
                alert("Tidak ada data untuk diekspor.");
              }
            }}
            className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-bold"
          >
            📤 Backup / Export (Copy)
          </button>
          <button 
            onClick={() => {
              const pasted = prompt("Tempel (Paste) kode data yang sebelumnya Anda salin:");
              if (pasted) {
                try {
                  JSON.parse(pasted); // Validasi JSON
                  localStorage.setItem('blockbamboo-storage', pasted);
                  alert("Data berhasil diimpor! Halaman akan dimuat ulang.");
                  window.location.reload();
                } catch(e) {
                  alert("Format data tidak valid!");
                }
              }
            }}
            className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-xs font-bold"
          >
            📥 Import (Paste)
          </button>
        </div>
      </div>
    </div>
  );
}
