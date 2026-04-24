import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Mic, 
  MicOff,
  AlertCircle
} from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.get('ai/history').then(({ data }) => setMessages(data)).catch(() => {});
  }, [user.token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice not supported in this browser');
    const r = new SR();
    r.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e) => setInput(e.results[0][0].transcript);
    recognitionRef.current = r;
    r.start();
  };

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const { data } = await api.post('ai/chat', { question, language });
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not reach AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen chat-container">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-indigo-200 border border-white/20">
            <img src="/mindlogo.png" alt="mindaira Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base">AI Teacher</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs text-green-600 font-semibold tracking-wide uppercase">Always active</p>
            </div>
          </div>
        </div>
        {/* Language Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 text-sm">
          {['English', 'Hindi'].map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className={`px-4 py-1.5 rounded-lg transition font-semibold ${language === lang ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              {lang === 'Hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-24 h-24 rounded-3xl overflow-hidden mb-5 shadow-xl shadow-indigo-500/30 border-4 border-white">
              <img src="/mindlogo.png" alt=" Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your AI Teacher</h2>
            <p className="text-gray-500 max-w-sm">Ask me anything — I'll explain it step by step like a real teacher.</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {['What is photosynthesis?', 'Explain Python loops', 'How does gravity work?'].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:border-indigo-400 hover:text-indigo-600 transition shadow-sm">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-3 animate-fade-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-9 h-9 rounded-xl overflow-hidden mb-1 avatar-shadow border border-white/20">
                <img src="/mindlogo.png" alt="AI Teacher" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`max-w-[82%] px-5 py-4 rounded-3xl text-[0.925rem] leading-relaxed markdown-content ${
              m.role === 'user'
                ? 'chat-bubble-user text-white rounded-br-none'
                : 'chat-bubble-assistant text-gray-800 rounded-bl-none'
            }`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            </div>
            {m.role === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mb-1 avatar-shadow border border-white/10">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 avatar-shadow border border-white/20">
              <img src="/mindlogo.png" alt="AI Teacher" className="w-full h-full object-cover" />
            </div>
            <div className="chat-bubble-assistant px-5 py-4 rounded-3xl rounded-bl-none">
              <div className="flex gap-1.5 items-center">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="bg-white/80 backdrop-blur-lg border-t px-4 py-5 flex-shrink-0">
        <form onSubmit={send} className="flex gap-3 max-w-3xl mx-auto items-center">
          <button type="button" onClick={startVoice}
            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${
              listening ? 'border-red-400 bg-red-50 text-red-500 animate-pulse' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-indigo-300 hover:bg-white hover:text-indigo-600'
            }`}>
            {listening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <div className="relative flex-1 group">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={language === 'Hindi' ? 'अपना सवाल पूछें...' : 'Ask your AI teacher anything...'}
              className="input-field w-full py-3.5 px-5 bg-gray-50 border-gray-100 focus:bg-white transition-all text-gray-800"
            />
          </div>
          <button type="submit" disabled={loading || !input.trim()}
            className="btn-primary w-12 h-12 !p-0 rounded-2xl flex items-center justify-center shadow-indigo-200">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
