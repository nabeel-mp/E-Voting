import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Vote, ArrowRight, Loader2, CreditCard, Lock, Fingerprint, CheckCircle2 } from 'lucide-react';

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
      const res = await api.post('/api/auth/voter/login', formData);
      if (res.data.success) {
        setServerMsg(res.data.data.message); // Contains the OTP in demo mode
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950 to-slate-950"></div>
      <div className="absolute w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -top-20 -right-20"></div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Fingerprint size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Voter Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Secure Identity Verification</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Step 1: Credentials */}
        {step === 1 && (
          <form onSubmit={handleInit} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Voter ID</label>
              <div className="relative group">
                <Vote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input 
                  required 
                  value={formData.voter_id}
                  onChange={e => setFormData({...formData, voter_id: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="Enter your Voter ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Aadhaar Number</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input 
                  required 
                  value={formData.aadhaar}
                  onChange={e => setFormData({...formData, aadhaar: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="12-digit Aadhaar Number"
                />
              </div>
            </div>
            <button disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="animate-spin" size={20}/> : <>Continue <ArrowRight size={18}/></>}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                <p className="text-xs text-emerald-300 leading-relaxed">{serverMsg}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">One Time Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                <input 
                  required 
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 tracking-widest font-mono text-lg"
                  placeholder="• • • • • •"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors">
                    Back
                </button>
                <button disabled={loading} className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : "Verify & Login"}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VoterLogin;