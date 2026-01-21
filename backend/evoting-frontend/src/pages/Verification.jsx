import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext'; // Import Hook
import { 
  UserCheck, 
  Check, 
  Loader2, 
  Clock,
  Search,
  Ban
} from 'lucide-react';

const Verification = () => {
  const [pendingVoters, setPendingVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast(); // Initialize Hook

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
        addToast("Voter verified successfully", "success"); // Toast
    } catch (err) {
        addToast(err.response?.data?.error || "Operation failed", "error"); // Toast
    } finally {
        setProcessingId(null);
    }
  };

  const handleReject = async (voter) => {
    const targetId = voter.ID || voter.id;
    if (!targetId) return;

    if (!window.confirm(`Are you sure you want to REJECT ${voter.FullName}? This will remove the request.`)) return;
    
    setProcessingId(targetId);
    try {
        await api.post('/api/admin/voter/reject', { voter_id: targetId });
        setPendingVoters(prev => prev.filter(v => (v.ID !== targetId && v.id !== targetId)));
        addToast("Voter request rejected and removed", "info"); // Toast
    } catch (err) {
        addToast(err.response?.data?.error || "Operation failed", "error"); // Toast
    } finally {
        setProcessingId(null);
    }
  };

  const filteredList = pendingVoters.filter(v => 
    v.FullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.VoterID.includes(searchTerm)
  );

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
                    <th className="px-6 py-4">Voter Details</th>
                    <th className="px-6 py-4">Government ID</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4 text-right">Decision</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                    <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
                ) : filteredList.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-slate-800 rounded-full"><UserCheck size={24} /></div>
                                <p>No pending verifications found.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredList.map(v => (
                        <tr key={v.ID} className="group hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-white font-bold text-base">{v.FullName}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">Mobile: {v.Mobile}</p>
                                    <p className="text-indigo-400 text-xs font-mono mt-1">{v.VoterID}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono">
                                {v.AadhaarPlain ? (
                                    <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                                        {v.AadhaarPlain}
                                    </span>
                                ) : (
                                    <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">
                                        {v.AadhaarHash ? "HASHED-SECURE" : "Unknown"}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {new Date(v.CreatedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleReject(v)}
                                        disabled={processingId === v.ID}
                                        className="inline-flex items-center gap-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Ban size={16} />
                                        Reject
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleVerify(v)}
                                        disabled={processingId === v.ID}
                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processingId === v.ID ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
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
  );
};

export default Verification;