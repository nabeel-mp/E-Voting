import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Flag, 
  User, 
  FileText, 
  Hash, 
  MoreVertical, 
  Loader2, 
  X, 
  Users,
  Upload,    // New Import
  Image      // New Import
} from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
   
  // Modals
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [partyForm, setPartyForm] = useState({ name: '', logo: null }); // Changed logo to null
  const [logoPreview, setLogoPreview] = useState(null); // New state for preview
  
  const [candidateForm, setCandidateForm] = useState({ full_name: '', election_id: 1, party_id: '', bio: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        api.get('/api/admin/candidates'),
        api.get('/api/admin/parties')
      ]);
      if (cRes.data.success) setCandidates(cRes.data.data);
      if (pRes.data.success) setParties(pRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- NEW: Handle Image Selection ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPartyForm({ ...partyForm, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('name', partyForm.name);
      if (partyForm.logo) {
        formData.append('logo', partyForm.logo);
      }

      await api.post('/api/admin/parties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowPartyModal(false);
      setPartyForm({ name: '', logo: null });
      setLogoPreview(null);
      fetchData();
    } catch (err) { 
        alert("Failed to create party"); 
    } finally { 
        setSubmitting(false); 
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...candidateForm,
        election_id: parseInt(candidateForm.election_id),
        party_id: parseInt(candidateForm.party_id)
      };
      await api.post('/api/admin/candidates', payload);
      setShowCandidateModal(false);
      setCandidateForm({ full_name: '', election_id: 1, party_id: '', bio: '' });
      fetchData();
    } catch (err) { alert("Failed to create candidate"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Candidate Management</h1>
          <p className="text-slate-400 mt-1">Manage elections candidates and political parties.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPartyModal(true)} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors border border-slate-700"
          >
            <Flag size={18} />
            <span>Add Party</span>
          </button>
          <button 
            onClick={() => setShowCandidateModal(true)} 
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Parties Overview (Mini Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {parties.length > 0 ? parties.map((p, i) => (
           <div key={p.ID || i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-600 flex items-center justify-center shrink-0">
                 {/* Logic to show uploaded logo or fallback initial */}
                 {p.logo_url ? (
                     <img src={p.logo_url} alt={p.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-white font-bold">{p.name.charAt(0)}</span>
                 )}
              </div>
              <div>
                <h3 className="font-bold text-slate-200">{p.name}</h3>
                <p className="text-xs text-slate-500">Registered Party</p>
              </div>
           </div>
        )) : (
          <div className="col-span-4 p-4 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            No parties registered yet.
          </div>
        )}
      </div>

      {/* Candidates List */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors">
                <Filter size={18} />
                <span className="text-sm">Filter</span>
            </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Candidate Name</th>
                <th className="px-6 py-4">Party Affiliation</th>
                <th className="px-6 py-4">Biography</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
               {loading ? (
                   <tr>
                     <td colSpan="4" className="px-6 py-12 text-center">
                       <div className="flex justify-center items-center gap-2 text-indigo-400">
                         <Loader2 className="animate-spin" size={20} />
                         Loading candidates...
                       </div>
                     </td>
                   </tr>
               ) : candidates.length === 0 ? (
                 <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                       No candidates found. Start by adding a party, then a candidate.
                    </td>
                 </tr>
               ) : (
                  candidates.map(c => (
                    <tr key={c.ID} className="group hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                            {c.full_name.charAt(0)}
                          </div>
                          <div>
                            <span className="block text-slate-200 font-medium">{c.full_name}</span>
                            <span className="text-xs text-slate-500">ID: {c.ID}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.party ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-slate-700/30 text-slate-400 border-slate-700'}`}>
                          <Flag size={12} />
                          {c.party?.name || 'Independent'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="truncate max-w-xs text-slate-500">{c.bio || 'No biography available.'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors">
                           <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
               )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Add Party Modal - UPDATED WITH IMAGE UPLOAD */}
      {showPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPartyModal(false)} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                 <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Flag className="text-indigo-500" /> Add New Party
                 </h2>
                 <form onSubmit={handleCreateParty} className="space-y-4">
                    
                    {/* Name Input */}
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Party Name</label>
                       <input 
                          required 
                          value={partyForm.name} 
                          onChange={e => setPartyForm({...partyForm, name: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="e.g. Democratic Alliance"
                       />
                    </div>

                    {/* Image Upload Input */}
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Party Logo</label>
                       <div className="relative group">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${logoPreview ? 'border-indigo-500/50 bg-slate-800' : 'border-slate-700 bg-slate-800/50 group-hover:bg-slate-800 group-hover:border-slate-600'}`}>
                             {logoPreview ? (
                                <div className="relative w-full h-full p-2">
                                   <img src={logoPreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                      <p className="text-white text-xs font-medium">Click to change</p>
                                   </div>
                                </div>
                             ) : (
                                <>
                                  <div className="p-3 bg-slate-800 rounded-full border border-slate-700 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                                     <Upload size={20} />
                                  </div>
                                  <p className="text-slate-500 text-xs">Click to upload image</p>
                                </>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                       <button type="button" onClick={() => setShowPartyModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-700">Cancel</button>
                       <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium">
                          {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Create Party'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* 2. Add Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCandidateModal(false)} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">Add Candidate</h2>
                 <button onClick={() => setShowCandidateModal(false)}><X className="text-slate-500 hover:text-white" /></button>
              </div>
              
              <form onSubmit={handleCreateCandidate} className="p-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-3 top-3 text-slate-500" size={18} />
                       <input 
                          required 
                          value={candidateForm.full_name} 
                          onChange={e => setCandidateForm({...candidateForm, full_name: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="Candidate Name"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Party</label>
                       <div className="relative">
                          <Flag className="absolute left-3 top-3 text-slate-500" size={18} />
                          <select 
                             required 
                             value={candidateForm.party_id} 
                             onChange={e => setCandidateForm({...candidateForm, party_id: e.target.value})}
                             className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                          >
                             <option value="">Select...</option>
                             {parties.map(p => <option key={p.ID} value={p.ID}>{p.name}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Election ID</label>
                       <div className="relative">
                          <Hash className="absolute left-3 top-3 text-slate-500" size={18} />
                          <input 
                             type="number" 
                             required 
                             value={candidateForm.election_id} 
                             onChange={e => setCandidateForm({...candidateForm, election_id: e.target.value})}
                             className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Biography</label>
                    <div className="relative">
                       <FileText className="absolute left-3 top-3 text-slate-500" size={18} />
                       <textarea 
                          rows="3"
                          value={candidateForm.bio} 
                          onChange={e => setCandidateForm({...candidateForm, bio: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                          placeholder="Short description..."
                       />
                    </div>
                 </div>

                 <button type="submit" disabled={submitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 mt-2">
                    {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Register Candidate'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default Candidates;