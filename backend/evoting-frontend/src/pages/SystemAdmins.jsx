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
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-10 bg-[#f8fafc]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <ShieldCheck size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Privileged Access</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            System <span className="italic text-slate-400 font-light">Administrators</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Monitor and manage privileged access accounts.
          </p>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100"><UserCheck size={20} /></div>
              <div>
                <span className="block text-xs text-slate-400 uppercase font-black tracking-widest">Active</span>
                <span className="font-serif text-slate-900 font-bold text-xl leading-none">{admins.filter(a => a.is_active).length}</span>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-500 border border-rose-100"><ShieldAlert size={20} /></div>
              <div>
                <span className="block text-xs text-slate-400 uppercase font-black tracking-widest">Blocked</span>
                <span className="font-serif text-slate-900 font-bold text-xl leading-none">{admins.filter(a => !a.is_active).length}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Shield size={18} className="text-indigo-500" />
              Admin List
            </h3>

            <div className="relative w-full sm:max-w-md ml-auto group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search admin..." 
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 sm:text-sm transition-all font-medium"
               />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {['ALL', 'ACTIVE', 'BLOCKED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                            filterStatus === status 
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
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
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-8 py-5">User</th>
                <th className="px-6 py-5">Roles</th>
                <th className="px-6 py-5 text-center">Availability</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
                        <span className="text-slate-400 font-medium animate-pulse">Loading admins...</span>
                      </div>
                    </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium">
                        <div className="flex flex-col items-center gap-3 opacity-60">
                          <ListFilter size={32} />
                          <p>No admins found matching your criteria.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const showAvailable = admin.is_available && admin.is_active;
                  const isToggleDisabled = processingId === admin.id || !admin.is_active || admin.is_super;

                  return (
                    <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-slate-50' : 'bg-rose-50/30 hover:bg-rose-50/50'}`}>
                      
                      {/* User - Compact */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                              admin.is_super 
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                              : 'bg-gradient-to-br from-indigo-500 to-violet-500'
                          }`}>
                             {admin.is_super ? <Shield size={16} /> : admin.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-slate-900 text-base">
                                  {admin.email}
                             </span>
                             <span className="text-xs text-slate-400 font-medium mt-0.5">
                                {admin.is_super ? "Super Admin" : `ID: #${admin.id}`}
                             </span>
                          </div>
                        </div>
                      </td>

                      {/* Roles - Compact Tags */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                           {admin.is_super ? (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm">
                                SUPER ADMIN
                              </span>
                           ) : (
                               Array.isArray(admin.roles) && admin.roles.length > 0 ? (
                                  admin.roles.map((roleName, idx) => (
                                      <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm">
                                          {roleName}
                                      </span>
                                  ))
                               ) : (
                                  <span className="text-slate-400 text-xs italic">No roles assigned</span>
                               )
                           )}
                        </div>
                      </td>

                      {/* Availability - Toggle Only */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => toggleAvailability(admin.id, admin.is_available)}
                          disabled={isToggleDisabled}
                          title={admin.is_super ? "Super Admin" : (!admin.is_active ? "Blocked" : "Toggle Availability")}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            showAvailable ? 'bg-emerald-500' : 'bg-slate-200'
                          } ${isToggleDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className={`${
                              showAvailable ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200`} 
                          />
                        </button>
                      </td>

                      {/* Status - Minimal Badge */}
                      <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                             admin.is_active 
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                             : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                               {admin.is_active ? 'Active' : 'Blocked'}
                          </span>
                      </td>

                      {/* Action - Icon Only */}
                      <td className="px-8 py-5 text-right">
                        {!admin.is_super ? (
                          <button 
                            onClick={() => toggleStatus(admin.id, admin.is_active)}
                            disabled={processingId === admin.id}
                            title={admin.is_active ? "Block User" : "Unblock User"}
                            className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                              admin.is_active 
                              ? 'bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200' 
                              : 'bg-white text-rose-500 border-rose-100 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                            } ${processingId === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                             {processingId === admin.id ? (
                               <Loader2 size={18} className="animate-spin" /> 
                             ) : (
                               admin.is_active ? <Lock size={18} /> : <Unlock size={18} />
                             )}
                          </button>
                        ) : (
                          <div className="flex justify-end pr-2 opacity-30 cursor-not-allowed text-slate-400">
                             <ShieldCheck size={20} />
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