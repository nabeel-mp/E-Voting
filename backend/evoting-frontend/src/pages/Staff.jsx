import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Briefcase, 
  CheckCircle2, 
  Loader2,
  ShieldAlert
} from 'lucide-react';

const Staff = () => {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  // Staff Form State
  const [staffForm, setStaffForm] = useState({ email: '', password: '', role_id: '' });
  const [staffLoading, setStaffLoading] = useState(false);

  // Fetch roles only for the dropdown selection
  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/auth/admin/roles');
      if (res.data.success) setRoles(res.data.data);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    try {
      await api.post('/api/auth/admin/create-sub-admin', {
        ...staffForm,
        role_id: parseInt(staffForm.role_id)
      });
      alert("Staff created successfully!"); 
      setStaffForm({ email: '', password: '', role_id: '' });
    } catch (err) { 
      alert(err.response?.data?.error || "Failed to create staff"); 
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Staff Management</h1>
        <p className="text-slate-400 mt-2">Register new administrators and assign their access levels.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6 relative z-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Register New Staff</h2>
            <p className="text-sm text-slate-500">Enter credentials below</p>
          </div>
        </div>

        <form onSubmit={handleCreateStaff} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Role Selection */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-300">Assign Role</label>
              <div className="relative group">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <select 
                  required 
                  value={staffForm.role_id} 
                  onChange={e => setStaffForm({...staffForm, role_id: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  <option value="" className="text-slate-500">Select a role...</option>
                  {roles.map(r => <option key={r.ID} value={r.ID}>{r.Name}</option>)}
                </select>
              </div>
              {roles.length === 0 && !loadingRoles && (
                 <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                   <ShieldAlert size={12} />
                   No roles found. Please create a role first in the Roles page.
                 </p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={staffLoading || roles.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {staffLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Staff;