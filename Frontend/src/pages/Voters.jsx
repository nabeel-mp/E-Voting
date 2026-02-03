import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, Plus, MoreVertical, User, Phone, CreditCard, X,
  Loader2, CheckCircle2, AlertCircle, Pencil, Ban, ChevronDown,
  AlertTriangle, Download, Upload, Eye, MapPin, Trash2, Hash, Users
} from 'lucide-react';

const Voters = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- Dynamic Admin Data State ---
  const [adminData, setAdminData] = useState({
    districts: [],
    blocks: {},
    municipalities: {},
    corporations: {},
    grama_panchayats: {}
  });

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // --- CONFIRMATION MODAL STATE ---
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, data: null });

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
  const initData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.get('/api/common/kerala-data');

      if (response.data && response.data.success) {
        let payload = response.data.data;

        const normalizeData = (data) => {
          if (Array.isArray(data)) {
            if (data.length > 0 && data[0].hasOwnProperty('Key') && data[0].hasOwnProperty('Value')) {
              return data.reduce((acc, item) => {
                acc[item.Key] = normalizeData(item.Value);
                return acc;
              }, {});
            }
            return data;
          }
          if (data && typeof data === 'object') {
            Object.keys(data).forEach(key => {
              data[key] = normalizeData(data[key]);
            });
          }
          return data;
        };

        const cleanPayload = normalizeData(payload);
        if (cleanPayload && cleanPayload.districts) {
          setAdminData(cleanPayload);
        }
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    }

    // Fetch Voters
    try {
      const votersRes = await api.get('/api/admin/voters');
      if (votersRes.data.success) {
        setVoters(votersRes.data.data || []);
      }
    } catch (err) {
      setErrorMsg("Failed to load directory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initData(); }, []);

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
    if (!form.district || !adminData) return [];

    if (form.local_body_type === 'Municipality') {
      return adminData.municipalities?.[form.district] || [];
    }
    if (form.local_body_type === 'Municipal Corporation') {
      return adminData.corporations?.[form.district] || [];
    }
    if (form.local_body_type === 'Grama Panchayat') {
      if (!form.block) return [];
      return adminData.grama_panchayats?.[form.block] || [];
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
      initData();
    } catch (err) {
      addToast(err.response?.data?.error || "Operation Failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW CONFIRMATION HANDLERS ---

  const initiateAction = (action, voter) => {
    setActiveDropdown(null);
    setConfirmModal({ show: true, action, data: voter });
  };

  const executeConfirmAction = async () => {
    const { action, data } = confirmModal;
    if (!data) return;

    setSubmitting(true);
    try {
      if (action === 'DELETE') {
        await api.delete(`/api/admin/voter/${data.ID}`);
        addToast("Voter deleted successfully", "success");
      }
      else if (action === 'BLOCK' || action === 'UNBLOCK') {
        const endpoint = action === 'UNBLOCK' ? "/api/admin/voter/unblock" : "/api/admin/voter/block";
        await api.post(endpoint, { voter_id: data.ID });
        addToast(`Voter ${action === 'UNBLOCK' ? 'unblocked' : 'blocked'} successfully`, "success");
      }
      initData();
      setConfirmModal({ show: false, action: null, data: null });
    } catch (err) {
      addToast(err.response?.data?.error || "Action failed", "error");
    } finally {
      setSubmitting(false);
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
    if (voter.IsVerified) {
      addToast("Cannot edit a verified voter. Profile is locked.", "error");
      setActiveDropdown(null);
      return;
    }
    setIsEditing(true);
    setSelectedVoter(voter);
    setForm({
      full_name: voter.FullName,
      mobile: voter.Mobile,
      aadhaar: voter.AadhaarNumber,
      address: voter.Address,
      district: voter.District || '',
      local_body_type: voter.LocalBodyType || 'Grama Panchayat',
      block: voter.Block || '',
      local_body_name: voter.Panchayath || '',
      ward: voter.Ward || ''
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
      initData();
    } catch (err) { addToast("Import failed", "error"); }
    finally { setLoading(false); e.target.value = null; }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-6 md:p-10 min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
            <Users size={14} className="text-indigo-700" />
            <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Registry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Voters <span className="italic text-slate-400 font-light">Directory</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Manage registered voters. Add, edit, or verify voter details securely.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all group">
            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Export CSV</span>
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

          <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all group">
            <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Import</span>
          </button>

          <button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            <Plus size={20} />
            <span>Register Voter</span>
          </button>
        </div>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <AlertTriangle size={20} /> <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Name, or Aadhaar..."
              className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-bold text-sm ${filterStatus !== 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}>
              <Filter size={16} /><span>{filterStatus === 'ALL' ? 'All Status' : filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}</span><ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-14 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-2 animate-in fade-in zoom-in-95 duration-100">
                {['ALL', 'VERIFIED', 'PENDING', 'BLOCKED'].map((status) => (
                  <button key={status} onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors flex items-center gap-2 font-medium ${filterStatus === status ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                    {status === 'VERIFIED' && <CheckCircle2 size={14} />}{status === 'BLOCKED' && <Ban size={14} />} {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 tracking-wider">Identity</th>
                <th className="px-8 py-5 tracking-wider">Contact</th>
                <th className="px-8 py-5 tracking-wider">Aadhaar</th>
                <th className="px-8 py-5 tracking-wider">Status</th>
                <th className="px-8 py-5 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && voters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                    <Loader2 className="animate-spin inline mr-2 text-indigo-600" /> Loading registry...
                  </td>
                </tr>
              ) : (
                filteredVoters.map((v) => (
                  <tr key={v.ID} className="group hover:bg-slate-50/80 transition-all duration-200">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                          {v.FullName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {v.FullName}
                            {v.IsBlocked && <div className="text-rose-500 bg-rose-50 rounded-full p-0.5" title="Access Blocked"><Ban size={12} /></div>}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {v.VoterID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Phone size={14} className="text-slate-400" />
                        <span className="font-mono">{v.Mobile}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg w-fit">
                        <CreditCard size={14} className="text-amber-500" />
                        <span className="font-mono text-xs text-slate-600 font-bold">{v.AadhaarNumber}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${v.IsVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {v.IsVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {v.IsVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button onClick={() => setActiveDropdown(activeDropdown === v.ID ? null : v.ID)} className={`p-2 rounded-xl transition-all ${activeDropdown === v.ID ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                        <MoreVertical size={18} />
                      </button>
                      {activeDropdown === v.ID && (
                        <div ref={dropdownRef} className="absolute right-12 top-10 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <button onClick={() => openDetailsModal(v)} className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium text-slate-600"><Eye size={14} className="text-sky-500" /> View Details</button>
                          <button
                            onClick={() => openEditModal(v)}
                            disabled={v.IsVerified}
                            className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors flex items-center gap-2 font-medium ${v.IsVerified ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                            title={v.IsVerified ? "Cannot edit verified voter" : "Edit Profile"}
                          >
                            <Pencil size={14} className={v.IsVerified ? "text-slate-300" : "text-indigo-500"} /> Edit Profile
                          </button>                          <div className="h-px bg-slate-100 my-1 mx-1"></div>
                          <button onClick={() => initiateAction(v.IsBlocked ? 'UNBLOCK' : 'BLOCK', v)} className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium text-slate-600"><Ban size={14} className="text-amber-500" /> {v.IsBlocked ? 'Unblock' : 'Block Access'}</button>
                          <button onClick={() => initiateAction('DELETE', v)} className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium text-rose-500"><Trash2 size={14} /> Delete Voter</button>
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="relative bg-slate-50 shrink-0 flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-indigo-600">{isEditing ? <Pencil size={24} /> : <User size={24} />}</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-serif">{isEditing ? 'Update Profile' : 'Register Voter'}</h2>
                  <p className="text-sm text-slate-500">Fill in mandatory details marked with (*)</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 text-xs font-bold">1</div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Personal Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name <span className="text-rose-500">*</span></label>
                    <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number <span className="text-rose-500">*</span></label>
                    <input required type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400" placeholder="10-digit number" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aadhaar Number <span className="text-rose-500">*</span></label>
                    <input required value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400" placeholder="12-digit UIDAI number" />
                  </div>
                </div>
              </div>

              <div className="space-y-5 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 text-xs font-bold">2</div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Jurisdiction</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">District <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, block: '', local_body_name: '' })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none font-medium cursor-pointer">
                        <option value="">Select District</option>
                        {adminData?.districts?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local Body Type <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select required value={form.local_body_type} onChange={(e) => setForm({ ...form, local_body_type: e.target.value, block: '', local_body_name: '' })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none font-medium cursor-pointer">
                        <option value="Grama Panchayat">Grama Panchayat</option>
                        <option value="Municipality">Municipality</option>
                        <option value="Municipal Corporation">Municipal Corporation</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {form.local_body_type === 'Grama Panchayat' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Block Panchayat *</label>
                      <div className="relative">
                        <select
                          required
                          value={form.block}
                          onChange={(e) => setForm({ ...form, block: e.target.value, local_body_name: '' })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none font-medium cursor-pointer disabled:opacity-50"
                          disabled={!form.district}
                        >
                          <option value="">Select Block</option>
                          {form.district && adminData?.blocks?.[form.district]?.map(blockName => (
                            <option key={blockName} value={blockName}>{blockName}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local Body Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select required value={form.local_body_name} onChange={(e) => setForm({ ...form, local_body_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none font-medium cursor-pointer disabled:opacity-50" disabled={!form.district}>
                        <option value="">Select Name</option>
                        {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ward No / Division <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input required value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-10 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400" placeholder="e.g. 12" />
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Residential Address <span className="text-rose-500">*</span></label>
                    <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400 min-h-[80px] resize-none" placeholder="House Name, Street, Post Office..." />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" /> : (isEditing ? 'Save Changes' : 'Register Voter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowDetailsModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="relative h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shrink-0">
              <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-all backdrop-blur-sm z-10"><X size={18} /></button>
              <div className="absolute -bottom-10 left-8 z-10">
                <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-600 border border-slate-200">{selectedVoter.FullName?.charAt(0)}</div>
                </div>
              </div>
            </div>
            <div className="px-8 pt-14 pb-8 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">{selectedVoter.FullName}</h2>
                  <div className="flex items-center gap-2 mt-1"><span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs border border-indigo-100 font-mono font-medium">ID: {selectedVoter.VoterID}</span></div>
                </div>
                <div className="mt-1"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedVoter.IsVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{selectedVoter.IsVerified ? 'Verified Account' : 'Verification Pending'}</span></div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Identity Proofs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Mobile</p><p className="text-slate-700 font-mono font-medium">{selectedVoter.Mobile}</p></div>
                    <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Aadhaar</p><p className="text-slate-700 font-mono font-medium">{selectedVoter.AadhaarNumber}</p></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} /> Jurisdiction</h3>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-sm">
                    <div><p className="text-[10px] text-slate-400 uppercase font-black">District</p><p className="text-slate-700 font-medium mt-0.5">{selectedVoter.District || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase font-black">Block / Taluk</p><p className="text-slate-700 font-medium mt-0.5">{selectedVoter.Block || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase font-black">Local Body</p><p className="text-slate-700 font-medium truncate mt-0.5">{selectedVoter.Panchayath || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase font-black">Ward No</p><p className="text-slate-700 font-medium mt-0.5">{selectedVoter.Ward || '-'}</p></div>
                  </div>
                  <div className="pt-4 border-t border-slate-200/60">
                    <p className="text-xs text-slate-400 uppercase font-black mb-2">Permanent Address</p>
                    <p className="text-slate-600 text-sm leading-relaxed bg-white p-3 rounded-xl border border-slate-200">{selectedVoter.Address || 'No address provided.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({ show: false, action: null, data: null })} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmModal.action === 'DELETE' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
              {confirmModal.action === 'DELETE' ? <Trash2 size={32} /> : <AlertTriangle size={32} />}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize font-serif">{confirmModal.action} Voter?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
              Are you sure you want to {confirmModal.action?.toLowerCase()} <strong>{confirmModal.data?.FullName}</strong>?
              {confirmModal.action === 'DELETE' && " This action cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, action: null, data: null })} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
              <button onClick={executeConfirmAction} disabled={submitting} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${confirmModal.action === 'DELETE' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}>
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Voters;