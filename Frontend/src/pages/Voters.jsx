import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, Plus, MoreVertical, User, Phone, CreditCard, X,
  Loader2, CheckCircle2, AlertCircle, Pencil, Ban, ChevronDown,
  AlertTriangle, Download, Upload, Eye, MapPin, Trash2, Hash, Users,
  MoreHorizontal
} from 'lucide-react';

const Voters = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [adminData, setAdminData] = useState({ districts: [], blocks: {}, municipalities: {}, corporations: {}, grama_panchayats: {} });

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const dropdownRef = useRef(null);
  const filterRef = useRef(null);
  const fileInputRef = useRef(null);

  /* -------------------------- DATA FETCHING -------------------------- */
  const initData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get('/api/common/kerala-data');
      if (response.data?.success) {
        // Recursive normalization
        const normalizeData = (data) => {
          if (Array.isArray(data)) {
            if (data.length > 0 && data[0].hasOwnProperty('Key')) {
              return data.reduce((acc, item) => { acc[item.Key] = normalizeData(item.Value); return acc; }, {});
            }
            return data;
          }
          return data;
        };
        setAdminData(normalizeData(response.data.data));
      }
      
      const votersRes = await api.get('/api/admin/voters');
      if (votersRes.data.success) setVoters(votersRes.data.data || []);
    } catch (err) { setErrorMsg("Failed to load directory data."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { initData(); }, []);

  // Close dropdowns on click outside
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
    const matchesSearch = (voter.FullName || '').toLowerCase().includes(q) || 
                          (voter.VoterID || '').toLowerCase().includes(q) || 
                          (voter.AadhaarNumber || '').toLowerCase().includes(q);
    
    let matchesStatus = true;
    if (filterStatus === 'VERIFIED') matchesStatus = voter.IsVerified;
    if (filterStatus === 'PENDING') matchesStatus = !voter.IsVerified;
    if (filterStatus === 'BLOCKED') matchesStatus = voter.IsBlocked;

    return matchesSearch && matchesStatus;
  });

  const getLocalBodyList = () => {
    if (!form.district || !adminData) return [];
    if (form.local_body_type === 'Municipality') return adminData.municipalities?.[form.district] || [];
    if (form.local_body_type === 'Municipal Corporation') return adminData.corporations?.[form.district] || [];
    if (form.local_body_type === 'Grama Panchayat') return adminData.grama_panchayats?.[form.block] || [];
    return [];
  };

  /* -------------------------- HANDLERS -------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, panchayath: form.local_body_name };
      isEditing ? await api.put(`/api/admin/voter/${selectedVoter.ID}`, payload) : await api.post('/api/admin/voter/register', payload);
      addToast(isEditing ? "Voter updated!" : "Voter registered!", "success");
      closeModal(); initData();
    } catch (err) { addToast(err.response?.data?.error || "Operation Failed", "error"); } 
    finally { setSubmitting(false); }
  };

  const initiateAction = (action, voter) => { setActiveDropdown(null); setConfirmModal({ show: true, action, data: voter }); };

  const executeConfirmAction = async () => {
    const { action, data } = confirmModal;
    setSubmitting(true);
    try {
      if (action === 'DELETE') await api.delete(`/api/admin/voter/${data.ID}`);
      else await api.post(action === 'UNBLOCK' ? "/api/admin/voter/unblock" : "/api/admin/voter/block", { voter_id: data.ID });
      addToast("Success", "success"); initData(); setConfirmModal({ show: false, action: null });
    } catch (err) { addToast("Failed", "error"); } 
    finally { setSubmitting(false); }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({ full_name: '', mobile: '', aadhaar: '', address: '', district: '', local_body_type: 'Grama Panchayat', block: '', local_body_name: '', ward: '' });
    setShowModal(true);
  };

  const openEditModal = (voter) => {
    if (voter.IsVerified) return addToast("Verified voters cannot be edited.", "error");
    setIsEditing(true); setSelectedVoter(voter);
    setForm({
      full_name: voter.FullName, mobile: voter.Mobile, aadhaar: voter.AadhaarNumber, address: voter.Address,
      district: voter.District || '', local_body_type: voter.LocalBodyType || 'Grama Panchayat',
      block: voter.Block || '', local_body_name: voter.Panchayath || '', ward: voter.Ward || ''
    });
    setShowModal(true); setActiveDropdown(null);
  };

  const closeModal = () => { setShowModal(false); setShowDetailsModal(false); };
  const handleFileChange = async (e) => { /* Import logic kept simple for brevity */ };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full">
            <Users size={14} className="text-indigo-700" />
            <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Voters <span className="italic text-slate-400 font-light">Directory</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light max-w-xl">
            Manage registered voters. Add, edit, or verify voter details securely.
          </p>
        </div>

        {/* Action Buttons: Grid on mobile, Flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full lg:w-auto">
          <button className="flex justify-center items-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all group shadow-sm">
            <Download size={18} /> <span className="hidden sm:inline">Export</span>
          </button>
          
          <button onClick={() => fileInputRef.current.click()} className="flex justify-center items-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all group shadow-sm">
            <Upload size={18} /> <span className="hidden sm:inline">Import</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

          <button onClick={openCreateModal} className="col-span-2 sm:col-span-1 flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            <Plus size={20} /> <span>Register Voter</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <AlertTriangle size={20} /> <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* --- DATA VIEW --- */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50 rounded-t-[2rem]">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Name..."
              className="w-full bg-white border border-slate-200 text-slate-700 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium shadow-sm"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`w-full sm:w-auto flex justify-between items-center gap-2 px-5 py-3 rounded-xl border transition-all font-bold text-sm shadow-sm ${filterStatus !== 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}>
              <div className="flex items-center gap-2"><Filter size={16} /><span>{filterStatus === 'ALL' ? 'Status' : filterStatus}</span></div>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-14 w-full sm:w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-2 animate-in fade-in slide-in-from-top-2">
                {['ALL', 'VERIFIED', 'PENDING', 'BLOCKED'].map((status) => (
                  <button key={status} onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors flex items-center gap-2 font-medium ${filterStatus === status ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                    {status === 'VERIFIED' ? <CheckCircle2 size={14}/> : status === 'BLOCKED' ? <Ban size={14}/> : <div className="w-3.5"/>} 
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 tracking-wider">Identity</th>
                <th className="px-8 py-5 tracking-wider">Contact</th>
                <th className="px-8 py-5 tracking-wider">Status</th>
                <th className="px-8 py-5 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVoters.map((v) => (
                <tr key={v.ID} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-50 text-indigo-600 border border-indigo-100">{v.FullName?.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">{v.FullName} {v.IsBlocked && <Ban size={12} className="text-rose-500"/>}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {v.VoterID}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><div className="flex items-center gap-2 font-mono text-slate-500"><Phone size={14} className="text-slate-400" />{v.Mobile}</div></td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${v.IsVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {v.IsVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />} {v.IsVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button onClick={() => setActiveDropdown(activeDropdown === v.ID ? null : v.ID)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><MoreHorizontal size={20} className="text-slate-400" /></button>
                    {activeDropdown === v.ID && (
                      <div ref={dropdownRef} className="absolute right-12 top-10 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95">
                        <button onClick={() => { setSelectedVoter(v); setShowDetailsModal(true); setActiveDropdown(null); }} className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-600"><Eye size={14} /> View Details</button>
                        <button onClick={() => openEditModal(v)} disabled={v.IsVerified} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-2 ${v.IsVerified ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-50'}`}><Pencil size={14} /> Edit</button>
                        <div className="h-px bg-slate-100 my-1"/>
                        <button onClick={() => initiateAction('DELETE', v)} className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-rose-50 text-rose-500 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW (Visible on Mobile) --- */}
        <div className="lg:hidden p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVoters.length === 0 ? (
             <div className="col-span-full py-10 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="animate-spin mb-2" />
                <span>No voters found</span>
             </div>
          ) : (
            filteredVoters.map((v) => (
              <div key={v.ID} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 relative">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">{v.FullName?.charAt(0)}</div>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{v.FullName}</h3>
                        <p className="text-xs text-slate-400 font-mono">ID: {v.VoterID}</p>
                      </div>
                   </div>
                   <button onClick={() => { setSelectedVoter(v); setShowDetailsModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600"><Eye size={18}/></button>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-b border-slate-50 py-3">
                   <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${v.IsVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {v.IsVerified ? 'Verified' : 'Pending'}
                   </span>
                   <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                      <Phone size={12}/> {v.Mobile}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => openEditModal(v)} disabled={v.IsVerified} className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 ${v.IsVerified ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      <Pencil size={12}/> Edit
                   </button>
                   <button onClick={() => initiateAction('DELETE', v)} className="py-2 rounded-xl text-xs font-bold border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center gap-1">
                      <Trash2 size={12}/> Delete
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- FORM MODAL (Responsive) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-100 bg-slate-50/80">
              <h2 className="text-xl font-bold font-serif">{isEditing ? 'Update Voter' : 'Register Voter'}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">
              {/* Form Fields (Simplified for brevity but responsive) */}
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Full Name *</label>
                    <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-indigo-500 outline-none transition-all" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Mobile *</label>
                       <input required type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Aadhaar *</label>
                       <input required value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                 </div>

                 {/* Jurisdiction Section */}
                 <div className="bg-indigo-50/50 p-5 rounded-2xl space-y-4 border border-indigo-100">
                    <h3 className="text-xs font-bold text-indigo-500 uppercase">Jurisdiction Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, block: '', local_body_name: '' })} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none">
                          <option value="">Select District</option>
                          {adminData?.districts?.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                       <select required value={form.local_body_type} onChange={(e) => setForm({ ...form, local_body_type: e.target.value, block: '', local_body_name: '' })} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none">
                          <option value="Grama Panchayat">Grama Panchayat</option>
                          <option value="Municipality">Municipality</option>
                          <option value="Municipal Corporation">Corporation</option>
                       </select>
                       {form.local_body_type === 'Grama Panchayat' && (
                         <select required value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value, local_body_name: '' })} disabled={!form.district} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none disabled:opacity-50">
                            <option value="">Select Block</option>
                            {form.district && adminData?.blocks?.[form.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                         </select>
                       )}
                       <select required value={form.local_body_name} onChange={(e) => setForm({ ...form, local_body_name: e.target.value })} disabled={!form.district} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none disabled:opacity-50">
                          <option value="">Select Local Body</option>
                          {getLocalBodyList().map(n => <option key={n} value={n}>{n}</option>)}
                       </select>
                       <input required placeholder="Ward No" value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl p-3.5 outline-none" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Address *</label>
                    <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-indigo-500 outline-none transition-all h-20 resize-none" />
                 </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : (isEditing ? 'Save Changes' : 'Register Voter')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
             <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 shrink-0 relative">
                <button onClick={closeModal} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full"><X size={18}/></button>
                <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-full p-1.5 shadow-lg">
                   <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-600 border">{selectedVoter.FullName?.charAt(0)}</div>
                </div>
             </div>
             <div className="pt-12 px-6 pb-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-900 font-serif">{selectedVoter.FullName}</h2>
                <p className="text-slate-500 font-mono text-xs mt-1">ID: {selectedVoter.VoterID}</p>
                
                <div className="mt-6 space-y-4">
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] uppercase font-bold text-slate-400">Mobile</p><p className="font-mono text-sm">{selectedVoter.Mobile}</p></div>
                      <div><p className="text-[10px] uppercase font-bold text-slate-400">Aadhaar</p><p className="font-mono text-sm">{selectedVoter.AadhaarNumber}</p></div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Location</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                         <p><span className="text-slate-400">Dist:</span> {selectedVoter.District}</p>
                         <p><span className="text-slate-400">Block:</span> {selectedVoter.Block}</p>
                         <p><span className="text-slate-400">Local:</span> {selectedVoter.Panchayath}</p>
                         <p><span className="text-slate-400">Ward:</span> {selectedVoter.Ward}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200">
                         <p className="text-xs text-slate-600">{selectedVoter.Address}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setConfirmModal({show:false})} />
           <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 text-center">
              <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmModal.action === 'DELETE' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                 <AlertTriangle size={28}/>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Action</h3>
              <p className="text-slate-500 text-sm mb-6">Are you sure you want to {confirmModal.action?.toLowerCase()} this voter?</p>
              <div className="flex gap-3">
                 <button onClick={() => setConfirmModal({show:false})} className="flex-1 py-3 border rounded-xl font-bold text-slate-600">Cancel</button>
                 <button onClick={executeConfirmAction} className={`flex-1 py-3 rounded-xl font-bold text-white ${confirmModal.action === 'DELETE' ? 'bg-rose-600' : 'bg-indigo-600'}`}>Confirm</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Voters;