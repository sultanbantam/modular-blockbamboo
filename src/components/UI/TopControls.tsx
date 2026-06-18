import { useGameStore } from '@/store/useGameStore';
import { useState } from 'react';
import { PiDashboard } from './PiDashboard';
import { SaveLoadModal } from './SaveLoadModal';
import { ProjectManagerModal } from './ProjectManagerModal';
import { LevelDisplay } from './LevelDisplay';
import { MultiplayerLobby } from './MultiplayerLobby';
import { useTranslation } from '@/hooks/useTranslation';
import { TRANSLATIONS } from '@/store/translations';
import { SettingsModal } from './SettingsModal';

export function TopControls() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const { 
    isPanMode, setPanMode, 
    undo, redo, pastBlocks, futureBlocks,
    showHelpers, setShowHelpers,
    setCameraView, level, roomId, onlineUsers,
    language, setLanguage,
    activeSabumiLandId, blocks, setActiveSabumiLandId
  } = useGameStore();

  const { t } = useTranslation();

  const isUndoRedoLocked = level < 3;

  return (
    <>
      <header className="absolute top-0 left-0 w-full z-50 bg-stone-900/95 border-b border-stone-800 backdrop-blur-md shadow-lg flex flex-wrap lg:flex-nowrap justify-between items-center px-4 py-2 pointer-events-auto">
        
        {/* Left: Logo & Level */}
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-start mb-2 lg:mb-0 overflow-hidden">
          <div className="flex items-center gap-3 shrink-0">
            <img src="/logo.png" alt="enPIneering Logo" className="h-10 md:h-14 w-auto object-contain drop-shadow-md" />
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold text-green-500 drop-shadow-md leading-tight truncate">{t('appTitle')}</h1>
              <p className="text-xs text-stone-300 truncate">{t('appSubtitle')}</p>
            </div>
          </div>
          
          <div className="block scale-90 origin-right lg:scale-100 shrink-0 ml-auto lg:ml-0">
            <LevelDisplay className="border-none shadow-none bg-stone-800/50 py-1" />
          </div>
        </div>

        {/* Right: Toolbar */}
        <div className="flex gap-2 items-center overflow-x-auto custom-scrollbar w-full lg:w-auto pb-1 lg:pb-0 pt-2 lg:pt-0">
          
          {/* Settings & Language */}
          <div className="flex gap-1 border-r border-stone-700 pr-2">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).setShowGallery) {
                  (window as any).setShowGallery(true);
                }
              }}
              className="p-1.5 rounded transition-colors text-stone-300 hover:bg-stone-800 hover:text-amber-400"
              title={t('gallery')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
            <button 
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="px-2 py-1 bg-stone-800 rounded hover:bg-stone-700 font-bold flex items-center gap-1 text-sm text-stone-200"
              title="Change Language"
            >
              {language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded transition-colors text-stone-300 hover:bg-stone-800 hover:text-white"
              title={t('advancedControls')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('blockbamboo-tutorial-seen');
                window.location.reload();
              }}
              className="p-1.5 rounded transition-colors text-stone-300 hover:bg-stone-800 hover:text-white"
              title="Help / Tutorial"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>

          {/* History Group */}
          {/* Project Management & Sabumi Button */}
          <div className="flex gap-1 border-r border-stone-700 pr-2 mr-2">
            {activeSabumiLandId ? (
              <button 
                onClick={() => {
                  import('@/store/useSabumiStore').then(({ useSabumiStore }) => {
                    useSabumiStore.getState().saveCustomBlocksToLand(activeSabumiLandId, blocks);
                    setActiveSabumiLandId(null);
                    useSabumiStore.getState().setIsSabumiMode(true);
                  });
                }}
                className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-500 font-bold flex items-center gap-1 text-sm text-yellow-100 shadow-[0_0_10px_rgba(202,138,4,0.5)] border border-yellow-400"
                title="Simpan & Kembali ke Sabumi"
              >
                <span>💾</span> Simpan ke Sabumi
              </button>
            ) : (
              <button 
                onClick={() => {
                  import('@/store/useSabumiStore').then(({ useSabumiStore }) => {
                    useSabumiStore.getState().setIsSabumiMode(true);
                  });
                }}
                className="px-3 py-1 bg-green-800 rounded hover:bg-green-700 font-bold flex items-center gap-1 text-sm text-green-100"
                title="Masuk ke Desa SABUMI"
              >
                <span>🏡</span> SABUMI
              </button>
            )}
            <button 
              onClick={() => setShowProjectModal(true)}
              className="px-3 py-1 bg-stone-800 rounded hover:bg-stone-700 font-bold flex items-center gap-1 text-sm text-stone-200"
              title="Simpan / Muat Proyek"
            >
              <span>💾</span> Proyek
            </button>
          </div>

          <div className="flex gap-2 bg-stone-800/80 p-1.5 rounded-lg border border-stone-700/50">
            <button 
              onClick={undo}
              disabled={isUndoRedoLocked || pastBlocks.length === 0}
              className={`p-1.5 rounded transition-colors ${isUndoRedoLocked || pastBlocks.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-700 text-stone-200'}`}
              title={t('undo')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </button>
            <button 
              onClick={redo}
              disabled={isUndoRedoLocked || futureBlocks.length === 0}
              className={`p-1.5 rounded transition-colors ${isUndoRedoLocked || futureBlocks.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-700 text-stone-200'}`}
              title={t('redo')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
            </button>
          </div>

          {/* Save / Load Group */}
          <div className="flex gap-1 border-r border-stone-700 pr-2">
            <button 
              onClick={() => setShowSaveModal(true)}
              className="p-1.5 rounded transition-colors text-stone-300 hover:bg-stone-800 hover:text-amber-400"
              title={t('saveLoad')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </button>
            <button 
              onClick={() => setShowMultiplayerLobby(true)}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 ${roomId ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'text-stone-300 hover:bg-stone-800 hover:text-blue-400'}`}
              title={t('multiplayer')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {roomId && <span className="text-xs font-bold px-1">{onlineUsers.length}</span>}
            </button>
          </div>

          {/* Tools Group */}
          <div className="flex gap-1 border-r border-stone-700 pr-2">
            <button 
              onClick={() => setPanMode(!isPanMode)}
              className={`p-1.5 rounded transition-colors ${isPanMode ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800 hover:text-white'}`}
              title={t('panMode')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            </button>
            <button 
              onClick={() => setShowHelpers(!showHelpers)}
              className={`p-1.5 rounded transition-colors ${showHelpers ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800 hover:text-white'}`}
              title={t('snapToggle')}
            >
              {showHelpers ? 
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                :
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              }
            </button>
          </div>

          {/* Camera Group */}
          <div className="flex gap-1 border-r border-stone-700 pr-2">
            {(['atas', 'depan', 'blkng', 'kiri', 'kanan'] as const).map((view) => (
              <button 
                key={view}
                onClick={() => setCameraView(view)}
                className="px-2 py-1 text-xs rounded transition-colors text-stone-300 hover:bg-stone-800 hover:text-white font-mono"
              >
                {t(`cam_${view}` as keyof typeof TRANSLATIONS['id'])}
              </button>
            ))}
            <button 
                onClick={() => setCameraView('reset')}
                className="p-1.5 rounded transition-colors text-stone-400 hover:bg-stone-800 hover:text-white"
                title={t('resetCamera')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          {/* Pi Wallet Integration */}
          <div className="flex gap-1 pl-1">
            <button 
              onClick={() => setShowDashboard(true)}
              className="p-1.5 flex items-center gap-2 rounded transition-colors text-purple-400 hover:bg-stone-800"
              title={t('wallet')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-bold hidden xl:block text-sm">{t('wallet')}</span>
            </button>
          </div>
        </div>
      </header>

      {showDashboard && <PiDashboard onClose={() => setShowDashboard(false)} />}
      {showSaveModal && <SaveLoadModal onClose={() => setShowSaveModal(false)} />}
      {showProjectModal && <ProjectManagerModal onClose={() => setShowProjectModal(false)} />}
      {showMultiplayerLobby && <MultiplayerLobby onClose={() => setShowMultiplayerLobby(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </>
  );
}
