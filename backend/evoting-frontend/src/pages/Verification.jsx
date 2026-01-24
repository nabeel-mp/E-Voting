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
  User,
  MapPin,
  FileText,
  ShieldCheck,
  AlertOctagon
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
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Voter Verification
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Review and approve registration requests to maintain election integrity.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-xl shadow-lg backdrop-blur-md">
            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 animate-pulse">
                <Clock size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-amber-500/80 font-bold uppercase tracking-wider">Pending Requests</span>
                <span className="font-mono text-white font-bold text-xl leading-none">{pendingVoters.length}</span>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[650px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={18} className="text-cyan-400" />
              Registration Queue
            </h3>
            <div className="relative w-full sm:w-72 ml-auto group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Name, ID, Aadhaar..." 
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
               />
            </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10 shadow-sm">
                    <tr>
                        <th className="px-8 py-5">Applicant Profile</th>
                        <th className="px-6 py-5">Contact Info</th>
                        <th className="px-6 py-5">Identity Proof</th>
                        <th className="px-6 py-5">Applied On</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                    {loading ? (
                        <tr><td colSpan="5" className="px-6 py-24 text-center"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /><span className="text-slate-500 animate-pulse">Loading verification queue...</span></div></td></tr>
                    ) : filteredList.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-24 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-4 opacity-60">
                                <div className="p-4 bg-slate-800 rounded-full"><Check size={32} /></div>
                                <p className="text-lg">All caught up! No pending requests found.</p>
                            </div>
                        </td></tr>
                    ) : (
                        filteredList.map(v => (
                            <tr key={v.ID || v.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg shadow-sm">
                                            {v.FullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-slate-200 font-bold text-base">{v.FullName}</p>
                                            <p className="text-slate-500 text-xs font-mono mt-0.5 tracking-wide">ID: {v.VoterID}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2.5 text-slate-400 bg-slate-950/30 w-fit px-3 py-1.5 rounded-lg border border-slate-800/50">
                                        <Phone size={14} className="text-slate-500" />
                                        <span className="font-mono text-xs font-medium">{v.Mobile}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <button 
                                        onClick={() => openDetails(v)}
                                        className="group/btn flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-950/30 hover:bg-slate-800 border border-slate-800/50 hover:border-slate-600 transition-all text-left"
                                    >
                                        <CreditCard size={14} className="text-amber-500" />
                                        <span className="text-xs text-slate-400 font-mono group-hover/btn:text-slate-200 transition-colors">
                                            {v.AadhaarNumber || v.AadhaarPlain || 'N/A'}
                                        </span>
                                    </button>
                                </td>
                                <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                                    {new Date(v.CreatedAt || v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleReject(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50 border border-transparent hover:border-rose-500/20"
                                            title="Reject Request"
                                        >
                                            <Ban size={18} />
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleVerify(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                        >
                                            {processingId === (v.ID || v.id) ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                            Approve
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
        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30 shrink-0 backdrop-blur-md">
            <span>Showing {filteredList.length} pending requests</span>
            {searchTerm && filteredList.length !== pendingVoters.length && (
               <span className="text-indigo-400">Filtered from {pendingVoters.length} total</span>
            )}
        </div>
      </div>

      {/* --- STUNNING DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" onClick={() => setShowDetailsModal(false)} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ring-1 ring-white/10">
            
            {/* Header Banner */}
            <div className="relative h-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <button 
                    onClick={() => setShowDetailsModal(false)} 
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-sm z-10 border border-white/10"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="px-8 pb-8 relative">
                {/* Avatar */}
                <div className="-mt-16 mb-6">
                    <div className="w-28 h-28 rounded-full bg-slate-900 p-1.5 shadow-2xl relative z-10 mx-auto md:mx-0">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-200 border border-slate-700">
                            {selectedVoter.FullName?.charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{selectedVoter.FullName}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-xs border border-indigo-500/20 font-mono font-medium">
                                ID: {selectedVoter.VoterID || selectedVoter.voter_id}
                            </span>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide bg-slate-800 px-2 py-1 rounded-full">
                                Pending Verification
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-6">
                    
                    {/* Identity Section */}
                    <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-inner">
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
                            <ShieldCheck size={14} /> Identity Proofs
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5"><Phone size={10} /> Mobile Number</p>
                                <p className="text-slate-200 font-mono font-medium text-sm">{selectedVoter.Mobile || selectedVoter.mobile}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5"><CreditCard size={10} /> Aadhaar Number</p>
                                <p className="text-slate-200 font-mono font-medium text-sm">{selectedVoter.AadhaarNumber || selectedVoter.aadhaar_number || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5 space-y-4">
                        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
                            <MapPin size={14} /> Electoral Jurisdiction
                        </h3>
                        <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">District</p>
                                <p className="text-slate-300 font-medium">{selectedVoter.District || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Block / Taluk</p>
                                <p className="text-slate-300 font-medium">{selectedVoter.Block || '-'}</p>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Local Body</p>
                                <p className="text-slate-300 font-medium truncate" title={selectedVoter.Panchayath}>{selectedVoter.Panchayath || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Ward No</p>
                                <p className="text-slate-300 font-medium">{selectedVoter.Ward || '-'}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-800/50">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5"><FileText size={12}/> Permanent Address</p>
                            <p className="text-slate-400 text-sm leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                                {selectedVoter.Address || 'No address provided in records.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex gap-4 mt-auto sticky bottom-0">
                <button 
                    onClick={() => handleReject(selectedVoter)}
                    disabled={processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-rose-900/10 active:scale-[0.98]"
                >
                    <AlertOctagon size={18} /> Reject
                </button>
                <button 
                    onClick={() => handleVerify(selectedVoter)}
                    disabled={processingId}
                    className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
                >
                    {processingId === (selectedVoter.ID || selectedVoter.id) ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Verify & Approve Access
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;