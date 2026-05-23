import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Users, Search, Filter, Upload, Download, GraduationCap, 
  MapPin, Loader2, CheckCircle2, XCircle, Award, 
  BookOpen, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface PhdScholar {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  gender: string;
  registrationDate: string;
  researchStatus: string;
  sourceFile?: string;
}

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default function Phd({ user }: { user: User }) {
  const [phdList, setPhdList] = useState<PhdScholar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'BRANCH'>('LIST');
  const [selectedScholar, setSelectedScholar] = useState<PhdScholar | null>(null);

  const fetchPhd = () => {
    fetch('/api/phd')
      .then(res => res.json())
      .then(data => setPhdList(data))
      .catch(err => console.error('Error fetching PHD list:', err));
  };

  useEffect(() => {
    fetchPhd();
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
      const response = await fetch('/api/phd/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadSuccess(true);
        setSelectedSource(result.filename);
        fetchPhd();
        setSelectedFile(null);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert('Failed: ' + result.error);
      }
    } catch (error) {
      alert('Connection error');
    } finally {
      setIsUploading(false);
      const input = document.getElementById('phd-upload') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const filteredPhd = phdList.filter(s => {
    const sName = s.name.toLowerCase();
    const sRoll = s.rollNo.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = sName.includes(query) || sRoll.includes(query);
    
    const sDept = (s.department || '').toUpperCase();
    const matchesDept = filterDept === 'ALL' || 
                        (filterDept === 'Computer Science and Engineering' && (sDept.includes('COMPUTER SCIENCE') || sDept.includes('CSE'))) ||
                        (filterDept === 'Information Science and Engineering' && (sDept.includes('INFORMATION SCIENCE') || sDept.includes('ISE'))) ||
                        (filterDept === 'Electronics and Communication Engineering' && (sDept.includes('ELECTRONICS') || sDept.includes('ECE'))) ||
                        (filterDept === 'Artificial Intelligence & Machine Learning' && (sDept.includes('ARTIFICIAL INTELLIGENCE') || sDept.includes('AI'))) ||
                        (filterDept === 'Mechanical Engineering' && (sDept.includes('MECHANICAL') || sDept.includes('ME'))) ||
                        (filterDept === 'MBA' && sDept.includes('MBA'));

    const matchesSource = !selectedSource || (s as any).sourceFile === selectedSource;
    return matchesSearch && matchesDept && matchesSource;
  });

  const groupedPhd = filteredPhd.reduce((acc, s) => {
    const dept = s.department || 'General';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(s);
    return acc;
  }, {} as Record<string, PhdScholar[]>);

  const TableHeader = () => (
    <thead className="bg-gray-50/50 sticky top-0 z-10">
      <tr>
        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Scholar Details</th>
        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Gender</th>
        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch</th>
        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Reg. Date</th>
        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
      </tr>
    </thead>
  );

  const ScholarRow = ({ scholar }: { scholar: PhdScholar; key?: string }) => (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setSelectedScholar(scholar)}
      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hkbk-blue/10 to-hkbk-gold/10 flex items-center justify-center text-hkbk-blue group-hover:scale-110 transition-transform">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="text-sm font-black text-gray-700 tracking-tight">{scholar.name}</div>
            <div className="text-[10px] font-bold text-hkbk-gold uppercase tracking-widest">{scholar.rollNo}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          "text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 w-fit",
          scholar.gender.toUpperCase() === 'FEMALE' ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"
        )}>
           {scholar.gender.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
          {scholar.department}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-black text-gray-700 whitespace-nowrap">{scholar.registrationDate}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 text-right">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
             scholar.researchStatus.toLowerCase().includes('completed') ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
             scholar.researchStatus.toLowerCase().includes('pursuing') ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" :
             "bg-gray-400"
          )} />
          <span className={cn(
            "text-xs font-bold whitespace-nowrap",
            scholar.researchStatus.toLowerCase().includes('completed') ? "text-green-600" :
            scholar.researchStatus.toLowerCase().includes('pursuing') ? "text-blue-600" :
            "text-gray-500"
          )}>{scholar.researchStatus}</span>
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Award className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">PHD <span className="text-indigo-600">Scholars</span></h1>
          </div>
          <p className="text-gray-400 font-bold text-sm tracking-wide ml-12">MANAGING RESEARCH SCHOLARS & ACADEMIC PROGRESS</p>
        </div>
        <div className="flex gap-2">
          {user.role === 'ADMIN' && (
            <div className="flex gap-2">
              <input
                type="file"
                id="phd-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 bg-indigo-50 p-1 rounded-xl border border-indigo-100 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 leading-none mb-1">PHD Data File</span>
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
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Confirm Push
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="phd-upload"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer",
                    uploadSuccess ? "bg-green-500 shadow-green-500/20" : "bg-indigo-600 shadow-indigo-600/20 hover:scale-[1.02]",
                    isUploading && "opacity-50 pointer-events-none"
                  )}
                >
                  {uploadSuccess ? (
                    <>
                      <CheckCircle2 size={16} />
                      Database Updated!
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Import Scholars
                    </>
                  )}
                </label>
              )}
            </div>
          )}
          <button 
            onClick={() => setViewMode(prev => prev === 'LIST' ? 'BRANCH' : 'LIST')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            {viewMode === 'LIST' ? <Filter size={16} /> : <Users size={16} />}
            {viewMode === 'LIST' ? 'Branch View' : 'List View'}
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50/50 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Scholars..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-100 transition-all font-medium shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {(searchTerm || filterDept !== 'ALL' || selectedSource) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDept('ALL');
                    setSelectedSource(null);
                  }}
                  className="px-3 py-2 bg-indigo-600/10 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600/20 transition-colors"
                >
                  Clear Filters
                </button>
              )}

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-600/10 font-bold text-gray-600 shadow-sm"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="ALL">All Departments</option>
                  <option value="Computer Science and Engineering">CSE</option>
                  <option value="Information Science and Engineering">ISE</option>
                  <option value="Electronics and Communication Engineering">ECE</option>
                  <option value="Artificial Intelligence & Machine Learning">AI&ML</option>
                  <option value="Mechanical Engineering">ME</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto relative">
            {viewMode === 'LIST' ? (
              <table className="w-full text-left border-collapse">
                <TableHeader />
                <tbody className="divide-y divide-gray-50 bg-white">
                  {filteredPhd.map((scholar) => (
                    <ScholarRow key={scholar.id} scholar={scholar} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="divide-y divide-gray-100">
                {(Object.entries(groupedPhd) as [string, PhdScholar[]][]).map(([branch, scholars]) => (
                  <div key={branch} className="bg-white">
                    <div className="bg-gray-50 px-6 py-3 border-y border-gray-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                      <h3 className="text-[12px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {branch}
                      </h3>
                      <span className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-400 font-black">
                        {scholars.length} SCHOLARS
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <TableHeader />
                        <tbody className="divide-y divide-gray-50">
                          {scholars.map((scholar) => (
                            <ScholarRow key={scholar.id} scholar={scholar} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredPhd.length === 0 && (
              <div className="p-20 text-center">
                <Award className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-gray-500 font-medium italic">No research scholars found.</p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 flex justify-between items-center shrink-0 font-bold uppercase">
            <span>Showing {filteredPhd.length} Research Scholars</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Academic Registry V2.0
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedScholar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedScholar(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-hkbk-blue p-8 text-white relative">
                <button 
                  onClick={() => setSelectedScholar(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <GraduationCap size={40} className="text-hkbk-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedScholar.name}</h2>
                    <p className="text-hkbk-gold font-bold tracking-widest text-sm uppercase">{selectedScholar.rollNo}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Department</span>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-indigo-600">
                        <Users size={16} />
                      </div>
                      <span className="font-bold">{selectedScholar.department}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Registration Status</span>
                    <div className="flex items-center gap-2">
                       <div className={cn(
                        "w-3 h-3 rounded-full mr-1 shadow-sm",
                        selectedScholar.researchStatus.toLowerCase().includes('completed') ? "bg-green-500" :
                        selectedScholar.researchStatus.toLowerCase().includes('pursuing') ? "bg-blue-500" : "bg-gray-400"
                      )} />
                      <span className="font-black text-gray-900">{selectedScholar.researchStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Academic Benchmarks</span>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Gender</span>
                        <span className="font-black text-gray-900 uppercase tracking-wider">{selectedScholar.gender}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Reg. Date</span>
                        <span className="font-black text-gray-900">{selectedScholar.registrationDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                    <CheckCircle2 size={14} className="text-green-500" />
                    Verified Official Record
                 </div>
                 <button 
                  onClick={() => setSelectedScholar(null)}
                  className="px-6 py-2 bg-hkbk-blue text-white rounded-xl text-sm font-black hover:bg-hkbk-blue/90 transition-all shadow-lg shadow-hkbk-blue/20"
                 >
                   Close Details
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
