
import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{url: string, prompt: string}[]>([]);
  const gemini = useRef(new GeminiService());

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const url = await gemini.current.generateImage(prompt, aspectRatio);
      setGeneratedImages(prev => [{url, prompt}, ...prev]);
    } catch (error) {
      console.error(error);
      alert("فشل توليد الصورة. حاول مرة أخرى بوصف مختلف.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 bg-[#080c14]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4 text-right">
          <h1 className="text-4xl font-black text-white">توليد صور ذكية 🎨</h1>
          <p className="text-slate-400">حول كلماتك إلى لوحات فنية مذهلة عبر ليث AI.</p>
        </div>

        <div className="glass rounded-[3rem] p-8 space-y-6 border border-white/5">
          <div className="space-y-3">
            <label className="text-sm font-bold text-accent uppercase tracking-widest px-2 border-r-4 border-accent">وصف الصورة (Prompt)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب هنا ما تريد تخيله... (مثال: رائد فضاء يركب خيلاً في الفضاء السحيق بنمط سريالي)"
              className="w-full h-40 bg-slate-900/50 border border-slate-700/50 rounded-[2rem] p-6 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none text-white text-lg text-right"
              dir="rtl"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
              {(["1:1", "16:9", "9:16"] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${
                    aspectRatio === ratio 
                      ? 'bg-accent text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-accent to-indigo-600 hover:from-accent hover:to-indigo-500 px-8 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin text-xl"></i>
                  جاري التخيل...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                  توليد الصورة الآن
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          {generatedImages.map((img, i) => (
            <div key={i} className="group relative glass rounded-[2.5rem] overflow-hidden aspect-square border border-white/5 shadow-2xl">
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                <p className="text-sm text-slate-200 line-clamp-3 mb-4 text-right" dir="rtl">{img.prompt}</p>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = img.url;
                    link.download = `laith-ai-art-${Date.now()}.png`;
                    link.click();
                  }}
                  className="w-full bg-white text-slate-900 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                >
                  <i className="fa-solid fa-download"></i> حفظ في المعرض
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
