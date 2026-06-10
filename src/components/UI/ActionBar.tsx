import { useGameStore } from '@/store/useGameStore';

export function ActionBar() {
  const { editingId, setDraggingId, setEditingId, removeBlock, rotateBlock, doSnap, draggingId, level } = useGameStore();

  if (!editingId && !draggingId) return null;

  const targetId = editingId || draggingId;
  const isMagnetLocked = level < 2;

  return (
    <div className="fixed bottom-0 left-0 w-full lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-auto z-50 flex gap-2 bg-stone-900/95 p-3 lg:rounded-2xl border-t lg:border border-stone-700 shadow-2xl backdrop-blur-md overflow-x-auto custom-scrollbar">
      <button
        onClick={() => {
          if (draggingId) {
            setDraggingId(null);
            setEditingId(targetId);
          } else {
            setDraggingId(targetId);
          }
        }}
        className={`flex-1 lg:flex-none px-4 py-3 lg:rounded-xl font-bold flex flex-col items-center gap-1 transition ${draggingId ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
        <span className="text-[10px] lg:text-xs">Pindah</span>
      </button>

      <button
        onClick={() => rotateBlock()}
        className="flex-1 lg:flex-none px-4 py-3 bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white lg:rounded-xl font-bold flex flex-col items-center gap-1 transition"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        <span className="text-[10px] lg:text-xs">Putar</span>
      </button>

      <button
        onClick={() => !isMagnetLocked && doSnap()}
        disabled={isMagnetLocked}
        className={`flex-1 lg:flex-none px-4 py-3 lg:rounded-xl font-bold flex flex-col items-center gap-1 transition border-l lg:border-l-0 border-stone-700 ${isMagnetLocked ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-amber-400'}`}
        title={isMagnetLocked ? "Terbuka di Level 2" : "Magnet"}
      >
        {isMagnetLocked ? <span className="text-[10px] lg:text-xs mb-1">🔒</span> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        <span className="text-[10px] lg:text-xs">Magnet</span>
      </button>

      <button
        onClick={() => {
          if (confirm('Hapus blok ini?')) {
            removeBlock(targetId);
          }
        }}
        className="flex-1 lg:flex-none px-4 py-3 bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white lg:rounded-xl font-bold flex flex-col items-center gap-1 transition border-l lg:border-l-0 border-stone-700"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        <span className="text-[10px] lg:text-xs">Hapus</span>
      </button>

      <button
        onClick={() => {
          setEditingId(null);
          setDraggingId(null);
        }}
        className="flex-1 lg:flex-none px-4 py-3 bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white lg:rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition border-l lg:border-l-0 border-stone-700"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        <span className="text-[10px] lg:text-xs">Batal</span>
      </button>
    </div>
  );
}
