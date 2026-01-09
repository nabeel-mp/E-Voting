import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Filter, 
  Lock, 
  Unlock,
  Loader2,
} from 'lucide-react';

const SystemAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // 1. New State for Filter
  const [searchTerm, setSearchTerm] = useState('');

  // --- EXISTING FETCH LOGIC (UNCHANGED) ---
  const fetchAdmins = async () => {
    try {
      const res = await api.get('/auth/admin/list');
      if(res.data.success) setAdmins(res.data.data);
    } catch (err) {
      console.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);
  // ----------------------------------------

  // 2. Upgraded Block/Unblock Logic
  const toggleStatus = async (id, currentStatus) => {
    // Prevent multiple clicks
    if (processingId) return;

    // A. Safety Confirmation
    const action = currentStatus ? "BLOCK" : "UNBLOCK";
    if(!window.confirm(`Are you sure you want to ${action} this administrator?\nThis will affect their ability to access the dashboard.`)) {
        return;
    }

    setProcessingId(id);
    
    // B. Optimistic Update (Update UI immediately)
    const previousAdmins = [...admins];
    setAdmins(admins.map(admin => 
        admin.id === id ? { ...admin, is_active: !currentStatus } : admin
    ));

    try {
      const endpoint = currentStatus ? "/auth/admin/block" : "/auth/admin/unblock";
      await api.post(endpoint, { admin_id: id });
      // Success: State is already updated, just clear loader
    } catch (err) {
      console.error("Status update failed", err);
      alert(`Failed to ${action.toLowerCase()} admin. Please try again.`);
      setAdmins(previousAdmins); // C. Revert on Failure
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Filter Logic
  const filteredAdmins = admins.filter(admin => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    // Search by Email, Role, or specific keywords like "active" or "blocked"
    return (
        admin.email?.toLowerCase().includes(lowerTerm) ||
        admin.role_name?.toLowerCase().includes(lowerTerm) ||
        (admin.is_active ? "active" : "blocked").includes(lowerTerm)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Administrators</h1>
          <p className="text-slate-400 mt-1">Monitor and manage privileged access accounts.</p>
        </div>
        
        {/* Stats Summary */}
        <div className="flex gap-4">
           <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="block text-xs text-slate-500 uppercase font-bold">Active</span>
                <span className="font-mono text-white font-bold">{admins.filter(a => a.is_active).length}</span>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl">
              <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400">
                <ShieldAlert size={18} />
              </div>
              <div>
                <span className="block text-xs text-slate-500 uppercase font-bold">Blocked</span>
                <span className="font-mono text-white font-bold">{admins.filter(a => !a.is_active).length}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Toolbar with Live Search */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by email, role, or status..." 
                  className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-slate-400 select-none">
                <Filter size={18} />
                <span className="text-sm">
                    {searchTerm ? `Found ${filteredAdmins.length}` : 'All Users'}
                </span>
            </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Access Role</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Security Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center gap-2 text-indigo-400">
                        <Loader2 className="animate-spin" size={20} />
                        Loading administrators...
                      </div>
                    </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">
                       No administrators found matching "{searchTerm}"
                    </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-slate-800/40' : 'bg-rose-950/10 hover:bg-rose-900/10'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                            admin.is_super 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                            : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                        }`}>
                           {admin.is_super ? <ShieldCheck size={18} /> : admin.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <span className={`block font-medium ${admin.is_active ? 'text-slate-200' : 'text-slate-400'}`}>
                                {admin.email}
                           </span>
                           <span className="text-xs text-slate-500">ID: #{admin.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        admin.is_super 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {admin.is_super ? 'Super Admin' : (admin.role_name || 'Staff')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`relative flex h-2.5 w-2.5`}>
                            {admin.is_active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${admin.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          </span>
                          <span className={`font-medium ${admin.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {admin.is_active ? 'Active' : 'Blocked'}
                          </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!admin.is_super ? (
                        <button 
                          onClick={() => toggleStatus(admin.id, admin.is_active)}
                          disabled={processingId === admin.id}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                            admin.is_active 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                          } ${processingId === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                           {processingId === admin.id ? (
                             <Loader2 size={14} className="animate-spin" /> 
                           ) : (
                             admin.is_active ? <Lock size={14} /> : <Unlock size={14} />
                           )}
                           {admin.is_active ? 'Block Access' : 'Unblock'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 border border-slate-700/50 px-2 py-1 rounded bg-slate-800/50 cursor-not-allowed opacity-70">
                            <ShieldCheck size={12} />
                            Protected
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