import React from 'react';
import { EMERGENCY_IMAGE } from '../data/telemedicineData';
import { Phone, Mail, ArrowRight, AlertTriangle } from 'lucide-react';

interface EmergencyBannerProps {
  onTriggerEmergency: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onTriggerEmergency }) => {
  return (
    <section className="relative bg-[#0E0E10] text-white overflow-hidden py-24 sm:py-32">
      {/* Background image with dramatic dark scrim overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={EMERGENCY_IMAGE}
          alt="Surgeon hands putting on surgical gloves"
          className="w-full h-full object-cover object-center opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E10] via-[#0E0E10]/85 to-[#0E0E10]/95" />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-mono tracking-wider text-[#D7FA3B] uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B] animate-pulse"></span>
          <span>Emergency Clinical Tele-Triage · India</span>
        </div>

        <h2 className="font-display text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight uppercase text-white mb-6">
          Need Rapid <br />
          <span className="text-[#D7FA3B]">Tele-Triage?</span>
        </h2>

        <p className="text-[#8C8C88] text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
          Immediate zero-trust clinical triage line across major Indian metros. Connect with an on-call emergency physician within 60 seconds with continuous biometric verification.
        </p>

        {/* Contact credentials in Indian format */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-mono mb-10 text-white/90">
          <a
            href="tel:+9118002028899"
            className="flex items-center gap-2 hover:text-[#D7FA3B] transition-colors"
          >
            <Phone className="w-4 h-4 text-[#D7FA3B]" />
            <span>+91 1800 202 8899 (Toll Free)</span>
          </a>
          <span className="text-white/20 hidden sm:inline">|</span>
          <a
            href="mailto:emergency@aegis-health.in"
            className="flex items-center gap-2 hover:text-[#D7FA3B] transition-colors"
          >
            <Mail className="w-4 h-4 text-[#D7FA3B]" />
            <span>emergency@aegis-health.in</span>
          </a>
        </div>

        {/* Immediate Triage Button */}
        <button
          onClick={onTriggerEmergency}
          className="px-8 py-4 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-sm tracking-tight transition-all active:scale-95 shadow-xl flex items-center gap-2"
        >
          <span>Initiate Rapid Tele-Triage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
