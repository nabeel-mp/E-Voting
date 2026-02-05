import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
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
  AlertCircle,
  Activity,
  ShieldCheck
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState({ 
    TotalVoters: 0, 
    VotesCast: 0, 
    Candidates: 0, 
    ActiveElections: 0
  });
  const [activeElectionsList, setActiveElectionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use a ref to prevent WebSocket double-connection in React Strict Mode (optional safety)
  const wsRef = useRef(null);

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

    // --- WEBSOCKET SETUP ---
    // Establish connection to the backend real-time endpoint
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return; 
    }
    const wsUrl = 'ws://localhost:8080/ws/notifications';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to Real-time Notifications");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle Vote Cast Event
        if (data.type === "VOTE_CAST") {
          // 1. Show Success Notification
          addToast(`New vote cast in ${data.election}!`, 'success');
          
          // 2. Refresh Dashboard Data Immediately
          fetchData();
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from Notifications");
    };

    ws.onerror = (error) => {
      // In development, this might log if the server isn't running yet
      console.log("WebSocket connection status:", ws.readyState);
    };

    // Fallback polling (every 10 seconds instead of 5, since we have WS)
    const intervalId = setInterval(fetchData, 10000);

    return () => {
      clearInterval(intervalId);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current =null;
      }
    };
  }, [addToast]); // Added addToast to dependencies

  const cards = [
    { 
      title: "Total Voters", 
      value: stats.TotalVoters, 
      trend: "Registered", 
      trendUp: true,
      // Light theme colors
      color: "text-indigo-600", 
      bg: "bg-indigo-50", 
      border: "border-indigo-100",
      icon: <Users size={24} /> 
    },
    { 
      title: "Votes Cast", 
      value: stats.VotesCast, 
      trend: "Live Count", 
      trendUp: true,
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      border: "border-emerald-100",
      icon: <Vote size={24} /> 
    },
    { 
      title: "Candidates", 
      value: stats.Candidates, 
      trend: "Contesting", 
      trendUp: true,
      color: "text-rose-600", 
      bg: "bg-rose-50", 
      border: "border-rose-100",
      icon: <UserCheck size={24} /> 
    },
    { 
      title: "Active Elections", 
      value: stats.ActiveElections, 
      trend: stats.ActiveElections > 0 ? "Running" : "Inactive", 
      trendUp: stats.ActiveElections > 0,
      color: "text-amber-600", 
      bg: "bg-amber-50", 
      border: "border-amber-100",
      icon: <Timer size={24} /> 
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-500 text-sm font-medium animate-pulse">Initializing Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 min-h-screen bg-[#f8fafc] p-6 md:p-10">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <ShieldCheck size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Admin Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            System <span className="italic text-slate-400 font-light">Overview</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Real-time monitoring of the electoral process and voter statistics.
          </p>
        </div>
        <div className="flex gap-3">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                LIVE STATUS: ONLINE
            </span>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-slate-200 transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 relative overflow-hidden"
          >
             {/* Decorative Background Icon */}
             <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 transform rotate-12 scale-150 text-slate-900">
                {card.icon}
             </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3.5 rounded-2xl ${card.bg} ${card.color} border ${card.border} shadow-sm`}>
                {card.icon}
              </div>
              
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${card.trendUp ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-slate-500 bg-slate-50 border border-slate-100'}`}>
                {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">{card.title}</h3>
                <p className="text-4xl font-serif font-bold text-slate-900 tracking-tight">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- CONTENT SECTION: Active Elections & Quick Actions --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Active Elections Overview */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 flex flex-col overflow-hidden min-h-[450px]">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 font-serif">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100"><Calendar size={20} /></div>
                    Running Elections
                </h3>
                <button 
                  onClick={() => navigate('/admin/elections')}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-100 shadow-sm"
                >
                    View All <ChevronRight size={12} />
                </button>
            </div>
            
            {/* List */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {activeElectionsList.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 py-10">
                      <div className="p-6 bg-slate-50 rounded-full"><AlertCircle size={40} className="text-slate-300" /></div>
                      <span className="text-sm font-medium">No active elections at the moment.</span>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeElectionsList.map((election) => (
                      <div 
                        key={election.ID} 
                        onClick={() => navigate('/admin/elections')}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-sm hover:shadow-md" 
                      >
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    {election.election_type}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                      <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                      </span>
                                      LIVE
                                  </div>
                              </div>
                              <h4 className="text-slate-900 font-bold text-lg group-hover:text-indigo-700 transition-colors">
                                  {election.title}
                              </h4>
                          </div>

                          <div className="mt-4 md:mt-0 flex items-center gap-4">
                              <div className="text-right">
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Ends At</p>
                                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 justify-end">
                                      <Timer size={14} className="text-slate-400"/>
                                      {new Date(election.end_date).toLocaleDateString()}
                                  </p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <ChevronRight size={16} />
                              </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="relative bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl shadow-slate-200/50 overflow-hidden group min-h-[450px]">
             
             {/* Decorative Background */}
             <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-100 transition-all duration-700"></div>
             <div className="absolute bottom-[-20%] left-[-20%] w-64 h-64 bg-violet-50 rounded-full blur-3xl pointer-events-none"></div>

             <div className="relative z-10 w-full flex flex-col items-center">
                 <div className="w-24 h-24 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center mb-8 shadow-xl shadow-indigo-100 relative group-hover:-translate-y-2 transition-transform duration-500">
                    <Activity size={48} className="text-indigo-500" />
                 </div>
                 
                 <h3 className="text-slate-900 font-serif font-bold text-2xl mb-3">Voter Registration</h3>
                 <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs font-medium">
                   Quickly access the voter registry to approve pending requests or manage existing records.
                 </p>
                 
                 <button 
                   onClick={() => navigate('/admin/voters')}
                   className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
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