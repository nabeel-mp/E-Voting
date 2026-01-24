import React, { useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend 
} from 'chart.js';
import api from '../utils/api';
import { 
  Trophy, TrendingUp, Activity, RefreshCw, Award, Lock, Share2, Eye, BarChart3, ChevronDown
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Results = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [isPublished, setIsPublished] = useState(false); 
  
  const role = localStorage.getItem("role"); 
  const isSuperAdmin = role === "SUPER_ADMIN";

  const fetchElections = async () => {
      try {
          const res = await api.get('/api/admin/elections');
          if (res.data.success && res.data.data.length > 0) {
              setElections(res.data.data);
              if (!selectedElectionId) {
                  const latest = res.data.data[0];
                  setSelectedElectionId(latest.ID);
                  setIsPublished(latest.is_published);
              }
          }
      } catch (err) { console.error("Failed to load elections"); }
  };

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
          const election = elections.find(e => e.ID == selectedElectionId);
          if (election) setIsPublished(election.is_published);
          fetchResults(); 
      }
  }, [selectedElectionId, elections]);

  const handlePublishToggle = async () => {
      if(!window.confirm(`Are you sure you want to ${isPublished ? 'unpublish' : 'publish'} these results?`)) return;
      try {
          await api.post('/api/admin/elections/publish', {
              election_id: parseInt(selectedElectionId),
              is_published: !isPublished
          });
          fetchElections(); 
          alert(`Results ${!isPublished ? 'Published' : 'Unpublished'} successfully!`);
      } catch (err) {
          alert("Failed to update publish status");
      }
  };

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
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      y: {
        grid: { color: '#334155', drawBorder: false },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Election Results
          </h1>
          <div className="flex items-center gap-3 mt-2">
             <div className="relative group">
                <select 
                    value={selectedElectionId} 
                    onChange={(e) => setSelectedElectionId(e.target.value)}
                    className="appearance-none bg-slate-900 border border-slate-700 text-white text-sm rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all hover:bg-slate-800"
                >
                    {elections.map(e => (
                        <option key={e.ID} value={e.ID}>{e.title}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
             </div>
             
             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isPublished ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                {isPublished ? <Eye size={12} /> : <Lock size={12} />}
                {isPublished ? 'Published' : 'Unpublished'}
             </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
            {isSuperAdmin && (
                <button 
                    onClick={handlePublishToggle}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 transform hover:-translate-y-0.5 ${
                        isPublished 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'
                    }`}
                >
                    {isPublished ? <Lock size={18} /> : <Share2 size={18} />}
                    <span>{isPublished ? 'Unpublish' : 'Publish Results'}</span>
                </button>
            )}
            
            <button 
                onClick={fetchResults} 
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors border border-slate-700 shadow-lg"
                title="Refresh Data"
            >
               <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
      {error ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl border-dashed">
              <div className="p-6 bg-slate-800/50 rounded-full mb-6 text-slate-500 ring-1 ring-slate-700">
                  <Lock size={64} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Results Secured</h2>
              <p className="text-slate-400 text-lg max-w-md text-center leading-relaxed">The results for this election are currently being tabulated and verified. Access is restricted until official publication.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full overflow-hidden">
            
            {/* Chart Section */}
            <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><BarChart3 size={20} /></div>
                        Vote Distribution
                    </h2>
                </div>
                <div className="flex-1 relative min-h-[300px]">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
               <div className="p-6 border-b border-slate-800/60 bg-slate-900/30 flex items-center justify-between shrink-0">
                 <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Trophy size={20} /></div>
                    Leaderboard
                 </h2>
                 <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">Top Candidates</span>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                     <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 font-bold tracking-wider sticky top-0 backdrop-blur-md z-10">
                        <tr>
                           <th className="px-6 py-4">Rank</th>
                           <th className="px-6 py-4">Candidate Profile</th>
                           <th className="px-6 py-4 text-right">Total Votes</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/40 text-sm">
                        {data.sort((a, b) => b.vote_count - a.vote_count).map((r, i) => (
                           <tr key={i} className={`group transition-colors ${i === 0 ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : 'hover:bg-slate-800/30'}`}>
                              <td className="px-6 py-4">
                                 <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold shadow-sm ${
                                     i === 0 ? 'bg-amber-500 text-amber-950' : 
                                     i === 1 ? 'bg-slate-300 text-slate-900' :
                                     i === 2 ? 'bg-orange-700 text-orange-100' : 'bg-slate-800 text-slate-500'
                                 }`}>
                                    #{i + 1}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div>
                                    <p className={`font-bold text-base ${i === 0 ? 'text-indigo-300' : 'text-slate-200'}`}>{r.candidate_name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{r.party_name}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <span className={`font-mono text-lg font-bold ${i === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {r.vote_count.toLocaleString()}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
      )}
      </div>
    </div>
  );
};

export default Results;