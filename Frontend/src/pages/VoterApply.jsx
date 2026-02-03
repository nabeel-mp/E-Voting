import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
  UserPlus, 
  ChevronLeft, 
  CreditCard, 
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  AlertTriangle,
  Check
} from 'lucide-react';

const VoterApply = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [voterId, setVoterId] = useState('');

  // --- Confirmation Modal State ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- Kerala Admin Data ---
  const [adminData, setAdminData] = useState({
    districts: [],
    blocks: {},
    municipalities: {},
    corporations: {},
    grama_panchayats: {}
  });

  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    mobile: '',
    aadhaar: '',
    address: '',
    district: '',
    block: '',
    localBodyType: '',
    localBodyName: '',
    ward: ''
  });

  // --- AGE VALIDATION LOGIC ---
  const isEighteen = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const isEligible = isEighteen(formData.dob);

  // --- FETCH REFERENCE DATA ---
  useEffect(() => {
    const initData = async () => {
      try {
        const response = await api.get('/api/common/kerala-data');
        if (response.data?.success) {
          setAdminData(response.data.data);
        }
      } catch (err) {
        setError("Failed to load location data.");
      } finally {
        setDataLoading(false);
      }
    };
    initData();
  }, []);

  const handleChange = (field, value) => {
    // Basic input cleaning for numbers
    if (field === 'mobile' || field === 'aadhaar' || field === 'ward') {
        if (value && !/^\d*$/.test(value)) return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields
      ...(field === 'district' ? { block: '', localBodyName: '' } : {}),
      ...(field === 'localBodyType' ? { block: '', localBodyName: '' } : {}),
      ...(field === 'block' ? { localBodyName: '' } : {})
    }));
    // Clear errors on change
    if(error) setError('');
  };

  const getLocalBodyList = () => {
    if (!formData.district) return [];
    if (formData.localBodyType === 'Municipality') return adminData.municipalities?.[formData.district] || [];
    if (formData.localBodyType === 'Municipal Corporation') return adminData.corporations?.[formData.district] || [];
    if (formData.localBodyType === 'Grama Panchayat') {
      return formData.block ? adminData.grama_panchayats?.[formData.block] || [] : [];
    }
    return [];
  };

  const validateForm = () => {
      if (!formData.full_name.trim() || formData.full_name.length < 3) return "Full Name must be at least 3 characters.";
      if (!/^\d{10}$/.test(formData.mobile)) return "Mobile number must be exactly 10 digits.";
      if (!/^\d{12}$/.test(formData.aadhaar)) return "Aadhaar number must be exactly 12 digits.";
      if (!formData.ward.trim()) return "Ward number is required.";
      if (!formData.address.trim() || formData.address.length < 10) return "Please provide a complete residential address.";
      if (!isEligible) return "You must be 18 years or older to apply.";
      return null;
  };

  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    setShowConfirmModal(true);
  };

  const executeSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        panchayath: formData.localBodyName 
      };
      const res = await api.post('/api/auth/voter/register', payload); 
      if (res.data.success) {
        setVoterId(res.data.data.voter_id);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Aadhaar or Mobile may already be registered.");
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 mb-8">Thank you, <span className="font-bold text-slate-900">{formData.full_name}</span>. Your application is being processed.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 mb-8 space-y-4">
            <div>
               <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Applicant Name</p>
               <p className="text-lg font-bold text-slate-700">{formData.full_name}</p>
            </div>
            <div className="w-full h-px bg-slate-200"></div>
            <div>
               <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Your Voter ID</p>
               <p className="text-3xl font-black text-emerald-600 tracking-tighter">{voterId}</p>
            </div>
          </div>

          <Link to="/voter/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white"><ChevronLeft size={18} /></div>
            <h1 className="text-lg font-black text-slate-900">SEC<span className="text-emerald-600">KERALA</span></h1>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Info Panel */}
          <div className="md:w-1/3 bg-slate-900 p-10 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/20 mb-6">
              <UserPlus size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Enrollment 2026</span>
            </div>
            <h2 className="text-3xl font-serif font-bold leading-tight mb-6">Join the <br/>Digital <br/><span className="text-emerald-400">Democracy.</span></h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">Ensure your details match your Aadhaar card for a seamless verification process.</p>
            
            <div className={`p-4 rounded-2xl border ${isEligible ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Eligibility Status</p>
              <p className={`text-xs font-bold ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isEligible ? "✓ Eligible to Register" : "✕ Must be 18+ to apply"}
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="md:w-2/3 p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Voter Application Form</h3>
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex gap-2 items-center animate-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleInitiateSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name (As per Aadhaar)</label>
                  <input required value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all" placeholder="Enter Full Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="date" required value={formData.dob} onChange={e => handleChange('dob', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Identity & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input required value={formData.aadhaar} onChange={e => handleChange('aadhaar', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all" placeholder="Aadhaar Number (12 digits)" maxLength={12} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input required value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all" placeholder="Mobile Number (10 digits)" maxLength={10} />
                </div>
              </div>

              {/* Location Selection */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required value={formData.district} onChange={e => handleChange('district', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none cursor-pointer focus:border-indigo-500 transition-all">
                  <option value="">Select District</option>
                  {adminData.districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select required value={formData.localBodyType} onChange={e => handleChange('localBodyType', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none cursor-pointer focus:border-indigo-500 transition-all">
                  <option value="">Select Body Type</option>
                  <option value="Grama Panchayat">Grama Panchayat</option>
                  <option value="Municipality">Municipality</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                </select>

                {formData.localBodyType === 'Grama Panchayat' && (
                  <select required value={formData.block} onChange={e => handleChange('block', e.target.value)} className="md:col-span-2 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none cursor-pointer focus:border-indigo-500 transition-all">
                    <option value="">Select Block Panchayat</option>
                    {formData.district && adminData.blocks?.[formData.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )}

                <select required value={formData.localBodyName} onChange={e => handleChange('localBodyName', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none cursor-pointer focus:border-indigo-500 transition-all">
                  <option value="">Select Local Body</option>
                  {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                </select>

                <input required value={formData.ward} onChange={e => handleChange('ward', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all" placeholder="Ward No" />
                
                <textarea required value={formData.address} onChange={e => handleChange('address', e.target.value)} className="md:col-span-2 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:border-indigo-500 transition-all resize-none h-20" placeholder="Permanent Residential Address" />
              </div>

              <button 
                type="submit" 
                disabled={loading || !isEligible} 
                className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isEligible 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <>{isEligible ? "Submit Application" : "Age Restriction (18+ Only)"} <ArrowRight size={18}/></>}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => !loading && setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100">
               <Check size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">Confirm Submission?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Please verify your details. Incorrect information (especially <strong>Aadhaar</strong> & <strong>Mobile</strong>) will lead to rejection.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                disabled={loading}
                className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeSubmit} 
                disabled={loading} 
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default VoterApply;