import { useGameStore, BlockType } from '@/store/useGameStore';
import { usePiStore } from '@/store/usePiStore';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const PROFILES: { type: BlockType; name: string; price?: number }[] = [
  { type: 's30', name: 'Profil S 30cm' },
  { type: 's60', name: 'Profil S 60cm' },
  { type: 'plus30', name: 'Profil Plus 30cm' },
  { type: 'plus60', name: 'Profil Plus 60cm' },
  { type: 'c30', name: 'Profil C 30cm' },
  { type: 'c60', name: 'Profil C 60cm' },
  { type: 'l30', name: 'Profil L 30cm' },
  { type: 'l60', name: 'Profil L 60cm' },
  { type: 't30', name: 'Profil T 30cm' },
  { type: 't60', name: 'Profil T 60cm' },
  { type: 'p', name: 'Profil P' },
  { type: 'p2', name: 'Profil P2' },
  { type: 'j', name: 'Profil J' },
  { type: 'j2', name: 'Profil J2' },
  { type: 'j3', name: 'Profil J3' },
  { type: 'pj', name: 'Profil PJ' },
  { type: 'girder', name: 'Girder' },
  { type: 'papanatap', name: 'Papan Atap', price: 0.5 },
  { type: 'alas', name: 'Alas', price: 1 },
  { type: 'alaskode', name: 'Alas Kode', price: 1.5 },
  { type: 'atap', name: 'Atap', price: 2 },
];

export function CataloguePanel() {
  const { selectedBlockType, setSelectedBlockType, clearBlocks, unlockedProfiles, unlockProfile } = useGameStore();
  const { purchaseProfile } = usePiStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleProfileClick = (profile: typeof PROFILES[0]) => {
    if (unlockedProfiles.includes(profile.type)) {
      setSelectedBlockType(profile.type);
      // Auto close on mobile after selection
      if (window.innerWidth < 768) setIsOpen(false);
    } else {
      // Trigger Purchase
      if (!profile.price) return;
      if (confirm(t('buyConfirm', { name: profile.name, price: profile.price }))) {
        setPurchasing(profile.type);
        purchaseProfile(
          profile.type,
          profile.price,
          () => {
            unlockProfile(profile.type);
            setPurchasing(null);
            alert(t('buySuccess', { name: profile.name }));
          },
          (err) => {
            console.error(err);
            setPurchasing(null);
            alert(t('buyFail', { error: err.message }));
          }
        );
      }
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-32 left-4 z-40 bg-stone-800 text-stone-200 px-4 py-2.5 rounded-xl shadow-2xl border flex items-center gap-2 font-bold transition-all ${isOpen ? 'translate-x-[-150%] opacity-0 border-stone-700' : 'translate-x-0 opacity-100 border-amber-600/50 hover:bg-stone-700'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        {t('catalogue')}
      </button>

      <div className={`
        fixed md:absolute md:left-4 md:top-24 md:w-80 md:max-h-[calc(100vh-7rem)]
        ${isOpen ? 'inset-x-0 bottom-0 h-[65vh] rounded-t-3xl border-t' : 'hidden md:flex'}
        bg-stone-800/95 backdrop-blur border-stone-700 md:rounded-xl md:border p-4 pb-[env(safe-area-inset-bottom,1rem)] md:pb-4 flex flex-col pointer-events-auto shadow-2xl z-40 transition-all overflow-hidden
      `}>
        <div className="flex justify-between items-center mb-4 border-b border-stone-700 pb-2 shrink-0">
          <h2 className="text-xl font-bold text-stone-100">{t('catalogueTitle')}</h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-stone-400 hover:text-white">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      
      <div className="mb-4 shrink-0">
        <button
          onClick={() => setSelectedBlockType(null)}
          className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-all ${
            selectedBlockType === null
              ? 'bg-stone-700 border-stone-400 text-white shadow-sm'
              : 'bg-stone-800 border-stone-700 text-stone-400 hover:bg-stone-700'
          }`}
        >
          <span className="text-xl">↖️</span>
          <div>
            <div className="font-bold">{t('freeCursor')}</div>
            <div className="text-xs opacity-80">{t('freeCursorDesc')}</div>
          </div>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-2 pb-8 custom-scrollbar touch-pan-y overscroll-contain">
        {PROFILES.map((profile) => {
          const isUnlocked = unlockedProfiles.includes(profile.type);
          const isSelected = selectedBlockType === profile.type;
          
          return (
            <button
              key={profile.type}
              onClick={() => handleProfileClick(profile)}
              disabled={purchasing === profile.type}
              className={`w-full text-left px-4 py-3 rounded-lg transition border flex justify-between items-center ${
                isSelected
                  ? 'bg-[#c29b62]/20 border-[#c29b62] text-[#e8c792]'
                  : isUnlocked
                    ? 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-700'
                    : 'bg-stone-950 border-stone-800 text-stone-600 hover:border-amber-900/50 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{profile.name}</span>
                {purchasing === profile.type && <span className="text-xs text-amber-500 animate-pulse">({t('buying')})</span>}
              </div>
              {!isUnlocked && (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-900/20 px-2 py-1 rounded text-xs">
                  <span>🔒</span>
                  <span className="font-bold">{profile.price} π</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-stone-700 pb-2 shrink-0">
        <button
          onClick={clearBlocks}
          className="w-full bg-red-900/50 hover:bg-red-800 text-red-200 py-2 rounded-lg transition"
        >
          {t('clearArea')}
        </button>
      </div>
      </div>
    </>
  );
}
