import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './sidebar';

const Layout = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;