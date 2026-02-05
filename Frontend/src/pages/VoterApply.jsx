import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
  UserPlus, ChevronLeft, CreditCard, Phone, ArrowRight,
  Loader2, CheckCircle2, AlertCircle, Calendar, Check,
  MapPin, Building, User, Hash, AlignLeft, ShieldCheck
} from 'lucide-react';

const VoterApply = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [voterId, setVoterId] = useState('');
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
    full_name: '', dob: '', mobile: '', aadhaar: '', address: '',
    district: '', block: '', localBodyType: '', localBodyName: '', ward: ''
  });

  // --- AGE VALIDATION ---
  const isEighteen = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const isEligible = isEighteen(formData.dob);

  useEffect(() => {
    const initData = async () => {
      try {
        const response = await api.get('/api/common/kerala-data');
        if (response.data?.success) setAdminData(response.data.data);
      } catch (err) {
        setError("Failed to load location data.");
      } finally {
        setDataLoading(false);
      }
    };
    initData();
  }, []);

  const handleChange = (field, value) => {
    if ((field === 'mobile' || field === 'aadhaar' || field === 'ward') && value && !/^\d*$/.test(value)) return;

    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'district' ? { block: '', localBodyName: '' } : {}),
      ...(field === 'localBodyType' ? { block: '', localBodyName: '' } : {}),
      ...(field === 'block' ? { localBodyName: '' } : {})
    }));
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
      const payload = { ...formData, panchayath: formData.localBodyName };
      const res = await api.post('/api/auth/voter/register', payload); 
      if (res.data.success) {
        setVoterId(res.data.data.voter_id);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Details may already exist.");
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  // --- Success View ---
  if (success) {
    return (
     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <CheckCircle2 size={48} />
          </div>
          
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Application Submitted</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Your enrollment request has been successfully registered. Please save your Voter ID for future reference.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 mb-8 text-left space-y-4 relative group hover:border-emerald-300 transition-colors">
            <div className="absolute top-4 right-4 text-emerald-200 group-hover:text-emerald-500 transition-colors"><ShieldCheck size={24}/></div>
            <div>
               <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Applicant Name</p>
               <p className="text-lg font-bold text-slate-800">{formData.full_name}</p>
            </div>
            <div className="w-full h-px bg-slate-200"></div>
            <div>
               <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Temporary Voter ID</p>
               <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tighter font-mono">{voterId}</p>
            </div>
          </div>

          <Link to="/voter/login" className="block w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 hover:shadow-emerald-200">
            Proceed to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
              <ChevronLeft size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">SEC<span className="text-emerald-600">KERALA</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Return to Home</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live Server
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-start justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* --- LEFT SIDEBAR (Sticky on Desktop) --- */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-28 space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
               {/* Decorative Background */}
               <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
               
               <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                   <UserPlus size={14} className="text-emerald-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest">New Registration</span>
                 </div>
                 
                 <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-[1.1] mb-6">
                   Join the <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Digital Democracy.</span>
                 </h2>
                 
                 <p className="text-slate-400 text-sm leading-relaxed mb-8">
                   Complete the form to generate your digital Voter ID. Ensure your details match your Aadhaar card exactly to prevent rejection.
                 </p>
                 
                 {/* Eligibility Checker */}
                 <div className={`p-5 rounded-2xl border transition-all duration-300 ${isEligible ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                   <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Age Eligibility</p>
                      {formData.dob && <span className="text-xs font-mono opacity-60">{formData.dob}</span>}
                   </div>
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isEligible ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {isEligible ? <Check size={16}/> : <span className="font-bold text-xs">!</span>}
                      </div>
                      <p className={`text-sm font-bold ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isEligible ? "Eligible to Register" : "Must be 18+ years old"}
                      </p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hidden lg:block">
               <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-600"/> Data Privacy</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                 Your data is encrypted and submitted directly to the State Election Commission servers. We do not share your contact details with third parties.
               </p>
            </div>
          </div>

          {/* --- RIGHT FORM SECTION --- */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 lg:p-12 relative">
               
               <h3 className="text-2xl font-bold text-slate-900 mb-8 font-serif">Application Details</h3>
               
               {error && (
                 <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex gap-3 items-start animate-in slide-in-from-top-2">
                   <AlertCircle size={20} className="shrink-0 mt-0.5" /> 
                   <p>{error}</p>
                 </div>
               )}

               <form onSubmit={handleInitiateSubmit} className="space-y-8">
                 
                 {/* 1. PERSONAL DETAILS */}
                 <section className="space-y-5">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Personal Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                          <input required value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" placeholder="As per Aadhaar Card" />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
                        <div className="relative group">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                          <input type="date" required value={formData.dob} onChange={e => handleChange('dob', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Aadhaar Number</label>
                        <div className="relative group">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                          <input required value={formData.aadhaar} onChange={e => handleChange('aadhaar', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" placeholder="12-digit number" maxLength={12} />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Mobile Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                          <input required value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400" placeholder="10-digit mobile" maxLength={10} />
                        </div>
                      </div>
                    </div>
                 </section>

                 {/* 2. LOCATION DETAILS */}
                 <section className="space-y-5 pt-4">
                    <div className="flex justify-between items-end border-b border-slate-100 pb-2 mb-4">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Residency Details</h4>
                         {/* Diagram context: Helps user identify their district location visually */}
                         
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                      {/* Decoration */}
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <MapPin size={100} />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase">District</label>
                         <div className="relative">
                            <select required value={formData.district} onChange={e => handleChange('district', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 transition-all appearance-none">
                              <option value="">Select District</option>
                              {adminData.districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-slate-400 pointer-events-none" size={16} />
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-500 uppercase">Local Body Type</label>
                         <div className="relative">
                            <select required value={formData.localBodyType} onChange={e => handleChange('localBodyType', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 transition-all appearance-none">
                              <option value="">Select Body Type</option>
                              <option value="Grama Panchayat">Grama Panchayat</option>
                              <option value="Municipality">Municipality</option>
                              <option value="Municipal Corporation">Municipal Corporation</option>
                            </select>
                            <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-slate-400 pointer-events-none" size={16} />
                         </div>
                      </div>

                      {formData.localBodyType === 'Grama Panchayat' && (
                        <div className="space-y-1.5 md:col-span-2 animate-in fade-in slide-in-from-top-1">
                           <label className="text-xs font-bold text-slate-500 uppercase">Block Panchayat</label>
                           <div className="relative">
                              <select required value={formData.block} onChange={e => handleChange('block', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 transition-all appearance-none">
                                <option value="">Select Block</option>
                                {formData.district && adminData.blocks?.[formData.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                              <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-slate-400 pointer-events-none" size={16} />
                           </div>
                        </div>
                      )}

                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Local Body Name</label>
                         <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                            <select required value={formData.localBodyName} onChange={e => handleChange('localBodyName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 transition-all appearance-none disabled:bg-slate-50" disabled={!formData.district}>
                              <option value="">Select Name</option>
                              {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                            <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-slate-400 pointer-events-none" size={16} />
                         </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Ward No</label>
                         <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                            <input required value={formData.ward} onChange={e => handleChange('ward', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all" placeholder="e.g. 12" />
                         </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Permanent Address</label>
                         <div className="relative group">
                            <AlignLeft className="absolute left-4 top-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                            <textarea required value={formData.address} onChange={e => handleChange('address', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 transition-all resize-none h-24" placeholder="House Name, Street, Post Office..." />
                         </div>
                      </div>
                    </div>
                 </section>

                 <div className="pt-4">
                   <button 
                     type="submit" 
                     disabled={loading || !isEligible} 
                     className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 transform active:scale-[0.99] ${
                       isEligible 
                       ? 'bg-slate-900 hover:bg-emerald-600 text-white shadow-slate-900/20 hover:shadow-emerald-600/30' 
                       : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                     }`}
                   >
                     {loading ? <Loader2 className="animate-spin" size={20}/> : <>{isEligible ? "Review & Submit" : "Cannot Submit (Underage)"} <ArrowRight size={18}/></>}
                   </button>
                   {!isEligible && <p className="text-center text-xs text-rose-500 font-bold mt-3">You must be 18 years or older to register.</p>}
                 </div>

               </form>
            </div>
          </div>
        </div>
      </main>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => !loading && setShowConfirmModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 text-center">
            
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
               <ShieldCheck size={40} />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">Confirm Submission</h3>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm px-4">
               Please confirm that <strong>{formData.full_name}</strong> is the correct applicant. Incorrect Aadhaar/Mobile data will lead to application rejection.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                disabled={loading}
                className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={executeSubmit} 
                disabled={loading} 
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm'}
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
};

export default VoterApply;