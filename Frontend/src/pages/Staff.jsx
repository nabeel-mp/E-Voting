import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  Loader2,
  Users,
  Search,
  X,
  LayoutGrid,
  Unlock,
  AlertTriangle
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
      await api.post('/api/auth/admin/create-sub-admin', {
        ...staffForm,
        role_ids: []
      });
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

  // --- CONFIRMATION HANDLERS ---

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

      // Update local state
      setAdmins(admins.map(admin => {
        if (admin.id === id) {
            if (action === 'BLOCK') {
                return { ...admin, is_active: false, is_available: false };
            }
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
    // 1. Exclude Super Admins
    if (admin.is_super) return false;

    // 2. Search Filter
    const matchesSearch = 
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // 3. Status Filter
    let matchesStatus = true;
    if (filterStatus === 'ACTIVE') matchesStatus = admin.is_active === true;
    if (filterStatus === 'BLOCKED') matchesStatus = admin.is_active === false;
    if (filterStatus === 'AVAILABLE') matchesStatus = admin.is_active === true && admin.is_available === true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-screen flex flex-col p-6 md:p-10 bg-[#f8fafc]">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <Users size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Admin Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Staff <span className="italic text-slate-400 font-light">Management</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Oversee administrators, manage availability, and control access.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            to="/admin/assign-roles"
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md group"
          >
            <LayoutGrid size={18} className="text-indigo-500 group-hover:text-indigo-600" />
            <span>Assign Roles</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 transform hover:-translate-y-0.5"
          >
            <UserPlus size={20} />
            <span>Register Staff</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
            Staff Directory
          </h3>
          
          <div className="relative w-full sm:w-80 ml-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search staff..."
              className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                {['ALL', 'ACTIVE', 'AVAILABLE', 'BLOCKED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${
                            filterStatus === status 
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {status === 'ALL' && 'All'}
                        {status === 'ACTIVE' && 'Active'}
                        {status === 'AVAILABLE' && 'Available'}
                        {status === 'BLOCKED' && 'Blocked'}
                    </button>
                ))}
            </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 z-10 shadow-sm">
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
                <tr><td colSpan="5" className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /><span className="text-slate-400 font-medium">Loading staff list...</span></div></td></tr>
              ) : filteredAdmins.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium">No staff members found matching your search.</td></tr>
              ) : (
                filteredAdmins.map(admin => {
                  const showAvailable = admin.is_available && admin.is_active;
                  const isToggleDisabled = processingId === admin.id || !admin.is_active;

                  return (
                    <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-slate-50' : 'bg-rose-50/30 hover:bg-rose-50/50'}`}>
                      
                      {/* User Column */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-base">{admin.email}</span>
                            <span className="text-xs text-slate-400 font-medium">ID: #{admin.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Roles Column */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {(admin.roles && admin.roles.length > 0) ? (
                            admin.roles.map((r, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">{r}</span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No roles assigned</span>
                          )}
                        </div>
                      </td>

                      {/* Availability - INTERACTIVE TOGGLE */}
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => toggleAvailability(admin.id, admin.is_available)}
                          disabled={isToggleDisabled}
                          title={!admin.is_active ? "Blocked" : "Toggle Availability"}
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

                      {/* Actions - BLOCK/UNBLOCK BUTTON */}
                      <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => initiateStatusToggle(admin)}
                            disabled={processingId === admin.id}
                            title={admin.is_active ? "Block User" : "Unblock User"}
                            className={`p-2.5 rounded-xl transition-all shadow-sm border inline-flex items-center justify-center ${
                              admin.is_active 
                              ? 'bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200' 
                              : 'bg-white text-rose-500 border-rose-100 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                            } ${processingId === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {admin.is_active ? <Lock size={18} /> : <Unlock size={18} />}
                          </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-xs font-bold text-slate-400 flex justify-between items-center">
            <span>{filteredAdmins.length} staff members</span>
            {searchTerm && <span className="text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Filtered View</span>}
        </div>
      </div>

      {/* --- REGISTER STAFF MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Register Staff</h2>
                <p className="text-slate-500 text-sm mt-1">Create a new administrator account.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-8 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={staffForm.email}
                      onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                      placeholder="staff@voting.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      value={staffForm.password}
                      onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {staffLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({ show: false, action: null, id: null, email: '' })} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmModal.action === 'BLOCK' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize font-serif">{confirmModal.action === 'BLOCK' ? 'Block Access?' : 'Unblock Access?'}</h3>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Are you sure you want to {confirmModal.action?.toLowerCase()} <strong>{confirmModal.email}</strong>?
                {confirmModal.action === 'BLOCK' && " They will no longer be able to log in."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, action: null, id: null, email: '' })} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
              <button onClick={executeStatusToggle} disabled={submitting} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${confirmModal.action === 'BLOCK' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}>
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Staff;