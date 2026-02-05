import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Users, Shield, Loader2, Check, Search, Save, X, 
  UserCog, ShieldCheck, LayoutGrid, ChevronRight 
} from 'lucide-react';

const AssignRoles = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminRes, roleRes] = await Promise.all([
        api.get('/auth/admin/list'),
        api.get('/api/auth/admin/roles')
      ]);
      
      if (adminRes.data.success) setAdmins(adminRes.data.data);
      if (roleRes.data.success) setRoles(roleRes.data.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      addToast("Failed to load assignment data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAssignModal = (admin) => {
    setSelectedAdmin(admin);
    const adminRoles = admin.roles || admin.Roles || [];
    const currentRoleIds = roles
      .filter(r => adminRoles.some(ar => 
        (typeof ar === 'string' && ar === r.Name) || 
        (typeof ar === 'object' && ar.Name === r.Name)
      ))
      .map(r => r.ID);
        
    setSelectedRoleIds(currentRoleIds);
    setIsModalOpen(true);
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
        await api.post('/api/auth/admin/assign-roles', {
            admin_id: selectedAdmin.id,
            role_ids: selectedRoleIds
        });
        addToast("Roles updated successfully!", "success");
        setIsModalOpen(false);
        fetchData();
    } catch (err) {
        addToast(err.response?.data?.error || "Failed to update roles", "error");
    } finally {
        setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    !a.is_super && 
    (a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     a.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 bg-[#f8fafc]">
      
      {/* --- RESPONSIVE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full">
              <ShieldCheck size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Access Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Role <span className="italic text-slate-400 font-light">Assignment</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light">
            Grant and revoke access permissions for staff members.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
         
         {/* Toolbar */}
         <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <UserCog size={18} className="text-indigo-500" /> Staff List
            </h3>
            <div className="relative w-full sm:w-80 sm:ml-auto group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-medium shadow-sm"
               />
            </div>
         </div>

         {/* --- DESKTOP TABLE VIEW --- */}
         <div className="hidden md:block flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 backdrop-blur-md z-10">
                    <tr>
                        <th className="px-8 py-5">Administrator Profile</th>
                        <th className="px-6 py-5">Assigned Roles</th>
                        <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="3" className="px-6 py-24 text-center"><Loader2 className="animate-spin inline mr-2 text-indigo-600"/> Loading...</td></tr>
                    ) : filteredAdmins.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-24 text-center text-slate-400">No staff found.</td></tr>
                    ) : (
                        filteredAdmins.map(admin => (
                            <tr key={admin.id} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {admin.name ? admin.name.charAt(0).toUpperCase() : <Users size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{admin.name || 'Unnamed Staff'}</div>
                                            <div className="text-xs text-slate-500 font-mono">{admin.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-2">
                                        {(admin.roles && admin.roles.length > 0) ? 
                                            admin.roles.map((r, i) => <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">{r}</span>) 
                                            : <span className="text-xs text-slate-400 italic">No roles</span>
                                        }
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button onClick={() => openAssignModal(admin)} className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-bold uppercase rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm">
                                        <LayoutGrid size={14}/> Manage
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>

         {/* --- MOBILE CARD VIEW --- */}
         <div className="md:hidden p-4 space-y-4 bg-slate-50/50 flex-1 overflow-y-auto">
            {loading ? <div className="text-center py-10"><Loader2 className="animate-spin inline text-indigo-600"/></div> : 
             filteredAdmins.length === 0 ? <div className="text-center text-slate-400 py-10">No staff found.</div> :
             filteredAdmins.map(admin => (
                <div key={admin.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                         {admin.name ? admin.name.charAt(0).toUpperCase() : <Users size={20} />}
                      </div>
                      <div className="min-w-0">
                         <h4 className="font-bold text-slate-900 truncate">{admin.name || 'Unnamed Staff'}</h4>
                         <p className="text-xs text-slate-500 font-mono truncate">{admin.email}</p>
                      </div>
                   </div>
                   
                   <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Assigned Roles</p>
                      <div className="flex flex-wrap gap-2">
                         {(admin.roles && admin.roles.length > 0) ? 
                            admin.roles.map((r, i) => <span key={i} className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">{r}</span>) 
                            : <span className="text-xs text-slate-400 italic">No roles assigned</span>
                         }
                      </div>
                   </div>

                   <button onClick={() => openAssignModal(admin)} className="w-full py-3 mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-all">
                      <LayoutGrid size={16}/> Manage Access
                   </button>
                </div>
             ))}
         </div>

         {/* Footer */}
         <div className="px-6 py-4 border-t border-slate-100 text-xs font-bold text-slate-400 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-b-[2rem]">
            <span>{filteredAdmins.length} users</span>
            {searchTerm && <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Filtered</span>}
         </div>
      </div>

      {/* --- ASSIGN ROLES MODAL --- */}
      {isModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
               
               <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-[2rem]">
                   <div>
                       <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2"><UserCog className="text-indigo-600" size={20}/> Modify Access</h2>
                       <p className="text-slate-500 text-xs mt-0.5">Permissions for <span className="font-bold text-slate-900">{selectedAdmin.name}</span></p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50"><X size={20} /></button>
               </div>
               
               <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                   <div className="space-y-3">
                       <div className="flex justify-between items-center">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Roles</label>
                           <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold border border-indigo-100">{selectedRoleIds.length} Active</span>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {roles.map(role => {
                               const isSelected = selectedRoleIds.includes(role.ID);
                               return (
                               <label key={role.ID} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                       <Shield size={16} />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <div className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{role.Name}</div>
                                       <div className="text-[10px] text-slate-400 font-mono">ID: {role.ID}</div>
                                   </div>
                                   {isSelected && <div className="bg-indigo-600 rounded-full p-0.5"><Check size={10} className="text-white"/></div>}
                                   <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleRole(role.ID)} />
                               </label>
                           )})}
                       </div>
                   </div>
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                   <button onClick={handleSave} disabled={submitting} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                       {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                       <span>Save Configuration</span>
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssignRoles;