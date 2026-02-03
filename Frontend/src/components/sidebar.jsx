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
    const [systemLogo, setSystemLogo] = useState(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isSuperAdmin = user?.is_super || user?.role === 'SUPER_ADMIN';
    const permissions = user?.permissions || "";

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/api/admin/config');
                if (res.data.success) {
                    const nameSetting = res.data.data.find(s => s.key === 'system_name');
                    const logoSetting = res.data.data.find(s => s.key === 'system_logo');
                    
                    if (nameSetting) setSystemName(nameSetting.value);
                    if (logoSetting) setSystemLogo(logoSetting.value);
                }
            } catch (err) {
                console.error("Failed to load system config");
            }
        };
        fetchConfig();
    }, []);

    // Menu Configuration
    const menuItems = [
        { title: "Overview", path: "/admin", icon: <LayoutDashboard size={20} />, req: null },
        { title: "Elections", path: "/admin/elections", icon: <Calendar size={20} />, req: "SUPER_ADMIN" },
        { title: "Voters List", path: "/admin/voters", icon: <Users size={20} />, req: "register_voter" },
        { title: "Verification", path: "/admin/verification", icon: <UserCheck size={20} />, req: "SUPER_ADMIN" },
        { title: "Candidates", path: "/admin/candidates", icon: <Vote size={20} />, req: "SUPER_ADMIN" },
        { title: "Results", path: "/admin/results", icon: <BarChart3 size={20} />, req: "view_results" },
        { title: "Manage Roles", path: "/admin/roles", icon: <ShieldCheck size={20} />, req: "manage_roles" },
        { title: "Manage Staff", path: "/admin/staff", icon: <UserCog size={20} />, req: "manage_admins" },
        { title: "Assign Roles", path: "/admin/assign-roles", icon: <Shield size={20} />, req: "manage_admins" },
        { title: "System Admins", path: "/admin/admins", icon: <Shield size={20} />, req: "SUPER_ADMIN" },
        { title: "Audit Logs", path: "/admin/audit", icon: <ScrollText size={20} />, req: "SUPER_ADMIN" },
        { title: "Configuration", path: "/admin/configuration", icon: <Sliders size={20} />, req: "SUPER_ADMIN" },
    ];

    const bottomItems = [
        { title: "Settings", path: "/admin/settings", icon: <Settings size={20} />, req: null },
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
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-lg"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>

                {/* 1. Header Section with National Emblem */}
                <div className="h-24 flex items-center px-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4 w-full">
                        <div className="shrink-0">
                            <img 
                                src={systemLogo ? `http://localhost:8080${systemLogo}` : "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/100px-Emblem_of_India.svg.png"}
                                alt="National Emblem" 
                                className="h-10 w-auto object-contain"
                                onError={(e) => {
                                    // Fallback if custom logo fails
                                    e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/100px-Emblem_of_India.svg.png";
                                }}
                            />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="font-black text-slate-900 text-lg tracking-tight truncate leading-none">
                                SEC<span className="text-indigo-600">KERALA</span>
                            </h1>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                                Admin Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Navigation Section */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                    {/* Main Menu */}
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Main Menu
                        </p>
                        <nav className="space-y-1">
                            {menuItems.filter(item => canAccess(item.req)).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
                                        isActive(item.path)
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                                    }`}
                                >
                                    {/* Active Indicator */}
                                    {isActive(item.path) && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-indigo-600 rounded-r-full" />
                                    )}

                                    {/* Icon */}
                                    <span className={`transition-colors duration-200 ${
                                        isActive(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
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
                        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> System
                        </p>
                        <nav className="space-y-1">
                            {bottomItems.filter(item => canAccess(item.req)).map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group ${
                                        isActive(item.path)
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                                    }`}
                                >
                                    {isActive(item.path) && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-indigo-600 rounded-r-full" />
                                    )}
                                    <span className={`transition-colors ${isActive(item.path) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
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
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between group hover:border-slate-300 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {/* Avatar */}
                            <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative">
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
                                <div className={`absolute inset-0 bg-indigo-50 flex items-center justify-center text-indigo-600 ${user?.avatar ? 'hidden' : 'flex'}`}>
                                    <UserCircle2 size={24} />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-900 truncate block">
                                    {user?.name || "Administrator"}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mt-0.5 inline-block w-fit truncate max-w-[120px]">
                                    {isSuperAdmin ? 'SUPER ADMIN' : 'STAFF MEMBER'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 hover:rotate-90 transform"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;