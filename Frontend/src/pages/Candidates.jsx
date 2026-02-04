import React, {useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Flag, User, FileText, MoreVertical, 
  Loader2, X, Upload, Filter, Pencil, Trash2, Calendar, Lock, Eye, CheckCircle, Users,
  ChevronDown, AlertTriangle
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
      full_name: '', 
      election_id: '', 
      party_id: '', 
      bio: '', 
      photo: null
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

  useEffect(() => {
    console.log("Current User Permissions:", user?.permissions);
    fetchData(); 
}, []);

  const getId = (item) => item.id || item.ID;

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Elections (Usually accessible to all staff)
    try {
      const eRes = await api.get('/api/admin/elections');
      if (eRes.data.success) setElections(eRes.data.data);
    } catch (err) {
      console.warn("Failed to load elections", err);
    }

    // 2. Fetch Candidates (Protected by 'manage_candidates')
    try {
      const cRes = await api.get('/api/admin/candidates');
      if (cRes.data.success) setCandidates(cRes.data.data);
    } catch (err) {
      console.error("Candidates Access Denied", err);
      // Optional: Show a specific toast only if you want to alert the user
      if (err.response?.status === 403) addToast("No permission to view candidates", "error");
    }

    // 3. Fetch Parties (Protected by 'manage_parties')
    try {
      const pRes = await api.get('/api/admin/parties');
      if (pRes.data.success) setParties(pRes.data.data);
    } catch (err) {
      console.error("Parties Access Denied", err);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || (
        candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const candidatePartyId = candidate.party ? getId(candidate.party) : null;
    const matchesParty = filterParty === 'ALL' || (
        candidatePartyId && candidatePartyId.toString() === filterParty.toString()
    );
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
          await api.put(`/api/admin/parties/${editingPartyId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          addToast("Party updated successfully!", "success");
      } else {
          await api.post('/api/admin/parties', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          addToast("Party created successfully!", "success");
      }

      closePartyModal();
      fetchData();
    } catch (err) { 
        addToast(err.response?.data?.error || "Operation failed", "error"); 
    } finally { 
        setSubmitting(false); 
    }
  };

  const handleEditParty = (party) => {
      setEditingPartyId(getId(party));
      setPartyForm({ name: party.name, logo: null });
      setLogoPreview(party.logo || party.Logo ? getLogoUrl(party.logo || party.Logo) : null);
      setShowPartyModal(true);
  };

  // --- CONFIRMATION HANDLERS ---

  const initiateDelete = (type, item) => {
      setActiveDropdown(null);
      setConfirmModal({ 
          show: true, 
          type: type, 
          id: getId(item), 
          name: type === 'PARTY' ? item.name : item.full_name 
      });
  };

  const executeDelete = async () => {
      const { type, id } = confirmModal;
      if (!id) return;

      setSubmitting(true);
      try {
          if (type === 'PARTY') {
              await api.delete(`/api/admin/parties/${id}`);
              addToast("Party deleted successfully", "success");
          } else if (type === 'CANDIDATE') {
              await api.delete(`/api/admin/candidates/${id}`);
              addToast("Candidate deleted successfully", "success");
          }
          fetchData();
          setConfirmModal({ show: false, type: null, id: null, name: '' });
      } catch (err) {
          addToast(err.response?.data?.error || "Failed to delete item", "error");
      } finally {
          setSubmitting(false);
      }
  };

  const closePartyModal = () => {
      setShowPartyModal(false);
      setEditingPartyId(null);
      setPartyForm({ name: '', logo: null });
      setLogoPreview(null);
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
          await api.put(`/api/admin/candidates/${editingCandidateId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          addToast("Candidate updated successfully!", "success");
      } else {
          await api.post('/api/admin/candidates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          addToast("Candidate registered successfully!", "success");
      }

      closeCandidateModal();
      fetchData();
    } catch (err) { 
        addToast(err.response?.data?.error || "Operation failed", "error"); 
    } finally { setSubmitting(false); }
  };

  const handleEditCandidate = (c) => {
      setEditingCandidateId(getId(c));
      setCandidateForm({
          full_name: c.full_name,
          election_id: c.election_id || c.ElectionID, 
          party_id: c.party_id || c.PartyID,
          bio: c.bio || '',
          photo: null
      });
      setCandidatePhotoPreview(c.photo || c.Photo ? getLogoUrl(c.photo || c.Photo) : null);
      setShowCandidateModal(true);
      setActiveDropdown(null);
  };

  const closeCandidateModal = () => {
      setShowCandidateModal(false);
      setEditingCandidateId(null);
      setCandidateForm({ full_name: '', election_id: '', party_id: '', bio: '', photo: null });
      setCandidatePhotoPreview(null);
  };

  const openViewModal = (candidate) => {
      setSelectedCandidate(candidate);
      setActiveDropdown(null);
      setShowViewModal(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-6 md:p-10 min-h-screen bg-[#f8fafc]">
       
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
              <Users size={14} className="text-indigo-700" />
              <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Nominations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Candidate & <span className="italic text-slate-400 font-light">Party Hub</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Orchestrate the participants of your democratic process.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { closePartyModal(); setShowPartyModal(true); }} 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
          >
            <Flag size={18} className="text-amber-500" />
            <span>Add Party</span>
          </button>
          <button 
            onClick={() => { closeCandidateModal(); setShowCandidateModal(true); }} 
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>New Candidate</span>
          </button>
        </div>
      </div>

      {/* Party Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {parties.map((p) => {
           const partyId = getId(p);
           return (
           <div key={partyId} className="group relative bg-white border border-slate-100 p-6 rounded-[2rem] flex items-center gap-4 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
             <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 p-1.5 shadow-inner">
                 {(p.logo || p.Logo) ? (
                     <img src={getLogoUrl(p.logo || p.Logo)} alt={p.name} className="w-full h-full object-contain" />
                 ) : (
                    <Flag className="text-slate-300" />
                 )}
             </div>
             <div className="flex-1 min-w-0">
               <h3 className="font-bold text-slate-900 truncate text-lg">{p.name}</h3>
               <p className="text-xs text-slate-400 font-mono font-medium">ID: {partyId}</p>
             </div>
             
             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => handleEditParty(p)} className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-full shadow-sm hover:shadow border border-slate-100 transition-all"><Pencil size={14} /></button>
                <button onClick={() => initiateDelete('PARTY', p)} className="p-2 bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-sm hover:shadow border border-slate-100 transition-all"><Trash2 size={14} /></button>
             </div>
           </div>
        )})}
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 min-h-[600px] flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates by name..." 
                  className="w-full bg-white border border-slate-200 text-slate-900 pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                />
            </div>
            <div className="relative w-full sm:w-64">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select
                    value={filterParty}
                    onChange={(e) => setFilterParty(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-600 pl-12 pr-10 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer transition-all font-medium hover:bg-slate-50"
                >
                    <option value="ALL">All Parties</option>
                    {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>

        {/* Candidates Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-8 py-5">Candidate Profile</th>
                <th className="px-6 py-5">Affiliation</th>
                <th className="px-6 py-5">Election Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loading ? (
                   <tr><td colSpan="4" className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /><span className="text-slate-400 font-medium">Loading candidates...</span></div></td></tr>
               ) : filteredCandidates.length === 0 ? (
                   <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400">No candidates found matching your criteria.</td></tr>
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
                         <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                            {(c.photo || c.Photo) ? (
                                <img src={getLogoUrl(c.photo || c.Photo)} className="w-full h-full object-cover" alt={c.full_name} />
                            ) : (
                                <User className="text-slate-400" size={24} />
                            )}
                         </div>
                         <div>
                            <span className="text-slate-900 font-bold text-base block">{c.full_name}</span>
                            <span className="text-xs text-slate-400 font-mono mt-0.5 block">ID: {cId}</span>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                           {c.party?.logo ? (
                               <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center border border-slate-200 shadow-sm">
                                    <img src={getLogoUrl(c.party.logo)} className="max-w-full max-h-full object-contain" />
                               </div>
                           ) : (
                               <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center border border-slate-200"><Flag size={14} className="text-slate-400" /></div>
                           )}
                           <span className="text-slate-700 font-semibold">{c.party?.name || 'Independent'}</span>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                        {elec ? (
                            <div className="flex flex-col items-start gap-1.5">
                                <span className="text-sm text-slate-600 font-medium">{elec.title}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                    isEnded 
                                    ? 'bg-slate-100 text-slate-500 border-slate-200' 
                                    : isActive
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                    {isEnded ? 'Election Closed' : (isActive ? '● Live Now' : 'Upcoming')}
                                </span>
                            </div>
                        ) : <span className="text-slate-400 italic">Unknown Election</span>}
                     </td>
                     <td className="px-8 py-5 text-right relative">
                       <button 
                           onClick={() => setActiveDropdown(activeDropdown === cId ? null : cId)}
                           className={`p-2.5 rounded-xl transition-all ${activeDropdown === cId ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                       >
                           <MoreVertical size={20} />
                       </button>
                       
                       {/* Dropdown Menu */}
                       {activeDropdown === cId && (
                           <div ref={dropdownRef} className="absolute right-12 top-10 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                               <div className="p-1.5 space-y-0.5">
                                   <button 
                                           onClick={() => openViewModal(c)} 
                                           className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg group/btn font-medium"
                                   >
                                           <Eye size={16} className="text-sky-500" /> 
                                           <span>View Profile</span>
                                   </button>

                                   <div className="h-px bg-slate-100 my-1 mx-1"></div>

                                   <button 
                                           onClick={() => handleEditCandidate(c)} 
                                           disabled={isLocked}
                                           className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors rounded-lg font-medium ${
                                               isLocked 
                                               ? 'text-slate-400 cursor-not-allowed' 
                                               : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                                           }`}
                                   >
                                           <Pencil size={16} className={isLocked ? 'opacity-50' : 'text-indigo-500'} /> 
                                           <span>Edit Details</span>
                                           {isLocked && <Lock size={12} className="ml-auto text-slate-400" />}
                                   </button>
                                   
                                   <button 
                                           onClick={() => initiateDelete('CANDIDATE', c)} 
                                           disabled={isLocked}
                                           className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors rounded-lg font-medium ${
                                               isLocked 
                                               ? 'text-slate-400 cursor-not-allowed' 
                                               : 'text-rose-600 hover:bg-rose-50'
                                           }`}
                                   >
                                           <Trash2 size={16} /> 
                                           <span>Delete</span>
                                   </button>
                               </div>
                           </div>
                       )}
                     </td>
                   </tr>
                 );
               })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW DETAILS MODAL --- */}
      {showViewModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowViewModal(false)} />
           <div className="relative bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
               
               {/* Header Banner */}
               <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 relative overflow-hidden">
                   <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-md border border-white/20">
                       <X size={18} />
                   </button>
               </div>

               <div className="px-8 pb-8 relative">
                     {/* Candidate Avatar */}
                     <div className="-mt-16 mb-4 flex justify-center">
                        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center relative z-10 group">
                            {(selectedCandidate.photo || selectedCandidate.Photo) ? (
                                <img src={getLogoUrl(selectedCandidate.photo || selectedCandidate.Photo)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <User className="text-slate-300 w-12 h-12" />
                            )}
                        </div>
                     </div>

                     <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-serif">{selectedCandidate.full_name}</h2>
                        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                            <span className="text-indigo-700 font-bold text-sm">{selectedCandidate.party?.name || 'Independent'}</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                         {/* Election Card */}
                         <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
                             <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-slate-100">
                                <Calendar size={20} />
                             </div>
                             <div>
                                 <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Contesting In</p>
                                 <p className="text-slate-800 font-bold text-lg leading-tight">
                                    {elections.find(e => getId(e) === selectedCandidate.election_id)?.title || 'Unknown Election'}
                                 </p>
                             </div>
                         </div>

                         {/* Bio Card */}
                         <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-2 mb-3 text-slate-800">
                                <FileText size={18} className="text-indigo-600" />
                                <span className="font-black text-xs uppercase tracking-widest">Manifesto / Bio</span>
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                 {selectedCandidate.bio || "No detailed biography provided for this candidate."}
                             </p>
                         </div>

                         {/* Party Card */}
                         {selectedCandidate.party && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-black mb-1">Party Affiliation</p>
                                    <p className="font-bold text-slate-900 text-lg">{selectedCandidate.party.name}</p>
                                </div>
                                <div className="w-14 h-14 bg-slate-50 rounded-xl p-2 flex items-center justify-center border border-slate-100">
                                    {(selectedCandidate.party.logo || selectedCandidate.party.Logo) ? (
                                        <img src={getLogoUrl(selectedCandidate.party.logo || selectedCandidate.party.Logo)} className="max-w-full max-h-full object-contain" />
                                    ) : <Flag className="text-slate-300" />}
                                </div>
                            </div>
                         )}
                     </div>
                </div>
           </div>
        </div>
      )}

      {/* --- ADD CANDIDATE MODAL --- */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeCandidateModal} />
           <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
              
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">{editingCandidateId ? 'Edit Candidate' : 'Register Candidate'}</h2>
                    <p className="text-slate-500 text-sm mt-1">Enter candidate details for the election.</p>
                 </div>
                 <button onClick={closeCandidateModal} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all shadow-sm"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleCandidateSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 {/* Photo Upload */}
                 <div className="flex justify-center">
                    <div className="relative w-28 h-28 group cursor-pointer">
                        <div className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center bg-slate-50 shadow-inner transition-all ${candidatePhotoPreview ? 'border-indigo-500' : 'border-slate-200 border-dashed group-hover:border-slate-400'}`}>
                            {candidatePhotoPreview ? (
                                <img src={candidatePhotoPreview} className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-300 group-hover:text-slate-400 transition-colors" size={40} />
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleCandidatePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white shadow-lg pointer-events-none group-hover:scale-110 transition-transform">
                            <Upload size={14} />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-5">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name <span className="text-rose-500">*</span></label>
                        <input required placeholder="e.g. John Doe" value={candidateForm.full_name} onChange={e => setCandidateForm({...candidateForm, full_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium" />
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Election Event <span className="text-red-500">*</span></label>
                        <div className="relative">
                           <select 
                              required 
                              value={candidateForm.election_id} 
                              onChange={e => setCandidateForm({...candidateForm, election_id: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer transition-all font-medium"
                           >
                              <option value="">Select Election...</option>
                              {elections.map(e => {
                                   const isEnded = new Date(e.end_date) < new Date();
                                   const isDisabled = e.is_active || isEnded;
                                   return (
                                      <option key={getId(e)} value={getId(e)} disabled={isDisabled}>
                                          {e.title} {e.is_active ? '(Active - Locked)' : (isEnded ? '(Ended)' : '')}
                                      </option>
                                   );
                              })}
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Users size={16} />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Political Party <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select required value={candidateForm.party_id} onChange={e => setCandidateForm({...candidateForm, party_id: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer transition-all font-medium">
                                <option value="">Select Affiliation...</option>
                                {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <Flag size={16} />
                            </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Bio / Manifesto</label>
                        <textarea 
                            rows="4"
                            value={candidateForm.bio}
                            onChange={e => setCandidateForm({...candidateForm, bio: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="Write a brief manifesto or biography..."
                        />
                     </div>
                 </div>

                 <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin" /> : (editingCandidateId ? 'Update Candidate Profile' : 'Register Candidate')}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* --- ADD PARTY MODAL --- */}
      {showPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closePartyModal} />
           <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="p-8">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 font-serif">
                            <Flag className="text-amber-500" /> {editingPartyId ? 'Update Party' : 'New Party'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Manage political entities.</p>
                    </div>
                    <button onClick={closePartyModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full"><X size={24} /></button>
                 </div>
                 
                 <form onSubmit={handlePartySubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Party Name <span className="text-red-500">*</span></label>
                       <input required placeholder="e.g. Democratic Alliance" value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-400 font-medium" />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Party Logo</label>
                       <div className="relative group w-full h-40 border-2 border-dashed border-slate-200 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer bg-slate-50">
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          {logoPreview ? (
                              <img src={logoPreview} className="h-full w-full object-contain p-2" />
                          ) : (
                              <>
                                <Upload className="text-slate-400 mb-2 group-hover:text-amber-500 transition-colors" size={28} />
                                <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700">Click to upload logo</span>
                              </>
                          )}
                       </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold mt-2 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2">
                       {submitting ? <Loader2 className="animate-spin" /> : (editingPartyId ? 'Save Changes' : 'Create Party')}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({ show: false, type: null, id: null, name: '' })} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-rose-50 text-rose-500">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize font-serif">Delete {confirmModal.type === 'PARTY' ? 'Party' : 'Candidate'}?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Are you sure you want to delete <strong>{confirmModal.name}</strong>? 
                {confirmModal.type === 'PARTY' && " This is only possible if no candidates are linked."}
                <br/>This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, type: null, id: null, name: '' })} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
              <button onClick={executeDelete} disabled={submitting} className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all bg-rose-600 hover:bg-rose-700 shadow-rose-500/20">
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Candidates;