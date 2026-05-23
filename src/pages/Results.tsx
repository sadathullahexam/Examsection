import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Printer, 
  Search, 
  Lock, 
  History,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Download,
  Filter,
  MoreVertical,
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'motion/react';
import { User, Result } from '../types';
import { cn } from '../lib/utils';

// Extending Result type for UI display as server sends extra fields
interface DisplayResult extends Result {
  studentName?: string;
  rollNo?: string;
}

export default function Results({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'VIEW' | 'UPLOAD' | 'REPORTS' | 'LOGS'>('VIEW');
  const [results, setResults] = useState<DisplayResult[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All Batches');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<'1st' | '3rd' | '5th' | '7th' | '8th'>('1st');

  const analysisData = {
    "1st": {
      subtitle: "1st Semester 2025 Batch (2025 Scheme)",
      exam: "January 2026 Examination",
      data: [
        { branch: 'Artificial Intelligence & Machine Learning', applied: 123, appeared: 123, pass: 82, fail: 41, percentage: '66.67%' },
        { branch: 'Computer Science and Engineering', applied: 365, appeared: 365, pass: 228, fail: 137, percentage: '62.47%' },
        { branch: 'Electronics and Communication Engineering', applied: 172, appeared: 172, pass: 104, fail: 68, percentage: '60.47%' },
        { branch: 'Information Science and Engineering', applied: 112, appeared: 112, pass: 70, fail: 42, percentage: '62.50%' },
        { branch: 'Mechanical Engineering', applied: 30, appeared: 30, pass: 15, fail: 15, percentage: '50.00%' },
        { branch: 'Over All College Results', applied: 802, appeared: 802, pass: 499, fail: 303, percentage: '62.22%' },
      ]
    },
    "3rd": {
      subtitle: "3rd Semester 2024 Batch (2022 Scheme)",
      exam: "January 2026 Examination",
      data: [
        { branch: 'Artificial Intelligence & Machine Learning', applied: 115, appeared: 115, pass: 65, fail: 50, percentage: '56.52%' },
        { branch: 'Computer Science and Engineering', applied: 317, appeared: 317, pass: 190, fail: 127, percentage: '59.94%' },
        { branch: 'Electronics and Communication Engineering', applied: 166, appeared: 166, pass: 54, fail: 112, percentage: '32.53%' },
        { branch: 'Information Science and Engineering', applied: 118, appeared: 118, pass: 70, fail: 48, percentage: '59.32%' },
        { branch: 'Mechanical Engineering', applied: 34, appeared: 34, pass: 8, fail: 26, percentage: '23.53%' },
        { branch: 'Over All College Results', applied: 750, appeared: 750, pass: 387, fail: 363, percentage: '51.60%' },
      ]
    },
    "5th": {
      subtitle: "5th Semester 2023 Batch (2022 Scheme)",
      exam: "January 2026 Examination",
      data: [
        { branch: 'Artificial Intelligence & Machine Learning', applied: 66, appeared: 66, pass: 46, fail: 20, percentage: '69.70%' },
        { branch: 'Computer Science and Engineering', applied: 197, appeared: 197, pass: 148, fail: 49, percentage: '75.12%' },
        { branch: 'Electronics and Communication Engineering', applied: 199, appeared: 199, pass: 95, fail: 104, percentage: '47.74%' },
        { branch: 'Information Science and Engineering', applied: 123, appeared: 123, pass: 94, fail: 29, percentage: '76.42%' },
        { branch: 'Mechanical Engineering', applied: 15, appeared: 15, pass: 4, fail: 11, percentage: '26.67%' },
        { branch: 'Over All College Results', applied: 600, appeared: 600, pass: 387, fail: 213, percentage: '64.50%' },
      ]
    },
    "7th": {
      subtitle: "7th Semester 2022 Batch (2022 Scheme)",
      exam: "January 2026 Examination",
      data: [
        { branch: 'Artificial Intelligence & Machine Learning', applied: 66, appeared: 66, pass: 62, fail: 4, percentage: '93.93%' },
        { branch: 'Computer Science and Engineering', applied: 192, appeared: 192, pass: 162, fail: 30, percentage: '84.38%' },
        { branch: 'Electronics and Communication Engineering', applied: 185, appeared: 185, pass: 150, fail: 35, percentage: '81.08%' },
        { branch: 'Information Science and Engineering', applied: 124, appeared: 124, pass: 114, fail: 10, percentage: '91.93%' },
        { branch: 'Mechanical Engineering', applied: 12, appeared: 12, pass: 6, fail: 6, percentage: '50.00%' },
        { branch: 'Over All College Results', applied: 579, appeared: 579, pass: 494, fail: 85, percentage: '85.32%' },
      ]
    },
    "8th": {
      subtitle: "8th Semester 2021 Batch (2018 Scheme)",
      exam: "June/July 2025 Examination",
      data: [
        { branch: 'Artificial Intelligence & Machine Learning', applied: 56, appeared: 56, pass: 53, fail: 3, percentage: '94.64%' },
        { branch: 'Computer Science and Engineering', applied: 188, appeared: 188, pass: 187, fail: 1, percentage: '99.47%' },
        { branch: 'Electronics and Communication Engineering', applied: 133, appeared: 133, pass: 132, fail: 1, percentage: '99.25%' },
        { branch: 'Information Science and Engineering', applied: 111, appeared: 111, pass: 111, fail: 0, percentage: '100.00%' },
        { branch: 'Mechanical Engineering', applied: 13, appeared: 13, pass: 13, fail: 0, percentage: '100.00%' },
        { branch: 'Over All College Results', applied: 501, appeared: 501, pass: 496, fail: 5, percentage: '99.00%' },
      ]
    }
  };

  const batches = ['All Batches', ...new Set(results.map((r: any) => r.batch).filter(Boolean))];

  const [viewMode, setViewMode] = useState<'INDIVIDUAL' | 'SUMMARY'>('SUMMARY');

  const branchSummary = [
    { branch: 'Artificial Intelligence & Machine Learning', applied: 56, appeared: 56, pass: 53, fail: 3, percentage: '94.64%' },
    { branch: 'Computer Science and Engineering', applied: 188, appeared: 188, pass: 187, fail: 1, percentage: '99.47%' },
    { branch: 'Electronics and Communication Engineering', applied: 133, appeared: 133, pass: 132, fail: 1, percentage: '99.25%' },
    { branch: 'Information Science and Engineering', applied: 111, appeared: 111, pass: 111, fail: 0, percentage: '100.00%' },
    { branch: 'Mechanical Engineering', applied: 13, appeared: 13, pass: 13, fail: 0, percentage: '100.00%' },
    { branch: 'Over All College Results', applied: 501, appeared: 501, pass: 496, fail: 5, percentage: '99.00%' },
  ];

  useEffect(() => {
    if (activeTab === 'VIEW' || activeTab === 'LOGS' || activeTab === 'REPORTS') {
      setIsLoading(true);
      const endpoint = activeTab === 'VIEW' ? '/api/results' : activeTab === 'LOGS' ? '/api/logs' : '/api/stats';
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          if (activeTab === 'VIEW') setResults(data);
          else if (activeTab === 'LOGS') setLogs(data);
          else if (activeTab === 'REPORTS') setStats(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [activeTab]);

  const filteredResults = results.filter(r => {
    const matchesSearch = 
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type cast r as any to access properties
    const matchesBatch = selectedBatch === 'All Batches' || (r as any).batch === selectedBatch;
    const matchesSource = !selectedSource || (r as any).sourceFile === selectedSource;
    
    return matchesSearch && matchesBatch && matchesSource;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const [uploadStats, setUploadStats] = useState<{count: number, filename: string} | null>(null);

  const handlePushUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      setIsUploading(false);
      if (data.success) {
        if (data.count === 0) {
          alert('No records could be parsed from this file. Please check the format.');
          return;
        }
        setUploadStats({ count: data.count, filename: data.filename });
        setUploadSuccess(true);
        setSelectedSource(data.filename);
        setSelectedFile(null); // Clear selected file
        // We don't automatically redirect as quickly, or we let the user manual click
      } else {
        alert('Upload failed: ' + data.error);
      }
    })
    .catch((err) => {
      setIsUploading(false);
      alert('Request failed');
    });
  };

  const handleCloseSuccess = () => {
    setUploadSuccess(false);
    setActiveTab('VIEW');
  };

  const downloadTemplate = () => {
    const csvContent = "rollNo,courseCode,internalMarks,externalMarks\nHK-CS-001,CS601,28,62";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'hkbk_results_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Result Analysis</h1>
          <p className="text-gray-500 text-sm">
            {analysisData[selectedSemester].subtitle} • {analysisData[selectedSemester].exam}
          </p>
        </div>
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          {[
            { id: 'VIEW', label: 'View Analysis', icon: FileSpreadsheet },
            { id: 'UPLOAD', label: 'Upload New', icon: Upload },
            { id: 'LOGS', label: 'Activity Log', icon: History },
            { id: 'REPORTS', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-hkbk-blue text-white shadow-md" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'LOGS' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Audit & Upload History</h3>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">LIVE REFRESH</span>
            </div>
            {logs.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    onClick={() => {
                      if (log.filename) {
                        setSelectedSource(log.filename);
                        setActiveTab('VIEW');
                      }
                    }}
                    className={cn(
                      "p-4 hover:bg-gray-50 transition-colors flex items-start gap-4",
                      log.filename ? "cursor-pointer group" : "opacity-80"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      log.action.includes('Upload') ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {log.action.includes('Upload') ? <Upload size={16} /> : <History size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("font-bold text-gray-900", log.filename && "group-hover:text-hkbk-blue")}>
                          {log.action}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-500 text-xs truncate">{log.details}</p>
                      {log.filename && (
                        <div className="mt-2 flex items-center gap-2">
                           <span className="text-[9px] bg-blue-50 text-hkbk-blue px-1.5 py-0.5 rounded font-bold uppercase">Click to View Data</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">No activity logs found.</div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'VIEW' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
            {(['1st', '3rd', '5th', '7th', '8th'] as const).map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  selectedSemester === sem 
                    ? "bg-white text-hkbk-blue shadow-sm scale-105" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {sem} Sem
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Integrity Status</h4>
              <div className="flex items-center gap-3 text-green-600">
                <Lock size={20} />
                <span className="text-sm font-semibold">Records are Tamper-Protected</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Verification</h4>
              <div className="flex items-center gap-3 text-hkbk-gold">
                <FileCheck size={20} />
                <span className="text-sm font-semibold">Digitally Signed by Principal</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Last Updated</h4>
              <div className="flex items-center gap-3 text-blue-600">
                <History size={20} />
                <span className="text-sm font-semibold">{analysisData[selectedSemester].exam}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">HKBK College of Engineering, Bengaluru.</h2>
                <div className="flex flex-col mt-1">
                  <p className="text-sm text-hkbk-blue font-black uppercase tracking-widest">Result Analysis {analysisData[selectedSemester].subtitle}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{analysisData[selectedSemester].exam} Final Results</p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => window.location.href = '/api/export'}
                  className="flex items-center gap-2 px-4 py-2 bg-hkbk-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Download size={16} />
                  Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-gray-100">
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4 text-center">Applied</th>
                    <th className="px-6 py-4 text-center">Appeared</th>
                    <th className="px-6 py-4 text-center">Pass</th>
                    <th className="px-6 py-4 text-center">Fails</th>
                    <th className="px-6 py-4 text-center">Percentage %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analysisData[selectedSemester].data.map((item, idx) => (
                    <tr key={idx} className={cn(
                      "hover:bg-blue-50/30 transition-colors uppercase font-bold",
                      item.branch.includes('Overall') || item.branch.includes('Over All') ? "bg-blue-50 font-black border-t-2 border-hkbk-gold" : ""
                    )}>
                      <td className="px-6 py-5 text-[11px] text-gray-900">{item.branch}</td>
                      <td className="px-6 py-5 text-sm text-center text-gray-600">{item.applied}</td>
                      <td className="px-6 py-5 text-sm text-center text-gray-600">{item.appeared}</td>
                      <td className="px-6 py-5 text-sm text-center font-bold text-green-600">{item.pass}</td>
                      <td className="px-6 py-5 text-sm text-center font-bold text-red-500">{item.fail}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black",
                          item.branch.includes('Overall') || item.branch.includes('Over All') 
                            ? "bg-hkbk-gold text-white" 
                            : "bg-blue-100 text-hkbk-blue"
                        )}>
                          {item.percentage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex flex-col items-center gap-4 text-center">
               <div className="max-w-md">
                 <p className="text-sm font-black text-gray-900 uppercase">Principal</p>
                 <p className="text-xs font-bold text-gray-500 uppercase mt-1">HKBK COLLEGE OF ENGINEERING</p>
                 <p className="text-[10px] text-gray-400 mt-2 italic">#22/1, A.C. Post, Nagawara, Bangalore-560 045</p>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'UPLOAD' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
          <div className="bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center hover:border-hkbk-blue transition-colors group relative overflow-hidden">
            <input 
              ref={fileInputRef}
              id="file-upload-input"
              type="file" 
              className="hidden" 
              accept=".csv,.xlsx,.pdf"
              onChange={handleFileChange}
            />
            
            {uploadSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <FileCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Successful</h3>
                <p className="text-sm text-gray-500 mt-2">Successfully processed <b>{uploadStats?.count}</b> records from {uploadStats?.filename}.</p>
                <div className="mt-4 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                    <FileCheck size={14} />
                    QUEUED FOR VERIFICATION
                  </div>
                  <button 
                    onClick={handleCloseSuccess}
                    className="mt-4 px-8 py-3 bg-hkbk-blue text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    View Updated Records
                  </button>
                </div>
              </motion.div>
            )}

            <div className={cn("transition-opacity", isUploading ? "opacity-50 pointer-events-none" : "opacity-100")}>
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                {isUploading ? <Loader2 className="text-hkbk-blue animate-spin" size={32} /> : <Upload className="text-hkbk-blue" size={32} />}
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Batch Results</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Drag and drop your result CSV/Excel file here. The system will auto-validate marks against predefined rubrics.</p>
              
              {selectedFile ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 max-w-md mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3 mb-4">
                    <FileSpreadsheet className="text-hkbk-blue" size={24} />
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB • Ready to push</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-xs"
                    >
                      Change File
                    </button>
                    <button 
                      onClick={handlePushUpload}
                      className="flex-1 py-3 bg-hkbk-blue text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      Push to List
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={handleBrowseClick}
                      className="w-full sm:w-auto px-8 py-3 bg-hkbk-blue text-white rounded-xl font-bold shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Search size={18} />
                      Browse Files
                    </button>
                    <button 
                      onClick={downloadTemplate}
                      className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <FileSpreadsheet size={18} />
                      Get CSV Template
                    </button>
                </div>
              )}
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-2 relative">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Encrypted Pipeline
                </span>
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    CSV / XLSX Supported
                </span>
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Max 10MB
                </span>
            </div>
          </div>
        </motion.div>
      )}
      {activeTab === 'REPORTS' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
          {/* Results Classification Trend Chart */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Academic Performance Dynamics</h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Classification & Success Rate Trend Across Semesters</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-hkbk-blue" />
                    <span className="text-[10px] font-black uppercase text-gray-400">FCD</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-hkbk-gold" />
                    <span className="text-[10px] font-black uppercase text-gray-400">FC</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-gray-400">Percentage</span>
                 </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: '1st Sem', fcd: 120, fc: 250, sc: 129, percentage: 62.22 },
                    { name: '3rd Sem', fcd: 80, fc: 200, sc: 107, percentage: 51.60 },
                    { name: '5th Sem', fcd: 150, fc: 180, sc: 57, percentage: 64.50 },
                    { name: '7th Sem', fcd: 280, fc: 150, sc: 64, percentage: 85.32 },
                    { name: '8th Sem', fcd: 380, fc: 100, sc: 16, percentage: 99.00 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    itemStyle={{fontSize: '11px', fontWeight: 900, textTransform: 'uppercase'}}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{paddingBottom: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px'}}
                  />
                  <Line 
                    name="Distinction (FCD)"
                    type="monotone" 
                    dataKey="fcd" 
                    stroke="#1e3a8a" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    name="First Class (FC)"
                    type="monotone" 
                    dataKey="fc" 
                    stroke="#b48c08" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#b48c08', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Line 
                    name="Second Class (SC)"
                    type="monotone" 
                    dataKey="sc" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#94a3b8', strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Line 
                    name="Overall Pass %"
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performers */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-hkbk-gold" size={20} />
                Top Performers
              </h3>
              <div className="space-y-4">
                {stats?.topPerformers?.map((performer: any, i: number) => (
                  <div key={performer.rollNo} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-hkbk-blue text-white rounded-lg flex items-center justify-center font-bold text-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{performer.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono uppercase">{performer.rollNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-hkbk-blue">{performer.score}</p>
                      <p className="text-[10px] text-gray-500 font-bold">Grade {performer.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject-wise Analysis */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingDown className="text-red-500" size={20} />
                Weak Subjects (Low Pass %)
              </h3>
              <div className="space-y-4">
                {stats?.subjectAnalysis?.slice(0, 5).map((subject: any) => (
                  <div key={subject.courseCode} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-700">{subject.name} ({subject.courseCode})</span>
                      <span className={cn(
                        subject.passPercentage < 60 ? "text-red-500" : "text-hkbk-blue"
                      )}>
                        {subject.passPercentage}% Pass
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          subject.passPercentage < 60 ? "bg-red-500" : "bg-hkbk-blue"
                        )}
                        style={{ width: `${subject.passPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Report Section */}
          <div className="bg-hkbk-blue/5 border border-hkbk-blue/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-hkbk-blue mb-2">Academic Performance Report</h3>
              <p className="text-sm text-gray-500 max-w-md">Generate a comprehensive Excel report including batch analysis, classification trends, and subject-wise insights for the current semester.</p>
            </div>
            <button 
              onClick={() => window.location.href = '/api/export'}
              className="px-8 py-4 bg-hkbk-blue text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
            >
              <Download size={20} />
              Download Full Report
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
