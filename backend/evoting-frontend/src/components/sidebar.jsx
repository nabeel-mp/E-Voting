import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    BarChart3,
    Shield,
    UserCog,
    ScrollText,
    Settings,
    LogOut,
    ChevronRight,
    UserCircle2,
    Calendar
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isSuperAdmin = user?.is_super || user?.role === 'SUPER_ADMIN';
    const permissions = user?.permissions || "";

    // Menu Configuration
    const menuItems = [
        { title: "Overview", path: "/", icon: <LayoutDashboard size={20} />, req: null },
        { title: "Elections", path: "/elections", icon: <Calendar size={20} />, req: "SUPER_ADMIN" },
        { title: "Voters List", path: "/voters", icon: <Users size={20} />, req: "register_voter" },
        { title: "Verification", path: "/verification", icon: <UserCheck size={20} />, req: "SUPER_ADMIN" },
        { title: "Candidates", path: "/candidates", icon: <UserCheck size={20} />, req: "SUPER_ADMIN" },
        { title: "Live Results", path: "/results", icon: <BarChart3 size={20} />, req: "view_results" },
        { title: "Manage Roles", path: "/roles", icon: <UserCog size={20} />, req: "manage_roles" },
        { title: "Manage Staff", path: "/staff", icon: <UserCog size={20} />, req: "manage_admins" },
        { title: "Assign Roles", path: "/assign-roles", icon: <UserCog size={20} />, req: "manage_admins" },
        { title: "System Admins", path: "/admins", icon: <Shield size={20} />, req: "SUPER_ADMIN" },
        { title: "Audit Logs", path: "/audit", icon: <ScrollText size={20} />, req: "SUPER_ADMIN" },
    ];

    const bottomItems = [
        { title: "Settings", path: "/settings", icon: <Settings size={20} />, req: null },
    ];

    const canAccess = (req) => {
        if (!req) return true;
        if (isSuperAdmin) return true;
        return permissions.includes(req);
    };

    // Helper to determine if a link is active
    const isActive = (path) => location.pathname === path;

    // --- NEW: Handle Logout with Confirmation ---
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            logout();
        }
    };

    return (
        <aside className="w-72 h-screen bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl relative z-50">

            {/* 1. Header Section */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                        <div className="relative h-9 w-9 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center text-indigo-400">
                            <Shield size={20} className="transform group-hover:scale-110 transition-transform duration-200" />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg tracking-tight leading-none">
                            E-Voting
                        </h1>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
                            Admin Portal
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Navigation Section */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

                {/* Main Menu */}
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Main Menu
                    </p>
                    <nav className="space-y-1">
                        {menuItems.filter(item => canAccess(item.req)).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                        ? 'bg-indigo-600/10 text-white'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                                    }`}
                            >
                                {/* Active Indicator Line */}
                                {isActive(item.path) && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}

                                {/* Icon */}
                                <span className={`transition-colors ${isActive(item.path) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {item.icon}
                                </span>

                                <span className="font-medium text-sm tracking-wide">
                                    {item.title}
                                </span>

                                {/* Hover Arrow (Subtle) */}
                                <ChevronRight size={14} className={`ml-auto transition-all duration-200 ${isActive(item.path) ? 'opacity-100 text-indigo-500' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-50'
                                    }`} />
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* System / Bottom Menu */}
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        System
                    </p>
                    <nav className="space-y-1">
                        {bottomItems.filter(item => canAccess(item.req)).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                        ? 'bg-indigo-600/10 text-white'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                                    }`}
                            >
                                {isActive(item.path) && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}
                                <span className={`transition-colors ${isActive(item.path) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm tracking-wide">
                                    {item.title}
                                </span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* 3. Footer / User Profile Section */}
            <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                        {/* Avatar Container */}
                        <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                            {user?.avatar ? (
                                <img 
                                    /* Ensure this URL matches your backend configuration */
                                    src={`http://localhost:8080${user.avatar}`} 
                                    alt={user.name}
                                     className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback logic: hide image and show icon if load fails
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            
                            {/* Fallback Icon (shown if no avatar or on error) */}
                            <div 
                                className={`w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white ${user?.avatar ? 'hidden' : 'flex'}`}
                            >
                                <UserCircle2 size={20} />
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200 truncate max-w-[100px]">
                                {user?.name || "Admin"}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 mt-0.5 inline-block w-fit">
                                {isSuperAdmin ? 'SUPER ADMIN' : 'STAFF'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;