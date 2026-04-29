import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
 import { Brain, ClipboardList, BarChart3, Globe } from 'lucide-react';


export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.name, data.contact);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 flex-col items-center justify-center p-12 text-white">
       <img src="/mindlogo.png" alt="mindAIra Logo" className="w-9 h-9 rounded-lg object-cover border border-white/20"/>
        <h1 className="text-4xl font-extrabold mb-4">Join MindAIra</h1>
        <p className="text-white/70 text-center text-lg max-w-sm">Start your personalized AI learning journey today — completely free.</p>
        <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-sm">
          {[
            { icon: <img src="/mindlogo.png" className="w-6 h-6 rounded-md object-cover" />, label: 'AI Teacher' },
            { icon: <ClipboardList className="w-6 h-6" />, label: 'Smart Quizzes' },
            { icon: <BarChart3 className="w-6 h-6" />, label: 'Progress Tracking' },
            { icon: <Globe className="w-6 h-6" />, label: 'Hindi & English' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-white/10 rounded-xl px-4 py-3 text-sm text-center">
              <div className="text-2xl mb-1">{icon}</div>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">MindAIra</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account ✨</h2>
          <p className="text-gray-500 mb-8">Free forever — no credit card needed</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input type="text" placeholder="Your name" required
                className="input-field" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input type="email" placeholder="you@example.com"
                className="input-field" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <input type="text" placeholder="1234567890"
                className="input-field" value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input type="password" placeholder="Min 6 characters" minLength={6} required
                className="input-field" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</Link>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
