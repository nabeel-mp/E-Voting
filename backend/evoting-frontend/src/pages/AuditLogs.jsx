import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { 
  FileClock, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Terminal,
  Loader2,
  CheckCircle2,
  Info,
  Calendar,
  X,
  ChevronDown,
  Activity
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/api/audit/logs');
        if (res.data.success) {
          // Sort logs by timestamp desc (newest first)
          const sortedLogs = (res.data.data || []).sort((a, b) => 
            new Date(b.Timestamp) - new Date(a.Timestamp)
          );
          setLogs(sortedLogs);
        }
      } catch (err) { 
        console.error("Failed to fetch logs", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to determine badge color based on action type (Light Theme Colors)
  const getActionStyle = (action) => {
    const act = action?.toUpperCase() || '';
    if (act.includes('DELETE') || act.includes('BLOCK') || act.includes('BAN')) {
      return { 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        icon: <ShieldAlert size={14} />
      };
    }
    if (act.includes('CREATE') || act.includes('REGISTER') || act.includes('UNBLOCK')) {
      return { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        icon: <CheckCircle2 size={14} />
      };
    }
    if (act.includes('LOGIN') || act.includes('UPDATE') || act.includes('ASSIGN')) {
      return { 
        bg: 'bg-indigo-50', 
        text: 'text-indigo-700', 
        border: 'border-indigo-200',
        icon: <Info size={14} />
      };
    }
    return { 
      bg: 'bg-slate-100', 
      text: 'text-slate-600', 
      border: 'border-slate-200',
      icon: <Terminal size={14} />
    };
  };

  // --- FILTERING LOGIC ---
  
  // 1. Get unique actions for the dropdown
  const uniqueActions = ['ALL', ...new Set(logs.map(log => log.Action))];

  // 2. Filter the master list
  const filteredLogs = logs.filter(log => {
    // Text Search
    const matchesSearch = 
      log.Action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ActorID?.toString().includes(searchTerm) ||
      log.ActorRole?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date Search (YYYY-MM-DD)
    const logDate = new Date(log.Timestamp).toISOString().split('T')[0];
    const matchesDate = !searchDate || logDate === searchDate;

    // Action Filter
    const matchesAction = filterAction === 'ALL' || log.Action === filterAction;

    return matchesSearch && matchesDate && matchesAction;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-10 bg-[#f8fafc]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <ShieldCheck size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Security & Compliance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            System <span className="italic text-slate-400 font-light">Audit Logs</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Immutable record of administrative actions and security events.
          </p>
        </div>
        
        <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-slate-200/50">
           <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
              <FileClock size={24} />
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Events</span>
             <span className="font-serif text-slate-900 font-bold text-2xl leading-none">{logs.length}</span>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mr-auto">
              <Activity size={18} className="text-indigo-500" />
              Event Stream
            </h3>
            
            {/* Search Box */}
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Action, ID, or Role..." 
                  className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-sm font-medium"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Date Filter */}
            <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                    type="date" 
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-600 pl-12 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer text-sm font-medium"
                />
            </div>

            {/* Action Dropdown Filter */}
            <div className="relative" ref={filterRef}>
                <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all ${
                        filterAction !== 'ALL' 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                >
                    <Filter size={18} />
                    <span className="text-sm font-bold truncate max-w-[120px]">
                        {filterAction === 'ALL' ? 'All Actions' : filterAction}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilterMenu && (
                    <div className="absolute right-0 top-12 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                            {uniqueActions.map((action) => (
                                <button
                                    key={action}
                                    onClick={() => { setFilterAction(action); setShowFilterMenu(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors truncate flex items-center justify-between group ${
                                        filterAction === action 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    {action}
                                    {filterAction === action && <CheckCircle2 size={12} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md shadow-sm">
              <tr>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-6 py-5">Actor Profile</th>
                <th className="px-6 py-5">Event Type</th>
                <th className="px-8 py-5">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
                        <span className="text-slate-400 font-medium animate-pulse">Syncing secure logs...</span>
                      </div>
                    </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-32 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-4 opacity-60">
                        <div className="p-4 bg-slate-50 rounded-full border border-slate-200"><Search size={32} /></div>
                        <p className="text-lg font-medium">No audit records found.</p>
                        {(searchTerm || searchDate || filterAction !== 'ALL') && (
                            <button 
                                onClick={() => { setSearchTerm(''); setSearchDate(''); setFilterAction('ALL'); }}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-bold underline decoration-indigo-200 hover:decoration-indigo-500 transition-all"
                            >
                                Clear all active filters
                            </button>
                        )}
                      </div>
                    </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const style = getActionStyle(log.Action);
                  return (
                    <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-slate-900 font-bold font-mono">{new Date(log.Timestamp).toLocaleDateString()}</span>
                            <span className="text-xs text-slate-400 font-mono">{new Date(log.Timestamp).toLocaleTimeString()}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                              <User size={18} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-slate-600 font-bold text-xs">ID: {log.ActorID}</span>
                              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 w-fit mt-1">
                                {log.ActorRole}
                              </span>
                           </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.text} shadow-sm`}>
                           {style.icon}
                           <span className="font-bold tracking-tight text-xs uppercase">{log.Action}</span>
                        </div>
                      </td>

                      {/* Details (JSON) */}
                      <td className="px-8 py-5">
                          <div className="relative max-w-lg group/code">
                             <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-hidden group-hover/code:border-indigo-200 group-hover/code:bg-white group-hover/code:shadow-md transition-all duration-300">
                                <code className="text-[11px] text-slate-600 break-all line-clamp-1 group-hover/code:line-clamp-none cursor-text transition-all duration-300 block leading-relaxed font-mono">
                                   {JSON.stringify(log.Metadata, null, 1) || <span className="italic text-slate-400">No additional metadata</span>}
                                </code>
                             </div>
                          </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Info */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 flex justify-between items-center shrink-0">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live System Time: {new Date().toLocaleTimeString()}</span>
            <span>Displaying {filteredLogs.length} Records</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;