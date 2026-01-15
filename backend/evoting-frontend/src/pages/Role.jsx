import React, { useEffect, useState } from 'react';
import api from '../utils/api';
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
  Save
} from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null); 
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Predefined System Permissions
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  // Filter Roles
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
      // Edit Mode
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
      // Create Mode
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
          setRoles(roles.filter(r => r.ID !== id));
      } catch (err) {
          alert("Failed to delete role. It might be in use.");
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
          alert("Role updated successfully!");
      } else {
          await api.post('/api/auth/admin/roles', payload);
          alert("Role created successfully!");
      }
      closeModal();
      fetchRoles();
    } catch (err) { 
      alert(`Failed to ${editingId ? 'update' : 'create'} role.`); 
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Role Definitions</h1>
          <p className="text-slate-400 mt-1">Configure access levels and permissions for the system.</p>
        </div>
        
        {/* Create Button */}
        <button 
          onClick={() => openModal(null)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create New Role
        </button>
      </div>

      {/* --- Active Roles Table --- */}
      <div className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
         
         {/* Toolbar */}
         <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Check size={16} className="text-emerald-500" />
              Active Roles List
            </h3>
            
            <div className="relative w-full sm:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                  type="text" 
                  placeholder="Search roles..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
               />
            </div>
         </div>

         {/* Table Area */}
         <div className="flex-1 overflow-y-auto custom-scrollbar relative">
         {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <Loader2 className="animate-spin mb-2 text-emerald-500" size={32} />
               <p>Loading configuration...</p>
            </div>
         ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <div className="p-4 rounded-full bg-slate-800/50 mb-3">
                 <ShieldCheck size={32} className="opacity-50" />
               </div>
               <p>No roles found.</p>
               <button onClick={() => openModal(null)} className="text-emerald-400 font-bold hover:underline mt-2">Create your first role</button>
            </div>
         ) : filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <p>No roles match your search.</p>
            </div>
         ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 shadow-md">
                  <tr className="text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold w-20 text-center bg-slate-900">ID</th>
                    <th className="px-6 py-4 font-semibold bg-slate-900 w-1/4">Role Name</th>
                    <th className="px-6 py-4 font-semibold bg-slate-900">Permissions</th>
                    <th className="px-6 py-4 font-semibold text-right bg-slate-900 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRoles.map((r) => {
                     const isSuper = r.Name.toUpperCase() === 'SUPER_ADMIN';
                     const permsArray = Array.isArray(r.Permissions) ? r.Permissions : r.Permissions.split(',');

                     return (
                       <tr key={r.ID} className="group hover:bg-slate-800/50 transition-colors">
                         <td className="px-6 py-4 text-center">
                           <span className="font-mono text-xs text-slate-500">#{r.ID}</span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSuper ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-300'}`}>
                                <Shield size={16} />
                             </div>
                             <div>
                                <span className="font-bold text-sm text-white block">{r.Name}</span>
                                {isSuper && <span className="text-[10px] text-emerald-400 font-medium">System Protected</span>}
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-wrap gap-1.5">
                             {permsArray.slice(0, 5).map((perm, idx) => (
                                <span key={idx} className="text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded whitespace-nowrap">
                                  {perm.trim().replace(/_/g, ' ')}
                                </span>
                             ))}
                             {permsArray.length > 5 && (
                                <span className="text-[10px] font-medium bg-slate-800 text-slate-500 border border-slate-700 px-2 py-1 rounded">
                                  +{permsArray.length - 5} more
                                </span>
                             )}
                             {permsArray.length === 0 && <span className="text-xs text-slate-600 italic">No permissions</span>}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openModal(r)}
                                disabled={isSuper}
                                className={`p-2 rounded-lg border border-transparent transition-all ${
                                    isSuper
                                    ? 'text-slate-700 cursor-not-allowed opacity-50'
                                    : 'text-slate-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30'
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
                                  ? 'text-slate-700 cursor-not-allowed opacity-50' 
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
         <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30 shrink-0">
            <span>Showing {filteredRoles.length} roles</span>
            {searchTerm && filteredRoles.length !== roles.length && (
               <span className="text-emerald-500/70">Filtered from {roles.length} total</span>
            )}
         </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
               <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-white">
                          {editingId ? 'Edit Role' : 'Create New Role'}
                      </h2>
                      <p className="text-xs text-slate-400">
                          {editingId ? `Editing permissions for role #${editingId}` : 'Define a new access level'}
                      </p>
                   </div>
               </div>
               <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                 <X size={24} />
               </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-slate-500 uppercase">Role Name</label>
                   <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                          type="text"
                          required 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                          placeholder="e.g. MODERATOR"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                      <LayoutGrid size={14} />
                      Assign Permissions
                   </label>
                   <div className="grid grid-cols-1 gap-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <label 
                          key={perm.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                            selectedPermissions.includes(perm.id) 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'hover:bg-slate-800 border-transparent'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                             selectedPermissions.includes(perm.id)
                               ? 'bg-emerald-500 border-emerald-500'
                               : 'border-slate-600 bg-slate-900'
                          }`}>
                             {selectedPermissions.includes(perm.id) && <Check size={14} className="text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <span className={`text-sm ${selectedPermissions.includes(perm.id) ? 'text-white font-medium' : 'text-slate-400'}`}>
                            {perm.label}
                          </span>
                        </label>
                      ))}
                   </div>
                   <p className="text-[10px] text-slate-500 text-right">
                      {selectedPermissions.length} selected
                   </p>
                </div>

                <div className="pt-2">
                  <button 
                     type="submit" 
                     disabled={submitting || !name || selectedPermissions.length === 0}
                     className={`w-full py-3.5 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                         editingId 
                         ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' 
                         : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                     }`}
                  >
                     {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                     <span>{editingId ? 'Update Role' : 'Create Role'}</span>
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