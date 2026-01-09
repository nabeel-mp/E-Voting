import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Loader2, 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2,
  Fingerprint,
  Activity,
  Globe,
  Server
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Animation for the "Scanning" effect
  const [scanPosition, setScanPosition] = useState(0);
  
  // Simulated "Live Stats" counter
  const [processedVotes, setProcessedVotes] = useState(12450);

  useEffect(() => {
    // Scanner animation loop
    const scanInterval = setInterval(() => {
      setScanPosition((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 50);

    // Counter increment loop
    const voteInterval = setInterval(() => {
      setProcessedVotes(prev => prev + Math.floor(Math.random() * 5));
    }, 2000);

    return () => {
      clearInterval(scanInterval);
      clearInterval(voteInterval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/api/auth/admin/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white overflow-hidden font-sans">
      
      {/* LEFT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile-only subtle background glow */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-gray-900 pointer-events-none" />

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600/10 rounded-xl mb-4 border border-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-400 text-lg">
              Secure access for election management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="admin@voting.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-500 text-xs uppercase tracking-widest">
              Secure E-Voting System v1.0
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - NEW ANIMATED VOTING SYSTEM VISUALIZATION */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-black relative items-center justify-center overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
        
        {/* Central Secure Hub Card */}
        <div className="relative z-10 p-1 bg-gradient-to-b from-indigo-500/30 to-purple-500/30 rounded-2xl shadow-2xl">
          <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-white/5 w-[400px] relative overflow-hidden">
            
            {/* Scanning Line Animation */}
            <div 
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent z-20 blur-sm transition-all duration-75"
              style={{ top: `${scanPosition}%` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                  <Fingerprint className="text-indigo-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">System Integrity</h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Monitoring Active
                  </p>
                </div>
              </div>
              <div className="text-right">
                 <div className="text-xs text-slate-500 mb-1">Status</div>
                 <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">SECURE</div>
              </div>
            </div>

            {/* Central Visualization */}
            <div className="flex justify-center items-center my-10 relative">
               {/* Outer Ring */}
               <div className="w-40 h-40 border-2 border-dashed border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite] absolute" />
               {/* Inner Ring */}
               <div className="w-32 h-32 border border-indigo-400/20 rounded-full absolute" />
               
               {/* Center Logo */}
               <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 relative z-10">
                  <ShieldCheck className="w-10 h-10 text-white" />
               </div>

               {/* Orbiting Dot */}
               <div className="absolute w-40 h-40 animate-[spin_3s_linear_infinite]">
                 <div className="w-3 h-3 bg-white rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                  <Server size={12} /> Nodes
                </p>
                <p className="text-white font-mono text-lg font-semibold">24/24</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                  <Activity size={12} /> Votes
                </p>
                <p className="text-white font-mono text-lg font-semibold">
                  {processedVotes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cards (Background Elements) */}
        <div className="absolute top-1/4 right-20 p-4 bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl animate-bounce duration-[4000ms]">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <CheckCircle2 className="text-emerald-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Encryption</p>
                <p className="text-sm text-white font-medium">256-bit Valid</p>
              </div>
            </div>
        </div>
        
        <div className="absolute bottom-1/4 left-20 p-4 bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl animate-bounce delay-1000 duration-[5000ms]">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <Globe className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Connection</p>
                <p className="text-sm text-white font-medium">Global Relay</p>
              </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;