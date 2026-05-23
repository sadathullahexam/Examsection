import { useState, useEffect, ChangeEvent } from 'react';
import { 
  Award, 
  Search,
  Download,
  Filter,
  Eye,
  ArrowUpDown,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Users,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Student } from '../types';
import { cn } from '../lib/utils';

export default function Passouts({ user }: { user: User }) {
  const [passouts, setPassouts] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'BRANCH'>('LIST');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchPassouts = () => {
    fetch('/api/passouts')
      .then(res => res.json())
      .then(data => {
        setPassouts(data);
      });
  };

  useEffect(() => {
    fetchPassouts();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      const response = await fetch('/api/passouts/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadSuccess(true);
        setSelectedSource(result.filename);
        fetchPassouts();
        fetchLogs();
        setSelectedFile(null);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert('Failed: ' + result.error);
      }
    } catch (error) {
      alert('Connection error');
    } finally {
      setIsUploading(false);
      // Reset input
      const input = document.getElementById('passout-upload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  // Get unique years from the data for the filter
  const availableYears = Array.from(new Set(passouts.map(s => s.passoutYear).filter(Boolean))).sort();

  const departmentTabs = [
    { id: 'ALL', label: 'All Alumni' },
    { id: 'Artificial Intelligence & Machine Learning', label: 'AI & ML' },
    { id: 'Computer Science and Engineering', label: 'CSE' },
    { id: 'Electronics and Communication Engineering', label: 'ECE' },
    { id: 'Information Science and Engineering', label: 'ISE' },
    { id: 'Mechanical Engineering', label: 'ME' },
  ];

  const filteredPassouts = passouts.filter(s => {
    const name = s.name || '';
    const rollNo = s.rollNo || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'ALL' || s.passoutYear === filterYear;
    
    const sDept = s.department || '';
    const matchesDept = filterDept === 'ALL' || 
                        sDept === filterDept || 
                        (filterDept === 'Computer Science and Engineering' && (sDept.includes('Computer Science') || sDept.includes('CS'))) ||
                        (filterDept === 'Electronics and Communication Engineering' && (sDept.includes('Electronics') || sDept.includes('EC'))) ||
                        (filterDept === 'Information Science and Engineering' && (sDept.includes('Information Science') || sDept.includes('IS'))) ||
                        (filterDept === 'Artificial Intelligence & Machine Learning' && (sDept.includes('Artificial Intelligence') || sDept.includes('AI'))) ||
                        (filterDept === 'Mechanical Engineering' && (sDept.includes('Mechanical') || sDept.includes('ME')));

    const matchesSource = !selectedSource || (s as any).sourceFile === selectedSource;
    return matchesSearch && matchesYear && matchesDept && matchesSource;
  });

  // Grouping logic for branch-wise view
  const groupedPassouts = filteredPassouts.reduce((acc, student) => {
    const dept = student.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const exportToCSV = () => {
    if (filteredPassouts.length === 0) return;
    
    const headers = ["USN", "Name", "Branch", "Scheme", "Gender", "Category", "Passout Year", "Class", "CGPA"];
    const rows = filteredPassouts.map(s => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.scheme || 'N/A'}"`,
      `"${s.gender || 'N/A'}"`,
      `"${s.category || 'N/A'}"`,
      `"${s.passoutYear || 'N/A'}"`,
      `"${s.obtainClass || 'N/A'}"`,
      s.cgpa?.toFixed(2) || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `HKBK_Passouts_${filterYear === 'ALL' ? 'All' : filterYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TableHeader = () => (
    <thead className="sticky top-0 z-10">
      <tr className="bg-gray-900 text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-800">
        <th className="px-6 py-4">USN</th>
        <th className="px-6 py-4">Student Name</th>
        <th className="px-6 py-4">Branch</th>
        <th className="px-6 py-4 text-center">Scheme</th>
        <th className="px-6 py-4 text-center">Gender</th>
        <th className="px-6 py-4 text-center">Category</th>
        <th className="px-6 py-4 text-center">Passout Year</th>
        <th className="px-6 py-4 text-center">Class</th>
        <th className="px-6 py-4 text-center">CGPA</th>
        <th className="px-6 py-4 text-center">Actions</th>
      </tr>
    </thead>
  );

  const StudentRow = ({ student }: { student: Student }) => (
    <tr 
      key={student.id} 
      onClick={() => setSelectedStudent(student)}
      className="hover:bg-blue-50/30 transition-colors group text-[11px] uppercase font-bold cursor-pointer"
    >
      <td className="px-6 py-4 font-mono text-hkbk-blue whitespace-nowrap">
        {student.rollNo}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
        {student.name}
      </td>
      <td className="px-6 py-4 text-gray-500 font-bold text-[9px]">
        {student.department === 'Computer Science and Engineering' ? 'CSE' : 
         student.department === 'Information Science and Engineering' ? 'ISE' :
         student.department === 'Electronics and Communication Engineering' ? 'ECE' :
         student.department === 'Mechanical Engineering' ? 'ME' :
         student.department === 'Artificial Intelligence & Machine Learning' ? 'AI&ML' : 
         student.department || 'N/A'}
      </td>
      <td className="px-6 py-4 text-center text-hkbk-gold font-black italic">
        {student.scheme || 'N/A'}
      </td>
      <td className="px-6 py-4 text-center text-gray-600">
        <span className={cn(
            "px-2 py-1 rounded-md",
            student.gender === 'FEMALE' ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"
        )}>
            {student.gender || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-gray-600 font-black">{student.category || 'N/A'}</td>
      <td className="px-6 py-4 text-center text-gray-600 font-mono">{student.passoutYear || 'N/A'}</td>
      <td className="px-6 py-4 text-center">
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black",
          student.obtainClass === 'FCD' ? "bg-hkbk-gold text-white" : 
          student.obtainClass === 'FC' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
        )}>
          {student.obtainClass || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4 text-center font-mono text-gray-900">
        {student.cgpa?.toFixed(2) || 'N/A'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 text-gray-400 hover:text-hkbk-blue hover:bg-blue-50 rounded-lg transition-colors">
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="text-hkbk-gold" size={28} />
            Passout Students Directory
          </h1>
          <p className="text-[11px] font-black text-hkbk-blue uppercase tracking-widest mt-1 bg-blue-50/50 inline-block px-2 py-0.5 rounded border border-blue-100">
            8th Semester 2021 Batch (2021 Scheme) • June/July 2025 Examination
          </p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm font-medium">
              Found {passouts.length} records • showing {filteredPassouts.length}
            </p>
            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button 
                onClick={() => setViewMode('LIST')}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all",
                  viewMode === 'LIST' ? "bg-white text-hkbk-blue shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                List
              </button>
              <button 
                onClick={() => setViewMode('BRANCH')}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all",
                  viewMode === 'BRANCH' ? "bg-white text-hkbk-blue shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Branch
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {user.role === 'ADMIN' && (
            <div className="flex gap-2">
              <input
                type="file"
                id="passout-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 bg-yellow-50 p-1 rounded-xl border border-yellow-100 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-hkbk-gold leading-none mb-1">Passouts File</span>
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{selectedFile.name}</span>
                  </div>
                  <div className="flex gap-1 pr-1">
                    <button 
                       onClick={() => setSelectedFile(null)}
                       className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XCircle size={16} />
                    </button>
                    <button 
                      onClick={handlePushImport}
                      disabled={isUploading}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-hkbk-gold text-white rounded-lg text-xs font-bold shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Confirm Push
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="passout-upload"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer",
                    uploadSuccess ? "bg-green-500 shadow-green-500/20" : "bg-hkbk-gold shadow-hkbk-gold/20 hover:scale-[1.02]",
                    isUploading && "opacity-50 pointer-events-none"
                  )}
                >
                  {uploadSuccess ? (
                    <>
                      <CheckCircle2 size={16} />
                      Alumni Updated!
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Import Records
                    </>
                  )}
                </label>
              )}
            </div>
          )}
          <button 
            onClick={exportToCSV}
            disabled={filteredPassouts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-hkbk-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Download size={16} /> Export List
          </button>
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50/50 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by USN or Name..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hkbk-blue/10 focus:border-hkbk-blue transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 text-[10px] items-center">
                {(searchTerm || filterYear !== 'ALL' || filterDept !== 'ALL' || selectedSource) && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterYear('ALL');
                      setFilterDept('ALL');
                      setSelectedSource(null);
                    }}
                    className="px-3 py-2 bg-hkbk-blue/10 text-hkbk-blue rounded-xl text-xs font-bold hover:bg-hkbk-blue/20 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-hkbk-blue/10 font-bold text-gray-600"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <option value="ALL">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto relative">
              {viewMode === 'LIST' ? (
                <table className="w-full text-left border-collapse">
                  <TableHeader />
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filteredPassouts.map((student) => (
                      <StudentRow key={student.id} student={student} />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Object.entries(groupedPassouts).map(([branch, students]) => (
                    <div key={branch} className="bg-white">
                      <div className="bg-gray-50 px-6 py-3 border-y border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                        <h3 className="text-[12px] font-black text-hkbk-blue uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-hkbk-gold shadow-glow shadow-hkbk-gold" />
                          {branch}
                        </h3>
                        <span className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-400 font-black">
                          {students.length} GRADUATES
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <TableHeader />
                          <tbody className="divide-y divide-gray-50">
                            {students.map((student) => (
                              <StudentRow key={student.id} student={student} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {filteredPassouts.length === 0 && (
                <div className="p-20 text-center">
                  <Award className="mx-auto text-gray-200 mb-4" size={64} />
                  <p className="text-gray-500 font-medium italic">No passout records found matching your criteria.</p>
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 flex justify-between items-center shrink-0 font-bold uppercase">
              <span>Showing {filteredPassouts.length} Verified Alumni</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" /> System Secure & Encrypted
              </span>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden shadow-hkbk-gold/10 border border-gray-100"
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
                  <div className="w-20 h-20 bg-hkbk-gold/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Award size={40} className="text-hkbk-gold" />
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
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Branch / Department</span>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-hkbk-blue">
                        <Users size={16} />
                      </div>
                      <span className="font-bold">{selectedStudent.department}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Graduation Year</span>
                      <span className="font-black text-gray-900 border-b-2 border-hkbk-gold/20 pb-0.5">{selectedStudent.passoutYear}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Class Obtained</span>
                      <span className="font-black text-gray-900">{selectedStudent.obtainClass}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Academic Honor</span>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                          selectedStudent.obtainClass === 'FCD' ? "bg-hkbk-gold/10 text-hkbk-gold" : "bg-blue-50 text-hkbk-blue"
                        )}>
                          {selectedStudent.obtainClass} Graduate
                        </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Alumni Record Details</span>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold flex items-center gap-2">
                           <BookOpen size={14} className="text-gray-400" /> Academic Scheme
                        </span>
                        <span className="font-black text-gray-900 uppercase tracking-wider">{selectedStudent.scheme || 'N/A'}</span>
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
                    <div className="bg-hkbk-blue/5 rounded-2xl p-4 border border-hkbk-blue/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-hkbk-blue uppercase tracking-widest block mb-1">Final CGPA</span>
                          <span className="text-2xl font-black text-hkbk-gold">{selectedStudent.cgpa.toFixed(2)}</span>
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
                    Verified Alumni Credential
                 </div>
                 <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2 bg-hkbk-blue text-white rounded-xl text-sm font-black hover:bg-hkbk-blue/90 transition-all shadow-lg shadow-hkbk-blue/20"
                 >
                   Close Alumni View
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

