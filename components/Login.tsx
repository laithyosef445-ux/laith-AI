
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // محاكاة تأخير التسجيل الرسمي
    setTimeout(() => {
      onLogin({
        name: name || email.split('@')[0],
        age: 25,
        gender,
        provider: 'guest',
        avatar: `https://api.dicebear.com/7.x/${gender === 'male' ? 'adventurer' : 'avataaars'}/svg?seed=${email}`
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03060a] p-4 overflow-hidden font-arabic" dir="rtl">
      {/* Background Decor */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md glass p-10 rounded-[3rem] border border-white/5 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl logo-glow rotate-3">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3V17H17" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 4L16 8L20 9L17 13" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">LAITH AI</h1>
          <p className="text-slate-500 text-sm mt-2 font-bold uppercase tracking-widest">بوابتك للذكاء الاصطناعي الفائق</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-2">الاسم الكامل</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl focus:border-accent outline-none text-white font-bold transition-all"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl focus:border-accent outline-none text-white font-bold transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-2">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl focus:border-accent outline-none text-white font-bold transition-all"
            />
          </div>

          {isRegistering && (
             <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
                <button type="button" onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === 'male' ? 'bg-accent text-white shadow-lg' : 'text-slate-500'}`}>ذكر</button>
                <button type="button" onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === 'female' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500'}`}>أنثى</button>
             </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all shadow-xl flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : (isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول الآن')}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
           <p className="text-center text-xs text-slate-500 font-bold">أو المتابعة عبر</p>
           <div className="grid grid-cols-2 gap-4">
              <button className="bg-slate-900 p-4 rounded-2xl border border-white/5 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                <i className="fa-brands fa-google"></i> Google
              </button>
              <button className="bg-slate-900 p-4 rounded-2xl border border-white/5 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                <i className="fa-brands fa-apple"></i> Apple
              </button>
           </div>
        </div>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-center mt-8 text-xs font-bold text-accent hover:underline"
        >
          {isRegistering ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ اصنع واحداً الآن'}
        </button>
      </div>
    </div>
  );
};

export default Login;
