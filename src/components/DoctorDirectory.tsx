import React, { useState } from 'react';
import { DOCTORS } from '../data/telemedicineData';
import { Doctor } from '../types';
import { Plus, Star, Send, ShieldCheck } from 'lucide-react';

interface DoctorDirectoryProps {
  onSelectDoctor: (doctor: Doctor) => void;
  selectedSpecialtyFilter?: string;
  onBookDirect: (doctor: Doctor) => void;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  onSelectDoctor,
  selectedSpecialtyFilter = 'All',
  onBookDirect,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(selectedSpecialtyFilter);

  const filterOptions = [
    'All',
    'Cardiology',
    'General consultation',
    'Neurology',
    'Orthopedics',
    'Dermatology',
    'Oncology',
    'Gynecology',
    'Pediatrics',
    'Pulmonology',
    'Gastroenterology',
    'Nephrology',
  ];

  const filteredDoctors = activeFilter === 'All'
    ? DOCTORS
    : DOCTORS.filter((d) =>
        d.specialty.toLowerCase().includes(activeFilter.toLowerCase()) ||
        d.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
        d.specialties.some((s) => s.toLowerCase().includes(activeFilter.toLowerCase()))
      );

  return (
    <section id="doctors" className="py-20 sm:py-28 bg-[#F6F4EE] border-b border-black/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono tracking-wider text-[#1A1A1A] uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>
              <span>Meet Our Care Specialists</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0E0E10] leading-[1.05]">
              Meet our panel of <br />
              <span className="font-extrabold">12 clinical specialists.</span>
            </h2>
          </div>

          <p className="text-[#8C8C88] text-sm sm:text-base max-w-md">
            Verified specialist clinicians from premier medical institutions across India: AIIMS, CMC Vellore, NIMHANS, and Tata Memorial.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-[#0E0E10] text-[#D7FA3B] shadow-sm'
                  : 'bg-white text-[#1A1A1A] hover:bg-black/5 border border-black/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid of Doctor Cards (3-4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => {
            return (
              <div
                key={doctor.id}
                onClick={() => onSelectDoctor(doctor)}
                className="group cursor-pointer rounded-3xl bg-white border border-black/10 hover:border-black/30 p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Image Frame with Expand (+) Badge */}
                <div className="relative rounded-2xl overflow-hidden mb-4 bg-[#F6F4EE] aspect-square">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Status Pill Top-Left */}
                  <div className="absolute top-3 left-3">
                    {doctor.available ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D7FA3B] text-black font-bold text-[10px] uppercase font-mono shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0E0E10] text-white/80 font-medium text-[10px] uppercase font-mono shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C8C88]"></span>
                        Fully Booked
                      </span>
                    )}
                  </div>

                  {/* Hover "+" expand button in top-right corner */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 group-hover:bg-[#D7FA3B] text-white group-hover:text-black flex items-center justify-center transition-all shadow-md group-hover:scale-110">
                    <Plus className="w-4 h-4" />
                  </div>

                  {/* Bottom overlay with quick details on hover */}
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/85 backdrop-blur-md text-white flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="overflow-hidden pr-2">
                      <div className="text-xs font-bold font-display truncate">{doctor.name}</div>
                      <div className="text-[10px] text-[#8C8C88] truncate">{doctor.specialty}</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#D7FA3B] text-black flex items-center justify-center shrink-0">
                      <Send className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-base sm:text-lg font-bold text-[#0E0E10] group-hover:text-black leading-tight">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[#8C8C88] shrink-0">
                        <Star className="w-3 h-3 fill-black text-black" />
                        <span>{doctor.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#8C8C88] mb-1 line-clamp-1">{doctor.title}</p>
                    <p className="text-[10px] font-mono text-black/60 truncate mb-3">
                      {doctor.hospital.split(',')[0]}
                    </p>
                  </div>

                  {/* Quick Card Footer */}
                  <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                    <span className="font-mono text-xs text-[#8C8C88]">
                      {doctor.experienceYears} yrs clinical exp.
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (doctor.available) {
                          onBookDirect(doctor);
                        } else {
                          onSelectDoctor(doctor);
                        }
                      }}
                      disabled={!doctor.available}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        doctor.available
                          ? 'bg-black text-[#D7FA3B] hover:bg-[#D7FA3B] hover:text-black shadow-2xs'
                          : 'bg-black/5 text-[#8C8C88] cursor-not-allowed'
                      }`}
                    >
                      {doctor.available ? 'Request Consult →' : 'Waitlist'}
                    </button>
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
