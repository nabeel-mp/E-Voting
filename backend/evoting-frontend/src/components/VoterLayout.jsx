import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Vote } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const VoterLayout = () => {
  const token = localStorage.getItem('voter_token');
  const navigate = useNavigate();
  let user = null;

  if (token) {
    try { user = jwtDecode(token); } catch (e) { localStorage.removeItem('voter_token'); }
  }

  if (!user) return <Navigate to="/voter-login" replace />;

  const handleLogout = () => {
    localStorage.removeItem('voter_token');
    navigate('/voter-login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Vote className="text-emerald-400" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">E-Voting<span className="text-emerald-400">Portal</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{user.email}</p> {/* ID is stored in email field of JWT for voters */}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-500/20"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default VoterLayout;