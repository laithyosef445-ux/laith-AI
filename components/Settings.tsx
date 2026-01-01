
import React, { useState, useRef } from 'react';
import { Settings, User, ThemeColor, AIPersona, FontSize, ResponseLength } from '../types';

interface SettingsProps {
  settings: Settings;
  user: User;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onClearHistory: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsProps> = ({ settings, user, onUpdateSettings, onUpdateUser, onClearHistory, onLogout, onClose }) => {
  const isAr = settings.language === 'ar';
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'ui' | 'data'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="w-full max-w-5xl h-[90vh] glass rounded-[3.5rem] border border-white/10 relative z-10 overflow-hidden flex flex-col md:flex-row shadow-[0_0_120px_rgba(0,0,0,0.9)] animate-fade-in">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/5 bg-slate-950/50 p-8 flex flex-col gap-2">
          <div className="mb-10 px-2 text-center md:text-right">
            <h2 className="text-2xl font-black text-white">{isAr ? 'مركز التحكم' : 'Control Center'}</h2>
            <p className="text-[10px] text-accent uppercase tracking-widest font-bold mt-1">Laith AI OS v4.0</p>
          </div>
          
          {[
            { id: 'general', icon: 'fa-user', label: isAr ? 'الحساب واللغة' : 'Account' },
            { id: 'ai', icon: 'fa-brain', label: isAr ? 'عقل الذكاء الاصطناعي' : 'AI Engine' },
            { id: 'ui', icon: 'fa-palette', label: isAr ? 'الواجهة والمظهر' : 'UI & Visuals' },
            { id: 'data', icon: 'fa-shield-halved', label: isAr ? 'الخصوصية والأمان' : 'Privacy' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-accent text-white shadow-accent' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <i className={`fa-solid ${tab.icon} w-5 text-lg`}></i>
              <span className="font-bold">{tab.label}</span>
            </button>
          ))}

          <div className="mt-auto p-5 bg-accent/5 rounded-[2rem] border border-accent/20">
             <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full border-2 border-accent p-1">
                   <img src={user.customAvatar || user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                </div>
                <p className="text-sm font-black text-white">{user.name}</p>
                <span className="text-[10px] bg-accent px-3 py-1 rounded-full text-white font-bold uppercase">Pro Member</span>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-900/20">
          
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-10 animate-fade-in">
              <Section title={isAr ? 'تفضيلات اللغة' : 'Language'}>
                <div className="grid grid-cols-2 gap-4">
                  {['ar', 'en'].map(l => (
                    <button key={l} onClick={() => onUpdateSettings({ language: l as any })} className={`py-5 rounded-3xl border-2 font-black transition-all ${settings.language === l ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                      {l === 'ar' ? 'العربية 🇸🇦' : 'English 🇺🇸'}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title={isAr ? 'تعديل الملف الشخصي' : 'Profile Edit'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 px-2 uppercase">الاسم</label>
                    <input type="text" value={user.name} onChange={(e) => onUpdateUser({ name: e.target.value })} className="w-full bg-slate-900 border border-white/10 p-5 rounded-3xl focus:border-accent outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 px-2 uppercase">العمر</label>
                    <input type="number" value={user.age} onChange={(e) => onUpdateUser({ age: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-white/10 p-5 rounded-3xl focus:border-accent outline-none font-bold" />
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* TAB: AI ENGINE */}
          {activeTab === 'ai' && (
            <div className="space-y-10 animate-fade-in">
              <Section title={isAr ? 'شخصية المساعد الذكي' : 'AI Persona'}>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'creative', label: isAr ? 'إبداعي' : 'Creative', icon: 'fa-wand-magic' },
                    { id: 'professional', label: isAr ? 'مهني' : 'Professional', icon: 'fa-briefcase' },
                    { id: 'friendly', label: isAr ? 'ودود' : 'Friendly', icon: 'fa-face-smile' }
                  ].map(p => (
                    <button key={p.id} onClick={() => onUpdateSettings({ persona: p.id as AIPersona })} className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${settings.persona === p.id ? 'bg-accent border-accent text-white scale-105' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                      <i className={`fa-solid ${p.icon} text-2xl`}></i>
                      <span className="font-bold text-sm">{p.label}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title={isAr ? 'أسلوب الردود' : 'Response Style'}>
                <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                   <div className="flex items-center justify-between">
                      <span className="font-bold">{isAr ? 'طول الرد' : 'Response Length'}</span>
                      <div className="flex bg-slate-900 p-1 rounded-2xl">
                         {['concise', 'balanced', 'detailed'].map(rl => (
                           <button key={rl} onClick={() => onUpdateSettings({ responseLength: rl as ResponseLength })} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${settings.responseLength === rl ? 'bg-accent text-white shadow-lg' : 'text-slate-500'}`}>
                             {rl === 'concise' ? (isAr ? 'مختصر' : 'Short') : rl === 'detailed' ? (isAr ? 'مفصل' : 'Long') : (isAr ? 'متوازن' : 'Mid')}
                           </button>
                         ))}
                      </div>
                   </div>
                   <Toggle label={isAr ? 'استخدام الإيموجيات 🤖' : 'Use Emojis'} active={settings.useEmojis} onToggle={() => onUpdateSettings({ useEmojis: !settings.useEmojis })} />
                   {settings.useEmojis && (
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                           <span>{isAr ? 'كثافة هادئة' : 'Light'}</span>
                           <span>{isAr ? 'كثافة ChatGPT' : 'Intense'}</span>
                        </div>
                        <input type="range" min="1" max="5" value={settings.emojiIntensity} onChange={(e) => onUpdateSettings({ emojiIntensity: parseInt(e.target.value) })} className="w-full accent-accent h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                     </div>
                   )}
                </div>
              </Section>
            </div>
          )}

          {/* TAB: UI & VISUALS */}
          {activeTab === 'ui' && (
            <div className="space-y-10 animate-fade-in">
              <Section title={isAr ? 'سمة الألوان الرئيسية' : 'Primary Theme Color'}>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { id: 'blue', hex: '#3b82f6' },
                    { id: 'purple', hex: '#8b5cf6' },
                    { id: 'emerald', hex: '#10b981' },
                    { id: 'amber', hex: '#f59e0b' },
                    { id: 'rose', hex: '#f43f5e' }
                  ].map(color => (
                    <button 
                      key={color.id} 
                      onClick={() => onUpdateSettings({ themeColor: color.id as any })}
                      className={`aspect-square rounded-[2rem] transition-all flex items-center justify-center border-4 ${settings.themeColor === color.id ? 'border-white scale-110' : 'border-transparent opacity-40'}`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {settings.themeColor === color.id && <i className="fa-solid fa-check text-white text-xl"></i>}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title={isAr ? 'حجم الخط في الدردشة' : 'Font Scaling'}>
                <div className="flex gap-4">
                   {['small', 'medium', 'large'].map(f => (
                     <button key={f} onClick={() => onUpdateSettings({ fontSize: f as FontSize })} className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${settings.fontSize === f ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 text-slate-500'}`}>
                        {f === 'small' ? 'A' : f === 'large' ? 'A+' : 'A'} 
                        <span className="ml-2">{f === 'small' ? (isAr ? 'صغير' : 'Small') : f === 'large' ? (isAr ? 'كبير' : 'Large') : (isAr ? 'متوسط' : 'Normal')}</span>
                     </button>
                   ))}
                </div>
              </Section>

              <Toggle label={isAr ? 'تأثير الزجاج المضبب' : 'Glass Blur Effect'} active={settings.glassOpacity > 0} onToggle={() => onUpdateSettings({ glassOpacity: settings.glassOpacity > 0 ? 0 : 0.6 })} />
              <Toggle label={isAr ? 'التمرير التلقائي الذكي' : 'Smart Auto-Scroll'} active={settings.autoScroll} onToggle={() => onUpdateSettings({ autoScroll: !settings.autoScroll })} />
            </div>
          )}

          {/* TAB: DATA & SECURITY */}
          {activeTab === 'data' && (
            <div className="space-y-10 animate-fade-in">
               <Section title={isAr ? 'حماية البيانات' : 'Security'}>
                  <div className="space-y-4">
                     <Toggle label={isAr ? 'تفعيل الوضع الآمن (فلترة المحتوى)' : 'Safe Search Mode'} active={settings.safeMode} onToggle={() => onUpdateSettings({ safeMode: !settings.safeMode })} />
                     <Toggle label={isAr ? 'حفظ سجل المحادثات محلياً' : 'Local Storage Save'} active={settings.saveHistory} onToggle={() => onUpdateSettings({ saveHistory: !settings.saveHistory })} />
                  </div>
               </Section>

               <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                  <button onClick={onClearHistory} className="py-5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-3xl font-black transition-all flex items-center justify-center gap-3">
                    <i className="fa-solid fa-trash-can"></i>
                    {isAr ? 'مسح كافة البيانات' : 'Wipe Data'}
                  </button>
                  <button onClick={onLogout} className="py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-3xl font-black transition-all flex items-center justify-center gap-3">
                    <i className="fa-solid fa-right-from-bracket"></i>
                    {isAr ? 'تسجيل الخروج' : 'Logout'}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="space-y-5">
    <h3 className="text-xs font-black text-accent uppercase tracking-[0.2em] px-2 border-r-4 border-accent leading-none">{title}</h3>
    {children}
  </div>
);

const Toggle = ({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-3xl border border-white/5">
    <span className="font-bold text-slate-200">{label}</span>
    <button onClick={onToggle} className={`w-16 h-9 rounded-full relative transition-all shadow-inner ${active ? 'bg-accent' : 'bg-slate-700'}`}>
      <div className={`absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-md ${active ? 'right-8' : 'right-1'}`}></div>
    </button>
  </div>
);

export default SettingsModal;
