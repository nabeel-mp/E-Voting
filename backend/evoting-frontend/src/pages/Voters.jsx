import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  User, 
  Phone, 
  CreditCard, 
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: '', mobile: '', aadhaar: '' });

  const fetchVoters = async () => {
    try {
      const res = await api.get('/api/admin/voters');
      if(res.data.success) setVoters(res.data.data);
    } catch (err) {
      console.error("Failed to fetch voters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVoters(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/admin/voter/register', form);
      if(res.data.success) {
        // You might want to replace alert with a toast notification in the future
        alert(`Successfully Registered! Voter ID: ${res.data.data.voter_id}`);
        setShowModal(false);
        setForm({ full_name: '', mobile: '', aadhaar: '' });
        fetchVoters();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Registration Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voters List</h1>
          <p className="text-slate-400 mt-1">Manage registered voters and their verification status.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={20} />
          Register New Voter
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
            <Filter size={18} />
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Voter ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Mobile Number</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center gap-2 text-indigo-400">
                      <Loader2 className="animate-spin" size={20} />
                      Loading voters...
                    </div>
                  </td>
                </tr>
              ) : voters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No voters found. Click "Register New Voter" to add one.
                  </td>
                </tr>
              ) : (
                voters.map((v) => (
                  <tr key={v.ID} className="group hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-indigo-300 font-medium">
                      {v.VoterID}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs border border-indigo-500/20">
                          {v.FullName.charAt(0)}
                        </div>
                        <span className="text-slate-200 font-medium">{v.FullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {v.Mobile}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        v.IsVerified 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {v.IsVerified 
                          ? <CheckCircle2 size={12} /> 
                          : <AlertCircle size={12} />
                        }
                        {v.IsVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">Register New Voter</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegister} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    placeholder="e.g. John Doe" 
                    required 
                    value={form.full_name} 
                    onChange={e => setForm({...form, full_name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    placeholder="e.g. 9876543210" 
                    required 
                    type="tel"
                    value={form.mobile} 
                    onChange={e => setForm({...form, mobile: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Aadhaar / ID Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    placeholder="e.g. 1234 5678 9012" 
                    required 
                    value={form.aadhaar} 
                    onChange={e => setForm({...form, aadhaar: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Register Voter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voters;