import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useTranslation } from '@/hooks/useTranslation';

export function ProjectManagerModal({ onClose }: { onClose: () => void }) {
  const { savedSlots, saveSlot, loadSlot, deleteSlot, newProject, projectName } = useGameStore();
  const [newSaveName, setNewSaveName] = useState(projectName);
  const { t } = useTranslation();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}j ${m}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-800/30 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
              <span>🏗️</span> {t('projectManagerTitle')}
            </h2>
            <p className="text-stone-400 text-sm mt-1">{t('projectManagerDesc')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* New / Save Current */}
          <div className="mb-8 bg-stone-800/50 p-4 rounded-xl border border-stone-700/50">
            <h3 className="text-stone-300 font-bold mb-3 uppercase text-xs tracking-wider">{t('quickAction')}</h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (confirm("Mulai proyek baru? Progress yang belum disimpan akan hilang.")) {
                    newProject();
                    onClose();
                  }
                }}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 border border-stone-600"
              >
                <span>➕</span> {t('newProject')}
              </button>
              
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newSaveName}
                  onChange={(e) => setNewSaveName(e.target.value)}
                  placeholder="Nama Proyek..."
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 text-stone-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    const id = newSaveName.toLowerCase().replace(/\s+/g, '-');
                    saveSlot(id, newSaveName);
                    alert("Proyek berhasil disimpan!");
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  <span>💾</span> {t('save')}
                </button>
              </div>
            </div>
          </div>

          {/* Load Slots */}
          <div>
            <h3 className="text-stone-300 font-bold mb-3 uppercase text-xs tracking-wider">{t('savedProjects')}</h3>
            {savedSlots.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-stone-700 rounded-xl text-stone-500">
                {t('noSavedProjects')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedSlots.map((slot) => (
                  <div key={slot.id} className="bg-stone-800 border border-stone-700 rounded-xl p-4 flex flex-col hover:border-stone-500 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-stone-200 text-lg truncate pr-4">{slot.name}</h4>
                      <button 
                        onClick={() => {
                          if (confirm(`Hapus proyek '${slot.name}'?`)) deleteSlot(slot.id);
                        }}
                        className="text-stone-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <span>⏱️</span> {formatTime(slot.workTime || 0)}
                        </span>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <span>🧱</span> {slot.blocks.length} blok
                        </span>
                        <span className="text-[10px] text-stone-600 mt-1">{slot.date}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          loadSlot(slot.id);
                          onClose();
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                      >
                        Muat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
