import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Lock, 
  Unlock,
  Loader2,
  ListFilter,
  Shield,
  UserCheck
} from 'lucide-react';

const SystemAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { addToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  const fetchData = async () => {
    try {
      const res = await api.get('/auth/admin/list');
      if(res.data.success) setAdmins(res.data.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      addToast("Failed to load admin list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleStatus = async (id, currentStatus) => {
    if (processingId) return;

    const action = currentStatus ? "BLOCK" : "UNBLOCK";
    if(!window.confirm(`Are you sure you want to ${action} this administrator?`)) return;

    setProcessingId(id);
    
    // Optimistic Update
    const previousAdmins = [...admins];
    setAdmins(admins.map(admin => 
        admin.id === id ? { ...admin, is_active: !currentStatus } : admin
    ));

    try {
      const endpoint = currentStatus ? "/auth/admin/block" : "/auth/admin/unblock";
      await api.post(endpoint, { admin_id: id });
      addToast(`Admin ${currentStatus ? 'blocked' : 'unblocked'} successfully`, "success");
    } catch (err) {
      addToast(`Failed to ${action.toLowerCase()} admin.`, "error");
      setAdmins(previousAdmins);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const rolesString = Array.isArray(admin.roles) ? admin.roles.join(' ') : (admin.role_name || '');
    
    const matchesSearch = !searchTerm || (
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rolesString.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.id.toString().includes(searchTerm)
    );
    let matchesStatus = true;
    if (filterStatus === 'ACTIVE') matchesStatus = admin.is_active === true;
    if (filterStatus === 'BLOCKED') matchesStatus = admin.is_active === false;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            System Administrators
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Monitor and manage privileged access accounts.
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 px-5 py-3 rounded-xl shadow-lg backdrop-blur-md">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><UserCheck size={20} /></div>
              <div>
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Active</span>
                <span className="font-mono text-white font-bold text-lg leading-none">{admins.filter(a => a.is_active).length}</span>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 px-5 py-3 rounded-xl shadow-lg backdrop-blur-md">
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><ShieldAlert size={20} /></div>
              <div>
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Blocked</span>
                <span className="font-mono text-white font-bold text-lg leading-none">{admins.filter(a => !a.is_active).length}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[650px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30">
            <div className="relative w-full sm:max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search email, role, or ID..." 
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
               />
            </div>
            
            <div className="flex bg-slate-950/50 p-1.5 rounded-xl border border-slate-800 ml-auto">
                {['ALL', 'ACTIVE', 'BLOCKED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                            filterStatus === status 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        {status === 'ALL' && 'All Users'}
                        {status === 'ACTIVE' && 'Active Only'}
                        {status === 'BLOCKED' && 'Blocked'}
                    </button>
                ))}
            </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10 shadow-sm">
              <tr>
                <th className="px-8 py-5">Administrator</th>
                <th className="px-6 py-5">Access Roles</th>
                <th className="px-6 py-5">Account Status</th>
                <th className="px-8 py-5 text-right">Security Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                        <p className="animate-pulse">Loading secure admin list...</p>
                      </div>
                    </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3 opacity-60">
                          <ListFilter size={40} />
                          <p className="text-lg">No administrators found matching current filters.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-indigo-500/[0.02]' : 'bg-rose-950/10 hover:bg-rose-900/10'}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg ${
                            admin.is_super 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20' 
                            : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20'
                        }`}>
                           {admin.is_super ? <Shield size={20} /> : admin.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <span className={`block font-semibold text-base ${admin.is_active ? 'text-slate-200' : 'text-slate-400'}`}>
                                {admin.email}
                           </span>
                           <span className="text-xs text-slate-500 font-mono">ID: #{admin.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {admin.is_super ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-sm">
                            <ShieldCheck size={12} /> SUPER ADMIN
                          </span>
                      ) : (
                          <div className="flex flex-wrap gap-1.5">
                             {Array.isArray(admin.roles) && admin.roles.length > 0 ? (
                                admin.roles.map((roleName, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                        {roleName}
                                    </span>
                                ))
                             ) : (
                                <span className="text-slate-600 text-xs italic">No roles assigned</span>
                             )}
                          </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <span className={`relative flex h-2.5 w-2.5`}>
                            {admin.is_active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${admin.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          </span>
                          <span className={`font-medium text-sm ${admin.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {admin.is_active ? 'Active' : 'Blocked'}
                          </span>
                        </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {!admin.is_super ? (
                        <button 
                          onClick={() => toggleStatus(admin.id, admin.is_active)}
                          disabled={processingId === admin.id}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-sm ${
                            admin.is_active 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:shadow-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-emerald-500/20'
                          } ${processingId === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                           {processingId === admin.id ? (
                             <Loader2 size={14} className="animate-spin" /> 
                           ) : (
                             admin.is_active ? <Lock size={14} /> : <Unlock size={14} />
                           )}
                           <span>{admin.is_active ? 'Block Access' : 'Unblock Access'}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 border border-slate-700/50 px-3 py-1.5 rounded-xl bg-slate-800/50 cursor-not-allowed opacity-60 select-none">
                            <ShieldCheck size={12} />
                            Protected Account
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemAdmins;