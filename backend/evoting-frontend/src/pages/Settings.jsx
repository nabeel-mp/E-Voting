import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  Mail, 
  User, 
  Save, 
  Loader2, 
  Lock, 
  ShieldCheck, 
  Bell, 
  Smartphone,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  // State: Profile Information
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || '',
    bio: 'System Administrator'
  });
  
  // State: Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // State: Security (Password)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // State: Loading/UI
  const [loading, setLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    loginAlerts: true,
    weeklyDigest: false
  });

  // --- Handlers ---

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. If there is a file, upload it first (Mock logic here)
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        // await api.post('/api/admin/upload-avatar', formData);
      }

      // 2. Update text details
      await api.put('/api/admin/update-profile', { 
        email: profile.email,
        name: profile.name 
      });
      
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }
    setSecurityLoading(true);
    try {
      await api.put('/api/admin/change-password', { 
        current_password: passwords.current,
        new_password: passwords.new 
      });
      alert("Password changed!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to change password");
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-1">Manage your profile, security preferences, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: Public Profile --- */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20" />
            
            <div className="relative flex flex-col items-center">
              {/* Avatar Upload */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-400">
                        <User size={40} />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white mb-1" size={24} />
                      <span className="text-[10px] text-white font-medium">CHANGE</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-slate-900">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              </div>

              <h2 className="mt-4 text-xl font-bold text-white">{profile.name}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mt-1">
                <ShieldCheck size={12} />
                {user?.role || "Administrator"}
              </span>
            </div>

            {/* Basic Info Form */}
            <form onSubmit={handleProfileUpdate} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Security & Preferences --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Security Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                   <Lock size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">Security</h3>
                   <p className="text-xs text-slate-500">Update password and security settings</p>
                </div>
             </div>

             <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-300">Current Password</label>
                      <input 
                         type="password"
                         required
                         value={passwords.current}
                         onChange={e => setPasswords({...passwords, current: e.target.value})}
                         className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">New Password</label>
                      <input 
                         type="password"
                         required
                         value={passwords.new}
                         onChange={e => setPasswords({...passwords, new: e.target.value})}
                         className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                      <input 
                         type="password"
                         required
                         value={passwords.confirm}
                         onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                         className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                   </div>
                </div>
                <div className="flex justify-end pt-2">
                   <button 
                      type="submit" 
                      disabled={securityLoading}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium border border-slate-700 transition-colors flex items-center gap-2"
                   >
                      {securityLoading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                   </button>
                </div>
             </form>
          </div>

          {/* Preferences Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                   <Bell size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">Notifications</h3>
                   <p className="text-xs text-slate-500">Manage how you receive alerts</p>
                </div>
             </div>

             <div className="space-y-4">
                {[
                   { id: 'emailAlerts', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts.', icon: <Mail size={16} /> },
                   { id: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified when your account is accessed from a new device.', icon: <ShieldCheck size={16} /> },
                   { id: 'weeklyDigest', label: 'Weekly Digest', desc: 'A weekly report of system activity and stats.', icon: <UploadCloud size={16} /> }
                ].map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="text-slate-400">{item.icon}</div>
                         <div>
                            <p className="text-sm font-medium text-white">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => setNotificationSettings(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings[item.id] ? 'bg-indigo-600' : 'bg-slate-700'}`}
                      >
                         <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                   </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;