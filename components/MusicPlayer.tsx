import React, { useRef, useState, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface MusicPlayerProps {
  onPlayStateChange: (isPlaying: boolean) => void;
  autoPlay?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onPlayStateChange, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 使用本地抒情音乐文件
  const audioSrc = "/snowNight.mp3"; 

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

  // 自动播放功能
  useEffect(() => {
    if (autoPlay && audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          onPlayStateChange(true);
        })
        .catch(e => console.error("Autoplay prevented:", e));
    }
  }, [autoPlay, isPlaying, onPlayStateChange]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/30 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg animate-fade-in-up">
      <audio ref={audioRef} src={audioSrc} />

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