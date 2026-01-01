
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

// The 'aistudio' global property and 'AIStudio' type are already defined by the environment.
// Redefining them causes a conflict. We will use the existing definitions.

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const gemini = useRef(new GeminiService());

  useEffect(() => {
    const checkKey = async () => {
      // Use optional chaining for safe access to injected aistudio
      // @ts-ignore: aistudio is globally defined in this environment
      const hasKey = await window.aistudio?.hasSelectedApiKey();
      setNeedsKey(!hasKey);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // Assume key selection is successful after triggering the dialog to avoid race conditions
    // @ts-ignore: aistudio is globally defined in this environment
    await window.aistudio?.openSelectKey();
    setNeedsKey(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    setProgressMsg("Warming up engine...");
    setVideoUrl(null);

    try {
      const url = await gemini.current.generateVideo(prompt, (msg) => setProgressMsg(msg));
      setVideoUrl(url);
    } catch (error: any) {
      console.error(error);
      // Reset key selection state if the request fails due to missing or invalid project configuration
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      } else {
        alert("Video generation failed. Please ensure you have a valid high-performance key.");
      }
    } finally {
      setLoading(false);
      setProgressMsg("");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 bg-[#080c14]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Laith Cinema Studio</h1>
          <p className="text-slate-400">Professional cinematic generation powered by Laith AI.</p>
        </div>

        {needsKey ? (
          <div className="glass border-orange-500/30 p-8 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
              <i className="fa-solid fa-key text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold">Studio Access Required</h2>
            <p className="text-slate-400 max-w-md">
              High-fidelity video generation requires a professional API key from a paid GCP project.
            </p>
            {/* Added link to billing documentation as per Gemini API requirements */}
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline mb-2"
            >
              Learn more about billing requirements
            </a>
            <button
              onClick={handleSelectKey}
              className="bg-orange-600 hover:bg-orange-500 px-8 py-3 rounded-2xl font-bold transition-all mt-2"
            >
              Connect Key
            </button>
          </div>
        ) : (
          <div className="glass rounded-3xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Cinematic Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the scene you want to bring to life..."
                className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-white"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-clapperboard animate-bounce"></i>
                  {progressMsg}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-film"></i>
                  Generate Masterpiece
                </>
              )}
            </button>
          </div>
        )}

        {videoUrl && (
          <div className="glass rounded-3xl overflow-hidden shadow-2xl">
            <video 
              src={videoUrl} 
              controls 
              className="w-full aspect-video bg-black"
              autoPlay
            />
            <div className="p-6 flex justify-between items-center">
              <div>
                <p className="font-bold">Generated Output</p>
                <p className="text-sm text-slate-400">High Definition • 16:9</p>
              </div>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = videoUrl;
                  link.download = `laith-cinema-${Date.now()}.mp4`;
                  link.click();
                }}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <i className="fa-solid fa-download"></i> Save Video
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;
