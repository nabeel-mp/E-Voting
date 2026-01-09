// nabeel-mp/e-voting/E-Voting-e827307a9ccaf9e84bf5d22239f0e8c4b0f5aa02/backend/evoting-frontend/src/pages/Staff.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';

const Staff = () => {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', role_id: '' });
  const [roleForm, setRoleForm] = useState({ name: '', permissions: '' });

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/auth/admin/roles');
      if (res.data.success) setRoles(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/admin/create-sub-admin', {
        ...form,
        role_id: parseInt(form.role_id)
      });
      alert("Staff created successfully");
      setForm({ email: '', password: '', role_id: '' });
    } catch (err) { alert(err.response?.data?.error || "Failed"); }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/admin/roles', {
        name: roleForm.name,
        permissions: roleForm.permissions.split(',').map(p => p.trim())
      });
      alert("Role created");
      setRoleForm({ name: '', permissions: '' });
      fetchRoles();
    } catch (err) { alert("Failed"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Create Staff */}
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 h-fit">
        <h2 className="text-2xl font-bold text-white mb-6">Create Staff Member</h2>
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input type="email" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input type="password" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-slate-400">Role</label>
            <select required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1"
              value={form.role_id} onChange={e => setForm({...form, role_id: e.target.value})}>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.ID} value={r.ID}>{r.Name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-medium mt-2">
            Create Account
          </button>
        </form>
      </div>

      {/* Manage Roles */}
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 h-fit">
        <h2 className="text-2xl font-bold text-white mb-6">Create Role</h2>
        <form onSubmit={handleCreateRole} className="space-y-4 mb-8">
          <input placeholder="Role Name (e.g. MODERATOR)" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
            value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} />
          <input placeholder="Permissions (comma separated: register_voter, view_results)" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
            value={roleForm.permissions} onChange={e => setRoleForm({...roleForm, permissions: e.target.value})} />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg">
            Add Role
          </button>
        </form>

        <h3 className="text-lg font-semibold text-white mb-4">Existing Roles</h3>
        <ul className="space-y-2">
          {roles.map(r => (
            <li key={r.ID} className="bg-slate-900 p-3 rounded border border-slate-700">
              <span className="text-indigo-400 font-bold">{r.Name}</span>
              <p className="text-xs text-slate-500 mt-1">{r.Permissions}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Staff;