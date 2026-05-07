import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
try {
  // Using VITE_ prefixed environment variables or process.env directly depending on the Vite setup.
  const apiKey = (process.env.GEMINI_API_KEY) || "";
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Google Gen AI", e);
}

export async function generateSurpriseStory(occasion: string, name: string, sender: string, memories: string) {
  if (!ai) throw new Error("Gemini API not configured. Please add GEMINI_API_KEY.");
  
  const prompt = `أنت كاتب محترف متخصص في كتابة الرسائل العاطفية والمفاجآت. 
المناسبة: ${occasion}
اسم المُتلقي: ${name}
اسم المُرسل: ${sender}
الذكريات أو المعلومات للتضمين: ${memories}

اكتب رسالة مفاجأة جميلة ومؤثرة جداً، تتحدث عن هذه الذكريات.
اجعل الرسالة تبدو شخصية، دافئة ومبهجة. لا تكن رسمياً جداً. استخدم الإيموجي المناسبة.
اكتب الرسالة في حدود 3 إلى 4 فقرات قصيرة، ومناسبة للعرض كـ "قصة رقمية" في تطبيق تفاعلي.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
