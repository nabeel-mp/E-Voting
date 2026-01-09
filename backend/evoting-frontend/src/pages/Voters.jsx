import { useEffect, useState } from 'react';
import api from '../utils/api';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: '', mobile: '', aadhaar: '' });

  const fetchVoters = async () => {
    const res = await api.get('/api/admin/voters');
    if(res.data.success) setVoters(res.data.data);
  };

  useEffect(() => { fetchVoters(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/voter/register', form);
      if(res.data.success) {
        alert(`Registered! ID: ${res.data.data.voter_id}`);
        setShowModal(false);
        setForm({ full_name: '', mobile: '', aadhaar: '' });
        fetchVoters();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Voter Management</h1>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg">
          + Register Voter
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Mobile</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {voters.map(v => (
              <tr key={v.ID} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 font-mono text-indigo-300">{v.VoterID}</td>
                <td className="px-6 py-4">{v.FullName}</td>
                <td className="px-6 py-4">{v.Mobile}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${v.IsVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {v.IsVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Register Voter</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input placeholder="Full Name" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              <input placeholder="Mobile" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} />
              <input placeholder="Aadhaar" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" 
                value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} />
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white px-4">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voters;