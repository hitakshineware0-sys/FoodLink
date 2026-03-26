import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { Auth } from './components/Auth';
import { DonateForm } from './components/DonateForm';
import { NearbyListings } from './components/NearbyListings';
import { ImpactDashboard } from './components/ImpactDashboard';
import { VolunteerTasks } from './components/VolunteerTasks';
import { ReportIssueForm } from './components/ReportIssueForm';
import { FullImpactReport } from './components/FullImpactReport';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  PlusCircle, 
  Map, 
  BarChart3, 
  Truck, 
  Leaf,
  Menu,
  X,
  Star,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  Globe,
  AlertCircle,
  Flag
} from 'lucide-react';

type Page = 'landing' | 'login' | 'dashboard' | 'donate' | 'receive' | 'volunteer' | 'impact' | 'full_report';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [reportingItem, setReportingItem] = useState<{ id: string, type: 'donation' | 'user' | 'task' } | null>(null);
  const [generalReportSuccess, setGeneralReportSuccess] = useState(false);

  // Sync page with auth state
  useEffect(() => {
    if (user && currentPage === 'landing') {
      setCurrentPage('dashboard');
    } else if (!user && currentPage !== 'landing' && currentPage !== 'login') {
      setCurrentPage('landing');
    }
  }, [user, currentPage]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['donor', 'receiver', 'volunteer', 'ngo'] },
    { id: 'donate', label: 'Donate', icon: PlusCircle, roles: ['donor', 'ngo'] },
    { id: 'receive', label: 'Nearby Food', icon: Map, roles: ['receiver', 'ngo', 'volunteer'] },
    { id: 'volunteer', label: 'Volunteer', icon: Truck, roles: ['volunteer'] },
    { id: 'impact', label: 'Impact', icon: BarChart3, roles: ['donor', 'receiver', 'volunteer', 'ngo'] },
  ];

  const filteredNavItems = user 
    ? navItems.filter(item => item.roles.includes(user.role))
    : [];

  const handleDonationSuccess = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background relative">
      <AnimatePresence>
        {reportingItem && user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <ReportIssueForm 
              user={user}
              relatedId={reportingItem.id}
              relatedType={reportingItem.type}
              onClose={() => setReportingItem(null)}
              onSuccess={() => {
                setReportingItem(null);
                setGeneralReportSuccess(true);
                setTimeout(() => setGeneralReportSuccess(false), 5000);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {generalReportSuccess && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={24} />
            Issue Reported Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => setCurrentPage(user ? 'dashboard' : 'landing')}
            >
              <div className="bg-primary p-2 rounded-lg text-white group-hover:rotate-12 transition-transform">
                <Leaf size={24} />
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">Food<span className="text-primary">Link</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {user && filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-xl transition-all ${
                    currentPage === item.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <div className="h-6 w-px bg-gray-100 mx-2" />
              <Auth onUserLoaded={setUser} />
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <Auth onUserLoaded={setUser} />
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 p-2 hover:bg-gray-100 rounded-lg">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {user ? filteredNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id as Page);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold ${
                      currentPage === item.id ? 'bg-primary/10 text-primary' : 'text-gray-500'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                )) : (
                  <button
                    onClick={() => {
                      setCurrentPage('landing');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-gray-500"
                  >
                    <Leaf size={20} /> Home
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <ShieldCheck size={24} />
            Donation Posted Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentPage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 text-center lg:text-left">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider"
                  >
                    <Star size={16} fill="currentColor" />
                    Trusted by 10,000+ Donors
                  </motion.div>
                  <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                    Smart Food <span className="text-primary">Sharing</span> for a Better World.
                  </h1>
                  <p className="text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    FoodLink connects people with surplus food to those who need it most. Using AI and smart location matching to eliminate waste.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button 
                      onClick={() => setCurrentPage('login')}
                      className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-primary-dark hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                      Join the Mission <ArrowRight size={24} />
                    </button>
                    <a 
                      href="#how-it-works"
                      className="bg-white text-gray-700 border-2 border-gray-100 px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all flex items-center justify-center"
                    >
                      How it Works
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1488459711635-de86fc2c96fc?auto=format&fit=crop&q=80&w=1000" 
                      alt="Fresh Food"
                      className="w-full h-[500px] object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <div className="absolute -bottom-10 -left-10 bg-secondary p-8 rounded-3xl shadow-xl z-20 text-white hidden md:block">
                    <p className="text-4xl font-black">1.2M+</p>
                    <p className="font-bold opacity-80 uppercase text-xs tracking-widest">Meals Saved</p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { title: 'Smart Matching', desc: 'Connect with donors within 2-5km of your location instantly.', icon: Map, color: 'bg-blue-50 text-blue-500' },
                  { title: 'AI Safety Tips', desc: 'Get real-time storage and reheating advice for every food type.', icon: ShieldCheck, color: 'bg-green-50 text-green-500' },
                  { title: 'Impact Tracking', desc: 'See exactly how many meals you have saved and people you have fed.', icon: BarChart3, color: 'bg-orange-50 text-orange-500' },
                ].map((f, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <f.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* How it Works Section */}
              <section id="how-it-works" className="mt-32 py-16">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-gray-900 mb-4">How it Works</h2>
                  <p className="text-gray-500 max-w-2xl mx-auto">Simple steps to make a big difference in your community.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { step: '01', title: 'Sign Up', desc: 'Create your profile as a Donor, Receiver, or Volunteer.', icon: Users },
                    { step: '02', title: 'Post or Find', desc: 'Donors post surplus food; Receivers browse nearby listings.', icon: PlusCircle },
                    { step: '03', title: 'Coordinate', desc: 'Smart matching connects you instantly with the right person.', icon: Map },
                    { step: '04', title: 'Deliver & Save', desc: 'Volunteers help deliver food, reducing waste and hunger.', icon: Truck },
                  ].map((s, i) => (
                    <div key={i} className="relative group">
                      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all h-full">
                        <span className="text-4xl font-black text-gray-200 group-hover:text-primary/20 transition-colors mb-4 block">{s.step}</span>
                        <s.icon className="text-primary mb-4" size={32} />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{s.title}</h3>
                        <p className="text-gray-500 text-sm">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {currentPage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto px-4 py-20"
            >
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-8">
                  <Users size={40} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Welcome to FoodLink</h2>
                <p className="text-gray-500 mb-10">Sign in to start sharing and receiving food in your community.</p>
                <Auth onUserLoaded={setUser} />
                <p className="mt-8 text-xs text-gray-400">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
                <button 
                  onClick={() => setCurrentPage('landing')}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}

          {user && (
            <motion.div
              key="app-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              {currentPage === 'dashboard' && (
                <div className="space-y-10">
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-4xl font-black text-gray-900">Dashboard</h1>
                      <p className="text-gray-500 mt-1">Hello, <span className="text-primary font-bold">{user.name}</span>! Ready to make an impact today?</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 text-secondary">
                        <Star size={24} fill="currentColor" />
                        <span className="font-black text-2xl">{user.rating.toFixed(1)}</span>
                      </div>
                      <div className="w-px h-10 bg-gray-100" />
                      <div className="flex items-center gap-3 text-primary">
                        <Heart size={24} fill="currentColor" />
                        <div>
                          <p className="font-black text-2xl leading-none">{user.totalImpact}</p>
                          <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Meals Saved</p>
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button 
                      onClick={() => setCurrentPage('donate')}
                      className="group bg-primary p-8 rounded-[2rem] text-white text-left shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <PlusCircle size={48} className="mb-6 group-hover:rotate-90 transition-transform" />
                      <h3 className="text-2xl font-bold mb-2">Donate Food</h3>
                      <p className="text-sm opacity-80">Share your leftovers with someone nearby.</p>
                    </button>
                    <button 
                      onClick={() => setCurrentPage('receive')}
                      className="group bg-secondary p-8 rounded-[2rem] text-white text-left shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <Map size={48} className="mb-6 group-hover:scale-110 transition-transform" />
                      <h3 className="text-2xl font-bold mb-2">Find Food</h3>
                      <p className="text-sm opacity-80">Browse available donations in your area.</p>
                    </button>
                    <button 
                      onClick={() => setCurrentPage('volunteer')}
                      className="group bg-blue-500 p-8 rounded-[2rem] text-white text-left shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <Truck size={48} className="mb-6 group-hover:translate-x-2 transition-transform" />
                      <h3 className="text-2xl font-bold mb-2">Volunteer</h3>
                      <p className="text-sm opacity-80">Help deliver food to those who need it.</p>
                    </button>
                    <button 
                      onClick={() => setCurrentPage('impact')}
                      className="group bg-white p-8 rounded-[2rem] border border-gray-100 text-left shadow-lg hover:scale-[1.02] transition-all"
                    >
                      <BarChart3 size={48} className="text-primary mb-6 group-hover:-translate-y-1 transition-transform" />
                      <h3 className="text-2xl font-bold mb-2 text-gray-800">Your Impact</h3>
                      <p className="text-sm text-gray-500">Track your contribution to the community.</p>
                    </button>
                  </div>
                  
                  <section className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Recent Community Impact</h2>
                      <button onClick={() => setCurrentPage('full_report')} className="text-primary font-bold text-sm hover:underline">View Full Report</button>
                    </div>
                    <ImpactDashboard onViewFullReport={() => setCurrentPage('full_report')} />
                  </section>
                </div>
              )}

              {currentPage === 'donate' && (
                <div className="max-w-3xl mx-auto py-6">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="mb-8 text-gray-400 hover:text-primary font-bold flex items-center gap-2 transition-all"
                  >
                    <ArrowRight className="rotate-180" size={20} /> Back to Dashboard
                  </button>
                  <DonateForm user={user} onSuccess={handleDonationSuccess} />
                </div>
              )}

              {currentPage === 'receive' && (
                <div className="py-6">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="mb-8 text-gray-400 hover:text-primary font-bold flex items-center gap-2 transition-all"
                  >
                    <ArrowRight className="rotate-180" size={20} /> Back to Dashboard
                  </button>
                  <NearbyListings user={user} />
                </div>
              )}

              {currentPage === 'volunteer' && (
                <div className="py-6">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="mb-8 text-gray-400 hover:text-primary font-bold flex items-center gap-2 transition-all"
                  >
                    <ArrowRight className="rotate-180" size={20} /> Back to Dashboard
                  </button>
                  <VolunteerTasks user={user} />
                </div>
              )}

              {currentPage === 'impact' && (
                <div className="py-6">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="mb-8 text-gray-400 hover:text-primary font-bold flex items-center gap-2 transition-all"
                  >
                    <ArrowRight className="rotate-180" size={20} /> Back to Dashboard
                  </button>
                  <ImpactDashboard onViewFullReport={() => setCurrentPage('full_report')} />
                </div>
              )}

              {currentPage === 'full_report' && (
                <div className="py-6">
                  <FullImpactReport onBack={() => setCurrentPage('impact')} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-lg text-white">
                  <Leaf size={24} />
                </div>
                <span className="text-2xl font-black text-gray-800 tracking-tight">FoodLink</span>
              </div>
              <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
                We're on a mission to end food waste and hunger through smart technology and community action.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer"><Globe size={20} /></div>
                <div className="w-10 h-10 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer"><Heart size={20} /></div>
                <div className="w-10 h-10 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer"><Users size={20} /></div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-gray-500 font-bold">
                <li><button onClick={() => setCurrentPage('dashboard')} className="hover:text-primary transition-colors">Dashboard</button></li>
                <li><button onClick={() => setCurrentPage('donate')} className="hover:text-primary transition-colors">Donate Food</button></li>
                <li><button onClick={() => setCurrentPage('receive')} className="hover:text-primary transition-colors">Find Food</button></li>
                <li><button onClick={() => setCurrentPage('volunteer')} className="hover:text-primary transition-colors">Volunteer</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-gray-900 mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-gray-500 font-bold">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li>
                  <button 
                    onClick={() => {
                      if (user) {
                        setReportingItem({ id: 'app_general', type: 'task' }); // Using task as a placeholder for general app issues
                      } else {
                        setCurrentPage('login');
                      }
                    }} 
                    className="hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Flag size={14} /> Report an Issue
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm font-medium">
            <p>© 2026 FoodLink – Smart Leftover Food Sharing App. All rights reserved.</p>
            <div className="flex gap-8">
              <span>Made with ❤️ for the Planet</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
