// nabeel-mp/e-voting/E-Voting-e827307a9ccaf9e84bf5d22239f0e8c4b0f5aa02/backend/evoting-frontend/src/pages/Candidates.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus } from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);

  // Forms
  const [partyForm, setPartyForm] = useState({ name: '', logo: '' });
  const [candidateForm, setCandidateForm] = useState({ full_name: '', election_id: 1, party_id: '', bio: '' });

  const fetchData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/api/admin/candidates'),
        api.get('/api/admin/parties')
      ]);
      if (cRes.data.success) setCandidates(cRes.data.data);
      if (pRes.data.success) setParties(pRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateParty = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/parties', partyForm);
      setShowPartyModal(false);
      setPartyForm({ name: '', logo: '' });
      fetchData();
    } catch (err) { alert("Failed to create party"); }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      // Ensure IDs are integers
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
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Candidate Management</h1>
        <div className="flex gap-4">
          <button onClick={() => setShowPartyModal(true)} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Add Party
          </button>
          <button onClick={() => setShowCandidateModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Add Candidate
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Party</th>
              <th className="px-6 py-4">Bio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {candidates.map(c => (
              <tr key={c.ID}>
                <td className="px-6 py-4 font-medium text-white">{c.full_name}</td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-xs border border-indigo-500/20">
                    {c.party?.name || 'Independent'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{c.bio || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Party Modal */}
      {showPartyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Add Party</h2>
            <form onSubmit={handleCreateParty} className="space-y-4">
              <input placeholder="Party Name" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} />
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowPartyModal(false)} className="text-slate-400 hover:text-white px-4">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Add Candidate</h2>
            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <input placeholder="Full Name" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                value={candidateForm.full_name} onChange={e => setCandidateForm({...candidateForm, full_name: e.target.value})} />
              
              <select required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                value={candidateForm.party_id} onChange={e => setCandidateForm({...candidateForm, party_id: e.target.value})}>
                <option value="">Select Party</option>
                {parties.map(p => <option key={p.ID} value={p.ID}>{p.name}</option>)}
              </select>

              <input placeholder="Election ID" type="number" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                value={candidateForm.election_id} onChange={e => setCandidateForm({...candidateForm, election_id: e.target.value})} />

              <textarea placeholder="Bio" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                value={candidateForm.bio} onChange={e => setCandidateForm({...candidateForm, bio: e.target.value})} />

              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowCandidateModal(false)} className="text-slate-400 hover:text-white px-4">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;