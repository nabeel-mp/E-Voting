// nabeel-mp/e-voting/E-Voting-e827307a9ccaf9e84bf5d22239f0e8c4b0f5aa02/backend/evoting-frontend/src/pages/AuditLogs.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/api/audit/logs');
        if (res.data.success) setLogs(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">System Audit Logs</h1>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {logs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {new Date(log.Timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">{log.ActorID}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-700 px-2 py-1 rounded text-xs">{log.ActorRole}</span>
                </td>
                <td className="px-6 py-4 font-medium text-white">{log.Action}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">
                  {JSON.stringify(log.Metadata)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;