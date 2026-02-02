import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
  UserPlus, 
  ChevronLeft, 
  MapPin, 
  Building2, 
  Hash, 
  Layers, 
  Calendar,
  CreditCard,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const VoterApply = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [voterId, setVoterId] = useState('');

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
          // Normalization logic simplified for this component
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
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields
      ...(field === 'district' ? { block: '', localBodyName: '' } : {}),
      ...(field === 'localBodyType' ? { block: '', localBodyName: '' } : {}),
      ...(field === 'block' ? { localBodyName: '' } : {})
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEligible) return;
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        panchayath: formData.localBodyName // Mapping to backend 'panchayath' field
      };
      const res = await api.post('/api/auth/voter/register', payload); // Assuming public endpoint
      if (res.data.success) {
        setVoterId(res.data.data.voter_id);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Aadhaar or Mobile may already be registered.");
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
          <p className="text-slate-500 mb-8">Your application is being processed by the commission.</p>
          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 mb-8">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Your Voter ID</p>
            <p className="text-3xl font-black text-emerald-600 tracking-tighter">{voterId}</p>
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
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name (As per Aadhaar)</label>
                  <input required value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500/10 outline-none" placeholder="Enter Full Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="date" required value={formData.dob} onChange={e => handleChange('dob', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/10 outline-none" />
                  </div>
                </div>
              </div>

              {/* Identity & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input required value={formData.aadhaar} onChange={e => handleChange('aadhaar', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none" placeholder="Aadhaar Number" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input required value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none" placeholder="Mobile Number" />
                </div>
              </div>

              {/* Location Selection (Simplified version of VoterLogin logic) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required value={formData.district} onChange={e => handleChange('district', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none">
                  <option value="">Select District</option>
                  {adminData.districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select required value={formData.localBodyType} onChange={e => handleChange('localBodyType', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none">
                  <option value="">Select Body Type</option>
                  <option value="Grama Panchayat">Grama Panchayat</option>
                  <option value="Municipality">Municipality</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                </select>

                {formData.localBodyType === 'Grama Panchayat' && (
                  <select required value={formData.block} onChange={e => handleChange('block', e.target.value)} className="md:col-span-2 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none">
                    <option value="">Select Block Panchayat</option>
                    {formData.district && adminData.blocks?.[formData.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )}

                <select required value={formData.localBodyName} onChange={e => handleChange('localBodyName', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none">
                  <option value="">Select Local Body</option>
                  {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                </select>

                <input required value={formData.ward} onChange={e => handleChange('ward', e.target.value)} className="bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold outline-none" placeholder="Ward No" />
              </div>

              <button 
                type="submit" 
                disabled={loading || !isEligible} 
                className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isEligible 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <>{isEligible ? "Submit Application" : "Age Restriction (18+ Only)"} <ArrowRight size={18}/></>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoterApply;