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
  Loader2,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ 
    TotalVoters: 0, 
    VotesCast: 0, 
    Candidates: 0, 
    ActiveElections: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch Dashboard Stats and Audit Logs in parallel
      const [statsRes, logsRes] = await Promise.allSettled([
        api.get('/api/admin/dashboard'),
        api.get('/api/audit/logs')
      ]);

      // 1. Update Stats
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }

      // 2. Update Recent Activity (Last 4)
      if (logsRes.status === 'fulfilled' && logsRes.value.data.success) {
        const sortedLogs = (logsRes.value.data.data || [])
          .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp)) // Sort Newest First
          .slice(0, 4); // Take only top 4
        setActivities(sortedLogs);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time polling every 3 seconds
    const intervalId = setInterval(fetchData, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Helper to format activity messages
  const formatActivity = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  // Helper to get icon based on action type
  const getActivityIcon = (action) => {
    if (action.includes('DELETE') || action.includes('BLOCK')) return <ShieldAlert size={16} className="text-rose-400" />;
    if (action.includes('CREATE') || action.includes('REGISTER')) return <PlusIconWrapper />;
    if (action.includes('VOTE')) return <Vote size={16} className="text-emerald-400" />;
    return <FileText size={16} className="text-slate-400" />;
  };

  const PlusIconWrapper = () => <CheckCircle2 size={16} className="text-emerald-400" />;

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
    // { 
    //   title: "Candidates", 
    //   value: stats.Candidates, 
    //   trend: "Fixed", 
    //   trendUp: true,
    //   color: "text-rose-400", 
    //   bg: "bg-rose-500/10", 
    //   border: "border-rose-500/20",
    //   icon: <UserCheck size={22} /> 
    // },
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
                System Live
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
            
            <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${card.bg.replace('bg-', 'bg-').replace('/10', '')} w-2/3 opacity-50`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-indigo-400" />
                    Recent Activity
                </h3>
                <button 
                  onClick={() => navigate('/audit')}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
                  title="View All Logs"
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>
            
            <div className="space-y-4">
                {activities.length === 0 ? (
                   <div className="text-center py-8 text-slate-500 text-sm italic">
                      No recent activity recorded.
                   </div>
                ) : (
                  activities.map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/30 border border-slate-800/50 hover:border-slate-700 transition-colors animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                           {getActivityIcon(log.Action)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-200 truncate">
                                {formatActivity(log.Action)}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                By {log.ActorRole} (ID: {log.ActorID})
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <Clock size={10} />
                                {new Date(log.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                  ))
                )}
            </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20 relative">
                <div className="absolute inset-0 rounded-full border border-indigo-500 opacity-20 animate-ping"></div>
                <Users size={32} className="text-indigo-400" />
             </div>
             <h3 className="text-white font-bold text-lg mb-1">Voter Registration</h3>
             <p className="text-slate-400 text-sm mb-6">Manage the voter registry and approvals.</p>
             
             <button 
                onClick={() => navigate('/voters')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-indigo-500/20"
             >
                Manage Voters
             </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;