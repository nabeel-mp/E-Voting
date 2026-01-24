import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
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
    Calendar,
    Sliders,
    Vote,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [systemName, setSystemName] = useState("E-Voting");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isSuperAdmin = user?.is_super || user?.role === 'SUPER_ADMIN';
    const permissions = user?.permissions || "";

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/api/admin/config');
                if (res.data.success) {
                    const nameSetting = res.data.data.find(s => s.key === 'system_name');
                    if (nameSetting) setSystemName(nameSetting.value);
                }
            } catch (err) {
                console.error("Failed to load system name");
            }
        };
        fetchConfig();
    }, []);

    // Menu Configuration
    const menuItems = [
        { title: "Overview", path: "/", icon: <LayoutDashboard size={20} />, req: null },
        { title: "Elections", path: "/elections", icon: <Calendar size={20} />, req: "SUPER_ADMIN" },
        { title: "Voters List", path: "/voters", icon: <Users size={20} />, req: "register_voter" },
        { title: "Verification", path: "/verification", icon: <UserCheck size={20} />, req: "SUPER_ADMIN" },
        { title: "Candidates", path: "/candidates", icon: <Vote size={20} />, req: "SUPER_ADMIN" },
        { title: "Results", path: "/results", icon: <BarChart3 size={20} />, req: "view_results" },
        { title: "Manage Roles", path: "/roles", icon: <ShieldCheck size={20} />, req: "manage_roles" },
        { title: "Manage Staff", path: "/staff", icon: <UserCog size={20} />, req: "manage_admins" },
        { title: "Assign Roles", path: "/assign-roles", icon: <Shield size={20} />, req: "manage_admins" },
        { title: "System Admins", path: "/admins", icon: <Shield size={20} />, req: "SUPER_ADMIN" },
        { title: "Audit Logs", path: "/audit", icon: <ScrollText size={20} />, req: "SUPER_ADMIN" },
        { title: "Configuration", path: "/configuration", icon: <Sliders size={20} />, req: "SUPER_ADMIN" },
    ];

    const bottomItems = [
        { title: "Settings", path: "/settings", icon: <Settings size={20} />, req: null },
    ];

    const canAccess = (req) => {
        if (!req) return true;
        if (isSuperAdmin) return true;
        return permissions.includes(req);
    };

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            logout();
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-900 border border-slate-800 rounded-lg text-white shadow-lg"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>

                {/* 1. Header Section */}
                <div className="h-24 flex items-center px-6 border-b border-slate-800/60 bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="flex items-center gap-4 w-full">
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative h-10 w-10 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center text-indigo-400 shadow-inner">
                                <Shield size={22} className="transform group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="font-bold text-white text-lg tracking-tight truncate leading-tight">
                                {systemName}
                            </h1>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                                Admin Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Section */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

                    {/* Main Menu */}
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Main Menu
                        </p>
                        <nav className="space-y-1">
                            {menuItems.filter(item => canAccess(item.req)).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
                                        isActive(item.path)
                                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white shadow-inner border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                                    }`}
                                >
                                    {/* Active Indicator */}
                                    {isActive(item.path) && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse" />
                                    )}

                                    {/* Icon */}
                                    <span className={`transition-colors duration-200 ${
                                        isActive(item.path) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'
                                    }`}>
                                        {item.icon}
                                    </span>

                                    <span className="font-medium text-sm tracking-wide z-10">
                                        {item.title}
                                    </span>

                                    {/* Hover Arrow */}
                                    <ChevronRight size={14} className={`ml-auto transition-all duration-300 ${
                                        isActive(item.path) 
                                        ? 'opacity-100 text-indigo-500 translate-x-0' 
                                        : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-50'
                                    }`} />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* System Menu */}
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> System
                        </p>
                        <nav className="space-y-1">
                            {bottomItems.filter(item => canAccess(item.req)).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group ${
                                        isActive(item.path)
                                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white shadow-inner border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                                    }`}
                                >
                                    {isActive(item.path) && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                                    )}
                                    <span className={`transition-colors ${isActive(item.path) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`}>
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

                {/* 3. User Profile Footer */}
                <div className="p-4 border-t border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex items-center justify-between group hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300 shadow-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {/* Avatar */}
                            <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shadow-inner overflow-hidden shrink-0 relative">
                                {user?.avatar ? (
                                    <img
                                        src={`http://localhost:8080${user.avatar}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white ${user?.avatar ? 'hidden' : 'flex'}`}>
                                    <UserCircle2 size={24} />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-200 truncate block">
                                    {user?.name || "Administrator"}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 mt-0.5 inline-block w-fit truncate max-w-[120px]">
                                    {isSuperAdmin ? 'SUPER ADMIN' : 'STAFF MEMBER'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 hover:rotate-90 transform"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;