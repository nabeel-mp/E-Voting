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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Audit Logs</h1>
          <p className="text-slate-400 mt-1">Immutable record of all administrative actions and security events.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3">
           <FileClock className="text-indigo-400" size={20} />
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Total Events</span>
             <span className="font-mono text-white font-bold text-sm">{logs.length} Records</span>
           </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 bg-slate-900/30">
            
            {/* Search Box */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Action, ID, or Role..." 
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 font-mono text-sm"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Date Filter */}
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                <input 
                    type="date" 
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer w-full md:w-auto text-sm"
                />
            </div>

            {/* Action Dropdown Filter */}
            <div className="relative" ref={filterRef}>
                <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        filterAction !== 'ALL' 
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                >
                    <Filter size={18} />
                    <span className="text-sm font-medium">
                        {filterAction === 'ALL' ? 'All Actions' : filterAction}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showFilterMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="p-1">
                            {uniqueActions.map((action) => (
                                <button
                                    key={action}
                                    onClick={() => { setFilterAction(action); setShowFilterMenu(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs font-mono rounded-lg transition-colors truncate ${
                                        filterAction === action 
                                        ? 'bg-indigo-500 text-white' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Table Content - Fixed Height for Scrolling (Shows roughly 7-8 items) */}
        <div className="overflow-auto custom-scrollbar h-[550px]">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/90 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
              {loading ? (
                <tr>
                   <td colSpan="4" className="px-6 py-24 text-center font-sans">
                      <div className="flex flex-col items-center gap-3 text-indigo-400">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-sm animate-pulse">Syncing audit trail...</span>
                      </div>
                   </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-6 py-24 text-center text-slate-500 font-sans">
                      <div className="flex flex-col items-center gap-3">
                        <Search size={32} className="opacity-20" />
                        <p>No matching audit records found.</p>
                        {(searchTerm || searchDate || filterAction !== 'ALL') && (
                            <button 
                                onClick={() => { setSearchTerm(''); setSearchDate(''); setFilterAction('ALL'); }}
                                className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                            >
                                Clear all filters
                            </button>
                        )}
                      </div>
                   </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const style = getActionStyle(log.Action);
                  return (
                    <tr key={idx} className="group hover:bg-slate-800/30 transition-colors">
                      {/* Timestamp */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        <div className="flex flex-col">
                            <span className="text-slate-300">{new Date(log.Timestamp).toLocaleDateString()}</span>
                            <span className="text-xs">{new Date(log.Timestamp).toLocaleTimeString()}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-800 rounded-lg text-slate-400 border border-slate-700">
                              <User size={16} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-slate-300 font-bold text-xs">ID: {log.ActorID}</span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{log.ActorRole}</span>
                           </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.text}`}>
                           {style.icon}
                           <span className="font-bold tracking-tight text-xs">{log.Action}</span>
                        </div>
                      </td>

                      {/* Details (JSON) */}
                      <td className="px-6 py-4">
                          <div className="relative max-w-md group/code">
                             <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2 overflow-hidden group-hover/code:border-slate-700 transition-colors">
                                <code className="text-[10px] text-slate-400 break-all line-clamp-2 group-hover/code:line-clamp-none cursor-help transition-all duration-300 font-mono">
                                   {JSON.stringify(log.Metadata, null, 1) || <span className="italic text-slate-600">No metadata</span>}
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
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 text-[10px] text-slate-500 flex justify-between">
            <span>Server Time: {new Date().toTimeString()}</span>
            <span>Total Records: {filteredLogs.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;