import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, Plus, Loader2, Clock, ToggleLeft, ToggleRight, Vote, Lock,
  Pencil, X, MoreVertical, Trash2, AlertTriangle, Ban, PauseCircle, PlayCircle,
  MapPin, Building, ChevronDown
} from 'lucide-react';

// --- KERALA ADMIN DATA (Same as Voters.jsx) ---
const KERALA_ADMIN_DATA = {
  districts: [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", 
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", 
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ],
  blocks: {
    "Thiruvananthapuram": ["Parassala", "Athiyannoor", "Perunkadavila", "Nemom", "Thiruvananthapuram Rural", "Kazhakoottam", "Nedumangad", "Vellanad", "Vamanapuram", "Chirayinkizhu", "Kilimanoor", "Varkala"],
    "Kollam": ["Ochira", "Karunagappally", "Sasthamcotta", "Pathanapuram", "Anchal", "Kottarakkara", "Chittumala", "Chavara", "Mukhathala", "Ithikkara", "Chadayamangalam", "Vettikkavala"],
    "Pathanamthitta": ["Mallappally", "Pulikeezhu", "Koyipram", "Elanthoor", "Ranni", "Konni", "Pandalam", "Parakode"],
    "Alappuzha": ["Thaikkattusseri", "Pattanakkad", "Kanjikkuzhi", "Aryad", "Ambalappuzha", "Champakkulam", "Veliyanad", "Chengannur", "Harippad", "Mavelikkara", "Bharanikkavu", "Muthukulam"],
    "Kottayam": ["Vaikom", "Kaduthuruthy", "Ettumanoor", "Uzhavoor", "Lalam", "Erattupetta", "Pampadi", "Pallom", "Madappally", "Vazhoor", "Kanjirappally"],
    "Idukki": ["Adimali", "Devikulam", "Nedumkandam", "Elemdesom", "Idukki", "Kattappana", "Thodupuzha", "Azhutha"],
    "Ernakulam": ["Paravur", "Alangad", "Angamaly", "Koovappadi", "Vazhakulam", "Edappally", "Vypeen", "Palluruthy", "Mulanthuruthy", "Vadavucode", "Kothamangalam", "Pampakuda", "Parakkadavu", "Muvattupuzha"],
    "Thrissur": ["Chavakkad", "Chowwannur", "Vadakkancherry", "Pazhayannoor", "Ollukkara", "Puzhackal", "Mullasseri", "Thalikulam", "Anthikkad", "Cherpu", "Kodakara", "Irinjalakkuda", "Vellangallur", "Mathilakam", "Kodungallur", "Mala", "Chalakkudi"],
    "Palakkad": ["Thrithala", "Pattambi", "Ottappalam", "Sreekrishnapuram", "Mannarkkad", "Attappady", "Palakkad", "Kuzhalmannam", "Chittoor", "Kollangode", "Nenmara", "Alathur", "Malampuzha"],
    "Malappuram": ["Nilambur", "Wandoor", "Kondotty", "Areecode", "Malappuram", "Perinthalmanna", "Mankada", "Kuttippuram", "Vengara", "Tiroorangadi", "Tanur", "Tirur", "Ponnani", "Perumpadappu", "Kalikavu"],
    "Kozhikode": ["Vadakara", "Tuneri", "Kunnummel", "Thodannur", "Meladi", "Perambra", "Balusseri", "Panthalayani", "Chelannur", "Koduvally", "Kunnamangalam", "Kozhikode"],
    "Wayanad": ["Mananthavady", "Sulthan Bathery", "Kalpetta", "Panamaram"],
    "Kannur": ["Payyannur", "Kalliasseri", "Taliparamba", "Irikkur", "Kannur", "Edakkad", "Thalassery", "Kuthuparamba", "Panoor", "Iritty", "Peravoor"],
    "Kasaragod": ["Manjeshwaram", "Karadka", "Kasaragod", "Kanhangad", "Parappa", "Nileshwaram"]
  },
  municipalities: {
    "Thiruvananthapuram": ["Neyyattinkara", "Nedumangad", "Attingal", "Varkala"],
    "Kollam": ["Punalur", "Karunagappally", "Paravur", "Kottarakkara"],
    "Malappuram": ["Malappuram", "Manjeri", "Ponnani", "Tirur", "Perinthalmanna", "Nilambur", "Kottakkal", "Valanchery", "Kondotty", "Tanur", "Parappanangadi", "Tirurangadi"],
    // ... others
  },
  corporations: {
    "Thiruvananthapuram": ["Thiruvananthapuram Corporation"],
    "Kollam": ["Kollam Corporation"],
    "Ernakulam": ["Kochi Corporation"],
    "Thrissur": ["Thrissur Corporation"],
    "Kozhikode": ["Kozhikode Corporation"],
    "Kannur": ["Kannur Corporation"]
  },
  grama_panchayats: {
    "Manjeri": ["Thrikkalangode", "Pandikkad", "Edavanna"],
    "Malappuram": ["Anakkayam", "Morayur", "Pookkottur"],
    "Kondotty": ["Cheekkode", "Cherukavu", "Kondotty", "Pulikkal", "Vazhayur", "Vazhakkad"],
    "DEFAULT": ["Grama Panchayat 1", "Grama Panchayat 2"]
  }
};

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, data: null });
  
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { addToast } = useToast();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', start_date: '', end_date: '',
    district: '', local_body_type: 'Grama Panchayat', block: '', local_body_name: '', ward: ''
  });

  const fetchElections = async () => {
    try {
      const res = await api.get('/api/admin/elections');
      if (res.data.success) setElections(res.data.data);
    } catch (err) { addToast("Failed to load elections", "error"); } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchElections(); }, []);

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

  const handleEdit = (election) => {
    setEditingId(election.ID);
    setForm({
        title: election.title, description: election.description,
        start_date: election.start_date, end_date: election.end_date,
        district: election.district || '', local_body_type: election.local_body_type || 'Grama Panchayat',
        block: election.block || '', local_body_name: election.local_body_name || '', ward: election.ward || ''
    });
    setShowFormModal(true); setActiveDropdown(null);
  };

  const resetForm = () => {
      setForm({ title: '', description: '', start_date: '', end_date: '', district: '', local_body_type: 'Grama Panchayat', block: '', local_body_name: '', ward: '' });
      setEditingId(null); setShowFormModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, start_date: new Date(form.start_date).toISOString(), end_date: new Date(form.end_date).toISOString() };
      if (editingId) {
          await api.put(`/api/admin/elections/${editingId}`, payload);
          addToast("Election updated successfully!", "success");
      } else {
          await api.post('/api/admin/elections', payload);
          addToast("Election created successfully!", "success");
      }
      resetForm(); fetchElections();
    } catch (err) { addToast("Operation Failed", "error"); } 
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => { /* ... same as before ... */ };
  const initiateStatusChange = (election, type) => { /* ... same as before ... */ };
  const executeStatusChange = async () => { /* ... same as before ... */ };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div><h1 className="text-3xl font-bold text-white">Election Management</h1><p className="text-slate-400">Create and monitor election events.</p></div>
        <button onClick={() => { resetForm(); setShowFormModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl"><Plus size={18} /> Create Election</button>
      </div>

      {/* List (Simplified for brevity, assuming standard card rendering) */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" /></div> : 
           elections.map((election) => (
             <div key={election.ID} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between group relative">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl"><Vote size={24} className="text-slate-500" /></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-200">{election.title}</h3>
                        <p className="text-sm text-slate-500 mb-2">{election.description}</p>
                        
                        {/* Jurisdiction Display */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 mb-2">
                            {election.district && <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1"><MapPin size={10} /> {election.district}</span>}
                            {election.local_body_name && <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1"><Building size={10} /> {election.local_body_name}</span>}
                        </div>
                        
                        <div className="flex gap-4 text-xs font-mono text-slate-400">
                            <span>Start: {new Date(election.start_date).toLocaleDateString()}</span>
                            <span>End: {new Date(election.end_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                {/* Status & Actions */}
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${election.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        {election.is_active ? 'Live' : 'Inactive'}
                    </span>
                    <button onClick={() => handleEdit(election)} className="p-2 text-slate-500 hover:text-white"><Pencil size={18} /></button>
                </div>
             </div>
           ))
        }
      </div>

      {/* CREATE/EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetForm} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <h2 className="text-xl font-bold text-white">{editingId ? 'Update Election' : 'Create New Election'}</h2>
                 <button onClick={resetForm} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2"><label className="text-xs text-slate-400">Title</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" /></div>
                    <div className="space-y-2 md:col-span-2"><label className="text-xs text-slate-400">Description</label><textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" /></div>

                    {/* JURISDICTION */}
                    <div className="md:col-span-2 pt-2 pb-1 border-b border-slate-800 mb-2"><h3 className="text-sm font-bold text-amber-500 flex gap-2"><Building size={16} /> Jurisdiction</h3></div>

                    <div className="space-y-2"><label className="text-xs text-slate-400">District</label>
                        <select value={form.district} onChange={(e) => setForm({...form, district: e.target.value, block: '', local_body_name: ''})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white">
                            <option value="">All Districts</option>
                            {KERALA_ADMIN_DATA.districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2"><label className="text-xs text-slate-400">Local Body Type</label>
                        <select value={form.local_body_type} onChange={(e) => setForm({...form, local_body_type: e.target.value, block: '', local_body_name: ''})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white">
                            <option value="Grama Panchayat">Grama Panchayat</option>
                            <option value="Municipality">Municipality</option>
                            <option value="Municipal Corporation">Municipal Corporation</option>
                        </select>
                    </div>

                    {form.local_body_type === 'Grama Panchayat' && (
                        <div className="space-y-2"><label className="text-xs text-slate-400">Block Panchayat</label>
                            <select value={form.block} onChange={(e) => setForm({...form, block: e.target.value, local_body_name: ''})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" disabled={!form.district}>
                                <option value="">Select Block</option>
                                {form.district && KERALA_ADMIN_DATA.blocks[form.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2"><label className="text-xs text-slate-400">Name</label>
                        <select value={form.local_body_name} onChange={(e) => setForm({...form, local_body_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" disabled={!form.district}>
                            <option value="">Select Name</option>
                            {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-2"><label className="text-xs text-slate-400">Ward (Optional)</label><input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" /></div>
                    
                    {/* DATES */}
                    <div className="space-y-2"><label className="text-xs text-slate-400">Start</label><input type="datetime-local" value={form.start_date} onChange={handleStartDateChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" /></div>
                    <div className="space-y-2"><label className="text-xs text-slate-400">End</label><input type="datetime-local" value={form.end_date} onChange={handleEndDateChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" /></div>
                 </div>
                 <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
                    <button type="button" onClick={resetForm} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl">{submitting ? <Loader2 className="animate-spin" /> : (editingId ? 'Update' : 'Create')}</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Elections;