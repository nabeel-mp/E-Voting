import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  UserCheck, 
  Check, 
  Loader2, 
  Clock,
  Search,
  Ban,
  Phone,
  CreditCard,
  X,
  MapPin,
  ShieldCheck,
  AlertOctagon,
  Calendar,
  ChevronRight
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
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Voter Verification
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light max-w-xl">
            Review and approve registration requests to maintain the integrity of the electoral roll.
          </p>
        </div>
        
        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/50 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Clock size={20} />
            </div>
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending Review</p>
                <p className="font-mono text-white font-bold text-2xl leading-none">{pendingVoters.length}</p>
            </div>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[600px] ring-1 ring-white/5">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-6 bg-slate-900/40">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <UserCheck size={20} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide">Verification Queue</h3>
            </div>

            <div className="relative w-full sm:w-80 ml-auto group">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
               </div>
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Name, ID, or Aadhaar..." 
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-950/50 text-slate-300 placeholder-slate-600 focus:outline-none focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 sm:text-sm transition-all shadow-inner"
               />
            </div>
        </div>

        {/* Voter List Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10">
                    <tr>
                        <th className="px-8 py-5">Applicant Details</th>
                        <th className="px-6 py-5">Identity Proofs</th>
                        <th className="px-6 py-5">Request Date</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                    {loading ? (
                        <tr><td colSpan="4" className="px-6 py-32 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
                                <span className="text-slate-500 font-medium animate-pulse">Fetching data...</span>
                            </div>
                        </td></tr>
                    ) : filteredList.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-32 text-center">
                            <div className="flex flex-col items-center gap-6 opacity-60">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                                    <Check className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-white">All Caught Up!</p>
                                    <p className="text-slate-400">No pending verification requests found.</p>
                                </div>
                            </div>
                        </td></tr>
                    ) : (
                        filteredList.map(v => (
                            <tr key={v.ID || v.id} className="group hover:bg-white/[0.02] transition-colors">
                                
                                {/* Applicant Profile */}
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-indigo-300 shadow-sm group-hover:border-indigo-500/30 transition-colors">
                                            {v.FullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-base">{v.FullName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                                    ID: {v.VoterID}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Identity Info */}
                                <td className="px-6 py-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <Phone size={14} className="text-slate-500" />
                                            <span className="font-mono">{v.Mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <CreditCard size={14} className="text-slate-500" />
                                            <span className="font-mono tracking-wide">{v.AadhaarNumber || v.AadhaarPlain || '•••• •••• ••••'}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/50 w-fit px-3 py-1.5 rounded-lg border border-slate-800">
                                        <Calendar size={14} />
                                        {new Date(v.CreatedAt || v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button 
                                            onClick={() => openDetails(v)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                                        >
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleVerify(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500 shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Approve"
                                        >
                                            {processingId === (v.ID || v.id) ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => handleReject(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 hover:border-rose-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="px-8 py-4 border-t border-slate-800 bg-slate-900/30 shrink-0 backdrop-blur-md text-xs font-medium text-slate-500 flex justify-between items-center">
            <span>Displaying {filteredList.length} records</span>
            <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Verified</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Pending</span>
            </div>
        </div>
      </div>

      {/* --- REFINED DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowDetailsModal(false)} />
          
          <div className="relative bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header Banner */}
            <div className="relative h-32 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                
                <button 
                    onClick={() => setShowDetailsModal(false)} 
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md z-10 border border-white/10 hover:border-white/20"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="px-8 pb-8 -mt-12 relative flex-1 overflow-y-auto custom-scrollbar">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-slate-900 p-1.5 shadow-2xl ring-4 ring-slate-800 relative z-10">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-3xl font-bold text-white border border-slate-600">
                            {selectedVoter.FullName?.charAt(0)}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4">{selectedVoter.FullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                            {selectedVoter.VoterID || selectedVoter.voter_id}
                        </span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wide">Pending Verification</span>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid gap-6">
                    
                    {/* Section 1: Contact & ID */}
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-700/50">
                            <ShieldCheck size={14} className="text-indigo-400" /> Identity Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Aadhaar Number</p>
                                <p className="text-sm font-mono text-white tracking-wide">{selectedVoter.AadhaarNumber || selectedVoter.aadhaar_number}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Contact</p>
                                <p className="text-sm font-mono text-white">{selectedVoter.Mobile || selectedVoter.mobile}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Jurisdiction */}
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-700/50">
                            <MapPin size={14} className="text-emerald-400" /> Jurisdiction Details
                        </h4>
                        <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-sm">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">District</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.District || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Block / Taluk</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.Block || '-'}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Local Body</p>
                                <p className="text-slate-200 font-medium truncate" title={selectedVoter.Panchayath}>{selectedVoter.Panchayath || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ward No</p>
                                <p className="text-slate-200 font-medium flex items-center gap-2">
                                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold border border-emerald-500/20">
                                        #{selectedVoter.Ward || '0'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Residential Address</p>
                            <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-sm text-slate-300 leading-relaxed">
                                {selectedVoter.Address || <span className="italic text-slate-600">No address provided</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex gap-3 shrink-0">
                <button 
                    onClick={() => handleReject(selectedVoter)}
                    disabled={processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 text-slate-400 border border-slate-700 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 group"
                >
                    <AlertOctagon size={18} className="group-hover:scale-110 transition-transform" /> 
                    <span>Reject</span>
                </button>
                
                <button 
                    onClick={() => handleVerify(selectedVoter)}
                    disabled={processingId}
                    className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
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