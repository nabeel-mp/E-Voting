import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { 
  FileClock, Search, Filter, ShieldAlert, ShieldCheck, User, Terminal,
  Loader2, CheckCircle2, Info, Calendar, X, ChevronDown, Activity
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
          const sortedLogs = (res.data.data || []).sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
          setLogs(sortedLogs);
        }
      } catch (err) { console.error("Failed to fetch logs", err); } 
      finally { setLoading(false); }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getActionStyle = (action) => {
    const act = action?.toUpperCase() || '';
    if (act.includes('DELETE') || act.includes('BLOCK') || act.includes('BAN')) {
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: <ShieldAlert size={14} /> };
    }
    if (act.includes('CREATE') || act.includes('REGISTER') || act.includes('UNBLOCK')) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle2 size={14} /> };
    }
    if (act.includes('LOGIN') || act.includes('UPDATE') || act.includes('ASSIGN')) {
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: <Info size={14} /> };
    }
    return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: <Terminal size={14} /> };
  };

  const uniqueActions = ['ALL', ...new Set(logs.map(log => log.Action))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.Action?.toLowerCase().includes(searchTerm.toLowerCase()) || log.ActorID?.toString().includes(searchTerm) || log.ActorRole?.toLowerCase().includes(searchTerm.toLowerCase());
    const logDate = new Date(log.Timestamp).toISOString().split('T')[0];
    const matchesDate = !searchDate || logDate === searchDate;
    const matchesAction = filterAction === 'ALL' || log.Action === filterAction;
    return matchesSearch && matchesDate && matchesAction;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 bg-[#f8fafc]">
      
      {/* --- RESPONSIVE HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full">
              <ShieldCheck size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Security & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            System <span className="italic text-slate-400 font-light">Audit Logs</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light">
            Immutable record of administrative actions and security events.
          </p>
        </div>
        
        <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-slate-200/50 w-full xl:w-auto">
           <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100"><FileClock size={24} /></div>
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Events</span>
             <span className="font-serif text-slate-900 font-bold text-2xl leading-none">{logs.length}</span>
           </div>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 lg:mr-auto">
              <Activity size={18} className="text-indigo-500" /> Event Stream
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                   <input 
                      type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." 
                      className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-medium shadow-sm"
                   />
                   {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
                </div>

                <div className="relative group flex-1 sm:flex-none">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                   <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 pl-12 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium shadow-sm" />
                </div>

                <div className="relative flex-1 sm:flex-none" ref={filterRef}>
                   <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`w-full sm:w-auto flex items-center justify-between gap-3 px-5 py-2.5 rounded-xl border transition-all shadow-sm ${filterAction !== 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-slate-600 border-slate-200'}`}>
                      <div className="flex items-center gap-2"><Filter size={18} /><span className="text-sm font-bold truncate max-w-[100px]">{filterAction === 'ALL' ? 'All Actions' : filterAction}</span></div>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
                   </button>
                   {showFilterMenu && (
                       <div className="absolute right-0 top-12 w-full sm:w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                           <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-0.5">
                               {uniqueActions.map((action) => (
                                   <button key={action} onClick={() => { setFilterAction(action); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-between ${filterAction === action ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                                       {action} {filterAction === action && <CheckCircle2 size={12} />}
                                   </button>
                               ))}
                           </div>
                       </div>
                   )}
                </div>
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
           {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20 gap-3">
                 <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
                 <span className="text-slate-400 font-medium animate-pulse">Syncing secure logs...</span>
              </div>
           ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20 text-center text-slate-400 gap-4">
                 <div className="p-4 bg-slate-50 rounded-full border border-slate-200"><Search size={32} className="opacity-50"/></div>
                 <p className="text-lg font-medium">No audit records found.</p>
                 {(searchTerm || searchDate || filterAction !== 'ALL') && (
                    <button onClick={() => { setSearchTerm(''); setSearchDate(''); setFilterAction('ALL'); }} className="text-indigo-600 font-bold underline decoration-indigo-200 hover:decoration-indigo-500">Clear all active filters</button>
                 )}
              </div>
           ) : (
             <>
               {/* --- DESKTOP TABLE VIEW --- */}
               <div className="hidden lg:block flex-1 overflow-auto custom-scrollbar">
                 <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                       <tr>
                          <th className="px-8 py-5">Timestamp</th>
                          <th className="px-6 py-5">Actor Profile</th>
                          <th className="px-6 py-5">Event Type</th>
                          <th className="px-8 py-5">Event Metadata</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredLogs.map((log, idx) => {
                          const style = getActionStyle(log.Action);
                          return (
                             <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-5 whitespace-nowrap">
                                   <div className="flex flex-col">
                                      <span className="text-slate-900 font-bold font-mono">{new Date(log.Timestamp).toLocaleDateString()}</span>
                                      <span className="text-xs text-slate-400 font-mono">{new Date(log.Timestamp).toLocaleTimeString()}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-5">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><User size={18} /></div>
                                      <div className="flex flex-col">
                                         <span className="text-slate-600 font-bold text-xs">ID: {log.ActorID}</span>
                                         <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 w-fit mt-1">{log.ActorRole}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-5">
                                   <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.text} shadow-sm`}>
                                      {style.icon}<span className="font-bold tracking-tight text-xs uppercase">{log.Action}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-5">
                                   <div className="relative max-w-lg group/code">
                                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-hidden group-hover/code:border-indigo-200 transition-all">
                                         <code className="text-[11px] text-slate-600 break-all line-clamp-1 group-hover/code:line-clamp-none cursor-text font-mono">
                                            {JSON.stringify(log.Metadata, null, 1) || <span className="italic text-slate-400">No additional metadata</span>}
                                         </code>
                                      </div>
                                   </div>
                                </td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
               </div>

               {/* --- MOBILE FEED VIEW --- */}
               <div className="lg:hidden p-4 space-y-4 flex-1 overflow-y-auto bg-slate-50/50">
                  {filteredLogs.map((log, idx) => {
                     const style = getActionStyle(log.Action);
                     return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 relative">
                           <div className="flex justify-between items-start">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${style.bg} ${style.border} ${style.text}`}>
                                 {style.icon}<span className="font-bold text-[10px] uppercase">{log.Action}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{new Date(log.Timestamp).toLocaleString()}</span>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 shrink-0"><User size={16}/></div>
                              <div>
                                 <p className="text-xs font-bold text-slate-700">Actor ID: {log.ActorID}</p>
                                 <p className="text-[10px] text-indigo-600 font-bold uppercase">{log.ActorRole}</p>
                              </div>
                           </div>

                           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-2">
                              <code className="text-[10px] text-slate-600 break-all font-mono block">
                                 {JSON.stringify(log.Metadata) || "No Metadata"}
                              </code>
                           </div>
                        </div>
                     )
                  })}
               </div>
             </>
           )}
        </div>
        
        {/* Footer Info */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 flex justify-between items-center shrink-0 rounded-b-[2rem]">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> System Live</span>
            <span>{filteredLogs.length} Records</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;