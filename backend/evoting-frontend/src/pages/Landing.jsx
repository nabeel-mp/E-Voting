import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, ShieldCheck, Globe, ChevronRight, Lock, Fingerprint, BarChart3 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Vote className="text-emerald-400" size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">E-Voting<span className="text-emerald-400">Portal</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:flex text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Admin Access
            </Link>
            <Link 
              to="/voter-login" 
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
            >
              Voter Login <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-xs font-medium text-emerald-400 mb-4 hover:border-emerald-500/30 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Secure Blockchain Voting Live
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Democracy Meets <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Digital Trust</span>
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Experience the future of voting. Secure, transparent, and immutable elections powered by Ethereum blockchain technology. Your voice, permanently recorded.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/voter-login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 hover:bg-emerald-50 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
              <Vote size={20} /> Cast Your Vote
            </Link>
            <Link to="/results" className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              <BarChart3 size={20} /> View Live Results
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32">
          <FeatureCard 
            icon={<ShieldCheck size={32} className="text-emerald-400" />}
            title="Blockchain Secured"
            desc="Every vote is cryptographically signed and stored on an immutable ledger, preventing tampering."
          />
          <FeatureCard 
            icon={<Fingerprint size={32} className="text-purple-400" />}
            title="Identity Verified"
            desc="Multi-factor authentication using Aadhaar and OTP ensures only eligible citizens can vote."
          />
          <FeatureCard 
            icon={<Globe size={32} className="text-cyan-400" />}
            title="Accessible Anywhere"
            desc="Vote securely from any location. Our platform is designed for accessibility and ease of use."
          />
        </div>

        {/* Steps Section */}
        <div className="mt-32 border-t border-slate-800 pt-20">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white">How It Works</h2>
                <p className="text-slate-400 mt-2">Three simple steps to exercise your right.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0"></div>

                <Step number="01" title="Login Securely" desc="Use your Voter ID and Aadhaar number to access the portal. Verify identity via OTP." />
                <Step number="02" title="Select Candidate" desc="Browse your local election, view candidates, and make your selection on the digital ballot." />
                <Step number="03" title="Verify & Submit" desc="Review your choice. Once submitted, receive a blockchain transaction hash as your digital receipt." />
            </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 border-t border-slate-800 py-12 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} E-Voting System. Built on Ethereum.</p>
        </footer>
      </main>
    </div>
  );
};

// Sub-components for cleaner code
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 transition-all duration-300 group">
    <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
        {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
    <div className="relative text-center px-4">
        <div className="w-24 h-24 mx-auto bg-slate-950 rounded-full border-4 border-slate-900 shadow-[0_0_0_1px_rgba(30,41,59,1)] flex items-center justify-center text-2xl font-black text-slate-700 mb-6 relative z-10">
            {number}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
    </div>
);

export default Landing;