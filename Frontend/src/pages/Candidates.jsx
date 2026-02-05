import React, {useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Flag, User, FileText, MoreVertical, 
  Loader2, X, Upload, Filter, Pencil, Trash2, Calendar, Lock, Eye, CheckCircle, Users,
  ChevronDown, AlertTriangle, MoreHorizontal
} from 'lucide-react';

const Candidates = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [elections, setElections] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
   
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  
  // --- View Details Modal State ---
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // --- Confirmation Modal State ---
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, id: null, name: '' });

  const [submitting, setSubmitting] = useState(false);
  
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [editingPartyId, setEditingPartyId] = useState(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [partyForm, setPartyForm] = useState({ name: '', logo: null });
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [candidateForm, setCandidateForm] = useState({ 
      full_name: '', election_id: '', party_id: '', bio: '', photo: null
  });
  const [candidatePhotoPreview, setCandidatePhotoPreview] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterParty, setFilterParty] = useState('ALL');

  const getLogoUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      const baseURL = "http://localhost:8080"; 
      return `${baseURL}${path}`;
  };

  const getId = (item) => item.id || item.ID;

  const fetchData = async () => {
    setLoading(true);
    try {
      const eRes = await api.get('/api/admin/elections');
      if (eRes.data.success) setElections(eRes.data.data);
    } catch (err) { console.warn("Failed to load elections", err); }

    try {
      const cRes = await api.get('/api/admin/candidates');
      if (cRes.data.success) setCandidates(cRes.data.data);
    } catch (err) { if (err.response?.status === 403) addToast("Access Denied", "error"); }

    try {
      const pRes = await api.get('/api/admin/parties');
      if (pRes.data.success) setParties(pRes.data.data);
    } catch (err) { console.error("Parties Access Denied", err); }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const candidatePartyId = candidate.party ? getId(candidate.party) : null;
    const matchesParty = filterParty === 'ALL' || (candidatePartyId && candidatePartyId.toString() === filterParty.toString());
    return matchesSearch && matchesParty;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPartyForm({ ...partyForm, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePartySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', partyForm.name);
      if (partyForm.logo) formData.append('logo', partyForm.logo);

      if (editingPartyId) {
          await api.put(`/api/admin/parties/${editingPartyId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          addToast("Party updated successfully!", "success");
      } else {
          await api.post('/api/admin/parties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          addToast("Party created successfully!", "success");
      }
      closePartyModal(); fetchData();
    } catch (err) { addToast(err.response?.data?.error || "Operation failed", "error"); } 
    finally { setSubmitting(false); }
  };

  const handleEditParty = (party) => {
      setEditingPartyId(getId(party));
      setPartyForm({ name: party.name, logo: null });
      setLogoPreview(party.logo || party.Logo ? getLogoUrl(party.logo || party.Logo) : null);
      setShowPartyModal(true);
  };

  const initiateDelete = (type, item) => {
      setActiveDropdown(null);
      setConfirmModal({ show: true, type: type, id: getId(item), name: type === 'PARTY' ? item.name : item.full_name });
  };

  const executeDelete = async () => {
      const { type, id } = confirmModal;
      setSubmitting(true);
      try {
          await api.delete(`/api/admin/${type === 'PARTY' ? 'parties' : 'candidates'}/${id}`);
          addToast(`${type === 'PARTY' ? 'Party' : 'Candidate'} deleted successfully`, "success");
          fetchData(); setConfirmModal({ show: false, type: null, id: null, name: '' });
      } catch (err) { addToast(err.response?.data?.error || "Failed to delete item", "error"); } 
      finally { setSubmitting(false); }
  };

  const closePartyModal = () => {
      setShowPartyModal(false); setEditingPartyId(null); setPartyForm({ name: '', logo: null }); setLogoPreview(null);
  };

  const handleCandidatePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCandidateForm({ ...candidateForm, photo: file });
      setCandidatePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', candidateForm.full_name);
      formData.append('election_id', candidateForm.election_id);
      formData.append('party_id', candidateForm.party_id);
      formData.append('bio', candidateForm.bio);
      if (candidateForm.photo) formData.append('candidate_photo', candidateForm.photo);

      if (editingCandidateId) {
          await api.put(`/api/admin/candidates/${editingCandidateId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          addToast("Candidate updated successfully!", "success");
      } else {
          await api.post('/api/admin/candidates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          addToast("Candidate registered successfully!", "success");
      }
      closeCandidateModal(); fetchData();
    } catch (err) { addToast(err.response?.data?.error || "Operation failed", "error"); } 
    finally { setSubmitting(false); }
  };

  const handleEditCandidate = (c) => {
      setEditingCandidateId(getId(c));
      setCandidateForm({ full_name: c.full_name, election_id: c.election_id || c.ElectionID, party_id: c.party_id || c.PartyID, bio: c.bio || '', photo: null });
      setCandidatePhotoPreview(c.photo || c.Photo ? getLogoUrl(c.photo || c.Photo) : null);
      setShowCandidateModal(true); setActiveDropdown(null);
  };

  const closeCandidateModal = () => {
      setShowCandidateModal(false); setEditingCandidateId(null); setCandidateForm({ full_name: '', election_id: '', party_id: '', bio: '', photo: null }); setCandidatePhotoPreview(null);
  };

  const openViewModal = (candidate) => { setSelectedCandidate(candidate); setActiveDropdown(null); setShowViewModal(true); };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 sm:p-6 lg:p-10 min-h-screen bg-[#f8fafc]">
       
      {/* --- RESPONSIVE HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full">
              <Users size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Nominations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Candidate <span className="italic text-slate-400 font-light">& Party Hub</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light">Orchestrate the participants of your democratic process.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:flex gap-3 w-full lg:w-auto">
          <button onClick={() => { closePartyModal(); setShowPartyModal(true); }} className="flex justify-center items-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all shadow-sm shadow-slate-100 active:scale-95">
            <Flag size={18} className="text-amber-500" /> <span className="hidden sm:inline">Add Party</span><span className="sm:hidden">Party</span>
          </button>
          <button onClick={() => { closeCandidateModal(); setShowCandidateModal(true); }} className="flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
            <Plus size={20} /> <span className="hidden sm:inline">New Candidate</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* --- RESPONSIVE PARTIES GRID --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {parties.map((p) => {
           const partyId = getId(p);
           return (
           <div key={partyId} className="group relative bg-white border border-slate-100 p-4 sm:p-5 rounded-[1.5rem] flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
             <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 p-1.5 shadow-inner">
                 {(p.logo || p.Logo) ? <img src={getLogoUrl(p.logo || p.Logo)} alt={p.name} className="w-full h-full object-contain" /> : <Flag className="text-slate-300" />}
             </div>
             <div className="flex-1 min-w-0 text-center sm:text-left">
               <h3 className="font-bold text-slate-900 truncate text-sm sm:text-base">{p.name}</h3>
               <p className="text-[10px] sm:text-xs text-slate-400 font-mono font-medium">ID: {partyId}</p>
             </div>
             {/* Edit/Delete Actions */}
             <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditParty(p)} className="p-1.5 bg-white text-slate-400 hover:text-indigo-600 rounded-full shadow-sm border border-slate-100"><Pencil size={12} /></button>
                <button onClick={() => initiateDelete('PARTY', p)} className="p-1.5 bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-sm border border-slate-100"><Trash2 size={12} /></button>
             </div>
           </div>
        )})}
      </div>

      {/* --- MAIN CANDIDATES SECTION --- */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 min-h-[500px] flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
            <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates..." 
                  className="w-full bg-white border border-slate-200 text-slate-900 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:border-indigo-500 font-medium shadow-sm"
                />
            </div>
            <div className="relative w-full sm:w-64">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select value={filterParty} onChange={(e) => setFilterParty(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-600 pl-12 pr-10 py-3 rounded-2xl focus:outline-none focus:border-indigo-500 font-medium appearance-none shadow-sm">
                    <option value="ALL">All Parties</option>
                    {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
        </div>

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden lg:block overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Candidate Profile</th>
                <th className="px-6 py-5">Affiliation</th>
                <th className="px-6 py-5">Election Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loading ? (
                   <tr><td colSpan="4" className="px-6 py-20 text-center"><Loader2 className="animate-spin text-indigo-600 mx-auto" /></td></tr>
               ) : filteredCandidates.length === 0 ? (
                   <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400">No candidates found.</td></tr>
               ) : filteredCandidates.map(c => {
                   const cId = getId(c);
                   const elec = elections.find(e => getId(e) === c.election_id || getId(e) === c.ElectionID);
                   const isEnded = elec ? new Date(elec.end_date) < new Date() : false;
                   const isActive = elec?.is_active;
                   const isLocked = isActive && !isEnded;

                   return (
                   <tr key={cId} className="group hover:bg-slate-50/80 transition-colors">
                     <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {(c.photo || c.Photo) ? <img src={getLogoUrl(c.photo || c.Photo)} className="w-full h-full object-cover" /> : <User className="text-slate-400" />}
                         </div>
                         <div><span className="text-slate-900 font-bold block">{c.full_name}</span><span className="text-xs text-slate-400 font-mono">ID: {cId}</span></div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                           {c.party?.logo ? <img src={getLogoUrl(c.party.logo)} className="w-6 h-6 object-contain bg-white rounded-md border p-0.5" /> : <Flag size={14} className="text-slate-400" />}
                           <span className="text-slate-700 font-semibold">{c.party?.name || 'Independent'}</span>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                        {elec ? (
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-sm font-medium">{elec.title}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${isEnded ? 'bg-slate-100 text-slate-500' : isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600'}`}>
                                    {isEnded ? 'Closed' : isActive ? 'Live' : 'Upcoming'}
                                </span>
                            </div>
                        ) : <span className="text-slate-400 italic">Unknown</span>}
                     </td>
                     <td className="px-8 py-5 text-right relative">
                       <button onClick={() => setActiveDropdown(activeDropdown === cId ? null : cId)} className="p-2 hover:bg-slate-100 rounded-lg"><MoreVertical size={20} className="text-slate-400"/></button>
                       {activeDropdown === cId && (
                           <div ref={dropdownRef} className="absolute right-12 top-10 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95">
                               <button onClick={() => openViewModal(c)} className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-slate-50 flex items-center gap-2"><Eye size={14} className="text-sky-500"/> View</button>
                               <button onClick={() => handleEditCandidate(c)} disabled={isLocked} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 ${isLocked ? 'text-slate-300' : 'hover:bg-slate-50'}`}><Pencil size={14}/> Edit</button>
                               <div className="h-px bg-slate-100 my-1"/>
                               <button onClick={() => initiateDelete('CANDIDATE', c)} disabled={isLocked} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 ${isLocked ? 'text-slate-300' : 'text-rose-600 hover:bg-rose-50'}`}><Trash2 size={14}/> Delete</button>
                           </div>
                       )}
                     </td>
                   </tr>
                 )})}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW --- */}
        <div className="lg:hidden p-4 space-y-4 bg-slate-50/50">
             {loading ? <Loader2 className="animate-spin mx-auto text-indigo-600" /> : filteredCandidates.length === 0 ? <p className="text-center text-slate-400 py-10">No candidates found.</p> : 
              filteredCandidates.map(c => {
                 const cId = getId(c);
                 const elec = elections.find(e => getId(e) === c.election_id || getId(e) === c.ElectionID);
                 const isLocked = elec?.is_active && new Date(elec?.end_date) > new Date();

                 return (
                 <div key={cId} onClick={() => openViewModal(c)} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              {(c.photo || c.Photo) ? <img src={getLogoUrl(c.photo || c.Photo)} className="w-full h-full object-cover" /> : <User className="text-slate-400 m-3" />}
                           </div>
                           <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 leading-tight truncate">{c.full_name}</h3>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                 {c.party?.logo ? <img src={getLogoUrl(c.party.logo)} className="w-4 h-4 object-contain"/> : <Flag size={10}/>}
                                 <span className="truncate">{c.party?.name || 'Independent'}</span>
                              </div>
                           </div>
                        </div>
                        {/* Mobile Actions */}
                        <div className="flex gap-2 shrink-0">
                           <button onClick={(e) => { e.stopPropagation(); handleEditCandidate(c); }} disabled={isLocked} className={`p-2 rounded-lg border ${isLocked ? 'bg-slate-50 text-slate-300' : 'bg-slate-50 text-slate-500 border-slate-200'}`}><Pencil size={16}/></button>
                           <button onClick={(e) => { e.stopPropagation(); initiateDelete('CANDIDATE', c); }} disabled={isLocked} className={`p-2 rounded-lg border ${isLocked ? 'bg-slate-50 text-slate-300' : 'bg-rose-50 text-rose-500 border-rose-100'}`}><Trash2 size={16}/></button>
                        </div>
                    </div>
                    
                    {elec && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                           <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Election</span>
                              <span className="text-slate-700 font-medium truncate max-w-[180px]">{elec.title}</span>
                           </div>
                           {isLocked && <Lock size={12} className="text-slate-400"/>}
                        </div>
                    )}
                 </div>
              )})}
        </div>
      </div>

      {/* --- ADD CANDIDATE MODAL --- */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeCandidateModal} />
           <div className="relative bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
              
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-[2rem]">
                 <h2 className="text-xl font-bold font-serif">{editingCandidateId ? 'Edit Candidate' : 'New Candidate'}</h2>
                 <button onClick={closeCandidateModal} className="p-2 bg-white rounded-full shadow-sm"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleCandidateSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 group cursor-pointer">
                        <div className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center bg-slate-50 shadow-inner ${candidatePhotoPreview ? 'border-indigo-500' : 'border-dashed border-slate-300'}`}>
                            {candidatePhotoPreview ? <img src={candidatePhotoPreview} className="w-full h-full object-cover" /> : <User className="text-slate-300" size={32} />}
                        </div>
                        <input type="file" accept="image/*" onChange={handleCandidatePhotoChange} className="absolute inset-0 opacity-0 z-10" />
                        <div className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white shadow-lg pointer-events-none"><Upload size={12} /></div>
                    </div>
                 </div>

                 <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Full Name *</label>
                        <input required value={candidateForm.full_name} onChange={e => setCandidateForm({...candidateForm, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-indigo-500 outline-none transition-all font-medium" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Election *</label>
                        <select required value={candidateForm.election_id} onChange={e => setCandidateForm({...candidateForm, election_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none">
                           <option value="">Select Election...</option>
                           {elections.map(e => <option key={getId(e)} value={getId(e)} disabled={e.is_active}>{e.title}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Party *</label>
                        <select required value={candidateForm.party_id} onChange={e => setCandidateForm({...candidateForm, party_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none">
                           <option value="">Select Party...</option>
                           {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase">Bio</label>
                        <textarea rows="3" value={candidateForm.bio} onChange={e => setCandidateForm({...candidateForm, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none resize-none" placeholder="Short manifesto..." />
                     </div>
                 </div>

                 <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                    {submitting ? <Loader2 className="animate-spin mx-auto" /> : (editingCandidateId ? 'Save Changes' : 'Register Candidate')}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* --- ADD PARTY MODAL --- */}
      {showPartyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closePartyModal} />
           <div className="relative bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
              <div className="p-6 sm:p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-serif flex items-center gap-2"><Flag className="text-amber-500" /> {editingPartyId ? 'Edit Party' : 'New Party'}</h2>
                    <button onClick={closePartyModal} className="p-2 bg-slate-50 rounded-full"><X size={20} /></button>
                 </div>
                 <form onSubmit={handlePartySubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Name *</label>
                       <input required value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-amber-500 transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Logo</label>
                       <div className="relative w-full h-32 border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-xl flex items-center justify-center bg-slate-50 transition-colors">
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                          {logoPreview ? <img src={logoPreview} className="h-full object-contain p-2" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1"/><span className="text-xs">Upload Logo</span></div>}
                       </div>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">
                       {submitting ? <Loader2 className="animate-spin mx-auto" /> : (editingPartyId ? 'Update' : 'Create')}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {showViewModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
           <div className="relative bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
               <div className="h-28 bg-gradient-to-r from-indigo-500 to-purple-600 shrink-0 relative">
                  <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full"><X size={18} /></button>
               </div>
               <div className="px-6 sm:px-8 pb-8 -mt-12 overflow-y-auto">
                   <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-lg relative z-10">
                         <div className="w-full h-full rounded-full overflow-hidden border border-slate-200">
                            {(selectedCandidate.photo || selectedCandidate.Photo) ? <img src={getLogoUrl(selectedCandidate.photo || selectedCandidate.Photo)} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-slate-300" />}
                         </div>
                      </div>
                   </div>
                   <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold font-serif">{selectedCandidate.full_name}</h2>
                      <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                         {selectedCandidate.party?.name || 'Independent'}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Running For</p>
                         <p className="font-bold text-slate-800">{elections.find(e => getId(e) === selectedCandidate.election_id)?.title || 'Unknown'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Manifesto</p>
                         <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedCandidate.bio || "No bio available."}</p>
                      </div>
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmModal({ show: false, type: null, id: null, name: '' })} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-rose-50 text-rose-500">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete {confirmModal.type === 'PARTY' ? 'Party' : 'Candidate'}?</h3>
            <p className="text-slate-500 mb-8 text-sm">Are you sure you want to delete <strong>{confirmModal.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, type: null, id: null, name: '' })} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Candidates;