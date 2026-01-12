import React, { useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend 
} from 'chart.js';
import api from '../utils/api';
import { 
  Trophy, TrendingUp, Activity, RefreshCw, Award, Lock, Share2 
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Results = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Track errors (e.g., "Not Published")
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [isPublished, setIsPublished] = useState(false); // Track publish status
  
  // Check Role
  const role = localStorage.getItem("role"); // Assuming role is stored here
  const isSuperAdmin = role === "SUPER_ADMIN";

  // 1. Fetch Election List (to get IDs and Status)
  const fetchElections = async () => {
      try {
          const res = await api.get('/api/admin/elections');
          if (res.data.success && res.data.data.length > 0) {
              setElections(res.data.data);
              // Default to first election if none selected
              if (!selectedElectionId) {
                  const latest = res.data.data[0];
                  setSelectedElectionId(latest.ID);
                  setIsPublished(latest.is_published);
              }
          }
      } catch (err) { console.error("Failed to load elections"); }
  };

  // 2. Fetch Results
  const fetchResults = async () => {
    if (!selectedElectionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/admin/election-results?election_id=${selectedElectionId}`);
      if (res.data.success) {
        setData(res.data.data || []);
      }
    } catch (e) {
      // If backend returns 403 (Not Published), we catch it here
      if (e.response && e.response.status === 403) {
          setError("Results have not been published yet.");
      } else {
          console.error("Failed to fetch results", e);
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchElections(); }, []);
  
  useEffect(() => { 
      if(selectedElectionId) {
          // Update local published state from election list
          const election = elections.find(e => e.ID == selectedElectionId);
          if (election) setIsPublished(election.is_published);
          fetchResults(); 
      }
  }, [selectedElectionId, elections]);

  // 3. Handle Publish Action
  const handlePublishToggle = async () => {
      if(!window.confirm(`Are you sure you want to ${isPublished ? 'unpublish' : 'publish'} these results?`)) return;
      try {
          await api.post('/api/admin/elections/publish', {
              election_id: parseInt(selectedElectionId),
              is_published: !isPublished
          });
          // Refresh data
          fetchElections(); 
          alert(`Results ${!isPublished ? 'Published' : 'Unpublished'} successfully!`);
      } catch (err) {
          alert("Failed to update publish status");
      }
  };

  // --- Derived Stats ---
  const totalVotes = useMemo(() => data.reduce((acc, curr) => acc + (curr.vote_count || 0), 0), [data]);
  const leadingCandidate = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((prev, current) => (prev.vote_count > current.vote_count) ? prev : current);
  }, [data]);

  const chartData = {
    labels: data.map(d => d.candidate_name),
    datasets: [{
      label: 'Votes Cast',
      data: data.map(d => d.vote_count),
      backgroundColor: data.map(d => d.candidate_name === leadingCandidate?.candidate_name ? '#6366f1' : '#334155'),
      borderRadius: 6,
    }]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Election Results</h1>
          
          {/* Election Selector */}
          <div className="mt-2 flex items-center gap-2">
              <select 
                value={selectedElectionId} 
                onChange={(e) => setSelectedElectionId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                  {elections.map(e => (
                      <option key={e.ID} value={e.ID}>{e.title}</option>
                  ))}
              </select>
              
              {/* Status Badge */}
              <span className={`text-xs px-2 py-1 rounded-full border font-bold uppercase ${isPublished ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {isPublished ? 'Published' : 'Unpublished'}
              </span>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="flex gap-3 items-center">
            {isSuperAdmin && (
                <button 
                    onClick={handlePublishToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${
                        isPublished 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                    }`}
                >
                    {isPublished ? <Lock size={18} /> : <Share2 size={18} />}
                    {isPublished ? 'Unpublish Results' : 'Publish to Everyone'}
                </button>
            )}
            
            {/* Simple Refresh */}
            <button onClick={fetchResults} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors">
               <RefreshCw size={20} />
            </button>
        </div>
      </div>

      {/* Access Denied View (For Voters when not published) */}
      {error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
              <div className="p-4 bg-slate-800 rounded-full mb-4 text-slate-500">
                  <Lock size={48} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Results Not Yet Available</h2>
              <p className="text-slate-400">The results for this election are currently being tabulated and verified.</p>
              <p className="text-slate-500 text-sm mt-2">Please check back later.</p>
          </div>
      ) : (
          /* Main Content (Charts & Tables) */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-3 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-indigo-400" size={20} />
                        Vote Distribution
                    </h2>
                </div>
                <div className="flex-1 relative">
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
               <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="text-emerald-400" size={20} />
                    Leaderboard
                 </h2>
               </div>
               <div className="flex-1 overflow-y-auto max-h-[400px]">
                  <table className="w-full text-left">
                     <thead className="bg-slate-950/30 text-xs uppercase text-slate-500 font-semibold sticky top-0 backdrop-blur-md">
                        <tr>
                           <th className="px-6 py-3">Candidate</th>
                           <th className="px-6 py-3 text-right">Votes</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                        {data.sort((a, b) => b.vote_count - a.vote_count).map((r, i) => (
                           <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded text-xs font-bold text-slate-500">#{i + 1}</span>
                                    <div>
                                       <p className="font-bold text-slate-300">{r.candidate_name}</p>
                                       <p className="text-xs text-slate-500">{r.party_name}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono font-bold text-white">{r.vote_count}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default Results;