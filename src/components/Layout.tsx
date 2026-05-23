import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/results', label: 'Results', icon: FileSpreadsheet },
    { to: '/students', label: 'Eligible List', icon: Users },
    { to: '/passouts', label: 'Passouts', icon: GraduationCap },
    { to: '/phd', label: 'PHD', icon: Award },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-hkbk-blue text-white flex-col sticky top-0 h-screen shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-inner overflow-hidden">
            <img 
              src={`/api/logo?v=${Date.now()}`} 
              alt="HKBK Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://www.hkbk.edu.in/assets/images/hkbk-logo.png";
              }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-bold text-[11px] leading-tight text-white uppercase tracking-tighter">Welcome to HKBKCE</h1>
            <p className="text-[9px] text-hkbk-gold font-bold uppercase tracking-widest leading-none mt-1">Examination Section</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-hkbk-gold text-white shadow-lg" 
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              )}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white/20">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-white/40 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-hkbk-blue text-white p-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
            <img 
              src={`/api/logo?v=${Date.now()}`} 
              alt="HKBK Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://www.hkbk.edu.in/assets/images/hkbk-logo.png";
              }}
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-[10px] uppercase tracking-tighter leading-tight">Welcome to HKBKCE,<br/>Examination Section</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-hkbk-blue pt-16 flex flex-col p-6"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 py-4 border-b border-white/10 text-lg",
                  isActive ? "text-hkbk-gold" : "text-white/70"
                )}
              >
                <item.icon size={24} />
                {item.label}
              </NavLink>
            ))}
            <button 
              onClick={onLogout}
              className="mt-auto flex items-center gap-4 py-4 text-red-400"
            >
              <LogOut size={24} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto technical-grid">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
