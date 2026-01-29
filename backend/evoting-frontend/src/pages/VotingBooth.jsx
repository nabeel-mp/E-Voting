import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Loader2, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

const VotingBooth = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/voter/elections/${id}/candidates`);
        if (res.data.success) setCandidates(res.data.data);
      } catch (err) {
        console.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const castVote = async () => {
    if(!selectedCandidate) return;
    if(!window.confirm(`Confirm vote for ${selectedCandidate.full_name}? This cannot be changed.`)) return;

    setSubmitting(true);
    try {
        const res = await api.post('/api/voter/vote', {
            election_id: parseInt(id),
            candidate_id: selectedCandidate.ID
        });
        if(res.data.success) {
            setSuccess(res.data.data);
        }
    } catch (err) {
        alert(err.response?.data?.error || "Voting Failed");
    } finally {
        setSubmitting(false);
    }
  };

  if (success) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Vote Cast Successfully!</h1>
              <p className="text-slate-400 mb-8">Your vote has been recorded and is being written to the blockchain.</p>
              
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full mb-8">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Digital Receipt Hash</p>
                  <code className="text-xs text-indigo-300 break-all font-mono bg-slate-950 p-3 rounded-lg block border border-indigo-500/20">
                      {success.receipt}
                  </code>
              </div>

              <button onClick={() => navigate('/portal')} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                  Return to Dashboard
              </button>
          </div>
      )
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-white">Ballot Paper</h1>
            <p className="text-slate-400 text-sm">Select one candidate to cast your vote.</p>
        </div>
        <div className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-500/20">
            <Lock size={14} /> Secure Connection
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map(candidate => (
            <div 
                key={candidate.ID}
                onClick={() => setSelectedCandidate(candidate)}
                className={`cursor-pointer p-1 rounded-2xl transition-all duration-300 ${
                    selectedCandidate?.ID === candidate.ID 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 scale-[1.02]' 
                    : 'bg-transparent hover:bg-slate-800'
                }`}
            >
                <div className="bg-slate-900 h-full p-5 rounded-xl border border-slate-800 flex items-center gap-5 relative overflow-hidden">
                    {/* Selection Indicator */}
                    {selectedCandidate?.ID === candidate.ID && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold">SELECTED</div>
                    )}

                    <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden shrink-0">
                       {candidate.photo ? (
                           <img src={`http://localhost:8080${candidate.photo}`} className="w-full h-full object-cover" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xl">{candidate.full_name[0]}</div>
                       )}
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-white">{candidate.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {candidate.party?.logo ? (
                                <img src={`http://localhost:8080${candidate.party.logo}`} className="w-5 h-5 object-contain" />
                            ) : null}
                            <span className="text-sm text-slate-400 font-medium">{candidate.party?.name || 'Independent'}</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 p-4 z-40">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div className="hidden sm:block">
                  <p className="text-sm text-slate-400">Selected: <span className="text-white font-bold">{selectedCandidate ? selectedCandidate.full_name : 'None'}</span></p>
              </div>
              <button 
                onClick={castVote}
                disabled={!selectedCandidate || submitting}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Vote />} 
                Confirm Vote
              </button>
          </div>
      </div>
    </div>
  );
};

export default VotingBooth;