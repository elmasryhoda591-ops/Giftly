import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Sparkles, Wand2, ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { generateSurpriseStory } from "../lib/gemini";

const OCCASIONS = [
  "عيد ميلاد",
  "ذكرى زواج",
  "عيد الحب",
  "نجاح وتخرج",
  "صداقة",
  "اعتذار",
  "وقت صعب (دعم)",
];

export default function CreateSurprise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    occasion: "",
    recipientName: "",
    senderName: "",
    memories: "",
    story: "",
    password: "",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop", 
    voiceUrl: "",
    extraText: "",
    personalPhotoUrl: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [uploadingPersonal, setUploadingPersonal] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'voice' | 'personal') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    if (type === 'image') setUploadingImage(true);
    else if (type === 'voice') setUploadingVoice(true);
    else setUploadingPersonal(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ 
          ...prev, 
          [type === 'image' ? 'imageUrl' : type === 'voice' ? 'voiceUrl' : 'personalPhotoUrl']: data.url 
        }));
      } else {
        alert("فشل الرفع");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الرفع.");
    } finally {
      if (type === 'image') setUploadingImage(false);
      else if (type === 'voice') setUploadingVoice(false);
      else setUploadingPersonal(false);
    }
  };

  const handleNext = async () => {
    if (step === 2 && !formData.story) {
      // Auto generate story
      setLoading(true);
      try {
        const story = await generateSurpriseStory(
          formData.occasion, 
          formData.recipientName, 
          formData.senderName, 
          formData.memories
        );
        setFormData(prev => ({ ...prev, story }));
      } catch (err) {
        alert("حدث خطأ في توليد القصة. جرب مرة أخرى أو اكتبها بنفسك.");
      } finally {
        setLoading(false);
      }
    }
    setStep(s => s + 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.id) {
        setStep(100); // Success step
        setFormData(prev => ({ ...prev, id: data.id }));
      }
    } catch (e) {
      alert("حدث خطأ أثناء حفظ المفاجأة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] dark:bg-slate-900 flex flex-col pt-24 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {step < 100 && (
          <div className="flex items-center justify-between mb-8">
             <button onClick={() => navigate("/")} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                عودة
             </button>
             <div className="text-sm font-medium text-slate-400 dark:text-slate-500">
               الخطوة {step} من 4
             </div>
          </div>
        )}

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-bold mb-2 dark:text-white transition-colors duration-300">ما هي المناسبة؟ 🎉</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 transition-colors duration-300">اختر المناسبة لنبدأ في تصميم المفاجأة.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ}
                      onClick={() => setFormData({ ...formData, occasion: occ })}
                      className={`p-4 rounded-2xl border-2 transition-all ${formData.occasion === occ ? 'border-[#FF6B6B] bg-pink-50 dark:bg-pink-900/20 text-[#FF6B6B] dark:text-pink-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-200 dark:hover:border-pink-800 text-slate-700 dark:text-slate-200'}`}
                    >
                      <span className="font-semibold">{occ}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-bold mb-2 dark:text-white transition-colors duration-300">من هو الشخص المحظوظ؟ 💌</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 transition-colors duration-300">شاركنا بعض التفاصيل والذكريات لنصنع قصة مذهلة.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">اسم المهدى إليه</label>
                    <input type="text" value={formData.recipientName} onChange={e => setFormData({...formData, recipientName: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white" placeholder="مثال: سارة" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">اسمك (المرسل)</label>
                    <input type="text" value={formData.senderName} onChange={e => setFormData({...formData, senderName: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white" placeholder="توقيعك في النهاية" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">ذكريات أو رسالة تريد تضمينها</label>
                    <textarea rows={4} value={formData.memories} onChange={e => setFormData({...formData, memories: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white" placeholder="اكتب ذكريات مشتركة، أول لقاء، أو أي شيء تريد للذكاء الاصطناعي أن يستخدمه لكتابة الرسالة..." />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold dark:text-white transition-colors duration-300">الرسالة السحرية ✨</h2>
                  <Wand2 className="text-[#FF6B6B] w-6 h-6" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mb-8 transition-colors duration-300">قمنا بتوليد هذه الرسالة باستخدام الذكاء الاصطناعي بناءً على ذكرياتك. يمكنك تعديلها.</p>
                
                <textarea 
                  rows={8} 
                  value={formData.story} 
                  onChange={e => setFormData({...formData, story: e.target.value})} 
                  className="w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all text-lg leading-relaxed resize-none dark:text-white" 
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-3xl font-bold mb-2 dark:text-white transition-colors duration-300">الوسائط واللمسات الأخيرة 🔐</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 transition-colors duration-300">أضف صورة، تسجيل صوتي، أو رسالة إضافية واجعل هديتك مثيرة عبر كلمة سر.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">صورة الشخص (صاحب المفاجأة - لتظهر في الرسوم المتحركة)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <label className="flex-1 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#FF6B6B] dark:hover:border-[#FF6B6B] rounded-2xl p-4 flex items-center justify-center gap-2 transition-all dark:text-white">
                         {uploadingPersonal ? <Loader2 className="w-5 h-5 animate-spin text-[#FF6B6B]" /> : <UploadCloud className="w-5 h-5 text-slate-400" />}
                         <span className="text-sm">{uploadingPersonal ? "جاري الرفع..." : "رفع صورة"}</span>
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'personal')} />
                       </label>
                       <input type="text" value={formData.personalPhotoUrl} onChange={e => setFormData({...formData, personalPhotoUrl: e.target.value})} className="flex-[2] w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white" placeholder="أو ضع رابط مباشرة..." />
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">صورة أو فيديو للذكريات (اختياري)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <label className="flex-1 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#FF6B6B] dark:hover:border-[#FF6B6B] rounded-2xl p-4 flex items-center justify-center gap-2 transition-all dark:text-white">
                         {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin text-[#FF6B6B]" /> : <UploadCloud className="w-5 h-5 text-slate-400" />}
                         <span className="text-sm">{uploadingImage ? "جاري الرفع..." : "رفع ملف"}</span>
                         <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                       </label>
                       <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-[2] w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white" placeholder="أو ضع رابط مباشرة..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">مقطع صوتي / فويس (اختياري)</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <label className="flex-1 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#FF6B6B] dark:hover:border-[#FF6B6B] rounded-2xl p-4 flex items-center justify-center gap-2 transition-all dark:text-white">
                         {uploadingVoice ? <Loader2 className="w-5 h-5 animate-spin text-[#FF6B6B]" /> : <UploadCloud className="w-5 h-5 text-slate-400" />}
                         <span className="text-sm">{uploadingVoice ? "جاري الرفع..." : "رفع تسجيل"}</span>
                         <input type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'voice')} />
                       </label>
                       <input type="text" value={formData.voiceUrl} onChange={e => setFormData({...formData, voiceUrl: e.target.value})} className="flex-[2] w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white" placeholder="أو ضع رابط مباشرة..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">رسالة إضافية أو إهداء (اختياري)</label>
                    <textarea rows={3} value={formData.extraText} onChange={e => setFormData({...formData, extraText: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white resize-none" placeholder="نص إضافي، شعر، أو رسالة أخرى..." />
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">كلمة سر الهدايا (يجب على المستلم إدخالها لفتح المفاجأة)</label>
                    <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all dark:text-white" placeholder="مثال: 1234 أو اسم الدلع" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 100 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold mb-4 dark:text-white transition-colors duration-300">تم تجهيز المفاجأة بنجاح! 🚀</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 transition-colors duration-300">شارك الرابط التالي مع {formData.recipientName}</p>
                
                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-between mb-8 max-w-md mx-auto transition-colors duration-300">
                  <div className="flex items-center w-full mb-6">
                    <span className="truncate text-slate-600 dark:text-slate-300 block flex-1 text-left px-2 transition-colors duration-300" dir="ltr">
                      {window.location.origin}/gift/{(formData as any).id}
                    </span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/gift/${(formData as any).id}`)}
                      className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-white transition-colors duration-300 cursor-pointer"
                    >
                      نسخ
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
                     <QRCodeCanvas value={`${window.location.origin}/gift/${(formData as any).id}`} size={160} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 transition-colors duration-300">اسحب الباركود لمشاركته سريعاً</p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button onClick={() => navigate(`/gift/${(formData as any).id}`)} className="px-6 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium hover:bg-[#ff5252] cursor-pointer">
                    معاينة المفاجأة
                  </button>
                  <button onClick={() => navigate("/")} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-300 cursor-pointer">
                    الرئيسية
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 100 && (
          <div className="py-8 flex justify-between border-t border-slate-200 dark:border-slate-700 mt-8 transition-colors duration-300">
            <button 
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || loading}
              className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors duration-300 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
              السابق
            </button>
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={(!formData.occasion && step === 1) || (!formData.recipientName && step === 2) || loading}
                className="px-8 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium shadow-md shadow-pink-200 dark:shadow-none flex items-center gap-2 hover:bg-[#ff5252] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "جاري التوليد بـ AI..." : "التالي"}
                {!loading && <ChevronLeft className="w-5 h-5" />}
              </button>
            ) : (
              <button 
                onClick={handleCreate}
                disabled={loading}
                className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? "جاري الحفظ..." : "إنشاء المفاجأة"}
                <Sparkles className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
