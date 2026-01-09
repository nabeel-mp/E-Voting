import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, 
  Vote, 
  UserCheck, 
  Timer, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  MoreHorizontal,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Initial state set to 0/empty (no mock data)
  const [stats, setStats] = useState({ 
    TotalVoters: 0, 
    VotesCast: 0, 
    Candidates: 0, 
    ActiveElections: 0,
    TimeRemaining: 'N/A' // Assuming API might send this, or calculate based on election end time
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Ensure this endpoint returns the exact keys matching state
      const res = await api.get('/api/admin/dashboard');
      if(res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      // No fallback mock data here anymore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Fetch
    fetchData();

    // 2. Real-time Polling (Refresh every 5 seconds)
    const intervalId = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const cards = [
    { 
      title: "Total Voters", 
      value: stats.TotalVoters, 
      trend: "Live", 
      trendUp: true,
      color: "text-indigo-400", 
      bg: "bg-indigo-500/10", 
      border: "border-indigo-500/20",
      icon: <Users size={22} /> 
    },
    { 
      title: "Votes Cast", 
      value: stats.VotesCast, 
      trend: "Updating", 
      trendUp: true,
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/20",
      icon: <Vote size={22} /> 
    },
    { 
      title: "Candidates", 
      value: stats.Candidates, 
      trend: "Fixed", 
      trendUp: true,
      color: "text-rose-400", 
      bg: "bg-rose-500/10", 
      border: "border-rose-500/20",
      icon: <UserCheck size={22} /> 
    },
    { 
      title: "Active Elections", 
      value: stats.ActiveElections, 
      trend: stats.ActiveElections > 0 ? "Active" : "Inactive", 
      trendUp: stats.ActiveElections > 0,
      color: "text-amber-400", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20",
      icon: <Timer size={22} /> 
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Real-time insights and performance monitoring.</p>
        </div>
        <div className="flex gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Updates Active
            </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`group bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl relative overflow-hidden`}
          >
             {/* Decorative Gradient Blob */}
             <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${card.bg.replace('/10', '')}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} border ${card.border}`}>
                {card.icon}
              </div>
              
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${card.trendUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
            </div>
            
            {/* Visual Bar */}
            <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${card.bg.replace('bg-', 'bg-').replace('/10', '')} w-2/3 opacity-50`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-indigo-400" />
                    Recent Activity
                </h3>
                <button className="text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
            
            {/* Note: This assumes the API might send an 'activities' array in stats, 
                otherwise this section is static. Modify to map real data if available. */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl transition-colors">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div className="flex-1">
                        <p className="text-sm text-slate-200">System Dashboard Initialized</p>
                        <p className="text-xs text-slate-500">Monitoring real-time data</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Actions / Server Status */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20 relative">
                <div className="absolute inset-0 rounded-full border border-indigo-500 opacity-20 animate-ping"></div>
                <Users size={32} className="text-indigo-400" />
             </div>
             <h3 className="text-white font-bold text-lg mb-1">Voter Registration</h3>
             <p className="text-slate-400 text-sm mb-6">Manage the voter registry and approvals.</p>
             
             {/* Manage Voters Navigation Button */}
             <button 
                onClick={() => navigate('/voters')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
             >
                Manage Voters
             </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;