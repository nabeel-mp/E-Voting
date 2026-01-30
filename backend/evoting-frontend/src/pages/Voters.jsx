import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, Plus, MoreVertical, User, Phone, CreditCard, X,
  Loader2, CheckCircle2, AlertCircle, Pencil, Ban, Unlock, ChevronDown,
  AlertTriangle, Download, Upload, Eye, MapPin, FileText, Trash2, Building
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
    // ... (Add other districts)
  },
  municipalities: {
    "Malappuram": ["Malappuram", "Manjeri", "Ponnani", "Tirur", "Perinthalmanna", "Nilambur", "Kottakkal", "Valanchery"],
    "Thiruvananthapuram": ["Neyyattinkara", "Nedumangad", "Attingal", "Varkala"],
    // ...
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
    "Manjeri": ["Thrikkalangode", "Pandikkad", "Edavanna", "Keezhuparamba"],
    "Kondotty": ["Cheekkode", "Cherukavu", "Kondotty", "Pulikkal", "Vazhayur"],
    "DEFAULT": ["Grama Panchayat 1", "Grama Panchayat 2"]
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Voters Directory</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-lg">Manage registered voters. Add, edit, or verify voter details securely.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="btn-secondary group"><Download size={18} className="group-hover:-translate-y-0.5 transition-transform" /> <span>Export CSV</span></button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          <button onClick={handleImportClick} className="btn-secondary group"><Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" /> <span>Import</span></button>
          <button onClick={openCreateModal} className="btn-primary shadow-lg shadow-indigo-500/20 active:scale-95"><Plus size={20} /> <span>Register Voter</span></button>
        </div>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertTriangle size={20} /> <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/40">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400" size={18} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by ID, Name, or Aadhaar..." className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600" />
          </div>
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-medium text-sm ${filterStatus !== 'ALL' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}>
              <Filter size={16} /><span>{filterStatus === 'ALL' ? 'All Status' : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}</span><ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-14 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                {['ALL', 'VERIFIED', 'PENDING', 'BLOCKED'].map((status) => (
                  <button key={status} onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${filterStatus === status ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    {status === 'VERIFIED' && <CheckCircle2 size={14} />}{status === 'BLOCKED' && <Ban size={14} />} {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800/80">
              <tr><th className="px-6 py-4">Identity</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Aadhaar</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
  {loading ? (
    <tr>
      <td colSpan="5" className="px-6 py-20 text-center">
        <Loader2 className="animate-spin inline" /> Loading...
      </td>
    </tr>
  ) : (
    filteredVoters.map((v) => (
      <tr key={v.ID} className="group hover:bg-slate-800/30 transition-all duration-200">
        
        {/* Identity Column */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-400 border border-indigo-500/20">
              {v.FullName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-slate-200">{v.FullName}</div>
              <div className="text-xs text-slate-500 font-mono">ID: {v.VoterID}</div>
            </div>
          </div>
        </td>

        {/* Contact Column */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Phone size={12} />
            <span className="font-mono">{v.Mobile}</span>
          </div>
        </td>

        {/* Aadhaar Column */}
        <td className="px-6 py-4">
          <button
            onClick={() => openDetailsModal(v)}
            className="group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all text-left w-full sm:w-auto"
            title="View Details"
          >
            <CreditCard size={14} className="text-amber-500 group-hover/btn:scale-110 transition-transform" />
            <span className="font-mono text-xs text-slate-300 group-hover/btn:text-white transition-colors">
              {v.AadhaarNumber}
            </span>
          </button>
        </td>

        {/* Status Column - FIXED: Removed stray spaces before this tag */}
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              v.IsVerified
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {v.IsVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {v.IsVerified ? 'Verified' : 'Pending'}
          </span>
        </td>

        {/* Actions Column */}
        <td className="px-6 py-4 text-right relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === v.ID ? null : v.ID)}
            className="p-2 rounded-lg text-slate-500 hover:text-white"
          >
            <MoreVertical size={18} />
          </button>
          {activeDropdown === v.ID && (
            <div
              ref={dropdownRef}
              className="absolute right-10 top-10 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5"
            >
              <button onClick={() => openDetailsModal(v)} className="dropdown-item">
                <Eye size={14} className="text-sky-400" /> View Details
              </button>
              <button onClick={() => openEditModal(v)} className="dropdown-item">
                <Pencil size={14} className="text-indigo-400" /> Edit Profile
              </button>
              <div className="h-px bg-slate-800 my-1 mx-1"></div>
              <button onClick={() => toggleBlockStatus(v)} className="dropdown-item">
                <Ban size={14} className="text-amber-400" /> {v.IsBlocked ? 'Unblock' : 'Block Access'}
              </button>
              <button onClick={() => handleDelete(v.ID)} className="dropdown-item text-rose-400">
                <Trash2 size={14} /> Delete Voter
              </button>
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

      {/* --- REGISTER / EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={closeModal} />

          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative h-24 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 shrink-0 flex items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shadow-inner">
                  {isEditing ? <Pencil size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{isEditing ? 'Update Voter Profile' : 'Register New Voter'}</h2>
                  <p className="text-xs text-slate-400">Fill in mandatory details marked with (*)</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-6">

              {/* SECTION 1: PERSONAL INFO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 text-xs font-bold">1</div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Full Name <span className="text-rose-500">*</span></label>
                    <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Mobile Number <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="input-field pl-10" placeholder="10-digit number" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Aadhaar Number <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input required value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })} className="input-field pl-10" placeholder="12-digit UIDAI number" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: JURISDICTION INFO */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 text-xs font-bold">2</div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Administrative Jurisdiction</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">District <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, block: '', local_body_name: '' })} className="input-field appearance-none">
                        <option value="">Select District</option>
                        {KERALA_ADMIN_DATA.districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Local Body Type <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select required value={form.local_body_type} onChange={(e) => setForm({ ...form, local_body_type: e.target.value, block: '', local_body_name: '' })} className="input-field appearance-none">
                        <option value="Grama Panchayat">Grama Panchayat</option>
                        <option value="Municipality">Municipality</option>
                        <option value="Municipal Corporation">Municipal Corporation</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* Block Selection (Conditional) */}
                  {form.local_body_type === 'Grama Panchayat' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Block Panchayat <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select required value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value, local_body_name: '' })} className="input-field appearance-none disabled:opacity-50 disabled:cursor-not-allowed" disabled={!form.district}>
                          <option value="">Select Block</option>
                          {form.district && KERALA_ADMIN_DATA.blocks[form.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Local Body Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select required value={form.local_body_name} onChange={(e) => setForm({ ...form, local_body_name: e.target.value })} className="input-field appearance-none disabled:opacity-50 disabled:cursor-not-allowed" disabled={!form.district}>
                        <option value="">Select Name</option>
                        {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Ward No / Division <span className="text-rose-500">*</span></label>
                    <input required value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} className="input-field" placeholder="e.g. 12" />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Full Residential Address <span className="text-rose-500">*</span></label>
                    <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field min-h-[80px]" placeholder="House Name, Street, Post Office..." />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">{submitting ? <Loader2 className="animate-spin" /> : (isEditing ? 'Save Changes' : 'Register Voter')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" onClick={() => setShowDetailsModal(false)} />

          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* 1. HEADER BANNER */}
            <div className="relative h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-sm z-10"
              >
                <X size={18} />
              </button>

              {/* FLOATING AVATAR */}
              <div className="absolute -bottom-10 left-6 z-10">
                <div className="w-24 h-24 rounded-full bg-slate-900 p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-200 border border-slate-700">
                    {selectedVoter.FullName?.charAt(0)}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CONTENT BODY */}
            <div className="px-6 pt-12 pb-6 overflow-y-auto custom-scrollbar">

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedVoter.FullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded text-xs border border-indigo-500/20 font-mono">
                      ID: {selectedVoter.VoterID || selectedVoter.voter_id}
                    </span>
                  </div>
                </div>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedVoter.IsVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {selectedVoter.IsVerified ? 'Verified Account' : 'Verification Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/40 rounded-xl border border-slate-800 p-4 space-y-4">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Identity Proofs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-500 mb-1">Mobile</p><p className="text-slate-200 font-mono font-medium">{selectedVoter.Mobile || selectedVoter.mobile}</p></div>
                    <div><p className="text-xs text-slate-500 mb-1">Aadhaar</p><p className="text-slate-200 font-mono font-medium">{selectedVoter.AadhaarNumber || selectedVoter.aadhaar_number}</p></div>
                  </div>
                </div>

                <div className="bg-slate-800/40 rounded-xl border border-slate-800 p-4 space-y-4">
                  <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> Jurisdiction</h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div><p className="text-[10px] text-slate-500 uppercase font-semibold">District</p><p className="text-slate-200 font-medium">{selectedVoter.District || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-semibold">Block / Taluk</p><p className="text-slate-200 font-medium">{selectedVoter.Block || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-semibold">Local Body</p><p className="text-slate-200 font-medium truncate">{selectedVoter.Panchayath || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-semibold">Ward No</p><p className="text-slate-200 font-medium">{selectedVoter.Ward || '-'}</p></div>
                  </div>
                  <div className="pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-1">Permanent Address</p>
                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800">{selectedVoter.Address || 'No address provided.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        .input-field { width: 100%; background-color: rgb(30 41 59); border: 1px solid rgb(51 65 85); color: white; border-radius: 0.75rem; padding: 0.625rem 1rem; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: rgb(99 102 241 / 0.5); ring: 2px solid rgb(99 102 241 / 0.2); }
        .dropdown-item { width: 100%; text-align: left; padding: 0.625rem 0.75rem; font-size: 0.875rem; border-radius: 0.5rem; transition: all 0.1s; display: flex; align-items: center; gap: 0.5rem; }
        .dropdown-item:hover { background-color: rgb(30 41 59); color: white; }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; background-color: rgb(79 70 229); color: white; padding: 0.625rem 1.25rem; border-radius: 0.75rem; font-weight: 500; transition: all 0.2s; }
        .btn-primary:hover { background-color: rgb(67 56 202); }
        .btn-secondary { display: flex; align-items: center; gap: 0.5rem; background-color: rgb(30 41 59); color: rgb(226 232 240); border: 1px solid rgb(51 65 85); padding: 0.625rem 1rem; border-radius: 0.75rem; font-weight: 500; transition: all 0.2s; }
        .btn-secondary:hover { background-color: rgb(51 65 85); }
      `}</style>
    </div>
  );
};

export default Voters;