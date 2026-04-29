import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [form, setForm] = useState({ contact: '', otp: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { contact: form.contact });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    try {
      await api.post('/auth/verify-otp', { contact: form.contact, otp: form.otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setMessage(''); setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        contact: form.contact, 
        otp: form.otp, 
        password: form.password 
      });
      setMessage('Password reset successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 border border-slate-100 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{step === 1 ? '🔑' : step === 2 ? '🔢' : '🔒'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'New Password'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {step === 1 ? "Enter your email or mobile number for a 6-digit code." : 
             step === 2 ? `Enter the code sent to ${form.contact}` : 
             "Create a strong new password."}
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl px-5 py-4 mb-6 text-sm font-bold flex items-center gap-3">
            <span className="text-lg">✅</span> {message}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl px-5 py-4 mb-6 text-sm font-bold flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email or Mobile Number</label>
              <input type="text" required placeholder="name@example.com or 1234567890" className="input-field py-3.5"
                value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-black shadow-indigo-300 transition-all active:scale-95">
              {loading ? 'Sending...' : 'Send OTP →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">6-Digit Code</label>
              <input type="text" required maxLength={6} placeholder="123456" className="input-field py-3.5 text-center text-2xl tracking-[1rem] font-black"
                value={form.otp} onChange={e => setForm({...form, otp: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-black shadow-indigo-300 transition-all active:scale-95">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm font-bold text-slate-400 hover:text-indigo-600">
              Change Contact
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">New Password</label>
              <input type="password" required placeholder="••••••••" className="input-field py-3.5"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirm New Password</label>
              <input type="password" required placeholder="••••••••" className="input-field py-3.5"
                value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-black shadow-indigo-300 transition-all active:scale-95">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link to="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
