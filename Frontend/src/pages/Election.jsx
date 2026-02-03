import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  Calendar, Plus, Loader2, Clock, ToggleLeft, ToggleRight, Vote, Lock,
  Pencil, X, MoreVertical, Trash2, AlertTriangle, Ban,
  MapPin, Building, ChevronDown, Layers, Search, Hash,
  Share2, Eye, CheckCircle2
} from 'lucide-react';

const ELECTION_TYPES = [
  "District Panchayat", "Block Panchayat", "Grama Panchayat", "Municipality", "Municipal Corporation"
];

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filtering State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // --- Dynamic Admin Data State ---
  const [adminData, setAdminData] = useState({
    districts: [],
    blocks: {},
    municipalities: {},
    corporations: {},
    grama_panchayats: {}
  });

  const [showFormModal, setShowFormModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: null, data: null });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { addToast } = useToast();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // State to force re-render every minute for live status updates
  const [, setTick] = useState(0);

  const [form, setForm] = useState({
    title: '', description: '', start_date: '', end_date: '',
    election_type: 'Grama Panchayat',
    district: '',
    block: '',
    local_body_name: '',
    ward: ''
  });

  // --- ROBUST INITIAL DATA FETCH ---
  const initData = async () => {
    setLoading(true);

    try {
      // 1. Fetch Admin Reference Data
      const response = await api.get('/api/common/kerala-data');
      if (response.data && response.data.success) {
        let payload = response.data.data;
        const normalizeData = (data) => {
          if (Array.isArray(data)) {
            if (data.length > 0 && data[0].hasOwnProperty('Key') && data[0].hasOwnProperty('Value')) {
              return data.reduce((acc, item) => {
                acc[item.Key] = normalizeData(item.Value);
                return acc;
              }, {});
            }
            return data;
          }
          if (data && typeof data === 'object') {
            Object.keys(data).forEach(key => {
              data[key] = normalizeData(data[key]);
            });
          }
          return data;
        };
        const cleanPayload = normalizeData(payload);
        if (cleanPayload && cleanPayload.districts) {
          setAdminData(cleanPayload);
        }
      }
    } catch (err) {
      console.error("Failed to load Kerala admin data", err);
    }

    // 2. Fetch Elections List
    try {
      const electionsRes = await api.get('/api/admin/elections');
      if (electionsRes.data.success) {
        setElections(electionsRes.data.data || []);
      }
    } catch (err) {
      if (err.response?.status === 403) addToast("Forbidden: Access denied.", "error");
      else console.error("Failed to load elections list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initData(); }, []);

  // --- Live Status Timer ---
  // Updates the UI every minute to check if elections have ended
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(tick => tick + 1);
    }, 60000); // 1 minute
    return () => clearInterval(timer);
  }, []);

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

  // Get current time in 'YYYY-MM-DDTHH:mm' format for min attributes
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    // Adjust to local timezone
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const isWardRequired = (type) => {
    return ['Grama Panchayat', 'Municipality', 'Municipal Corporation'].includes(type);
  };

  const getLocalBodyList = () => {
    if (!form.district || !adminData) return [];
    if (form.election_type === 'Municipality') return adminData.municipalities?.[form.district] || [];
    if (form.election_type === 'Municipal Corporation') return adminData.corporations?.[form.district] || [];
    if (form.election_type === 'Grama Panchayat') {
      if (!form.block) return [];
      return adminData.grama_panchayats?.[form.block] || [];
    }
    return [];
  };

  // -- Filtering Logic --
  const now = new Date();
  const filteredElections = elections.filter(election => {
    const isEnded = new Date(election.end_date) < now;

    // Status Logic
    let statusMatch = true;
    if (filterStatus === 'LIVE') statusMatch = election.is_active && !isEnded;
    if (filterStatus === 'PAUSED') statusMatch = !election.is_active && !isEnded;
    if (filterStatus === 'COMPLETED') statusMatch = isEnded;

    // Search Logic
    const searchMatch =
      !searchTerm ||
      election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (election.district && election.district.toLowerCase().includes(searchTerm.toLowerCase()));

    return statusMatch && searchMatch;
  });

  // -- Action Handlers --

  const handlePublishToggle = async (election) => {
    setActiveDropdown(null);
    const isPublishing = !election.is_published;
    if (!window.confirm(`Are you sure you want to ${isPublishing ? 'PUBLISH' : 'UNPUBLISH'} results for "${election.title}"?`)) return;

    try {
      await api.post('/api/admin/elections/publish', {
        election_id: election.ID,
        publish: isPublishing
      });
      addToast(`Results ${isPublishing ? 'Published' : 'Unpublished'} successfully!`, "success");
      initData();
    } catch (err) {
      addToast("Failed to update publish status", "error");
    }
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setForm(prev => ({
      ...prev,
      start_date: newStart,
      // If end date is before new start date, clear end date
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
      local_body_name: election.local_body_name || '',
      ward: election.ward || ''
    });
    setShowFormModal(true); setActiveDropdown(null);
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', start_date: '', end_date: '',
      election_type: 'Grama Panchayat', district: '', block: '', local_body_name: '', ward: ''
    });
    setEditingId(null); setShowFormModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      addToast("End Date must be strictly after Start Date", "warning");
      return;
    }

    if (isWardRequired(form.election_type) && !form.ward.trim()) {
      addToast(`Ward is required for ${form.election_type} elections`, "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        block: (['District Panchayat', 'Municipality', 'Municipal Corporation'].includes(form.election_type)) ? '' : form.block,
        local_body_name: (['District Panchayat', 'Block Panchayat'].includes(form.election_type)) ? '' : form.local_body_name,
        ward: isWardRequired(form.election_type) ? form.ward : '',
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
      resetForm(); initData();
    } catch (err) {
      const errorMessage = err.response?.data?.error ||
        (err.response?.status === 403 ? "Forbidden Action" : "Operation Failed");
      addToast(errorMessage, "error");
    }
    finally { setSubmitting(false); }
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
      if (type === 'delete') {
        await api.delete(`/api/admin/elections/${data.ID}`);
        addToast("Election deleted successfully", "success");
      }
      else if (type === 'stop') {
        const now = new Date();
        await api.put(`/api/admin/elections/${data.ID}`, {
          title: data.title,
          description: data.description,
          start_date: data.start_date,
          end_date: now.toISOString(),
          election_type: data.election_type,
          district: data.district,
          block: data.block,
          local_body_name: data.local_body_name,
          ward: data.ward,
          is_active: false
        });
        addToast("Election stopped permanently.", "success");
      }
      else {
        const newStatus = type === 'resume';
        await api.post('/api/admin/elections/status', {
          election_id: data.ID,
          status: newStatus
        });
        addToast(`Election ${newStatus ? 'resumed' : 'paused'} successfully`, "success");
      }
      initData();
      setConfirmModal({ show: false, type: null, data: null });
    } catch (err) {
      const msg = err.response?.data?.error || "Operation failed";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 p-6 md:p-10 min-h-screen bg-[#f8fafc]">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full mb-4">
            <Layers size={14} className="text-indigo-700" />
            <span className="text-indigo-800 text-[10px] font-black uppercase tracking-widest">Configuration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
            Election <span className="italic text-slate-400 font-light">Manager</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-light">
            Orchestrate elections across Districts, Municipalities, and Panchayats.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowFormModal(true); }}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transform hover:-translate-y-1 transition-all duration-300 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> New Election
        </button>
      </div>

      {/* --- TOOLBAR (SEARCH & FILTERS) --- */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elections..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto w-full md:w-auto">
          {['ALL', 'LIVE', 'PAUSED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${filterStatus === status
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* --- ELECTION GRID --- */}
      <div className="grid grid-cols-1 gap-6">
        {loading && elections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
            <p className="font-medium">Loading application data...</p>
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="text-center py-24 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-serif text-slate-600">No elections found.</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            {filterStatus === 'ALL' && !searchTerm && (
              <button onClick={() => setShowFormModal(true)} className="text-indigo-600 hover:text-indigo-700 font-bold mt-4 underline decoration-2 underline-offset-4">Create your first one</button>
            )}
          </div>
        ) : (
          filteredElections.map((election, idx) => {
            // Updated dynamically by re-render every minute
            const isEnded = new Date(election.end_date) < new Date();
            const canUpdate = !election.is_active && !isEnded;
            const canDelete = !election.is_active || isEnded;
            const canStop = !isEnded;
            const isActiveElection = election.is_active && !isEnded;
            const isPublished = election.is_published;

            return (
              <div
                key={election.ID}
                className={`group relative bg-white border p-6 rounded-[2rem] flex flex-col md:flex-row gap-8 justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.005]
                ${isActiveElection
                    ? 'border-emerald-100 shadow-lg shadow-emerald-50'
                    : 'border-slate-200 shadow-sm'
                  }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-6 w-full">
                  <div className={`p-5 rounded-2xl shadow-sm flex-shrink-0 transition-colors duration-300 ${isActiveElection ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                    }`}>
                    <Vote size={32} />
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors font-serif">{election.title}</h3>

                        {/* Publish Indicator Badge */}
                        {isPublished && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} /> Published
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === election.ID ? null : election.ID)}
                          className={`p-2 rounded-xl transition-all ${activeDropdown === election.ID ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                          <MoreVertical size={20} />
                        </button>
                        {activeDropdown === election.ID && (
                          <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">

                            <button onClick={() => handleEdit(election)} disabled={!canUpdate} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-3 transition-colors ${canUpdate ? 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600' : 'text-slate-300 cursor-not-allowed'}`}>
                              <Pencil size={16} /> Edit Details {!canUpdate && <Lock size={12} className="ml-auto" />}
                            </button>
                            <button onClick={() => initiateStatusChange(election, 'stop')} disabled={!canStop} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-3 transition-colors ${canStop ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-300 cursor-not-allowed'}`}>
                              <Ban size={16} /> Stop Permanently {!canStop && <Lock size={12} className="ml-auto" />}
                            </button>
                            <div className="h-px bg-slate-100 my-1.5 mx-2"></div>
                            {/* Updated Delete to use Confirmation Modal */}
                            <button onClick={() => initiateStatusChange(election, 'delete')} disabled={!canDelete} className={`w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-3 transition-colors ${canDelete ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-300 cursor-not-allowed'}`}>
                              <Trash2 size={16} /> Delete {!canDelete && <Lock size={12} className="ml-auto" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100 text-xs font-bold flex items-center gap-1.5">
                        <Layers size={12} /> {election.election_type}
                      </span>
                      {election.district && (
                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 font-medium">
                          <MapPin size={12} /> {election.district}
                        </span>
                      )}
                      {election.local_body_name && (
                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 font-medium">
                          <Building size={12} /> {election.local_body_name}
                        </span>
                      )}
                      {election.ward && (
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-1.5">
                          <Hash size={12} /> Ward {election.ward}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-500 mb-6 leading-relaxed text-sm max-w-3xl">{election.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                      <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-400" /> {new Date(election.start_date).toLocaleString()}</span>
                      <span className="flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> {isEnded ? "Ended" : "Ends"}: {new Date(election.end_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 min-w-[140px]">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm
                        ${isEnded
                      ? 'bg-slate-100 border-slate-200 text-slate-500'
                      : election.is_active
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-rose-50 border-rose-100 text-rose-500'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${isEnded ? 'bg-slate-400' : election.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {isEnded ? "COMPLETED" : (election.is_active ? "LIVE" : "PAUSED")}
                  </span>

                  {/* Toggle Logic / Publish Logic */}
                  {!isEnded ? (
                    <button
                      onClick={() => initiateStatusChange(election, election.is_active ? 'pause' : 'resume')}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-md border
                                ${election.is_active
                          ? 'bg-white border-emerald-100 text-emerald-500 hover:bg-emerald-50 hover:shadow-emerald-100'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                      title={election.is_active ? "Pause Election" : "Resume Election"}
                    >
                      {election.is_active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                    </button>
                  ) : (
                    // PUBLISH BUTTON FOR COMPLETED ELECTIONS
                    <button
                      onClick={() => handlePublishToggle(election)}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-md border
                                ${isPublished
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-100'
                        }`}
                      title={isPublished ? "Results Published (Click to Unpublish)" : "Publish Results Now"}
                    >
                      {isPublished ? <Eye size={30} /> : <Share2 size={30} />}
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={resetForm} />
          <div className="relative bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-bottom-5 duration-300 flex flex-col max-h-[90vh] md:max-h-[85vh]">

            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem]">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">{editingId ? 'Edit Election' : 'Create Election'}</h2>
                <p className="text-slate-500 text-sm mt-1">Fill in the details to configure the voting process.</p>
              </div>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 p-2 rounded-full transition-all shadow-sm"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Election Title <span className="text-rose-500">*</span></label>
                  <input required placeholder="e.g. Annual Grama Panchayat Election 2024" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 transition-all outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Description <span className="text-rose-500">*</span></label>
                  <textarea required placeholder="Briefly describe the purpose of this election..." rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 transition-all outline-none resize-none font-medium" />
                </div>
              </div>

              {/* JURISDICTION SETTINGS */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-indigo-700 flex gap-2 items-center"><Building size={16} /> Jurisdiction Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase font-bold text-slate-500">Election Level <span className="text-rose-500">*</span></label>
                    <div className="relative group">
                      <select required value={form.election_type} onChange={(e) => setForm({ ...form, election_type: e.target.value, block: '', local_body_name: '', ward: '' })} className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 text-slate-900 appearance-none outline-none transition-all cursor-pointer hover:border-indigo-300 font-medium shadow-sm">
                        {ELECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase font-bold text-slate-500">District <span className="text-rose-500">*</span></label>
                    <div className="relative group">
                      <select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, block: '', local_body_name: '' })} className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 text-slate-900 appearance-none outline-none transition-all cursor-pointer hover:border-indigo-300 font-medium shadow-sm">
                        <option value="">-- Select District --</option>
                        {adminData.districts?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
                    </div>
                  </div>

                  {(form.election_type === 'Block Panchayat' || form.election_type === 'Grama Panchayat') && (
                    <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs uppercase font-bold text-slate-500">Block Panchayat <span className="text-rose-500">*</span></label>
                      <div className="relative group">
                        <select required value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value, local_body_name: '' })} className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 text-slate-900 appearance-none outline-none transition-all cursor-pointer disabled:opacity-50 disabled:bg-slate-100 font-medium shadow-sm" disabled={!form.district}>
                          <option value="">-- Select Block --</option>
                          {form.district && adminData.blocks?.[form.district]?.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  )}

                  {(form.election_type === 'Grama Panchayat' || form.election_type === 'Municipality' || form.election_type === 'Municipal Corporation') && (
                    <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs uppercase font-bold text-slate-500">
                        {form.election_type === 'Grama Panchayat' ? 'Grama Panchayat Name' :
                          form.election_type === 'Municipality' ? 'Municipality Name' : 'Corporation Name'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <select required value={form.local_body_name} onChange={(e) => setForm({ ...form, local_body_name: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 text-slate-900 appearance-none outline-none transition-all cursor-pointer disabled:opacity-50 disabled:bg-slate-100 font-medium shadow-sm" disabled={!form.district}>
                          <option value="">-- Select Name --</option>
                          {getLocalBodyList().map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  )}

                  {isWardRequired(form.election_type) && (
                    <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs uppercase font-bold text-slate-500">
                        Specific Ward / Division <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          value={form.ward}
                          onChange={(e) => setForm({ ...form, ward: e.target.value })}
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 text-slate-900 outline-none transition-all placeholder-slate-400 pl-10 font-medium shadow-sm"
                          placeholder="e.g. 12"
                        />
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Only voters registered in this ward will see this election.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Start Date <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="datetime-local"
                    value={form.start_date}
                    onChange={handleStartDateChange}
                    min={getCurrentDateTimeLocal()} // RESTRICTION: Current Time
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-900 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">End Date <span className="text-rose-500">*</span></label>
                  <input
                    required
                    type="datetime-local"
                    value={form.end_date}
                    onChange={handleEndDateChange}
                    min={form.start_date || getCurrentDateTimeLocal()} // RESTRICTION: After Start Date
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-slate-900 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5">
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({ show: false, type: null, data: null })} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmModal.type === 'stop' || confirmModal.type === 'delete' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">
              {confirmModal.type === 'stop'
                ? 'Stop Permanently?'
                : `${confirmModal.type?.charAt(0).toUpperCase() + confirmModal.type?.slice(1)} Election?`
              }
            </h3>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
              {confirmModal.type === 'stop'
                ? "This action is irreversible. The election will be closed immediately."
                : `Are you sure you want to ${confirmModal.type} the election "${confirmModal.data?.title}"?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, type: null, data: null })} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
              <button onClick={executeStatusChange} disabled={submitting} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${confirmModal.type === 'stop' || confirmModal.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}>
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