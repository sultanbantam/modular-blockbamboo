import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'Bambu Asik Joged', src: '/music/bambuasikjoged.mp3' },
  { id: 2, title: 'Bambu Nusa', src: '/music/bambunusa.mp3' },
  { id: 3, title: 'Banten Kidul', src: '/music/bantenkidul.mp3' },
  { id: 4, title: 'Cibarani', src: '/music/cibarani.mp3' },
  { id: 5, title: 'Gunung Liman', src: '/music/gunungliman.mp3' },
  { id: 6, title: 'Perpubi', src: '/music/perpubi.mp3' },
  { id: 7, title: 'Perpubi 2', src: '/music/perpubi2.mp3' },
];

export const MusicPlayer = () => {
  const { 
    isMusicPlaying, 
    currentTrackIndex, 
    musicVolume, 
    setIsMusicPlaying, 
    setCurrentTrackIndex, 
    setMusicVolume 
  } = useGameStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Audio playback failed:", e);
          setIsMusicPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  const togglePlay = () => setIsMusicPlaying(!isMusicPlaying);
  const nextTrack = () => setCurrentTrackIndex((currentTrackIndex + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
  const handleEnded = () => nextTrack();

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onEnded={handleEnded} 
        loop={false}
      />

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`p-3 rounded-full shadow-lg transition-colors ${
            isMusicPlaying ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          {isMusicPlaying ? <Volume2 size={24} /> : <Music size={24} />}
        </button>
      )}

      {isOpen && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl flex flex-col gap-3 min-w-[250px]">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Music size={16} className="text-green-400" />
              SABUMI Radio
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              &times;
            </button>
          </div>

          <div className="text-xs text-gray-400 mb-1 truncate">
            {currentTrack.title}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={prevTrack} className="text-gray-400 hover:text-white">
              <SkipBack size={20} />
            </button>
            <button onClick={togglePlay} className="p-2 bg-green-600 rounded-full text-white hover:bg-green-500 transition">
              {isMusicPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={nextTrack} className="text-gray-400 hover:text-white">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <VolumeX size={14} className="text-gray-500" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={musicVolume} 
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <Volume2 size={14} className="text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};
