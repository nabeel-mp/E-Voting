import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  ShieldCheck, 
  Shield, 
  Plus, 
  Loader2, 
  Check, 
  LayoutGrid,
  Trash2,      // New Import
  Pencil,      // New Import
  X            // New Import
} from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Predefined System Permissions
  const AVAILABLE_PERMISSIONS = [
    { id: 'view_dashboard', label: 'View Dashboard' },
    { id: 'manage_voters', label: 'Manage Voters' },
    { id: 'register_voter', label: 'Register Voter' },
    { id: 'manage_candidates', label: 'Manage Candidates' },
    { id: 'manage_parties', label: 'Manage Parties' },
    { id: 'view_results', label: 'View Results' },
    { id: 'manage_admins', label: 'Manage Staff' },
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

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const resetForm = () => {
      setName('');
      setSelectedPermissions([]);
      setEditingId(null);
  };

  // --- NEW: Populate form for editing ---
  const handleEdit = (role) => {
      setEditingId(role.ID);
      setName(role.Name);
      
      // Handle permission parsing (array vs string)
      let perms = [];
      if (Array.isArray(role.Permissions)) {
          perms = role.Permissions;
      } else if (typeof role.Permissions === 'string') {
          perms = role.Permissions.split(',').map(p => p.trim());
      }
      setSelectedPermissions(perms);
  };

  // --- NEW: Handle Delete ---
  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this role? This might affect users assigned to it.")) return;

      try {
          await api.delete(`/api/auth/admin/roles/${id}`);
          setRoles(roles.filter(r => r.ID !== id));
          if(editingId === id) resetForm(); // Reset form if we deleted the currently editing role
      } catch (err) {
          alert("Failed to delete role.");
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name || selectedPermissions.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name,
        permissions: selectedPermissions 
      };

      if (editingId) {
          // Update Existing
          await api.put(`/api/auth/admin/roles/${editingId}`, payload);
          alert("Role updated successfully!");
      } else {
          // Create New
          await api.post('/api/auth/admin/roles', payload);
          alert("Role created successfully!");
      }

      resetForm();
      fetchRoles();
    } catch (err) { 
      alert(`Failed to ${editingId ? 'update' : 'create'} role.`); 
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Role Definitions</h1>
        <p className="text-slate-400 mt-1">Configure access levels and permissions for the system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: Create/Edit Role Form --- */}
        <div className="lg:col-span-1">
          <div className={`bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-6 shadow-xl sticky top-6 transition-colors duration-300 ${editingId ? 'border-amber-500/30' : 'border-slate-800'}`}>
             <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                       {editingId ? <Pencil size={24} /> : <ShieldCheck size={24} />}
                    </div>
                    <div>
                       <h2 className="text-lg font-bold text-white">
                           {editingId ? 'Edit Role' : 'Create Role'}
                       </h2>
                       <p className="text-xs text-slate-500">
                           {editingId ? `Updating Role ID: ${editingId}` : 'Define new access group'}
                       </p>
                    </div>
                </div>
                {editingId && (
                    <button onClick={resetForm} className="text-slate-500 hover:text-white" title="Cancel Edit">
                        <X size={20} />
                    </button>
                )}
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Role Name Input */}
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

                {/* Permission Checkboxes */}
                <div className="space-y-3">
                   <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                      <LayoutGrid size={14} />
                      Access Permissions
                   </label>
                   
                   <div className="grid grid-cols-1 gap-2 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <label 
                          key={perm.id} 
                          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-all duration-200 ${
                            selectedPermissions.includes(perm.id) 
                              ? 'bg-emerald-500/10 border-emerald-500/30' 
                              : 'hover:bg-slate-800 border-transparent'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
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

                <button 
                   type="submit" 
                   disabled={submitting || !name || selectedPermissions.length === 0}
                   className={`w-full py-3 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                       editingId 
                       ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' 
                       : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                   }`}
                >
                   {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Pencil size={18} /> : <Plus size={18} />)}
                   <span>{editingId ? 'Update Role' : 'Save Role'}</span>
                </button>
             </form>
          </div>
        </div>

        {/* --- RIGHT: Existing Roles List --- */}
        <div className="lg:col-span-2">
           <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Check size={16} className="text-emerald-500" />
                Active Roles
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                   <Loader2 className="animate-spin mb-2 text-emerald-500" size={32} />
                   <p>Loading configuration...</p>
                </div>
              ) : roles.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No roles found. Create your first one on the left.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((r) => (
                      <div key={r.ID} className={`group bg-slate-800/40 p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ${editingId === r.ID ? 'border-amber-500 ring-1 ring-amber-500/50 bg-slate-800' : 'border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800'}`}>
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                 {r.ID}
                              </div>
                              <h4 className="font-bold text-white">{r.Name}</h4>
                           </div>
                           
                           {/* Actions Toolbar */}
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => handleEdit(r)}
                                 className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                                 title="Edit Role"
                               >
                                   <Pencil size={16} />
                               </button>
                               <button 
                                 onClick={() => handleDelete(r.ID)}
                                 className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                                 title="Delete Role"
                               >
                                   <Trash2 size={16} />
                               </button>
                           </div>
                        </div>

                        {/* Permissions Tags */}
                        <div className="flex flex-wrap gap-2">
                           {r.Permissions ? (
                             (Array.isArray(r.Permissions) ? r.Permissions : r.Permissions.split(','))
                             .map((perm, idx) => (
                               <span key={idx} className="text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded">
                                  {perm.trim().replace(/_/g, ' ')}
                               </span>
                             ))
                           ) : (
                             <span className="text-xs text-slate-600 italic">No specific permissions</span>
                           )}
                        </div>
                      </div>
                  ))}
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Roles;