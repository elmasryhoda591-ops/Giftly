import React from "react";
import { Link } from "react-router-dom";
import { Gift, CalendarHeart, Sparkles, Image, Lock, Music } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fdfaf6] dark:bg-slate-900 overflow-hidden flex flex-col relative transition-colors duration-300">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40vw] h-[40vw] rounded-full bg-pink-100/50 dark:bg-pink-900/20 blur-3xl z-0 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[50vw] h-[50vw] rounded-full bg-orange-100/40 dark:bg-orange-900/20 blur-3xl z-0 transition-colors duration-300" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-5xl mx-auto text-center mt-20">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm mb-6 inline-flex border border-transparent dark:border-slate-700 transition-colors duration-300"
        >
          <Gift className="w-12 h-12 text-[#FF6B6B]" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 transition-colors duration-300"
        >
          اصنع <span className="text-[#FF6B6B]">مفاجأة</span> رقمية<br/>لا تُنسى
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed transition-colors duration-300"
        >
          منصة Giftly تساعدك على تصميم تجربة تفاعلية مليئة بالمشاعر لأحبابك، 
          باستخدام الذكاء الاصطناعي مع إضافة صور، موسيقى، وألعاب صغيرة لتقديم هديتك بشكل مبتكر!
        </motion.p>
        
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.3 }}
        >
          <Link 
            to="/create" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-full text-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-6 h-6" />
            اصنع مفاجآتك الآن
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24">
          <FeatureCard icon={<CalendarHeart />} title="لجميع المناسبات" desc="أعياد ميلاد، ذكرى زواج، وحتى اعتذار" />
          <FeatureCard icon={<Sparkles />} title="الذكاء الاصطناعي" desc="قصص ورسائل تُكتب خصيصاً لمناسبتك" />
          <FeatureCard icon={<Lock />} title="قفل تفاعلي" desc="تحديد وقت للفتح أو كلمة سر سرية" />
          <FeatureCard icon={<Music />} title="تجربة متكاملة" desc="صور، أغاني، وذكريات في مكان واحد" />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/40 dark:border-slate-700/50 p-6 rounded-3xl flex flex-col items-center text-center shadow-sm transition-colors duration-300"
    >
      <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-[#FF6B6B] dark:text-pink-400 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">{desc}</p>
    </motion.div>
  );
}
