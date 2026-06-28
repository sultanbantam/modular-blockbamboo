import { useGameStore } from '@/store/useGameStore';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export function MaterialPanel() {
  const blocks = useGameStore((state) => state.blocks);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  // Calculate counts
  const counts = blocks.reduce((acc, block) => {
    acc[block.type] = (acc[block.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button 
        className={`fixed top-20 right-4 z-40 p-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 border flex flex-col items-center gap-1 ${isOpen ? 'bg-amber-600 border-amber-500 text-white translate-x-32 opacity-0' : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:text-amber-400 hover:bg-stone-800'}`}
        onClick={() => setIsOpen(!isOpen)}
        title={t('materialCalcTitle')}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
      </button>

      {/* Sliding Drawer */}
      <div 
        className={`fixed right-0 top-[60px] h-[45vh] w-80 bg-stone-900/95 border-l border-b border-stone-800 p-6 flex flex-col pointer-events-auto shadow-2xl backdrop-blur-xl z-50 transition-transform duration-300 ease-in-out lg:rounded-bl-xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            {t('materialCalcTitle')}
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {blocks.length === 0 ? (
            <div className="text-center p-8 bg-stone-800/50 rounded-xl border border-stone-700/50">
              <p className="text-stone-400 text-sm">{t('noAssembledProfiles')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(counts).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-sm border-b border-stone-800 pb-3 bg-stone-800/30 p-3 rounded-lg">
                  <span className="text-stone-300 font-medium">Profil {type}</span>
                  <span className="font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">{count}x</span>
                </div>
              ))}
              
              <div className="pt-6 mt-4 border-t-2 border-stone-700 flex justify-between items-center font-bold text-lg">
                <span className="text-stone-200">Total Blok</span>
                <span className="text-green-400 bg-green-400/10 px-4 py-1.5 rounded-full">{blocks.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
