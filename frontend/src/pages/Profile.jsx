import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, FileText, Globe, Calendar, Camera, Shield, BadgeCheck } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', preferredLanguage: 'English' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('auth/profile')
      .then(({ data }) => {
        setProfile(data);
        setForm({ name: data.name, bio: data.bio || '', preferredLanguage: data.preferredLanguage || 'English' });
      })
      .catch(() => setError('Failed to load profile'));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      const { data } = await api.put('auth/profile', form);
      setProfile(data);
      updateUser(data.name);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save profile');
    } finally { setSaving(false); }
  };

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Cover Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src="/cover.png" 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white">
              <div className="p-8 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl mx-auto">
                    <img 
                      src="/avatar.png" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                    <Camera size={18} />
                  </button>
                </div>
                
                <div className="mt-5">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1.5">
                    {profile?.name}
                    <BadgeCheck size={20} className="text-indigo-500" />
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                    Pro Learner
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-around">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Quizzes</p>
                  </div>
                  <div className="text-center border-x border-gray-50 px-6">
                    <p className="text-xl font-bold text-gray-900">85%</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">4</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Badges</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield size={20} />
                Security Status
              </h3>
              <p className="text-indigo-100 text-sm mt-2 opacity-80">Your account is secured with 2FA and encryption.</p>
              <button className="mt-4 w-full bg-white/20 hover:bg-white/30 backdrop-blur py-2 rounded-xl text-sm font-semibold transition">
                Manage Security
              </button>
            </div>
          </div>

          {/* Right Column: Details & Edit */}
          <div className="lg:col-span-2 space-y-6">
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-6 py-4 text-sm flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                <div>
                  <p className="font-bold">Success!</p>
                  <p className="opacity-90 text-xs uppercase font-bold tracking-tight">Your profile has been updated.</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-6 py-4 text-sm flex items-center gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0">!</div>
                <div>
                  <p className="font-bold">Error</p>
                  <p className="opacity-90">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-50 border border-white overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-0.5">Manage your personal information</p>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-100 shadow-sm px-5 py-2.5 rounded-2xl hover:shadow-md transition-all font-bold text-sm active:scale-95"
                  >
                    Edit Info
                  </button>
                )}
              </div>

              <div className="p-8">
                {editing ? (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          <input 
                            value={form.name} 
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required 
                            className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-indigo-500 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 font-medium transition-all" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Language</label>
                        <div className="relative">
                          <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                          <select 
                            value={form.preferredLanguage} 
                            onChange={e => setForm({ ...form, preferredLanguage: e.target.value })}
                            className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-indigo-500 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 font-medium appearance-none transition-all"
                          >
                            <option value="English">English (US)</option>
                            <option value="Hindi">Hindi (India)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bio</label>
                      <div className="relative">
                        <FileText size={18} className="absolute left-4 top-4 text-gray-300" />
                        <textarea 
                          value={form.bio} 
                          onChange={e => setForm({ ...form, bio: e.target.value })}
                          rows={4} 
                          placeholder="Tell us about yourself..."
                          className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-indigo-500 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-medium resize-none transition-all" 
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit" 
                        disabled={saving} 
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all active:scale-[0.98]"
                      >
                        {saving ? 'Saving...' : 'Update Profile'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setEditing(false); setError(''); }}
                        className="flex-1 bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all active:scale-[0.98]"
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <DetailItem icon={<User />} label="Full Name" value={profile?.name} />
                      <DetailItem icon={<Mail />} label="Email Address" value={profile?.email} />
                      <DetailItem icon={<Globe />} label="Language" value={profile?.preferredLanguage || 'English'} />
                      <DetailItem icon={<Calendar />} label="Joined Date" value={joinDate} />
                    </div>
                    
                    <div className="pt-6 border-t border-gray-50">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Biography</label>
                      <p className="text-gray-700 leading-relaxed font-medium bg-gray-50/50 p-6 rounded-3xl border border-gray-50 italic">
                        {profile?.bio || 'You haven\'t added a bio yet. Click edit to tell the community about yourself!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievement Preview */}
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-50 border border-white p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Achievements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="group relative">
                    <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-indigo-200 group-hover:bg-indigo-50/30 transition-all cursor-help">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl filter grayscale group-hover:grayscale-0 transition-all">
                        {['🏆', '🔥', '📚', '⚡'][i-1]}
                      </div>
                    </div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                      Achievement {i}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-3.5 bg-gray-50/50 px-5 py-4 rounded-2xl border border-gray-50">
        <span className="text-indigo-500">{icon && <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>}</span>
        <span className="text-gray-900 font-bold">{value}</span>
      </div>
    </div>
  );
}
