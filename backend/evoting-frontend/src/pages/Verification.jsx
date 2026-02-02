import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  UserCheck, 
  Check, 
  Loader2, 
  Clock,
  Search,
  Phone,
  CreditCard,
  X,
  MapPin,
  ShieldCheck,
  AlertOctagon,
  Calendar,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const Verification = () => {
  const [pendingVoters, setPendingVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);

  const { addToast } = useToast();

  const fetchPendingVoters = async () => {
    try {
      const res = await api.get('/api/admin/voters');
      if(res.data.success) {
        // Filter for unverified voters
        const pending = (res.data.data || []).filter(v => !v.IsVerified && !v.is_verified);
        setPendingVoters(pending);
      }
    } catch (err) {
      console.error("Failed to fetch voters");
      addToast("Failed to load verification queue", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendingVoters(); }, []);

  const handleVerify = async (voter) => {
    const targetId = voter.ID || voter.id;
    if (!targetId) return;

    if (!window.confirm(`Verify and approve ${voter.FullName}?`)) return;
    
    setProcessingId(targetId);
    try {
        await api.post('/api/admin/voter/verify', { voter_id: targetId });
        setPendingVoters(prev => prev.filter(v => (v.ID !== targetId && v.id !== targetId)));
        addToast("Voter verified successfully", "success");
        setShowDetailsModal(false);
    } catch (err) {
        addToast(err.response?.data?.error || "Operation failed", "error");
    } finally {
        setProcessingId(null);
    }
  };

  const handleReject = async (voter) => {
    const targetId = voter.ID || voter.id;
    if (!targetId) return;

    if (!window.confirm(`Are you sure you want to REJECT ${voter.FullName}?`)) return;
    
    setProcessingId(targetId);
    try {
        await api.post('/api/admin/voter/reject', { voter_id: targetId });
        setPendingVoters(prev => prev.filter(v => (v.ID !== targetId && v.id !== targetId)));
        addToast("Voter request rejected", "info");
        setShowDetailsModal(false);
    } catch (err) {
        addToast(err.response?.data?.error || "Operation failed", "error");
    } finally {
        setProcessingId(null);
    }
  };

  const openDetails = (voter) => {
      setSelectedVoter(voter);
      setShowDetailsModal(true);
  };

  const filteredList = pendingVoters.filter(v => {
    const name = (v.FullName || '').toLowerCase();
    const vid = (v.VoterID || '').toLowerCase();
    const aadhaar = (v.AadhaarNumber || v.aadhaar_number || v.AadhaarPlain || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || vid.includes(search) || aadhaar.includes(search);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-screen flex flex-col p-6 md:p-10 bg-[#f8fafc]">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full mb-4">
              <UserCheck size={14} className="text-amber-700" />
              <span className="text-amber-800 text-[10px] font-black uppercase tracking-widest">Verification Queue</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Voter <span className="italic text-slate-400 font-light">Verification</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light max-w-xl">
            Review and approve registration requests to maintain the integrity of the electoral roll.
          </p>
        </div>
        
        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl shadow-slate-200/50">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                <Clock size={24} />
            </div>
            <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Pending Review</p>
                <p className="font-serif text-slate-900 font-bold text-3xl leading-none mt-1">{pendingVoters.length}</p>
            </div>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-6 bg-slate-50/50">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide">Pending Requests</h3>
            </div>

            <div className="relative w-full sm:w-96 ml-auto group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Name, ID, or Aadhaar..." 
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 sm:text-sm transition-all font-medium"
               />
            </div>
        </div>

        {/* Voter List Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                        <th className="px-8 py-5">Applicant Details</th>
                        <th className="px-6 py-5">Identity Proofs</th>
                        <th className="px-6 py-5">Request Date</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        <tr><td colSpan="4" className="px-6 py-32 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
                                <span className="text-slate-400 font-medium animate-pulse">Fetching verification queue...</span>
                            </div>
                        </td></tr>
                    ) : filteredList.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-32 text-center">
                            <div className="flex flex-col items-center gap-6 opacity-60">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                    <Check className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-slate-900">All Caught Up!</p>
                                    <p className="text-slate-500">No pending verification requests found.</p>
                                </div>
                            </div>
                        </td></tr>
                    ) : (
                        filteredList.map(v => (
                            <tr key={v.ID || v.id} className="group hover:bg-slate-50/80 transition-colors">
                                
                                {/* Applicant Profile */}
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shadow-sm">
                                            {v.FullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-bold text-base">{v.FullName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-bold">
                                                    ID: {v.VoterID}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Identity Info */}
                                <td className="px-6 py-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <Phone size={14} className="text-slate-400" />
                                            <span className="font-mono">{v.Mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <CreditCard size={14} className="text-slate-400" />
                                            <span className="font-mono tracking-wide">{v.AadhaarNumber || v.aadhaar_number || v.AadhaarPlain || '•••• •••• ••••'}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white w-fit px-3 py-1.5 rounded-lg border border-slate-200 font-medium shadow-sm">
                                        <Calendar size={14} className="text-indigo-400" />
                                        {new Date(v.CreatedAt || v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button 
                                            onClick={() => openDetails(v)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleVerify(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-100 hover:border-emerald-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            title="Approve"
                                        >
                                            {processingId === (v.ID || v.id) ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => handleReject(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="p-2 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-rose-100 hover:border-rose-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            title="Reject"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-xs font-bold text-slate-400 flex justify-between items-center">
            <span>{filteredList.length} Requests pending</span>
            <div className="flex items-center gap-2">
                <AlertCircle size={12} /> Requires Action
            </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowDetailsModal(false)} />
          
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header Banner */}
            <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 overflow-hidden shrink-0">
                <button 
                    onClick={() => setShowDetailsModal(false)} 
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md z-10 border border-white/10"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="px-8 pb-8 -mt-12 relative flex-1 overflow-y-auto custom-scrollbar">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-xl relative z-10">
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-600 border border-slate-200">
                            {selectedVoter.FullName?.charAt(0)}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mt-4 font-serif">{selectedVoter.FullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded border border-indigo-100 font-bold">
                            {selectedVoter.VoterID || selectedVoter.voter_id}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-xs text-amber-600 font-black uppercase tracking-wide">Pending Verification</span>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid gap-6">
                    
                    {/* Section 1: Contact & ID */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-200">
                            <ShieldCheck size={14} className="text-indigo-500" /> Identity Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Aadhaar Number</p>
                                <p className="text-sm font-mono text-slate-700 font-bold tracking-wide">{selectedVoter.AadhaarNumber || selectedVoter.aadhaar_number}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Contact</p>
                                <p className="text-sm font-mono text-slate-700 font-bold">{selectedVoter.Mobile || selectedVoter.mobile}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Jurisdiction */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-200">
                            <MapPin size={14} className="text-emerald-500" /> Jurisdiction Details
                        </h4>
                        <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-sm">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">District</p>
                                <p className="text-slate-700 font-medium">{selectedVoter.District || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Block / Taluk</p>
                                <p className="text-slate-700 font-medium">{selectedVoter.Block || '-'}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Local Body</p>
                                <p className="text-slate-700 font-medium truncate" title={selectedVoter.Panchayath}>{selectedVoter.Panchayath || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ward No</p>
                                <p className="text-slate-700 font-medium flex items-center gap-2">
                                    <span className="bg-white text-slate-600 px-2 py-0.5 rounded text-xs font-bold border border-slate-200 shadow-sm">
                                        #{selectedVoter.Ward || '0'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Residential Address</p>
                            <div className="bg-white border border-slate-200 p-3 rounded-xl text-sm text-slate-600 leading-relaxed shadow-sm">
                                {selectedVoter.Address || <span className="italic text-slate-400">No address provided</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
                <button 
                    onClick={() => handleReject(selectedVoter)}
                    disabled={processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 border border-slate-200 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 group shadow-sm"
                >
                    <AlertOctagon size={18} className="group-hover:scale-110 transition-transform" /> 
                    <span>Reject</span>
                </button>
                
                <button 
                    onClick={() => handleVerify(selectedVoter)}
                    disabled={processingId}
                    className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
                >
                    {processingId === (selectedVoter.ID || selectedVoter.id) ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <span>Verify & Approve</span>
                            <ChevronRight size={18} className="opacity-60" />
                        </>
                    )}
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;