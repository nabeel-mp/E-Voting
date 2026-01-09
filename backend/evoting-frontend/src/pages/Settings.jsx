// nabeel-mp/e-voting/E-Voting-e827307a9ccaf9e84bf5d22239f0e8c4b0f5aa02/backend/evoting-frontend/src/pages/Settings.jsx
import { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/admin/update-profile', { email });
      alert("Profile updated!");
      setEmail('');
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-6">My Profile</h2>
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-1">Current Role</p>
          <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded text-sm font-medium border border-indigo-500/30">
            {user?.role || "Admin"}
          </span>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Update Email</label>
            <input 
              type="email" 
              placeholder="New Email Address"
              required 
              className="w-full bg-slate-900 border border-slate-600 rounded p-2.5 text-white mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;