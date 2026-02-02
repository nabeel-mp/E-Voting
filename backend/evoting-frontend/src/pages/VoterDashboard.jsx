import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Calendar, 
  ChevronRight, 
  Loader2, 
  MapPin, 
  Clock, 
  Vote, 
  AlertCircle,
  BarChart3,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/api/voter/elections');
        if (res.data.success) {
            setElections(res.data.data || []); 
        }
      } catch (err) {
        console.error("Failed to load elections");
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full mb-4">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-emerald-800 text-[10px] font-black uppercase tracking-widest">Official Ballot</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Your <span className="italic text-slate-400 font-light">Elections</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl font-light">
            Below are the elections available for your registered constituency. Please vote responsibly.
          </p>
        </div>
      </div>

      {/* --- EMPTY STATE --- */}
      {elections.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-100">
                <Vote className="text-slate-300" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-serif">No Active Elections</h3>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">
                There are currently no polls scheduled for your Ward, Panchayat, or District.
            </p>
        </div>
      ) : (
        /* --- ELECTION GRID --- */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {elections.map((election) => {
            // Logic to check if election has ended
            const isEnded = new Date() > new Date(election.end_date);
            const hasVoted = election.has_voted; // Check backend status
            
            return (
              <div 
                key={election.ID} 
                className={`group relative overflow-hidden rounded-[2rem] border-2 transition-all duration-300 ${
                    isEnded || hasVoted
                    ? 'bg-slate-50 border-slate-100 opacity-90' 
                    : 'bg-white border-slate-100 shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-1 hover:border-emerald-100'
                }`}
              >
                {/* Decorative Background Icon */}
                <div className={`absolute top-[-10%] right-[-5%] p-3 transition-opacity ${
                    isEnded || hasVoted ? 'opacity-5 grayscale' : 'opacity-10 group-hover:opacity-15'
                }`}>
                    {hasVoted ? <CheckCircle2 size={180} className="text-emerald-600"/> : <Vote size={180} className={isEnded ? "text-slate-400" : "text-emerald-600"} />}
                </div>

                <div className="relative z-10 p-8 flex flex-col h-full">
                    
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-6">
                        {isEnded ? (
                            <span className="bg-slate-200 text-slate-600 border border-slate-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <XCircle size={12} /> Voting Closed
                            </span>
                        ) : hasVoted ? (
                            <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={12} /> Vote Recorded
                            </span>
                        ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Poll
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                        <h2 className={`text-2xl font-bold mb-3 ${isEnded || hasVoted ? 'text-slate-500' : 'text-slate-900'}`}>
                            {election.title}
                        </h2>
                        <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed">
                            {election.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className={`p-4 rounded-2xl border ${isEnded || hasVoted ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <MapPin size={10}/> Jurisdiction
                                </p>
                                <p className={`text-sm font-bold truncate ${isEnded || hasVoted ? 'text-slate-500' : 'text-slate-800'}`}>
                                    {election.district}
                                </p>
                            </div>
                            <div className={`p-4 rounded-2xl border ${isEnded || hasVoted ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Clock size={10}/> {isEnded ? "Ended On" : "Ends At"}
                                </p>
                                <p className={`text-sm font-bold ${isEnded || hasVoted ? 'text-slate-500' : 'text-slate-800'}`}>
                                    {new Date(election.end_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {isEnded ? (
                        <button 
                            disabled
                            className="w-full py-4 bg-slate-200 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-300"
                        >
                            <BarChart3 size={18} /> Results Pending
                        </button>
                    ) : hasVoted ? (
                        <button 
                            disabled
                            className="w-full py-4 bg-emerald-100 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-emerald-200"
                        >
                            <CheckCircle2 size={18} /> Vote Cast
                        </button>
                    ) : (
                        <button 
                            onClick={() => navigate(`/portal/vote/${election.ID}`)}
                            className="w-full py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-xl shadow-slate-900/10 hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                            Enter Voting Booth 
                            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                        </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VoterDashboard;
