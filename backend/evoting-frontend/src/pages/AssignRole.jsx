import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  Shield, 
  Loader2, 
  Check, 
  Search,
  Save,
  X,
  UserCog
} from 'lucide-react';

const AssignRoles = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminRes, roleRes] = await Promise.all([
        api.get('/auth/admin/list'),
        api.get('/api/auth/admin/roles')
      ]);
      
      if (adminRes.data.success) setAdmins(adminRes.data.data);
      if (roleRes.data.success) setRoles(roleRes.data.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      addToast("Failed to load assignment data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAssignModal = (admin) => {
    setSelectedAdmin(admin);
    const currentRoleIds = roles
        .filter(r => admin.roles.includes(r.Name))
        .map(r => r.ID);
        
    setSelectedRoleIds(currentRoleIds);
    setIsModalOpen(true);
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
        await api.post('/api/auth/admin/assign-roles', {
            admin_id: selectedAdmin.id,
            role_ids: selectedRoleIds
        });
        addToast("Roles updated successfully!", "success");
        setIsModalOpen(false);
        fetchData();
    } catch (err) {
        addToast(err.response?.data?.error || "Failed to update roles", "error");
    } finally {
        setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    !a.is_super && 
    (a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     a.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assign Roles</h1>
          <p className="text-slate-400 mt-1">Manage multiple roles for sub-admins.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
         <div className="p-5 border-b border-slate-800 flex justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                  type="text" 
                  placeholder="Search sub-admins..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 font-semibold">
                    <tr>
                        <th className="px-6 py-4">Sub Admin</th>
                        <th className="px-6 py-4">Current Roles</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {loading ? (
                        <tr><td colSpan="3" className="px-6 py-12 text-center"><Loader2 className="animate-spin inline text-emerald-500" /></td></tr>
                    ) : filteredAdmins.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500">No sub-admins found.</td></tr>
                    ) : (
                        filteredAdmins.map(admin => (
                            <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 font-bold border border-slate-700">
                                            {admin.name ? admin.name.charAt(0) : <Users size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{admin.name || 'Unnamed'}</div>
                                            <div className="text-xs text-slate-500">{admin.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {admin.roles && admin.roles.length > 0 ? (
                                            admin.roles.map((r, i) => (
                                                <span key={i} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-xs font-medium">
                                                    {r}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-600 text-xs italic">No roles assigned</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => openAssignModal(admin)}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        <UserCog size={16} /> Assign Roles
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
         </div>
      </div>

      {isModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
           <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="text-emerald-500" size={20} />
                        Assign Roles
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="text-sm text-slate-400">Assigning roles to:</p>
                        <p className="text-white font-bold text-lg">{selectedAdmin.name} <span className="text-slate-500 text-sm font-normal">({selectedAdmin.email})</span></p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Select Roles</label>
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {roles.map(role => (
                                <label 
                                    key={role.ID} 
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                        selectedRoleIds.includes(role.ID)
                                        ? 'bg-emerald-500/10 border-emerald-500/50'
                                        : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                        selectedRoleIds.includes(role.ID) 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'bg-slate-900 border-slate-600'
                                    }`}>
                                        {selectedRoleIds.includes(role.ID) && <Check size={14} />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={selectedRoleIds.includes(role.ID)}
                                        onChange={() => toggleRole(role.ID)}
                                    />
                                    <div>
                                        <div className={`font-medium ${selectedRoleIds.includes(role.ID) ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {role.Name}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={submitting}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Save Assignments
                    </button>
                </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssignRoles;