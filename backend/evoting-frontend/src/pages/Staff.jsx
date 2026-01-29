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
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Staff Management
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Oversee administrators and manage system access.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            to="/assign-roles"
            className="flex items-center gap-2 px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-500 shadow-lg backdrop-blur-sm"
          >
            <LayoutGrid size={18} className="text-cyan-400" />
            <span>Assign Roles</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 transform hover:-translate-y-0.5"
          >
            <UserPlus size={20} />
            <span>Register Staff</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[650px]">

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
            Staff Directory
          </h3>
          <div className="relative w-full sm:w-72 ml-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search staff..."
              className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Scrollable Table - REDUCED & CLEANER */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-4 py-4">Roles</th>
                <th className="px-4 py-4 text-center">Availability</th>
                <th className="px-4 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loadingAdmins ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center"><Loader2 className="animate-spin inline text-indigo-500 w-8 h-8" /></td></tr>
              ) : filteredAdmins.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-500">No staff members found.</td></tr>
              ) : (
                filteredAdmins.map(admin => {
                  // Determine if availability is active
                  const showAvailable = admin.is_available && admin.is_active;

                  return (
                    <tr key={admin.id} className={`group transition-colors ${admin.is_active ? 'hover:bg-indigo-500/[0.02]' : 'bg-rose-950/10 hover:bg-rose-900/10'}`}>
                      
                      {/* User Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-200">{admin.email}</span>
                            <span className="text-[11px] text-slate-500">{new Date(admin.created).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>

                      {/* Roles Column */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(admin.roles && admin.roles.length > 0) ? (
                            admin.roles.map((r, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{r}</span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-600 italic">No roles</span>
                          )}
                        </div>
                      </td>

                      {/* Availability - Static Display (No onClick) */}
                      <td className="px-4 py-4 text-center">
                        <div
                          title={showAvailable ? "Available" : "Unavailable"}
                          className={`relative inline-flex h-5 w-9 items-center cursor-not-allowed rounded-full transition-colors ${
                            showAvailable ? 'bg-indigo-500' : 'bg-slate-700'
                          } cursor-default`}
                        >
                          <span className={`${
                              showAvailable ? 'translate-x-5' : 'translate-x-1'
                            } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} 
                          />
                        </div>
                      </td>

                      {/* Status - Minimal Badge */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          admin.is_active 
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/5 text-rose-400 border-rose-500/20'
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
        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30 shrink-0 backdrop-blur-md">
          <span>{filteredAdmins.length} staff members</span>
          {searchTerm && (
            <span className="text-indigo-400">Filtered</span>
          )}
        </div>
      </div>

      {/* --- REGISTER STAFF MODAL (Unchanged) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Register Staff</h2>
                <p className="text-slate-500 text-sm mt-1">Create a new administrator account.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-8 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={staffForm.email}
                      onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                      placeholder="staff@voting.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      value={staffForm.password}
                      onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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