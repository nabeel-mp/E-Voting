import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  User, Mail, Lock, Camera, 
  Save, Loader2, ShieldCheck, AlertCircle 
} from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth();
  
  // Identify if current user is a Super Admin based on token claims
  const isSuperAdmin = user?.is_super === true || user?.role === "SUPER_ADMIN";

  // Form States
  const [profileForm, setProfileForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '' 
  });
  const [passwordForm, setPasswordForm] = useState({ 
    current_password: '', 
    new_password: '', 
    confirm_password: '' 
  });

  const [loading, setLoading] = useState({ profile: false, password: false, avatar: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Sync internal form state when the global user context updates
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
  }, [user]);

  // 1. Update Profile - restricted logic based on your request
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    setMessage({ type: '', text: '' });

    try {
      // Logic: Super Admin sends their existing email to the backend to prevent changes
      const payload = isSuperAdmin ? { ...profileForm, email: user.email } : profileForm;
      
      const res = await api.put('/api/admin/update-profile', payload);
      if (res.data.success) {
        // Update local session with the new token returned from Go
        login(res.data.data.token); 
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // 2. Change Password - Uses ChangePassword handler in admin_manage.go
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }

    setLoading(prev => ({ ...prev, password: true }));
    try {
      const res = await api.put('/api/admin/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Password update failed' });
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // 3. Upload Avatar - Uses UploadAvatar handler in admin_manage.go
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 2MB size limit validation to match backend requirements
    if (file.size > 2 * 1024 * 1024) {
      return alert("Image too large (Max 2MB)");
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(prev => ({ ...prev, avatar: true }));
    try {
      const res = await api.post('/api/admin/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        // Full page reload to ensure the new avatar is reflected in the Sidebar and Header
        window.location.reload(); 
      }
    } catch (err) {
      alert(err.response?.data?.error || "Avatar upload failed");
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-1">
          {isSuperAdmin ? "Manage your administrator identity and security." : "Manage your staff profile and credentials."}
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full bg-indigo-600 mx-auto flex items-center justify-center text-4xl font-bold border-4 border-slate-800 overflow-hidden shadow-2xl">
                {user?.avatar ? (
                  <img src={`http://localhost:8080${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2.5 bg-indigo-500 rounded-full cursor-pointer hover:bg-indigo-400 transition-all shadow-lg border-2 border-slate-900 group">
                {loading.avatar ? <Loader2 size={16} className="animate-spin text-white" /> : <Camera size={16} className="text-white" />}
                <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} disabled={loading.avatar} />
              </label>
            </div>
            <h2 className="mt-4 font-bold text-white text-xl">{user?.name}</h2>
            <div className="mt-1 inline-flex px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              {isSuperAdmin ? 'Super Administrator' : 'Staff Member'}
            </div>
          </div>
        </div>

        {/* Forms Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Identity Form */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <User size={18} className="text-indigo-400" /> Identity Details
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                {isSuperAdmin ? (
                  /* Restricted Email UI for Super Admin */
                  <div className="flex items-center gap-3 w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed italic">
                    <Mail size={16} />
                    <span>{user?.email}</span>
                    <span className="ml-auto text-[9px] font-bold bg-slate-800 px-1.5 py-0.5 rounded uppercase">Restricted</span>
                  </div>
                ) : (
                  /* Editable Email UI for Sub-Admins */
                  <input 
                    type="email" 
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" 
                  />
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading.profile}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading.profile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Update Profile
              </button>
            </form>
          </section>

          {/* Password Security Section */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Lock size={18} className="text-rose-400" /> Account Security
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="Verify existing password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-rose-500/30 transition-all" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading.password}
                className="w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading.password ? "Updating..." : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;