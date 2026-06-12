import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

export function ConstructionTimer() {
  const activeWorkTime = useGameStore((state) => state.activeWorkTime);
  const projectName = useGameStore((state) => state.projectName);
  const incrementWorkTime = useGameStore((state) => state.incrementWorkTime);
  const blocks = useGameStore((state) => state.blocks);

  useEffect(() => {
    // Only increment timer if there are blocks on the canvas (meaning they are actively working)
    // Or if you want to track total session time, just remove the blocks.length check.
    const interval = setInterval(() => {
      incrementWorkTime();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [incrementWorkTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-[72px] left-1/2 -translate-x-1/2 bg-stone-900/80 border border-stone-700/50 backdrop-blur-sm rounded-xl px-4 py-2 flex flex-row items-center gap-4 pointer-events-none z-40 select-none shadow-lg">
      <div className="flex flex-col items-start border-r border-stone-700 pr-4">
        <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Proyek Aktif</span>
        <span className="text-stone-200 text-sm font-bold truncate max-w-[150px]">{projectName}</span>
      </div>
      
      <div className="flex items-center gap-2 border-r border-stone-700 pr-4">
        <span className="text-amber-400 animate-pulse">⏱️</span>
        <span className="text-stone-200 font-mono text-xl font-bold tracking-widest">{formatTime(activeWorkTime)}</span>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-[10px] text-stone-500 uppercase tracking-wider">Progress</span>
        <span className="text-green-400 text-sm font-bold">{blocks.length} Blok</span>
      </div>
    </div>
  );
}
