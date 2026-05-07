import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Gift, LockKeyhole, Heart, Sparkles } from "lucide-react";

const FallingDecorations = ({ occasionType }: { occasionType: string }) => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let items = ['🌸', '🌹', '✨', '🌺', '💖'];
  if (occasionType === 'cake') items = ['🎉', '🎈', '✨', '🎂', '🎊'];
  if (occasionType === 'cap') items = ['🎓', '✨', '📚', '🌟', '🎊'];
  if (occasionType === 'ring') items = ['💍', '✨', '💖', '🕊️', '💐'];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 35 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -100, x: Math.random() * dimensions.width, opacity: 0, rotate: 0 }}
          animate={{ y: dimensions.height + 100, opacity: [0, 1, 1, 0], rotate: Math.random() > 0.5 ? 360 : -360 }}
          transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 5, ease: "linear" }}
          className="absolute text-2xl md:text-3xl"
        >
          {items[Math.floor(Math.random() * items.length)]}
        </motion.div>
      ))}
    </div>
  );
};

export default function SurpriseView() {
  const { id } = useParams();
  const [giftData, setGiftData] = useState<any>(null);
  const [error, setError] = useState(false);
  
  // States: loading -> locked -> lockedError -> reveal -> open
  const [appState, setAppState] = useState<"loading" | "locked" | "reveal" | "open">("loading");
  const [passwordInput, setPasswordInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    fetch(`/api/gifts/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error();
        setGiftData(data);
        if (data.password) {
          setAppState("locked");
        } else {
          setAppState("reveal");
        }
      })
      .catch(() => setError(true));
  }, [id]);

  const occasion = giftData?.occasion || "";
  let revealType = 'box';
  if (occasion.includes("حب")) revealType = "heart";
  else if (occasion.includes("زواج")) revealType = "ring";
  else if (occasion.includes("ميلاد")) revealType = "cake";
  else if (occasion.includes("نجاح") || occasion.includes("تخرج")) revealType = "cap";

  const R_ICONS: Record<string, string> = {
    heart: "💔", // Represents breaking heart if opening, or ❤️ before opening. Handled in render.
    cake: "🎂",
    cap: "🎓",
    ring: "💍",
    box: "🎁"
  };

  const SIDE_PHRASES: Record<string, string> = {
    heart: "أحبك دائماً ❤️",
    cake: "كل عام وأنت بخير 🎂",
    cap: "فخورين بنجاحك 🎓",
    ring: "معاً للأبد 💍",
    box: "أجمل المفاجآت لك 🎁"
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === giftData?.password) {
      setAppState("reveal");
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const handleOpen = () => {
    setIsOpening(true);
    
    // Fire confetti immediately
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    setTimeout(() => {
      setAppState("open");
    }, 2000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] dark:bg-slate-900 flex items-center justify-center text-center p-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 transition-colors duration-300">عذراً! 😢</h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">لم نتمكن من العثور على هذه المفاجأة.</p>
        </div>
      </div>
    );
  }

  if (appState === "loading") {
    return (
      <div className="min-h-screen bg-[#fdfaf6] dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <Gift className="w-12 h-12 text-[#FF6B6B] opacity-50" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] dark:bg-slate-900 relative overflow-hidden flex flex-col justify-center items-center p-6 transition-colors duration-300">
      <FallingDecorations occasionType={revealType} />
      
      <AnimatePresence mode="wait">
        
        {/* LOCK SCREEN */}
        {appState === "locked" && (
          <motion.div 
            key="locked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center relative z-10 transition-colors duration-300"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
              <LockKeyhole className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">هناك مفاجأة لك! 🎁</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 transition-colors duration-300">يوجد رمز سري لفتح هذه الهدية.</p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input 
                type="text" 
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="أدخل الرمز السري..."
                className={`w-full p-4 text-center text-xl rounded-2xl border transition-all ${passError ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-[#FF6B6B] dark:focus:border-[#FF6B6B] dark:text-white focus:ring-2 focus:ring-[#FF6B6B]/20 focus:outline-none'}`}
              />
              <button 
                type="submit"
                className="w-full py-4 bg-[#FF6B6B] text-white rounded-2xl font-bold text-lg hover:bg-[#ff5252] transition-colors"
                >
                فتح الهدية
              </button>
            </form>
          </motion.div>
        )}

        {/* REVEAL SCREEN (ICON TO TAP) */}
        {appState === "reveal" && (
          <motion.div 
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            className="text-center z-10 relative cursor-pointer"
            onClick={!isOpening ? handleOpen : undefined}
          >
            {isOpening ? (
              <motion.div className="relative">
                 <motion.div
                   initial={{ scale: 1 }}
                   animate={{ scale: 2, opacity: 0 }}
                   transition={{ duration: 0.8 }}
                   className="text-[120px] md:text-[160px] absolute inset-0 flex items-center justify-center drop-shadow-2xl z-0 filter"
                 >
                   {revealType === 'heart' ? '💔' : R_ICONS[revealType]}
                 </motion.div>
                 {giftData?.personalPhotoUrl || giftData?.imageUrl ? (
                   <motion.img 
                     initial={{ scale: 0, y: 50, rotate: -20 }}
                     animate={{ scale: 1, y: -20, rotate: 0 }}
                     transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                     src={giftData.personalPhotoUrl || giftData.imageUrl}
                     className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-8 border-white shadow-2xl relative z-10 mx-auto"
                   />
                 ) : (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, type: "spring" }}
                      className="w-48 h-48 md:w-56 md:h-56 bg-white rounded-full border-8 border-pink-200 shadow-2xl relative z-10 mx-auto flex items-center justify-center"
                    >
                      <Sparkles className="w-16 h-16 text-pink-400" />
                    </motion.div>
                 )}
              </motion.div>
            ) : (
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-[120px] md:text-[160px] drop-shadow-2xl select-none"
              >
                {revealType === 'heart' ? '❤️' : R_ICONS[revealType]}
              </motion.div>
            )}
            <h2 className="mt-8 text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
              {isOpening ? "جاري التجهيز..." : "اضغط لفتح المفاجأة!"}
            </h2>
          </motion.div>
        )}

        {/* THE SURPRISE SCREEN */}
        {appState === "open" && (
          <>
            {/* Side Floating Personal Photo */}
            {giftData?.personalPhotoUrl && (
              <motion.div
                initial={{ y: 200, opacity: 0, rotate: 0 }}
                animate={{ y: 0, opacity: 1, rotate: -5 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                className="fixed bottom-4 left-4 md:bottom-8 md:left-8 bg-white dark:bg-slate-800 p-2 md:p-3 rounded-2xl shadow-2xl border-4 border-white dark:border-slate-700 z-50 transition-colors duration-300"
              >
                <img src={giftData.personalPhotoUrl} className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-xl" />
                <p className="text-center font-bold font-serif text-slate-800 dark:text-pink-300 mt-2 text-sm md:text-base leading-tight">
                  {SIDE_PHRASES[revealType]}
                </p>
              </motion.div>
            )}

            <motion.div 
              key="open"
              initial={{ scale: 0.1, y: 150, rotateX: 60 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.3 }}
              className="w-full max-w-2xl relative z-10"
              style={{ perspective: 1000 }}
            >
              <div className="bg-[#fff9f0] dark:bg-slate-800 backdrop-blur-xl border border-[#ffeed4] dark:border-slate-700 pt-16 p-8 md:p-12 rounded-b-xl rounded-t-sm shadow-2xl relative text-center transition-colors duration-300 overflow-hidden">
                
                {/* Envelope Flap Decoration Layer */}
                <div 
                  className="absolute top-0 left-0 w-full h-16 md:h-24 bg-[#ffebd0] dark:bg-slate-700 shadow-sm border-b border-[#ffd7a8] dark:border-slate-600 z-0 origin-top"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                />
                
                <div className="relative z-10 pt-4">
                  {giftData?.imageUrl && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                      className="mx-auto mb-8 relative w-48 h-48 md:w-64 md:h-64"
                    >
                      {giftData.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video 
                          src={giftData.imageUrl} 
                          controls 
                          className="w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white dark:border-slate-800 transition-colors duration-300"
                        />
                      ) : (
                        <img 
                          src={giftData.imageUrl} 
                          className="w-full h-full object-cover rounded-2xl shadow-xl border-4 border-white dark:border-slate-800 transition-colors duration-300"
                          alt="Memory"
                        />
                      )}
                    </motion.div>
                  )}
                  
                  <h1 className="text-3xl md:text-5xl font-bold text-[#FF6B6B] dark:text-pink-400 mb-8 font-serif leading-normal transition-colors duration-300">
                    إلى {giftData?.recipientName}
                  </h1>
                  
                  <div className="text-lg md:text-2xl text-slate-800 dark:text-white leading-relaxed font-medium whitespace-pre-wrap font-serif transition-colors duration-300">
                    {giftData?.story}
                  </div>

                  {giftData?.extraText && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="mt-8 text-xl text-slate-700 dark:text-slate-300 italic p-6 bg-[#ffe8db] dark:bg-pink-900/10 rounded-2xl border border-[#ffdbca] dark:border-pink-900/30 transition-colors duration-300 shadow-inner"
                    >
                      "{giftData.extraText}"
                    </motion.div>
                  )}

                  {giftData?.voiceUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="mt-8 p-4 bg-white/60 dark:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 transition-colors duration-300 shadow-sm"
                    >
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">رسالة صوتية 🎵</span>
                      <audio controls className="w-full max-w-sm rounded-full align-middle outline-none">
                        <source src={giftData.voiceUrl} />
                        متصفحك لا يدعم تشغيل الصوتيات.
                      </audio>
                    </motion.div>
                  )}

                  <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                    <span className="text-slate-400 dark:text-slate-500 block mb-2 font-medium transition-colors duration-300">مع كل الحب من</span>
                    <span className="font-bold text-2xl text-slate-800 dark:text-white flex items-center justify-center gap-2 transition-colors duration-300">
                      {giftData?.senderName} <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

      </AnimatePresence>
    </div>
  );
}
