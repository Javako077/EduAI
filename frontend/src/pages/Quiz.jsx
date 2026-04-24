import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  Brain, 
  Globe, 
  Timer, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  RefreshCcw,
  Sparkles,
  Zap
} from 'lucide-react';

const TOTAL_TIME = 10 * 60; // 10 minutes in seconds

export default function Quiz() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (timerActive && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, submitted]);

  const generate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true); setError(''); setSubmitted(false); setAnswers({});
    setTimeLeft(TOTAL_TIME); setTimerActive(false);
    try {
      const { data } = await api.post('quiz/generate', { topic, language, count: 10 });
      setQuestions(data.questions);
      setTimerActive(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    let s = 0;
    setAnswers(prev => {
      questions.forEach((q, i) => { if (prev[i] === q.answer) s++; });
      return prev;
    });
    // recalculate synchronously
    questions.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    setScore(s);
    setSubmitted(true);
    await api.post('quiz/submit', { topic, score: s, maxScore: questions.length }).catch(() => {});
  };

  const reset = () => {
    setQuestions([]); setTopic(''); setSubmitted(false);
    setAnswers({}); setTimerActive(false); setTimeLeft(TOTAL_TIME);
    clearInterval(timerRef.current);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const timerPct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft > 120 ? 'bg-green-500' : timeLeft > 60 ? 'bg-yellow-500' : 'bg-red-500';
  const answered = Object.keys(answers).length;
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 animate-fade-in flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ClipboardList className="text-indigo-600" size={36} /> Quiz Challenge
            </h1>
            <p className="text-slate-500 mt-2 font-medium">10 questions · 10 minutes · AI-Powered</p>
          </div>
        </div>

        {/* Generate Form */}
        {questions.length === 0 && (
          <div className="card !rounded-[2.5rem] p-10 animate-fade-in shadow-xl shadow-indigo-100 bg-white border border-slate-100">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                <Brain className="text-white" size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Generate Your Quiz</h2>
              <p className="text-slate-500 mt-2 font-medium">Enter any topic and get 10 AI-generated questions</p>
            </div>

            <form onSubmit={generate} className="space-y-6">
              <div className="relative group">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Practice Topic</label>
                <div className="relative">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Sparkles size={0} />
                  </div>
                  <input
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, Python, World War 2, Algebra..."
                    className="input-field text-lg py-4 pl-12 bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 flex items-center gap-2">
                  <Globe size={16} className="text-indigo-500" /> Choose Language
                </label>
                <div className="flex gap-3">
                  {['English', 'Hindi'].map(lang => (
                    <button
                      key={lang} type="button"
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-3.5 rounded-2xl border-2 font-black text-sm transition-all duration-200 ${
                        language === lang
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md translate-y-[-2px]'
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {lang === 'Hindi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3 animate-shake">
                  <XCircle size={20} /> {error}
                </div>
              )}

              <button type="submit" disabled={loading || !topic.trim()} 
                className="btn-primary w-full py-4.5 text-lg font-black shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating 10 questions...
                  </>
                ) : (
                  <>Start Quiz <ArrowRight size={20} /></>
                )}
              </button>
            </form>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { icon: HelpCircle, label: '10 Qs', color: 'bg-blue-50 text-blue-600' },
                { icon: Timer, label: '10 Mins', color: 'bg-amber-50 text-amber-600' },
                { icon: Lightbulb, label: 'Explained', color: 'bg-emerald-50 text-emerald-600' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`${color} rounded-2xl p-4 text-center border border-white/50 backdrop-blur-sm shadow-sm`}>
                  <div className="flex justify-center mb-1">
                    <Icon size={24} />
                  </div>
                  <p className="text-[0.7rem] font-black uppercase tracking-widest leading-none mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz in progress */}
        {questions.length > 0 && !submitted && (
          <div className="animate-fade-in pb-10">
            {/* Timer Card */}
            <div className="card !rounded-[2rem] p-6 mb-8 sticky top-4 z-20 shadow-xl border border-white/80 bg-white/90 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${timeLeft <= 60 ? 'bg-rose-500' : 'bg-slate-900'} text-white transition-colors`}>
                    <Timer size={24} className={timeLeft <= 60 ? 'animate-pulse' : ''} />
                  </div>
                  <span className={`text-4xl font-black tabular-nums tracking-tighter ${timeLeft <= 60 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                    {mins}:{secs}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Answered</span>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[...Array(questions.length)].map((_, idx) => (
                        <div key={idx} className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${answers[idx] ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-slate-700 ml-1">
                      {answered}/{questions.length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 shadow-sm ${timerColor}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={i} className="card !rounded-[2.5rem] p-8 animate-fade-in shadow-md bg-white border border-slate-50 transition-all hover:shadow-lg" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-[1rem] bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-lg font-black flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
                      {i + 1}
                    </div>
                    <p className="text-xl font-bold text-slate-800 leading-tight pt-1">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 ml-0 sm:ml-14">
                    {q.options.map((opt, j) => {
                      const letter = ['A', 'B', 'C', 'D'][j];
                      const selected = answers[i] === letter;
                      return (
                        <button
                          key={j}
                          onClick={() => setAnswers(prev => ({ ...prev, [i]: letter }))}
                          className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 group relative flex items-center gap-4 ${
                            selected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md translate-x-2'
                              : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                            {letter}
                          </div>
                          <span className="font-bold flex-1">{opt}</span>
                          {selected && <CheckCircle2 className="text-indigo-600" size={20} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-1 bg-white rounded-[2rem] shadow-2xl border border-slate-100">
              <button
                onClick={() => handleSubmit(false)}
                disabled={answered < questions.length}
                className="btn-primary w-full py-5 text-xl font-black rounded-[1.8rem] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {answered < questions.length
                  ? `Finish Answering (${answered}/${questions.length})`
                  : <span className="flex items-center justify-center gap-3">Submit Quiz <Zap className="group-hover:fill-white transition-all" size={24} /></span>}
              </button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {submitted && (
          <div className="animate-fade-in pb-16">
            {/* Hero Result */}
            <div className={`card !rounded-[3rem] p-12 text-center mb-10 overflow-hidden relative border-4 border-white shadow-2xl ${
              percentage >= 80 ? 'bg-emerald-50' : percentage >= 60 ? 'bg-indigo-50' : 'bg-rose-50'
            }`}>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              
              <div className="relative z-10">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                  {percentage >= 80 ? <Sparkles size={64} className="text-emerald-500" /> : percentage >= 60 ? <TrendingUp size={64} className="text-indigo-500" /> : <BookOpen size={64} className="text-rose-500" />}
                </div>
                
                <h2 className="text-6xl font-black mb-4 tracking-tighter text-slate-900 leading-none">
                  <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">{score}</span>
                  <span className="text-slate-300 text-4xl">/{questions.length}</span>
                </h2>
                
                <div className={`inline-flex px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-6 ${
                  percentage >= 80 ? 'bg-emerald-200 text-emerald-800' : percentage >= 60 ? 'bg-indigo-200 text-indigo-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {percentage}% Correct
                </div>

                <p className="text-xl font-bold text-slate-700 leading-relaxed max-w-sm mx-auto mb-10">
                  {percentage >= 80 ? 'A perfect score! You are dominating this topic! 👑' : percentage >= 60 ? 'Great progress! You have a solid grasp on this. 💪' : 'This is a great starting point. Let\'s review and double the score next time! ✨'}
                </p>

                <div className="flex gap-4 justify-center flex-wrap">
                  <button onClick={reset}
                    className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                    <RefreshCcw size={18} /> New Challenge
                  </button>
                  <Link to="/chat"
                    className="px-8 py-3.5 rounded-2xl bg-white text-indigo-600 font-black border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all transform hover:-translate-y-1 flex items-center gap-2 shadow-sm">
                    <Brain size={18} /> Ask AI Teacher
                  </Link>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="flex items-center gap-3 mb-6 ml-2">
              <BookOpen className="text-slate-400" size={24} />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Review Answers</h2>
            </div>
            
            <div className="space-y-6">
              {questions.map((q, i) => {
                const correct = answers[i] === q.answer;
                return (
                  <div key={i} className="card !rounded-[2.5rem] p-8 border-2 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-10 h-10 rounded-[1rem] text-white flex items-center justify-center flex-shrink-0 shadow-lg ${correct ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'}`}>
                        {correct ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-slate-800 leading-tight pt-1">{q.question}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 ml-0 sm:ml-14 mb-6">
                      {q.options.map((opt, j) => {
                        const letter = ['A', 'B', 'C', 'D'][j];
                        const isCorrect = letter === q.answer;
                        const isUserAnswer = answers[i] === letter;
                        const isWrong = isUserAnswer && !isCorrect;
                        
                        return (
                          <div key={j} className={`px-5 py-3 rounded-2xl text-[0.95rem] font-bold flex items-center gap-4 border-2 transition-all ${
                            isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' : 
                            isWrong ? 'bg-rose-50 border-rose-500 text-rose-800' : 
                            'bg-slate-50 border-slate-100 text-slate-500'
                          }`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                              isCorrect ? 'bg-emerald-500 text-white' : 
                              isWrong ? 'bg-rose-500 text-white' : 
                              'bg-slate-200 text-slate-500'
                            }`}>
                              {letter}
                            </div>
                            {opt}
                            {isCorrect && <CheckCircle2 size={16} className="ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="ml-0 sm:ml-14 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-150 transition-transform">
                        <Lightbulb size={40} className="text-indigo-600" />
                      </div>
                      <p className="text-sm font-bold text-indigo-700 flex items-center gap-2 mb-1">
                        <Lightbulb size={16} /> Explanation
                      </p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed relative z-10">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Bottom Reset Button */}
            <div className="mt-12 text-center">
              <button onClick={reset} className="btn-primary px-12 py-4 text-lg font-black shadow-lg">
                Try Another Subject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
