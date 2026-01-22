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
  FileText
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
    // --- ADDED AADHAAR SEARCH ---
    const aadhaar = (v.AadhaarNumber || v.aadhaar_number || v.AadhaarPlain || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || vid.includes(search) || aadhaar.includes(search);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voter Verification</h1>
          <p className="text-slate-400 mt-1">Review and approve pending voter registrations.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400">
            <Clock size={20} />
            <span className="font-bold">{pendingVoters.length} Pending</span>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
        <div className="p-4 border-b border-slate-800">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search pending requests..." 
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
        </div>

        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
                <tr>
                    <th className="px-6 py-4">Voter Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Aadhaar (Click to View)</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4 text-right">Decision</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
                ) : filteredList.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-slate-800 rounded-full"><UserCheck size={24} /></div>
                                <p>No pending verifications found.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredList.map(v => (
                        <tr key={v.ID || v.id} className="group hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-white font-bold text-base">{v.FullName}</p>
                                    <p className="text-indigo-400 text-xs font-mono mt-1">{v.VoterID}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-slate-300 font-mono">
                                    <Phone size={14} className="text-slate-500" />
                                    {v.Mobile}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono">
                                <button 
                                    onClick={() => openDetails(v)}
                                    className="flex items-center gap-2 group/btn cursor-pointer hover:opacity-80 transition-opacity text-left"
                                    title="Click to view full details"
                                >
                                    <CreditCard size={14} className="text-amber-500" />
                                    <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 group-hover/btn:bg-amber-500/20 group-hover/btn:border-amber-500/40 transition-colors">
                                        {v.AadhaarNumber || v.AadhaarPlain || v.aadhaar_number || 'N/A'}
                                    </span>
                                </button>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                                {new Date(v.CreatedAt || v.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleReject(v)}
                                        disabled={processingId === (v.ID || v.id)}
                                        className="inline-flex items-center gap-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                    >
                                        <Ban size={14} />
                                        Reject
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleVerify(v)}
                                        disabled={processingId === (v.ID || v.id)}
                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
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

      {/* Voter Details Modal */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setShowDetailsModal(false)} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="text-indigo-400" /> Verification Details
              </h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl font-bold border border-indigo-500/30">
                        {(selectedVoter.FullName || selectedVoter.full_name || '?').charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">{selectedVoter.FullName || selectedVoter.full_name}</h3>
                        <p className="text-slate-400 font-mono">{selectedVoter.VoterID || selectedVoter.voter_id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                        <p className="text-slate-500 mb-1 flex items-center gap-1"><Phone size={12}/> Mobile</p>
                        <p className="text-white font-mono">{selectedVoter.Mobile || selectedVoter.mobile}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                        <p className="text-slate-500 mb-1 flex items-center gap-1"><CreditCard size={12}/> Aadhaar</p>
                        <p className="text-white font-mono">{selectedVoter.AadhaarNumber || selectedVoter.aadhaar_number || selectedVoter.AadhaarPlain || 'N/A'}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MapPin size={14} /> Address Information
                    </h4>
                    <div className="bg-slate-800/30 rounded-xl border border-slate-800 p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-500 text-xs">District</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.District || '-'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Block</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.Block || '-'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Panchayath</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.Panchayath || '-'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Ward</p>
                                <p className="text-slate-200 font-medium">{selectedVoter.Ward || '-'}</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-slate-700/50">
                            <p className="text-slate-500 text-xs flex items-center gap-1"><FileText size={10}/> Full Address</p>
                            <p className="text-slate-200 mt-1">{selectedVoter.Address || 'No address provided'}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions in Modal */}
                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={() => handleReject(selectedVoter)}
                        disabled={processingId}
                        className="flex-1 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/20 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        Reject Request
                    </button>
                    <button 
                        onClick={() => handleVerify(selectedVoter)}
                        disabled={processingId}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {processingId === (selectedVoter.ID || selectedVoter.id) ? <Loader2 className="animate-spin mx-auto" /> : 'Approve Voter'}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;