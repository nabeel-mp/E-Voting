import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  Shield, 
  Loader2, 
  Check, 
  Search,
  Save,
  X,
  UserCog,
  ShieldCheck,
  LayoutGrid
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
    // Determine pre-selected role IDs based on role names
    const currentRoleIds = roles
        .filter(r => admin.roles && admin.roles.includes(r.Name))
        .map(r => r.ID);
        
    setSelectedRoleIds(currentRoleIds);
    setIsModalOpen(true);
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
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
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Role Assignment
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Grant and revoke access permissions for staff members.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[650px]">
         
         {/* Toolbar */}
         <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCog size={18} className="text-cyan-400" />
              Staff List
            </h3>
            <div className="relative w-full sm:w-72 ml-auto group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
               />
            </div>
         </div>

         {/* Scrollable Table Area */}
         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10 shadow-sm">
                    <tr>
                        <th className="px-8 py-5">Administrator Profile</th>
                        <th className="px-6 py-5">Assigned Roles</th>
                        <th className="px-8 py-5 text-right">Permissions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                    {loading ? (
                        <tr><td colSpan="3" className="px-6 py-24 text-center"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /><span className="text-slate-500 animate-pulse">Loading staff details...</span></div></td></tr>
                    ) : filteredAdmins.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-24 text-center text-slate-500">No staff members found matching your search.</td></tr>
                    ) : (
                        filteredAdmins.map(admin => (
                            <tr key={admin.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300 font-bold shadow-sm group-hover:border-indigo-500/30 transition-colors">
                                            {admin.name ? admin.name.charAt(0).toUpperCase() : <Users size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-200 text-base">{admin.name || 'Unnamed Staff'}</div>
                                            <div className="text-xs text-slate-500 font-mono">{admin.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-2">
                                        {admin.roles && admin.roles.length > 0 ? (
                                            admin.roles.map((r, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm">
                                                    {r}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-600 text-xs italic flex items-center gap-1"><ShieldCheck size={12} className="opacity-50"/> No active roles</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button 
                                        onClick={() => openAssignModal(admin)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wide rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 transform hover:-translate-y-0.5"
                                    >
                                        <LayoutGrid size={14} /> Manage Roles
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
         
         {/* Footer */}
         <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30 shrink-0 backdrop-blur-md">
            <span>Showing {filteredAdmins.length} staff members</span>
            {searchTerm && filteredAdmins.length !== admins.length && (
               <span className="text-indigo-400">Filtered from {admins.length} total</span>
            )}
         </div>
      </div>

      {/* --- ASSIGN ROLES MODAL --- */}
      {isModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[85vh]">
                
                <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <UserCog className="text-cyan-400" size={24} />
                            Modify Access
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Update permissions for <span className="text-slate-300 font-medium">{selectedAdmin.name || selectedAdmin.email}</span></p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
                </div>
                
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Available System Roles</label>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">{selectedRoleIds.length} Assigned</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2.5">
                            {roles.map(role => {
                                const isSelected = selectedRoleIds.includes(role.ID);
                                return (
                                <label 
                                    key={role.ID} 
                                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${
                                        isSelected
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md'
                                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                {role.Name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">ID: {role.ID}</div>
                                        </div>
                                    </div>
                                    
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isSelected 
                                        ? 'bg-indigo-500 border-indigo-500' 
                                        : 'border-slate-600 bg-transparent group-hover:border-slate-500'
                                    }`}>
                                        {isSelected && <Check size={14} className="text-white" />}
                                    </div>
                                    
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={isSelected}
                                        onChange={() => toggleRole(role.ID)}
                                    />
                                </label>
                            )})}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
                    <button 
                        onClick={handleSave}
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
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