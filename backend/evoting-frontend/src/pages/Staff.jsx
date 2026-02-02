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
  LayoutGrid
} from 'lucide-react';

const Staff = () => {
  const [staffForm, setStaffForm] = useState({ email: '', password: '' });
  const [staffLoading, setStaffLoading] = useState(false);
  const { addToast } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filteredAdmins = admins.filter(admin =>
    !admin.is_super &&
    (admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase())))
  );

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
            Oversee administrators and manage system access.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            to="/assign-roles"
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
        </div>

        {/* Scrollable Table - REDUCED & CLEANER */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-8 py-5">User</th>
                <th className="px-6 py-5">Roles</th>
                <th className="px-6 py-5 text-center">Availability</th>
                <th className="px-6 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingAdmins ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /><span className="text-slate-400 font-medium">Loading staff list...</span></div></td></tr>
              ) : filteredAdmins.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium">No staff members found matching your search.</td></tr>
              ) : (
                filteredAdmins.map(admin => {
                  // Determine if availability is active
                  const showAvailable = admin.is_available && admin.is_active;

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
                            <span className="text-xs text-slate-400 font-medium">Joined {new Date(admin.created).toLocaleDateString()}</span>
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

                      {/* Availability - Static Display (No onClick) */}
                      <td className="px-6 py-5 text-center">
                        <div
                          title={showAvailable ? "Available" : "Unavailable"}
                          className={`relative inline-flex h-5 w-9 items-center cursor-not-allowed rounded-full transition-colors border ${
                            showAvailable ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-200 border-slate-300'
                          } cursor-default`}
                        >
                          <span className={`${
                              showAvailable ? 'translate-x-4' : 'translate-x-0.5'
                            } inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform`} 
                          />
                        </div>
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

    </div>
  );
};

export default Staff;