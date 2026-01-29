import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, ChevronRight, Loader2, MapPin, Clock, Vote, AlertCircle } from 'lucide-react';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/api/voter/elections');
        if (res.data.success) setElections(res.data.data);
      } catch (err) {
        console.error("Failed to load elections");
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Your Elections</h1>
        <p className="text-slate-400 mt-1">Elections you are eligible to vote in based on your registered location.</p>
      </div>

      {elections.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="text-slate-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">No Elections Found</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">There are currently no active elections scheduled for your Ward, Panchayat, or District.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((election) => (
            <div key={election.ID} className="group bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-300 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Vote size={100} className="text-emerald-500" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Live Now
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-1">{election.title}</h2>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">{election.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><MapPin size={10}/> Jurisdiction</p>
                            <p className="text-xs font-medium text-slate-200 truncate">{election.district}</p>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1"><Clock size={10}/> Ends At</p>
                            <p className="text-xs font-medium text-slate-200">{new Date(election.end_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate(`/portal/vote/${election.ID}`)}
                        className="w-full py-3.5 bg-white text-slate-950 hover:bg-emerald-400 hover:text-emerald-950 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        Enter Voting Booth <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoterDashboard;