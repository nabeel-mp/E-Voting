import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Calendar, 
  Plus, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Vote
} from 'lucide-react';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const fetchElections = async () => {
    try {
      const res = await api.get('/api/admin/elections');
      if (res.data.success) setElections(res.data.data);
    } catch (err) {
      console.error("Failed to fetch elections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchElections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Convert dates to ISO strings for Go
      const payload = {
        ...form,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString()
      };
      await api.post('/api/admin/elections', payload);
      setShowModal(false);
      setForm({ title: '', description: '', start_date: '', end_date: '' });
      fetchElections();
    } catch (err) {
      alert("Failed to create election.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.post('/api/admin/elections/status', {
        election_id: id,
        is_active: !currentStatus
      });
      // Optimistic update
      setElections(elections.map(e => e.ID === id ? { ...e, is_active: !currentStatus } : e));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Election Management</h1>
          <p className="text-slate-400 mt-1">Create and monitor election events.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Election
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
           <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : elections.length === 0 ? (
           <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
             No elections found. Create your first one.
           </div>
        ) : (
           elections.map((election) => (
             <div key={election.ID} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-slate-700 transition-all shadow-md">
                
                <div className="flex items-start gap-4">
                   <div className={`p-3 rounded-xl ${election.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Vote size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-200">{election.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">{election.description || "No description provided."}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                         <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded">
                            <Calendar size={12} /> 
                            Start: {new Date(election.start_date).toLocaleDateString()}
                         </span>
                         <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded">
                            <Clock size={12} />
                            End: {new Date(election.end_date).toLocaleDateString()}
                         </span>
                         <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded">
                            ID: #{election.ID}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto pl-16 md:pl-0">
                   <div className={`text-sm font-bold px-3 py-1 rounded-full border ${election.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {election.is_active ? "Active" : "Closed"}
                   </div>
                   
                   <button 
                     onClick={() => toggleStatus(election.ID, election.is_active)}
                     className={`p-2 rounded-lg transition-colors ${election.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                     title="Toggle Status"
                   >
                      {election.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                   </button>
                </div>
             </div>
           ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                 <h2 className="text-xl font-bold text-white mb-6">Create New Election</h2>
                 <form onSubmit={handleCreate} className="space-y-4">
                    
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Election Title</label>
                       <input 
                          required 
                          value={form.title} 
                          onChange={e => setForm({...form, title: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="e.g. Student Council 2026"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                       <textarea 
                          rows="3"
                          value={form.description} 
                          onChange={e => setForm({...form, description: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                          placeholder="Brief details about this election..."
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-400 uppercase">Start Date</label>
                          <input 
                             type="datetime-local"
                             required 
                             value={form.start_date} 
                             onChange={e => setForm({...form, start_date: e.target.value})}
                             className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-400 uppercase">End Date</label>
                          <input 
                             type="datetime-local"
                             required 
                             value={form.end_date} 
                             onChange={e => setForm({...form, end_date: e.target.value})}
                             className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                       </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4">
                       <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-700">Cancel</button>
                       <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg">
                          {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Create Election'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Elections;