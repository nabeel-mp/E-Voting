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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voter Verification</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            Review registration requests. Ensure identity details match official records before approving access.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-5 py-2.5 rounded-xl text-amber-400 shadow-lg shadow-amber-500/5">
            <Clock size={20} className="animate-pulse" />
            <span className="font-bold tracking-wide">{pendingVoters.length} Pending Requests</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
        
        {/* Search Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/40">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Name, ID, or Aadhaar..." 
                  className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950/50 text-xs uppercase font-bold text-slate-500 border-b border-slate-800 tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Applicant</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Identity Proof</th>
                        <th className="px-6 py-4">Applied On</th>
                        <th className="px-6 py-4 text-right">Quick Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3 text-indigo-400">
                                    <Loader2 className="animate-spin" size={32} />
                                    <span className="text-sm font-medium">Loading requests...</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredList.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-24 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700"><UserCheck size={32} className="text-slate-600" /></div>
                                    <div>
                                        <p className="text-lg font-medium text-slate-300">All caught up!</p>
                                        <p className="text-sm mt-1">No pending verification requests found.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredList.map(v => (
                            <tr key={v.ID || v.id} className="group hover:bg-slate-800/30 transition-all duration-200">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                            {v.FullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-slate-200 font-semibold">{v.FullName}</p>
                                            <p className="text-slate-500 text-xs font-mono mt-0.5">{v.VoterID}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Phone size={14} className="text-slate-600" />
                                        <span className="font-mono">{v.Mobile}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono">
                                    <button 
                                        onClick={() => openDetails(v)}
                                        className="group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all text-left"
                                    >
                                        <CreditCard size={14} className="text-amber-500" />
                                        <span className="text-xs text-slate-300 group-hover/btn:text-white transition-colors">
                                            {v.AadhaarNumber || v.AadhaarPlain || 'N/A'}
                                        </span>
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                    {new Date(v.CreatedAt || v.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleReject(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50"
                                            title="Reject"
                                        >
                                            <Ban size={18} />
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleVerify(v)}
                                            disabled={processingId === (v.ID || v.id)}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* --- STUNNING DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" onClick={() => setShowDetailsModal(false)} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header Banner */}
            <div className="relative h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                <button 
                    onClick={() => setShowDetailsModal(false)} 
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-sm z-10"
                >
                    <X size={18} />
                </button>
                <div className="absolute -bottom-10 left-6">
                    <div className="w-24 h-24 rounded-full bg-slate-900 p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-200 border border-slate-700">
                            {selectedVoter.FullName?.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-6 pt-12 pb-6 overflow-y-auto custom-scrollbar">
                
                {/* Header Info */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{selectedVoter.FullName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded text-xs border border-indigo-500/20 font-mono">
                                ID: {selectedVoter.VoterID || selectedVoter.voter_id}
                            </span>
                            <span className="text-slate-500 text-xs">• Verification Pending</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-6">
                    
                    {/* Identity Section */}
                    <div className="bg-slate-800/40 rounded-xl border border-slate-800 p-4 space-y-4">
                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} /> Identity Proofs
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Phone size={10} /> Mobile</p>
                                <p className="text-slate-200 font-mono font-medium">{selectedVoter.Mobile || selectedVoter.mobile}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CreditCard size={10} /> Aadhaar</p>
                                <p className="text-slate-200 font-mono font-medium">{selectedVoter.AadhaarNumber || selectedVoter.aadhaar_number || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="bg-slate-800/40 rounded-xl border border-slate-800 p-4 space-y-4">
                        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={14} /> Jurisdiction
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-semibold">District</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.District || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-semibold">Block / Taluk</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.Block || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-semibold">Panchayat / Local Body</p>
                                <p className="text-slate-200 font-medium truncate" title={selectedVoter.Panchayath}>{selectedVoter.Panchayath || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-semibold">Ward No</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.Ward || '-'}</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><FileText size={10}/> Permanent Address</p>
                            <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                {selectedVoter.Address || 'No address provided in records.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex gap-3">
                <button 
                    onClick={() => handleReject(selectedVoter)}
                    disabled={processingId}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/20 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    <AlertOctagon size={18} /> Reject
                </button>
                <button 
                    onClick={() => handleVerify(selectedVoter)}
                    disabled={processingId}
                    className="flex-[2] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                    {processingId === (selectedVoter.ID || selectedVoter.id) ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Verify & Approve
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;