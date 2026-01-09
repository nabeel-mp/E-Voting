import React, { useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import api from '../utils/api';
import { 
  Trophy, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Users,
  Award
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Results = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const res = await api.get('/api/admin/election-results');
      if (res.data.success) {
        setData(res.data.data || []);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch results", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // --- Derived Stats ---
  const totalVotes = useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.vote_count || 0), 0);
  }, [data]);

  const leadingCandidate = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((prev, current) => 
      (prev.vote_count > current.vote_count) ? prev : current
    );
  }, [data]);

  // --- Chart Configuration ---
  const chartData = {
    labels: data.map(d => d.candidate_name),
    datasets: [{
      label: 'Votes Cast',
      data: data.map(d => d.vote_count),
      backgroundColor: data.map(d => 
        d.candidate_name === leadingCandidate?.candidate_name 
          ? '#6366f1' // Indigo for winner
          : '#334155' // Slate for others
      ),
      borderRadius: 6,
      barThickness: 40,
      hoverBackgroundColor: '#818cf8',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#334155', drawBorder: false },
        ticks: { color: '#94a3b8', font: { family: 'sans-serif', size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#cbd5e1', font: { weight: 'bold' } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Election Results</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Live
            </span>
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
            <button onClick={fetchData} className="p-1 hover:bg-slate-800 rounded-full transition-colors" title="Force Refresh">
               <RefreshCw size={12} />
            </button>
          </p>
        </div>

        {/* Top Cards (Total Votes & Winner) */}
        <div className="flex gap-4">
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 min-w-[180px]">
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Activity size={24} />
                </div>
                <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Total Votes</p>
                    <p className="text-2xl font-bold text-white">{totalVotes.toLocaleString()}</p>
                </div>
            </div>
            
            {leadingCandidate && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-4 min-w-[200px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/20 blur-2xl rounded-full"></div>
                    <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400 z-10">
                        <Trophy size={24} />
                    </div>
                    <div className="z-10">
                        <p className="text-amber-500/80 text-xs uppercase font-bold">Current Leader</p>
                        <p className="text-xl font-bold text-white truncate max-w-[120px]">{leadingCandidate.candidate_name}</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        
        {/* Left: Main Chart (3 Columns) */}
        <div className="lg:col-span-3 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-indigo-400" size={20} />
                Live Vote Distribution
             </h2>
          </div>
          <div className="flex-1 min-h-[300px] relative">
             <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Leaderboard Table (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-0 shadow-xl overflow-hidden flex flex-col">
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
                       <th className="px-6 py-3 text-right">% Share</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/50">
                    {data
                      .sort((a, b) => b.vote_count - a.vote_count) // Sort by votes desc
                      .map((r, i) => {
                        const percentage = totalVotes > 0 ? ((r.vote_count / totalVotes) * 100).toFixed(1) : 0;
                        const isWinner = i === 0;

                        return (
                           <tr key={i} className={`group transition-colors ${isWinner ? 'bg-indigo-900/10 hover:bg-indigo-900/20' : 'hover:bg-slate-800/30'}`}>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${isWinner ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                       #{i + 1}
                                    </span>
                                    <div>
                                       <p className={`font-bold ${isWinner ? 'text-white' : 'text-slate-300'}`}>{r.candidate_name}</p>
                                       <p className="text-xs text-slate-500">{r.party_name}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <span className="font-mono font-bold text-white text-lg">{r.vote_count}</span>
                              </td>
                              <td className="px-6 py-4 w-32">
                                 <div className="text-right mb-1 text-xs text-slate-400 font-mono">{percentage}%</div>
                                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                       className={`h-full rounded-full ${isWinner ? 'bg-indigo-500' : 'bg-slate-600'}`} 
                                       style={{ width: `${percentage}%` }}
                                    ></div>
                                 </div>
                              </td>
                           </tr>
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                Waiting for data...
                            </td>
                        </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Results;