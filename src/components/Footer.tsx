import React from 'react';
import { AppView, AuthUser } from '../types';
import { Shield, Phone, Mail, MapPin, ArrowUpRight, LogIn } from 'lucide-react';

interface FooterProps {
  currentUser: AuthUser | null;
  onNavigate: (view: AppView) => void;
  onOpenBooking: () => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentUser,
  onNavigate,
  onOpenBooking,
  onOpenLogin,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0E0E10] text-white pt-20 pb-12 border-t border-white/10 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 text-xs">
          {/* Col 1: Main Pages */}
          <div className="lg:col-span-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#8C8C88] block mb-4 font-semibold">
              Main Pages
            </span>
            <ul className="space-y-2.5 text-white/80">
              <li>
                <button
                  onClick={() => scrollTo('hero')}
                  className="hover:text-[#D7FA3B] transition-colors"
                >
                  About platform
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('services')}
                  className="hover:text-[#D7FA3B] transition-colors"
                >
                  12 Healthcare Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('doctors')}
                  className="hover:text-[#D7FA3B] transition-colors"
                >
                  12 Clinical Specialists
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('pricing')}
                  className="hover:text-[#D7FA3B] transition-colors"
                >
                  Appointment Pricing (₹)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('blog')}
                  className="hover:text-[#D7FA3B] transition-colors"
                >
                  Medical Articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('contact')}
                  className="hover:text-[#D7FA3B] transition-colors"
                >
                  Contact us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Enclave Portals */}
          <div className="lg:col-span-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#8C8C88] block mb-4 font-semibold">
              Private Enclaves
            </span>
            <ul className="space-y-2.5 text-white/80">
              <li>
                <button
                  onClick={() => {
                    if (currentUser?.role === 'patient') onNavigate('patient');
                    else onOpenLogin();
                  }}
                  className="hover:text-[#D7FA3B] transition-colors flex items-center gap-1 text-[#D7FA3B] font-semibold"
                >
                  <span>Patient Portal (Paid Consults)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (currentUser?.role === 'doctor') onNavigate('doctor');
                    else onOpenLogin();
                  }}
                  className="hover:text-[#D7FA3B] transition-colors flex items-center gap-1 text-[#D7FA3B] font-semibold"
                >
                  <span>Doctor Portal (Clinicians)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLogin()}
                  className="hover:text-white transition-colors flex items-center gap-1 text-white/90"
                >
                  <span>Portal Login (OTP / PIN)</span>
                  <LogIn className="w-3 h-3 text-[#D7FA3B]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('faq')}
                  className="hover:text-[#D7FA3B] transition-colors"
                >
                  In-RAM Blackbox Security
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Follow us */}
          <div className="lg:col-span-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#8C8C88] block mb-4 font-semibold">
              Follow &amp; Network
            </span>
            <ul className="space-y-2.5 text-white/80 font-mono">
              <li>
                <a href="#footer" className="hover:text-[#D7FA3B] transition-colors">
                  LinkedIn India
                </a>
              </li>
              <li>
                <a href="#footer" className="hover:text-[#D7FA3B] transition-colors">
                  X / Twitter (@AegisHealthIN)
                </a>
              </li>
              <li>
                <a href="#footer" className="hover:text-[#D7FA3B] transition-colors">
                  GitHub Zero-Trust Core
                </a>
              </li>
              <li>
                <a href="#footer" className="hover:text-[#D7FA3B] transition-colors">
                  Medical Council Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: India Head Office & Contact */}
          <div className="lg:col-span-3 space-y-4 font-mono text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[#8C8C88] block mb-4 font-semibold">
              Clinical Operations (India)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white">
                +91 1800 202 8899
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#D7FA3B]">
                care@aegis-health.in
              </span>
            </div>
            <p className="text-[#8C8C88] text-[11px] leading-relaxed">
              12th Main Road, Indiranagar, Bengaluru, Karnataka 560038 · Enclave Cloud Hub Mumbai-Central
            </p>
          </div>
        </div>

        {/* Giant AEGIS Brand Wordmark Display */}
        <div className="py-10 border-t border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black border-2 border-[#D7FA3B] flex items-center justify-center text-[#D7FA3B] shrink-0">
              <Shield className="w-8 h-8 fill-[#D7FA3B]/20" />
            </div>
            <span className="font-display font-black text-6xl sm:text-8xl lg:text-9xl tracking-tighter text-white uppercase select-none">
              AEGIS
            </span>
          </div>

          <div className="max-w-xs text-xs text-[#8C8C88] leading-relaxed">
            <p className="mb-2">
              Zero-Trust Clinical Telemedicine. Pay per consultation in Indian Rupees (₹499 onwards) with in-RAM memory-only records.
            </p>
            <button
              onClick={onOpenBooking}
              className="text-[#D7FA3B] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Book consultation slot</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8C8C88]">
          <div>
            © 2026 Aegis Health Technologies India Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Aligned with NMC Telemedicine Guidelines</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B]"></span>
            <span>Zero-Trust Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
