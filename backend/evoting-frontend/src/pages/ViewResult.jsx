import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  BarChart3, 
  Trophy, 
  Calendar, 
  Search, 
  ChevronLeft, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoterResults = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);

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
        setLoading(false); // Ensure loading stops if success is false
      }
    } catch (err) {
      console.error("Failed to load elections", err);
      setLoading(false);
    }
  };
  fetchElections();
}, []);

  // Fetch Results when an election is selected
  const handleSelectElection = async (id) => {
    const election = elections.find(e => e.ID == id);
    setSelectedElection(election);
    setResultsLoading(true);
    setLoading(false);

    try {
      const res = await api.get(`/api/public/results?election_id=${id}`);
      if (res.data.success) {
        // Sort results by vote count descending
        const sorted = (res.data.data || []).sort((a, b) => b.vote_count - a.vote_count);
        setResults(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch results", err);
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  // Calculate Total Votes for Progress Bar
  const totalVotes = results.reduce((acc, curr) => acc + (curr.vote_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      
      {/* --- Public Header --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white transition-colors group-hover:bg-indigo-600">
                <ChevronLeft size={18} />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">SEC<span className="text-indigo-600">KERALA</span></span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold uppercase tracking-widest"> Results Portal</span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 lg:p-10 space-y-8">
        
        {/* --- Title Section --- */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif">
              Election <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Results</span>
           </h1>
           <p className="text-slate-500 text-lg">
              Official counting data from the State Election Commission.
           </p>
        </div>

        {/* --- Election Selector --- */}
        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
        ) : elections.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-700">No Results Published</h3>
              <p className="text-slate-500 mt-2">Results will appear here once counting is completed and published.</p>
           </div>
        ) : (
           <>
             {/* Dropdown / Filter */}
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 text-slate-500 w-full md:w-auto">
                   <div className="p-2 bg-slate-50 rounded-xl"><Calendar size={20} /></div>
                   <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap">Select Election:</span>
                </div>
                <div className="relative w-full">
                   <select 
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3 pl-4 pr-10 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                      onChange={(e) => handleSelectElection(e.target.value)}
                      value={selectedElection?.ID || ''}
                   >
                      {elections.map(e => (
                         <option key={e.ID} value={e.ID}>{e.title}</option>
                      ))}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Search size={16} />
                   </div>
                </div>
             </div>

             {/* --- Results Display --- */}
             {selectedElection && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   
                   {/* Left: Summary Card */}
                   <div className="lg:col-span-1 space-y-6">
                      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                         {/* Decorative BG */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                         
                         <h3 className="text-2xl font-bold font-serif mb-2 relative z-10">{selectedElection.title}</h3>
                         <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10">{selectedElection.election_type}</span>
                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/10">{selectedElection.district || 'State Level'}</span>
                         </div>

                         <div className="space-y-4 relative z-10">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                               <div className="flex items-center gap-3 mb-1 text-slate-400 text-xs font-black uppercase tracking-widest">
                                  <Users size={14} /> Total Votes
                               </div>
                               <div className="text-4xl font-black text-white">{totalVotes.toLocaleString()}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                               <div className="flex items-center gap-3 mb-1 text-slate-400 text-xs font-black uppercase tracking-widest">
                                  <Trophy size={14} /> Leading Candidate
                               </div>
                               {results.length > 0 ? (
                                  <div>
                                     <div className="text-xl font-bold text-white">{results[0].candidate_name}</div>
                                     <div className="text-emerald-400 text-xs font-bold">{results[0].party_name}</div>
                                  </div>
                               ) : (
                                  <span className="text-slate-500 text-sm">No data</span>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Right: Results List */}
                   <div className="lg:col-span-2">
                      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-lg shadow-slate-200/50 p-6 md:p-8">
                         <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><BarChart3 size={24} /></div>
                            <h3 className="text-xl font-bold text-slate-900">Vote Breakdown</h3>
                         </div>

                         {resultsLoading ? (
                            <div className="py-20 flex flex-col items-center text-slate-400">
                               <Loader2 className="animate-spin mb-2" size={32} />
                               <span className="text-sm font-medium">Calculating results...</span>
                            </div>
                         ) : results.length === 0 ? (
                            <div className="py-12 text-center text-slate-400">
                               <p>No votes recorded for this election yet.</p>
                            </div>
                         ) : (
                            <div className="space-y-6">
                               {results.map((result, index) => {
                                  const percentage = totalVotes > 0 ? ((result.vote_count / totalVotes) * 100).toFixed(1) : 0;
                                  const isWinner = index === 0;

                                  return (
                                     <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={index} 
                                        className={`relative p-4 rounded-2xl border transition-all ${isWinner ? 'bg-amber-50/50 border-amber-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                                     >
                                        <div className="flex justify-between items-end mb-2 relative z-10">
                                           <div>
                                              <div className="flex items-center gap-2">
                                                 <span className="text-lg font-bold text-slate-900">{result.candidate_name}</span>
                                                 {isWinner && <Trophy size={16} className="text-amber-500 fill-amber-500" />}
                                              </div>
                                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{result.party_name}</span>
                                           </div>
                                           <div className="text-right">
                                              <span className="text-2xl font-black text-slate-900">{result.vote_count}</span>
                                              <span className="text-xs font-bold text-slate-400 ml-1">VOTES</span>
                                           </div>
                                        </div>

                                        {/* Progress Bar Background */}
                                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                           <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${percentage}%` }}
                                              transition={{ duration: 1, ease: "easeOut" }}
                                              className={`h-full rounded-full ${isWinner ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-indigo-500'}`}
                                           />
                                        </div>
                                        <div className="text-right mt-1">
                                           <span className="text-xs font-bold text-slate-400">{percentage}%</span>
                                        </div>
                                     </motion.div>
                                  );
                               })}
                            </div>
                         )}
                      </div>
                   </div>

                </div>
             )}
           </>
        )}
      </main>
    </div>
  );
};

export default VoterResults;