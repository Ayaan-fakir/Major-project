import React from 'react';
import { APPOINTMENT_OPTIONS, DIAGNOSTIC_TESTS } from '../data/telemedicineData';
import { Check, ArrowRight, Shield, Clock, Stethoscope, Microscope } from 'lucide-react';

interface PricingSectionProps {
  onSelectOption: (optionId: string, fee?: number) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectOption }) => {
  return (
    <section id="facilities" className="py-20 sm:py-28 bg-[#F6F4EE] border-b border-black/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono tracking-wider text-[#1A1A1A] uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>
              <span>Telemedicine Facilities &amp; Modes</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0E0E10] leading-[1.05]">
              Zero-trust clinical facilities. <br />
              <span className="font-extrabold">Next-generation remote healthcare.</span>
            </h2>
          </div>

          <p className="text-[#8C8C88] text-sm sm:text-base max-w-md leading-relaxed">
            Explore the core telemedicine consultation modes and diagnostic microservices provided across our platform. Choose your preferred clinical format to request an appointment.
          </p>
        </div>

        {/* 3 Consultation Facility Tiers (Zero-Trust Clinical Modes - No Pricing!) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20 items-stretch">
          {APPOINTMENT_OPTIONS.map((opt) => {
            return (
              <div
                key={opt.id}
                className={`p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                  opt.popular
                    ? 'bg-[#0E0E10] text-white shadow-2xl border border-black transform lg:-translate-y-2'
                    : 'bg-white text-[#1A1A1A] border border-black/10 shadow-sm hover:border-black/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full ${
                        opt.popular
                          ? 'bg-[#D7FA3B] text-black font-bold'
                          : 'bg-black/5 text-[#8C8C88]'
                      }`}
                    >
                      {opt.popular ? 'Specialist Track' : 'Clinical Mode'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono">
                      <Clock className={`w-3.5 h-3.5 ${opt.popular ? 'text-[#D7FA3B]' : 'text-[#8C8C88]'}`} />
                      <span className={opt.popular ? 'text-white/80' : 'text-[#8C8C88]'}>{opt.duration}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-bold mb-2">{opt.title}</h3>
                  <p
                    className={`text-xs sm:text-sm mb-6 leading-relaxed ${
                      opt.popular ? 'text-white/70' : 'text-[#8C8C88]'
                    }`}
                  >
                    {opt.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {opt.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            opt.popular
                              ? 'bg-[#D7FA3B]/20 text-[#D7FA3B]'
                              : 'bg-black/5 text-[#1A1A1A]'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={opt.popular ? 'text-white/90' : 'text-[#1A1A1A]'}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectOption(opt.id)}
                  className={`w-full py-4 rounded-full font-bold text-xs tracking-tight transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md ${
                    opt.popular
                      ? 'bg-[#D7FA3B] hover:bg-[#cbf128] text-black'
                      : 'bg-black text-white hover:bg-black/85'
                  }`}
                >
                  <span>Select Consultation Facility</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* 12 Diagnostic Microservices & Tele-Lab Capabilities (No Pricing!) */}
        <div className="pt-12 border-t border-black/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-2">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#8C8C88] font-semibold flex items-center gap-2">
                <Microscope className="w-4 h-4 text-black" />
                <span>Diagnostic Tele-Microservices &amp; Remote Labs</span>
              </div>
              <p className="text-xs text-[#8C8C88] mt-1">
                Digital lab integration and tele-pathology review across verified healthcare partner laboratories.
              </p>
            </div>
            <span className="text-xs font-mono text-black font-semibold">
              End-to-End Encrypted Telemetry Delivery
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIAGNOSTIC_TESTS.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-2xl bg-white border border-black/10 flex flex-col justify-between hover:border-black/30 transition-all hover:-translate-y-0.5 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8C88] mb-1.5">
                    <span>{test.code}</span>
                    <span className="text-green-700 font-semibold">{test.turnaroundTime}</span>
                  </div>

                  <div className="font-display font-bold text-base text-[#0E0E10] mb-1">
                    {test.name}
                  </div>
                  <div className="text-xs text-[#8C8C88] leading-relaxed mb-4">
                    {test.description}
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#8C8C88]">
                    Sample: {test.sampleType}
                  </span>
                  <span className="text-[11px] font-mono text-black font-bold">
                    Tele-Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
