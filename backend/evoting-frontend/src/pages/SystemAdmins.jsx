import { useEffect, useState } from 'react';
import api from '../utils/api';

const SystemAdmins = () => {
  const [admins, setAdmins] = useState([]);

  const fetchAdmins = async () => {
    // Note: Matches 'superAdminLegacy' route in routes.go
    const res = await api.get('/auth/admin/list');
    if(res.data.success) setAdmins(res.data.data);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const toggleStatus = async (id, isActive) => {
    const endpoint = isActive ? "/auth/admin/block" : "/auth/admin/unblock";
    await api.post(endpoint, { admin_id: id });
    fetchAdmins();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">System Administrators</h1>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {admins.map(admin => (
              <tr key={admin.id}>
                <td className="px-6 py-4 text-white">{admin.email}</td>
                <td className="px-6 py-4">
                  <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-xs border border-indigo-500/20">
                    {admin.role_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={admin.is_active ? 'text-emerald-400' : 'text-rose-400'}>
                     {admin.is_active ? 'Active' : 'Blocked'}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {!admin.is_super && (
                    <button onClick={() => toggleStatus(admin.id, admin.is_active)}
                      className={`text-xs px-3 py-1 rounded ${admin.is_active ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {admin.is_active ? 'Block' : 'Unblock'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemAdmins;