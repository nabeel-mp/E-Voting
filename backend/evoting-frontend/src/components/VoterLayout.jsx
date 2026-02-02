import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoterLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to logout?");

   if (isConfirmed) {
      logout();
      navigate('/voter/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Strip - Accessibility / Gov Links */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 hidden md:flex justify-between items-center">
        <div className="flex gap-4">
          <span>Government of Kerala</span>
          <span>State Election Commission</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">Skip to Main Content</a>
          <a href="#" className="hover:text-white">Screen Reader Access</a>
          <span>English | മലയാളം</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-emerald-600 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/portal" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white rounded-full border-2 border-slate-100 p-1 shadow-sm group-hover:shadow-md transition-all">
                {/* Placeholder for State Emblem */}
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                    alt="Emblem" 
                    className="w-full h-full object-contain opacity-90"
                />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-800 leading-tight">Election Commission</span>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">Kerala State</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-slate-600">
              <Link to="/portal" className="hover:text-emerald-700 transition-colors">Home</Link>
              <Link to="/results" className="hover:text-emerald-700 transition-colors">Election Results</Link>
              <a href="#" className="hover:text-emerald-700 transition-colors">Notifications</a>
              <a href="#" className="hover:text-emerald-700 transition-colors">Help</a>
            </nav>
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-slate-800">{user.name || 'Voter'}</p>
                  <p className="text-xs text-slate-500">{user.voterId || 'ID: Verified'}</p>
                </div>
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                    <User size={20} />
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/voter/login" className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
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
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-4 font-medium text-slate-700">
              <Link to="/voter-dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/results" onClick={() => setIsMenuOpen(false)}>Results</Link>
              <button onClick={handleLogout} className="text-red-600 text-left">Logout</button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
        </div>
      </main>

      {/* Official Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t-4 border-emerald-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="text-white font-bold mb-4">Contact Us</h4>
            <p>State Election Commission, Kerala</p>
            <p>Vikas Bhavan, Thiruvananthapuram</p>
            <p>Email: helpdesk@sec.kerala.gov.in</p>
            <p>Helpline: 1950 (Toll Free)</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Voter Guidelines</a></li>
              <li><a href="#" className="hover:text-emerald-400">Model Code of Conduct</a></li>
              <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
             <div className="flex items-center gap-3 mb-4 opacity-80">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="India Emblem" className="h-10 w-10 grayscale invert" />
                <p className="text-xs">Content owned and updated by <br/> State Election Commission, Kerala</p>
             </div>
             <p className="text-xs opacity-50">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VoterLayout;