import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  Calendar, Plus, Loader2, Clock, ToggleLeft, ToggleRight, Vote, Lock,
  Pencil, X, MoreVertical, Trash2, AlertTriangle, Ban,
  MapPin, Building, ChevronDown, Layers, Search
} from 'lucide-react';

// --- KERALA ADMINISTRATIVE DATA (Kept as is) ---
const KERALA_ADMIN_DATA = {
  districts: [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
    "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
  ],
  blocks: {
    "Malappuram": ["Manjeri", "Malappuram", "Kondotty", "Areekode", "Nilambur", "Wandoor", "Kalikavu", "Perinthalmanna", "Mankada", "Kuttippuram", "Vengara", "Tiroorangadi", "Tanur", "Tirur", "Ponnani", "Perumpadappu"],
    "Thiruvananthapuram": ["Parassala", "Athiyannoor", "Perunkadavila", "Nemom", "Thiruvananthapuram Rural", "Kazhakoottam", "Nedumangad", "Vellanad", "Vamanapuram", "Chirayinkizhu", "Kilimanoor", "Varkala"],
    "Kollam": ["Ochira", "Karunagappally", "Sasthamcotta", "Pathanapuram", "Anchal", "Kottarakkara", "Chittumala", "Chavara", "Mukhathala", "Ithikkara", "Chadayamangalam", "Vettikkavala"],
    "Pathanamthitta": ["Mallappally", "Pulikeezhu", "Koyipram", "Elanthoor", "Ranni", "Konni", "Pandalam", "Parakode"],
    "Alappuzha": ["Thaikkattusseri", "Pattanakkad", "Kanjikkuzhi", "Aryad", "Ambalappuzha", "Champakkulam", "Veliyanad", "Chengannur", "Harippad", "Mavelikkara", "Bharanikkavu", "Muthukulam"],
    "Kottayam": ["Vaikom", "Kaduthuruthy", "Ettumanoor", "Uzhavoor", "Lalam", "Erattupetta", "Pampadi", "Pallom", "Madappally", "Vazhoor", "Kanjirappally"],
    "Idukki": ["Adimali", "Devikulam", "Nedumkandam", "Elemdesom", "Idukki", "Kattappana", "Thodupuzha", "Azhutha"],
    "Ernakulam": ["Paravur", "Alangad", "Angamaly", "Koovappadi", "Vazhakulam", "Edappally", "Vypeen", "Palluruthy", "Mulanthuruthy", "Vadavucode", "Kothamangalam", "Pampakuda", "Parakkadavu", "Muvattupuzha"],
    "Thrissur": ["Chavakkad", "Chowwannur", "Vadakkancherry", "Pazhayannoor", "Ollukkara", "Puzhackal", "Mullasseri", "Thalikulam", "Anthikkad", "Cherpu", "Kodakara", "Irinjalakkuda", "Vellangallur", "Mathilakam", "Kodungallur", "Mala", "Chalakkudi"],
    "Palakkad": ["Thrithala", "Pattambi", "Ottappalam", "Sreekrishnapuram", "Mannarkkad", "Attappady", "Palakkad", "Kuzhalmannam", "Chittoor", "Kollangode", "Nenmara", "Alathur", "Malampuzha"],
    "Kozhikode": ["Vadakara", "Tuneri", "Kunnummel", "Thodannur", "Meladi", "Perambra", "Balusseri", "Panthalayani", "Chelannur", "Koduvally", "Kunnamangalam", "Kozhikode"],
    "Wayanad": ["Mananthavady", "Sulthan Bathery", "Kalpetta", "Panamaram"],
    "Kannur": ["Payyannur", "Kalliasseri", "Taliparamba", "Irikkur", "Kannur", "Edakkad", "Thalassery", "Kuthuparamba", "Panoor", "Iritty", "Peravoor"],
    "Kasaragod": ["Manjeshwaram", "Karadka", "Kasaragod", "Kanhangad", "Parappa", "Nileshwaram"]
  },
  municipalities: {
    "Malappuram": ["Malappuram", "Manjeri", "Ponnani", "Tirur", "Perinthalmanna", "Nilambur", "Kottakkal", "Valanchery", "Kondotty", "Tanur", "Parappanangadi", "Tirurangadi"],
    "Thiruvananthapuram": ["Neyyattinkara", "Nedumangad", "Attingal", "Varkala"],
    "Kollam": ["Punalur", "Karunagappally", "Paravur", "Kottarakkara"],
    "Pathanamthitta": ["Thiruvalla", "Pathanamthitta", "Adoor", "Pandalam"],
    "Alappuzha": ["Alappuzha", "Kayamkulam", "Cherthala", "Mavelikkara", "Chengannur", "Haripad"],
    "Kottayam": ["Kottayam", "Changanassery", "Pala", "Vaikom", "Ettumanoor", "Erattupetta"],
    "Idukki": ["Thodupuzha", "Kattappana"],
    "Ernakulam": ["Thrippunithura", "Muvattupuzha", "Kothamangalam", "Perumbavoor", "Aluva", "North Paravur", "Angamaly", "Kalamassery", "Maradu", "Eloor", "Thrikkakara", "Piravom", "Koothattukulam"],
    "Thrissur": ["Chalakudy", "Kunnamkulam", "Kodungallur", "Chavakkad", "Guruvayoor", "Irinjalakuda", "Wadakkanchery"],
    "Palakkad": ["Palakkad", "Shornur", "Chittur-Thathamangalam", "Ottappalam", "Mannarkkad", "Pattambi", "Cherpulassery"],
    "Kozhikode": ["Vatakara", "Koyilandy", "Ramanattukara", "Koduvally", "Mukkam", "Payyoli", "Feroke"],
    "Wayanad": ["Kalpetta", "Mananthavady", "Sulthan Bathery"],
    "Kannur": ["Taliparamba", "Payyannur", "Thalassery", "Mattannur", "Koothuparamba", "Anthoor", "Iritty", "Panoor", "Sreekandapuram"],
    "Kasaragod": ["Kasaragod", "Kanhangad", "Nileshwar"]
  },
  corporations: {
    "Thiruvananthapuram": ["Thiruvananthapuram Corporation"],
    "Kozhikode": ["Kozhikode Corporation"],
    "Ernakulam": ["Kochi Corporation"],
    "Kollam": ["Kollam Corporation"],
    "Thrissur": ["Thrissur Corporation"],
    "Kannur": ["Kannur Corporation"]
  },
  grama_panchayats: {
    "Manjeri": ["Thrikkalangode", "Pandikkad", "Edavanna", "Keezhuparamba", "Urangattiri"],
    "Kondotty": ["Cheekkode", "Cherukavu", "Kondotty", "Pulikkal", "Vazhayur", "Vazhakkad"],
    "DEFAULT": ["Grama Panchayat 1", "Grama Panchayat 2", "Grama Panchayat 3"]
  }
};

const ELECTION_TYPES = [
  "District Panchayat", "Block Panchayat", "Grama Panchayat", "Municipality", "Municipal Corporation"
];

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
    election_type: 'Grama Panchayat',
    district: '',
    block: '',
    local_body_name: ''
  });

  const fetchElections = async () => {
    try {
      const res = await api.get('/api/admin/elections');
      if (res.data.success) setElections(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) addToast("Forbidden: Access denied.", "error");
      else addToast("Failed to load elections", "error");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchElections(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -- Helpers --
  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const getLocalBodyList = () => {
    if (!form.district) return [];
    if (form.election_type === 'Municipality') return KERALA_ADMIN_DATA.municipalities[form.district] || [];
    if (form.election_type === 'Municipal Corporation') return KERALA_ADMIN_DATA.corporations[form.district] || [];
    if (form.election_type === 'Grama Panchayat') {
      if (!form.block) return [];
      return KERALA_ADMIN_DATA.grama_panchayats[form.block] || KERALA_ADMIN_DATA.grama_panchayats["DEFAULT"];
    }
    return [];
  };

  // -- Form Handlers --
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setForm(prev => ({
      ...prev,
      start_date: newStart,
      end_date: (prev.end_date && prev.end_date < newStart) ? '' : prev.end_date
    }));
  };

  const handleEndDateChange = (e) => {
    setForm(prev => ({ ...prev, end_date: e.target.value }));
  };

  const handleEdit = (election) => {
    setEditingId(election.ID);
    setForm({
      title: election.title, description: election.description,
      start_date: formatDateTimeLocal(election.start_date),
      end_date: formatDateTimeLocal(election.end_date),
      election_type: election.election_type || 'Grama Panchayat',
      district: election.district || '',
      block: election.block || '',
      local_body_name: election.local_body_name || ''
    });
    setShowFormModal(true); setActiveDropdown(null);
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', start_date: '', end_date: '',
      election_type: 'Grama Panchayat', district: '', block: '', local_body_name: ''
    });
    setEditingId(null); setShowFormModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      addToast("End Date must be strictly after Start Date", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        block: (form.election_type === 'District Panchayat' || form.election_type === 'Municipality' || form.election_type === 'Municipal Corporation') ? '' : form.block,
        local_body_name: (form.election_type === 'District Panchayat' || form.election_type === 'Block Panchayat') ? '' : form.local_body_name,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString()
      };

      if (editingId) {
        await api.put(`/api/admin/elections/${editingId}`, payload);
        addToast("Election updated successfully!", "success");
      } else {
        await api.post('/api/admin/elections', payload);
        addToast("Election created successfully!", "success");
      }
      resetForm(); fetchElections();
    } catch (err) {
      if (err.response?.status === 403) addToast("Forbidden", "error");
      else addToast("Operation Failed", "error");
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/elections/${id}`);
      addToast("Election deleted successfully", "success");
      fetchElections();
      setActiveDropdown(null);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to delete election", "error");
    }
  };

  const initiateStatusChange = (election, type) => {
    setActiveDropdown(null);
    setConfirmModal({ show: true, type: type, data: election });
  };

  const executeStatusChange = async () => {
    const { type, data } = confirmModal;
    if (!data) return;

    setSubmitting(true);
    try {
      if (type === 'stop') {
        const now = new Date();
        await api.put(`/api/admin/elections/${data.ID}`, {
          ...data,
          end_date: now.toISOString(),
          is_active: false
        });
        addToast("Election stopped permanently.", "success");
      } else {
        const newStatus = type === 'resume';
        await api.post('/api/admin/elections/status', {
          election_id: data.ID,
          status: newStatus
        });
        addToast(`Election ${newStatus ? 'resumed' : 'paused'} successfully`, "success");
      }
      fetchElections();
      setConfirmModal({ show: false, type: null, data: null });
    } catch (err) {
      addToast("Failed to update status", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-6 pb-20">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Election Manager
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Orchestrate elections across Districts, Municipalities, and Panchayats.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowFormModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transform hover:-translate-y-1 transition-all duration-300"
        >
          <Plus size={20} /> New Election
        </button>
      </div>

      {/* --- ELECTION GRID --- */}
      <div className="grid grid-cols-1 gap-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
            <p>Loading election data...</p>
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No elections found.</p>
            <button onClick={() => setShowFormModal(true)} className="text-indigo-400 hover:text-indigo-300 font-medium mt-2">Create your first one</button>
          </div>
        ) : (
          elections.map((election, idx) => {
            const isEnded = new Date(election.end_date) < new Date();
            const canUpdate = !election.is_active && !isEnded;
            const canDelete = !election.is_active || isEnded;
            const canStop = !isEnded;
            const isActiveElection = election.is_active && !isEnded;


            return (
              <div
                key={election.ID}
                className={`group relative bg-gradient-to-br from-slate-900 to-slate-900/80 border p-6 rounded-3xl flex flex-col md:flex-row gap-6 justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.005]
                ${isActiveElection
                    ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700 shadow-xl'
                  }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-5 w-full">
                  {/* Icon Box */}
                  <div className={`p-4 rounded-2xl shadow-inner flex-shrink-0 transition-colors duration-300 ${isActiveElection ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                    }`}>
                    <Vote size={32} />
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-slate-100 group-hover:text-white transition-colors">{election.title}</h3>

                      {/* Desktop Menu (Visible on MD+) */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === election.ID ? null : election.ID)}
                          className={`p-2 rounded-xl transition-all ${activeDropdown === election.ID ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}
                        >
                          <MoreVertical size={20} />
                        </button>
                        {activeDropdown === election.ID && (
                          <div ref={dropdownRef} className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                            <button onClick={() => handleEdit(election)} disabled={!canUpdate} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-3 transition-colors ${canUpdate ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed'}`}>
                              <Pencil size={16} /> Edit Details {!canUpdate && <Lock size={12} className="ml-auto" />}
                            </button>
                            <button onClick={() => initiateStatusChange(election, 'stop')} disabled={!canStop} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-3 transition-colors ${canStop ? 'text-amber-400 hover:bg-amber-500/10' : 'text-slate-600 cursor-not-allowed'}`}>
                              <Ban size={16} /> Stop Permanently {!canStop && <Lock size={12} className="ml-auto" />}
                            </button>
                            <div className="h-px bg-slate-800 my-1.5 mx-2"></div>
                            <button onClick={() => handleDelete(election.ID)} disabled={!canDelete} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-3 transition-colors ${canDelete ? 'text-rose-400 hover:bg-rose-500/10' : 'text-slate-600 cursor-not-allowed'}`}>
                              <Trash2 size={16} /> Delete {!canDelete && <Lock size={12} className="ml-auto" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
                      <span className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5">
                        <Layers size={12} /> {election.election_type}
                      </span>
                      {election.district && (
                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg border border-slate-700 text-xs flex items-center gap-1.5">
                          <MapPin size={12} /> {election.district}
                        </span>
                      )}
                      {election.local_body_name && (
                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg border border-slate-700 text-xs flex items-center gap-1.5">
                          <Building size={12} /> {election.local_body_name}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 mb-4 leading-relaxed text-sm max-w-2xl">{election.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs font-medium font-mono text-slate-500">
                      <span className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded border border-slate-800"><Calendar size={14} className="text-slate-400" /> {new Date(election.start_date).toLocaleString()}</span>
                      <span className="flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded border border-slate-800"><Clock size={14} className="text-slate-400" /> {isEnded ? "Ended" : "Ends"}: {new Date(election.end_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm
                        ${isEnded
                      ? 'bg-slate-800 border-slate-700 text-slate-400'
                      : election.is_active
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${isEnded ? 'bg-slate-500' : election.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                    {isEnded ? "COMPLETED" : (election.is_active ? "LIVE" : "PAUSED")}
                  </span>

                  {!isEnded && (
                    <button
                      onClick={() => initiateStatusChange(election, election.is_active ? 'pause' : 'resume')}
                      className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg
                                ${election.is_active
                          ? 'text-emerald-400 hover:bg-emerald-500/10 hover:shadow-emerald-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      title={election.is_active ? "Pause Election" : "Resume Election"}
                    >
                      {election.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={resetForm} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-bottom-5 duration-300 flex flex-col max-h-[90vh] md:max-h-[85vh]">

            <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{editingId ? 'Edit Election' : 'Create Election'}</h2>
                <p className="text-slate-500 text-sm mt-0.5">Fill in the details to configure the voting process.</p>
              </div>
              <button onClick={resetForm} className="text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              {/* Basic Info */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Election Title <span className="text-red-500">*</span></label>
                  <input required placeholder="e.g. Annual Grama Panchayat Election 2024" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-white placeholder-slate-600 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Description <span className="text-red-500">*</span></label>
                  <textarea required placeholder="Briefly describe the purpose of this election..." rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-white placeholder-slate-600 transition-all outline-none resize-none" />
                </div>
              </div>

              {/* JURISDICTION SETTINGS */}
              <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-5 space-y-5">
                <h3 className="text-sm font-bold text-indigo-400 flex gap-2 items-center"><Building size={16} /> Jurisdiction Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* 1. Election Type */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase font-bold text-slate-500">Election Level <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <select required value={form.election_type} onChange={(e) => setForm({ ...form, election_type: e.target.value, block: '', local_body_name: '' })} className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-3.5 text-white appearance-none outline-none transition-all cursor-pointer hover:border-slate-600">
                        {ELECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" size={16} />
                    </div>
                  </div>

                  {/* 2. District (Always Required) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase font-bold text-slate-500">District <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, block: '', local_body_name: '' })} className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-3.5 text-white appearance-none outline-none transition-all cursor-pointer hover:border-slate-600">
                        <option value="">-- Select District --</option>
                        {KERALA_ADMIN_DATA.districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" size={16} />
                    </div>
                  </div>

                  {/* 3. Block */}
                  {(form.election_type === 'Block Panchayat' || form.election_type === 'Grama Panchayat') && (
                    <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs uppercase font-bold text-slate-500">Block Panchayat <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <select required value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value, local_body_name: '' })} className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-3.5 text-white appearance-none outline-none transition-all cursor-pointer disabled:opacity-50" disabled={!form.district}>
                          <option value="">-- Select Block --</option>
                          {form.district && KERALA_ADMIN_DATA.blocks[form.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                      </div>
                    </div>
                  )}

                  {/* 4. Local Body Name */}
                  {(form.election_type === 'Grama Panchayat' || form.election_type === 'Municipality' || form.election_type === 'Municipal Corporation') && (
                    <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs uppercase font-bold text-slate-500">
                        {form.election_type === 'Grama Panchayat' ? 'Grama Panchayat Name' :
                          form.election_type === 'Municipality' ? 'Municipality Name' : 'Corporation Name'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <select required value={form.local_body_name} onChange={(e) => setForm({ ...form, local_body_name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-3.5 text-white appearance-none outline-none transition-all cursor-pointer disabled:opacity-50" disabled={!form.district}>
                          <option value="">-- Select Name --</option>
                          {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Start Date <span className="text-red-500">*</span></label>
                  <input required type="datetime-local" value={form.start_date} onChange={handleStartDateChange} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-white outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">End Date <span className="text-red-500">*</span></label>
                  <input required type="datetime-local" value={form.end_date} onChange={handleEndDateChange} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-white outline-none transition-all" />
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-4 border-t border-slate-800">
                <button type="button" onClick={resetForm} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5">
                  {submitting ? <Loader2 className="animate-spin mx-auto" /> : (editingId ? 'Update Election' : 'Create Election')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({ show: false, type: null, data: null })} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmModal.type === 'stop' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 capitalize">{confirmModal.type === 'stop' ? 'Stop Permanently?' : `${confirmModal.type} Election?`}</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-sm">
              {confirmModal.type === 'stop'
                ? "This action is irreversible. The election will be closed immediately."
                : `Are you sure you want to ${confirmModal.type} the election "${confirmModal.data?.title}"?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, type: null, data: null })} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors">Cancel</button>
              <button onClick={executeStatusChange} disabled={submitting} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${confirmModal.type === 'stop' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}>
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Elections;