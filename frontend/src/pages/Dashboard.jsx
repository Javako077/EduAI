import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  FileText,
  Target,
  BookOpen,
  Zap,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [perf, setPerf] = useState(null);

  useEffect(() => {
    api.get('/ai/history').then(({ data }) => setHistory(data)).catch(() => { });
    api.get('/performance').then(({ data }) => setPerf(data)).catch(() => { });
  }, [user.token]);

  const totalQuestions = history.filter(m => m.role === 'user').length;
  const overallPct = perf?.totalMaxScore > 0 ? Math.round((perf.totalScore / perf.totalMaxScore) * 100) : null;
  const weakTopics = perf?.topics.filter(t => t.maxScore > 0 && (t.totalScore / t.maxScore) < 0.6) || [];

  const stats = [
    { label: 'Questions Asked', value: totalQuestions, icon: MessageSquare, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
    { label: 'Quizzes Taken', value: perf?.totalQuizzes ?? 0, icon: FileText, gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-200' },
    { label: 'Quiz Accuracy', value: overallPct !== null ? `${overallPct}%` : '—', icon: Target, gradient: overallPct >= 60 ? 'from-green-500 to-teal-500' : 'from-red-500 to-orange-500', shadow: overallPct >= 60 ? 'shadow-green-200' : 'shadow-red-200' },
    { label: 'Topics Studied', value: perf?.topics.length ?? 0, icon: BookOpen, gradient: 'from-orange-500 to-yellow-500', shadow: 'shadow-orange-200' },
  ];

  const actions = [
    {
      to: '/chat',
      icon: <img src="/mindlogo.png" alt="mindAIra Logo" className="w-9 h-9"/> ,
      label: 'AI Teacher',
      desc: 'Get step-by-step guidance',
      gradient: 'from-indigo-600 to-blue-600',
      actionIcon: <MessageSquare size={20} />
    },
    {
      to: '/quiz',
      icon: <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Zap className="text-white" size={28} /></div>,
      label: 'Quick Quiz',
      desc: '10 questions · 10 minutes',
      gradient: 'from-purple-600 to-pink-600',
      actionIcon: <FileText size={20} />
    },
    {
      to: '/progress',
      icon: <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><BarChart3 className="text-white" size={28} /></div>,
      label: 'Performance',
      desc: 'Analysis of weak areas',
      gradient: 'from-green-600 to-teal-600',
      actionIcon: <BarChart3 size={20} />
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8">
      {/* Header */}
      <div className="mb-10 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Hello, {user.name?.split(' ')[0]}! ✨
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Ready to continue your learning adventure?</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 self-start sm:self-center">
          <Clock size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-600">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, gradient, shadow }, i) => (
          <div
            key={label}
            className={`group relative bg-gradient-to-br ${gradient} rounded-[2rem] p-6 text-white shadow-xl ${shadow} transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 animate-fade-in overflow-hidden`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <p className="text-4xl font-black mb-1">{value}</p>
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 ml-1">Learning Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {actions.map(({ to, icon, label, desc, gradient, actionIcon }, i) => (
              <Link
                key={to} to={to}
                className={`group relative bg-gradient-to-br ${gradient} text-white rounded-[2rem] p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] animate-fade-in overflow-hidden`}
                style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              >
                <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                  {actionIcon}
                </div>
                <div className="mb-4">{icon}</div>
                <p className="font-black text-xl leading-tight">{label}</p>
                <p className="text-white/70 text-xs mt-2 font-medium">{desc}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                  Explore <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary Info */}
        <div className="space-y-6">
          {/* Weak Areas */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 ml-1 mb-4">Your Focus Areas</h2>
            <div className="card !rounded-[2rem] p-6 bg-white border border-slate-100 shadow-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {weakTopics.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-2xl border border-rose-100">
                    <AlertCircle className="text-rose-500" size={20} />
                    <p className="text-sm font-bold text-rose-700">Topics needing attention</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weakTopics.map(t => (
                      <Link key={t.name} to="/quiz"
                        className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs hover:bg-slate-100 hover:border-indigo-200 transition-all font-bold">
                        {t.name} · {Math.round((t.totalScore / t.maxScore) * 100)}%
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="text-green-500" size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-600">Everything looks great!</p>
                  <p className="text-xs text-slate-400 mt-1">Keep up the momentum.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent History */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 ml-1 mb-4">Recently Asked</h2>
            <div className="card !rounded-[2rem] p-6 bg-white border border-slate-100 shadow-sm animate-fade-in" style={{ animationDelay: '0.55s' }}>
              {history.length > 0 ? (
                <ul className="space-y-3">
                  {history.filter(m => m.role === 'user').slice(-4).reverse().map((m, i) => (
                    <li key={i} className="flex items-center gap-4 group cursor-default">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                      <span className="text-sm font-medium text-slate-600 line-clamp-1 group-hover:text-indigo-600 transition-colors">{m.content}</span>
                    </li>
                  ))}
                  <Link to="/chat" className="block text-center text-xs font-bold text-indigo-500 mt-4 hover:underline">View All Conversations</Link>
                </ul>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No questions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
