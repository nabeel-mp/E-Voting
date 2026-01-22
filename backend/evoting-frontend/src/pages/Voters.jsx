import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Plus, MoreVertical, User, Phone, CreditCard, X, 
  Loader2, CheckCircle2, AlertCircle, Pencil, Ban, Unlock, ChevronDown, 
  AlertTriangle, Download, Upload, Eye, MapPin, FileText, Trash2, Building
} from 'lucide-react';

// --- KERALA ADMINISTRATIVE DATA ---
const KERALA_ADMIN_DATA = {
  districts: [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", 
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", 
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ],
  corporations: {
    "Thiruvananthapuram": ["Thiruvananthapuram Corporation"],
    "Kollam": ["Kollam Corporation"],
    "Ernakulam": ["Kochi Corporation"],
    "Thrissur": ["Thrissur Corporation"],
    "Kozhikode": ["Kozhikode Corporation"],
    "Kannur": ["Kannur Corporation"]
  },
  municipalities: {
    "Thiruvananthapuram": ["Neyyattinkara", "Nedumangad", "Attingal", "Varkala"],
    "Kollam": ["Punalur", "Karunagappally", "Paravur", "Kottarakkara"],
    "Pathanamthitta": ["Thiruvalla", "Pathanamthitta", "Adoor", "Pandalam"],
    "Alappuzha": ["Alappuzha", "Kayamkulam", "Cherthala", "Mavelikkara", "Chengannur", "Haripad"],
    "Kottayam": ["Kottayam", "Changanassery", "Pala", "Vaikom", "Ettumanoor", "Erattupetta"],
    "Idukki": ["Thodupuzha", "Kattappana"],
    "Ernakulam": ["Thrippunithura", "Muvattupuzha", "Kothamangalam", "Perumbavoor", "Aluva", "North Paravur", "Angamaly", "Kalamassery", "Maradu", "Eloor", "Thrikkakara", "Piravom", "Koothattukulam"],
    "Thrissur": ["Chalakudy", "Kunnamkulam", "Kodungallur", "Chavakkad", "Guruvayoor", "Irinjalakuda", "Wadakkanchery"],
    "Palakkad": ["Palakkad", "Shornur", "Chittur-Thathamangalam", "Ottappalam", "Mannarkkad", "Pattambi", "Cherpulassery"],
    "Malappuram": ["Malappuram", "Manjeri", "Ponnani", "Tirur", "Perinthalmanna", "Nilambur", "Kottakkal", "Valanchery", "Kondotty", "Tanur", "Parappanangadi", "Tirurangadi"],
    "Kozhikode": ["Vatakara", "Koyilandy", "Ramanattukara", "Koduvally", "Mukkam", "Payyoli", "Feroke"],
    "Wayanad": ["Kalpetta", "Mananthavady", "Sulthan Bathery"],
    "Kannur": ["Taliparamba", "Payyannur", "Thalassery", "Mattannur", "Koothuparamba", "Anthoor", "Iritty", "Panoor", "Sreekandapuram"],
    "Kasaragod": ["Kasaragod", "Kanhangad", "Nileshwar"]
  },
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
  // Mapping Block -> Grama Panchayats (Examples)
  grama_panchayats: {
    "Manjeri": ["Thrikkalangode", "Pandikkad", "Edavanna", "Keezhuparamba", "Urangattiri"],
    "Kondotty": ["Cheekkode", "Cherukavu", "Kondotty", "Pulikkal", "Vazhayur", "Vazhakkad"],
    "Malappuram": ["Anakkayam", "Morayur", "Pookkottur", "Kodur", "Othukkungal"],
    "DEFAULT": ["Grama Panchayat 1", "Grama Panchayat 2", "Grama Panchayat 3"] 
  }
};

const Voters = () => {
  const { user } = useAuth();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const { addToast } = useToast();
   
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [form, setForm] = useState({ 
      full_name: '', mobile: '', aadhaar: '', address: '',
      district: '', local_body_type: 'Grama Panchayat', block: '', local_body_name: '', ward: ''
  });

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchVoters = async () => {
    setLoading(true); setErrorMsg(null);
    try {
      const res = await api.get('/api/admin/voters');
      if(res.data.success) setVoters(res.data.data || []);
    } catch (err) { setErrorMsg("Failed to load voters."); } 
    finally { setLoading(false); }
  };
  useEffect(() => { fetchVoters(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setActiveDropdown(null);
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredVoters = voters.filter(voter => {
    if (!voter) return false;
    const fullName = (voter.FullName || voter.full_name || '').toLowerCase();
    const voterID = (voter.VoterID || voter.voter_id || '').toLowerCase();
    const aadhaar = (voter.AadhaarNumber || voter.aadhaar_number || voter.AadhaarPlain || '').toLowerCase();
    const isVerified = voter.IsVerified !== undefined ? voter.IsVerified : (voter.is_verified || false);
    const isBlocked = voter.IsBlocked !== undefined ? voter.IsBlocked : (voter.is_blocked || false);
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || voterID.includes(searchTerm.toLowerCase()) || aadhaar.includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (filterStatus === 'VERIFIED') matchesStatus = isVerified;
    if (filterStatus === 'PENDING') matchesStatus = !isVerified;
    if (filterStatus === 'BLOCKED') matchesStatus = isBlocked;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, panchayath: form.local_body_name };
      if (isEditing) {
        await api.put(`/api/admin/voter/${selectedVoter.ID || selectedVoter.id}`, payload);
        addToast("Voter updated successfully!", "success");
      } else {
        await api.post('/api/admin/voter/register', payload);
        addToast("Voter registered successfully!", "success");
      }
      closeModal();
      fetchVoters();
    } catch (err) { addToast("Operation Failed", "error"); } 
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this voter?")) return;
      try {
          await api.delete(`/api/admin/voter/${id}`);
          addToast("Voter deleted", "success");
          fetchVoters();
          setActiveDropdown(null);
      } catch (err) { addToast("Failed", "error"); }
  };

  const toggleBlockStatus = async (voter) => {
    const id = voter.ID || voter.id;
    const isBlocked = voter.IsBlocked !== undefined ? voter.IsBlocked : voter.is_blocked;
    if(!window.confirm(`${isBlocked ? "UNBLOCK" : "BLOCK"} voter?`)) return;
    try {
        const endpoint = isBlocked ? "/api/admin/voter/unblock" : "/api/admin/voter/block";
        await api.post(endpoint, { voter_id: id });
        addToast("Status updated", "success");
        fetchVoters();
    } catch (err) { addToast("Failed", "error"); }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/admin/voters/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `voters_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast("Export successful", "success");
    } catch (err) { addToast("Failed to export", "error"); }
  };

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
        fetchVoters();
    } catch (err) { addToast("Import failed", "error"); }
    finally { setLoading(false); e.target.value = null; }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({ full_name: '', mobile: '', aadhaar: '', address: '', district: '', local_body_type: 'Grama Panchayat', block: '', local_body_name: '', ward: '' });
    setShowModal(true);
  };

  const openEditModal = (voter) => {
    setIsEditing(true);
    setSelectedVoter(voter);
    setForm({ 
        full_name: voter.FullName || '', mobile: voter.Mobile || '', aadhaar: voter.AadhaarNumber || '', address: voter.Address || '',
        district: voter.District || '', local_body_type: 'Grama Panchayat', block: voter.Block || '', local_body_name: voter.Panchayath || '', ward: voter.Ward || ''
    });
    setShowModal(true);
    setActiveDropdown(null);
  };

  const openDetailsModal = (voter) => { setSelectedVoter(voter); setShowDetailsModal(true); setActiveDropdown(null); };
  const closeModal = () => { setShowModal(false); setShowDetailsModal(false); };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white">Voters List</h1><p className="text-slate-400">Manage registered voters.</p></div>
        <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700"><Download size={18} /> Export</button>
            <button onClick={handleImportClick} className="flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700"><Upload size={18} /> Import</button>
            <button onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl"><Plus size={20} /> Register New</button>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl min-h-[500px] flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full bg-slate-800/50 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg" /></div>
          <div className="relative" ref={filterRef}>
             <button onClick={() => setShowFilterMenu(!showFilterMenu)} className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-slate-800 text-slate-300 border-slate-700"><Filter size={18} /> {filterStatus} <ChevronDown size={14} /></button>
             {showFilterMenu && (
                <div className="absolute right-0 top-12 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 p-1">
                   {['ALL', 'VERIFIED', 'PENDING', 'BLOCKED'].map(s => <button key={s} onClick={() => { setFilterStatus(s); setShowFilterMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded">{s}</button>)}
                </div>
             )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800">
              <tr><th className="px-6 py-4">Voter ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Mobile</th><th className="px-6 py-4">Aadhaar</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? <tr><td colSpan="6" className="text-center py-8"><Loader2 className="animate-spin inline" /> Loading...</td></tr> : 
               filteredVoters.map((v) => (
                <tr key={v.ID || v.id} className="hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-mono text-indigo-300">{v.VoterID || v.voter_id}</td>
                  <td className="px-6 py-4 text-slate-200 font-medium">{v.FullName || v.full_name}</td>
                  <td className="px-6 py-4 font-mono">{v.Mobile || v.mobile}</td>
                  <td className="px-6 py-4 font-mono"><button onClick={() => openDetailsModal(v)} className="hover:text-indigo-400 hover:underline">{v.AadhaarNumber || v.aadhaar_number}</button></td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs border ${v.IsVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{v.IsVerified ? 'Verified' : 'Pending'}</span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={() => setActiveDropdown(activeDropdown === (v.ID||v.id) ? null : (v.ID||v.id))}><MoreVertical size={18} /></button>
                    {activeDropdown === (v.ID||v.id) && (
                      <div ref={dropdownRef} className="absolute right-8 top-12 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1">
                          <button onClick={() => openDetailsModal(v)} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded flex gap-2"><Eye size={14}/> View</button>
                          <button onClick={() => openEditModal(v)} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded flex gap-2"><Pencil size={14}/> Edit</button>
                          <button onClick={() => handleDelete(v.ID||v.id)} className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-800 rounded flex gap-2"><Trash2 size={14}/> Delete</button>
                          <button onClick={() => toggleBlockStatus(v)} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded flex gap-2"><Ban size={14}/> Block/Unblock</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Update Voter' : 'Register Voter'}</h2>
              <button onClick={closeModal}><X size={20} className="text-slate-400 hover:text-white"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2"><label className="text-sm text-slate-300">Full Name</label><input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" /></div>
                  <div className="space-y-2"><label className="text-sm text-slate-300">Mobile</label><input required value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" /></div>
                  <div className="space-y-2 md:col-span-2"><label className="text-sm text-slate-300">Aadhaar</label><input required value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" /></div>

                  {/* KERALA JURISDICTION */}
                  <div className="md:col-span-2 pt-4 pb-1 border-b border-slate-800 mb-2"><h3 className="text-sm font-bold text-amber-500 uppercase flex gap-2"><Building size={16} /> Administrative Jurisdiction</h3></div>

                  <div className="space-y-2"><label className="text-sm text-slate-300">District</label>
                      <select value={form.district} onChange={(e) => setForm({...form, district: e.target.value, block: '', local_body_name: ''})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
                          <option value="">Select District</option>
                          {KERALA_ADMIN_DATA.districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                  </div>

                  <div className="space-y-2"><label className="text-sm text-slate-300">Local Body Type</label>
                      <select value={form.local_body_type} onChange={(e) => setForm({...form, local_body_type: e.target.value, block: '', local_body_name: ''})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
                          <option value="Grama Panchayat">Grama Panchayat</option>
                          <option value="Municipality">Municipality</option>
                          <option value="Municipal Corporation">Municipal Corporation</option>
                      </select>
                  </div>

                  {form.local_body_type === 'Grama Panchayat' && (
                      <div className="space-y-2"><label className="text-sm text-slate-300">Block Panchayat</label>
                          <select value={form.block} onChange={(e) => setForm({...form, block: e.target.value, local_body_name: ''})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" disabled={!form.district}>
                              <option value="">Select Block</option>
                              {form.district && KERALA_ADMIN_DATA.blocks[form.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                      </div>
                  )}

                  <div className="space-y-2"><label className="text-sm text-slate-300">Local Body Name</label>
                      <select value={form.local_body_name} onChange={(e) => setForm({...form, local_body_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" disabled={!form.district}>
                          <option value="">Select Name</option>
                          {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                      </select>
                  </div>

                  <div className="space-y-2 md:col-span-2"><label className="text-sm text-slate-300">Ward</label><input value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" /></div>
                  <div className="space-y-2 md:col-span-2"><label className="text-sm text-slate-300">Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" /></div>
              </div>
              <div className="pt-6 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl">{submitting ? <Loader2 className="animate-spin" /> : (isEditing ? 'Update' : 'Register')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><User /> Voter Details</h2>
                <button onClick={closeModal}><X className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
                <div><p className="text-slate-500 text-xs">Name</p><p className="text-white font-bold text-lg">{selectedVoter.FullName}</p></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-slate-500 text-xs">Mobile</p><p className="text-white">{selectedVoter.Mobile}</p></div>
                    <div><p className="text-slate-500 text-xs">Aadhaar</p><p className="text-white">{selectedVoter.AadhaarNumber}</p></div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl space-y-2">
                    <p className="text-amber-500 text-xs font-bold uppercase">Jurisdiction</p>
                    <p className="text-slate-300 text-sm">District: <span className="text-white">{selectedVoter.District}</span></p>
                    {selectedVoter.Block && <p className="text-slate-300 text-sm">Block: <span className="text-white">{selectedVoter.Block}</span></p>}
                    <p className="text-slate-300 text-sm">Local Body: <span className="text-white">{selectedVoter.Panchayath}</span></p>
                    <p className="text-slate-300 text-sm">Ward: <span className="text-white">{selectedVoter.Ward}</span></p>
                    <p className="text-slate-300 text-sm">Address: <span className="text-white">{selectedVoter.Address}</span></p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voters;