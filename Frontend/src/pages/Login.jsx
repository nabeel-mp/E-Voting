import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  Mail, 
  Lock, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ChevronLeft,
  LayoutDashboard,
  Server,
  ShieldCheck,
  Globe,
  KeyRound,
  ArrowLeft
} from 'lucide-react';

const Login = () => {
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI States
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Validate Credentials & Request OTP
      const res = await api.post('/api/auth/admin-login', { email, password });
      
      if (res.data.success) {
        addToast(res.data.message || "OTP sent to your email", "success");
        setStep('otp'); // Move to OTP step
      } else {
        setError(res.data.message || 'Login failed.');
      }
    } catch (err) {
      console.error("Credential Error:", err);
      if (err.response) {
         setError(err.response.data.error || err.response.data.message || 'Invalid credentials.');
      } else {
         setError('Unable to reach server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 2: Verify OTP
      const res = await api.post('/api/auth/admin/verify-otp', { email, otp });

      if (res.data.success) {
        addToast("Welcome back, Administrator", "success");
        localStorage.setItem('admin_token', res.data.data.token);
        login(res.data.data.token);
        navigate('/admin');
      } else {
        setError(res.data.message || 'Invalid OTP.');
      }
    } catch (err) {
      console.error("OTP Error:", err);
      if (err.response) {
        setError(err.response.data.error || err.response.data.message || 'Verification failed.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
              <ChevronLeft size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none tracking-tighter">
                SEC<span className="text-indigo-600">KERALA</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Return to Home</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <ShieldAlert size={12} className="text-indigo-500" />
            ADMINISTRATION PORTAL
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-100/40 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          
          {/* LEFT SIDE: Visuals */}
          <div className="lg:w-5/12 bg-slate-900 relative p-12 text-white flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-6">
                    <Server size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">System Control</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                    Monitor. <br/>Manage. <br/><span className="text-indigo-400 italic font-serif">Secure.</span>
                </h2>
                <p className="text-slate-300 font-light leading-relaxed">
                    Restricted access for election officials. Two-factor authentication is now required for all administrative actions.
                </p>
            </div>

            <div className="relative z-10 mt-12">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
                      <LayoutDashboard className="text-indigo-400 mb-2" size={24} />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Dashboard</p>
                   </div>
                   <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
                      <ShieldCheck className="text-emerald-400 mb-2" size={24} />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secure Audit</p>
                   </div>
                </div>
            </div>
          </div>

          {/* RIGHT SIDE: Form */}
          <div className="lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative">
            <div className="max-w-md mx-auto w-full">
                
                <div className="mb-10">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        {step === 'credentials' ? 'Admin Authentication' : 'Verify Identity'}
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    </h3>
                    <p className="text-sm text-slate-500">
                        {step === 'credentials' 
                            ? 'Please enter your official credentials to continue.' 
                            : `Enter the OTP sent to ${email}`}
                    </p>
                </div>

                {/* Error Display - Animated */}
                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-600 text-sm font-bold"
                        >
                            <div className="mt-0.5"><ShieldAlert size={16} /></div>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* STEP 1: EMAIL & PASSWORD */}
                {step === 'credentials' && (
                    <motion.form 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleCredentialsSubmit} 
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">Official Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                    placeholder="admin@sec.kerala.gov.in"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20}/> : "Verify & Send OTP"}
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* STEP 2: OTP INPUT */}
                {step === 'otp' && (
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleOtpSubmit} 
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">One-Time Password</label>
                            <div className="relative group">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal tracking-[0.25em]"
                                    placeholder="000000"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-slate-400 pl-1">Enter the 6-digit code sent to your email.</p>
                        </div>

                        <div className="pt-2 flex flex-col gap-3">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20}/> : "Confirm OTP"}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                                className="w-full py-3 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* Footer Link */}
                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        State Election Commission, Kerala
                    </p>
                    
                    <Link to="/voter/login" className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all">
                        <Globe size={10} className="group-hover:text-emerald-500 transition-colors"/>
                        <span>Go to Voter Portal</span>
                    </Link>
                </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;