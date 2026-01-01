
import React from 'react';
import { Mode, User, ChatHistory, ThemeColor } from '../types';

interface SidebarProps {
  currentMode: Mode;
  setMode: (mode: Mode) => void;
  user: User;
  history: ChatHistory[];
  activeChatId: string;
  isOpen: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  themeColor: ThemeColor;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentMode, setMode, user, history, activeChatId, 
  isOpen, onToggle, onOpenSettings, onNewChat, onSelectChat, themeColor 
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
          onClick={onToggle}
        ></div>
      )}

      <aside className={`
        fixed lg:static inset-y-0 right-0 z-[60]
        w-[280px] lg:w-72 h-full glass border-l lg:border-r border-white/5
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent rounded-xl blur-lg opacity-40 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl flex items-center justify-center relative z-10 shadow-xl border border-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3V17H17" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 7L15 11L11 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"/>
                  <path d="M19 4L16 8L20 9L17 13" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-white tracking-tighter leading-none">LAITH AI</span>
              <span className="text-[9px] text-accent font-bold tracking-[0.2em] mt-1">SUPER INTELLIGENCE</span>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden text-slate-400 p-2">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 space-y-1.5 mt-4">
          {[
            { id: Mode.CHAT, icon: 'fa-comment-dots', label: 'الدردشة الذكية' },
            { id: Mode.IMAGE, icon: 'fa-wand-magic-sparkles', label: 'توليد صور' },
            { id: Mode.VIDEO, icon: 'fa-clapperboard', label: 'توليد فيديوهات' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setMode(item.id); if(window.innerWidth < 1024) onToggle(); }}
              className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                currentMode === item.id
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentMode === item.id ? 'bg-white/20' : 'bg-slate-800/50 group-hover:bg-slate-700'}`}>
                <i className={`fa-solid ${item.icon} text-sm`}></i>
              </div>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* History Section */}
        <div className="flex-1 mt-8 px-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">محادثاتك الأخيرة</h3>
            <button onClick={onNewChat} className="w-7 h-7 bg-white/5 hover:bg-accent hover:text-white rounded-lg flex items-center justify-center transition-all text-slate-500">
              <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>
          
          <div className="space-y-2">
            {history.length > 0 ? history.map((chat) => (
              <button
                key={chat.id}
                onClick={() => { onSelectChat(chat.id); if(window.innerWidth < 1024) onToggle(); }}
                className={`w-full group text-right p-4 rounded-2xl transition-all border ${
                  activeChatId === chat.id 
                    ? 'bg-accent/10 border-accent/20 text-white' 
                    : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <p className="text-xs font-bold truncate mb-1">{chat.title}</p>
                <p className="text-[10px] text-slate-500 truncate opacity-60">{chat.lastMessage}</p>
              </button>
            )) : (
              <div className="py-12 text-center opacity-20">
                <i className="fa-solid fa-ghost text-3xl mb-3"></i>
                <p className="text-xs font-bold">لا توجد سجلات</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 bg-slate-900/40 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5">
            <img src={user.customAvatar || user.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user.name}</p>
              <p className="text-[9px] text-accent font-bold">Pro Active</p>
            </div>
            <button onClick={onOpenSettings} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all">
              <i className="fa-solid fa-sliders text-xs"></i>
            </button>
          </div>
        </div>
      </aside>
    </ >
  );
};

export default Sidebar;
