import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Results = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/admin/election-results');
        if(res.data.success) setData(res.data.data);
      } catch (e) { console.error(e); }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: data?.map(d => d.candidate_name) || [],
    datasets: [{
      label: 'Votes',
      data: data?.map(d => d.vote_count) || [],
      backgroundColor: '#6366f1',
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#334155' } }, x: { grid: { display: false } } }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Live Election Results</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Vote Distribution</h2>
          <Bar data={chartData} options={options} />
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Detailed Count</h2>
          <table className="w-full text-left text-slate-300">
             <thead className="bg-slate-900/50 text-xs uppercase">
               <tr><th className="p-3">Candidate</th><th className="p-3">Party</th><th className="p-3 text-right">Votes</th></tr>
             </thead>
             <tbody>
               {data?.map((r, i) => (
                 <tr key={i} className="border-b border-slate-700/50">
                   <td className="p-3 text-white font-medium">{r.candidate_name}</td>
                   <td className="p-3">{r.party_name}</td>
                   <td className="p-3 text-right text-indigo-400 font-bold">{r.vote_count}</td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Results;