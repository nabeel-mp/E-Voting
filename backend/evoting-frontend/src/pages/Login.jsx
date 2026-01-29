import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  Loader2, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Fingerprint,
  Activity,
  Server,
  Eye,
  EyeOff,
  Zap,
  LayoutDashboard
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Animation states for the visualization panel
  const [scanPosition, setScanPosition] = useState(0);
  const [processedVotes, setProcessedVotes] = useState(12450);

  useEffect(() => {
    // Scanner bar animation
    const scanInterval = setInterval(() => {
      setScanPosition((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 50);

    // Simulated live counter
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
        addToast("Welcome back, Administrator", "success");
        login(res.data.data.token);
        navigate('/admin');
      }
    } catch (err) {
      if (!err.response) {
         const msg = 'Unable to reach server. Please check your connection.';
         setError(msg);
         addToast(msg, "error");
      } else {
         setError(err.response?.data?.error || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* LEFT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent -z-10" />

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex items-center justify-center p-3.5 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 backdrop-blur-sm">
              <LayoutDashboard className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-slate-400 text-lg font-light">
              Secure authentication for election control.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner hover:border-slate-700"
                  placeholder="admin@voting.system"
                />
              </div>
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner hover:border-slate-700"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <p className="font-medium leading-tight pt-0.5">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/25 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Verifying Credentials...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 fill-current" /> Access Dashboard
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-8">
            <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">
              SECURE E-VOTING SYSTEM v2.0 • PROTECTED
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - VISUALIZATION (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden border-l border-slate-800">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        
        {/* Floating Card */}
        <div className="relative z-10">
          <div className="bg-slate-900/60 backdrop-blur-2xl p-1 rounded-3xl border border-slate-700/50 shadow-2xl">
              <div className="bg-slate-950/80 p-8 rounded-[1.4rem] w-[420px] relative overflow-hidden">
                
                {/* Scanning Laser Effect */}
                <div 
                  className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-20 blur-[2px] shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all duration-75"
                  style={{ top: `${scanPosition}%` }}
                />

                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                      <Fingerprint className="text-emerald-400 w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight">System Status</h3>
                      <p className="text-emerald-400/80 text-xs font-bold flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        ONLINE & SECURE
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center my-12 relative">
                   {/* Spinning Rings */}
                   <div className="w-48 h-48 border-[1px] border-slate-700/50 rounded-full absolute" />
                   <div className="w-64 h-64 border-[1px] border-dashed border-slate-800 rounded-full absolute animate-[spin_20s_linear_infinite]" />
                   <div className="w-56 h-56 border border-indigo-500/20 rounded-full absolute animate-[spin_10s_linear_infinite_reverse]" />
                   
                   {/* Center Hub */}
                   <div className="w-28 h-28 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.15)] relative z-10 border border-slate-700">
                      <ShieldCheck className="w-12 h-12 text-indigo-400" />
                   </div>
                   
                   {/* Orbiting Dot */}
                   <div className="absolute w-56 h-56 animate-[spin_4s_linear_infinite]">
                     <div className="w-3 h-3 bg-indigo-400 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(129,140,248,1)]"></div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Server size={12} /> Active Nodes
                    </p>
                    <p className="text-white font-mono text-xl font-bold group-hover:text-indigo-400 transition-colors">24/24</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Activity size={12} /> Total Votes
                    </p>
                    <p className="text-white font-mono text-xl font-bold group-hover:text-emerald-400 transition-colors">
                      {processedVotes.toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;