import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserCheck, BarChart3, Shield, UserCog, ScrollText, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isSuperAdmin = user?.is_super || user?.role === 'SUPER_ADMIN';
  const permissions = user?.permissions || "";

  const menuItems = [
    { title: "Overview", path: "/", icon: <LayoutDashboard size={20} />, req: null },
    { title: "Voters", path: "/voters", icon: <Users size={20} />, req: "register_voter" },
    { title: "Candidates", path: "/candidates", icon: <UserCheck size={20} />, req: "SUPER_ADMIN" },
    { title: "Results", path: "/results", icon: <BarChart3 size={20} />, req: "view_results" },
    { title: "Staff", path: "/staff", icon: <UserCog size={20} />, req: "manage_admins" },
    { title: "System Admins", path: "/admins", icon: <Shield size={20} />, req: "SUPER_ADMIN" },
    { title: "Audit Logs", path: "/audit", icon: <ScrollText size={20} />, req: "SUPER_ADMIN" },
    { title: "Settings", path: "/settings", icon: <Settings size={20} />, req: null },
  ];

  const canAccess = (req) => {
    if (!req) return true;
    if (isSuperAdmin) return true;
    return permissions.includes(req);
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
          <Shield size={18} />
        </div>
        <span className="text-xl font-bold text-white">E-Voting</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.filter(item => canAccess(item.req)).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              location.pathname === item.path 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;