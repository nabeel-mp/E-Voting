import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  Shield, 
  Plus, 
  Loader2, 
  Check, 
  LayoutGrid,
  Trash2,
  Pencil,
  X,
  Search,
  Save,
  Lock
} from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const AVAILABLE_PERMISSIONS = [
    { id: 'view_dashboard', label: 'View Dashboard' },
    { id: 'manage_elections', label: 'Manage Elections' },
    { id: 'manage_voters', label: 'Manage Voters' },
    { id: 'register_voter', label: 'Register Voter' },
    { id: 'manage_candidates', label: 'Manage Candidates' },
    { id: 'manage_parties', label: 'Manage Parties' },
    { id: 'view_results', label: 'View Results' },
    { id: 'manage_roles', label: 'Manage Roles' },
    { id: 'manage_admins', label: 'Manage Staff' },
    { id: 'manage_system_admins', label: 'System Admins' },
    { id: 'view_audit_logs', label: 'View Audit Logs' },
    { id: 'manage_settings', label: 'System Settings' }
  ];

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/auth/admin/roles');
      if (res.data.success) setRoles(res.data.data);
    } catch (err) { 
      console.error("Failed to fetch roles", err); 
      addToast("Failed to load roles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const filteredRoles = roles.filter(role => {
    const searchLower = searchTerm.toLowerCase();
    const roleName = role.Name.toLowerCase();
    const perms = Array.isArray(role.Permissions) 
      ? role.Permissions.join(' ') 
      : (role.Permissions || '');

    return roleName.includes(searchLower) || perms.toLowerCase().includes(searchLower);
  });

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const openModal = (role = null) => {
    if (role) {
      setEditingId(role.ID);
      setName(role.Name);
      let perms = [];
      if (Array.isArray(role.Permissions)) {
          perms = role.Permissions;
      } else if (typeof role.Permissions === 'string') {
          perms = role.Permissions.split(',').map(p => p.trim());
      }
      setSelectedPermissions(perms);
    } else {
      setEditingId(null);
      setName('');
      setSelectedPermissions([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setSelectedPermissions([]);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this role? This might affect users assigned to it.")) return;
      try {
          await api.delete(`/api/auth/admin/roles/${id}`);
          addToast("Role deleted successfully", "success");
          setRoles(roles.filter(r => r.ID !== id));
      } catch (err) {
          addToast("Failed to delete role. It might be in use.", "error");
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name || selectedPermissions.length === 0) return;

    setSubmitting(true);
    try {
      const payload = { name: name, permissions: selectedPermissions };
      if (editingId) {
          await api.put(`/api/auth/admin/roles/${editingId}`, payload);
          addToast("Role updated successfully!", "success");
      } else {
          await api.post('/api/auth/admin/roles', payload);
          addToast("Role created successfully!", "success");
      }
      closeModal();
      fetchRoles();
    } catch (err) { 
      addToast(`Failed to ${editingId ? 'update' : 'create'} role.`, "error"); 
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Role Definitions
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Configure access levels and permissions for the system.
          </p>
        </div>
        <button 
          onClick={() => openModal(null)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span>Create New Role</span>
        </button>
      </div>

      {/* Main Content Area - Preserving Scrolling Structure */}
<div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[550px]">         
         {/* Toolbar */}
         <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={18} className="text-cyan-400" />
              Active Roles List
            </h3>
            <div className="relative w-full sm:w-72 ml-auto group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Search roles..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
               />
            </div>
         </div>

         {/* Scrollable Table Area */}
         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
         {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <Loader2 className="animate-spin mb-3 text-indigo-500" size={40} />
               <p className="animate-pulse">Loading permissions...</p>
            </div>
         ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <div className="p-5 rounded-full bg-slate-800/50 mb-4">
                 <Shield size={40} className="opacity-40" />
               </div>
               <p className="text-lg font-medium">No roles found.</p>
               <button onClick={() => openModal(null)} className="text-indigo-400 font-bold hover:underline mt-2">Create your first role</button>
            </div>
         ) : filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <Search size={32} className="opacity-40 mb-3" />
               <p>No roles match your search.</p>
            </div>
         ) : (
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10 shadow-sm">
                  <tr>
                    <th className="px-8 py-5 w-24 text-center">ID</th>
                    <th className="px-6 py-5 w-1/4">Role Name</th>
                    <th className="px-6 py-5">Permissions</th>
                    <th className="px-8 py-5 text-right w-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredRoles.map((r) => {
                      const isSuper = r.Name.toUpperCase() === 'SUPER_ADMIN';
                      const permsArray = Array.isArray(r.Permissions) ? r.Permissions : r.Permissions.split(',');

                      return (
                        <tr key={r.ID} className="group hover:bg-indigo-500/[0.02] transition-colors">
                          <td className="px-8 py-5 text-center">
                            <span className="font-mono text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">#{r.ID}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${isSuper ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                                 <Shield size={18} />
                              </div>
                              <div>
                                 <span className="font-bold text-slate-200 block text-base">{r.Name}</span>
                                 {isSuper && <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-medium bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-900/50 mt-1"><Lock size={8} /> System Protected</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {permsArray.slice(0, 5).map((perm, idx) => (
                                 <span key={idx} className="text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg whitespace-nowrap shadow-sm">
                                   {perm.trim().replace(/_/g, ' ')}
                                 </span>
                              ))}
                              {permsArray.length > 5 && (
                                 <span className="text-[10px] font-semibold bg-indigo-900/20 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg shadow-sm">
                                   +{permsArray.length - 5} more
                                 </span>
                              )}
                              {permsArray.length === 0 && <span className="text-xs text-slate-600 italic">No permissions assigned</span>}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openModal(r)}
                                disabled={isSuper}
                                className={`p-2 rounded-lg border border-transparent transition-all ${
                                    isSuper
                                    ? 'text-slate-700 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                                }`}
                                title={isSuper ? "Cannot edit System Admin" : "Edit Role"}
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(r.ID)}
                                disabled={isSuper}
                                className={`p-2 rounded-lg border border-transparent transition-all ${
                                  isSuper 
                                  ? 'text-slate-700 cursor-not-allowed' 
                                  : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20'
                                }`}
                                title={isSuper ? "Cannot delete System Admin" : "Delete Role"}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                  })}
                </tbody>
              </table>
         )}
         </div>
         
         {/* Footer */}
         <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30 shrink-0 backdrop-blur-md">
            <span>Showing {filteredRoles.length} roles</span>
            {searchTerm && filteredRoles.length !== roles.length && (
               <span className="text-indigo-400">Filtered from {roles.length} total</span>
            )}
         </div>
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
               <div>
                   <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                       {editingId ? 'Edit Role' : 'Create Role'}
                   </h2>
                   <p className="text-slate-500 text-sm mt-1">
                       {editingId ? `Modify permissions for role ID #${editingId}` : 'Define a new role and assign permissions.'}
                   </p>
               </div>
               <button onClick={closeModal} className="p-2 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
                 <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Role Name</label>
                   <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                          type="text"
                          required 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                          placeholder="e.g. MODERATOR"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                          <LayoutGrid size={14} /> Assign Permissions
                       </label>
                       <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{selectedPermissions.length} selected</span>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/30 p-1 rounded-xl">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isSelected = selectedPermissions.includes(perm.id);
                        return (
                        <label 
                          key={perm.id} 
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 group ${
                            isSelected
                            ? 'bg-indigo-600/10 border-indigo-500/30 shadow-sm' 
                            : 'hover:bg-slate-800 border-transparent hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                             isSelected
                               ? 'bg-indigo-500 border-indigo-500 scale-110'
                               : 'border-slate-600 bg-slate-900 group-hover:border-slate-500'
                          }`}>
                             {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={isSelected}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <span className={`text-sm select-none ${isSelected ? 'text-indigo-200 font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                            {perm.label}
                          </span>
                        </label>
                      )})}
                   </div>
                </div>

                <div className="pt-2">
                  <button 
                     type="submit" 
                     disabled={submitting || !name || selectedPermissions.length === 0}
                     className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                         editingId 
                         ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20' 
                         : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25'
                     }`}
                  >
                     {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? <Save size={20} /> : <Plus size={20} />)}
                     <span>{editingId ? 'Update Role Configuration' : 'Create Role'}</span>
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Roles;