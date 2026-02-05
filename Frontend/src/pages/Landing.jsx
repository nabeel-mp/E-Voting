import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, MapPin, Search, FileText, Megaphone,
  CheckCircle2, Phone, Menu, X, ArrowUpRight,
  ShieldCheck, Users, Award, ExternalLink
} from 'lucide-react';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 selection:bg-emerald-200 overflow-x-hidden">
      
      {/* --- TOP BAR --- */}
      <div className="bg-slate-950 text-white py-2 px-4 border-b border-slate-800 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs">
          <div className="flex items-center gap-3 opacity-80">
            <span className="font-medium">Government of Kerala</span>
            <span className="h-3 w-px bg-slate-600 hidden sm:block"></span>
            <span className="hidden sm:inline">State Election Commission</span>
          </div>
          <div className="flex gap-4 font-bold uppercase tracking-wider text-[9px]">
            <span className="text-emerald-400">Public Portal</span>
            <span className="text-slate-600">|</span>
            <span className="cursor-pointer hover:text-emerald-400 transition-colors">മലയാളം</span>
          </div>
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/100px-Emblem_of_India.svg.png" 
              alt="National Emblem" 
              className="h-8 sm:h-12 w-auto"
            />
            <div className="border-l-2 border-slate-200 pl-3 sm:pl-4">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-none tracking-tighter">
                SEC<span className="text-emerald-600">KERALA</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-0.5 sm:mt-1">
                Election 2026
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 font-bold text-[13px] uppercase tracking-wide text-slate-500">
            <Link to="/" className="text-emerald-700">Home</Link>
            <a href="#about" onClick={scrollToAbout} className="hover:text-emerald-700 transition-colors">Commission</a>
            <Link to="/results" className="hover:text-emerald-700 transition-colors">Results</Link>
            <Link to="/voter/login" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300">
              Voter Portal <ArrowUpRight size={14} />
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </header>

      {/* --- MOBILE NAV OVERLAY --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
               <span className="font-black text-xl tracking-tighter">SEC KERALA</span>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
                 <X size={24} className="text-slate-600" />
               </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-8 p-6">
              {['Home', 'The Commission', 'Results'].map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                   <Link 
                    to="/" 
                    onClick={(e) => { 
                      if(item === 'The Commission') scrollToAbout(e); 
                      else setIsMenuOpen(false);
                    }}
                    className="text-3xl font-serif font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                   >
                     {item}
                   </Link>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xs"
              >
                <Link to="/voter/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-200">
                  Voter Login <ArrowUpRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NEWS TICKER (Framer Motion) --- */}
      <div className="bg-emerald-50 border-b border-emerald-100 py-2.5 overflow-hidden flex items-center relative z-30">
        <div className="absolute left-0 z-10 bg-emerald-600 text-white px-4 sm:px-6 py-1 h-full flex items-center text-[10px] font-black uppercase italic tracking-widest shadow-lg">
          Updates
        </div>
        <div className="flex overflow-hidden w-full mask-gradient-sides">
          <motion.div 
            className="flex whitespace-nowrap pl-24 sm:pl-32"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            {[...newsItems, ...newsItems].map((item, idx) => (
              <span key={idx} className="text-xs sm:text-sm font-semibold text-emerald-900 inline-flex items-center gap-3 mr-12 sm:mr-20">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[90vh] lg:min-h-[800px] flex items-center bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Kerala_Legislative_Assembly_Building.jpg/2560px-Kerala_Legislative_Assembly_Building.jpg" 
              alt="Kerala Assembly" 
              className="w-full h-full object-cover opacity-60 sm:opacity-100 scale-110 sm:scale-105"
            />
            {/* Improved Gradients for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40 sm:to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 sm:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 sm:mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Digital India Initiative</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[1.1] mb-6 sm:mb-8 tracking-tight">
                Empowering the <br className="hidden sm:block"/>
                <span className="italic font-light text-slate-400">Citizen's</span> Voice.
              </h1>
              
              <p className="text-base sm:text-lg text-slate-300 mb-8 sm:mb-10 leading-relaxed font-light max-w-xl">
                Kerala's first end-to-end digital election ecosystem. Transparent voting, real-time results, and seamless registration for a stronger democracy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                <Link to="/voter/apply" className="group w-full sm:w-auto px-8 py-4 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl sm:rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-base sm:text-lg shadow-lg shadow-emerald-500/20">
                  Register to Vote <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/results" className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl sm:rounded-2xl font-bold transition-all text-center text-base sm:text-lg">
                  View Results
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- STAGGERED ASYMMETRIC SERVICES (BENTO GRID) --- */}
        <section className="relative z-20 px-4 sm:px-6 py-16 sm:py-24 lg:-mt-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
            
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-7 bg-white p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Search size={32} className="sm:w-10 sm:h-10" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">Check Your Status</h3>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-4 sm:mb-6">Verify your inclusion in the 2026 Electoral Roll. Simply enter your EPIC number to find your booth.</p>
                <Link to="/voter/login" className="inline-flex items-center gap-2 font-black text-blue-600 text-xs sm:text-sm hover:underline tracking-wider uppercase">
                  Search Voter List <ArrowUpRight size={14}/>
                </Link>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-5 bg-slate-900 p-8 sm:p-10 rounded-[2rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <MapPin size={150} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-6">
                  <MapPin size={20} className="text-slate-950 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 leading-tight">Locate Your <br/>Polling Station</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 sm:mb-8 max-w-[80%]">Get precise directions and officer contact details for your booth.</p>
              </div>
              <Link to="/voter/login" className="relative z-10 bg-white/10 hover:bg-white/20 transition-all border border-white/10 py-3 sm:py-4 rounded-xl text-center font-bold text-sm w-full">
                Open Maps
              </Link>
            </motion.div>

            {/* Card 3 (Full Width) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-start-2 md:col-span-10 bg-emerald-600 p-8 sm:p-12 rounded-[2rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8 transform md:translate-y-8"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <FileText size={32} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2">New Voter Registration</h3>
                  <p className="text-emerald-100/90 text-sm sm:text-base max-w-md">Turned 18? Don't miss out. Apply for your voter ID online in under 5 minutes with our simplified Form 6.</p>
                </div>
              </div>
              <Link to="/voter/apply" className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-700 rounded-full font-black shadow-lg hover:scale-105 transition-all text-center shrink-0">
                Apply Now
              </Link>
            </motion.div>
          </div>
        </section>

        {/* --- ABOUT SECTION --- */}
        <section id="about" ref={aboutRef} className="py-24 sm:py-32 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image Column */}
              <div className="relative order-2 lg:order-1">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  className="aspect-[4/5] sm:aspect-square rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1589391886645-d51941baf7fb?q=80&w=2070&auto=format&fit=crop" 
                    alt="SEC Office" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </motion.div>
                
                {/* Decorative Blob */}
                <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-300/40 rounded-full blur-3xl z-0"></div>
                
                {/* Floating Stats Card */}
                <div className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl z-20 border border-slate-100 hidden sm:block">
                  <div className="flex flex-col items-center text-center">
                    <ShieldCheck size={32} className="text-emerald-600 mb-3 sm:mb-4 sm:w-10 sm:h-10" />
                    <p className="text-xl sm:text-2xl font-black text-slate-900">100%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Systems</p>
                  </div>
                </div>
              </div>

              {/* Content Column */}
              <div className="order-1 lg:order-2">
                <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">About the Commission</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">Upholding the Sanctity of <span className="italic text-slate-400 font-light">Your Vote.</span></h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 font-light">
                  The State Election Commission, Kerala, is an independent constitutional body established to ensure the conduct of free, fair, and impartial elections. We bridge the gap between technology and democracy to empower every citizen in God's Own Country.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 sm:mb-10">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 border border-slate-100"><Users size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">Public Service</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-snug mt-1">Dedicated support for over 2.6 crore registered voters.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 border border-slate-100"><Award size={20}/></div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">Transparency</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-snug mt-1">Open-access results and verifiable electoral rolls.</p>
                    </div>
                  </div>
                </div>

                <Link to="/about" className="group inline-flex items-center gap-3 sm:gap-4 text-slate-900 font-black tracking-wider text-xs sm:text-sm hover:text-emerald-600 transition-colors">
                  READ MISSION STATEMENT <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all"><ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]"/></div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- SCHEDULE --- */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start lg:items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
                Timeline 2026
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">The Democratic <br/>Roadmap</h2>
              <p className="text-slate-500 text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-10">The State Election Commission ensures every phase is conducted with absolute integrity and transparency.</p>
              
              <div className="p-6 sm:p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-4 sm:mb-6">
                   <Megaphone size={18} className="text-emerald-600"/> Important Notices
                 </h4>
                 <ul className="space-y-4">
                    <li className="flex gap-3 text-sm text-slate-600 items-start">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16}/> 
                      <span>Form 6 for new enrollment is now open.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600 items-start">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16}/> 
                      <span>Final publication of photo electoral roll on Jan 1st.</span>
                    </li>
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
        <section className="py-20 sm:py-24 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6">
              <StatItem number="14" label="Districts" />
              <StatItem number="140" label="Seats" />
              <StatItem number="2.6Cr" label="Voters" />
              <StatItem number="25K" label="Booths" />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-white text-slate-500 py-12 sm:py-16 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12">
            <div className="md:col-span-1">
              <h4 className="text-slate-900 font-black text-xl mb-4 sm:mb-6">SEC<span className="text-emerald-600">KERALA</span></h4>
              <p className="text-sm leading-relaxed mb-6">Dedicated to the fair and transparent conduct of elections in God's Own Country.</p>
              <div className="flex items-center gap-3 text-slate-900 bg-slate-50 p-3 rounded-lg w-fit">
                <Phone size={18} className="text-emerald-600"/> <span className="font-bold text-sm">0471-2307168</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-2">
                <div>
                  <h5 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-6">Quick Portal</h5>
                  <ul className="text-sm space-y-4 font-medium">
                    <li><Link to="/voter/login" className="hover:text-emerald-600 transition">Search Roll</Link></li>
                    <li><Link to="/results" className="hover:text-emerald-600 transition">Election Results</Link></li>
                    <li><a href="#" className="hover:text-emerald-600 transition">Complaint Cell</a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition">Downloads</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-6">External Sites</h5>
                  <ul className="text-sm space-y-4 font-medium">
                    <li><a href="#" className="hover:text-emerald-600 transition flex items-center gap-2">ECI Website <ExternalLink size={12}/></a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition flex items-center gap-2">CEO Kerala <ExternalLink size={12}/></a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition flex items-center gap-2">Gov of Kerala <ExternalLink size={12}/></a></li>
                  </ul>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
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
          <div className="max-w-7xl mx-auto px-6 pt-8 sm:pt-12 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest flex flex-col md:flex-row justify-between gap-4 text-center md:text-left">
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
    <div className={`group flex flex-col sm:flex-row sm:items-center p-5 sm:p-6 rounded-3xl border-2 transition-all gap-4 sm:gap-0 ${
      isActive ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-900/5' : 'bg-white border-slate-50 hover:border-slate-200'
    }`}>
      <div className="w-20 flex flex-row sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0">
        <p className={`text-xs font-black uppercase tracking-widest ${isCompleted ? 'text-slate-300' : 'text-slate-400'}`}>Feb</p>
        <p className={`text-2xl font-serif font-bold ${isCompleted ? 'text-slate-300' : 'text-slate-900'}`}>{date.split(' ')[1]}</p>
      </div>
      <div className="flex-grow sm:pl-6 sm:border-l-2 border-slate-100 group-hover:border-emerald-200 transition-colors">
        <p className={`font-bold text-sm sm:text-base ${isCompleted ? 'text-slate-300 line-through' : 'text-slate-900'}`}>{event}</p>
        {isActive && <span className="text-[9px] font-black uppercase text-red-500 animate-pulse mt-1 block">● System Live</span>}
      </div>
      <div className="shrink-0 self-end sm:self-center ml-0 sm:ml-4">
        {isCompleted && <CheckCircle2 size={24} className="text-emerald-500 opacity-30" />}
        {isActive && <div className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-emerald-600/30">ACTIVE</div>}
      </div>
    </div>
  );
};

const StatItem = ({ number, label }) => (
  <div className="flex flex-col items-center">
    <div className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-emerald-500 mb-2">{number}</div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">{label}</div>
  </div>
);

export default Landing;