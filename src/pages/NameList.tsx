import React, { useState, useEffect, useRef } from 'react';
import { 
  FileUp, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  AlertCircle,
  Eye,
  Edit2,
  Loader2,
  CheckCircle2,
  History,
  XCircle,
  GraduationCap,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Student } from '../types';
import { cn } from '../lib/utils';

export default function NameList({ user }: { user: User }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterSem, setFilterSem] = useState('ALL');
  const [filterQuota, setFilterQuota] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  };

  const fetchStats = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  };

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePushImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/students/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadSuccess(true);
        setSelectedSource(data.filename); // Automatically filter to show new data
        fetchStudents();
        setSelectedFile(null); // Clear selection
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert('Failed to import students: ' + data.error);
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Improved department matching
    const matchesDept = filterDept === 'ALL' || 
                        s.department === filterDept || 
                        (filterDept === 'Computer Science and Engineering' && (s.department.includes('Computer Science') || s.department.includes('CS'))) ||
                        (filterDept === 'Electronics and Communication Engineering' && (s.department.includes('Electronics') || s.department.includes('EC'))) ||
                        (filterDept === 'Information Science and Engineering' && (s.department.includes('Information Science') || s.department.includes('IS'))) ||
                        (filterDept === 'Artificial Intelligence & Machine Learning' && (s.department.includes('Artificial Intelligence') || s.department.includes('AI'))) ||
                        (filterDept === 'Mechanical Engineering' && (s.department.includes('Mechanical') || s.department.includes('ME')));
    
    const matchesSem = filterSem === 'ALL' || s.semester.toString() === filterSem;
    const matchesQuota = filterQuota === 'ALL' || s.quota === filterQuota;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && (s.status === 'ACTIVE' || s.status === 'PASSOUT')) ||
                         (filterStatus === 'DETAINED' && s.status === 'DETAINED');
    
    const matchesSource = !selectedSource || (s as any).sourceFile === selectedSource;
    return matchesSearch && matchesDept && matchesSem && matchesQuota && matchesStatus && matchesSource;
  });

  const departmentTabs = [
    { id: 'ALL', label: 'All Students' },
    { id: 'Artificial Intelligence & Machine Learning', label: 'AI & ML' },
    { id: 'Computer Science and Engineering', label: 'CSE' },
    { id: 'Electronics and Communication Engineering', label: 'ECE' },
    { id: 'Information Science and Engineering', label: 'ISE' },
    { id: 'Mechanical Engineering', label: 'ME' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Eligible List</h1>
          <p className="text-gray-500 text-sm">Official Academic Eligibility Directory • AY 2025-26</p>
        </div>
        {user.role === 'ADMIN' && (
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <div className="flex items-center gap-2 bg-blue-50 p-1 rounded-lg border border-blue-100 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-blue-500 leading-none mb-1">Selected File</span>
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{selectedFile.name}</span>
                </div>
                <div className="flex gap-1 pr-1">
                  <button 
                     onClick={() => setSelectedFile(null)}
                     className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <AlertCircle size={16} />
                  </button>
                  <button 
                    onClick={handlePushImport}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-hkbk-blue text-white rounded-md text-xs font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />}
                    Confirm Push
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleImportClick}
                disabled={isUploading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all shadow-sm",
                  uploadSuccess ? "bg-green-500 hover:bg-green-600" : "bg-hkbk-blue hover:bg-hkbk-blue/90",
                  isUploading && "opacity-75 cursor-not-allowed"
                )}
              >
                {uploadSuccess ? (
                  <>
                    <CheckCircle2 size={16} />
                    Uploaded & Updated!
                  </>
                ) : (
                  <>
                    <FileUp size={16} />
                    Import Records
                  </>
                )}
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
              <Download size={16} />
              Export Directory
            </button>
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-hkbk-blue p-5 rounded-3xl text-white shadow-xl shadow-blue-900/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Total Eligible</p>
            <h3 className="text-3xl font-black">{stats.grandTotals.total}</h3>
            <p className="text-[10px] font-bold text-blue-300 mt-1 uppercase">Across all Batches</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm border-b-4 border-b-hkbk-gold">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 text-hkbk-blue">2nd Semester</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.grandTotals.s2}</h3>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Current Students</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm border-b-4 border-b-hkbk-blue">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 text-hkbk-blue">4th Semester</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.grandTotals.s4}</h3>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Current Students</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm border-b-4 border-b-hkbk-gold">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 text-hkbk-blue">6th Semester</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.grandTotals.s6}</h3>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Current Students</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm border-b-4 border-b-hkbk-blue">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 text-hkbk-blue">8th Semester</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.grandTotals.s8}</h3>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Final Year</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* Branch Summary Table */}
           {stats && (
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden">
               <div className="p-5 border-b-2 border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                    <Users size={18} className="text-hkbk-blue" />
                    Branch-Wise Enrollment Analysis
                  </h2>
                  <span className="px-3 py-1 bg-hkbk-gold/10 text-hkbk-gold text-[10px] font-black rounded-full uppercase">Verified Data</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Branch / Department</th>
                        <th className="px-4 py-4 text-center">2nd Sem</th>
                        <th className="px-4 py-4 text-center">4th Sem</th>
                        <th className="px-4 py-4 text-center">6th Sem</th>
                        <th className="px-4 py-4 text-center">8th Sem</th>
                        <th className="px-6 py-4 text-right">Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {stats.summaryTable.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors uppercase">
                          <td className="px-6 py-4 font-bold text-gray-900 text-xs tracking-tight">{row.branch}</td>
                          <td className="px-4 py-4 text-center font-bold text-hkbk-blue text-xs">{row.s2}</td>
                          <td className="px-4 py-4 text-center font-bold text-gray-700 text-xs">{row.s4}</td>
                          <td className="px-4 py-4 text-center font-bold text-hkbk-blue text-xs">{row.s6}</td>
                          <td className="px-4 py-4 text-center font-bold text-gray-700 text-xs">{row.s8}</td>
                          <td className="px-6 py-4 text-right font-black text-hkbk-blue text-xs bg-blue-50/50">{row.total}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
           )}
        </div>

        <div className="lg:col-span-1">
           <div className="bg-hkbk-blue rounded-3xl p-6 text-white h-full flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <History className="text-hkbk-gold mb-4" size={32} />
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Real-Time Data<br/>Synchronization</h3>
                <p className="text-blue-100 text-xs font-medium leading-relaxed mb-6">
                  Student enrollment counts are updated automatically as USN records are imported or modified by the administration.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-hkbk-gold scale-up-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Database Connection</span>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {departmentTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterDept(tab.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
              filterDept === tab.id 
                ? "bg-hkbk-blue text-white border-hkbk-blue shadow-lg shadow-blue-500/20" 
                : "bg-white text-gray-500 border-gray-200 hover:border-hkbk-blue hover:text-hkbk-blue"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full">
        <div className="w-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50/50 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, USN..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hkbk-blue/10 focus:border-hkbk-blue transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-hkbk-blue/10"
                    value={filterSem}
                    onChange={(e) => setFilterSem(e.target.value)}
                  >
                    <option value="ALL">All Semesters</option>
                    <option value="2">2nd Sem</option>
                    <option value="4">4th Sem</option>
                    <option value="6">6th Sem</option>
                    <option value="8">8th Sem</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-hkbk-blue/10"
                    value={filterQuota}
                    onChange={(e) => setFilterQuota(e.target.value)}
                  >
                    <option value="ALL">All Quotas</option>
                    <option value="GOVT">GOVT</option>
                    <option value="MGMT">MGMT</option>
                    <option value="CET">CET</option>
                    <option value="COMEDK">COMEDK</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-hkbk-blue/10"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DETAINED">Detained</option>
                  </select>
                </div>
                {selectedSource && (
                  <button 
                    onClick={() => setSelectedSource(null)}
                    className="px-3 py-2 bg-hkbk-blue/10 text-hkbk-blue rounded-xl text-xs font-bold hover:bg-hkbk-blue/20 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto relative">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                    <th className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm">USN</th>
                    <th className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm">Student Name</th>
                    <th className="px-4 py-4 text-center bg-gray-50/80 backdrop-blur-sm">Sem</th>
                    <th className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm">Gender</th>
                    <th className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm">Category</th>
                    <th className="px-6 py-4 text-center bg-gray-50/80 backdrop-blur-sm">Quota</th>
                    <th className="px-6 py-4 text-center bg-gray-50/80 backdrop-blur-sm">Scheme</th>
                    <th className="px-6 py-4 text-center bg-gray-50/80 backdrop-blur-sm">Status</th>
                    <th className="px-6 py-4 text-center bg-gray-50/80 backdrop-blur-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      className="hover:bg-blue-50/30 transition-colors group text-[10px] uppercase cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-gray-700 whitespace-nowrap">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{student.name}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-black text-[10px]">
                          {student.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{student.gender || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600">{student.category || 'N/A'}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{student.quota || 'N/A'}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-mono">{student.scheme || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full font-bold",
                          (student.status === 'ACTIVE' || student.status === 'PASSOUT') ? "bg-green-100 text-green-800" : 
                          "bg-red-100 text-red-800"
                        )}>
                          {student.status === 'PASSOUT' ? 'ACTIVE' : student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-gray-400 hover:text-hkbk-blue hover:bg-blue-50 rounded-lg transition-colors" title="View Profile">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-500 font-medium">
                  Showing {filteredStudents.length} {filteredStudents.length === 1 ? 'eligible record' : 'eligible records'}
                </div>
              )}
              {filteredStudents.length === 0 && (
                <div className="p-12 text-center">
                  <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
                    <Search size={32} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500">No students found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden shadow-hkbk-blue/10 border border-gray-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-hkbk-blue p-8 text-white relative">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <GraduationCap size={40} className="text-hkbk-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h2>
                    <p className="text-hkbk-gold font-bold tracking-widest text-sm uppercase">{selectedStudent.rollNo}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Department</span>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-hkbk-blue">
                        <Users size={16} />
                      </div>
                      <span className="font-bold">{selectedStudent.department}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Batch</span>
                      <span className="font-black text-gray-900 border-b-2 border-hkbk-gold/20 pb-0.5">{selectedStudent.batch}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Semester</span>
                      <span className="font-black text-gray-900">{selectedStudent.semester}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Academic Status</span>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                          selectedStudent.status === 'ACTIVE' || selectedStudent.status === 'PASSOUT' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        )}>
                          {selectedStudent.status}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Other Details</span>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold flex items-center gap-2">
                           <BookOpen size={14} className="text-gray-400" /> Scheme
                        </span>
                        <span className="font-black text-gray-900 uppercase tracking-wider">{selectedStudent.scheme || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Quota</span>
                        <span className="font-black text-gray-900">{selectedStudent.quota || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Category</span>
                        <span className="font-black text-gray-900">{selectedStudent.category || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Gender</span>
                        <span className="font-black text-gray-900 uppercase">{selectedStudent.gender || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {selectedStudent.cgpa && (
                    <div className="bg-hkbk-gold/10 rounded-2xl p-4 border border-hkbk-gold/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-hkbk-gold uppercase tracking-widest block mb-1">Current CGPA</span>
                          <span className="text-2xl font-black text-hkbk-blue">{selectedStudent.cgpa}</span>
                        </div>
                        <Award size={32} className="text-hkbk-gold" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Verified Official Record
                 </div>
                 <div className="flex gap-3">
                   <button 
                    onClick={() => setSelectedStudent(null)}
                    className="px-6 py-2 bg-hkbk-blue text-white rounded-xl text-sm font-black hover:bg-hkbk-blue/90 transition-all shadow-lg shadow-hkbk-blue/20"
                   >
                     Close View
                   </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
