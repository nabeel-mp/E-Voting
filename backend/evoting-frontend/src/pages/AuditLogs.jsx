import React, { useEffect, useState } from 'react';
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
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (act.includes('LOGIN') || act.includes('UPDATE')) {
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

  // Filter logic
  const filteredLogs = logs.filter(log => 
    log.Action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ActorID?.toString().includes(searchTerm) ||
    log.ActorRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900/30">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Action, Actor ID, or Role..." 
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 font-mono text-sm"
                />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 rounded-lg">
                <Filter size={18} />
                <span className="text-sm">Filter</span>
            </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
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
                   <td colSpan="4" className="px-6 py-12 text-center font-sans">
                      <div className="flex justify-center items-center gap-2 text-indigo-400">
                        <Loader2 className="animate-spin" size={20} />
                        Retrieving logs...
                      </div>
                   </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-sans">
                      No matching audit records found.
                   </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const style = getActionStyle(log.Action);
                  return (
                    <tr key={idx} className="group hover:bg-slate-800/30 transition-colors">
                      {/* Timestamp */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(log.Timestamp).toLocaleString()}
                      </td>

                      {/* Actor */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                              <User size={14} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-slate-300 font-bold">ID: {log.ActorID}</span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{log.ActorRole}</span>
                           </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.text}`}>
                           {style.icon}
                           <span className="font-bold tracking-tight">{log.Action}</span>
                        </div>
                      </td>

                      {/* Details (JSON) */}
                      <td className="px-6 py-4">
                         <div className="max-w-md bg-slate-950/50 border border-slate-800 rounded p-2 overflow-hidden group-hover:border-slate-700 transition-colors">
                            <code className="text-xs text-slate-400 break-all line-clamp-2 hover:line-clamp-none cursor-help transition-all duration-300">
                               {JSON.stringify(log.Metadata, null, 1) || '-'}
                            </code>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;