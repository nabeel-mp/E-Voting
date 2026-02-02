import React, { useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend 
} from 'chart.js';
import api from '../utils/api';
import { 
  Trophy, RefreshCw, Lock, Share2, Eye, BarChart3, ChevronDown, AlertCircle
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

  // Updated Colors for Light Theme
  const chartData = {
    labels: data.map(d => d.candidate_name),
    datasets: [{
      label: 'Votes Cast',
      data: data.map(d => d.vote_count),
      backgroundColor: data.map(d => d.candidate_name === leadingCandidate?.candidate_name ? '#4f46e5' : '#cbd5e1'), // Indigo-600 vs Slate-300
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 'flex',
      maxBarThickness: 40,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b', // Slate-800
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9', drawBorder: false }, // Slate-100
        ticks: { color: '#64748b', font: { family: 'sans-serif', size: 11 } }, // Slate-500
        beginAtZero: true
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'sans-serif', size: 11, weight: '500' } }
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-6 md:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <BarChart3 size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Analytics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Election <span className="italic text-slate-400 font-light">Results</span>
          </h1>
          
          <div className="flex items-center gap-4 mt-4">
             <div className="relative group min-w-[200px]">
                <select 
                    value={selectedElectionId} 
                    onChange={(e) => setSelectedElectionId(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all shadow-sm hover:border-slate-300"
                >
                    {elections.map(e => (
                        <option key={e.ID} value={e.ID}>{e.title}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
             </div>
             
             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                {isPublished ? <Eye size={12} /> : <Lock size={12} />}
                {isPublished ? 'Publicly Visible' : 'Internal Draft'}
             </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
            {isSuperAdmin && (
                <button 
                    onClick={handlePublishToggle}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 transform hover:-translate-y-0.5 ${
                        isPublished 
                        ? 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'
                    }`}
                >
                    {isPublished ? <Lock size={18} /> : <Share2 size={18} />}
                    <span>{isPublished ? 'Unpublish Results' : 'Publish Results'}</span>
                </button>
            )}
            
            <button 
                onClick={fetchResults} 
                className="p-3 bg-white hover:bg-slate-50 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200 shadow-sm hover:shadow-md"
                title="Refresh Data"
            >
               <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
      {error ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[2.5rem] border-dashed py-24">
              <div className="p-6 bg-slate-50 rounded-full mb-6 text-slate-400 ring-1 ring-slate-100">
                  <Lock size={64} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3 font-serif">Results Secured</h2>
              <p className="text-slate-500 text-lg max-w-md text-center leading-relaxed">The results for this election are currently being tabulated and verified. Access is restricted until official publication.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
            
            {/* Chart Section */}
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><BarChart3 size={20} /></div>
                        Vote Distribution 
                    </h2>
                </div>
                <div className="flex-1 relative min-h-[350px] w-full">
                    {data.length > 0 ? (
                        <Bar data={chartData} options={chartOptions} />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-2">
                            <AlertCircle size={32} className="opacity-50"/>
                            <span>No votes recorded yet</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col h-full">
               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                   <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Trophy size={20} /></div>
                   Leaderboard
                 </h2>
                 <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-lg">Top Candidates</span>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider sticky top-0 backdrop-blur-md z-10 border-b border-slate-100">
                        <tr>
                           <th className="px-8 py-4">Rank</th>
                           <th className="px-6 py-4">Candidate Profile</th>
                           <th className="px-8 py-4 text-right">Total Votes</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 text-sm">
                        {data.length === 0 ? (
                            <tr><td colSpan="3" className="px-8 py-12 text-center text-slate-400 italic">No data available</td></tr>
                        ) : (
                            data.sort((a, b) => b.vote_count - a.vote_count).map((r, i) => (
                               <tr key={i} className={`group transition-colors ${i === 0 ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                  <td className="px-8 py-5">
                                     <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold shadow-sm border ${
                                         i === 0 ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                         i === 1 ? 'bg-slate-200 text-slate-600 border-slate-300' :
                                         i === 2 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-slate-400 border-slate-200'
                                     }`}>
                                         #{i + 1}
                                     </div>
                                  </td>
                                  <td className="px-6 py-5">
                                     <div>
                                        <p className={`font-bold text-base ${i === 0 ? 'text-indigo-900' : 'text-slate-800'}`}>{r.candidate_name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{r.party_name}</p>
                                     </div>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                     <span className={`font-mono text-lg font-bold ${i === 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                        {r.vote_count.toLocaleString()}
                                     </span>
                                  </td>
                               </tr>
                            ))
                        )}
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