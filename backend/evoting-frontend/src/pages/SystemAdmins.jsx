import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  ShieldAlert, 
  ShieldCheck, 
  MoreVertical, 
  Search, 
  Filter, 
  Lock, 
  Unlock,
  Loader2,
  UserCog
} from 'lucide-react';

const SystemAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchAdmins = async () => {
    try {
      // Note: Matches 'superAdminLegacy' route in routes.go as per your comment
      const res = await api.get('/auth/admin/list');
      if(res.data.success) setAdmins(res.data.data);
    } catch (err) {
      console.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const toggleStatus = async (id, isActive) => {
    setProcessingId(id);
    try {
      const endpoint = isActive ? "/auth/admin/block" : "/auth/admin/unblock";
      await api.post(endpoint, { admin_id: id });
      // Optimistic update for faster UI feel
      setAdmins(admins.map(admin => 
        admin.id === id ? { ...admin, is_active: !isActive } : admin
      ));
    } catch (err) {
      alert("Failed to update status");
      fetchAdmins(); // Revert on failure
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Administrators</h1>
          <p className="text-slate-400 mt-1">Monitor and manage privileged access accounts.</p>
        </div>
        
        {/* Stats Summary (Mock Data for Visuals) */}
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
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by email..." 
                  className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors">
                <Filter size={18} />
                <span className="text-sm">Filter</span>
            </button>
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
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="group hover:bg-slate-800/40 transition-colors">
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
                           <span className="block text-slate-200 font-medium">{admin.email}</span>
                           <span className="text-xs text-slate-500">ID: #{admin.id.toString().padStart(4, '0')}</span>
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
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
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
                        <span className="text-xs text-slate-600 italic px-2">Protected</span>
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