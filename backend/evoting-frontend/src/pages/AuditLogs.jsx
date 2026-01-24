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
  ChevronDown
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

  // Helper to determine badge color based on action type
  const getActionStyle = (action) => {
    const act = action?.toUpperCase() || '';
    if (act.includes('DELETE') || act.includes('BLOCK') || act.includes('BAN')) {
      return { 
        bg: 'bg-rose-500/10', 
        text: 'text-rose-400', 
        border: 'border-rose-500/20',
        icon: <ShieldAlert size={14} />
      };
    }
    if (act.includes('CREATE') || act.includes('REGISTER') || act.includes('UNBLOCK')) {
      return { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/20',
        icon: <CheckCircle2 size={14} />
      };
    }
    if (act.includes('LOGIN') || act.includes('UPDATE') || act.includes('ASSIGN')) {
      return { 
        bg: 'bg-indigo-500/10', 
        text: 'text-indigo-400', 
        border: 'border-indigo-500/20',
        icon: <Info size={14} />
      };
    }
    return { 
      bg: 'bg-slate-700/30', 
      text: 'text-slate-400', 
      border: 'border-slate-700',
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
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            System Audit Logs
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Immutable record of administrative actions and security events.
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/50 px-5 py-3 rounded-xl flex items-center gap-4 shadow-lg backdrop-blur-md">
           <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <FileClock size={24} />
           </div>
           <div className="flex flex-col">
             <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Events Logged</span>
             <span className="font-mono text-white font-bold text-xl leading-none">{logs.length}</span>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[650px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col md:flex-row items-center gap-4 bg-slate-900/30">
            
            {/* Search Box */}
            <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Action, ID, or Role..." 
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 font-mono text-sm"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Date Filter */}
                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                        type="date" 
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer w-full text-sm font-medium"
                    />
                </div>

                {/* Action Dropdown Filter */}
                <div className="relative" ref={filterRef}>
                    <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${
                            filterAction !== 'ALL' 
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-indigo-500/10 shadow-lg' 
                            : 'bg-slate-950/50 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                    >
                        <Filter size={18} />
                        <span className="text-sm font-medium truncate max-w-[120px]">
                            {filterAction === 'ALL' ? 'All Actions' : filterAction}
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showFilterMenu && (
                        <div className="absolute right-0 top-14 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                                {uniqueActions.map((action) => (
                                    <button
                                        key={action}
                                        onClick={() => { setFilterAction(action); setShowFilterMenu(false); }}
                                        className={`w-full text-left px-3 py-2.5 text-xs font-mono rounded-lg transition-colors truncate flex items-center justify-between group ${
                                            filterAction === action 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 z-10 backdrop-blur-md shadow-sm">
              <tr>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-6 py-5">Actor Profile</th>
                <th className="px-6 py-5">Event Type</th>
                <th className="px-8 py-5">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-indigo-400">
                        <Loader2 className="animate-spin" size={40} />
                        <span className="text-sm font-medium animate-pulse">Syncing secure logs...</span>
                      </div>
                    </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-24 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-4 opacity-60">
                        <div className="p-4 bg-slate-800 rounded-full"><Search size={32} /></div>
                        <p className="text-lg">No audit records found matching your filters.</p>
                        {(searchTerm || searchDate || filterAction !== 'ALL') && (
                            <button 
                                onClick={() => { setSearchTerm(''); setSearchDate(''); setFilterAction('ALL'); }}
                                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium underline decoration-indigo-500/30 hover:decoration-indigo-500 transition-all"
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
                    <tr key={idx} className="group hover:bg-indigo-500/[0.02] transition-colors font-mono">
                      {/* Timestamp */}
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-slate-300 font-bold">{new Date(log.Timestamp).toLocaleDateString()}</span>
                            <span className="text-xs text-slate-500">{new Date(log.Timestamp).toLocaleTimeString()}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                              <User size={18} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-slate-300 font-bold text-xs">ID: {log.ActorID}</span>
                              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 w-fit mt-1">
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
                             <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 overflow-hidden group-hover/code:border-slate-600 group-hover/code:bg-slate-950 transition-all duration-300">
                                <code className="text-[11px] text-slate-400 break-all line-clamp-1 group-hover/code:line-clamp-none cursor-text transition-all duration-300 block leading-relaxed">
                                   {JSON.stringify(log.Metadata, null, 1) || <span className="italic text-slate-600">No additional metadata</span>}
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
        <div className="px-8 py-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md text-xs text-slate-500 flex justify-between items-center shrink-0 font-mono">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live System Time: {new Date().toLocaleTimeString()}</span>
            <span>Displaying {filteredLogs.length} Records</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;