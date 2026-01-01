
import React, { useState, useEffect, useRef } from 'react';
import { User, Settings } from '../types';
import { GeminiService } from '../services/geminiService';

interface VoiceInterfaceProps {
  user: User;
  settings: Settings;
  onClose: () => void;
}

// Helper functions for base64 encoding/decoding as required by Gemini API guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ user, settings, onClose }) => {
  const isAr = settings.language === 'ar';
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState(isAr ? 'جاري الاتصال...' : 'Connecting...');
  const gemini = useRef(new GeminiService());
  
  // Audio Contexts
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const sources = useRef(new Set<AudioBufferSourceNode>());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    startSession();
    return () => stopSession();
  }, []);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = gemini.current.connectVoice({
        onopen: () => {
          setStatus(isAr ? 'أنا أستمع...' : 'I am listening...');
          setIsActive(true);
          const source = inputAudioContext.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            
            const base64 = encode(new Uint8Array(int16.buffer));
            // Solely rely on sessionPromise resolves to send realtime input as per guidelines
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.current!.destination);
        },
        onmessage: async (msg: any) => {
          // Process model's output audio bytes
          const base64EncodedAudioString = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64EncodedAudioString) {
            // Track end of playback queue for smooth playback
            nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current!.currentTime);
            
            const audioBuffer = await decodeAudioData(
              decode(base64EncodedAudioString),
              outputAudioContext.current!,
              24000,
              1,
            );
            
            const source = outputAudioContext.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.current!.destination);
            source.addEventListener('ended', () => {
              sources.current.delete(source);
            });
            
            source.start(nextStartTime.current);
            nextStartTime.current += audioBuffer.duration;
            sources.current.add(source);
          }
          if (msg.serverContent?.interrupted) {
            // Handle interruption
            sources.current.forEach(s => {
              try { s.stop(); } catch (e) {}
            });
            sources.current.clear();
            nextStartTime.current = 0;
          }
        },
        onerror: (e: any) => {
          console.error(e);
          setStatus(isAr ? 'حدث خطأ في الصوت' : 'Voice Error');
        },
        onclose: () => setIsActive(false)
      }, settings.voiceName);

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus(isAr ? 'يرجى تفعيل الميكروفون' : 'Please enable microphone');
    }
  };

  const stopSession = () => {
    sessionRef.current?.then((s: any) => s.close());
    inputAudioContext.current?.close();
    outputAudioContext.current?.close();
    sources.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#05080c]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
      <div className="absolute top-8 right-8">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div className="flex flex-col items-center gap-12 text-center">
        <div className="relative">
          {/* Pulse Animation */}
          <div className={`absolute inset-0 bg-blue-500 rounded-full blur-[60px] opacity-20 transition-all duration-500 scale-[2] ${isActive ? 'animate-pulse' : ''}`}></div>
          <div className={`w-40 h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
            <i className="fa-solid fa-microphone text-white text-5xl"></i>
          </div>
          
          {/* Animated rings */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-[ping_2s_infinite]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-[ping_3s_infinite] [animation-delay:0.5s]"></div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isAr ? 'ليث AI يتحدث...' : 'Laith AI is Speaking...'}
          </h2>
          <p className="text-blue-400 font-bold tracking-widest uppercase text-xs animate-pulse">
            {status}
          </p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            {isAr ? 'يمكنك التحدث معي بشكل طبيعي في أي وقت.' : 'You can talk to me naturally at any time.'}
          </p>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={onClose}
             className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-2xl text-white font-bold transition-all border border-white/10"
           >
             {isAr ? 'إنهاء المكالمة' : 'End Call'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
