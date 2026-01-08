import React, { useState, useEffect } from 'react';
import SnowCanvas from './components/SnowCanvas';
import MusicPlayer from './components/MusicPlayer';
import { generatePoemBatch, generateSnowmanImage } from './services/geminiService';
import { Sparkles, RefreshCcw, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [snowIntensity, setSnowIntensity] = useState(0.0);
  const [poems, setPoems] = useState<string[]>([]);
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const [isLoadingPoems, setIsLoadingPoems] = useState(false);
  const [isSwitchingPoem, setIsSwitchingPoem] = useState(false); // State for switching animation
  const [hasStarted, setHasStarted] = useState(false);
  const [snowmanUrl, setSnowmanUrl] = useState<string | null>(null);

  // Slowly increase snow intensity over time once started
  useEffect(() => {
    if (!hasStarted) return;

    // Start with light snow
    setSnowIntensity(0.1);

    // Increase gradually to 1.0 over 45 seconds (slower for better atmosphere)
    const interval = setInterval(() => {
      setSnowIntensity(prev => {
        if (prev >= 1.0) {
          clearInterval(interval);
          return 1.0;
        }
        return prev + 0.003; // Even slower increment
      });
    }, 100);

    return () => clearInterval(interval);
  }, [hasStarted]);

  // Initial poem batch and image load
  useEffect(() => {
    loadPoemBatch();
    handleGenerateSnowman();
  }, []);

  const loadPoemBatch = async () => {
    setIsLoadingPoems(true);
    const batch = await generatePoemBatch();
    if (batch.length > 0) {
      setPoems(batch);
      setCurrentPoemIndex(0);
    }
    setIsLoadingPoems(false);
  };

  const handleNextPoem = () => {
    if (poems.length === 0 || isSwitchingPoem) return;
    
    // Start switching animation
    setIsSwitchingPoem(true);

    // Artificial delay to create a "loading" feel
    setTimeout(() => {
      setCurrentPoemIndex((prev) => (prev + 1) % poems.length);
      // End switching animation after state update allows render
      setTimeout(() => {
          setIsSwitchingPoem(false);
      }, 100); 
    }, 600);
  };

  const handleGenerateSnowman = async () => {
    const url = await generateSnowmanImage();
    if (url) {
      setSnowmanUrl(url);
    }
  };

  const startExperience = () => {
    setHasStarted(true);
  };

  const currentPoem = poems[currentPoemIndex] || "雪花飘落，\n思念如诗...";

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#0b1026] via-[#162044] to-[#25325c] overflow-hidden text-white selection:bg-blue-500/30">
      {/* Background Visuals: Atmospheric Moonlight */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Main Light Source Glow (Top Right) */}
        <div className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] bg-radial-gradient from-blue-100/10 via-blue-500/5 to-transparent blur-3xl rounded-full opacity-60"></div>
        
        {/* Light Beams / God Rays */}
        <div className="absolute top-0 right-0 w-full h-full">
           <div className="absolute -top-20 right-[10%] w-40 h-[120vh] bg-gradient-to-b from-blue-100/5 to-transparent rotate-[25deg] blur-2xl origin-top animate-pulse-slow"></div>
           <div className="absolute -top-20 right-[25%] w-60 h-[120vh] bg-gradient-to-b from-blue-100/3 to-transparent rotate-[30deg] blur-3xl origin-top"></div>
           <div className="absolute -top-20 right-[-5%] w-32 h-[120vh] bg-gradient-to-b from-blue-100/5 to-transparent rotate-[20deg] blur-xl origin-top animate-pulse-slower"></div>
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/70"></div>
      </div>

      {/* Snow System */}
      <SnowCanvas intensity={snowIntensity} />
      
      {/* AI Generated Snowman (Fixed Bottom Left) */}
      {snowmanUrl && (
        <div className="fixed bottom-0 left-4 md:left-24 z-10 pointer-events-auto transition-all duration-1000 animate-fade-in hidden sm:block">
           {/* 
             mix-blend-screen with a pure black generated background creates a perfect transparency effect.
             Using opacity-80 makes it look slightly ethereal/ghostly which fits the romantic theme.
           */}
           <div className="relative w-64 h-64 md:w-96 md:h-96 mix-blend-screen opacity-90 animate-float hover:scale-105 transition-transform duration-500 origin-bottom">
             <img 
               src={snowmanUrl} 
               alt="Cute AI Snowman" 
               className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(150,200,255,0.4)]"
             />
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center pointer-events-none">
        
        {/* Intro Screen */}
        {!hasStarted ? (
          <div className="animate-fade-in space-y-8 p-10 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/5 shadow-2xl max-w-md pointer-events-auto">
            <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white drop-shadow-lg">
              冬日恋歌
            </h1>
            <p className="text-blue-200/80 font-light leading-relaxed">
              戴上耳机，<br/>
              感受雪花慢慢飘落的浪漫。<br/>
              试着触摸那些飘落的雪花...
            </p>
            <button 
              onClick={startExperience}
              className="group relative px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition-all duration-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <span className="flex items-center gap-2 text-lg tracking-widest font-light">
                <Sparkles size={18} className="text-blue-300 group-hover:rotate-12 transition-transform" />
                开启浪漫
              </span>
            </button>
          </div>
        ) : (
          /* Main Experience */
          <div className="max-w-2xl w-full animate-fade-in-slow space-y-12 pointer-events-auto">
            
            {/* AI Poem Card */}
            <div className="relative group perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-indigo-500/20 to-cyan-400/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative px-8 py-12 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                
                {/* Decorative Elements */}
                <Heart className="absolute -top-4 -left-4 text-cyan-400/50 rotate-[-15deg] animate-pulse" size={32} />
                <Heart className="absolute -bottom-4 -right-4 text-indigo-400/50 rotate-[15deg] animate-pulse delay-700" size={24} />

                <div className="min-h-[180px] flex items-center justify-center relative">
                  {/* Initial Loading State */}
                  {isLoadingPoems && poems.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-white/50">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-sm font-light tracking-wider">正在为你写诗...</span>
                    </div>
                  ) : (
                    <div className="w-full relative">
                       {/* 
                          Container controls opacity. 
                          When switching, opacity goes to 0. 
                          When finished, opacity goes back to 100.
                       */}
                       <div className={`space-y-4 transition-all duration-500 ease-in-out transform ${isSwitchingPoem ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                          {currentPoem.split('\n').map((line, index) => (
                              <p 
                              key={index} 
                              className="text-xl md:text-2xl font-serif text-blue-50 leading-loose drop-shadow-md"
                              >
                              {line}
                              </p>
                          ))}
                       </div>
                       
                       {/* Optional Loading Spinner centered over content while switching */}
                       {isSwitchingPoem && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                         </div>
                       )}
                    </div>
                  )}
                </div>

                {/* Generator Button */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={handleNextPoem}
                    disabled={isSwitchingPoem}
                    className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all group/btn"
                    title="下一首"
                  >
                    <RefreshCcw size={18} className={`transition-transform duration-700 ${isSwitchingPoem ? 'animate-spin' : 'group-hover/btn:rotate-180'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Atmosphere Text */}
            <div className="text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity duration-700">
              <p className="text-sm font-light tracking-[0.2em] text-blue-200">
                雪势: {Math.floor(snowIntensity * 100)}%
              </p>
              <p className="text-xs font-light text-blue-300/50">
                Gemini AI 驱动
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Music Player Control */}
      {hasStarted && <MusicPlayer onPlayStateChange={() => {}} />}
      
      {/* Global Styles for Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slower {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default App;