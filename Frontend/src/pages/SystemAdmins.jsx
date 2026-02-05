import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  ShieldAlert, ShieldCheck, Search, Loader2, ListFilter, Shield, UserCheck, Lock, Unlock
} from 'lucide-react';

const SystemAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (filterStatus === 'AVAILABLE') matchesStatus = admin.is_active === true && admin.is_available === true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 bg-[#f8fafc]">
       
      {/* --- RESPONSIVE HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full">
              <ShieldCheck size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Privileged Access</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            System <span className="italic text-slate-400 font-light">Administrators</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light">
            Directory of all privileged access accounts.
          </p>
        </div>
        
        {/* Stats Grid - Adaptive */}
        <div className="grid grid-cols-2 sm:flex gap-3 w-full xl:w-auto">
           <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm flex-1 sm:flex-none">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100"><UserCheck size={20} /></div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest">Active</span>
                <span className="font-serif text-slate-900 font-bold text-xl leading-none">{admins.filter(a => a.is_active).length}</span>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm flex-1 sm:flex-none">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-500 border border-rose-100"><ShieldAlert size={20} /></div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest">Blocked</span>
                <span className="font-serif text-slate-900 font-bold text-xl leading-none">{admins.filter(a => !a.is_active).length}</span>
              </div>
           </div>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Shield size={18} className="text-indigo-500" /> Admin List
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 lg:ml-auto w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                   <input 
                      type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search admin..." 
                      className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-medium shadow-sm"
                   />
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
                    {['ALL', 'ACTIVE', 'AVAILABLE', 'BLOCKED'].map((status) => (
                        <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${filterStatus === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden lg:block flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5">User</th>
                <th className="px-6 py-5">Roles</th>
                <th className="px-6 py-5 text-center">Availability</th>
                <th className="px-6 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center"><Loader2 className="animate-spin inline mr-2 text-indigo-600"/> Loading...</td></tr>
              ) : filteredAdmins.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400">No admins found.</td></tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const showAvailable = admin.is_available && admin.is_active;
                  return (
                    <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-slate-50' : 'bg-rose-50/30'}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${admin.is_super ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-violet-500'}`}>
                             {admin.is_super ? <Shield size={16} /> : admin.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-slate-900">{admin.email}</span>
                             <span className="text-xs text-slate-400 font-medium mt-0.5">{admin.is_super ? "Super Admin" : `ID: #${admin.id}`}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                           {admin.is_super ? (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold uppercase">SUPER ADMIN</span>
                           ) : (
                              Array.isArray(admin.roles) && admin.roles.length > 0 ? 
                              admin.roles.map((role, idx) => <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold uppercase">{role}</span>) : 
                              <span className="text-slate-400 text-xs italic">No roles</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${showAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${showAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                           {showAvailable ? 'Online' : 'Offline'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${admin.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                             {admin.is_active ? 'Active' : 'Blocked'}
                          </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW --- */}
        <div className="lg:hidden p-4 space-y-4 bg-slate-50/50 flex-1 overflow-y-auto">
            {loading ? <div className="text-center py-10"><Loader2 className="animate-spin inline text-indigo-600"/></div> : 
             filteredAdmins.length === 0 ? <div className="text-center text-slate-400 py-10">No admins found.</div> :
             filteredAdmins.map(admin => {
                const showAvailable = admin.is_available && admin.is_active;
                return (
                  <div key={admin.id} className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 ${admin.is_active ? 'border-slate-200' : 'border-rose-100 bg-rose-50/20'}`}>
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${admin.is_super ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-violet-500'}`}>
                              {admin.is_super ? <Shield size={16} /> : admin.email?.charAt(0).toUpperCase()}
                           </div>
                           <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{admin.email}</h4>
                              <p className="text-xs text-slate-400">{admin.is_super ? 'System Authority' : `ID: #${admin.id}`}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${admin.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                              {admin.is_active ? 'Active' : 'Blocked'}
                           </span>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-2">
                        {admin.is_super ? (
                           <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold uppercase">SUPER ADMIN</span>
                        ) : (
                           Array.isArray(admin.roles) && admin.roles.length > 0 ? 
                           admin.roles.map((r, i) => <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold uppercase">{r}</span>) : 
                           <span className="text-xs text-slate-400 italic">No roles</span>
                        )}
                     </div>

                     <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                        <span>Availability Status</span>
                        <div className={`flex items-center gap-1.5 ${showAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${showAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                           {showAvailable ? 'Online' : 'Offline'}
                        </div>
                     </div>
                  </div>
                )
             })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-xs font-bold text-slate-400 flex justify-between items-center rounded-b-[2rem]">
           <span>{filteredAdmins.length} administrators</span>
           {searchTerm && <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Filtered</span>}
        </div>
      </div>
    </div>
  );
};

export default SystemAdmins;