import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Flag, User, FileText, Hash, MoreVertical, 
  Loader2, X, Upload, Filter, Pencil, Trash2, Calendar, Lock
} from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [elections, setElections] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
   
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [editingPartyId, setEditingPartyId] = useState(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [partyForm, setPartyForm] = useState({ name: '', logo: null });
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [candidateForm, setCandidateForm] = useState({ full_name: '', election_id: '', party_id: '', bio: '', photo: null });
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
      if (candidateForm.photo) formData.append('photo', candidateForm.photo);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Candidate Management</h1>
          <p className="text-slate-400 mt-1">Manage election candidates and political parties.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { closePartyModal(); setShowPartyModal(true); }} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors border border-slate-700"
          >
            <Flag size={18} />
            <span>Add Party</span>
          </button>
          <button 
            onClick={() => { closeCandidateModal(); setShowCandidateModal(true); }} 
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {parties.map((p) => {
           const partyId = getId(p);
           return (
           <div key={partyId} className="group relative bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-colors">
             <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-600 flex items-center justify-center shrink-0">
                 {(p.logo || p.Logo) ? (
                     <img src={getLogoUrl(p.logo || p.Logo)} alt={p.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-white font-bold">{p.name.charAt(0)}</span>
                 )}
             </div>
             <div className="flex-1 min-w-0">
               <h3 className="font-bold text-slate-200 truncate">{p.name}</h3>
               <p className="text-xs text-slate-500">Party ID: {partyId}</p>
             </div>
             
             <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button onClick={() => handleEditParty(p)} className="p-1 text-slate-400 hover:text-indigo-400"><Pencil size={12} /></button>
                <button onClick={() => handleDeleteParty(partyId)} className="p-1 text-slate-400 hover:text-rose-400"><Trash2 size={12} /></button>
             </div>
           </div>
        )})}
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates..." 
                  className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
            </div>
            <div className="relative w-full sm:w-auto min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select
                    value={filterParty}
                    onChange={(e) => setFilterParty(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                    <option value="ALL">All Parties</option>
                    {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                </select>
            </div>
        </div>

        <div className="overflow-x-visible flex-1">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Party</th>
                <th className="px-6 py-4">Election</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
               {loading ? (
                   <tr><td colSpan="4" className="px-6 py-12 text-center"><Loader2 className="animate-spin inline" /></td></tr>
               ) : filteredCandidates.map(c => {
                   const cId = getId(c);
                   const elec = elections.find(e => getId(e) === c.election_id || getId(e) === c.ElectionID);
                   
                   // --- LOGIC: Allow Update/Delete ONLY if Closed (Ended) OR Upcoming (Not Started)
                   // Block if Active AND Running
                   
                   const isEnded = elec ? new Date(elec.end_date) < new Date() : false;
                   const isActive = elec?.is_active;

                   // Locked if: Active AND Not Ended
                   const isLocked = isActive && !isEnded;
                   
                   return (
                   <tr key={cId} className="group hover:bg-slate-800/40 transition-colors">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {(c.photo || c.Photo) ? (
                                <img src={getLogoUrl(c.photo || c.Photo)} className="w-full h-full object-cover" alt={c.full_name} />
                            ) : (
                                <span className="text-indigo-400 font-bold">{c.full_name.charAt(0)}</span>
                            )}
                         </div>
                         <span className="text-slate-200 font-medium">{c.full_name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                         <Flag size={12} /> {c.party?.name || 'Independent'}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-xs">
                        {elec ? (
                            <span className={`px-2 py-1 rounded border ${
                                isEnded 
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                    : isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-slate-800 text-slate-500 border-slate-700'
                            }`}>
                                {elec.title} {isEnded ? '(Closed)' : (isActive ? '(Active)' : '')}
                            </span>
                        ) : 'Unknown Election'}
                     </td>
                     <td className="px-6 py-4 text-right relative">
                       <button 
                            onClick={() => setActiveDropdown(activeDropdown === cId ? null : cId)}
                            className={`p-2 rounded-lg transition-colors ${activeDropdown === cId ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                        >
                            <MoreVertical size={18} />
                       </button>
                       {activeDropdown === cId && (
                           <div ref={dropdownRef} className="absolute right-8 top-12 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <button 
                                    onClick={() => handleEditCandidate(c)} 
                                    disabled={isLocked}
                                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                                        isLocked 
                                        ? 'text-slate-600 cursor-not-allowed' 
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <Pencil size={14} /> 
                                    Update
                                    {isLocked && <span className="ml-auto text-[10px] uppercase bg-slate-800 px-1 rounded text-slate-500">Locked</span>}
                                </button>
                                
                                <div className="h-px bg-slate-800 my-1 mx-2"></div>
                                
                                <button 
                                    onClick={() => handleDeleteCandidate(cId)} 
                                    disabled={isLocked}
                                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                                        isLocked 
                                        ? 'text-slate-600 cursor-not-allowed' 
                                        : 'text-rose-400 hover:bg-rose-500/10'
                                    }`}
                                >
                                    <Trash2 size={14} /> 
                                    Delete
                                    {isLocked && <Lock size={12} className="ml-auto opacity-50" />}
                                </button>
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

      {showPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closePartyModal} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="p-6">
                 <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Flag className="text-indigo-500" /> {editingPartyId ? 'Update Party' : 'Add Party'}
                 </h2>
                 <form onSubmit={handlePartySubmit} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Party Name</label>
                       <input required value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Logo</label>
                       <div className="relative group">
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center ${logoPreview ? 'border-indigo-500/50' : 'border-slate-700'}`}>
                             {logoPreview ? <img src={logoPreview} className="h-full object-contain" /> : <Upload className="text-slate-500" />}
                          </div>
                       </div>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium mt-4">
                       {submitting ? <Loader2 className="animate-spin mx-auto" /> : (editingPartyId ? 'Save Changes' : 'Create Party')}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeCandidateModal} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">{editingCandidateId ? 'Update Candidate' : 'Add Candidate'}</h2>
                 <button onClick={closeCandidateModal}><X className="text-slate-500 hover:text-white" /></button>
              </div>
              
              <form onSubmit={handleCandidateSubmit} className="p-6 space-y-4">
                 <div className="flex justify-center mb-2">
                    <div className="relative w-24 h-24 group">
                        <div className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center bg-slate-800 ${candidatePhotoPreview ? 'border-indigo-500' : 'border-slate-600 border-dashed'}`}>
                            {candidatePhotoPreview ? (
                                <img src={candidatePhotoPreview} className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-slate-500" size={32} />
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleCandidatePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white shadow-lg pointer-events-none">
                            <Upload size={12} />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
                    <input required value={candidateForm.full_name} onChange={e => setCandidateForm({...candidateForm, full_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Election Event</label>
                    <div className="relative">
                       <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
                       <select 
                          required 
                          value={candidateForm.election_id} 
                          onChange={e => setCandidateForm({...candidateForm, election_id: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                       >
                          <option value="">Select Election...</option>
                          {elections.map(e => {
                              const isEnded = new Date(e.end_date) < new Date();
                              // Disable if Active OR Closed (only allow Upcoming)
                              const isDisabled = e.is_active || isEnded;
                              
                              return (
                                  <option key={getId(e)} value={getId(e)} disabled={isDisabled}>
                                      {e.title} {e.is_active ? '(Active)' : (isEnded ? '(Closed)' : '')}
                                  </option>
                              );
                          })}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Party</label>
                    <select required value={candidateForm.party_id} onChange={e => setCandidateForm({...candidateForm, party_id: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
                        <option value="">Select Party...</option>
                        {parties.map(p => <option key={getId(p)} value={getId(p)}>{p.name}</option>)}
                    </select>
                 </div>

                 <button type="submit" disabled={submitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold mt-2">
                    {submitting ? <Loader2 className="animate-spin mx-auto" /> : (editingCandidateId ? 'Update Candidate' : 'Register Candidate')}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;