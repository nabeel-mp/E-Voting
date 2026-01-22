import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Plus, MoreVertical, User, Phone, CreditCard, X, 
  Loader2, CheckCircle2, AlertCircle, Pencil, Ban, Unlock, ChevronDown, 
  AlertTriangle, Download, Upload, Eye, MapPin, FileText, Trash2, Building
} from 'lucide-react';

// --- KERALA ADMINISTRATIVE DATA ---
const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", 
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", 
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

const LOCAL_BODY_TYPES = [
  "Grama Panchayat", 
  "Block Panchayat",
  "Municipality", 
  "Municipal Corporation"
];

// Data Source: Kerala Local Self Government Department
const KERALA_BLOCK_PANCHAYATS = {
  "Thiruvananthapuram": ["Parassala", "Athiyannoor", "Perunkadavila", "Nemom", "Thiruvananthapuram Rural", "Kazhakoottam", "Nedumangad", "Vellanad", "Vamanapuram", "Chirayinkizhu", "Kilimanoor", "Varkala"],
  "Kollam": ["Ochira", "Karunagappally", "Sasthamcotta", "Pathanapuram", "Anchal", "Kottarakkara", "Chittumala", "Chavara", "Mukhathala", "Ithikkara", "Chadayamangalam", "Vettikkavala"],
  "Pathanamthitta": ["Mallappally", "Pulikeezhu", "Koyipram", "Elanthoor", "Ranni", "Konni", "Pandalam", "Parakode"],
  "Alappuzha": ["Thaikkattusseri", "Pattanakkad", "Kanjikkuzhi", "Aryad", "Ambalappuzha", "Champakkulam", "Veliyanad", "Chengannur", "Harippad", "Mavelikkara", "Bharanikkavu", "Muthukulam"],
  "Kottayam": ["Vaikom", "Kaduthuruthy", "Ettumanoor", "Uzhavoor", "Lalam", "Erattupetta", "Pampadi", "Pallom", "Madappally", "Vazhoor", "Kanjirappally"],
  "Idukki": ["Adimali", "Devikulam", "Nedumkandam", "Elemdesom", "Idukki", "Kattappana", "Thodupuzha", "Azhutha"],
  "Ernakulam": ["Paravur", "Alangad", "Angamaly", "Koovappadi", "Vazhakulam", "Edappally", "Vypeen", "Palluruthy", "Mulanthuruthy", "Vadavucode", "Kothamangalam", "Pampakuda", "Parakkadavu", "Muvattupuzha"],
  "Thrissur": ["Chavakkad", "Chowwannur", "Vadakkancherry", "Pazhayannoor", "Ollukkara", "Puzhackal", "Mullasseri", "Thalikulam", "Anthikkad", "Cherpu", "Kodakara", "Irinjalakkuda", "Vellangallur", "Mathilakam", "Kodungallur", "Mala", "Chalakkudi"],
  "Palakkad": ["Thrithala", "Pattambi", "Ottappalam", "Sreekrishnapuram", "Mannarkkad", "Attappady", "Palakkad", "Kuzhalmannam", "Chittoor", "Kollangode", "Nenmara", "Alathur", "Malampuzha"],
  "Malappuram": ["Nilambur", "Wandoor", "Kondotty", "Areecode", "Malappuram", "Perinthalmanna", "Mankada", "Kuttippuram", "Vengara", "Tiroorangadi", "Tanur", "Tirur", "Ponnani", "Perumpadappu", "Kalikavu"],
  "Kozhikode": ["Vadakara", "Tuneri", "Kunnummel", "Thodannur", "Meladi", "Perambra", "Balusseri", "Panthalayani", "Chelannur", "Koduvally", "Kunnamangalam", "Kozhikode"],
  "Wayanad": ["Mananthavady", "Sulthan Bathery", "Kalpetta", "Panamaram"],
  "Kannur": ["Payyannur", "Kalliasseri", "Taliparamba", "Irikkur", "Kannur", "Edakkad", "Thalassery", "Kuthuparamba", "Panoor", "Iritty", "Peravoor"],
  "Kasaragod": ["Manjeshwaram", "Karadka", "Kasaragod", "Kanhangad", "Parappa", "Nileshwaram"]
};

const Voters = () => {
  const { user } = useAuth();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const { addToast } = useToast();
   
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [form, setForm] = useState({ 
      full_name: '', 
      mobile: '', 
      aadhaar: '',
      address: '',
      district: '',
      local_body_type: 'Grama Panchayat',
      local_body_name: '',
      block: '', // Maps to Block Panchayat
      ward: ''
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchVoters = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/api/admin/voters');
      if(res.data.success) {
        setVoters(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch voters", err);
      setErrorMsg("Failed to load voters. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVoters(); }, []);

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

  const filteredVoters = voters.filter(voter => {
    if (!voter) return false;
    
    const fullName = (voter.FullName || voter.full_name || '').toLowerCase();
    const voterID = (voter.VoterID || voter.voter_id || '').toLowerCase();
    const aadhaar = (voter.AadhaarNumber || voter.aadhaar_number || voter.AadhaarPlain || '').toLowerCase();
    
    const isVerified = voter.IsVerified !== undefined ? voter.IsVerified : (voter.is_verified || false);
    const isBlocked = voter.IsBlocked !== undefined ? voter.IsBlocked : (voter.is_blocked || false);

    const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) || 
        voterID.includes(searchTerm.toLowerCase()) ||
        aadhaar.includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === 'VERIFIED') matchesStatus = isVerified;
    if (filterStatus === 'PENDING') matchesStatus = !isVerified;
    if (filterStatus === 'BLOCKED') matchesStatus = isBlocked;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
          ...form,
          panchayath: form.local_body_name
      };

      if (isEditing) {
        const id = selectedVoter.ID || selectedVoter.id;
        await api.put(`/api/admin/voter/${id}`, payload);
        addToast("Voter details updated successfully!", "success");
      } else {
        const res = await api.post('/api/admin/voter/register', payload);
        if(res.data.success) {
            addToast(`Successfully Registered! Voter ID: ${res.data.data.voter_id}`, "success");
        }
      }
      closeModal();
      fetchVoters();
    } catch (err) {
      addToast(err.response?.data?.error || "Operation Failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this voter? This action cannot be undone.")) return;
      try {
          await api.delete(`/api/admin/voter/${id}`);
          addToast("Voter deleted successfully", "success");
          fetchVoters();
          setActiveDropdown(null);
      } catch (err) {
          addToast(err.response?.data?.error || "Failed to delete voter", "error");
      }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/admin/voters/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `voters_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast("Export started successfully", "success");
    } catch (err) {
      addToast("Failed to export voters.", "error");
    }
  };

  const handleImportClick = () => { fileInputRef.current.click(); };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
        addToast("Please upload a valid CSV file.", "warning");
        return;
    }
    if (!window.confirm("Importing voters from CSV. Continue?")) return;

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
        const res = await api.post('/api/admin/voters/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        addToast(res.data.data.message, "success");
        fetchVoters();
    } catch (err) {
        addToast("Import failed.", "error");
    } finally {
        setLoading(false);
        e.target.value = null;
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({ 
        full_name: '', mobile: '', aadhaar: '', address: '', 
        district: '', 
        local_body_type: 'Grama Panchayat',
        local_body_name: '',
        block: '',
        ward: '' 
    });
    setShowModal(true);
  };

  const openEditModal = (voter) => {
    setIsEditing(true);
    setSelectedVoter(voter);
    setForm({ 
        full_name: voter.FullName || voter.full_name || '', 
        mobile: voter.Mobile || voter.mobile || '', 
        aadhaar: voter.AadhaarNumber || voter.aadhaar_number || '', 
        address: voter.Address || '',
        district: voter.District || '',
        local_body_type: 'Grama Panchayat', // Needs backend support for exact type persistence
        local_body_name: voter.Panchayath || '', 
        block: voter.Block || '',
        ward: voter.Ward || ''
    });
    setShowModal(true);
    setActiveDropdown(null);
  };

  const openDetailsModal = (voter) => {
      setSelectedVoter(voter);
      setShowDetailsModal(true);
      setActiveDropdown(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDetailsModal(false);
    setIsEditing(false);
  };

  const toggleBlockStatus = async (voter) => {
    setActiveDropdown(null);
    const isBlocked = voter.IsBlocked !== undefined ? voter.IsBlocked : voter.is_blocked;
    const action = isBlocked ? "UNBLOCK" : "BLOCK";
    const name = voter.FullName || voter.full_name;
    const id = voter.ID || voter.id;

    if(!window.confirm(`Are you sure you want to ${action} voter ${name}?`)) return;

    setVoters(voters.map(v => (v.ID === id || v.id === id) ? { ...v, IsBlocked: !isBlocked } : v));

    try {
        const endpoint = isBlocked ? "/api/admin/voter/unblock" : "/api/admin/voter/block";
        await api.post(endpoint, { voter_id: id });
        addToast(`Voter ${isBlocked ? 'unblocked' : 'blocked'} successfully`, "success");
    } catch (err) {
        addToast("Failed to update status", "error");
        fetchVoters();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voters List</h1>
          <p className="text-slate-400 mt-1">Manage registered voters and their verification status.</p>
        </div>
        
        <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-medium border border-slate-700 transition-all">
              <Download size={18} /> <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={handleImportClick} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-medium border border-slate-700 transition-all">
              <Upload size={18} /> <span className="hidden sm:inline">Import</span>
            </button>
            <button onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 ml-2">
              <Plus size={20} /> Register New
            </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} /> <span>{errorMsg}</span>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, ID or Aadhaar..." className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600" />
          </div>
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${filterStatus !== 'ALL' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}>
                <Filter size={18} />
                <span className="text-sm font-medium">{filterStatus === 'ALL' ? 'All Status' : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}</span>
                <ChevronDown size={14} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            {showFilterMenu && (
                <div className="absolute right-0 top-12 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-1">
                        {['ALL', 'VERIFIED', 'PENDING', 'BLOCKED'].map((status) => (
                            <button key={status} onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${filterStatus === status ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
          <div className="hidden sm:block text-xs text-slate-500 ml-auto">Showing {filteredVoters.length} results</div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Voter ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Aadhaar (Click to View)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading voters...</td></tr>
              ) : filteredVoters.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">{searchTerm || filterStatus !== 'ALL' ? 'No voters match your search filters.' : 'No voters found.'}</td></tr>
              ) : (
                filteredVoters.map((v) => {
                  const id = v.ID || v.id;
                  const fullName = v.FullName || v.full_name || 'N/A';
                  const voterID = v.VoterID || v.voter_id || 'N/A';
                  const mobile = v.Mobile || v.mobile || 'N/A';
                  const aadhaar = v.AadhaarNumber || v.aadhaar_number || 'N/A'; 
                  const isVerified = v.IsVerified !== undefined ? v.IsVerified : (v.is_verified || false);
                  const isBlocked = v.IsBlocked !== undefined ? v.IsBlocked : (v.is_blocked || false);

                  return (
                    <tr key={id} className={`group hover:bg-slate-800/40 transition-colors`}>
                      <td className="px-6 py-4 font-mono text-indigo-300 opacity-80">{voterID}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/20">{fullName.charAt(0)}</div>
                          <span className="font-medium text-slate-200">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">{mobile}</td>
                      <td className="px-6 py-4 font-mono">
                        <button onClick={() => openDetailsModal(v)} className="text-slate-400 hover:text-indigo-400 hover:underline transition-colors" title="Click to view details">{aadhaar}</button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {isVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setActiveDropdown(activeDropdown === id ? null : id)} className={`p-2 rounded-lg transition-colors ${activeDropdown === id ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}>
                          <MoreVertical size={18} />
                        </button>
                        {activeDropdown === id && (
                          <div ref={dropdownRef} className="absolute right-8 top-12 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                              <div className="p-1">
                                  <button onClick={() => openDetailsModal(v)} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"><Eye size={14} className="text-sky-400" /> View Details</button>
                                  <button onClick={() => openEditModal(v)} className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"><Pencil size={14} className="text-indigo-400" /> Update Details</button>
                                  <button onClick={() => handleDelete(id)} className="w-full text-left px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors"><Trash2 size={14} /> Delete Voter</button>
                                  <div className="h-px bg-slate-800 my-1 mx-2"></div>
                                  <button onClick={() => toggleBlockStatus(v)} className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 ${isBlocked ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
                                      {isBlocked ? <Unlock size={14} /> : <Ban size={14} />} {isBlocked ? 'Unblock' : 'Block'}
                                  </button>
                              </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL (KERALA ADMINISTRATIVE JURISDICTION) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Update Voter Details' : 'Register New Voter'}</h2>
              <button onClick={closeModal}><X size={20} className="text-slate-400 hover:text-white"/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                    <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Mobile</label>
                    <input required type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Aadhaar Number</label>
                    <input required value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50" />
                  </div>

                  {/* KERALA ADMINISTRATIVE FIELDS (OPEN ACCESS) */}
                  <div className="md:col-span-2 pt-4 pb-1">
                      <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                          <Building size={16} /> Administrative Jurisdiction
                      </h3>
                      <div className="h-px bg-slate-800 mt-2"></div>
                  </div>

                  {/* DISTRICT SELECTION */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">District</label>
                    <div className="relative">
                        <select 
                            value={form.district}
                            onChange={(e) => {
                                const newDistrict = e.target.value;
                                setForm({...form, district: newDistrict, block: ''}); // Reset block when district changes
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white appearance-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <option value="">Select District</option>
                            {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* LOCAL BODY TYPE */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Local Body Type</label>
                    <div className="relative">
                        <select 
                            value={form.local_body_type} 
                            onChange={(e) => setForm({...form, local_body_type: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white appearance-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            {LOCAL_BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* BLOCK PANCHAYAT SELECTION (Cascading from District) */}
                  {form.local_body_type === 'Grama Panchayat' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Block Panchayat</label>
                        <div className="relative">
                            <select 
                                value={form.block} 
                                onChange={(e) => setForm({...form, block: e.target.value})} 
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white appearance-none focus:ring-2 focus:ring-indigo-500/50"
                                disabled={!form.district}
                            >
                                <option value="">Select Block</option>
                                {form.district && KERALA_BLOCK_PANCHAYATS[form.district] ? (
                                    KERALA_BLOCK_PANCHAYATS[form.district].map(block => (
                                        <option key={block} value={block}>{block}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>Select District first</option>
                                )}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                        </div>
                      </div>
                  )}

                  {/* LOCAL BODY NAME */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        {form.local_body_type === 'Municipal Corporation' ? 'Corporation Name' : 
                         form.local_body_type === 'Municipality' ? 'Municipality Name' : 'Panchayat Name'}
                    </label>
                    <input 
                        placeholder={form.local_body_type === 'Grama Panchayat' ? "e.g. Thrikkalangode" : "e.g. Malappuram"} 
                        value={form.local_body_name} 
                        onChange={e => setForm({...form, local_body_name: e.target.value})} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50" 
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Ward Number</label>
                    <input placeholder="e.g. 12" value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Full Residential Address</label>
                    <textarea placeholder="House Name, Street..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 min-h-[80px]" />
                  </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? 'Update' : 'Register')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><User className="text-indigo-400" /> Voter Details</h2>
              <button onClick={closeModal}><X size={20} className="text-slate-400 hover:text-white"/></button>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl font-bold border border-indigo-500/30">{(selectedVoter.FullName || '?').charAt(0)}</div>
                    <div><h3 className="text-2xl font-bold text-white">{selectedVoter.FullName}</h3><p className="text-slate-400 font-mono">{selectedVoter.VoterID}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800"><p className="text-slate-500 mb-1 flex items-center gap-1"><Phone size={12}/> Mobile</p><p className="text-white font-mono">{selectedVoter.Mobile}</p></div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800"><p className="text-slate-500 mb-1 flex items-center gap-1"><CreditCard size={12}/> Aadhaar</p><p className="text-white font-mono">{selectedVoter.AadhaarNumber}</p></div>
                </div>
                <div>
                    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><MapPin size={14} /> Address Information</h4>
                    <div className="bg-slate-800/30 rounded-xl border border-slate-800 p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-slate-500 text-xs">District</p><p className="text-slate-200 font-medium">{selectedVoter.District || '-'}</p></div>
                            <div><p className="text-slate-500 text-xs">Block Panchayat</p><p className="text-slate-200 font-medium">{selectedVoter.Block || '-'}</p></div>
                            <div><p className="text-slate-500 text-xs">Local Body</p><p className="text-slate-200 font-medium">{selectedVoter.Panchayath || '-'}</p></div>
                            <div><p className="text-slate-500 text-xs">Ward</p><p className="text-slate-200 font-medium">{selectedVoter.Ward || '-'}</p></div>
                        </div>
                        <div className="pt-2 border-t border-slate-700/50"><p className="text-slate-500 text-xs flex items-center gap-1"><FileText size={10}/> Full Address</p><p className="text-slate-200 mt-1">{selectedVoter.Address || 'No address provided'}</p></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voters;