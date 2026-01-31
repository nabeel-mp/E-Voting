import React, { useState, useEffect } from 'react';
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
  Phone,
  Map,
  Building2,
  Hash,
  ChevronDown
} from 'lucide-react';

// --- MOCK DATA FOR DROPDOWNS (Replace with API fetch if needed) ---
const KERALA_DATA = {
  districts: ["Thiruvananthapuram", "Ernakulam", "Kozhikode", "Malappuram", "Kannur"],
  bodyTypes: ["Grama Panchayat", "Municipality", "Corporation"],
  // In a real app, these would be fetched based on district selection
  localBodies: {
    "Thiruvananthapuram": ["Thiruvananthapuram Corp", "Neyyattinkara Mun", "Parassala GP"],
    "Ernakulam": ["Kochi Corp", "Aluva Mun", "Kumbalangi GP"],
    "Kozhikode": ["Kozhikode Corp", "Vadakara Mun", "Olavanna GP"],
    "Malappuram": ["Malappuram Mun", "Manjeri Mun", "Perinthalmanna Mun"],
    "Kannur": ["Kannur Corp", "Thalassery Mun", "Dharmadam GP"]
  }
};

const VoterLogin = () => {
  const [step, setStep] = useState(1); // 1: Creds, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverMsg, setServerMsg] = useState('');
  const navigate = useNavigate();

  // Unified Form State
  const [formData, setFormData] = useState({
    district: '',
    localBodyType: '',
    localBodyName: '',
    wardNo: '',
    voter_id: '',
    aadhaar: ''
  });

  // Dynamic Ward Generator (1-50)
  const wards = Array.from({length: 50}, (_, i) => i + 1);

  // Helper to update form
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic Frontend Validation
    if (!formData.district || !formData.localBodyName || !formData.wardNo) {
        setError("Please select all location details.");
        setLoading(false);
        return;
    }

    try {
      // Sending ALL details to backend to match against database
      const res = await api.post('/api/auth/voter/login', {
        voter_id: formData.voter_id,
        aadhaar: formData.aadhaar,
        district: formData.district,
        local_body_type: formData.localBodyType,
        local_body_name: formData.localBodyName,
        ward_no: formData.wardNo
      });

      if (res.data.success) {
        setServerMsg(res.data.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Details do not match our records.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const [otp, setOtp] = useState(''); // Local state for OTP input only
    
    // ... (logic remains same, accessing otp from input)
    // Note: In this snippet I'll handle OTP state inside the render for simplicity or lift it up. 
    // Let's use a ref or separate state for OTP to fix the snippet flow.
  };
  
  // separate OTP state
  const [otpCode, setOtpCode] = useState('');

  const submitOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await api.post('/api/auth/voter/verify-otp', { voter_id: formData.voter_id, otp: otpCode });
        if (res.data.success) {
            localStorage.setItem('voter_token', res.data.data.token);
            navigate('/portal');
        }
    } catch (err) {
        setError(err.response?.data?.error || "Invalid OTP");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col">
      
      {/* --- HEADER --- */}
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

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
          
          {/* LEFT SIDE: Visuals */}
          <div className="lg:w-5/12 bg-slate-900 relative p-12 text-white flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-30">
                 {/* Illustration of map or voting concept */}
                 
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-6">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Identity Verification</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                    Locate. <br/>Verify. <br/><span className="text-emerald-400 italic font-serif">Vote.</span>
                </h2>
                <p className="text-slate-300 font-light leading-relaxed">
                    To ensure the integrity of the election, we cross-reference your identity with your registered local body and ward details.
                </p>
            </div>

            <div className="relative z-10 mt-12">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700">
                    <HelpCircle size={20} className="text-emerald-400" />
                    <p>Not sure about your Ward?<br/><span className="text-white underline cursor-pointer">Check Draft Electoral Roll</span></p>
                </div>
            </div>
          </div>

          {/* RIGHT SIDE: Form */}
          <div className="lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative overflow-y-auto max-h-[90vh] lg:max-h-none">
            <div className="max-w-lg mx-auto w-full">
                
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        Voter Authentication
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </h3>
                    <p className="text-sm text-slate-500">Enter your constituency details and ID proof.</p>
                </div>

                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-600 text-sm font-bold"
                        >
                            <div className="mt-0.5"><ShieldCheck size={16} /></div>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step 1: Full Form */}
                {step === 1 && (
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleInit} 
                        className="space-y-6"
                    >
                        {/* SECTION 1: LOCATION DETAILS */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                <Map size={12}/> Location Details
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* District */}
                                <div className="relative group">
                                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select 
                                        required
                                        className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
                                        value={formData.district}
                                        onChange={(e) => handleChange('district', e.target.value)}
                                    >
                                        <option value="">Select District</option>
                                        {KERALA_DATA.districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>

                                {/* Body Type */}
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select 
                                        required
                                        className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
                                        value={formData.localBodyType}
                                        onChange={(e) => handleChange('localBodyType', e.target.value)}
                                    >
                                        <option value="">Body Type</option>
                                        {KERALA_DATA.bodyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>

                                {/* Local Body Name */}
                                <div className="relative group md:col-span-2">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select 
                                        required
                                        disabled={!formData.district}
                                        className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                                        value={formData.localBodyName}
                                        onChange={(e) => handleChange('localBodyName', e.target.value)}
                                    >
                                        <option value="">Select Panchayat / Municipality / Corporation</option>
                                        {formData.district && KERALA_DATA.localBodies[formData.district] 
                                            ? KERALA_DATA.localBodies[formData.district].map(lb => <option key={lb} value={lb}>{lb}</option>)
                                            : <option disabled>Select District First</option>
                                        }
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>

                                {/* Ward Number */}
                                <div className="relative group md:col-span-2">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select 
                                        required
                                        className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
                                        value={formData.wardNo}
                                        onChange={(e) => handleChange('wardNo', e.target.value)}
                                    >
                                        <option value="">Select Ward Number</option>
                                        {wards.map(w => <option key={w} value={w}>Ward {w}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: IDENTITY DETAILS */}
                        <div className="space-y-4">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2 px-1">
                                <Fingerprint size={12}/> Identity Proof
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="relative group">
                                    <Vote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                    <input 
                                        required 
                                        value={formData.voter_id}
                                        onChange={e => handleChange('voter_id', e.target.value.toUpperCase())}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                        placeholder="EPIC No (e.g. KL/01/001/123456)"
                                    />
                                </div>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                    <input 
                                        required 
                                        value={formData.aadhaar}
                                        onChange={e => handleChange('aadhaar', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                                        placeholder="Aadhaar Number"
                                    />
                                </div>
                            </div>
                        </div>

                        <button disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Verify & Send OTP <ArrowRight size={18}/></>}
                        </button>
                    </motion.form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={submitOtp} 
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
                            <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1">Enter 6-Digit Code</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                                <input 
                                    required 
                                    type="text"
                                    maxLength="6"
                                    value={otpCode}
                                    onChange={e => setOtpCode(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-black tracking-[0.5em] text-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                                    placeholder="• • • • • •"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-2">
                            <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold transition-colors">
                                Edit Details
                            </button>
                            <button disabled={loading} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={20}/> : "Login to Portal"}
                            </button>
                        </div>
                    </motion.form>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        State Election Commission, Kerala
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