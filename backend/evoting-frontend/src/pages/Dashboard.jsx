import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Users, Vote, UserCheck, Timer } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ TotalVoters: 0, VotesCast: 0, Candidates: 0, ActiveElections: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        // Note: Your backend returns HTML for this route in routes.go. 
        // You MUST change routes.go to return JSON for this endpoint or create a new JSON endpoint.
        // Assuming you fixed backend to return JSON:
        setStats(res.data); 
      } catch (err) {
        console.error("Failed to load dashboard data");
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: "Total Voters", value: stats.TotalVoters, color: "indigo", icon: <Users /> },
    { title: "Votes Cast", value: stats.VotesCast, color: "emerald", icon: <Vote /> },
    { title: "Candidates", value: stats.Candidates, color: "rose", icon: <UserCheck /> },
    { title: "Active Elections", value: stats.ActiveElections, color: "amber", icon: <Timer /> },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">System Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className={`bg-slate-800/80 p-6 rounded-2xl border border-slate-700 border-l-4 border-l-${card.color}-500 shadow-lg`}>
            <div className="flex justify-between items-start">
              <p className="text-slate-400">{card.title}</p>
              <div className={`text-${card.color}-400 bg-${card.color}-500/10 p-2 rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mt-4">{card.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;