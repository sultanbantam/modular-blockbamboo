"use client";
import { useGameStore } from '@/store/useGameStore';

import { useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';

export function AdvancedControls() {
  const { 
    blocks, editingId, customRotation, setCustomRotation, flipAxis, setFlipAxis, 
    selectedBlockType, updateBlockPosition, updateBlockRotation, updateBlockScale, 
    transformMode, setTransformMode, duplicateBlock,
    level, gridSize, showGrid, setGridSize, setShowGrid
  } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const editingBlock = editingId ? blocks.find(b => b.id === editingId) : null;

  if (!selectedBlockType && !editingBlock) return null;

  // Derive display values depending on whether we are editing an existing block or preparing a new one
  const rotX = editingBlock ? Math.round((editingBlock.rotation[0] * 180) / Math.PI) : customRotation[0];
  const rotY = editingBlock ? Math.round((editingBlock.rotation[1] * 180) / Math.PI) : customRotation[1];
  const rotZ = editingBlock ? Math.round((editingBlock.rotation[2] * 180) / Math.PI) : customRotation[2];
  
  const currentFlipAxis = editingBlock 
    ? (editingBlock.scale?.[0] === -1 ? 'x' : editingBlock.scale?.[1] === -1 ? 'y' : editingBlock.scale?.[2] === -1 ? 'z' : null)
    : flipAxis;

  const handleRotationChange = (axis: 'x'|'y'|'z', val: number) => {
    if (editingBlock) {
      const newRot = [...editingBlock.rotation] as [number, number, number];
      if (axis === 'x') newRot[0] = (val * Math.PI) / 180;
      if (axis === 'y') newRot[1] = (val * Math.PI) / 180;
      if (axis === 'z') newRot[2] = (val * Math.PI) / 180;
      updateBlockRotation(editingBlock.id, newRot);
    } else {
      setCustomRotation(axis, val);
    }
  };

  const handlePositionChange = (axis: 0|1|2, val: number) => {
    if (editingBlock) {
      const newPos = [...editingBlock.position] as [number, number, number];
      newPos[axis] = val;
      updateBlockPosition(editingBlock.id, newPos);
    }
  };

  const handleFlipToggle = () => {
    let nextAxis: 'x' | 'y' | 'z' | null = null;
    if (currentFlipAxis === null) nextAxis = 'x';
    else if (currentFlipAxis === 'x') nextAxis = 'y';
    else if (currentFlipAxis === 'y') nextAxis = 'z';
    else nextAxis = null;

    if (editingBlock) {
      updateBlockScale(editingBlock.id, nextAxis === 'x' ? [-1, 1, 1] : nextAxis === 'y' ? [1, -1, 1] : nextAxis === 'z' ? [1, 1, -1] : [1, 1, 1]);
    } else {
      setFlipAxis(nextAxis);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button 
        className={`fixed bottom-24 right-4 lg:bottom-4 lg:right-4 z-40 p-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 border flex flex-col items-center gap-1 ${isOpen ? 'bg-amber-600 border-amber-500 text-white translate-x-32 opacity-0' : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:text-amber-400 hover:bg-stone-800 animate-pulse'}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Properti Blok"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>

      {/* Sliding Drawer */}
      <div 
        className={`fixed right-0 bottom-0 lg:top-auto h-[50vh] lg:h-[45vh] lg:bottom-4 w-full lg:w-72 bg-stone-900/95 border-t lg:border-l lg:border-t-stone-800 border-stone-800 p-6 flex flex-col pointer-events-auto shadow-2xl backdrop-blur-xl z-50 transition-transform duration-300 ease-in-out lg:rounded-l-xl ${isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-4 border-b border-stone-700 pb-2">
          <h3 className="text-md font-bold text-stone-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {editingBlock ? 'Properti Blok' : 'Rotasi Kustom & Flip'}
          </h3>
          <div className="flex items-center gap-2">
            {editingBlock && (
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Edit Mode</span>
            )}
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-stone-400 hover:text-white bg-stone-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
          {editingBlock && (
            <div>
              <p className="text-xs text-stone-400 mb-2 font-semibold">POSISI (METER)</p>
              <div className="grid grid-cols-3 gap-2">
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <div key={axis} className="flex flex-col">
                    <label className="text-[10px] text-stone-500 mb-0.5">{axis}</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editingBlock.position[i as 0|1|2]}
                      onChange={(e) => handlePositionChange(i as 0|1|2, parseFloat(e.target.value) || 0)}
                      className="bg-stone-900 border border-stone-700 rounded px-1.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-stone-400 mb-2 font-semibold">SUDUT ROTASI (DERAJAT)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'X', val: rotX },
                { label: 'Y', val: rotY },
                { label: 'Z', val: rotZ }
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <label className="text-[10px] text-stone-500 mb-0.5">{item.label}°</label>
                  <input
                    type="number"
                    value={item.val}
                    onChange={(e) => handleRotationChange(item.label.toLowerCase() as 'x'|'y'|'z', parseFloat(e.target.value) || 0)}
                    className="bg-stone-900 border border-stone-700 rounded px-1.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleFlipToggle}
            className={`w-full py-3 rounded-lg border transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
              currentFlipAxis 
                ? currentFlipAxis === 'x' ? 'bg-red-600/20 border-red-500 text-red-200' 
                  : currentFlipAxis === 'y' ? 'bg-green-600/20 border-green-500 text-green-200'
                  : 'bg-blue-600/20 border-blue-500 text-blue-200'
                : 'bg-stone-700 border-stone-600 text-stone-300 hover:bg-stone-600'
            }`}
          >
            <span className="text-lg">🔁</span>
            {!currentFlipAxis && 'Flip Normal'}
            {currentFlipAxis === 'x' && 'Flip Merah (X)'}
            {currentFlipAxis === 'y' && 'Flip Hijau (Y)'}
            {currentFlipAxis === 'z' && 'Flip Biru (Z)'}
          </button>

          {editingBlock && (
            <div className="pt-4 border-t border-stone-700 flex flex-col gap-2">
              <p className="text-xs text-stone-400 font-semibold mb-1">GIZMO 3D INTERAKTIF</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTransformMode('translate')}
                  className={`flex-1 py-2 rounded border text-xs font-bold transition-colors ${transformMode === 'translate' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-stone-700 border-stone-600 text-stone-300'}`}
                >
                  GIZMO GESER
                </button>
                <button
                  onClick={() => setTransformMode('rotate')}
                  className={`flex-1 py-2 rounded border text-xs font-bold transition-colors ${transformMode === 'rotate' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-stone-700 border-stone-600 text-stone-300'}`}
                >
                  GIZMO PUTAR
                </button>
              </div>
              
              <button
                onClick={() => duplicateBlock(editingBlock.id)}
                className="w-full py-3 mt-2 rounded bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <span>📋</span> Gandakan Blok (Clone)
              </button>
            </div>
          )}

          {/* Grid Settings */}
          <div className="pt-4 border-t border-stone-700 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-stone-400 font-semibold">{t('advancedControls').toUpperCase()}</p>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                type="checkbox" 
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-stone-600 text-amber-600 focus:ring-amber-500 bg-stone-800"
              />
              <span className="text-stone-300">{t('showGrid')}</span>
            </label>

            <div className="flex flex-col gap-1 mt-2">
              <label className="text-xs text-stone-500">{t('gridSize')}</label>
              {level < 2 ? (
                <div className="bg-stone-800 border border-stone-700 text-stone-500 px-3 py-2 rounded text-sm flex items-center justify-between opacity-70">
                  <span>30 cm</span>
                  <span className="text-[10px]">🔒 {t('gridSizeLocked')}</span>
                </div>
              ) : level < 17 ? (
                <select 
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value={30}>30 cm</option>
                  <option value={60}>60 cm</option>
                  <option value={90}>90 cm</option>
                  <option value={100}>100 cm (1m)</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <select 
                    value={[30,60,90,100].includes(gridSize) ? gridSize : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') setGridSize(Number(e.target.value));
                    }}
                    className="flex-1 bg-stone-900 border border-stone-700 rounded px-2 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={30}>30 cm</option>
                    <option value={60}>60 cm</option>
                    <option value={90}>90 cm</option>
                    <option value={100}>100 cm (1m)</option>
                    <option value="custom">Custom...</option>
                  </select>
                  <input
                    type="number"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value) || 30)}
                    placeholder={t('gridCustomInput')}
                    className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-stone-500 leading-tight mt-4 bg-stone-800/30 p-2 rounded">
            {editingBlock 
              ? "Tarik gizmo untuk memindah/memutar. Tekan Shift+WASDQE untuk geser 1mm. Tekan F untuk menyedot magnet otomatis (Auto-Snap) saat titik sudut berubah HIJAU!"
              : "Gunakan pengaturan ini untuk mengatur kemiringan profil atap sebelum dipasang."
            }
          </p>
        </div>
      </div>
    </>
  );
}
