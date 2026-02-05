import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  UserCheck, Check, Loader2, Clock, Search, Phone, CreditCard, X, MapPin, 
  ShieldCheck, AlertOctagon, Calendar, ChevronRight, AlertCircle, 
  AlertTriangle, CheckCircle2, Eye
} from 'lucide-react';

const Verification = () => {
  const [pendingVoters, setPendingVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, data: null });
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const fetchPendingVoters = async () => {
    try {
      const res = await api.get('/api/admin/voters');
      if(res.data.success) {
        const pending = (res.data.data || []).filter(v => !v.IsVerified && !v.is_verified);
        setPendingVoters(pending);
      }
    } catch (err) {
      addToast("Failed to load verification queue", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPendingVoters(); }, []);

  const initiateAction = (action, voter) => { setConfirmModal({ show: true, action, data: voter }); };

  const executeConfirmAction = async () => {
    const { action, data } = confirmModal;
    const targetId = data?.ID || data?.id;
    if (!targetId) return;

    setSubmitting(true);
    try {
      if (action === 'VERIFY') await api.post('/api/admin/voter/verify', { voter_id: targetId });
      else if (action === 'REJECT') await api.post('/api/admin/voter/reject', { voter_id: targetId });
      
      addToast(action === 'VERIFY' ? "Voter verified successfully" : "Request rejected", action === 'VERIFY' ? "success" : "info");
      setPendingVoters(prev => prev.filter(v => (v.ID !== targetId && v.id !== targetId)));
      setConfirmModal({ show: false, action: null, data: null });
      setShowDetailsModal(false);
    } catch (err) {
      addToast(err.response?.data?.error || "Operation failed", "error");
    } finally { setSubmitting(false); }
  };

  const filteredList = pendingVoters.filter(v => {
    const search = searchTerm.toLowerCase();
    return (v.FullName || '').toLowerCase().includes(search) || 
           (v.VoterID || '').toLowerCase().includes(search) || 
           (v.AadhaarNumber || '').toLowerCase().includes(search);
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 min-h-screen flex flex-col p-4 sm:p-6 lg:p-10 bg-[#f8fafc]">
      
      {/* --- RESPONSIVE HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full">
              <UserCheck size={14} className="text-amber-700" />
              <span className="text-amber-800 text-[10px] font-black uppercase tracking-widest">Verification Queue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Voter <span className="italic text-slate-400 font-light">Verification</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-lg font-light max-w-xl">
            Review and approve registration requests to maintain the integrity of the electoral roll.
          </p>
        </div>
        
        {/* Quick Stats Pill */}
        <div className="w-full lg:w-auto flex items-center gap-4 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl shadow-slate-200/50 transition-transform hover:scale-[1.02]">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 shrink-0">
                <Clock size={24} />
            </div>
            <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Pending Review</p>
                <p className="font-serif text-slate-900 font-bold text-3xl leading-none mt-1">{pendingVoters.length}</p>
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide">Pending Requests</h3>
            </div>

            <div className="relative w-full sm:w-96 sm:ml-auto group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Name, ID..." 
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 font-medium transition-all shadow-sm"
               />
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 bg-white">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
                <span className="text-slate-400 font-medium animate-pulse">Fetching verification queue...</span>
             </div>
          ) : filteredList.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-6">
                    <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-slate-900">All Caught Up!</p>
                <p className="text-slate-500 mt-1">No pending verification requests found.</p>
             </div>
          ) : (
            <>
              {/* --- TABLE VIEW (Desktop) --- */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5">Applicant Details</th>
                            <th className="px-6 py-5">Identity Proofs</th>
                            <th className="px-6 py-5">Request Date</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredList.map(v => (
                            <tr key={v.ID} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                                            {v.FullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-bold">{v.FullName}</p>
                                            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">ID: {v.VoterID}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12}/> <span className="font-mono">{v.Mobile}</span></div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500"><CreditCard size={12}/> <span className="font-mono">{v.AadhaarNumber}</span></div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white w-fit px-2 py-1 rounded border border-slate-200">
                                        <Calendar size={12} className="text-indigo-400" />
                                        {new Date(v.CreatedAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => { setSelectedVoter(v); setShowDetailsModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={18}/></button>
                                        <button onClick={() => initiateAction('VERIFY', v)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all border border-emerald-100"><Check size={18}/></button>
                                        <button onClick={() => initiateAction('REJECT', v)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all border border-rose-100"><X size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>

              {/* --- CARD VIEW (Mobile/Tablet) --- */}
              <div className="lg:hidden p-4 space-y-4 bg-slate-50/50">
                {filteredList.map(v => (
                  <div key={v.ID} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600">
                              {v.FullName?.charAt(0)}
                           </div>
                           <div>
                              <h3 className="font-bold text-slate-900 text-lg leading-tight">{v.FullName}</h3>
                              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">ID: {v.VoterID}</span>
                           </div>
                        </div>
                        <button onClick={() => { setSelectedVoter(v); setShowDetailsModal(true); }} className="text-sm text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">View <ChevronRight size={14}/></button>
                     </div>

                     <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile</p>
                           <p className="font-mono text-slate-700">{v.Mobile}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Aadhaar</p>
                           <p className="font-mono text-slate-700">{v.AadhaarNumber}</p>
                        </div>
                     </div>

                     <div className="flex gap-3 pt-2">
                        <button onClick={() => initiateAction('REJECT', v)} className="flex-1 py-3 border border-rose-100 bg-rose-50 text-rose-600 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"><X size={18}/> Reject</button>
                        <button onClick={() => initiateAction('VERIFY', v)} className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-transform"><Check size={18}/> Approve</button>
                     </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Footer Stats */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-xs font-bold text-slate-400 flex justify-between items-center rounded-b-[2rem]">
            <span>{filteredList.length} Requests pending</span>
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <AlertCircle size={12} /> Requires Action
            </div>
        </div>
      </div>

      {/* --- DETAILS MODAL (Responsive) --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="relative h-28 bg-gradient-to-r from-indigo-600 to-purple-600 shrink-0">
                <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full"><X size={18} /></button>
            </div>

            <div className="px-6 sm:px-8 pb-8 -mt-10 flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-lg relative z-10">
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 border">
                            {selectedVoter.FullName?.charAt(0)}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mt-3 font-serif">{selectedVoter.FullName}</h2>
                    <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1">{selectedVoter.VoterID}</span>
                </div>

                <div className="space-y-4">
                    {/* Identity Card */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={14}/> Identity</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Aadhaar</p><p className="font-mono font-bold text-slate-700">{selectedVoter.AadhaarNumber}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Mobile</p><p className="font-mono font-bold text-slate-700">{selectedVoter.Mobile}</p></div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={14}/> Jurisdiction</h4>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">District</p><p className="font-medium text-slate-700">{selectedVoter.District}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Block</p><p className="font-medium text-slate-700">{selectedVoter.Block}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Panchayat</p><p className="font-medium text-slate-700 truncate">{selectedVoter.Panchayath}</p></div>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Ward</p><span className="bg-white px-2 py-0.5 rounded border shadow-sm font-bold text-slate-600">#{selectedVoter.Ward}</span></div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                           <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Address</p>
                           <p className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-200">{selectedVoter.Address}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
                <button onClick={() => initiateAction('REJECT', selectedVoter)} className="flex-1 flex items-center justify-center gap-2 bg-white text-rose-600 border border-slate-200 py-3 rounded-xl font-bold hover:bg-rose-50 transition-colors"><AlertOctagon size={18}/> Reject</button>
                <button onClick={() => initiateAction('VERIFY', selectedVoter)} className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">Verify & Approve <ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmModal({ show: false })} />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 text-center">
            <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmModal.action === 'REJECT' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
               {confirmModal.action === 'REJECT' ? <AlertTriangle size={28}/> : <CheckCircle2 size={28}/>}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmModal.action === 'VERIFY' ? 'Approve' : 'Reject'} Application?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to {confirmModal.action === 'VERIFY' ? 'verify' : 'reject'} <strong>{confirmModal.data?.FullName}</strong>?</p>
            <div className="flex gap-3">
               <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
               <button onClick={executeConfirmAction} disabled={submitting} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg ${confirmModal.action === 'REJECT' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                  {submitting ? <Loader2 className="animate-spin mx-auto"/> : 'Confirm'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;