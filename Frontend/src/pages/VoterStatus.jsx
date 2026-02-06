import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { checkVoterStatus } from '../utils/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CheckCircle2, XCircle, AlertCircle, Loader2, 
  ChevronLeft, Fingerprint, ShieldCheck, UserCheck 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const VoterStatus = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await checkVoterStatus(data.voterId);
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Voter record not found");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper for dynamic styling based on status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Verified': 
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          text: 'text-emerald-800',
          icon: <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />,
          label: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          desc: 'Your account is verified. You are eligible to vote.'
        };
      case 'Blocked': 
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          text: 'text-rose-800',
          icon: <XCircle className="w-12 h-12 text-rose-500 mb-2" />,
          label: 'bg-rose-100 text-rose-700 border-rose-200',
          desc: 'Action Required. Please contact your local election officer.'
        };
      default: // Pending
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-800',
          icon: <AlertCircle className="w-12 h-12 text-amber-500 mb-2" />,
          label: 'bg-amber-100 text-amber-700 border-amber-200',
          desc: 'Verification in progress. Please check back later.'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 flex flex-col">
      
      {/* --- HEADER (Matches VoterLogin) --- */}
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
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <UserCheck size={14} className="text-emerald-500" />
            PUBLIC REGISTRY SEARCH
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Check Enrollment</h2>
            <p className="text-slate-500 text-sm">Verify your status in the 2026 Electoral Roll.</p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-black text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                  <Fingerprint size={12}/> Voter ID Number
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Ex: WX1234567"
                    className={`w-full bg-slate-50 border ${errors.voterId ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'} rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all uppercase`}
                    {...register("voterId", { required: "Voter ID is required" })}
                  />
                </div>
                {errors.voterId && (
                  <p className="text-xs font-bold text-rose-500 ml-1">{errors.voterId.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </button>
            </form>

            {/* --- RESULT CARD --- */}
            <AnimatePresence mode='wait'>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-8 p-6 rounded-2xl border flex flex-col items-center text-center ${getStatusConfig(result.Status).bg} ${getStatusConfig(result.Status).border} ${getStatusConfig(result.Status).text}`}
                >
                  {getStatusConfig(result.Status).icon}
                  
                  <h3 className="text-xl font-bold mb-1">{result.FullName}</h3>
                  <p className="text-xs font-mono opacity-70 mb-4 tracking-wider">{result.VoterID}</p>
                  
                  <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusConfig(result.Status).label}`}>
                    {result.Status}
                  </div>
                  
                  <p className="mt-4 text-xs font-medium opacity-80 max-w-[200px]">
                    {getStatusConfig(result.Status).desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- FOOTER LINKS --- */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
               <Link to="/voter/apply" className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  Not found? Apply New Voter ID
               </Link>
            </div>

          </div>
          
          <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            State Election Commission, Kerala
          </p>
        </div>
      </main>
    </div>
  );
};

export default VoterStatus;