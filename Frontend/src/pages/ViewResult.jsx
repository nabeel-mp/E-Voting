import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  BarChart3, 
  Trophy, 
  Search, 
  ChevronLeft, 
  Loader2, 
  AlertCircle,
  X,
  Award,
  Vote,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VoterResults = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Search States
  const [resultSearchTerm, setResultSearchTerm] = useState(''); // Search inside results (candidates)
  const [electionSearchTerm, setElectionSearchTerm] = useState(''); // Search for elections

  const resultsRef = useRef(null);

  // Fetch Published Elections on Mount
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/api/public/elections');
        if (res.data.success) {
          setElections(res.data.data);
          if (res.data.data.length > 0) {
            handleSelectElection(res.data.data[0].ID);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load elections", err);
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const handleSelectElection = async (id) => {
    const election = elections.find(e => e.ID == id);
    if (!election) return;
    
    setSelectedElection(election);
    setResultsLoading(true);
    setLoading(false);
    setShowWinnerPopup(false); 
    setResultSearchTerm(''); 

    try {
      const res = await api.get(`/api/public/results?election_id=${id}`);
      if (res.data.success) {
        const sorted = (res.data.data || []).sort((a, b) => b.vote_count - a.vote_count);
        setResults(sorted);
        
        if (sorted.length > 0 && sorted[0].vote_count > 0) {
           setWinner(sorted[0]);
           setTimeout(() => {
               setShowWinnerPopup(true);
               triggerConfetti();
           }, 800);
        } else {
           setWinner(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch results", err);
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  const triggerConfetti = () => {
      var duration = 3 * 1000;
      var animationEnd = Date.now() + duration;
      var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };
      var random = function(min, max) { return Math.random() * (max - min) + min; };

      var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        var particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
  };

  // --- FILTER RESULTS ---
  const filteredResults = useMemo(() => {
      if (!resultSearchTerm) return results;
      return results.filter(r => 
          r.candidate_name.toLowerCase().includes(resultSearchTerm.toLowerCase()) ||
          r.party_name.toLowerCase().includes(resultSearchTerm.toLowerCase())
      );
  }, [results, resultSearchTerm]);

  // --- FILTER ELECTIONS ---
  const filteredElections = useMemo(() => {
    if (!electionSearchTerm) return elections;
    return elections.filter(e => 
      e.title.toLowerCase().includes(electionSearchTerm.toLowerCase())
    );
  }, [elections, electionSearchTerm]);

  // --- CHART CONFIGURATION ---
  const leadingCandidate = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((prev, current) => (prev.vote_count > current.vote_count) ? prev : current);
  }, [results]);

  const chartData = {
    labels: filteredResults.map(d => d.candidate_name),
    datasets: [{
      label: 'Votes Cast',
      data: filteredResults.map(d => d.vote_count),
      backgroundColor: filteredResults.map(d => d.candidate_name === leadingCandidate?.candidate_name ? '#4f46e5' : '#cbd5e1'),
      borderRadius: 4,
      barThickness: 'flex',
      maxBarThickness: 40,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Vital for resizing
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 } },
        beginAtZero: true
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  const totalVotes = results.reduce((acc, curr) => acc + (curr.vote_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 relative">
      
      {/* --- Winner Popup (Unchanged logic, but now party_logo works) --- */}
      <AnimatePresence>
        {showWinnerPopup && winner && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowWinnerPopup(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden"
            >
               <button onClick={() => setShowWinnerPopup(false)} className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-20">
                  <X size={18} />
               </button>

               <div className="bg-indigo-600 p-6 text-center text-white relative">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg mb-3 p-2 overflow-hidden">
                      {winner.party_logo ? (
                          <img 
                            src={`http://localhost:8080${winner.party_logo}`} 
                            alt={winner.party_name} 
                            className="w-full h-full object-contain"
                          />
                      ) : (
                          <Trophy size={32} className="text-amber-500" />
                      )}
                  </motion.div>
                  <h2 className="text-xl font-bold">Winner Declared!</h2>
                  <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mt-1">{winner.election_title}</p>
               </div>
               {/* ... (rest of winner popup content) ... */}
               <div className="p-6 text-center space-y-4">
                  <div>
                      <h3 className="text-2xl font-bold text-slate-900">{winner.candidate_name}</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mt-2">
                          <Award size={14} /> {winner.party_name}
                      </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                      <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Votes</div>
                          <div className="text-lg font-bold text-slate-900">{winner.vote_count.toLocaleString()}</div>
                      </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white transition-colors group-hover:bg-indigo-600">
                <ChevronLeft size={18} />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">SEC<span className="text-indigo-600">KERALA</span></span>
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8">
        
        {/* --- CONTROLS SECTION --- */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Filter size={20} /></div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Election</div>
                    <div className="text-sm font-bold text-slate-900">{selectedElection ? selectedElection.title : 'Choose below'}</div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                {/* 1. Election Search Input */}
                <div className="relative w-full sm:w-64">
                    <input 
                        type="text"
                        placeholder="Search election..."
                        value={electionSearchTerm}
                        onChange={(e) => setElectionSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                </div>

                {/* 2. Election Dropdown (Filtered) */}
                <div className="relative w-full sm:w-64">
                    <select 
                        className="w-full appearance-none bg-indigo-600 text-white border-transparent text-sm rounded-xl py-3 pl-4 pr-10 font-bold focus:outline-none hover:bg-indigo-700 transition-all cursor-pointer"
                        onChange={(e) => handleSelectElection(e.target.value)}
                        value={selectedElection?.ID || ''}
                    >
                        <option value="" disabled>Select an Election</option>
                        {filteredElections.length === 0 && <option disabled>No elections found</option>}
                        {filteredElections.map(e => (
                            <option key={e.ID} value={e.ID} className="text-slate-900 bg-white">{e.title}</option>
                        ))}
                    </select>
                    <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none text-white/70" size={16} />
                </div>
            </div>
        </div>

        {/* --- RESULTS AREA --- */}
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-3" size={32} />
                <span className="text-sm">Loading data...</span>
            </div>
        ) : !selectedElection ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
                <Search size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">Please select an election to view results.</p>
            </div>
        ) : (
            <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* Summary Header */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 font-serif mb-2">{selectedElection.title}</h2>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">{selectedElection.election_type}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><Vote size={24} /></div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Votes</div>
                            <div className="text-2xl font-black text-slate-900">{totalVotes.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    
                    {/* --- CHART SECTION --- */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BarChart3 size={18} /></div>
                            <h3 className="font-bold text-slate-900">Vote Analytics</h3>
                        </div>
                        
                        {/* FIX: Use strict h-80 instead of flex/min-h to ensure ChartJS renders */}
                        <div className="w-full h-80 relative"> 
                            {resultsLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
                            ) : results.length > 0 ? (
                                <Bar data={chartData} options={chartOptions} />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <AlertCircle size={24} className="mb-2 opacity-50" />
                                    <span className="text-sm">No data available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- TABLE SECTION --- */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Trophy size={18} /></div>
                                <h3 className="font-bold text-slate-900">Live Standings</h3>
                            </div>
                            <div className="relative w-full md:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Search candidate..." 
                                    value={resultSearchTerm}
                                    onChange={(e) => setResultSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3">Rank</th>
                                        <th className="px-4 py-3">Candidate</th>
                                        <th className="px-6 py-3 text-right">Votes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {resultsLoading ? (
                                        <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-400">Updating...</td></tr>
                                    ) : filteredResults.length === 0 ? (
                                        <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-400">No candidates found</td></tr>
                                    ) : (
                                        filteredResults.map((r, i) => (
                                            <tr key={i} className={`hover:bg-slate-50 transition-colors`}>
                                                <td className="px-6 py-4">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-md font-bold text-xs ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Logo in Table Row */}
                                                        {r.party_logo && (
                                                            <img 
                                                                src={`http://localhost:8080${r.party_logo}`} 
                                                                alt="logo" 
                                                                className="w-8 h-8 object-contain rounded-md bg-slate-50 border border-slate-100"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-slate-900">{r.candidate_name}</div>
                                                            <div className="text-xs text-slate-500">{r.party_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                                                    {r.vote_count.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default VoterResults;