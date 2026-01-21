import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, 
  Plus, 
  Loader2, 
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  Vote, 
  Lock,
  Pencil,
  X,
  MoreVertical,
  Trash2,
  AlertTriangle,
  Ban,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // -- Modals --
  const [showFormModal, setShowFormModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    type: null, // 'pause', 'resume', 'stop'
    data: null 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { addToast } = useToast();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const fetchElections = async () => {
    try {
      const res = await api.get('/api/admin/elections');
      if (res.data.success) setElections(res.data.data);
    } catch (err) {
      if(err.response?.status === 403) {
        addToast("Forbidden: You do not have permission to view elections.", "error");
      } else {
        addToast("Failed to load elections", "error");
      }
    } finally {
      setLoading(false);
    }
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

  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  // -- Form Actions --
  const handleEdit = (election) => {
    setEditingId(election.ID);
    setForm({
        title: election.title,
        description: election.description,
        start_date: formatDateTimeLocal(election.start_date),
        end_date: formatDateTimeLocal(election.end_date)
    });
    setShowFormModal(true);
    setActiveDropdown(null);
  };

  const resetForm = () => {
      setForm({ title: '', description: '', start_date: '', end_date: '' });
      setEditingId(null);
      setShowFormModal(false);
  };

  const handleStartDateChange = (e) => {
      const newStart = e.target.value;
      setForm(prev => ({
          ...prev, 
          start_date: newStart,
          end_date: (prev.end_date && prev.end_date < newStart) ? '' : prev.end_date
      }));
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
      
      resetForm();
      fetchElections();
    } catch (err) {
      if(err.response?.status === 403) {
         addToast("Forbidden: Access denied.", "error");
      } else {
         addToast(`Failed to ${editingId ? 'update' : 'create'} election.`, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
        await api.delete(`/api/admin/elections/${id}`);
        addToast("Election deleted successfully", "success");
        fetchElections();
        setActiveDropdown(null);
    } catch (err) {
        addToast(err.response?.data?.error || "Failed to delete election", "error");
    }
  };

  // -- Status Actions (Pause, Resume, Stop) --

  // 1. Open Confirmation Modal
  const initiateStatusChange = (election, type) => {
    setActiveDropdown(null); // Close dropdown if open
    setConfirmModal({
        show: true,
        type: type,
        data: election
    });
  };

  // 2. Execute Action
  const executeStatusChange = async () => {
    const { type, data } = confirmModal;
    if (!data) return;

    setSubmitting(true);
    try {
        if (type === 'stop') {
            // STOP PERMANENTLY: Often implemented by setting end_date to now
            const now = new Date();
            await api.put(`/api/admin/elections/${data.ID}`, {
                ...data,
                end_date: now.toISOString(),
                is_active: false // Ensure it's inactive
            });
            addToast("Election stopped permanently.", "success");
        } else {
            // PAUSE / RESUME
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
        if(err.response?.status === 403) {
            addToast("Forbidden: You cannot perform this action.", "error");
        } else {
            addToast("Failed to update election status.", "error");
        }
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Election Management</h1>
          <p className="text-slate-400 mt-1">Create and monitor election events.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowFormModal(true); }} 
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create Election
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
           <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : elections.length === 0 ? (
           <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
             No elections found. Create your first one.
           </div>
        ) : (
           elections.map((election) => {
             const isEnded = new Date(election.end_date) < new Date();
             const canUpdate = !election.is_active && !isEnded;
             const canDelete = !election.is_active || isEnded;
             
             // Check if "Stop Permanently" is available (must not be already ended)
             const canStop = !isEnded;

             return (
               <div key={election.ID} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-slate-700 transition-all shadow-md group relative">
                  
                  <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${election.is_active && !isEnded ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                         <Vote size={24} />
                      </div>
                      <div>
                         <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-200">{election.title}</h3>
                            <div className="relative">
                                <button 
                                    onClick={() => setActiveDropdown(activeDropdown === election.ID ? null : election.ID)}
                                    className={`p-1 rounded-lg transition-colors ${activeDropdown === election.ID ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <MoreVertical size={16} />
                                </button>

                                {activeDropdown === election.ID && (
                                    <div 
                                        ref={dropdownRef}
                                        className="absolute left-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                                    >
                                        <div className="p-1 space-y-0.5">
                                            {/* Edit */}
                                            <button 
                                                onClick={() => handleEdit(election)}
                                                disabled={!canUpdate}
                                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                                                    canUpdate 
                                                    ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                                                    : 'text-slate-600 cursor-not-allowed'
                                                }`}
                                            >
                                                <Pencil size={14} /> Edit Details
                                                {!canUpdate && <Lock size={12} className="ml-auto opacity-50"/>}
                                            </button>

                                            {/* Stop Permanently - New Option */}
                                            <button 
                                                onClick={() => initiateStatusChange(election, 'stop')}
                                                disabled={!canStop}
                                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                                                    canStop
                                                    ? 'text-amber-400 hover:bg-amber-500/10'
                                                    : 'text-slate-600 cursor-not-allowed'
                                                }`}
                                            >
                                                <Ban size={14} /> Stop Permanently
                                                {!canStop && <Lock size={12} className="ml-auto opacity-50"/>}
                                            </button>
                                            
                                            <div className="h-px bg-slate-800 my-1 mx-2"></div>
                                            
                                            {/* Delete */}
                                            <button 
                                                onClick={() => handleDelete(election.ID)}
                                                disabled={!canDelete}
                                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                                                    canDelete 
                                                    ? 'text-rose-400 hover:bg-rose-500/10' 
                                                    : 'text-slate-600 cursor-not-allowed'
                                                }`}
                                            >
                                                <Trash2 size={14} /> Delete
                                                {!canDelete && <Lock size={12} className="ml-auto opacity-50"/>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{election.description || "No description provided."}</p>
                        
                        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                           <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded">
                              <Calendar size={12} /> 
                              {new Date(election.start_date).toLocaleDateString()}
                           </span>
                           <span className={`flex items-center gap-1.5 px-2 py-1 rounded ${isEnded ? 'bg-rose-900/20 text-rose-400' : 'bg-slate-800'}`}>
                              <Clock size={12} />
                              {isEnded ? "Ended: " : "Ends: "} 
                              {new Date(election.end_date).toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto pl-16 md:pl-0">
                      <div className={`text-sm font-bold px-3 py-1 rounded-full border ${
                         isEnded 
                           ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' 
                           : election.is_active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                         {isEnded ? "Ended" : (election.is_active ? "Live" : "Paused")}
                      </div>

                      {/* Toggle Button for Pause/Resume */}
                      {!isEnded && (
                         <button 
                           onClick={() => initiateStatusChange(election, election.is_active ? 'pause' : 'resume')}
                           className={`p-2 rounded-lg transition-colors ${election.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                           title={election.is_active ? "Pause Election" : "Resume Election"}
                         >
                            {election.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                         </button>
                      )}
                      
                      {isEnded && (
                          <div className="p-2 text-slate-600 cursor-not-allowed">
                             <Lock size={24} />
                          </div>
                      )}
                  </div>
               </div>
             );
           })
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={resetForm} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {editingId ? 'Update Election' : 'Create New Election'}
                    </h2>
                    <button onClick={resetForm} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                 </div>
                 
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Title</label>
                       <input 
                          required 
                          value={form.title} 
                          onChange={e => setForm({...form, title: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
                       <textarea 
                          rows="3"
                          value={form.description} 
                          onChange={e => setForm({...form, description: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-400 uppercase">Start Date</label>
                          <input 
                             type="datetime-local"
                             required 
                             min={getCurrentDateTime()} 
                             value={form.start_date} 
                             onChange={handleStartDateChange}
                             className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-400 uppercase">End Date</label>
                          <input 
                             type="datetime-local"
                             required 
                             disabled={!form.start_date} 
                             min={form.start_date} 
                             value={form.end_date} 
                             onChange={handleEndDateChange} 
                             className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
                          />
                       </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-4">
                       <button type="button" onClick={resetForm} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-700">Cancel</button>
                       <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg">
                          {submitting ? <Loader2 className="animate-spin mx-auto" /> : (editingId ? 'Update' : 'Create')}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* STATUS CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setConfirmModal({show:false, type:null, data:null})} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
               
               {/* Dynamic Header Color based on Action Type */}
               <div className={`p-6 flex justify-center border-b ${
                   confirmModal.type === 'stop' 
                     ? 'bg-rose-500/10 border-rose-500/20' 
                     : 'bg-amber-500/10 border-amber-500/20'
               }`}>
                   <div className={`p-3 rounded-full ${
                        confirmModal.type === 'stop' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                   }`}>
                        <AlertTriangle size={32} />
                   </div>
               </div>

               <div className="p-6 text-center">
                   <h3 className="text-xl font-bold text-white mb-2 capitalize">
                       {confirmModal.type === 'stop' ? 'Stop Permanently?' : `${confirmModal.type} Election?`}
                   </h3>
                   
                   <p className="text-slate-400 mb-6">
                       {confirmModal.type === 'stop' ? (
                           <>
                             This will <span className="text-rose-400 font-semibold">permanently close</span> the election. 
                             <br/>Users will no longer be able to vote and this action <u>cannot be undone</u>.
                           </>
                       ) : confirmModal.type === 'pause' ? (
                           <>
                             Pausing will temporarily disable voting for 
                             <br/><span className="text-slate-200 font-semibold">"{confirmModal.data?.title}"</span>.
                           </>
                       ) : (
                           <>
                             Resuming will immediately enable voting for 
                             <br/><span className="text-slate-200 font-semibold">"{confirmModal.data?.title}"</span>.
                           </>
                       )}
                   </p>

                   <div className="flex gap-3">
                       <button 
                          onClick={() => setConfirmModal({show:false, type:null, data:null})} 
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-700 transition-colors"
                       >
                           Cancel
                       </button>
                       <button 
                          onClick={executeStatusChange} 
                          disabled={submitting}
                          className={`flex-1 py-3 text-white rounded-xl font-medium shadow-lg transition-colors flex justify-center items-center gap-2 ${
                              confirmModal.type === 'stop'
                                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                                : confirmModal.type === 'pause'
                                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                          }`}
                       >
                          {submitting ? <Loader2 className="animate-spin" size={20} /> : (
                              <>
                                {confirmModal.type === 'stop' && <Ban size={18} />}
                                {confirmModal.type === 'pause' && <PauseCircle size={18} />}
                                {confirmModal.type === 'resume' && <PlayCircle size={18} />}
                                Confirm
                              </>
                          )}
                       </button>
                   </div>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Elections;