import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  MapPin, 
  Search, 
  FileText, 
  Megaphone,
  CheckCircle2,
  Phone,
  Menu,
  X,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Award
} from 'lucide-react';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Ref for the About Section
  const aboutRef = useRef(null);

  const scrollToAbout = (e) => {
    e.preventDefault();
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const newsItems = [
    "General Election to Kerala Legislative Assembly 2026 announced.",
    "Final Voter List published for all 14 districts.",
    "Mobile voting app support enabled for NRI voters.",
    "Model Code of Conduct is now in force."
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 selection:bg-emerald-200">
      
      {/* --- TOP BAR --- */}
      <div className="bg-slate-900 text-white text-[10px] sm:text-xs py-2.5 px-4 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4 opacity-80">
            <span>Government of Kerala</span>
            <span className="hidden sm:inline">|</span>
            <span>State Election Commission</span>
          </div>
          <div className="hidden sm:flex gap-4 font-semibold uppercase tracking-wider text-[9px]">
            <span className="text-emerald-400">Public Portal</span>
            <span className="text-slate-500">|</span>
            <span className="cursor-pointer hover:text-white transition">മലയാളം</span>
          </div>
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/100px-Emblem_of_India.svg.png" 
              alt="National Emblem" 
              className="h-10 sm:h-12 w-auto"
            />
            <div className="border-l border-slate-200 pl-4">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tighter">
                SEC<span className="text-emerald-600">KERALA</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                Election 2026
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-10 font-bold text-[13px] uppercase tracking-wide text-slate-600">
            <Link to="/" className="text-emerald-700">Home</Link>
            <a href="#about" onClick={scrollToAbout} className="hover:text-emerald-700 transition">Commission</a>
            <Link to="/results" className="hover:text-emerald-700 transition">Live Results</Link>
            <Link to="/voter/login" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10">
              Voter Portal <ArrowUpRight size={14} />
            </Link>
          </nav>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* --- MOBILE NAV --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-[100] bg-white p-6"
          >
            <div className="flex justify-between items-center mb-12">
               <span className="font-black text-xl">SEC KERALA</span>
               <X onClick={() => setIsMenuOpen(false)} />
            </div>
            <nav className="flex flex-col gap-8 text-2xl font-serif font-bold">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <a href="#about" onClick={scrollToAbout}>The Commission</a>
              <Link to="/results" onClick={() => setIsMenuOpen(false)}>Live Results</Link>
              <Link to="/voter/login" className="text-emerald-600">Voter Portal</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NEWS TICKER --- */}
      <div className="bg-emerald-50 border-b border-emerald-100 py-3 overflow-hidden flex items-center relative z-40">
        <div className="absolute left-0 z-10 bg-emerald-600 text-white px-6 py-1 text-[10px] font-black uppercase italic tracking-widest shadow-lg transform -skew-x-12 ml-[-5px]">
          Live Updates
        </div>
        <div className="whitespace-nowrap w-full overflow-hidden">
          <div className="animate-marquee inline-block pl-40">
            {newsItems.map((item, idx) => (
              <span key={idx} className="text-sm font-semibold text-emerald-900 inline-flex items-center gap-3 mr-20">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[600px] lg:h-[750px] flex items-center bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Kerala_Legislative_Assembly_Building.jpg/2560px-Kerala_Legislative_Assembly_Building.jpg" 
              alt="Kerala Assembly" 
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Digital India Initiative</span>
              </div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold text-white leading-[1.1] mb-8 tracking-tight">
                Empowering the <br/>
                <span className="italic font-light text-slate-400">Citizen's</span> Voice.
              </h1>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed font-light max-w-xl">
                Kerala's first end-to-end digital election ecosystem. Transparent voting, real-time results, and seamless registration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/voter-login" className="group px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-lg">
                  Register to Vote <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/results" className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-bold transition-all text-center">
                  Live Results
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- STAGGERED ASYMMETRIC SERVICES --- */}
        <section className="relative z-20 px-6 py-20 lg:-mt-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-7 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shrink-0">
                <Search size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-3">Check Your Status</h3>
                <p className="text-slate-500 leading-relaxed mb-6">Verify your inclusion in the 2026 Electoral Roll. Simply enter your EPIC number or name to find your polling booth instantly.</p>
                <Link to="/voter-login" className="inline-flex items-center gap-2 font-black text-blue-600 text-sm hover:underline">
                  SEARCH VOTER LIST <ArrowUpRight size={16}/>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-5 bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <MapPin size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-6">
                  <MapPin size={24} className="text-slate-950" />
                </div>
                <h3 className="text-2xl font-bold mb-4 leading-tight">Locate Your <br/>Polling Station</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">Get precise directions and officer contact details for your booth.</p>
              </div>
              <Link to="/voter-login" className="relative z-10 bg-white/10 hover:bg-white/20 transition-all border border-white/10 py-4 rounded-xl text-center font-bold text-sm">
                Open Maps
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-start-2 md:col-span-10 bg-emerald-600 p-12 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8 transform md:translate-y-8"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText size={32} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold">New Voter Registration</h3>
                  <p className="text-emerald-100/80 max-w-md">Turned 18? Don't miss out. Apply for your voter ID online in under 5 minutes.</p>
                </div>
              </div>
              <Link to="/voter-login" className="px-8 py-4 bg-white text-emerald-700 rounded-full font-black shadow-lg hover:scale-105 transition-all shrink-0">
                Apply Now
              </Link>
            </motion.div>
          </div>
        </section>

        {/* --- ABOUT SECTION (New) --- */}
        <section id="about" ref={aboutRef} className="py-32 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1589391886645-d51941baf7fb?q=80&w=2070&auto=format&fit=crop" 
                    alt="SEC Office" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-200/50 rounded-full blur-3xl z-0"></div>
                
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white p-8 rounded-[2rem] shadow-xl z-20 hidden md:block border border-slate-100">
                  <div className="flex flex-col items-center text-center">
                    <ShieldCheck size={40} className="text-emerald-600 mb-4" />
                    <p className="text-2xl font-black text-slate-900">100%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Systems</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">About the Commission</span>
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">Upholding the Sanctity of <span className="italic text-slate-400 font-light">Your Vote.</span></h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-8 font-light">
                  The State Election Commission, Kerala, is an independent constitutional body established to ensure the conduct of free, fair, and impartial elections. We bridge the gap between technology and democracy to empower every citizen in God's Own Country.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600"><Users size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Public Service</h4>
                      <p className="text-sm text-slate-500 leading-snug">Dedicated support for over 2.6 crore registered voters.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600"><Award size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Transparency</h4>
                      <p className="text-sm text-slate-500 leading-snug">Open-access results and verifiable electoral rolls.</p>
                    </div>
                  </div>
                </div>

                <Link to="/about" className="group inline-flex items-center gap-4 text-slate-900 font-black tracking-wider text-sm">
                  READ OUR FULL MISSION <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all"><ChevronRight size={18}/></div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- SCHEDULE --- */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
                Timeline 2026
              </div>
              <h2 className="text-4xl sm:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">The Democratic <br/>Roadmap</h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">The State Election Commission ensures every phase is conducted with absolute integrity and transparency.</p>
              
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-6">
                   <Megaphone size={18} className="text-emerald-600"/> Important Notices
                 </h4>
                 <ul className="space-y-4">
                    <li className="flex gap-3 text-sm text-slate-600"><CheckCircle2 className="text-emerald-500 shrink-0" size={18}/> Form 6 for new enrollment is now open.</li>
                    <li className="flex gap-3 text-sm text-slate-600"><CheckCircle2 className="text-emerald-500 shrink-0" size={18}/> Final publication of photo electoral roll on Jan 1st.</li>
                 </ul>
              </div>
            </div>

            <div className="space-y-4">
              <ScheduleRow date="Jan 15" event="Official Notification" status="completed" />
              <ScheduleRow date="Jan 28" event="Nomination Deadline" status="completed" />
              <ScheduleRow date="Feb 10" event="Scrutiny Phase" status="active" />
              <ScheduleRow date="Feb 24" event="Main Polling Day" status="upcoming" />
              <ScheduleRow date="Feb 28" event="Result Declaration" status="upcoming" />
            </div>
          </div>
        </section>

        {/* --- NUMBERS --- */}
        <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <StatItem number="14" label="Districts" />
              <StatItem number="140" label="Seats" />
              <StatItem number="2.6Cr" label="Voters" />
              <StatItem number="25K" label="Booths" />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-white text-slate-400 py-16 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <h4 className="text-slate-900 font-black text-xl mb-6">SEC<span className="text-emerald-600">KERALA</span></h4>
              <p className="text-sm leading-relaxed mb-6">Dedicated to the fair and transparent conduct of elections in God's Own Country.</p>
              <div className="flex items-center gap-3 text-slate-900">
                <Phone size={18} /> <span className="font-bold">0471-2307168</span>
              </div>
            </div>
            <div>
              <h5 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6">Quick Portal</h5>
              <ul className="text-sm space-y-4 font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition">Search Roll</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Live Results</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Complaint Cell</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-6">External Sites</h5>
              <ul className="text-sm space-y-4 font-medium">
                <li><a href="#" className="hover:text-emerald-600 transition">ECI Website</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Chief Electoral Officer</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Kerala Gov</a></li>
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Official Authentication</p>
              <div className="flex items-center gap-4">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-10 grayscale opacity-50" alt="Emblem" />
                 <div className="text-[11px] leading-tight">
                    <p className="font-bold text-slate-900">NIC Kerala</p>
                    <p>Technopark, TVM</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest flex flex-col md:flex-row justify-between gap-4">
            <p>© {new Date().getFullYear()} State Election Commission, Kerala</p>
            <p>Designed for Digital India</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

/* --- SUB COMPONENTS --- */

const ScheduleRow = ({ date, event, status }) => {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  
  return (
    <div className={`group flex items-center p-6 rounded-3xl border-2 transition-all ${
      isActive ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-900/5' : 'bg-white border-slate-50 hover:border-slate-200'
    }`}>
      <div className="w-20">
        <p className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-slate-300' : 'text-slate-400'}`}>Feb</p>
        <p className={`text-2xl font-serif font-bold ${isCompleted ? 'text-slate-300' : 'text-slate-900'}`}>{date.split(' ')[1]}</p>
      </div>
      <div className="flex-grow pl-6 border-l-2 border-slate-100 group-hover:border-emerald-200 transition-colors">
        <p className={`font-bold ${isCompleted ? 'text-slate-300 line-through' : 'text-slate-900'}`}>{event}</p>
        {isActive && <span className="text-[9px] font-black uppercase text-red-500 animate-pulse">● System Live</span>}
      </div>
      <div className="ml-4 shrink-0">
        {isCompleted && <CheckCircle2 size={24} className="text-emerald-500 opacity-30" />}
        {isActive && <div className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-full">ACTIVE</div>}
      </div>
    </div>
  );
};

const StatItem = ({ number, label }) => (
  <div className="flex flex-col items-center">
    <div className="text-4xl sm:text-6xl font-serif font-bold text-emerald-500 mb-2">{number}</div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</div>
  </div>
);

export default Landing;