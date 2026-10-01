import React, { useState } from 'react';
import { SERVICES } from '../data/telemedicineData';
import { ServiceItem } from '../types';
import { ArrowRight, Stethoscope, Microscope, Activity, HeartPulse, Smile, Scan, ArrowUpRight } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
  onFilterDoctorSpecialty: (specialty: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Stethoscope: <Stethoscope className="w-5 h-5 text-black" />,
  Microscope: <Microscope className="w-5 h-5 text-black" />,
  Activity: <Activity className="w-5 h-5 text-black" />,
  HeartPulse: <HeartPulse className="w-5 h-5 text-black" />,
  Smile: <Smile className="w-5 h-5 text-black" />,
  Scan: <Scan className="w-5 h-5 text-black" />,
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onFilterDoctorSpecialty,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleCardClick = (service: ServiceItem) => {
    setSelectedCardId(service.id);
    onSelectService(service);
  };

  return (
    <section id="services" className="py-20 sm:py-28 bg-[#F6F4EE] border-b border-black/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono tracking-wider text-[#1A1A1A] uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>
              <span>Healthcare Services &amp; Clinical Specialties</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0E0E10] max-w-2xl leading-[1.05]">
              Every specialty combines <br />
              <span className="font-extrabold">precision telemetry &amp; care.</span>
            </h2>
          </div>

          <p className="text-[#8C8C88] text-sm sm:text-base max-w-md">
            12 specialized clinical departments across India with in-RAM Blackbox document security.
          </p>
        </div>

        {/* Services Grid (3-4 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SERVICES.map((service) => {
            const isSelected = selectedCardId === service.id;

            return (
              <div
                key={service.id}
                onClick={() => handleCardClick(service)}
                className={`group cursor-pointer rounded-3xl p-6 bg-white border transition-all duration-300 flex flex-col justify-between h-[300px] shadow-2xs relative overflow-hidden ${
                  isSelected
                    ? 'border-[#0E0E10] ring-2 ring-[#D7FA3B]'
                    : 'border-black/10 hover:border-black/40 hover:-translate-y-1'
                }`}
              >
                {/* Top Row: Icon Circle + Category Label */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#D7FA3B] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    {iconMap[service.icon] || <Stethoscope className="w-5 h-5 text-black" />}
                  </div>

                  <span className="text-[10px] font-mono text-[#8C8C88] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5">
                    {service.category}
                  </span>
                </div>

                {/* Middle: Title & Brief */}
                <div className="my-auto">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#0E0E10] mb-1.5 group-hover:text-black leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#8C8C88] leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  {service.typicalDuration && (
                    <div className="mt-2 text-xs font-mono text-[#8C8C88] font-medium">
                      Duration: {service.typicalDuration} · Clinical Tele-Triage
                    </div>
                  )}
                </div>

                {/* Bottom: Discover More link */}
                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-[#0E0E10]">
                  <span className="relative pb-0.5 group-hover:text-black">
                    Discover More
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#0E0E10] group-hover:w-full transition-all duration-200"></span>
                  </span>
                  <div className="w-7 h-7 rounded-full bg-black/5 group-hover:bg-[#D7FA3B] flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
