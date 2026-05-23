import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import NameList from './pages/NameList';
import Passouts from './pages/Passouts';
import Phd from './pages/Phd';
import Layout from './components/Layout';
import Login from './pages/Login';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hkbk_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user && user.email.toLowerCase() === 'syedsadath01@gmail.com' && user.name !== 'Syed Sadathullah - Administrator') {
      const updatedUser = { ...user, name: 'Syed Sadathullah - Administrator' };
      setUser(updatedUser);
      localStorage.setItem('hkbk_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('hkbk_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hkbk_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/results" element={<Results user={user} />} />
          <Route path="/students" element={<NameList user={user} />} />
          <Route path="/passouts" element={<Passouts user={user} />} />
          <Route path="/phd" element={<Phd user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
