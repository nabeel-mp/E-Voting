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

  const toggleAvailability = async (id, currentAvailability) => {
    if (processingId) return;
    setProcessingId(id);

    // Optimistic Update
    const previousAdmins = [...admins];
    setAdmins(admins.map(admin => 
      admin.id === id ? { ...admin, is_available: !currentAvailability } : admin
    ));

    try {
      await api.post('/api/auth/admin/toggle-availability', { admin_id: id });
      addToast(`Availability updated`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update availability", "error");
      setAdmins(previousAdmins); 
    } finally {
      setProcessingId(null);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (processingId) return;

    const action = currentStatus ? "BLOCK" : "UNBLOCK";
    if(!window.confirm(`Are you sure you want to ${action} this administrator?`)) return;

    setProcessingId(id);
    
    // Optimistic Update: If blocking, also set availability to false
    const previousAdmins = [...admins];
    setAdmins(admins.map(admin => {
        if (admin.id === id) {
            if (currentStatus) {
                return { ...admin, is_active: false, is_available: false };
            }
            return { ...admin, is_active: true };
        }
        return admin;
    }));

    try {
      const endpoint = currentStatus ? "/auth/admin/block" : "/auth/admin/unblock";
      await api.post(endpoint, { admin_id: id });
      addToast(`Admin ${currentStatus ? 'blocked' : 'unblocked'}`, "success");
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
                  placeholder="Search admin..." 
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
                        {status === 'ALL' && 'All'}
                        {status === 'ACTIVE' && 'Active'}
                        {status === 'BLOCKED' && 'Blocked'}
                    </button>
                ))}
            </div>
        </div>

        {/* Scrollable Table - REDUCED */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-4 py-4">Roles</th>
                <th className="px-4 py-4 text-center">Availability</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin inline text-indigo-500 w-8 h-8" />
                    </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3 opacity-60">
                          <ListFilter size={32} />
                          <p>No admins found.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const showAvailable = admin.is_available && admin.is_active;
                  const isToggleDisabled = processingId === admin.id || !admin.is_active || admin.is_super;

                  return (
                    <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-indigo-500/[0.02]' : 'bg-rose-950/10 hover:bg-rose-900/10'}`}>
                      
                      {/* User - Compact */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm ${
                              admin.is_super 
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                              : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                          }`}>
                             {admin.is_super ? <Shield size={16} /> : admin.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-medium text-slate-200 text-sm">
                                  {admin.email}
                             </span>
                             <span className="text-[11px] text-slate-500">
                                {admin.is_super ? "Super Admin" : `ID: #${admin.id}`}
                             </span>
                          </div>
                        </div>
                      </td>

                      {/* Roles - Compact Tags */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                           {admin.is_super ? (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold">
                                SUPER
                              </span>
                           ) : (
                               Array.isArray(admin.roles) && admin.roles.length > 0 ? (
                                  admin.roles.map((roleName, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-bold">
                                          {roleName}
                                      </span>
                                  ))
                               ) : (
                                  <span className="text-slate-600 text-[11px] italic">No roles</span>
                               )
                           )}
                        </div>
                      </td>

                      {/* Availability - Toggle Only */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleAvailability(admin.id, admin.is_available)}
                          disabled={isToggleDisabled}
                          title={admin.is_super ? "Super Admin" : (!admin.is_active ? "Blocked" : "Toggle Availability")}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            showAvailable ? 'bg-indigo-500' : 'bg-slate-700'
                          } ${isToggleDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className={`${
                              showAvailable ? 'translate-x-5' : 'translate-x-1'
                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} 
                          />
                        </button>
                      </td>

                      {/* Status - Minimal Badge */}
                      <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                             admin.is_active 
                             ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                             : 'bg-rose-500/5 text-rose-400 border-rose-500/20'
                          }`}>
                               {admin.is_active ? 'Active' : 'Blocked'}
                          </span>
                      </td>

                      {/* Action - Icon Only */}
                      <td className="px-6 py-4 text-right">
                        {!admin.is_super ? (
                          <button 
                            onClick={() => toggleStatus(admin.id, admin.is_active)}
                            disabled={processingId === admin.id}
                            title={admin.is_active ? "Block User" : "Unblock User"}
                            className={`p-2 rounded-lg transition-all hover:bg-slate-800 ${
                              admin.is_active 
                              ? 'text-slate-500 hover:text-rose-400' 
                              : 'text-rose-400 hover:text-emerald-400'
                            } ${processingId === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                             {processingId === admin.id ? (
                               <Loader2 size={16} className="animate-spin" /> 
                             ) : (
                               admin.is_active ? <Lock size={16} /> : <Unlock size={16} />
                             )}
                          </button>
                        ) : (
                          <div className="flex justify-end pr-2 opacity-50 cursor-not-allowed text-slate-600">
                             <ShieldCheck size={16} />
                          </div>
                        )}
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

export default SystemAdmins;