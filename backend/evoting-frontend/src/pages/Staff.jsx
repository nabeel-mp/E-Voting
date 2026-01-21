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
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const Staff = () => {
  const [staffForm, setStaffForm] = useState({ email: '', password: '' });
  const [staffLoading, setStaffLoading] = useState(false);
  const { addToast } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Staff Management</h1>
          <p className="text-slate-400 mt-2">Register new administrators and view current staff.</p>
        </div>
        
        <Link 
          to="/assign-roles" 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium border border-slate-700 transition-all shadow-lg active:scale-95"
        >
          <Users size={18} />
          <span>Manage Role Assignments</span>
        </Link>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6 relative z-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Register New Staff</h2>
            <p className="text-sm text-slate-500">Enter credentials below. Roles are assigned separately.</p>
          </div>
        </div>

        <form onSubmit={handleCreateStaff} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  required 
                  value={staffForm.email} 
                  onChange={e => setStaffForm({...staffForm, email: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                  placeholder="staff@voting.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  required 
                  value={staffForm.password} 
                  onChange={e => setStaffForm({...staffForm, password: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={staffLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {staffLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-500" size={20} /> 
                Existing Staff Directory
             </h2>
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                   type="text" 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Search staff..." 
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
             </div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950/50 uppercase text-xs font-semibold text-slate-500 border-b border-slate-800">
                   <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Roles</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Created</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                   {loadingAdmins ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="animate-spin inline text-indigo-500" /></td></tr>
                   ) : filteredAdmins.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No staff members found.</td></tr>
                   ) : (
                      filteredAdmins.map(admin => (
                         <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ${admin.is_super ? 'bg-amber-600' : 'bg-slate-700'}`}>
                                     {admin.is_super ? <ShieldCheck size={16} /> : admin.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                     <div className="font-medium text-slate-200">{admin.email}</div>
                                     {admin.name && <div className="text-xs text-slate-500">{admin.name}</div>}
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-wrap gap-1.5">
                                  {admin.is_super ? (
                                     <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">SUPER ADMIN</span>
                                  ) : (admin.roles && admin.roles.length > 0) ? (
                                     admin.roles.map((r, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{r}</span>
                                     ))
                                  ) : (
                                     <span className="text-xs text-slate-600 italic flex items-center gap-1"><ShieldAlert size={12}/> No roles</span>
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${admin.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                  {admin.is_active ? 'Active' : 'Blocked'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-slate-500">
                               {new Date(admin.created).toLocaleDateString()}
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};

export default Staff;