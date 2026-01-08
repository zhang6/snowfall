import React, { useState, useEffect } from 'react';
import SnowCanvas from './components/SnowCanvas';
import MusicPlayer from './components/MusicPlayer';
import { Sparkles, Feather, CloudSnow } from 'lucide-react';
import { recordVisit, collectVisitInfo } from './services/supabaseService';

// 预设的20首关于"凤"与"雪"的浪漫文案
const STATIC_POEMS = [
  "若世界必须严寒，\n我愿替你\n先一步结霜。",
  "雪落满城，\n你站在原地，\n我忽然明白，\n为何凤会低飞。",
  "凤羽掠过雪夜，\n不是为了天空，\n而是为了\n你抬头的那一瞬。",
  "你不说话，\n我却听见\n冰层碎裂的声音。",
  "雪白漫长，\n你一句\"别走\"，\n让我学会\n怎样燃烧而不伤人。",
  "凤不问结局，\n雪不问来处，\n我只问，\n你是否回头。",
  "你站在寒风里，\n我却从未觉得冷，\n原来靠近\n本身就是火。",
  "雪落在你睫毛，\n我忽然想停在此处，\n不再飞，\n不再躲。",
  "凤火熄灭前，\n会留下些什么？\n也许是\n你唤我名字的声音。",
  "你转身那刻，\n雪开始下，\n我知道有些炽热\n已无法收回。",
  "我曾害怕寒冬，\n直到你出现，\n让我学会\n如何拥抱雪。",
  "凤影落在你身旁，\n不是偶然，\n是我所有选择\n汇聚成的方向。",
  "雪覆盖万物，\n却没能掩住\n我望向你的目光。",
  "你在雪中走来，\n凤便失去了高度，\n原来心，\n会自行降落。",
  "若时间结冰，\n我愿替你\n保留一片余温。",
  "你离得越近，\n我越安静，\n所有炽热\n都变得小心。",
  "雪夜尽头，\n凤回头一次，\n便足够\n走完余生。",
  "当最后一片雪融化，\n你仍在我身旁，\n那一刻，\n无需任何词语。"
];

const generatePoemBatch = async (theme: string = "snow"): Promise<string[]> => {
  return Promise.resolve(STATIC_POEMS);
};

// 使用本地的凤凰图片
const USER_PHOENIX_URL = "/a.png";

const App: React.FC = () => {
  const [snowIntensity, setSnowIntensity] = useState(0.0);
  const [poems, setPoems] = useState<string[]>([]);
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const [isLoadingPoems, setIsLoadingPoems] = useState(false);
  const [isSwitchingPoem, setIsSwitchingPoem] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // 确保初始值为 false，显示入梦按钮
  const [phoenixUrl, setPhoenixUrl] = useState<string | null>(null);
  const [userHasAdjustedSnow, setUserHasAdjustedSnow] = useState(false);
  const [showSnowControl, setShowSnowControl] = useState(false);
  const [displayedText, setDisplayedText] = useState<string>('');

  // Slowly increase snow intensity over time once started, unless user takes control
  useEffect(() => {
    if (!hasStarted || userHasAdjustedSnow) return;

    setSnowIntensity(0.1);

    const interval = setInterval(() => {
      setSnowIntensity(prev => {
        if (prev >= 1.0) {
          clearInterval(interval);
          return 1.0;
        }
        return prev + 0.003;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [hasStarted, userHasAdjustedSnow]);

  // Initial poem batch and image load
  useEffect(() => {
    loadPoemBatch();
    // 使用静态图片，不再调用AI生成
    setPhoenixUrl(USER_PHOENIX_URL);
    // 确保初始状态：hasStarted 为 false，显示入梦按钮
    setHasStarted(false);
  }, []);

  // 记录访问信息（访问根目录时）
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '') {
      (async () => {
        const visitData = await collectVisitInfo(currentPath);
        recordVisit(visitData);
      })();
    }
  }, []);

  // 计算当前诗歌
  const currentPoem = poems[currentPoemIndex] || "凤舞雪落，\n思念如诗...";

  // 打字机效果：当 currentPoem 变化时，逐字显示
  useEffect(() => {
    if (!currentPoem || currentPoem === "凤舞雪落，\n思念如诗...") {
      // 如果是默认文案，直接显示
      if (currentPoem === "凤舞雪落，\n思念如诗...") {
        setDisplayedText(currentPoem);
      } else {
        setDisplayedText('');
      }
      setIsSwitchingPoem(false);
      return;
    }

    setDisplayedText('');
    setIsSwitchingPoem(false);
    
    let currentIndex = 0;
    const fullText = currentPoem;
    let timeoutId: NodeJS.Timeout | null = null;
    
    // 计算打字速度：中文字符稍慢，标点符号稍快，换行需要停顿
    const getTypingDelay = (char: string): number => {
      if (char === '\n') return 150; // 换行稍作停顿
      if (/[，。！？；：]/.test(char)) return 120; // 标点符号稍快
      if (/[\u4e00-\u9fa5]/.test(char)) return 80; // 中文字符
      return 50; // 其他字符（如空格、英文）
    };

    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        if (currentIndex < fullText.length) {
          const delay = getTypingDelay(fullText[currentIndex - 1]);
          timeoutId = setTimeout(typeNextChar, delay);
        }
      }
    };

    // 延迟一点开始打字，让切换动画更平滑
    const timer = setTimeout(() => {
      typeNextChar();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentPoem]);

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
    
    setIsSwitchingPoem(true);
    setDisplayedText(''); // 清空当前显示的文字

    setTimeout(() => {
      setCurrentPoemIndex((prev) => (prev + 1) % poems.length);
    }, 300);
  };

  const startExperience = () => {
    setHasStarted(true);
  };

  const handleSnowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserHasAdjustedSnow(true);
    setSnowIntensity(parseFloat(e.target.value));
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#0b1026] via-[#162044] to-[#25325c] overflow-hidden text-white selection:bg-indigo-500/30">
      {/* Background Visuals: Atmospheric Moonlight */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Main Light Source Glow (Top Right) */}
        <div className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] bg-radial-gradient from-indigo-200/10 via-blue-600/5 to-transparent blur-3xl rounded-full opacity-60"></div>
        
        {/* Light Beams / God Rays - Adjusted for a more mystical vibe */}
        <div className="absolute top-0 right-0 w-full h-full">
           <div className="absolute -top-20 right-[10%] w-40 h-[120vh] bg-gradient-to-b from-amber-100/5 to-transparent rotate-[25deg] blur-2xl origin-top animate-pulse-slow"></div>
           <div className="absolute -top-20 right-[25%] w-60 h-[120vh] bg-gradient-to-b from-blue-100/3 to-transparent rotate-[30deg] blur-3xl origin-top"></div>
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80"></div>
      </div>

      {/* Snow System */}
      <SnowCanvas intensity={snowIntensity} />
      
      {/* Static Phoenix Image (Fixed Bottom Left) */}
      {/* Using static user image instead of generated one */}
      {phoenixUrl && (
        <div className="fixed bottom-0 left-[-20px] sm:left-[-10px] md:left-0 z-30 pointer-events-none transition-all duration-1000 animate-fade-in">
           <div className="relative w-48 h-48 sm:w-72 sm:h-72 md:w-[600px] md:h-[600px] mix-blend-screen opacity-90 animate-float origin-bottom pointer-events-auto">
             <img 
               src={phoenixUrl} 
               alt="Mystical Phoenix" 
               className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(100,200,255,0.4)]"
             />
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center pointer-events-none">
        
        {/* Intro Screen - 确保初始状态显示入梦按钮 */}
        {!hasStarted ? (
          <div className="space-y-8 p-10 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl max-w-md pointer-events-auto animate-fade-in" style={{ opacity: 1, zIndex: 30 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-blue-200 drop-shadow-lg">
              凤求凰 · 雪
            </h1>
            <p className="text-blue-100/80 font-light leading-relaxed">
              戴上耳机，<br/>
              听风雪中的凤鸣。<br/>
              感受那穿越千年的浪漫...
            </p>
            <button 
              onClick={startExperience}
              className="group relative px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition-all duration-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <span className="flex items-center gap-2 text-lg tracking-widest font-light text-white">
                <Feather size={18} className="text-amber-200 group-hover:rotate-12 transition-transform" />
                入梦
              </span>
            </button>
          </div>
        ) : (
          /* Main Experience */
          <div className="max-w-2xl w-full animate-fade-in-slow space-y-12 pointer-events-auto">
            
            {/* AI Poem Card */}
            <div className="relative group perspective-1000">
              {/* Card Glow Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/10 via-indigo-500/10 to-blue-300/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-1000"></div>
              
              <div 
                className="relative px-8 py-12 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl cursor-pointer"
                onClick={handleNextPoem}
              >
                
                {/* Decorative Elements */}
                <Feather className="absolute -top-4 -left-4 text-white/20 rotate-[-45deg] animate-pulse" size={32} />
                <Sparkles className="absolute -bottom-4 -right-4 text-blue-200/20 rotate-[15deg] animate-pulse delay-700" size={24} />

                <div className="min-h-[180px] flex items-center justify-center relative">
                  {/* Initial Loading State */}
                  {isLoadingPoems && poems.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-white/50">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-sm font-light tracking-wider">正在唤醒灵感...</span>
                    </div>
                  ) : (
                    <div className="w-full relative">
                       <div className={`space-y-4 transition-opacity duration-300 ease-in-out ${isSwitchingPoem ? 'opacity-0' : 'opacity-100'}`}>
                          {displayedText ? (
                            displayedText.split('\n').map((line, index, array) => {
                              const isLastLine = index === array.length - 1;
                              const isTyping = displayedText.length < currentPoem.length;
                              return (
                                <p 
                                key={index} 
                                className="text-xl md:text-3xl font-serif text-white/95 leading-relaxed tracking-wide text-glow animate-breath"
                                >
                                {line}
                                {/* 只在最后一行且正在打字时显示光标 */}
                                {isLastLine && isTyping && (
                                  <span className="inline-block w-0.5 h-[1.2em] bg-white/80 ml-1 align-middle" style={{ animation: 'blink 1s infinite' }}></span>
                                )}
                                </p>
                              );
                            })
                          ) : (
                            // 如果 displayedText 为空，显示默认文案或光标
                            <p className="text-xl md:text-3xl font-serif text-white/95 leading-relaxed tracking-wide text-glow animate-breath">
                              <span className="inline-block w-0.5 h-[1.2em] bg-white/80 ml-1 align-middle" style={{ animation: 'blink 1s infinite' }}></span>
                            </p>
                          )}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Floating Controls Area (Bottom Right) */}
      {hasStarted && (
        <>
          {/* Snow Control (Above Music Player) */}
          <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Slider Panel (Collapsible) */}
            <div className={`
              transition-all duration-300 ease-out origin-bottom-right
              ${showSnowControl ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}
              bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl mb-1
            `}>
               <div className="flex items-center gap-3">
                 <span className="text-[10px] text-blue-200/50 uppercase tracking-widest">Snow</span>
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={snowIntensity}
                    onChange={handleSnowChange}
                    className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hover:bg-white/30 transition-colors
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                 />
               </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setShowSnowControl(!showSnowControl)}
              className={`
                p-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300
                ${showSnowControl 
                  ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110' 
                  : 'bg-black/30 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'}
              `}
              title="调节雪势"
            >
              <CloudSnow size={20} />
            </button>
          </div>

          <div className="hidden">
            <MusicPlayer onPlayStateChange={() => {}} autoPlay={hasStarted} />
          </div>
        </>
      )}
      
      {/* Global Styles for Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes breath {
          0%, 100% { opacity: 0.95; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.01); }
        }
        .animate-fade-in {
          animation: fadeIn 1.5s ease-out forwards;
        }
        .animate-fade-in-slow {
          animation: fadeIn 3s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-breath {
          animation: breath 5s ease-in-out infinite;
        }
        /* Custom Text Glow Effect */
        .text-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(186, 230, 253, 0.4);
        }
      `}</style>
    </div>
  );
};

export default App;