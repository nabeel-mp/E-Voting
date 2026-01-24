import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, Plus, MoreVertical, User, Phone, CreditCard, X,
  Loader2, CheckCircle2, AlertCircle, Pencil, Ban, Unlock, ChevronDown,
  AlertTriangle, Download, Upload, Eye, MapPin, FileText, Trash2, Building,
  ShieldCheck
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* KERALA ADMINISTRATIVE DATA                                                 */
/* -------------------------------------------------------------------------- */
const KERALA_ADMIN_DATA = {
  districts: [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ],
  blocks: {
    "Malappuram": ["Manjeri", "Malappuram", "Kondotty", "Areekode", "Nilambur", "Wandoor", "Kalikavu", "Perinthalmanna", "Mankada", "Kuttippuram", "Vengara", "Tiroorangadi", "Tanur", "Tirur", "Ponnani", "Perumpadappu"],
    "Thiruvananthapuram": ["Parassala", "Athiyannoor", "Perunkadavila", "Nemom", "Thiruvananthapuram Rural", "Kazhakoottam", "Nedumangad", "Vellanad", "Vamanapuram", "Chirayinkizhu", "Kilimanoor", "Varkala"],
    "Kollam": ["Ochira", "Karunagappally", "Sasthamcotta", "Pathanapuram", "Anchal", "Kottarakkara", "Chittumala", "Chavara", "Mukhathala", "Ithikkara", "Chadayamangalam", "Vettikkavala"],
    "Pathanamthitta": ["Mallappally", "Pulikeezhu", "Koyipram", "Elanthoor", "Ranni", "Konni", "Pandalam", "Parakode"],
    "Alappuzha": ["Thaikkattusseri", "Pattanakkad", "Kanjikkuzhi", "Aryad", "Ambalappuzha", "Champakkulam", "Veliyanad", "Chengannur", "Harippad", "Mavelikkara", "Bharanikkavu", "Muthukulam"],
    "Kottayam": ["Vaikom", "Kaduthuruthy", "Ettumanoor", "Uzhavoor", "Lalam", "Erattupetta", "Pampadi", "Pallom", "Madappally", "Vazhoor", "Kanjirappally"],
    "Idukki": ["Adimali", "Devikulam", "Nedumkandam", "Elemdesom", "Idukki", "Kattappana", "Thodupuzha", "Azhutha"],
    "Ernakulam": ["Paravur", "Alangad", "Angamaly", "Koovappadi", "Vazhakulam", "Edappally", "Vypeen", "Palluruthy", "Mulanthuruthy", "Vadavucode", "Kothamangalam", "Pampakuda", "Parakkadavu", "Muvattupuzha"],
    "Thrissur": ["Chavakkad", "Chowwannur", "Vadakkancherry", "Pazhayannoor", "Ollukkara", "Puzhackal", "Mullasseri", "Thalikulam", "Anthikkad", "Cherpu", "Kodakara", "Irinjalakkuda", "Vellangallur", "Mathilakam", "Kodungallur", "Mala", "Chalakkudi"],
    "Palakkad": ["Thrithala", "Pattambi", "Ottappalam", "Sreekrishnapuram", "Mannarkkad", "Attappady", "Palakkad", "Kuzhalmannam", "Chittoor", "Kollangode", "Nenmara", "Alathur", "Malampuzha"],
    "Kozhikode": ["Vadakara", "Tuneri", "Kunnummel", "Thodannur", "Meladi", "Perambra", "Balusseri", "Panthalayani", "Chelannur", "Koduvally", "Kunnamangalam", "Kozhikode"],
    "Wayanad": ["Mananthavady", "Sulthan Bathery", "Kalpetta", "Panamaram"],
    "Kannur": ["Payyannur", "Kalliasseri", "Taliparamba", "Irikkur", "Kannur", "Edakkad", "Thalassery", "Kuthuparamba", "Panoor", "Iritty", "Peravoor"],
    "Kasaragod": ["Manjeshwaram", "Karadka", "Kasaragod", "Kanhangad", "Parappa", "Nileshwaram"]
  },
  municipalities: {
    "Malappuram": ["Malappuram", "Manjeri", "Ponnani", "Tirur", "Perinthalmanna", "Nilambur", "Kottakkal", "Valanchery", "Kondotty", "Tanur", "Parappanangadi", "Tirurangadi"],
    "Thiruvananthapuram": ["Neyyattinkara", "Nedumangad", "Attingal", "Varkala"],
    "Kollam": ["Punalur", "Karunagappally", "Paravur", "Kottarakkara"],
    "Pathanamthitta": ["Thiruvalla", "Pathanamthitta", "Adoor", "Pandalam"],
    "Alappuzha": ["Alappuzha", "Kayamkulam", "Cherthala", "Mavelikkara", "Chengannur", "Haripad"],
    "Kottayam": ["Kottayam", "Changanassery", "Pala", "Vaikom", "Ettumanoor", "Erattupetta"],
    "Idukki": ["Thodupuzha", "Kattappana"],
    "Ernakulam": ["Thrippunithura", "Muvattupuzha", "Kothamangalam", "Perumbavoor", "Aluva", "North Paravur", "Angamaly", "Kalamassery", "Maradu", "Eloor", "Thrikkakara", "Piravom", "Koothattukulam"],
    "Thrissur": ["Chalakudy", "Kunnamkulam", "Kodungallur", "Chavakkad", "Guruvayoor", "Irinjalakuda", "Wadakkanchery"],
    "Palakkad": ["Palakkad", "Shornur", "Chittur-Thathamangalam", "Ottappalam", "Mannarkkad", "Pattambi", "Cherpulassery"],
    "Kozhikode": ["Vatakara", "Koyilandy", "Ramanattukara", "Koduvally", "Mukkam", "Payyoli", "Feroke"],
    "Wayanad": ["Kalpetta", "Mananthavady", "Sulthan Bathery"],
    "Kannur": ["Taliparamba", "Payyannur", "Thalassery", "Mattannur", "Koothuparamba", "Anthoor", "Iritty", "Panoor", "Sreekandapuram"],
    "Kasaragod": ["Kasaragod", "Kanhangad", "Nileshwar"]
  },
  corporations: {
    "Thiruvananthapuram": ["Thiruvananthapuram Corporation"],
    "Kozhikode": ["Kozhikode Corporation"],
    "Ernakulam": ["Kochi Corporation"],
    "Kollam": ["Kollam Corporation"],
    "Thrissur": ["Thrissur Corporation"],
    "Kannur": ["Kannur Corporation"]
  },
  grama_panchayats: {
    "Manjeri": ["Thrikkalangode", "Pandikkad", "Edavanna", "Keezhuparamba", "Urangattiri"],
    "Kondotty": ["Cheekkode", "Cherukavu", "Kondotty", "Pulikkal", "Vazhayur", "Vazhakkad"],
    "DEFAULT": ["Grama Panchayat 1", "Grama Panchayat 2", "Grama Panchayat 3"]
  }
};

const Voters = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '', mobile: '', aadhaar: '', address: '',
    district: '', local_body_type: 'Grama Panchayat', block: '', local_body_name: '', ward: ''
  });

  // Refs
  const dropdownRef = useRef(null);
  const filterRef = useRef(null);
  const fileInputRef = useRef(null);

  /* -------------------------- DATA FETCHING -------------------------- */
  const fetchVoters = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/api/admin/voters');
      if (res.data.success) setVoters(res.data.data || []);
    } catch (err) {
      setErrorMsg("Failed to load voters. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVoters(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setActiveDropdown(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------------- LOGIC -------------------------- */
  const filteredVoters = voters.filter(voter => {
    if (!voter) return false;
    const q = searchTerm.toLowerCase();
    const fullName = (voter.FullName || '').toLowerCase();
    const voterID = (voter.VoterID || '').toLowerCase();
    const aadhaar = (voter.AadhaarNumber || '').toLowerCase();

    const matchesSearch = fullName.includes(q) || voterID.includes(q) || aadhaar.includes(q);

    let matchesStatus = true;
    if (filterStatus === 'VERIFIED') matchesStatus = voter.IsVerified;
    if (filterStatus === 'PENDING') matchesStatus = !voter.IsVerified;
    if (filterStatus === 'BLOCKED') matchesStatus = voter.IsBlocked;

    return matchesSearch && matchesStatus;
  });

  const getLocalBodyList = () => {
    if (!form.district) return [];
    if (form.local_body_type === 'Municipality') return KERALA_ADMIN_DATA.municipalities[form.district] || [];
    if (form.local_body_type === 'Municipal Corporation') return KERALA_ADMIN_DATA.corporations[form.district] || [];
    if (form.local_body_type === 'Grama Panchayat') {
      if (!form.block) return [];
      return KERALA_ADMIN_DATA.grama_panchayats[form.block] || KERALA_ADMIN_DATA.grama_panchayats["DEFAULT"];
    }
    return [];
  };

  /* -------------------------- HANDLERS -------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, panchayath: form.local_body_name };
      if (isEditing) {
        await api.put(`/api/admin/voter/${selectedVoter.ID}`, payload);
        addToast("Voter profile updated successfully!", "success");
      } else {
        await api.post('/api/admin/voter/register', payload);
        addToast("New voter registered successfully!", "success");
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
    if (!window.confirm("Are you sure you want to delete this voter? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/voter/${id}`);
      addToast("Voter deleted successfully", "success");
      fetchVoters();
      setActiveDropdown(null);
    } catch (err) { addToast("Failed to delete voter", "error"); }
  };

  const toggleBlockStatus = async (voter) => {
    const id = voter.ID;
    const isBlocked = voter.IsBlocked;
    if (!window.confirm(`${isBlocked ? "UNBLOCK" : "BLOCK"} access for ${voter.FullName}?`)) return;

    setVoters(prev => prev.map(v => v.ID === id ? { ...v, IsBlocked: !isBlocked } : v));
    setActiveDropdown(null);

    try {
      const endpoint = isBlocked ? "/api/admin/voter/unblock" : "/api/admin/voter/block";
      await api.post(endpoint, { voter_id: id });
      addToast(`Voter ${isBlocked ? 'unblocked' : 'blocked'} successfully`, "success");
      fetchVoters();
    } catch (err) {
      addToast("Failed to update status", "error");
      fetchVoters();
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({
      full_name: '', mobile: '', aadhaar: '', address: '',
      district: '', local_body_type: 'Grama Panchayat', block: '', local_body_name: '', ward: ''
    });
    setShowModal(true);
  };

  const openEditModal = (voter) => {
    setIsEditing(true);
    setSelectedVoter(voter);
    setForm({
      full_name: voter.FullName, mobile: voter.Mobile, aadhaar: voter.AadhaarNumber, address: voter.Address,
      district: voter.District, local_body_type: 'Grama Panchayat', block: voter.Block, local_body_name: voter.Panchayath, ward: voter.Ward
    });
    setShowModal(true);
    setActiveDropdown(null);
  };

  const openDetailsModal = (voter) => { setSelectedVoter(voter); setShowDetailsModal(true); setActiveDropdown(null); };
  const closeModal = () => { setShowModal(false); setShowDetailsModal(false); };

  const handleExport = async () => { addToast("Export feature coming soon...", "info"); };
  const handleImportClick = () => fileInputRef.current.click();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      await api.post('/api/admin/voters/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast("Import successful", "success");
      fetchVoters();
    } catch (err) { addToast("Import failed", "error"); }
    finally { setLoading(false); e.target.value = null; }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col p-6 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Voters Directory
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Manage registered voters securely. Add, edit, or verify details.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-500 shadow-sm"
          >
            <Download size={18} /> <span>Export CSV</span>
          </button>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          
          <button 
            onClick={handleImportClick} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-500 shadow-sm"
          >
            <Upload size={18} /> <span>Import</span>
          </button>
          
          <button 
            onClick={openCreateModal} 
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 transform hover:-translate-y-0.5"
          >
            <Plus size={20} /> <span>Register Voter</span>
          </button>
        </div>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertTriangle size={20} /> <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" size={18} />
            <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search by ID, Name, or Aadhaar..." 
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600" 
            />
          </div>
          
          <div className="relative" ref={filterRef}>
            <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)} 
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all ${filterStatus !== 'ALL' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-indigo-500/10 shadow-lg' : 'bg-slate-950/50 hover:bg-slate-800 text-slate-300 border-slate-800'}`}
            >
              <Filter size={18} />
              <span className="text-sm font-medium truncate max-w-[120px]">
                  {filterStatus === 'ALL' ? 'All Status' : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-14 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/5">
                {['ALL', 'VERIFIED', 'PENDING', 'BLOCKED'].map((status) => (
                  <button 
                    key={status} 
                    onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }} 
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center gap-3 ${filterStatus === status ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    {status === 'VERIFIED' && <CheckCircle2 size={14} />}
                    {status === 'BLOCKED' && <Ban size={14} />} 
                    {status === 'PENDING' && <AlertCircle size={14} />}
                    {status === 'ALL' && <Filter size={14} />}
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10 shadow-sm">
              <tr>
                  <th className="px-8 py-5">Identity</th>
                  <th className="px-6 py-5">Contact</th>
                  <th className="px-6 py-5">Aadhaar</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                  <tr><td colSpan="5" className="px-6 py-24 text-center"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /><span className="text-slate-500 animate-pulse">Loading directory...</span></div></td></tr>
              ) : filteredVoters.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-24 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4 opacity-60">
                            <div className="p-4 bg-slate-800 rounded-full"><User size={32} /></div>
                            <p className="text-lg">No voters found matching your criteria.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredVoters.map((v) => (
                  <tr key={v.ID} className="group hover:bg-indigo-500/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow-sm bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-400 border border-indigo-500/20">
                            {v.FullName.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-200 text-base">{v.FullName}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {v.VoterID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5 text-slate-400 bg-slate-950/30 w-fit px-3 py-1.5 rounded-lg border border-slate-800/50">
                            <Phone size={14} className="text-slate-500" />
                            <span className="font-mono text-xs font-medium">{v.Mobile}</span>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => openDetailsModal(v)}
                        className="group/btn flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-950/30 hover:bg-slate-800 border border-slate-800/50 hover:border-slate-600 transition-all text-left w-full sm:w-auto"
                        title="View Details"
                      >
                        <CreditCard size={14} className="text-amber-500 group-hover/btn:scale-110 transition-transform" />
                        <span className="font-mono text-xs text-slate-400 group-hover/btn:text-slate-200 transition-colors">
                          {v.AadhaarNumber}
                        </span>
                      </button>
                    </td> 
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
                          v.IsVerified 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {v.IsVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} 
                        {v.IsVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === v.ID ? null : v.ID)} 
                        className={`p-2.5 rounded-xl transition-all ${activeDropdown === v.ID ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {activeDropdown === v.ID && (
                        <div ref={dropdownRef} className="absolute right-12 top-10 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                          <div className="p-1.5 space-y-0.5">
                              <button onClick={() => openDetailsModal(v)} className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg group/btn">
                                <Eye size={16} className="text-sky-400 group-hover/btn:text-sky-300" /> <span className="font-medium">View Details</span>
                              </button>
                              <button onClick={() => openEditModal(v)} className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg group/btn">
                                <Pencil size={16} className="text-indigo-400 group-hover/btn:text-indigo-300" /> <span className="font-medium">Edit Profile</span>
                              </button>
                              
                              <div className="h-px bg-slate-800 my-1 mx-1"></div>
                              
                              <button onClick={() => toggleBlockStatus(v)} className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg group/btn">
                                {v.IsBlocked ? <Unlock size={16} className="text-emerald-400" /> : <Ban size={16} className="text-amber-400" />} 
                                <span className="font-medium">{v.IsBlocked ? 'Unblock Access' : 'Block Access'}</span>
                              </button>
                              <button onClick={() => handleDelete(v.ID)} className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors text-rose-400 hover:bg-rose-500/10 rounded-lg font-medium">
                                <Trash2 size={16} /> <span>Delete Voter</span>
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
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30 shrink-0 backdrop-blur-md">
            <span>Showing {filteredVoters.length} voters</span>
            {searchTerm && filteredVoters.length !== voters.length && (
               <span className="text-indigo-400">Filtered from {voters.length} total</span>
            )}
        </div>
      </div>

      {/* --- REGISTER / EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={closeModal} />

          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="relative h-24 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 shrink-0 flex items-center justify-between px-8 border-b border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner border border-indigo-500/10">
                  {isEditing ? <Pencil size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{isEditing ? 'Update Voter Profile' : 'Register New Voter'}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Fill in mandatory details marked with (*)</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-colors backdrop-blur-sm"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8">

              {/* SECTION 1: PERSONAL INFO */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 text-sm font-bold shadow-sm">1</div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name <span className="text-red-500">*</span></label>
                    <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input required type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="input-field pl-12" placeholder="10-digit number" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Aadhaar Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input required value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })} className="input-field pl-12" placeholder="12-digit UIDAI number" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: JURISDICTION INFO */}
              <div className="space-y-5 pt-6 border-t border-slate-800/60">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 text-sm font-bold shadow-sm">2</div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Administrative Jurisdiction</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">District <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, block: '', local_body_name: '' })} className="input-field appearance-none cursor-pointer">
                        <option value="">Select District</option>
                        {KERALA_ADMIN_DATA.districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Local Body Type <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={form.local_body_type} onChange={(e) => setForm({ ...form, local_body_type: e.target.value, block: '', local_body_name: '' })} className="input-field appearance-none cursor-pointer">
                        <option value="Grama Panchayat">Grama Panchayat</option>
                        <option value="Municipality">Municipality</option>
                        <option value="Municipal Corporation">Municipal Corporation</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Block Selection (Conditional) */}
                  {form.local_body_type === 'Grama Panchayat' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Block Panchayat <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select required value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value, local_body_name: '' })} className="input-field appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={!form.district}>
                          <option value="">Select Block</option>
                          {form.district && KERALA_ADMIN_DATA.blocks[form.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Local Body Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={form.local_body_name} onChange={(e) => setForm({ ...form, local_body_name: e.target.value })} className="input-field appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={!form.district}>
                        <option value="">Select Name</option>
                        {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Ward No / Division <span className="text-red-500">*</span></label>
                    <input required value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} className="input-field" placeholder="e.g. 12" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Residential Address <span className="text-red-500">*</span></label>
                    <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field min-h-[100px] resize-none" placeholder="House Name, Street, Post Office..." />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-slate-800 bg-slate-900/50 sticky bottom-0">
                <button type="button" onClick={closeModal} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-[2] py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Save Changes' : 'Register Voter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" onClick={() => setShowDetailsModal(false)} />

          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ring-1 ring-white/10">

            {/* 1. HEADER BANNER */}
            <div className="relative h-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-sm z-10 border border-white/10"
              >
                <X size={18} />
              </button>

              {/* FLOATING AVATAR */}
              <div className="absolute -bottom-12 left-8 z-10">
                <div className="w-24 h-24 rounded-full bg-slate-900 p-1.5 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-200 border border-slate-700">
                    {selectedVoter.FullName?.charAt(0)}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CONTENT BODY */}
            <div className="px-8 pt-16 pb-8 overflow-y-auto custom-scrollbar">

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{selectedVoter.FullName}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-xs border border-indigo-500/20 font-mono font-medium">
                      ID: {selectedVoter.VoterID || selectedVoter.voter_id}
                    </span>
                  </div>
                </div>
                <div className="mt-1">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${selectedVoter.IsVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {selectedVoter.IsVerified ? 'Verified Account' : 'Verification Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-inner">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2"><ShieldCheck size={14} /> Identity Proofs</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5"><Phone size={10} /> Mobile Number</p><p className="text-slate-200 font-mono font-medium text-sm">{selectedVoter.Mobile || selectedVoter.mobile}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1.5"><CreditCard size={10} /> Aadhaar Number</p><p className="text-slate-200 font-mono font-medium text-sm">{selectedVoter.AadhaarNumber || selectedVoter.aadhaar_number}</p></div>
                  </div>
                </div>

                <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2"><MapPin size={14} /> Electoral Jurisdiction</h3>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">District</p><p className="text-slate-300 font-medium">{selectedVoter.District || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Block / Taluk</p><p className="text-slate-300 font-medium">{selectedVoter.Block || '-'}</p></div>
                    <div className="col-span-2 md:col-span-1"><p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Local Body</p><p className="text-slate-300 font-medium truncate" title={selectedVoter.Panchayath}>{selectedVoter.Panchayath || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Ward No</p><p className="text-slate-300 font-medium">{selectedVoter.Ward || '-'}</p></div>
                  </div>
                  <div className="pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5"><FileText size={12}/> Permanent Address</p>
                    <p className="text-slate-400 text-sm leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">{selectedVoter.Address || 'No address provided.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        .input-field { width: 100%; background-color: rgb(15 23 42 / 0.5); border: 1px solid rgb(51 65 85); color: white; border-radius: 0.75rem; padding: 0.875rem 1rem; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: rgb(99 102 241 / 0.5); box-shadow: 0 0 0 2px rgb(99 102 241 / 0.2); background-color: rgb(15 23 42); }
        .input-field::placeholder { color: rgb(100 116 139); }
      `}</style>
    </div>
  );
};

export default Voters;