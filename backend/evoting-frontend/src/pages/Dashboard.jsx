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
  Loader2,
  Zap,
  Calendar,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ 
    TotalVoters: 0, 
    VotesCast: 0, 
    Candidates: 0, 
    ActiveElections: 0
  });
  const [activeElectionsList, setActiveElectionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, electionsRes] = await Promise.allSettled([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/elections')
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }

      if (electionsRes.status === 'fulfilled' && electionsRes.value.data.success) {
        // Filter for active elections only
        const active = (electionsRes.value.data.data || []).filter(e => e.is_active);
        setActiveElectionsList(active);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const cards = [
    { 
      title: "Total Voters", 
      value: stats.TotalVoters, 
      trend: "Registered", 
      trendUp: true,
      color: "text-indigo-400", 
      bg: "bg-indigo-500/10", 
      border: "border-indigo-500/20",
      barColor: "bg-indigo-500",
      icon: <Users size={24} /> 
    },
    { 
      title: "Votes Cast", 
      value: stats.VotesCast, 
      trend: "Live Count", 
      trendUp: true,
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/20",
      barColor: "bg-emerald-500",
      icon: <Vote size={24} /> 
    },
    { 
      title: "Candidates", 
      value: stats.Candidates, 
      trend: "Contesting", 
      trendUp: true,
      color: "text-rose-400", 
      bg: "bg-rose-500/10", 
      border: "border-rose-500/20",
      barColor: "bg-rose-500",
      icon: <UserCheck size={24} /> 
    },
    { 
      title: "Active Elections", 
      value: stats.ActiveElections, 
      trend: stats.ActiveElections > 0 ? "Running" : "Inactive", 
      trendUp: stats.ActiveElections > 0,
      color: "text-amber-400", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20",
      barColor: "bg-amber-500",
      icon: <Timer size={24} /> 
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-slate-500 text-sm font-medium animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Real-time insights and system performance monitoring.
          </p>
        </div>
        <div className="flex gap-3">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/10 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                SYSTEM LIVE
            </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`group bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden`}
          >
             {/* Decorative Blur */}
             <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${card.barColor}`}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3.5 rounded-2xl ${card.bg} ${card.color} border ${card.border} shadow-lg`}>
                {card.icon}
              </div>
              
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${card.trendUp ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10' : 'text-slate-400 bg-slate-500/10 border border-slate-500/10'}`}>
                {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{card.title}</h3>
                <p className="text-4xl font-extrabold text-white tracking-tight">{card.value}</p>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="mt-6 h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${card.barColor} w-2/3 opacity-60 group-hover:w-full transition-all duration-1000 ease-out`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Section: Active Elections & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left: Active Elections Overview */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden h-full min-h-[400px]">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/30">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Calendar size={20} /></div>
                    Running Elections
                </h3>
                <button 
                  onClick={() => navigate('/elections')}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"
                >
                    View All <ChevronRight size={12} />
                </button>
            </div>
            
            {/* List */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                {activeElectionsList.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                      <div className="p-4 bg-slate-800/50 rounded-full"><AlertCircle size={32} className="opacity-50" /></div>
                      <span className="text-sm italic">No active elections at the moment.</span>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeElectionsList.map((election) => (
                      <div key={election.ID} className="group flex flex-col p-5 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer" onClick={() => navigate('/elections')}>
                          <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                {election.election_type}
                              </span>
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                          </div>
                          
                          <h4 className="text-white font-bold text-lg mb-1 truncate pr-2 group-hover:text-indigo-400 transition-colors">
                              {election.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 text-slate-500 text-xs mt-auto">
                              <Timer size={14} />
                              <span>Ends: {new Date(election.end_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-2xl overflow-hidden group min-h-[400px]">
             
             {/* Decorative Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-slate-900/80 pointer-events-none"></div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>

             <div className="relative z-10 w-full flex flex-col items-center">
                 <div className="w-24 h-24 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-8 shadow-2xl relative group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-3xl border border-indigo-500/30 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                    <Users size={48} className="text-indigo-400" />
                 </div>
                 
                 <h3 className="text-white font-bold text-2xl mb-3">Voter Registration</h3>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xs">
                    Quickly access the voter registry to approve pending requests or manage existing records.
                 </p>
                 
                 <button 
                    onClick={() => navigate('/voters')}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                 >
                    <Zap size={18} className="group-hover/btn:fill-white" /> Manage Voters
                 </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;