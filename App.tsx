
import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender } from './types';
import { sendMessageToN8N, pingServer, PRODUCTION_URL, TEST_URL } from './services/n8nService';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useTestMode, setUseTestMode] = useState(true);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkConnection();
  }, [useTestMode]);

  const checkConnection = async () => {
    setServerStatus('checking');
    const isUp = await pingServer(useTestMode ? TEST_URL : PRODUCTION_URL);
    setServerStatus(isUp ? 'online' : 'offline');
  };

  const handleSendMessage = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMsg, sender: Sender.USER, timestamp: new Date() }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await sendMessageToN8N(userMsg, useTestMode);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, sender: Sender.BOT, timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        text: 'تمامی تلاش‌ها برای دور زدن محدودیت CORS شکست خورد. این یعنی سرور n8n شما درخواست‌های پروکسی را هم مسدود می‌کند.', 
        sender: Sender.SYSTEM, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900" dir="rtl">
      {/* Navigation */}
      <div className="w-20 md:w-72 bg-[#1e293b] text-white flex flex-col items-center py-10 shadow-2xl">
        <div className="bg-indigo-500 w-16 h-16 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/30">
          <i className="fas fa-robot text-2xl"></i>
        </div>
        
        <nav className="w-full px-4 space-y-4">
          <button onClick={() => setActiveTab('chat')} className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'chat' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}>
            <i className="fas fa-comments"></i>
            <span className="hidden md:block font-bold">گفتگو</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'settings' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}>
            <i className="fas fa-stethoscope"></i>
            <span className="hidden md:block font-bold">عیب‌یابی سیستم</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b p-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500' : serverStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-500'} animate-pulse`}></div>
            <h1 className="font-black text-slate-700">اتصال زیرساخت: {serverStatus === 'online' ? 'در دسترس' : 'نامشخص'}</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setUseTestMode(true)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${useTestMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>حالت TEST</button>
             <button onClick={() => setUseTestMode(false)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!useTestMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>حالت PRODUCTION</button>
          </div>
        </header>

        {activeTab === 'chat' ? (
          <>
            <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <i className="fas fa-network-wired text-8xl mb-4"></i>
                  <p className="font-bold">در انتظار اولین پالس از وب‌هوک...</p>
                </div>
              )}
              {messages.map(m => <ChatMessage key={m.id} message={m} />)}
              {isLoading && (
                <div className="flex gap-2 p-4 bg-white w-fit rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
            </main>

            <footer className="p-6 bg-white border-t">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
                <input 
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all"
                  placeholder="یک پیام تستی برای n8n بفرستید..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <button className="bg-indigo-600 text-white w-14 h-14 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="p-10 max-w-4xl mx-auto space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <i className="fas fa-shield-virus text-indigo-500"></i>
                راهنمای حل خطای بحرانی Proxy Failure
              </h3>
              <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                  <p className="font-bold text-amber-800 mb-2 underline">گام ۱: بررسی گواهی SSL و فایروال سرور</p>
                  <p>برخی سرورها (مانند Cloudflare یا Nginx) درخواست‌هایی که از سمت پروکسی‌های معروف (مثل AllOrigins) می‌آیند را به عنوان "حمله" شناسایی و مسدود می‌کنند.</p>
                </div>

                <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-700 font-mono text-xs">
                  <p className="text-indigo-400 font-bold mb-3">// تنظیم پیشنهادی Nginx برای رفع مشکل:</p>
                  add_header 'Access-Control-Allow-Origin' '*' always;<br/>
                  add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;<br/>
                  add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <p className="font-bold text-emerald-800 mb-2">گام ۲: استفاده از وب‌هوک تستی</p>
                  <p>مطمئن شوید آدرس شما شامل <code>/webhook-test/</code> است و دکمه <b>Execute Workflow</b> در n8n فعال است. در این حالت n8n پورت را باز نگه می‌دارد.</p>
                </div>

                <button onClick={checkConnection} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                  بررسی مجدد زیرساخت شبکه
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
