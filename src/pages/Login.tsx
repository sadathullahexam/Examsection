import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const allowedEmails = ['sadath@hkbk.edu.in', 'tabassum.ara@hkbk.edu.in'];
    const validPassword = '1234';

    // Simulate auth check
    setTimeout(() => {
      if (allowedEmails.includes(email.toLowerCase()) && password === validPassword) {
        let displayName = email.split('@')[0].replace('.', ' ');
        if (email.toLowerCase() === 'sadath@hkbk.edu.in') {
          displayName = 'Sadathullah - Administrator';
        } else if (email.toLowerCase() === 'tabassum.ara@hkbk.edu.in') {
          displayName = 'Tabassum Ara - Faculty';
        }
        
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: displayName,
          role
        });
      } else {
        setError('Invalid email or password. Access denied.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA]">
      {/* Left side - Visual */}
      <div className="hidden md:flex md:w-1/2 bg-hkbk-blue p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-hkbk-gold/10 mix-blend-overlay technical-grid opacity-20" />
        <div className="relative z-10 max-w-md text-white">
          <div className="w-20 h-20 bg-hkbk-gold rounded-2xl flex items-center justify-center mb-8 shadow-2xl rotate-3">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tighter">
            HKBK College of <span className="text-hkbk-gold">Engineering</span>
          </h1>
          <p className="text-xl text-blue-100 font-light leading-relaxed">
            Secure Exam Management Portal. Excellence in Assessment, Integrity in Results.
          </p>
          <div className="mt-12 flex gap-8">
            <div>
              <p className="text-3xl font-bold">12k+</p>
              <p className="text-sm text-blue-200">Total Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold">450+</p>
              <p className="text-sm text-blue-200">Annual Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white md:bg-transparent">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 md:hidden">
            <div className="w-12 h-12 bg-hkbk-blue rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Exam Portal Login</h2>
            <p className="text-gray-500">Access your secure dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <UserIcon size={16} /> User Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ADMIN', 'FACULTY', 'STUDENT'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                      role === r 
                        ? 'bg-hkbk-blue text-white border-hkbk-blue shadow-md' 
                        : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-hkbk-blue transition-colors text-gray-400">
                  <UserIcon size={20} />
                </div>
                <input
                  required
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hkbk-blue/20 focus:border-hkbk-blue transition-all"
                  placeholder="Official Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-hkbk-blue transition-colors text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  required
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hkbk-blue/20 focus:border-hkbk-blue transition-all"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-relaxed flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-hkbk-blue focus:ring-hkbk-blue" />
                Remember me
              </label>
              <button 
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="text-hkbk-blue font-semibold hover:underline transition-all active:scale-95"
              >
                Change password
              </button>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-hkbk-blue text-white font-bold py-4 rounded-xl shadow-lg hover:bg-hkbk-blue/90 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Log In Securely'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            By logging in, you agree to the HKBK Data Ethics Policy & 
            <br />Confidentiality Agreement.
          </p>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-hkbk-gold" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h3>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Enter your registered official email and your new password. For security, you'll need your current password.
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-hkbk-blue/10 focus:border-hkbk-blue transition-all"
                    placeholder="Official Email"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-hkbk-blue/10 focus:border-hkbk-blue transition-all"
                    placeholder="Current Password"
                  />
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-hkbk-blue/10 focus:border-hkbk-blue transition-all"
                    placeholder="New Password"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    type="password"
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-hkbk-blue/10 focus:border-hkbk-blue transition-all"
                    placeholder="Confirm New Password"
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 px-4 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Password change request submitted. Please check your email for verification.');
                    setShowChangePassword(false);
                  }}
                  className="flex-1 px-4 py-4 bg-hkbk-blue text-white rounded-2xl font-bold hover:bg-hkbk-blue/90 shadow-lg shadow-hkbk-blue/20 transition-all active:scale-95"
                >
                  Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
