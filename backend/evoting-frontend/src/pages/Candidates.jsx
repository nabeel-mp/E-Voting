import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Flag, User, FileText, MoreVertical, 
  Loader2, X, Upload, Filter, Pencil, Trash2, Calendar, Lock, Eye, CheckCircle
} from 'lucide-react';

const Candidates = () => {
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

  const getId = (item) => item.id || item.ID;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes, eRes] = await Promise.all([
        api.get('/api/admin/candidates'),
        api.get('/api/admin/parties'),
        api.get('/api/admin/elections') 
      ]);
      if (cRes.data.success) setCandidates(cRes.data.data);
      if (pRes.data.success) setParties(pRes.data.data);
      if (eRes.data.success) setElections(eRes.data.data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
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

  const handleDeleteParty = async (id) => {
      if(!window.confirm("Delete this party? Action allowed only if no candidates are linked.")) return;
      try {
          await api.delete(`/api/admin/parties/${id}`);
          addToast("Party deleted successfully", "success");
          fetchData();
      } catch (err) {
          addToast(err.response?.data?.error || "Failed to delete party", "error");
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

  const handleDeleteCandidate = async (id) => {
      if(!window.confirm("Are you sure? This cannot be undone.")) return;
      try {
          await api.delete(`/api/admin/candidates/${id}`);
          addToast("Candidate deleted successfully", "success");
          fetchData();
          setActiveDropdown(null);
      } catch (err) {
          addToast(err.response?.data?.error || "Failed to delete candidate", "error");
      }
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
    <div className="space-y-8 animate-in fade-in duration-700 p-6 md:p-8 pb-24">
       
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Candidate & Party Hub
          </h1>
          <p className="text-slate-400 mt-2 text-lg font-light">
            Orchestrate the participants of your democratic process.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { closePartyModal(); setShowPartyModal(true); }} 
            className="flex items-center gap-2 px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-slate-700 hover:border-slate-500 shadow-lg backdrop-blur-sm"
          >
            <Flag size={18} className="text-cyan-400" />
            <span>Add Party</span>
          </button>
          <button 
            onClick={() => { closeCandidateModal(); setShowCandidateModal(true); }} 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95 transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>New Candidate</span>
          </button>
        </div>
      </div>

      {/* Party Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {parties.map((p) => {
           const partyId = getId(p);
           return (
           <div key={partyId} className="group relative bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10">
             <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 p-1">
                 {(p.logo || p.Logo) ? (
                     <img src={getLogoUrl(p.logo || p.Logo)} alt={p.name} className="w-full h-full object-contain rounded-lg" />
                 ) : (
                    <Flag className="text-slate-600" />
                 )}
             </div>
             <div className="flex-1 min-w-0">
               <h3 className="font-bold text-slate-100 truncate text-lg">{p.name}</h3>
               <p className="text-xs text-slate-500 font-mono">ID: {partyId}</p>
             </div>
             
             <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => handleEditParty(p)} className="p-1.5 bg-slate-950 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDeleteParty(partyId)} className="p-1.5 bg-slate-950 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"><Trash2 size={14} /></button>
             </div>
           </div>
        )})}
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl min-h-[600px] flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/30">
            <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates by name..." 
                  className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
            <div className="relative w-full sm:w-64">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                <select
                    value={filterParty}
                    onChange={(e) => setFilterParty(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 pl-12 pr-10 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 appearance-none cursor-pointer transition-all hover:bg-slate-900"
                >
                    <option value="ALL">All Parties</option>
                    {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>

        {/* Candidates Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800/60 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-8 py-5">Candidate Profile</th>
                <th className="px-6 py-5">Affiliation</th>
                <th className="px-6 py-5">Election Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
               {loading ? (
                   <tr><td colSpan="4" className="px-6 py-20 text-center"><div className="flex flex-col items-center gap-3"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /><span className="text-slate-500">Loading candidates...</span></div></td></tr>
               ) : filteredCandidates.length === 0 ? (
                   <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-500">No candidates found matching your criteria.</td></tr>
               ) : filteredCandidates.map(c => {
                   const cId = getId(c);
                   const elec = elections.find(e => getId(e) === c.election_id || getId(e) === c.ElectionID);
                   
                   const isEnded = elec ? new Date(elec.end_date) < new Date() : false;
                   const isActive = elec?.is_active;
                   const isLocked = isActive && !isEnded;
                   const lockLabel = isEnded ? 'Closed' : 'Active';

                   return (
                   <tr key={cId} className="group hover:bg-indigo-500/[0.02] transition-colors">
                     <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:border-indigo-500/50 transition-colors">
                            {(c.photo || c.Photo) ? (
                                <img src={getLogoUrl(c.photo || c.Photo)} className="w-full h-full object-cover" alt={c.full_name} />
                            ) : (
                                <User className="text-slate-600" size={24} />
                            )}
                         </div>
                         <div>
                            <span className="text-slate-200 font-semibold text-base block">{c.full_name}</span>
                            <span className="text-xs text-slate-500 font-mono">ID: {cId}</span>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                           {c.party?.logo ? (
                               <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center border border-slate-700">
                                   <img src={getLogoUrl(c.party.logo)} className="max-w-full max-h-full" />
                               </div>
                           ) : (
                               <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700"><Flag size={14} className="text-slate-500" /></div>
                           )}
                           <span className="text-slate-300 font-medium">{c.party?.name || 'Independent'}</span>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                        {elec ? (
                            <div className="flex flex-col items-start gap-1.5">
                                <span className="text-sm text-slate-300 font-medium">{elec.title}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                    isEnded 
                                        ? 'bg-slate-800 text-slate-400 border-slate-700' 
                                        : isActive
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                    {isEnded ? 'Election Closed' : (isActive ? '● Live Now' : 'Upcoming')}
                                </span>
                            </div>
                        ) : <span className="text-slate-600 italic">Unknown Election</span>}
                     </td>
                     <td className="px-8 py-5 text-right relative">
                       <button 
                            onClick={() => setActiveDropdown(activeDropdown === cId ? null : cId)}
                            className={`p-2.5 rounded-xl transition-all ${activeDropdown === cId ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <MoreVertical size={20} />
                       </button>
                       
                       {/* Dropdown Menu */}
                       {activeDropdown === cId && (
                           <div ref={dropdownRef} className="absolute right-12 top-10 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                                <div className="p-1.5 space-y-0.5">
                                    <button 
                                        onClick={() => openViewModal(c)} 
                                        className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg group/btn"
                                    >
                                        <Eye size={16} className="text-indigo-400 group-hover/btn:text-indigo-300" /> 
                                        <span className="font-medium">View Profile</span>
                                    </button>

                                    <div className="h-px bg-slate-800 my-1 mx-1"></div>

                                    <button 
                                        onClick={() => handleEditCandidate(c)} 
                                        disabled={isLocked}
                                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors rounded-lg ${
                                            isLocked 
                                            ? 'text-slate-600 cursor-not-allowed' 
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <Pencil size={16} className={isLocked ? 'opacity-50' : 'text-blue-400'} /> 
                                        <span>Edit Details</span>
                                        {isLocked && <Lock size={12} className="ml-auto text-slate-600" />}
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleDeleteCandidate(cId)} 
                                        disabled={isLocked}
                                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 transition-colors rounded-lg ${
                                            isLocked 
                                            ? 'text-slate-600 cursor-not-allowed' 
                                            : 'text-rose-400 hover:bg-rose-500/10'
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
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setShowViewModal(false)} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
                
                {/* Header Banner */}
                <div className="h-32 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md border border-white/10">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-8 pb-8 relative">
                     {/* Candidate Avatar */}
                     <div className="-mt-16 mb-4 flex justify-center">
                        <div className="w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center relative z-10 group">
                            {(selectedCandidate.photo || selectedCandidate.Photo) ? (
                                <img src={getLogoUrl(selectedCandidate.photo || selectedCandidate.Photo)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <User className="text-slate-600 w-12 h-12" />
                            )}
                        </div>
                     </div>

                     <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white tracking-tight">{selectedCandidate.full_name}</h2>
                        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-indigo-300 font-medium text-sm">{selectedCandidate.party?.name || 'Independent'}</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                         {/* Election Card */}
                         <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
                             <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <Calendar size={20} />
                             </div>
                             <div>
                                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Contesting In</p>
                                 <p className="text-slate-200 font-medium text-lg leading-tight">
                                    {elections.find(e => getId(e) === selectedCandidate.election_id)?.title || 'Unknown Election'}
                                 </p>
                             </div>
                         </div>

                         {/* Bio Card */}
                         <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                             <div className="flex items-center gap-2 mb-3 text-indigo-400">
                                <FileText size={18} />
                                <span className="font-bold text-sm uppercase tracking-wider">Manifesto / Bio</span>
                             </div>
                             <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-light">
                                 {selectedCandidate.bio || "No detailed biography provided for this candidate."}
                             </p>
                         </div>

                         {/* Party Card */}
                         {selectedCandidate.party && (
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-1 rounded-2xl">
                                <div className="bg-slate-950/80 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Party Affiliation</p>
                                        <p className="font-bold text-slate-200">{selectedCandidate.party.name}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-lg">
                                        {(selectedCandidate.party.logo || selectedCandidate.party.Logo) ? (
                                            <img src={getLogoUrl(selectedCandidate.party.logo || selectedCandidate.party.Logo)} className="max-w-full max-h-full object-contain" />
                                        ) : <Flag className="text-slate-300" />}
                                    </div>
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
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={closeCandidateModal} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
              
              <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                 <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{editingCandidateId ? 'Edit Candidate' : 'Register Candidate'}</h2>
                    <p className="text-slate-500 text-sm mt-1">Enter candidate details for the election.</p>
                 </div>
                 <button onClick={closeCandidateModal} className="p-2 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleCandidateSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 {/* Photo Upload */}
                 <div className="flex justify-center">
                    <div className="relative w-28 h-28 group cursor-pointer">
                        <div className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center bg-slate-950 shadow-inner transition-all ${candidatePhotoPreview ? 'border-indigo-500' : 'border-slate-700 border-dashed group-hover:border-slate-500'}`}>
                            {candidatePhotoPreview ? (
                                <img src={candidatePhotoPreview} className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-600 group-hover:text-slate-500 transition-colors" size={40} />
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
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name <span className="text-red-500">*</span></label>
                        <input required placeholder="e.g. John Doe" value={candidateForm.full_name} onChange={e => setCandidateForm({...candidateForm, full_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Election Event <span className="text-red-500">*</span></label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                           <select 
                              required 
                              value={candidateForm.election_id} 
                              onChange={e => setCandidateForm({...candidateForm, election_id: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer transition-all"
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
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Political Party <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                            <select required value={candidateForm.party_id} onChange={e => setCandidateForm({...candidateForm, party_id: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer transition-all">
                                <option value="">Select Affiliation...</option>
                                {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Bio / Manifesto</label>
                        <textarea 
                            rows="4"
                            value={candidateForm.bio}
                            onChange={e => setCandidateForm({...candidateForm, bio: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all placeholder:text-slate-600"
                            placeholder="Write a brief manifesto or biography..."
                        />
                     </div>
                 </div>

                 <button type="submit" disabled={submitting} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin" /> : (editingCandidateId ? 'Update Candidate Profile' : 'Register Candidate')}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* --- ADD PARTY MODAL --- */}
      {showPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={closePartyModal} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="p-8">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Flag className="text-cyan-400" /> {editingPartyId ? 'Update Party' : 'New Party'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Manage political entities.</p>
                    </div>
                    <button onClick={closePartyModal} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                 </div>
                 
                 <form onSubmit={handlePartySubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Party Name <span className="text-red-500">*</span></label>
                       <input required placeholder="e.g. Democratic Alliance" value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600" />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Party Logo</label>
                       <div className="relative group w-full h-40 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer bg-slate-950/50">
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          {logoPreview ? (
                              <img src={logoPreview} className="h-full w-full object-contain p-2" />
                          ) : (
                              <>
                                <Upload className="text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors" size={28} />
                                <span className="text-xs text-slate-500 font-medium group-hover:text-slate-400">Click to upload logo</span>
                              </>
                          )}
                       </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold mt-2 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2">
                       {submitting ? <Loader2 className="animate-spin" /> : (editingPartyId ? 'Save Changes' : 'Create Party')}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Candidates;