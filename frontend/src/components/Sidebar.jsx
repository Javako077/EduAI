import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Zap, 
  BarChart3, 
  User, 
  MessageCircle, 
  Settings, 
  Sun, 
  Moon, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat',      icon: () => <img src="/mindlogo.png" alt="mindAIra Logo" className="w-4 h-4 rounded-md object-cover"/> , label: 'AI Teacher' },
  { to: '/quiz',      icon: Zap, label: 'Quiz' },
  { to: '/progress',  icon: BarChart3, label: 'Progress' },
  { to: '/profile',   icon: User, label: 'Profile' },
  { to: '/feedback',  icon: MessageCircle, label: 'Feedback' },
  { to: '/settings',  icon: Settings, label: 'Settings' },
];

export default function Sidebar({ children }) {
  const { user, logout } = useAuth();
  const { settings, update } = useSettings();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const handleLogout = () => { logout(); navigate('/'); };

  const Nav = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
           <img src="/mindlogo.png" alt="mindAIra Logo" className="w-9 h-9"/> 
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            MindAIra
            </span>
          </div>
        )}
        {collapsed && (
          <img src="/mindlogo.png" alt="mindAIra Logo" className="w-9 h-9"/> 
                 )}
        <button
          onClick={onClose || (() => setCollapsed(p => !p))}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition text-sm"
        >
          {onClose ? <X size={18} /> : collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-lg animate-pulse-ring">
          {initials}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }, i) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onClose?.()}
            style={{ animationDelay: `${i * 0.05}s` }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium animate-slide-in
              ${isActive
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-white/60 hover:bg-white/10 hover:text-white'}
              ${collapsed ? 'justify-center' : ''}`
            }
          >
            <span className="text-lg">
              <Icon size={20} />
            </span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/10 space-y-1">
        {/* Dark mode quick toggle */}
        <button
          onClick={() => update('darkMode', !settings.darkMode)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium w-full text-white/60 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg">{settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}</span>
          {!collapsed && <span>{settings.darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition text-sm font-medium w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg"><LogOut size={20} /></span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-[#1a1a2e] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}>
        <Nav />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-60 bg-[#1a1a2e] flex flex-col">
            <Nav onClose={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Bar */}
        <div className="md:hidden bg-[#1a1a2e] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Menu size={20} />
          </button>
        <img src="/mindlogo.png" alt="mindAIra Logo" className="w-9 h-9"/> 
          <span className="font-extrabold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">MindAIra</span>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
