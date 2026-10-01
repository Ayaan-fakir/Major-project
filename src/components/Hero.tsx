import React from 'react';
import { HERO_IMAGE } from '../data/telemedicineData';
import { ArrowRight, Star, ShieldCheck, Heart, Sparkles, Activity } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
  onOpenLogin?: (role?: 'patient' | 'doctor') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreServices, onOpenLogin }) => {
  return (
    <section id="hero" className="relative pt-28 sm:pt-36 pb-16 bg-[#F6F4EE] overflow-hidden">
      {/* Background bracket motif watermark */}
      <div className="absolute right-4 sm:right-8 top-20 select-none pointer-events-none opacity-5 text-[140px] sm:text-[200px] font-mono font-light text-black leading-none">
        {'{ }'}
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono tracking-wider text-[#1A1A1A] uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>
          <span>Zero-Trust Secured Telemedicine · India</span>
        </div>

        {/* Top Split: Massive Grotesk Headline + Clinical Hero Portrait */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (7 cols): Massive typography, intro text, CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-[78px] leading-[0.98] tracking-[-0.03em] text-[#0E0E10] font-normal mb-6">
              Ranked No.1 <br />
              <span className="font-extrabold text-[#0E0E10]">Telemedicine Enclave</span>
            </h1>

            <p className="text-[#8C8C88] text-sm sm:text-base lg:text-lg max-w-[520px] leading-relaxed mb-8">
              Continuous identity verification, in-RAM consultations, and least-privilege clinical assignment. Consult top specialists from AIIMS, CMC Vellore, and NIMHANS. Pay per appointment from ₹499 with zero subscriptions.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
              <button
                onClick={onOpenBooking}
                className="px-6 sm:px-7 py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all active:scale-95 shadow-md flex items-center gap-2 group"
              >
                <span>Book appointment (from ₹499)</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreServices}
                className="px-6 sm:px-7 py-3.5 rounded-full bg-white hover:bg-black hover:text-white text-[#1A1A1A] border border-black/10 text-xs sm:text-sm font-semibold tracking-tight transition-all active:scale-95 shadow-2xs"
              >
                Explore 12 Services
              </button>
            </div>

            {/* Portal Access Bar right on the Hero */}
            {onOpenLogin && (
              <div className="mb-8 p-3 sm:p-4 rounded-2xl bg-black/[0.04] border border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs max-w-xl">
                <div className="flex items-center gap-2 text-black font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#D7FA3B] shrink-0 border border-black/40"></span>
                  <span>Already have an account or booked?</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenLogin('patient')}
                    className="px-3.5 py-1.5 rounded-full bg-black text-[#D7FA3B] hover:bg-black/85 font-semibold text-[11px] transition-colors shadow-2xs"
                  >
                    Patient Portal →
                  </button>
                  <button
                    onClick={() => onOpenLogin('doctor')}
                    className="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-black hover:text-white border border-black/15 font-semibold text-[11px] transition-colors shadow-2xs"
                  >
                    Doctor Portal →
                  </button>
                </div>
              </div>
            )}

            {/* Feature tags row */}
            <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm font-medium text-[#1A1A1A] max-w-[260px] leading-snug">
                Quality healthcare, modern telemetry, and top Indian doctors—all in one place.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#1A1A1A]">
                <div className="px-3 py-1.5 rounded-lg bg-white border border-black/8 shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B]"></span>
                  <span>AIIMS &amp; CMC Panel</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white border border-black/8 shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B]"></span>
                  <span>Zero-Trust Architecture</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white border border-black/8 shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B]"></span>
                  <span>In-RAM Blackbox</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white border border-black/8 shadow-2xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B]"></span>
                  <span>24/7 Rapid Triage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Rounded Hero Image with non-overlapping badges */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-black/10 bg-white">
              <img
                src={HERO_IMAGE}
                alt="Senior clinical doctor consulting in modern medical clinic"
                className="w-full h-[360px] sm:h-[460px] object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Floating Stat Badge 1 - Top Left */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur border border-black/10 shadow-lg flex items-center gap-2 max-w-[190px]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-[#D7FA3B] flex items-center justify-center text-black shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] sm:text-xs font-bold text-black truncate">AES-256 Encrypted</div>
                  <div className="text-[9px] sm:text-[10px] text-[#8C8C88] font-mono truncate">Zero-Trust RAM Enclave</div>
                </div>
              </div>

              {/* Floating Stat Badge 2 - Bottom Right */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/95 backdrop-blur border border-black/10 shadow-xl flex items-center gap-2 max-w-[190px]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black flex items-center justify-center text-[#D7FA3B] shrink-0">
                  <Activity className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] sm:text-xs font-bold font-display text-black truncate">Continuous Biometrics</div>
                  <div className="text-[9px] sm:text-[10px] text-[#8C8C88] font-mono truncate">Real-Time Posture Sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Stats Grid */}
        <div className="mt-14 pt-12 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: 9/10 */}
          <div className="p-6 rounded-2xl bg-[#0E0E10] text-white border border-black flex flex-col justify-between min-h-[150px] shadow-sm">
            <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
              9/10
            </span>
            <div>
              <p className="text-xs text-[#8C8C88]">Overall satisfaction score</p>
              <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#D7FA3B] h-full w-[90%]"></div>
              </div>
            </div>
          </div>

          {/* Card 2: 96% */}
          <div className="p-6 rounded-2xl bg-white text-[#1A1A1A] border border-black/10 flex flex-col justify-between min-h-[150px] shadow-sm">
            <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              96%
            </span>
            <div>
              <p className="text-xs text-[#8C8C88]">Clinical resolution on first consult</p>
              <div className="w-full bg-black/5 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-black h-full w-[96%]"></div>
              </div>
            </div>
          </div>

          {/* Card 3: 10K+ Happy patient (Highlighted Solid Lime Card) */}
          <div className="p-6 rounded-2xl bg-[#D7FA3B] text-black border border-black/10 flex flex-col justify-between min-h-[150px] shadow-md transform hover:-translate-y-1 transition-transform">
            <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-black">
              25K+
            </span>
            <div>
              <p className="text-xs font-semibold text-black/80">Patients across India</p>
              <p className="text-[11px] text-black/60 font-mono mt-0.5">100% verified care reviews</p>
            </div>
          </div>

          {/* Card 4: 15K+ Patients recovered & Trust Avatar Stack */}
          <div className="p-6 rounded-2xl bg-white text-[#1A1A1A] border border-black/10 flex flex-col justify-between min-h-[150px] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                12
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/5 text-xs font-mono font-bold">
                Specialties
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1 text-[#D7FA3B] mb-1">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <Star className="w-3.5 h-3.5 fill-black text-black" />
              </div>
              <p className="text-xs text-[#8C8C88]">AIIMS, CMC &amp; NIMHANS Specialists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal marquee ticker of specialties */}
      <div className="mt-14 py-3.5 bg-[#0E0E10] text-white border-y border-white/10 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-white/90">
          <span>Cardiology (AIIMS)</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Dermatology</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Orthopedics</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Neurology (NIMHANS)</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>General Medicine (CMC)</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Pediatrics</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Oncology (Tata Memorial)</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Gynecology</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Pulmonology</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Gastroenterology</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Nephrology</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Pay per Consult (From ₹499)</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Cardiology (AIIMS)</span>
          <span className="text-[#D7FA3B]">✦</span>
          <span>Dermatology</span>
          <span className="text-[#D7FA3B]">✦</span>
        </div>
      </div>
    </section>
  );
};
