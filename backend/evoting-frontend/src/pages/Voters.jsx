import React, { useEffect, useState, useRef } from 'react';
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
  AlertCircle,
  Pencil,
  Ban,
  Unlock,
  ChevronDown
} from 'lucide-react';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, VERIFIED, PENDING, BLOCKED
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVoterId, setSelectedVoterId] = useState(null);
  const [form, setForm] = useState({ full_name: '', mobile: '', aadhaar: '' });

  // Dropdown State
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // --- Fetch Data ---
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

  // --- Click Outside Handlers ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filter & Search Logic ---
  const filteredVoters = voters.filter(voter => {
    // 1. Search Filter
    const matchesSearch = 
        voter.FullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        voter.VoterID.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Status Filter
    let matchesStatus = true;
    if (filterStatus === 'VERIFIED') matchesStatus = voter.IsVerified;
    if (filterStatus === 'PENDING') matchesStatus = !voter.IsVerified;
    if (filterStatus === 'BLOCKED') matchesStatus = voter.IsBlocked;

    return matchesSearch && matchesStatus;
  });

  // --- Handle Create / Update Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/api/admin/voter/${selectedVoterId}`, form);
        alert("Voter details updated successfully!");
      } else {
        const res = await api.post('/api/admin/voter/register', form);
        if(res.data.success) {
            alert(`Successfully Registered! Voter ID: ${res.data.data.voter_id}`);
        }
      }
      closeModal();
      fetchVoters();
    } catch (err) {
      alert(err.response?.data?.error || "Operation Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Modal Helpers ---
  const openCreateModal = () => {
    setIsEditing(false);
    setForm({ full_name: '', mobile: '', aadhaar: '' });
    setShowModal(true);
  };

  const openEditModal = (voter) => {
    setIsEditing(true);
    setSelectedVoterId(voter.ID);
    setForm({ 
        full_name: voter.FullName, 
        mobile: voter.Mobile, 
        aadhaar: voter.Aadhaar || '' 
    });
    setShowModal(true);
    setActiveDropdown(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setForm({ full_name: '', mobile: '', aadhaar: '' });
  };

  // --- Block / Unblock Logic ---
  const toggleBlockStatus = async (voter) => {
    setActiveDropdown(null);
    const action = voter.IsBlocked ? "UNBLOCK" : "BLOCK";
    if(!window.confirm(`Are you sure you want to ${action} voter ${voter.FullName}?`)) return;

    setVoters(voters.map(v => v.ID === voter.ID ? { ...v, IsBlocked: !v.IsBlocked } : v));

    try {
        const endpoint = voter.IsBlocked ? "/api/admin/voter/unblock" : "/api/admin/voter/block";
        await api.post(endpoint, { voter_id: voter.ID });
    } catch (err) {
        alert("Failed to update status");
        fetchVoters();
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
          onClick={openCreateModal} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={20} />
          Register New Voter
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl min-h-[500px] flex flex-col">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..." 
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    filterStatus !== 'ALL' 
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
            >
                <Filter size={18} />
                <span className="text-sm font-medium">
                    {filterStatus === 'ALL' ? 'All Status' : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}
                </span>
                <ChevronDown size={14} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilterMenu && (
                <div className="absolute right-0 top-12 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-1">
                        {['ALL', 'VERIFIED', 'PENDING', 'BLOCKED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                    filterStatus === status 
                                    ? 'bg-indigo-500 text-white' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="hidden sm:block text-xs text-slate-500 ml-auto">
             Showing {filteredVoters.length} results
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-visible flex-1">
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
              ) : filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    {searchTerm || filterStatus !== 'ALL' 
                        ? 'No voters match your search filters.' 
                        : 'No voters found. Click "Register New Voter" to add one.'}
                  </td>
                </tr>
              ) : (
                filteredVoters.map((v) => (
                  <tr key={v.ID} className={`group transition-colors ${v.IsBlocked ? 'bg-rose-950/10 hover:bg-rose-900/20' : 'hover:bg-slate-800/40'}`}>
                    <td className="px-6 py-4 font-mono text-indigo-300 font-medium opacity-80">
                      {v.VoterID}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                            v.IsBlocked 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {v.FullName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-medium ${v.IsBlocked ? 'text-rose-200' : 'text-slate-200'}`}>{v.FullName}</span>
                            {v.IsBlocked && <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wide">Blocked</span>}
                        </div>
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
                    
                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === v.ID ? null : v.ID)}
                        className={`p-2 rounded-lg transition-colors ${activeDropdown === v.ID ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === v.ID && (
                        <div 
                            ref={dropdownRef}
                            className="absolute right-8 top-12 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        >
                            <div className="p-1">
                                <button 
                                    onClick={() => openEditModal(v)}
                                    className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Pencil size={14} className="text-indigo-400" />
                                    Update Details
                                </button>
                                <div className="h-px bg-slate-800 my-1 mx-2"></div>
                                <button 
                                    onClick={() => toggleBlockStatus(v)}
                                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                                        v.IsBlocked 
                                        ? 'text-emerald-400 hover:bg-emerald-500/10' 
                                        : 'text-rose-400 hover:bg-rose-500/10'
                                    }`}
                                >
                                    {v.IsBlocked ? <Unlock size={14} /> : <Ban size={14} />}
                                    {v.IsBlocked ? 'Unblock Access' : 'Block Access'}
                                </button>
                            </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal (Unchanged Layout) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Update Voter Details' : 'Register New Voter'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors border border-slate-700">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? 'Update Voter' : 'Register Voter')}
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