
import React, { useState, useRef, useEffect } from 'react';
import { Message, User, Settings } from '../types';
import { GeminiService } from '../services/geminiService';

interface ChatInterfaceProps {
  chatId: string;
  user: User;
  settings: Settings;
  initialMessages?: Message[];
  onMessagesChange: (msgs: Message[]) => void;
  onStartVoice: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, settings, initialMessages = [], onMessagesChange, onStartVoice }) => {
  const isAr = settings.language === 'ar';
  const [messages, setMessages] = useState<Message[]>(initialMessages.length > 0 ? initialMessages : [
    {
      id: 'welcome',
      role: 'assistant',
      content: isAr 
        ? `مرحباً بك${user.gender === 'female' ? 'ِ' : ''} يا ${user.name} في ليث AI 🌟. أنا مستعد لمساعدتك بكل ذكاء. ماذا يدور في ذهنك؟ ✨`
        : `Welcome, ${user.name}, to Laith AI 🌟. I am ready to assist you. What's on your mind? ✨`,
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(settings.searchEnabled);
  const [attachment, setAttachment] = useState<{ data: string, mimeType: string, preview: string, name: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gemini = useRef(new GeminiService());

  useEffect(() => {
    onMessagesChange(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachment({
        data: base64,
        mimeType: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || loading) return;

    const currentInput = input;
    const currentAttachment = attachment;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput || (isAr ? "تحليل المرفق" : "Analyze attachment"),
      timestamp: Date.now(),
      type: currentAttachment ? 'image' : 'text',
      attachmentUrl: currentAttachment?.preview
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const placeholderAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      type: 'text',
      isThinking: isThinkingMode
    };

    setMessages(prev => [...prev, userMsg, placeholderAssistantMsg]);
    setInput('');
    setAttachment(null);
    setLoading(true);

    try {
      const historyForService = messages.filter(m => m.id !== 'welcome');
      const stream = gemini.current.chatStream(
        currentInput || (isAr ? "حلل هذه الصورة" : "Analyze this image"), 
        historyForService, 
        { ...settings, deepThinkingEnabled: isThinkingMode, searchEnabled: isSearchActive },
        user,
        currentAttachment ? { data: currentAttachment.data, mimeType: currentAttachment.mimeType } : undefined
      );
      
      let fullContent = "";
      for await (const chunk of stream) {
        if (chunk.text) {
          fullContent += chunk.text;
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fullContent } : m));
        }
      }
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: isAr ? "عذراً، حدث خطأ. حاول مرة أخرى. 🔴" : "Error. Try again. 🔴" } : m));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#05080c] relative overflow-hidden ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Name */}
      <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none opacity-20">
         <h2 className="text-4xl font-black text-white tracking-[0.3em]">LAITH AI</h2>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 custom-scrollbar relative z-10">
        <div className="max-w-3xl mx-auto space-y-10 pt-16 pb-[320px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start animate-fade-in'}`}>
              <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-accent' : 'bg-slate-800'}`}>
                   {msg.role === 'user' ? <img src={user.customAvatar || user.avatar} className="w-full h-full object-cover rounded-lg" alt="" /> : <i className="fa-solid fa-bolt text-accent text-[9px]"></i>}
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{msg.role === 'user' ? user.name : 'LAITH AI'}</span>
              </div>
              
              <div className={`max-w-full rounded-2xl p-4 md:p-5 ${msg.role === 'user' ? 'bg-slate-800/50 text-white border border-white/5' : 'text-slate-200'}`} style={{ fontSize: 'var(--chat-font-size)' }}>
                {msg.isThinking && msg.content === "" && (
                  <div className="flex items-center gap-2 text-accent text-sm animate-pulse mb-2">
                    <i className="fa-solid fa-brain"></i>
                    <span>{isAr ? 'ليث يفكر بعمق...' : 'Laith is thinking deeply...'}</span>
                  </div>
                )}
                {msg.attachmentUrl && <img src={msg.attachmentUrl} className="mb-4 rounded-xl max-w-xs h-auto border border-white/5" alt="" />}
                <div className="whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                   {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Section - Floating GPT Design */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 z-40 bg-gradient-to-t from-[#05080c] via-[#05080c] to-transparent">
        <div className="max-w-3xl mx-auto space-y-4">
          
          {/* Attachment Preview Area */}
          {attachment && (
            <div className="flex items-center gap-3 p-3 glass rounded-2xl border border-white/10 w-fit animate-slide-in-up">
               {attachment.preview ? (
                 <img src={attachment.preview} className="w-12 h-12 object-cover rounded-lg" alt="" />
               ) : (
                 <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-file-lines text-slate-400"></i>
                 </div>
               )}
               <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">{attachment.name}</span>
                  <span className="text-[10px] text-slate-500">{isAr ? 'جاهز للإرسال' : 'Ready to send'}</span>
               </div>
               <button onClick={() => setAttachment(null)} className="w-6 h-6 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all">
                  <i className="fa-solid fa-xmark text-xs"></i>
               </button>
            </div>
          )}

          {/* Main Input Bar */}
          <div className="glass rounded-[2rem] border border-white/10 shadow-2xl p-2 md:p-3 transition-all focus-within:border-accent/40">
            <div className="flex items-end gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 mb-1 rounded-full text-slate-500 hover:bg-white/5 flex items-center justify-center transition-all">
                <i className="fa-solid fa-plus text-lg"></i>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.txt,.js,.py" />
              
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={isAr ? "اسأل ليث AI..." : "Message Laith AI..."}
                className="flex-1 bg-transparent border-none py-3 px-2 outline-none text-white font-medium placeholder-slate-600 text-lg resize-none min-h-[44px] max-h-[200px] custom-scrollbar"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />

              <div className="flex items-center gap-1 mb-1">
                <button 
                  onClick={() => setIsThinkingMode(!isThinkingMode)} 
                  title={isAr ? 'تفكير عميق' : 'Deep Thinking'}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isThinkingMode ? 'bg-accent/20 text-accent' : 'text-slate-500 hover:bg-white/5'}`}
                >
                  <i className="fa-solid fa-brain"></i>
                </button>
                <button 
                  onClick={() => setIsSearchActive(!isSearchActive)} 
                  title={isAr ? 'بحث ويب' : 'Web Search'}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSearchActive ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-500 hover:bg-white/5'}`}
                >
                  <i className="fa-solid fa-globe"></i>
                </button>
                <button 
                  onClick={handleSend} 
                  disabled={loading || (!input.trim() && !attachment)} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${loading || (!input.trim() && !attachment) ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 hover:bg-slate-200'}`}
                >
                  {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className={`fa-solid ${isAr ? 'fa-arrow-up' : 'fa-arrow-up'}`}></i>}
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            {isAr ? 'ليث قد يخطئ، تأكد من المعلومات المهمة' : 'Laith may make mistakes, verify important info'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
