import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Import
import api from '../utils/api';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Loader2, 
  Save, 
  ShieldCheck
} from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth();
  const { addToast } = useToast(); // Use Hook
  const [loading, setLoading] = useState({ profile: false, password: false, avatar: false });

  // Determine role for UI logic
  const isSuperAdmin = user?.is_super === true || user?.role === "SUPER_ADMIN";

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    
    try {
      const payload = {
        name: profileForm.name,
        email: isSuperAdmin ? user.email : profileForm.email
      };

      const res = await api.put('/api/admin/update-profile', payload);
      
      if (res.data.success) {
        if (res.data.data.token) {
            login(res.data.data.token);
        }
        addToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return addToast('New passwords do not match', 'warning');
    }
    setLoading(prev => ({ ...prev, password: true }));
    
    try {
      const res = await api.put('/api/admin/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      if (res.data.success) {
        addToast('Password changed successfully', 'success');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Password change failed', 'error');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        return addToast('Image too large (Max 2MB)', 'warning');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(prev => ({ ...prev, avatar: true }));
    
    try {
      const res = await api.post('/api/admin/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        if (res.data.data.token) {
            login(res.data.data.token);
        }
        addToast('Avatar updated successfully', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to upload image', 'error');
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-1">Manage your administrator profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
            <div className="relative inline-block group">
              <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden mx-auto flex items-center justify-center shadow-2xl">
                {user?.avatar ? (
                  <img 
                    src={`http://localhost:8080${user.avatar}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = ''; }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-slate-500">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-500 transition-all shadow-lg border-2 border-slate-900">
                {loading.avatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading.avatar} />
              </label>
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">{user?.name}</h2>
            <div className="mt-2 inline-flex px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              {isSuperAdmin ? 'Super Admin' : 'Staff Member'}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
               <ShieldCheck className="text-indigo-400" size={20} />
               <h3 className="font-bold text-white">General Information</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    {isSuperAdmin ? (
                        <input 
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-500 cursor-not-allowed"
                            title="Super Admin email cannot be changed"
                        />
                    ) : (
                        <input 
                            type="email"
                            required
                            value={profileForm.email}
                            onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                    type="submit"
                    disabled={loading.profile} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading.profile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Profile
                </button>
              </div>
            </form>
          </section>

          {/* Security Form */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
               <Lock className="text-rose-400" size={20} />
               <h3 className="font-bold text-white">Security & Password</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Current Password</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.current_password}
                  onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">New Password</label>
                  <input 
                    type="password"
                    required
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                    type="submit" 
                    disabled={loading.password} 
                    className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading.password ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                </button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Settings;