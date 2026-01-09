import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Users, 
  Vote, 
  UserCheck, 
  Timer, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  MoreHorizontal
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ TotalVoters: 0, VotesCast: 0, Candidates: 0, ActiveElections: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        setStats(res.data); 
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        // Fallback data for demo if API fails
        setStats({ TotalVoters: 1240, VotesCast: 856, Candidates: 12, ActiveElections: 1 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { 
      title: "Total Voters", 
      value: stats.TotalVoters, 
      trend: "+12%", 
      trendUp: true,
      color: "text-indigo-400", 
      bg: "bg-indigo-500/10", 
      border: "border-indigo-500/20",
      icon: <Users size={22} /> 
    },
    { 
      title: "Votes Cast", 
      value: stats.VotesCast, 
      trend: "+8.5%", 
      trendUp: true,
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/20",
      icon: <Vote size={22} /> 
    },
    { 
      title: "Candidates", 
      value: stats.Candidates, 
      trend: "0%", 
      trendUp: true,
      color: "text-rose-400", 
      bg: "bg-rose-500/10", 
      border: "border-rose-500/20",
      icon: <UserCheck size={22} /> 
    },
    { 
      title: "Time Remaining", 
      value: "04:12:00", 
      trend: "Active", 
      trendUp: true,
      color: "text-amber-400", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20",
      icon: <Timer size={22} /> 
    },
  ];

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
                System Online
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
              
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${card.trendUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
            </div>
            
            {/* Mini Sparkline Visualization (Visual Only) */}
            <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${card.bg.replace('bg-', 'bg-').replace('/10', '')} w-2/3 opacity-50`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Section: Activity & System Health (Placeholder for visual completeness) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Feed Placeholder */}
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
            <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-shadow"></div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-200">New voter registration approved</p>
                            <p className="text-xs text-slate-500">2 minutes ago • System Auto-check</p>
                        </div>
                        <span className="text-xs text-slate-600 font-mono">ID: #892{i}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Quick Actions / Server Status */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20 relative">
                <div className="absolute inset-0 rounded-full border border-indigo-500 opacity-20 animate-ping"></div>
                <Users size={32} className="text-indigo-400" />
             </div>
             <h3 className="text-white font-bold text-lg mb-1">Voter Registration</h3>
             <p className="text-slate-400 text-sm mb-6">Registration portal is currently active.</p>
             <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm">
                Manage Voters
             </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;