import { useGameStore } from '@/store/useGameStore';

export function LevelDisplay({ className = "" }: { className?: string }) {
  const { level, xp } = useGameStore();

  const getTitle = (lvl: number) => {
    if (lvl < 2) return 'Newbie';
    if (lvl >= 20) return 'Undagi';
    const specialistLevel = Math.floor((lvl - 2) / 3) + 1;
    return `Specialist ${specialistLevel}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (xp / 100) * 100));

  return (
    <div className={`flex items-center gap-3 bg-stone-900/90 p-2 pr-4 rounded-xl border border-stone-800 backdrop-blur-md shadow-xl pointer-events-auto ${className}`}>
      {/* Level Badge */}
      <div className="relative w-12 h-12 flex items-center justify-center bg-stone-800 rounded-lg border-2 border-amber-600 shadow-inner">
        <div className="absolute -top-2 -right-2 text-lg">⭐️</div>
        <span className="text-xl font-bold text-amber-500">{level}</span>
      </div>

      {/* Info & Progress */}
      <div className="flex flex-col gap-1 w-32">
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-stone-200">{getTitle(level)}</span>
          <span className="text-xs text-stone-500 font-mono">{Number(xp.toFixed(2))}/100</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-stone-800 rounded-full h-2.5 shadow-inner overflow-hidden border border-stone-700">
          <div 
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
