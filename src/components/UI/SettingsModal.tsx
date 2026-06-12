import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useGameStore } from '@/store/useGameStore';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showGrid, setShowGrid, gridSize, setGridSize, level } = useGameStore();

  const isLevel1 = level >= 1;
  const isLevel6 = level >= 6;

  const [customInput, setCustomInput] = useState(gridSize.toString());

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-800/50">
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            ⚙️ {t('advancedControls')}
          </h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-700 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Toggle Grid */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-200">{t('showGrid')}</div>
              <div className="text-sm text-stone-400">{t('showGridDesc')}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <hr className="border-stone-800" />

          {/* Grid Size */}
          <div className="space-y-3">
            <div className="font-bold text-stone-200">{t('gridSize')}</div>
            
            {!isLevel1 ? (
              <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-red-200 text-sm flex items-center gap-2">
                <span>🔒</span> {t('gridSizeLocked')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[30, 60, 90, 100].map((size) => (
                    <button
                      key={size}
                      onClick={() => { setGridSize(size); setCustomInput(size.toString()); }}
                      className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all ${
                        gridSize === size
                          ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                          : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {size} x {size} cm
                    </button>
                  ))}
                </div>

                {!isLevel6 ? (
                  <div className="bg-amber-900/20 border border-amber-900/50 p-3 rounded-lg text-amber-200 text-sm flex items-center gap-2">
                    <span>🔒</span> {t('gridCustomLocked')}
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder={t('gridCustomInput')}
                      className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 outline-none focus:border-amber-500"
                    />
                    <span className="text-stone-400 font-bold">cm</span>
                    <button
                      onClick={() => {
                        const val = parseInt(customInput);
                        if (!isNaN(val) && val > 0) setGridSize(val);
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Set
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
