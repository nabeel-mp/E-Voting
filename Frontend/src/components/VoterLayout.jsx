import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Import Toast Context
import { 
  LogOut, User, Menu, X, ChevronDown, Globe, 
  Phone, Mail, MapPin, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoterLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- LOGOUT HANDLERS ---
  const initiateLogout = () => {
    setIsMenuOpen(false); // Close mobile menu if open
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    addToast("You have successfully logged out.", "success");
    setShowLogoutModal(false);
    navigate('/voter/login');
  };

  // --- DATA DISPLAY HELPERS ---
  const getVoterName = () => {
    if (!user) return 'Valued Voter';
    return user.FullName || user.full_name || user.name || 'Valued Voter';
  };
  const getVoterID = () => {
    if (!user) return 'ID: Verified';
    return user.VoterID || user.voter_id || user.voterId || 'ID: Verified';
  };

  const displayName = getVoterName();
  const displayID = getVoterID();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* Top Strip - Gov Links (Hidden on small mobile) */}
      <div className="bg-slate-900 text-slate-400 text-[10px] md:text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="font-bold text-slate-200">Government of Kerala</span>
          <span className="hidden sm:inline">State Election Commission</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="#" className="hover:text-white transition-colors hidden sm:block">Skip to Content</Link>
          <span className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
             <Globe size={10} /> English | മലയാളം
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/portal" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-slate-200 p-1 shadow-sm group-hover:shadow-md transition-all flex items-center justify-center">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                    alt="Emblem" 
                    className="h-full w-auto object-contain opacity-90"
                />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black text-slate-800 leading-none tracking-tight group-hover:text-emerald-700 transition-colors">
                SEC<span className="text-emerald-600">KERALA</span>
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Voter Services Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6 text-sm font-semibold text-slate-600">
              <Link to="/portal" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
              <Link to="/results" className="hover:text-emerald-600 transition-colors">Results</Link>
              <Link to="#" className="hover:text-emerald-600 transition-colors">Guide</Link>
            </nav>
            
            <div className="h-8 w-px bg-slate-200"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {displayID}
                  </p>
                </div>
                <div className="h-10 w-10 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 shadow-sm">
                    <User size={20} />
                </div>
                <button 
                  onClick={initiateLogout}
                  className="ml-2 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/voter/login" className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-xl z-30 fixed w-full top-[64px]" // Adjust top based on header height
          >
            <div className="p-4 space-y-4">
                {/* Mobile User Profile */}
                {user && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-emerald-600">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{displayName}</p>
                            <p className="text-xs text-slate-500 font-mono">{displayID}</p>
                        </div>
                    </div>
                )}

                <nav className="flex flex-col space-y-1">
                    <Link to="/portal" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Dashboard</Link>
                    <Link to="/results" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Election Results</Link>
                    <Link to="#" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Voter Guidelines</Link>
                </nav>

                <div className="pt-2 border-t border-slate-100">
                    <button 
                        onClick={initiateLogout} 
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-rose-600 bg-rose-50 rounded-xl font-bold hover:bg-rose-100 transition-colors"
                    >
                        <LogOut size={18}/> Sign Out
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <Outlet />
        </div>
      </main>

      {/* Official Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-white">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="India" className="h-8 grayscale invert opacity-80"/>
                <span className="font-bold tracking-tight">SEC Kerala</span>
             </div>
             <p className="text-xs leading-relaxed opacity-70">
                The Constitutional body responsible for conducting elections to the Local Self Government Institutions in Kerala.
             </p>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-emerald-500"/> Vikas Bhavan, Thiruvananthapuram</li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-emerald-500"/> helpdesk@sec.kerala.gov.in</li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-emerald-500"/> 1950 (Toll Free)</li>
            </ul>
          </div>

          {/* Links Col */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Information</h4>
            <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Model Code of Conduct</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Voter Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Election Laws</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Meta Col */}
          <div>
             <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Disclaimer</h4>
             <p className="text-[10px] leading-relaxed opacity-60">
                Contents owned and updated by State Election Commission, Kerala. Site designed and developed by NIC.
             </p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-50">
            <p>&copy; {new Date().getFullYear()} State Election Commission. All Rights Reserved.</p>
            <p>Version 2.4.0 • Server Time: {new Date().toLocaleTimeString()}</p>
        </div>
      </footer>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Sign Out?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to end your session? You will need to log in again to access the voter portal.
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={confirmLogout}
                    className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all"
                >
                    Sign Out
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VoterLayout;