import React, { useState, useEffect, useRef } from 'react';
import { AppView, AuthUser } from '../types';
import { Shield, ChevronDown, Phone, UserCheck, Stethoscope, User, Menu, X, ArrowRight, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  currentUser: AuthUser | null;
  onNavigate: (view: AppView) => void;
  onOpenBooking: () => void;
  onOpenLogin: (role?: 'patient' | 'doctor') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentUser,
  onNavigate,
  onOpenBooking,
  onOpenLogin,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const utilityRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (utilityRef.current && !utilityRef.current.contains(e.target as Node)) {
        setUtilityMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 flex justify-center">
        <div
          className={`w-full max-w-[1380px] rounded-full transition-all duration-300 flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border ${
            isScrolled
              ? 'bg-[#0E0E10]/95 text-white backdrop-blur-md border-white/15 shadow-2xl'
              : 'bg-[#0E0E10] text-white border-white/10 shadow-lg'
          }`}
        >
          {/* Left Zone: Shield + Brand + Zero-Trust active badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-black border border-[#D7FA3B] flex items-center justify-center text-[#D7FA3B] group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 fill-[#D7FA3B]/20" />
              </div>
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-[#D7FA3B] transition-colors">
                Aegis
              </span>
            </button>

            {/* Zero-Trust Active Status Chip */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[#D7FA3B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B] animate-pulse-dot" />
              <span className="tracking-tight text-white/90">Zero-Trust Active</span>
            </div>
          </div>

          {/* Center Zone: Clean Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#F6F4EE]/90">
            <button
              onClick={() => scrollToSection('hero')}
              className="relative py-1 group hover:text-white transition-colors"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D7FA3B] group-hover:w-full transition-all duration-200" />
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="relative py-1 group hover:text-white transition-colors"
            >
              <span>About us</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D7FA3B] group-hover:w-full transition-all duration-200" />
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="relative py-1 group hover:text-white transition-colors"
            >
              <span>Services</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D7FA3B] group-hover:w-full transition-all duration-200" />
            </button>
            <button
              onClick={() => scrollToSection('doctors')}
              className="relative py-1 group hover:text-white transition-colors"
            >
              <span>Doctors</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D7FA3B] group-hover:w-full transition-all duration-200" />
            </button>
            <button
              onClick={() => scrollToSection('facilities')}
              className="relative py-1 group hover:text-white transition-colors"
            >
              <span>Facilities</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D7FA3B] group-hover:w-full transition-all duration-200" />
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className="relative py-1 group hover:text-white transition-colors"
            >
              <span>Articles</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D7FA3B] group-hover:w-full transition-all duration-200" />
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="relative py-1 group hover:text-white transition-colors"
            >
              <span>Contact</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D7FA3B] group-hover:w-full transition-all duration-200" />
            </button>
          </nav>

          {/* Right Zone: Secondary Menu Pill + India Phone Chip + Authentication & Booking */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* "Click here & Open menu ▾" Secondary Pill (matches video) */}
            <div className="relative hidden lg:block" ref={utilityRef}>
              <button
                onClick={() => setUtilityMenuOpen(!utilityMenuOpen)}
                className="px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-xs text-white font-medium flex items-center gap-1.5 transition-colors focus:ring-1 focus:ring-[#D7FA3B]"
              >
                <span>Click here &amp; Open menu</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${utilityMenuOpen ? 'rotate-180 text-[#D7FA3B]' : ''}`} />
              </button>

              {utilityMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-[#0E0E10] border border-white/15 p-5 shadow-2xl backdrop-blur-xl z-50 text-left animate-fade-in">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider block mb-2 font-semibold">
                        Main Pages
                      </span>
                      <ul className="space-y-2 text-white/80">
                        <li>
                          <button onClick={() => { scrollToSection('hero'); setUtilityMenuOpen(false); }} className="hover:text-[#D7FA3B]">
                            Home
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { scrollToSection('about'); setUtilityMenuOpen(false); }} className="hover:text-[#D7FA3B]">
                            About us
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { scrollToSection('services'); setUtilityMenuOpen(false); }} className="hover:text-[#D7FA3B]">
                            Services
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { scrollToSection('doctors'); setUtilityMenuOpen(false); }} className="hover:text-[#D7FA3B]">
                            Specialists
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { scrollToSection('facilities'); setUtilityMenuOpen(false); }} className="hover:text-[#D7FA3B]">
                            Consultation Facilities
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { scrollToSection('contact'); setUtilityMenuOpen(false); }} className="hover:text-[#D7FA3B]">
                            Help &amp; FAQ
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase tracking-wider block mb-2 font-semibold">
                        Private Enclaves
                      </span>
                      <ul className="space-y-2">
                        <li>
                          <button
                            onClick={() => {
                              setUtilityMenuOpen(false);
                              if (currentUser?.role === 'patient') onNavigate('patient');
                              else onOpenLogin('patient');
                            }}
                            className="text-[#D7FA3B] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Patient Portal</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setUtilityMenuOpen(false);
                              if (currentUser?.role === 'doctor') onNavigate('doctor');
                              else onOpenLogin('doctor');
                            }}
                            className="text-[#D7FA3B] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Doctor Portal</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { scrollToSection('booking'); setUtilityMenuOpen(false); }} className="text-white/80 hover:text-[#D7FA3B]">
                            Book Consultation
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { scrollToSection('faq'); setUtilityMenuOpen(false); }} className="text-white/80 hover:text-[#D7FA3B]">
                            Security Details
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* India Phone Chip */}
            <a
              href="tel:+9118002028899"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D7FA3B]/40 hover:border-[#D7FA3B] text-xs font-mono text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#D7FA3B]" />
              <span>+91 1800 202 8899</span>
            </a>

            {/* USER LOGIN / PORTAL ACCESS BUTTON */}
            {!currentUser ? (
              <button
                onClick={() => onOpenLogin('patient')}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/15"
              >
                <LogIn className="w-3.5 h-3.5 text-[#D7FA3B]" />
                <span>Log in</span>
              </button>
            ) : (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="px-3 py-1.5 sm:py-2 rounded-full bg-[#D7FA3B] text-black text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
                >
                  {currentUser.role === 'doctor' ? (
                    <Stethoscope className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span className="max-w-[80px] sm:max-w-[110px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#0E0E10] border border-white/20 p-2 shadow-2xl backdrop-blur-xl z-50 text-left">
                    <div className="px-3 py-2 border-b border-white/10 text-[10px] text-[#8C8C88] font-mono">
                      LOGGED IN AS {currentUser.role.toUpperCase()}
                    </div>
                    <div className="py-1 space-y-1">
                      <button
                        onClick={() => {
                          onNavigate(currentUser.role === 'doctor' ? 'doctor' : 'patient');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#D7FA3B]" />
                        <span>Go to {currentUser.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('landing');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/10"
                      >
                        <span>Public Website</span>
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Book Appointment CTA Pill */}
            <button
              onClick={onOpenBooking}
              className="px-3 sm:px-5 py-2 rounded-full bg-[#D7FA3B] hover:bg-[#c9ec2e] text-black font-extrabold text-xs tracking-tight transition-transform active:scale-95 shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Book</span><span className="hidden sm:inline">&nbsp;Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0E0E10]/95 backdrop-blur-xl xl:hidden flex flex-col pt-24 px-6 pb-8 overflow-y-auto">
          <div className="flex flex-col gap-3 text-lg font-medium text-white border-b border-white/10 pb-6">
            <button onClick={() => scrollToSection('hero')} className="text-left py-2 hover:text-[#D7FA3B]">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="text-left py-2 hover:text-[#D7FA3B]">
              About us
            </button>
            <button onClick={() => scrollToSection('services')} className="text-left py-2 hover:text-[#D7FA3B]">
              Clinical Services
            </button>
            <button onClick={() => scrollToSection('doctors')} className="text-left py-2 hover:text-[#D7FA3B]">
              Specialist Doctors
            </button>
            <button onClick={() => scrollToSection('facilities')} className="text-left py-2 hover:text-[#D7FA3B]">
              Consultation Facilities
            </button>
            <button onClick={() => scrollToSection('blog')} className="text-left py-2 hover:text-[#D7FA3B]">
              Clinical Articles
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-left py-2 hover:text-[#D7FA3B]">
              Contact &amp; Emergency
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {!currentUser ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin('patient');
                  }}
                  className="py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold text-center flex items-center justify-center gap-1.5 text-xs hover:bg-white/20 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#D7FA3B]" />
                  <span>Patient Login</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin('doctor');
                  }}
                  className="py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold text-center flex items-center justify-center gap-1.5 text-xs hover:bg-white/20 transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#D7FA3B]" />
                  <span>Doctor Login</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(currentUser.role === 'doctor' ? 'doctor' : 'patient');
                  }}
                  className="w-full py-3 rounded-full bg-[#D7FA3B] text-black font-extrabold text-center"
                >
                  Enter {currentUser.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 text-xs text-red-400 font-mono text-center"
                >
                  Log out of {currentUser.name}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3.5 rounded-full bg-[#D7FA3B] text-black font-extrabold text-center shadow-lg"
            >
              Book Consultation Appointment
            </button>
          </div>
        </div>
      )}
    </>
  );
};
