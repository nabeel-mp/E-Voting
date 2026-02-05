import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck, Shield, Plus, Loader2, Check, LayoutGrid, Trash2, Pencil,
  X, Search, Save, Lock, Settings, AlertTriangle
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

  // --- Confirmation Modal State ---
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, name: '' });

  const AVAILABLE_PERMISSIONS = [
    { id: 'manage_elections', label: 'Manage Elections' },
    { id: 'manage_voters', label: 'View Voters List' },
    { id: 'register_voter', label: 'Manage Voters (Full)' },
    { id: 'verify_voter', label: 'Verify Voters' },
    { id: 'manage_candidates', label: 'Manage Candidates' },
    { id: 'manage_parties', label: 'Manage Parties' },
    { id: 'manage_admins', label: 'Manage Staff & Roles' },
  ];

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/auth/admin/roles');
      if (res.data.success) setRoles(res.data.data);
    } catch (err) {
      addToast("Failed to load roles", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRoles(); }, []);

  const filteredRoles = roles.filter(role => {
    const searchLower = searchTerm.toLowerCase();
    const roleName = role.Name.toLowerCase();
    const perms = Array.isArray(role.Permissions) ? role.Permissions.join(' ') : (role.Permissions || '');
    return roleName.includes(searchLower) || perms.toLowerCase().includes(searchLower);
  });

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const openModal = (role = null) => {
    if (role) {
      setEditingId(role.ID);
      setName(role.Name);
      let perms = [];
      if (Array.isArray(role.Permissions)) perms = role.Permissions;
      else if (typeof role.Permissions === 'string') perms = role.Permissions.split(',').map(p => p.trim());
      setSelectedPermissions(perms);
    } else {
      setEditingId(null); setName(''); setSelectedPermissions([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setName(''); setSelectedPermissions([]); };

  const initiateDelete = (role) => { setConfirmModal({ show: true, id: role.ID, name: role.Name }); };

  const executeDelete = async () => {
    const { id } = confirmModal;
    if (!id) return;
    setSubmitting(true);
    try {
      await api.delete(`/api/auth/admin/roles/${id}`);
      addToast("Role deleted successfully", "success");
      setRoles(roles.filter(r => r.ID !== id));
      setConfirmModal({ show: false, id: null, name: '' });
    } catch (err) { addToast("Failed to delete role. It might be in use.", "error"); } 
    finally { setSubmitting(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedPermissions.length === 0) return;
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
      closeModal(); fetchRoles();
    } catch (err) { addToast(`Failed to ${editingId ? 'update' : 'create'} role.`, "error"); } 
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full">
            <ShieldCheck size={14} className="text-indigo-700" />
            <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Access Control</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Role <span className="italic text-slate-400 font-light">Definitions</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light">Configure access levels and permissions for the system.</p>
        </div>
        <button onClick={() => openModal(null)} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 w-full md:w-auto">
          <Plus size={20} /> <span>Create New Role</span>
        </button>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Settings size={18} className="text-indigo-500" /> Active Roles List
          </h3>
          <div className="relative w-full sm:w-80 sm:ml-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="Search roles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 font-medium transition-all shadow-sm"
            />
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 bg-white relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-3 text-indigo-600" size={40} />
              <p className="font-medium animate-pulse">Loading permissions...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 px-4 text-center">
              <div className="p-5 rounded-full bg-slate-50 mb-4 border border-slate-100"><Shield size={40} className="text-slate-300" /></div>
              <p className="text-lg font-medium text-slate-600">No roles defined.</p>
              <button onClick={() => openModal(null)} className="text-indigo-600 font-bold hover:underline mt-2">Create the first one</button>
            </div>
          ) : filteredRoles.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Search size={32} className="opacity-40 mb-3" /><p>No roles match your search.</p></div>
          ) : (
            <>
              {/* --- DESKTOP TABLE VIEW --- */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 w-24 text-center">ID</th>
                      <th className="px-6 py-5 w-1/4">Role Name</th>
                      <th className="px-6 py-5">Permissions</th>
                      <th className="px-8 py-5 text-right w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRoles.map((r) => {
                      const isSuper = r.Name.toUpperCase() === 'SUPER_ADMIN';
                      const permsArray = Array.isArray(r.Permissions) ? r.Permissions : (r.Permissions || '').split(',').filter(p => p.trim() !== '');
                      return (
                        <tr key={r.ID} className="group hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-5 text-center"><span className="font-mono text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded font-bold">#{r.ID}</span></td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${isSuper ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}><Shield size={18} /></div>
                              <div>
                                <span className="font-bold text-slate-900 block">{r.Name}</span>
                                {isSuper && <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1"><Lock size={8} /> Protected</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {permsArray.slice(0, 4).map((perm, idx) => (<span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-lg uppercase">{perm.trim().replace(/_/g, ' ')}</span>))}
                              {permsArray.length > 4 && <span className="text-[10px] font-bold bg-white text-slate-400 border border-slate-200 px-2 py-1 rounded-lg">+{permsArray.length - 4} more</span>}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openModal(r)} disabled={isSuper} className={`p-2 rounded-lg transition-colors ${isSuper ? 'text-slate-300' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}><Pencil size={16} /></button>
                              <button onClick={() => initiateDelete(r)} disabled={isSuper} className={`p-2 rounded-lg transition-colors ${isSuper ? 'text-slate-300' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* --- MOBILE/TABLET CARD VIEW --- */}
              <div className="lg:hidden p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredRoles.map((r) => {
                   const isSuper = r.Name.toUpperCase() === 'SUPER_ADMIN';
                   const permsArray = Array.isArray(r.Permissions) ? r.Permissions : (r.Permissions || '').split(',').filter(p => p.trim() !== '');
                   return (
                     <div key={r.ID} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isSuper ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}><Shield size={20}/></div>
                              <div>
                                 <h3 className="font-bold text-slate-900">{r.Name}</h3>
                                 <span className="text-xs font-mono text-slate-400">ID: {r.ID}</span>
                              </div>
                           </div>
                           {isSuper && <Lock size={16} className="text-amber-500"/>}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                           {permsArray.map((perm, idx) => (
                              <span key={idx} className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-md uppercase tracking-wide">
                                 {perm.replace(/_/g, ' ')}
                              </span>
                           ))}
                           {permsArray.length === 0 && <span className="text-xs text-slate-300 italic">No permissions</span>}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                           <button onClick={() => openModal(r)} disabled={isSuper} className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border ${isSuper ? 'border-slate-100 text-slate-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                              <Pencil size={16}/> Edit
                           </button>
                           <button onClick={() => initiateDelete(r)} disabled={isSuper} className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border ${isSuper ? 'border-slate-100 text-slate-300' : 'border-rose-100 text-rose-600 bg-rose-50'}`}>
                              <Trash2 size={16}/> Delete
                           </button>
                        </div>
                     </div>
                   );
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-xs font-bold text-slate-400 flex justify-between items-center rounded-b-[2rem]">
           <span>Showing {filteredRoles.length} roles</span>
           {searchTerm && <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100">Filtered</span>}
        </div>
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-[2rem]">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">{editingId ? 'Edit Role' : 'New Role'}</h2>
                <p className="text-slate-500 text-xs mt-0.5">Define access permissions.</p>
              </div>
              <button onClick={closeModal} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role Name</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400" placeholder="e.g. MODERATOR" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2"><LayoutGrid size={14} /> Permissions</label>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 font-bold">{selectedPermissions.length} selected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    return (
                      <label key={perm.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/10' : 'hover:bg-white border-transparent hover:border-slate-200'}`}>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={isSelected} onChange={() => togglePermission(perm.id)} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>{perm.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <button type="submit" disabled={submitting || !name || selectedPermissions.length === 0} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? <Save size={20} /> : <Plus size={20} />)}
                <span>{editingId ? 'Save Changes' : 'Create Role'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmModal({ show: false, id: null, name: '' })} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-rose-50 text-rose-500"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Role?</h3>
            <p className="text-slate-500 mb-8 text-sm">Are you sure you want to delete <strong>{confirmModal.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, id: null, name: '' })} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
              <button onClick={executeDelete} disabled={submitting} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg">{submitting ? <Loader2 className="animate-spin mx-auto"/> : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;