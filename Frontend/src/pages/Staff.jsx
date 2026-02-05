import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  UserPlus, Mail, Lock, CheckCircle2, Loader2, Users, Search, X,
  LayoutGrid, Unlock, AlertTriangle
} from 'lucide-react';

const Staff = () => {
  const [staffForm, setStaffForm] = useState({ email: '', password: '' });
  const [staffLoading, setStaffLoading] = useState(false);
  const { addToast } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // State for row actions
  const [processingId, setProcessingId] = useState(null);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, id: null, email: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const res = await api.get('/auth/admin/list');
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admins", err);
      addToast("Failed to load staff list", "error");
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    try {
      await api.post('/api/auth/admin/create-sub-admin', { ...staffForm, role_ids: [] });
      addToast("Staff created successfully! Roles can be assigned now.", "success");
      setStaffForm({ email: '', password: '' });
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to create staff", "error");
    } finally {
      setStaffLoading(false);
    }
  };

  const toggleAvailability = async (id, currentAvailability) => {
    if (processingId) return;
    setProcessingId(id);
    const previousAdmins = [...admins];
    setAdmins(admins.map(admin => admin.id === id ? { ...admin, is_available: !currentAvailability } : admin));

    try {
      await api.post('/api/auth/admin/toggle-availability', { admin_id: id });
      addToast(`Availability updated`, "success");
    } catch (err) {
      addToast("Failed to update availability", "error");
      setAdmins(previousAdmins); 
    } finally {
      setProcessingId(null);
    }
  };

  const initiateStatusToggle = (admin) => {
    const action = admin.is_active ? 'BLOCK' : 'UNBLOCK';
    setConfirmModal({ show: true, action, id: admin.id, email: admin.email });
  };

  const executeStatusToggle = async () => {
    const { action, id } = confirmModal;
    if (!id) return;
    setSubmitting(true);
    try {
      const endpoint = action === 'BLOCK' ? "/auth/admin/block" : "/auth/admin/unblock";
      await api.post(endpoint, { admin_id: id });
      addToast(`Staff ${action === 'BLOCK' ? 'blocked' : 'unblocked'} successfully`, "success");
      setAdmins(admins.map(admin => {
        if (admin.id === id) {
            if (action === 'BLOCK') return { ...admin, is_active: false, is_available: false };
            return { ...admin, is_active: true };
        }
        return admin;
      }));
      setConfirmModal({ show: false, action: null, id: null, email: '' });
    } catch (err) {
      addToast(`Failed to ${action.toLowerCase()} staff.`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    if (admin.is_super) return false;
    const matchesSearch = admin.email.toLowerCase().includes(searchTerm.toLowerCase()) || (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase()));
    let matchesStatus = true;
    if (filterStatus === 'ACTIVE') matchesStatus = admin.is_active === true;
    if (filterStatus === 'BLOCKED') matchesStatus = admin.is_active === false;
    if (filterStatus === 'AVAILABLE') matchesStatus = admin.is_active === true && admin.is_available === true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 bg-[#f8fafc]">

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full">
              <Users size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Admin Team</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Staff <span className="italic text-slate-400 font-light">Management</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light">
            Oversee administrators, manage availability, and control access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
          <Link to="/admin/assign-roles" className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all border border-slate-200 shadow-sm active:scale-95 group">
            <LayoutGrid size={18} className="text-indigo-500 group-hover:text-indigo-600" />
            <span>Assign Roles</span>
          </Link>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
            <UserPlus size={20} /> <span>Register Staff</span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">

        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-500">
             <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm"><Users size={18} className="text-indigo-500" /></div>
             <h3 className="text-sm font-bold uppercase tracking-wider">Staff Directory</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 lg:ml-auto w-full lg:w-auto">
             <div className="relative flex-1 lg:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search staff..."
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
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">User</th>
                <th className="px-6 py-5">Roles</th>
                <th className="px-6 py-5 text-center">Availability</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingAdmins ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center"><Loader2 className="animate-spin inline mr-2 text-indigo-600"/> Loading...</td></tr>
              ) : filteredAdmins.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400">No staff members found.</td></tr>
              ) : filteredAdmins.map(admin => {
                  const showAvailable = admin.is_available && admin.is_active;
                  const isToggleDisabled = processingId === admin.id || !admin.is_active;
                  return (
                    <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-slate-50' : 'bg-rose-50/30'}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{admin.email.charAt(0).toUpperCase()}</div>
                          <div><div className="font-bold text-slate-900">{admin.email}</div><div className="text-xs text-slate-400">ID: #{admin.id}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {(admin.roles && admin.roles.length > 0) ? admin.roles.map((r, i) => <span key={i} className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">{r}</span>) : <span className="text-xs text-slate-400 italic">No roles</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => toggleAvailability(admin.id, admin.is_available)} disabled={isToggleDisabled} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAvailable ? 'bg-emerald-500' : 'bg-slate-200'} ${isToggleDisabled ? 'opacity-50' : ''}`}>
                          <span className={`${showAvailable ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`} />
                        </button>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${admin.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{admin.is_active ? 'Active' : 'Blocked'}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                          <button onClick={() => initiateStatusToggle(admin)} disabled={processingId === admin.id} className={`p-2 rounded-lg border transition-all ${admin.is_active ? 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200' : 'bg-white border-rose-200 text-rose-500 hover:text-emerald-500 hover:border-emerald-200'}`}>
                             {admin.is_active ? <Lock size={16}/> : <Unlock size={16}/>}
                          </button>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW --- */}
        <div className="lg:hidden p-4 space-y-4 bg-slate-50/50 flex-1 overflow-y-auto">
            {loadingAdmins ? <div className="text-center py-10"><Loader2 className="animate-spin inline text-indigo-600"/></div> : 
             filteredAdmins.length === 0 ? <div className="text-center text-slate-400 py-10">No staff found.</div> :
             filteredAdmins.map(admin => {
                const showAvailable = admin.is_available && admin.is_active;
                const isToggleDisabled = processingId === admin.id || !admin.is_active;
                return (
                  <div key={admin.id} className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 ${admin.is_active ? 'border-slate-200' : 'border-rose-100 bg-rose-50/20'}`}>
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{admin.email.charAt(0).toUpperCase()}</div>
                           <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{admin.email}</h4>
                              <p className="text-xs text-slate-400">ID: #{admin.id}</p>
                           </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${admin.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{admin.is_active ? 'Active' : 'Blocked'}</span>
                     </div>

                     <div className="flex flex-wrap gap-2">
                        {(admin.roles && admin.roles.length > 0) ? admin.roles.map((r, i) => <span key={i} className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">{r}</span>) : <span className="text-xs text-slate-400 italic">No roles assigned</span>}
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                           <button onClick={() => toggleAvailability(admin.id, admin.is_available)} disabled={isToggleDisabled} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAvailable ? 'bg-emerald-500' : 'bg-slate-200'} ${isToggleDisabled ? 'opacity-50' : ''}`}>
                              <span className={`${showAvailable ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`} />
                           </button>
                           <span className="text-xs font-bold text-slate-500 uppercase">Availability</span>
                        </div>
                        <button onClick={() => initiateStatusToggle(admin)} disabled={processingId === admin.id} className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${admin.is_active ? 'bg-white border-slate-200 text-slate-500' : 'bg-white border-rose-200 text-rose-500'}`}>
                           {admin.is_active ? <><Lock size={14}/> Block Access</> : <><Unlock size={14}/> Unblock</>}
                        </button>
                     </div>
                  </div>
                )
             })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-xs font-bold text-slate-400 flex justify-between items-center rounded-b-[2rem]">
           <span>{filteredAdmins.length} staff members</span>
           {searchTerm && <span className="text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Filtered</span>}
        </div>
      </div>

      {/* --- REGISTER STAFF MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-[2rem]">
              <h2 className="text-xl font-bold text-slate-900 font-serif">Register Staff</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateStaff} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
                   <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" required value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-all" placeholder="staff@email.com" /></div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
                   <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" required value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-all" placeholder="••••••••" /></div>
                </div>
              </div>
              <button type="submit" disabled={staffLoading} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                {staffLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} <span>Create Account</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmModal({ show: false, action: null, id: null, email: '' })} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmModal.action === 'BLOCK' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}><AlertTriangle size={28} /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmModal.action === 'BLOCK' ? 'Block Access?' : 'Unblock Access?'}</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to {confirmModal.action?.toLowerCase()} <strong>{confirmModal.email}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, action: null, id: null, email: '' })} className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600">Cancel</button>
              <button onClick={executeStatusToggle} disabled={submitting} className={`flex-1 py-2.5 text-white rounded-xl font-bold shadow-lg ${confirmModal.action === 'BLOCK' ? 'bg-rose-600' : 'bg-emerald-600'}`}>{submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Staff;