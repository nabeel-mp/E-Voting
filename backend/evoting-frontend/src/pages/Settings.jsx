import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; 
import api from '../utils/api';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Loader2, 
  Save, 
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  UserCheck
} from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth();
  const { addToast } = useToast(); 
  const [loading, setLoading] = useState({ profile: false, password: false, avatar: false });
  
  // Password Visibility States
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 p-6 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Manage your administrator profile and security preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden group">
            
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-slate-950 border-4 border-slate-800 p-1 shadow-2xl relative z-10 mx-auto">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900">
                    {user?.avatar ? (
                    <img 
                        src={`http://localhost:8080${user.avatar}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        onError={(e) => { e.target.src = ''; }}
                    />
                    ) : (
                    <span className="text-5xl font-bold text-slate-600 group-hover:text-slate-500 transition-colors">
                        {(user?.name || 'A').charAt(0).toUpperCase()}
                    </span>
                    )}
                </div>
              </div>
              
              <label className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full cursor-pointer shadow-lg border-4 border-slate-900 transition-all active:scale-95 z-20">
                {loading.avatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading.avatar} />
              </label>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h2>
            <p className="text-slate-400 text-sm mt-1 mb-4">{user?.email}</p>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isSuperAdmin ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
              <ShieldCheck size={12} />
              {isSuperAdmin ? 'Super Admin' : 'Staff Member'}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Form */}
          <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800/60 flex items-center gap-3 bg-slate-900/30">
               <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <UserCheck size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-white">Profile Information</h3>
                  <p className="text-xs text-slate-500 font-medium">Update your public profile details</p>
               </div>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    {isSuperAdmin ? (
                        <input 
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-500 cursor-not-allowed italic"
                            title="Super Admin email cannot be changed"
                        />
                    ) : (
                        <input 
                            type="email"
                            required
                            value={profileForm.email}
                            onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                        />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                    type="submit"
                    disabled={loading.profile} 
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading.profile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Security Form */}
          <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800/60 flex items-center gap-3 bg-slate-900/30">
               <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                  <KeyRound size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-white">Security</h3>
                  <p className="text-xs text-slate-500 font-medium">Manage your password and authentication</p>
               </div>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Current Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                  <input 
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showCurrentPass ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                    <input 
                      type={showNewPass ? "text" : "password"}
                      required
                      value={passwordForm.new_password}
                      onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                    <input 
                      type={showConfirmPass ? "text" : "password"}
                      required
                      value={passwordForm.confirm_password}
                      onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                    type="submit" 
                    disabled={loading.password} 
                    className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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