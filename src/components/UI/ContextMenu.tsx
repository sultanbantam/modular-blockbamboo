"use client";
import { useGameStore } from '@/store/useGameStore';
import { useEffect } from 'react';

export default function ContextMenu() {
  const { contextMenu, setContextMenu, removeBlock, setDraggingId, setEditingId, blocks } = useGameStore();

  useEffect(() => {
    const handlePointerDown = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    }
  }, [contextMenu, setContextMenu]);

  if (!contextMenu.visible || !contextMenu.blockId) return null;

  const block = blocks.find(b => b.id === contextMenu.blockId);
  if (!block) return null;

  return (
    <div 
      className="fixed z-50 bg-stone-800 border border-stone-600 rounded-md shadow-xl py-1 w-32 animate-in fade-in zoom-in-95 duration-100"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button 
        className="w-full text-left px-4 py-2 text-sm text-stone-200 hover:bg-stone-700 transition"
        onClick={() => {
          setDraggingId(contextMenu.blockId);
          setContextMenu({ ...contextMenu, visible: false });
        }}
      >
        Pindahkan
      </button>
      <button 
        className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-stone-700 transition"
        onClick={() => {
          setEditingId(contextMenu.blockId!);
          setContextMenu({ ...contextMenu, visible: false });
        }}
      >
        Edit
      </button>
      <div className="h-px bg-stone-600 my-1 mx-2" />
      <button 
        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-stone-700 transition"
        onClick={() => {
          removeBlock(contextMenu.blockId!);
          setContextMenu({ ...contextMenu, visible: false });
        }}
      >
        Hapus
      </button>
    </div>
  );
}
