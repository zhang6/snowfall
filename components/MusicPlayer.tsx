import React, { useRef, useState, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface MusicPlayerProps {
  onPlayStateChange: (isPlaying: boolean) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onPlayStateChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // A royalty-free soothing piano track suitable for winter atmosphere
  // Source: Kevin MacLeod - "Winter Reflections" (Using a reliable placeholder for demo)
  // In a real app, this would be a local asset or verified CDN link.
  const audioSrc = "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3"; 

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Autoplay prevented:", e));
    }
    setIsPlaying(!isPlaying);
    onPlayStateChange(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5; // Start at 50%
      audioRef.current.loop = true;
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-black/30 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-lg animate-fade-in-up">
      <audio ref={audioRef} src={audioSrc} />
      
      <div className="flex flex-col mr-2">
        <span className="text-white text-xs font-light opacity-80">氛围音乐</span>
        <span className="text-white text-[10px] opacity-60">Winter Piano</span>
      </div>

      <button 
        onClick={toggleMute}
        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <button 
        onClick={togglePlay}
        className="bg-white text-slate-900 p-3 rounded-full hover:bg-slate-200 transition-all transform hover:scale-105 shadow-md"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
      </button>
    </div>
  );
};

export default MusicPlayer;