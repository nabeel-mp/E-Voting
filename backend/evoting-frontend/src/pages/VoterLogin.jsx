import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
  Vote, 
  ArrowRight, 
  Loader2, 
  CreditCard, 
  Lock, 
  Fingerprint, 
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  HelpCircle,
  Phone
} from 'lucide-react';

const VoterLogin = () => {
  const [step, setStep] = useState(1); // 1: Creds, 2: OTP
  const [formData, setFormData] = useState({ voter_id: '', aadhaar: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverMsg, setServerMsg] = useState('');
  const navigate = useNavigate();

  const handleInit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Simulation for demo
      const res = await api.post('/api/auth/voter/login', formData);
      if (res.data.success) {
        setServerMsg(res.data.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/voter/verify-otp', { voter_id: formData.voter_id, otp });
      if (res.data.success) {
        localStorage.setItem('voter_token', res.data.data.token);
        navigate('/portal');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col">
      
      {/* --- SIMPLIFIED HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white group-hover:bg-emerald-600 transition-colors">
              <ChevronLeft size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none tracking-tighter">
                SEC<span className="text-emerald-600">KERALA</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Return to Home</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Lock size={12} className="text-emerald-500" />
            SECURE LOGIN SESSION
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Split Layout) --- */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          
          {/* LEFT SIDE: Visuals */}
          <div className="lg:w-1/2 bg-slate-900 relative p-12 text-white flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-40">
                {/* <img 
                    src="https://images.unsplash.com/photo-1540910419868-474947cebacb?q=80&w=2074&auto=format&fit=crop" 
                    alt="Voting Background" 
                    className="w-full h-full object-cover"
                /> */}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-6">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Identity Verification</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                    Your Vote is <br/><span className="text-emerald-400 italic font-serif">Your Voice.</span>
                </h2>
                <p className="text-slate-300 font-light leading-relaxed max-w-sm">
                    Access the secure voter portal to verify your details, apply for corrections, or download your digital EPIC card.
                </p>
            </div>

            <div className="relative z-10 mt-12">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700">
                    <HelpCircle size={20} className="text-emerald-400" />
                    <p>Having trouble logging in? <br/><span className="text-white underline cursor-pointer">Contact the BLO Helpdesk</span></p>
                </div>
            </div>
          </div>

          {/* RIGHT SIDE: Form */}
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
            <div className="max-w-md mx-auto w-full">
                
                <div className="mb-10">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                        <Fingerprint size={32} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h3>
                    <p className="text-slate-500">Please enter your details to authenticate.</p>
                </div>

                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold"
                        >
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step 1: Credentials */}
                {step === 1 && (
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleInit} 
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">Voter ID </label>
                            <div className="relative group">
                                <Vote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                <input 
                                    required 
                                    value={formData.voter_id}
                                    onChange={e => setFormData({...formData, voter_id: e.target.value.toUpperCase()})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                    placeholder="VOTE-XXXXXX"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">Aadhaar Number</label>
                            <div className="relative group">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                <input 
                                    required 
                                    value={formData.aadhaar}
                                    onChange={e => setFormData({...formData, aadhaar: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                    placeholder="XXXX XXXX XXXX"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                <input 
                                    required 
                                    value={formData.aadhaar}
                                    onChange={e => setFormData({...formData, aadhaar: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Proceed to Verify <ArrowRight size={18}/></>}
                        </button>
                    </motion.form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerify} 
                        className="space-y-6"
                    >
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                            <div className="bg-emerald-100 p-1 rounded-full text-emerald-600 mt-0.5">
                                <CheckCircle2 size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-900 mb-1">OTP Sent Successfully</p>
                                <p className="text-xs text-emerald-700/80 leading-relaxed">{serverMsg}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">Enter OTP Code</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                <input 
                                    required 
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-black tracking-[0.5em] text-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                                    placeholder="• • • • • •"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                            <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold transition-colors">
                                Back
                            </button>
                            <button disabled={loading} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={20}/> : "Access Portal"}
                            </button>
                        </div>
                    </motion.form>
                )}

                <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Protected by GovAuth 2.0 Secure Standard
                    </p>
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VoterLogin;