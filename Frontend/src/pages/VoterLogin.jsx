import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
  Vote, ArrowRight, Loader2, CreditCard, Lock, Fingerprint, 
  CheckCircle2, ShieldCheck, ChevronLeft, HelpCircle, Map, 
  Building2, Hash, ChevronDown, Layers, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- FIREBASE IMPORTS ---
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const VoterLogin = () => {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && user.role === 'VOTER') {
      navigate('/portal', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverMsg, setServerMsg] = useState('');
  
  // Firebase State
  const [verificationId, setVerificationId] = useState(null);

  const [adminData, setAdminData] = useState({
    districts: [],
    blocks: {},
    municipalities: {},
    corporations: {},
    grama_panchayats: {}
  });

  const [formData, setFormData] = useState({
    district: '',
    block: '', 
    localBodyType: '',
    localBodyName: '',
    wardNo: '',
    voter_id: '',
    aadhaar: ''
  });

  const wards = Array.from({length: 50}, (_, i) => i + 1);

  // --- 1. DATA FETCHING ---
  const initData = async () => {
    setDataLoading(true);
    try {
      const response = await api.get('/api/common/kerala-data');
      if (response.data && response.data.success) {
        let payload = response.data.data;
        const normalizeData = (data) => {
          if (Array.isArray(data)) {
            if (data.length > 0 && data[0].hasOwnProperty('Key') && data[0].hasOwnProperty('Value')) {
              return data.reduce((acc, item) => {
                acc[item.Key] = normalizeData(item.Value);
                return acc;
              }, {});
            }
            return data;
          }
          if (data && typeof data === 'object') {
            Object.keys(data).forEach(key => {
              data[key] = normalizeData(data[key]);
            });
          }
          return data;
        };
        const cleanPayload = normalizeData(payload);
        if (cleanPayload && cleanPayload.districts) {
          setAdminData(cleanPayload);
        }
      }
    } catch (err) {
      console.error("Failed to load Kerala admin data", err);
      setError("Unable to load election data. Please check your connection.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { initData(); }, []);

  // --- FIREBASE RECAPTCHA SETUP ---
  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updates = { [field]: value };
      if (field === 'district') { updates.block = ''; updates.localBodyName = ''; }
      if (field === 'localBodyType') { updates.block = ''; updates.localBodyName = ''; }
      if (field === 'block') { updates.localBodyName = ''; }
      return { ...prev, ...updates };
    });
  };

  const getLocalBodyList = () => {
    if (!formData.district || !adminData) return [];
    if (formData.localBodyType === 'Municipality') return adminData.municipalities?.[formData.district] || [];
    if (formData.localBodyType === 'Municipal Corporation') return adminData.corporations?.[formData.district] || [];
    if (formData.localBodyType === 'Grama Panchayat') {
      if (!formData.block) return [];
      return adminData.grama_panchayats?.[formData.block] || [];
    }
    return [];
  };

  // --- STEP 1: VERIFY DETAILS & SEND FIREBASE OTP ---
  const handleInit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.district || !formData.localBodyName || !formData.wardNo) {
        setError("Please select all location details.");
        setLoading(false); return;
    }

    try {
      // 1. Check Credentials with Backend
      const payload = {
        voter_id: formData.voter_id,
        aadhaar: formData.aadhaar,
        district: formData.district,
        block: formData.block,
        local_body_type: formData.localBodyType,
        local_body_name: formData.localBodyName,
        ward_no: String(formData.wardNo)
      };

      const res = await api.post('/api/auth/voter/login', payload);

      if (res.data.success) {
        const mobileNumber = res.data.data.mobile; // Backend must return this!
        
        // 2. Trigger Firebase SMS
        generateRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        
        const confirmationResult = await signInWithPhoneNumber(auth, mobileNumber, appVerifier);
        
        // 3. Store confirmation result for Step 2
        window.confirmationResult = confirmationResult;
        setVerificationId(confirmationResult.verificationId);
        
        setServerMsg("OTP sent via Firebase to registered mobile.");
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Details do not match our records.");
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP & LOGIN ---
  const [otpCode, setOtpCode] = useState('');

  const submitOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // 1. Verify OTP with Firebase
        const confirmationResult = window.confirmationResult;
        const result = await confirmationResult.confirm(otpCode);
        const firebaseUser = result.user;
        const idToken = await firebaseUser.getIdToken();

        // 2. Send Firebase Token to Backend for final verification
        const res = await api.post('/api/auth/voter/verify-otp', { 
            voter_id: formData.voter_id, 
            firebase_token: idToken 
        });

        if (res.data.success) {
            login(res.data.data.token, 'voter'); 
            navigate('/portal');
        }
    } catch (err) {
        setError("Invalid OTP or Verification Failed.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col">
      {/* Hidden container for ReCaptcha */}
      <div id="recaptcha-container"></div>

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

      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* ... (Background Decor remains same) ... */}
        
        <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
          
          {/* LEFT SIDE: Visuals (Same as before) */}
          <div className="lg:w-5/12 bg-slate-900 relative p-12 text-white flex flex-col justify-between overflow-hidden">
            {/* ... (Same Visual Content) ... */}
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                    Locate. <br/>Verify. <br/><span className="text-emerald-400 italic font-serif">Vote.</span>
                </h2>
                <p className="text-slate-300 font-light leading-relaxed">
                    Authentication via Firebase Secure OTP.
                </p>
            </div>
            {/* ... */}
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

                {step === 1 && (
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleInit} 
                        className="space-y-6"
                    >
                        {/* ... (SAME LOCATION SELECTS AND IDENTITY INPUTS AS ORIGINAL) ... */}
                        
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                           {/* Copy all the Select inputs from original file here */}
                           {/* District, Local Body Type, Block, Local Body Name, Ward */}
                           {/* ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select required className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer" value={formData.district} onChange={(e) => handleChange('district', e.target.value)} disabled={dataLoading}>
                                        <option value="">{dataLoading ? "Loading..." : "Select District"}</option>
                                        {adminData.districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                <div className="relative group">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select required className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer" value={formData.localBodyType} onChange={(e) => handleChange('localBodyType', e.target.value)}>
                                        <option value="">Body Type</option>
                                        <option value="Grama Panchayat">Grama Panchayat</option>
                                        <option value="Municipality">Municipality</option>
                                        <option value="Municipal Corporation">Municipal Corporation</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                {formData.localBodyType === 'Grama Panchayat' && (
                                  <div className="relative group md:col-span-2">
                                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <select required disabled={!formData.district} className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer disabled:bg-slate-100" value={formData.block} onChange={(e) => handleChange('block', e.target.value)}>
                                          <option value="">Select Block Panchayat</option>
                                          {formData.district && adminData.blocks?.[formData.district]?.map(b => ( <option key={b} value={b}>{b}</option> ))}
                                      </select>
                                  </div>
                                )}
                                <div className="relative group md:col-span-2">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select required disabled={!formData.district} className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer disabled:bg-slate-100" value={formData.localBodyName} onChange={(e) => handleChange('localBodyName', e.target.value)}>
                                        <option value="">Select Local Body Name</option>
                                        {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </div>
                                <div className="relative group md:col-span-2">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select required className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-8 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer" value={formData.wardNo} onChange={(e) => handleChange('wardNo', e.target.value)}>
                                        <option value="">Select Ward Number</option>
                                        {wards.map(w => <option key={w} value={w}>Ward {w}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2 px-1">
                                <Fingerprint size={12}/> Identity Proof
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="relative group">
                                    <Vote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input required value={formData.voter_id} onChange={e => handleChange('voter_id', e.target.value.toUpperCase())} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="Voter ID No (e.g. VOTE-XXXXXX)" />
                                </div>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input required value={formData.aadhaar} onChange={e => handleChange('aadhaar', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" placeholder="Aadhaar Number" />
                                </div>
                            </div>
                        </div>

                        <button disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Verify & Send OTP <ArrowRight size={18}/></>}
                        </button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={submitOtp} 
                        className="space-y-6"
                    >
                        <div className="bg-emerald-5 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-black tracking-[0.5em] text-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
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
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">State Election Commission, Kerala</p>
                    <Link to="/login" className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all">
                        <Settings size={10} className="group-hover:text-emerald-500 transition-colors"/>
                        <span>Admin Login</span>
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoterLogin;