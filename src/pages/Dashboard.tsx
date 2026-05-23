import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  Search,
  Bell,
  Award,
  AlertCircle,
  FileSpreadsheet,
  GraduationCap,
  Upload,
  Camera
} from 'lucide-react';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'motion/react';
import { User } from '../types';

export default function Dashboard({ user }: { user: User }) {
  const [stats, setStats] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState(`/api/logo?v=${Date.now()}`);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const handleLogoClick = () => {
    if (user.role === 'ADMIN') {
      logoInputRef.current?.click();
    }
  };

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setIsUploadingLogo(true);
    try {
      const res = await fetch('/api/logo/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setLogoUrl(`${data.url}&v=${Date.now()}`);
      }
    } catch (error) {
      console.error('Logo upload failed', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const COLORS = ['#1e3a8a', '#b48c08', '#2563eb', '#64748b'];

  if (!stats) return <div className="flex animate-pulse space-x-4 p-8">Loading stats...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="group relative w-16 h-16 md:w-20 md:h-20 bg-white rounded-full p-1 shadow-md border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleLogoClick}
          >
            <img 
              src={logoUrl} 
              alt="HKBK Logo" 
              className="w-full h-full object-contain scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://www.hkbk.edu.in/assets/images/hkbk-logo.png";
              }}
              referrerPolicy="no-referrer"
            />
            {user.role === 'ADMIN' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingLogo ? (
                  <div className="animate-spin text-white"><Upload size={20} /></div>
                ) : (
                  <Camera className="text-white" size={20} />
                )}
              </div>
            )}
            <input 
              type="file" 
              ref={logoInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoChange}
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Welcome to HKBKCE, <span className="text-hkbk-blue">Examination Section</span></h1>
            <p className="text-gray-400 font-bold text-sm tracking-wide mt-1">STREAMLINING ACADEMIC EXCELLENCE & ASSESSMENT</p>
          </div>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Eligible List', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Results', value: stats.totalResults, icon: FileSpreadsheet, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Passouts', value: stats.passoutCount || 0, icon: GraduationCap, color: 'text-hkbk-gold', bg: 'bg-yellow-50' },
          { label: 'PHD scholars', value: stats.phdCount || 0, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pass Rate', value: `${stats.passPercentage}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <button className="text-gray-300 hover:text-hkbk-gold transition-colors">
                <ArrowUpRight size={20} />
              </button>
            </div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Semester Wise Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '2nd Semester', value: stats.grandTotals?.s2, color: 'border-b-hkbk-blue' },
          { label: '4th Semester', value: stats.grandTotals?.s4, color: 'border-b-hkbk-gold' },
          { label: '6th Semester', value: stats.grandTotals?.s6, color: 'border-b-hkbk-blue' },
          { label: '8th Semester', value: stats.grandTotals?.s8, color: 'border-b-hkbk-gold' },
        ].map((sem, i) => (
          <motion.div 
            key={sem.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-b-4 ${sem.color} flex items-center justify-between group hover:bg-hkbk-blue/5 transition-colors`}
          >
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sem.label}</p>
              <h4 className="text-2xl font-black text-gray-900 group-hover:text-hkbk-blue transition-colors">{sem.value}</h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-hkbk-blue/10 group-hover:text-hkbk-blue">
               <TrendingUp size={18} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Eligible List Summary Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <Users size={24} className="text-hkbk-blue" />
              Eligible List Matrix
            </h2>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Branch-Wise Enrollment Analysis • AY 2025-26</p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full border border-blue-700 shadow-lg shadow-blue-500/20 uppercase tracking-widest">
               Total: {stats.totalStudents}
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-[10px] uppercase tracking-wider text-gray-400 font-black border-b border-gray-100">
                <th className="px-6 py-5">Branch Name</th>
                <th className="px-6 py-5 text-center bg-gray-50/50">2nd Sem.</th>
                <th className="px-6 py-5 text-center">4th Sem.</th>
                <th className="px-6 py-5 text-center bg-gray-50/50">6th Sem.</th>
                <th className="px-6 py-5 text-center">8th Sem.</th>
                <th className="px-6 py-5 text-right bg-blue-50/50 text-hkbk-blue">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats.summaryTable || []).map((row: any) => (
                <tr key={row.branch} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-gray-800 uppercase tracking-tight italic">
                      {row.branch === 'Computer Science and Engineering' ? 'CSE' : 
                       row.branch === 'Information Science and Engineering' ? 'ISE' :
                       row.branch === 'Electronics and Communication Engineering' ? 'ECE' :
                       row.branch === 'Mechanical Engineering' ? 'ME' :
                       row.branch === 'Artificial Intelligence & Machine Learning' ? 'AI&ML' : 
                       row.branch}
                    </span>
                    <p className="text-[9px] text-gray-400 font-medium tracking-tighter -mt-1 uppercase">{row.branch}</p>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-gray-50/30">{row.s2}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">{row.s4}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-gray-50/30">{row.s6}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">{row.s8}</td>
                  <td className="px-6 py-4 text-right bg-blue-50/30">
                    <span className="text-sm font-black text-hkbk-blue">{row.total}</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-hkbk-blue border-t-4 border-hkbk-gold shadow-2xl relative z-10">
                <td className="px-6 py-5">
                  <span className="text-xs font-black text-white uppercase tracking-widest italic">Consolidated Totals</span>
                </td>
                <td className="px-6 py-5 text-center text-sm font-black text-white">{stats.grandTotals?.s2 || 0}</td>
                <td className="px-6 py-5 text-center text-sm font-black text-white">{stats.grandTotals?.s4 || 0}</td>
                <td className="px-6 py-5 text-center text-sm font-black text-white">{stats.grandTotals?.s6 || 0}</td>
                <td className="px-6 py-5 text-center text-sm font-black text-white">{stats.grandTotals?.s8 || 0}</td>
                <td className="px-6 py-5 text-right bg-hkbk-gold/20">
                  <span className="text-xl font-black text-hkbk-gold drop-shadow-sm">{stats.totalStudents}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Branch-wise Detailed Section */}
      <div className="bg-hkbk-blue rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-hkbk-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-hkbk-gold">Branch-wise Distribution</h2>
            <p className="text-blue-100 font-bold max-w-md leading-relaxed">
              Detailed analytical view of eligible student distribution across all engineering departments for the current academic session.
            </p>
            <div className="mt-8 space-y-4">
               {(stats.summaryTable || []).map((row: any, i:number) => (
                 <div key={i} className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-black uppercase tracking-widest">{row.branch === 'Computer Science and Engineering' ? 'CSE' : 
                       row.branch === 'Information Science and Engineering' ? 'ISE' :
                       row.branch === 'Electronics and Communication Engineering' ? 'ECE' :
                       row.branch === 'Mechanical Engineering' ? 'ME' :
                       row.branch === 'Artificial Intelligence & Machine Learning' ? 'AI&ML' : 
                       row.branch}</span>
                    <span className="text-hkbk-gold font-black">{row.total}</span>
                 </div>
               ))}
            </div>
          </div>
          <div className="h-[300px] w-full bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.summaryTable}>
                   <XAxis 
                      dataKey="branch" 
                      tick={false}
                      axisLine={false}
                   />
                   <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{backgroundColor: '#1e3a8a', border: 'none', borderRadius: '12px'}}
                   />
                   <Bar 
                      dataKey="total" 
                      fill="#b48c08" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                   />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pass/Fail Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Performance by Department
            </h2>
            <div className="flex gap-2">
              <select className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 outline-none">
                <option>2024 Batch</option>
                <option>2023 Batch</option>
              </select>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 10, fontWeight: 700}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 10}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pass" 
                  stroke="#1e3a8a" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                  name="Pass %" 
                />
                <Line 
                  type="monotone" 
                  dataKey="fail" 
                  stroke="#b48c08" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#b48c08', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                  name="Fail %" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classification Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Result Classification</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.classificationStats}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.classificationStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {stats.classificationStats.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-gray-600 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Notifications / Recent Activity */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Alerts</h2>
            <Bell size={18} className="text-gray-400" />
          </div>
          <div className="space-y-6">
            {[
              { type: 'result', time: '5m ago', text: '1st Semester Jan 2026 Results Uploaded' },
              { type: 'result', time: '1h ago', text: '3rd Semester Jan 2026 Analysis Completed' },
              { type: 'system', time: '4h ago', text: 'Database backup for 2025 Batch completed' },
              { type: 'exam', time: '1d ago', text: '8th Semester June 2025 Records Archived' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === 'result' ? 'bg-blue-500' : 
                    alert.type === 'security' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  {i !== 3 && <div className="absolute top-4 left-[3px] w-[2px] h-10 bg-gray-100" />}
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium group-hover:text-hkbk-blue transition-colors cursor-pointer">{alert.text}</p>
                  <span className="text-xs text-gray-400">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-semibold text-hkbk-blue bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            View All Logs
          </button>
        </div>
    </motion.div>
  );
}
