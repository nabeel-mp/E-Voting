import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './sidebar';

const Layout = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle top gradient for depth in light mode */}
        <div className="sticky top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none z-10"></div>
        
        <div className="relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;