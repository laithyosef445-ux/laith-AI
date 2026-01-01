
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/Settings';
import Login from './components/Login';
import { Mode, User, ChatHistory, Settings, ThemeColor, Message } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.CHAT);
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>('initial');
  
  const [history, setHistory] = useState<ChatHistory[]>([
    { 
      id: 'initial', 
      title: 'محادثة ترحيبية ✨', 
      lastMessage: 'أهلاً بك في ليث AI!', 
      timestamp: Date.now(),
      messages: [] 
    }
  ]);
  
  const [settings, setSettings] = useState<Settings>({
    language: 'ar',
    theme: 'dark',
    themeColor: 'blue',
    voiceName: 'Zephyr',
    searchEnabled: true,
    deepThinkingEnabled: false,
    highResolution: true,
    saveHistory: true,
    aiCreativity: 0.7,
    persona: 'friendly',
    responseLength: 'balanced',
    useEmojis: true,
    emojiIntensity: 4,
    fontSize: 'medium',
    autoScroll: true,
    safeMode: true,
    glassOpacity: 0.6
  });

  useEffect(() => {
    document.documentElement.className = settings.theme;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    
    const colors: Record<ThemeColor, { hex: string, glow: string }> = {
      blue: { hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
      purple: { hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
      emerald: { hex: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
      amber: { hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
      rose: { hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' }
    };

    const root = document.documentElement;
    root.style.setProperty('--accent', colors[settings.themeColor].hex);
    root.style.setProperty('--accent-glow', colors[settings.themeColor].glow);
    
    const fontSizes = { small: '14px', medium: '16px', large: '20px' };
    root.style.setProperty('--chat-font-size', fontSizes[settings.fontSize]);
  }, [settings.theme, settings.language, settings.themeColor, settings.fontSize]);

  const updateChatMessages = (chatId: string, messages: Message[]) => {
    if (!settings.saveHistory) return;
    setHistory(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const lastMsg = messages[messages.length - 1];
        return {
          ...chat,
          messages,
          lastMessage: lastMsg?.content || chat.lastMessage,
          title: chat.title.includes('محادثة ترحيبية') && messages.length > 1 ? messages[1].content.slice(0, 25) + '...' : chat.title
        };
      }
      return chat;
    }));
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChat: ChatHistory = {
      id: newId,
      title: 'محادثة جديدة',
      lastMessage: 'بدء دردشة جديدة...',
      timestamp: Date.now(),
      messages: []
    };
    setHistory(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setMode(Mode.CHAT);
    setIsSidebarOpen(false);
  };

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  const activeChat = history.find(h => h.id === activeChatId) || history[0];

  return (
    <div className={`flex h-screen w-full bg-[#05080c] overflow-hidden text-slate-200 font-sans selection:bg-accent/30 ${settings.language === 'ar' ? 'font-arabic' : ''}`}>
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        user={user} 
        history={history}
        activeChatId={activeChatId}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setShowSettings(true)}
        onNewChat={handleNewChat}
        onSelectChat={(id) => setActiveChatId(id)}
        themeColor={settings.themeColor}
      />
      
      <main className="flex-1 h-full relative overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden glass border-b border-white/5 h-16 flex items-center justify-between px-6 shrink-0 relative z-[40]">
           <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center text-slate-400">
              <i className="fa-solid fa-bars-staggered text-xl"></i>
           </button>
           <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-tighter">LAITH AI</span>
           </div>
           <button onClick={handleNewChat} className="w-10 h-10 flex items-center justify-center text-slate-400">
              <i className="fa-solid fa-pen-to-square text-lg"></i>
           </button>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {mode === Mode.CHAT && (
            <ChatInterface 
              key={activeChatId}
              chatId={activeChatId}
              user={user} 
              settings={settings} 
              initialMessages={activeChat.messages}
              onMessagesChange={(msgs) => updateChatMessages(activeChatId, msgs)}
              onStartVoice={() => setMode(Mode.VOICE)}
            />
          )}
          {mode === Mode.IMAGE && <ImageGenerator />}
          {mode === Mode.VIDEO && <VideoGenerator />}
          {mode === Mode.VOICE && (
            <VoiceInterface 
              user={user} 
              settings={settings} 
              onClose={() => setMode(Mode.CHAT)} 
            />
          )}
        </div>
      </main>

      {showSettings && (
        <SettingsModal 
          settings={settings} 
          user={user}
          onUpdateSettings={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
          onUpdateUser={(updates) => setUser(prev => prev ? ({ ...prev, ...updates }) : null)}
          onClearHistory={() => setHistory([{ id: 'initial', title: 'محادثة جديدة', lastMessage: '...', timestamp: Date.now(), messages: [] }])}
          onLogout={() => setUser(null)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
