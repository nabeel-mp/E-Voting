import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Loader2, AlertTriangle, CheckCircle2, Lock, Vote, Ban } from 'lucide-react';

const VotingBooth = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false); // New state for access control

  // --- AUDIO HELPER: EVM Beep Sound ---
  const playBeep = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Square wave sounds like a digital machine beep
        oscillator.type = 'square'; 
        oscillator.frequency.setValueAtTime(800, ctx.currentTime); // High pitch beep
        
        // 2 Second Duration
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 2);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/voter/elections/${id}/candidates`);
        if (res.data.success) {
            setCandidates(res.data.data || []);
        }
      } catch (err) {
        // If API returns error, assume access denied / already voted
        console.error("Failed to load candidates", err);
        setAlreadyVoted(true); 
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
            // 1. Play EVM Beep
            playBeep();

            // 2. Freeze for 2 seconds (simulating machine process)
            setTimeout(() => {
                setSuccess(res.data.data);
                setSubmitting(false);
            }, 2000);
        }
    } catch (err) {
        alert(err.response?.data?.error || "Voting Failed");
        setSubmitting(false);
    }
  };

  // --- VIEW: ALREADY VOTED / NO ENTRY ---
  if (alreadyVoted) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 border-4 border-rose-50">
                <Ban size={48} className="text-rose-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">No Entry!</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                Our records indicate you have already cast your vote for this election. 
                Multiple voting is strictly prohibited.
            </p>
            <button onClick={() => navigate('/portal')} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors">
                Return to Dashboard
            </button>
        </div>
      );
  }

  // --- VIEW: SUCCESS RECEIPT ---
  if (success) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Vote Cast Successfully!</h1>
              <p className="text-slate-500 mb-8">Your vote has been recorded </p>
              
              <button onClick={() => navigate('/portal')} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors">
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
            <h1 className="text-2xl font-bold text-slate-900">Ballot Paper</h1>
            <p className="text-slate-500 text-sm">Select one candidate to cast your vote.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-100">
            <Lock size={14} /> Secure Connection
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map(candidate => (
            <div 
                key={candidate.ID}
                onClick={() => !submitting && setSelectedCandidate(candidate)}
                className={`cursor-pointer p-1 rounded-2xl transition-all duration-300 ${
                    selectedCandidate?.ID === candidate.ID 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/20 scale-[1.02]' 
                    : 'bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md'
                } ${submitting ? 'opacity-50 pointer-events-none grayscale' : ''}`}
            >
                <div className={`h-full p-5 rounded-xl flex items-center gap-5 relative overflow-hidden ${
                    selectedCandidate?.ID === candidate.ID ? 'bg-slate-900 border-transparent' : 'bg-white'
                }`}>
                    {/* Selection Indicator */}
                    {selectedCandidate?.ID === candidate.ID && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold">SELECTED</div>
                    )}

                    <div className={`w-16 h-16 rounded-full border-2 overflow-hidden shrink-0 ${
                        selectedCandidate?.ID === candidate.ID ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                    }`}>
                       {candidate.photo ? (
                           <img src={`http://localhost:8080${candidate.photo}`} className="w-full h-full object-cover" alt={candidate.full_name} />
                       ) : (
                           <div className={`w-full h-full flex items-center justify-center font-bold text-xl ${
                               selectedCandidate?.ID === candidate.ID ? 'text-slate-400' : 'text-slate-300'
                           }`}>{candidate.full_name[0]}</div>
                       )}
                    </div>
                    
                    <div>
                        <h3 className={`text-lg font-bold ${
                            selectedCandidate?.ID === candidate.ID ? 'text-white' : 'text-slate-900'
                        }`}>{candidate.full_name}</h3>
                        
                        <div className="flex items-center gap-2 mt-1">
                            {candidate.party?.logo ? (
                                <img src={`http://localhost:8080${candidate.party.logo}`} className="w-5 h-5 object-contain" alt="Party Logo" />
                            ) : null}
                            <span className={`text-sm font-medium ${
                                selectedCandidate?.ID === candidate.ID ? 'text-slate-400' : 'text-slate-500'
                            }`}>{candidate.party?.name || 'Independent'}</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 z-40">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div className="hidden sm:block">
                  <p className="text-sm text-slate-500">Selected: <span className="text-slate-900 font-bold">{selectedCandidate ? selectedCandidate.full_name : 'None'}</span></p>
              </div>
              <button 
                onClick={castVote}
                disabled={!selectedCandidate || submitting}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                    <>
                        <Loader2 className="animate-spin" /> Recording Vote...
                    </>
                ) : (
                    <>
                        <Vote /> Confirm Vote
                    </>
                )} 
              </button>
          </div>
      </div>
    </div>
  );
};

export default VotingBooth;