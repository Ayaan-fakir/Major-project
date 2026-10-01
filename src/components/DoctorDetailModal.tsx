import React from 'react';
import { Doctor } from '../types';
import { X, Star, Phone, Mail, Award, CheckCircle2, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';

interface DoctorDetailModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookWithDoctor: (doctor: Doctor) => void;
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  doctor,
  onClose,
  onBookWithDoctor,
}) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-[#1A1A1A] rounded-3xl border border-black/10 p-6 sm:p-10 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Doctor Photo & Status */}
          <div className="md:col-span-5 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden border border-black/10 mb-4 bg-[#F6F4EE]">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-full h-80 object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border border-black/10 bg-white/95">
                {doctor.available ? (
                  <span className="flex items-center gap-1.5 text-black">
                    <span className="w-2 h-2 rounded-full bg-[#D7FA3B]"></span>
                    Available for 1-to-1
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#8C8C88]">
                    <span className="w-2 h-2 rounded-full bg-[#8C8C88]"></span>
                    Fully Booked
                  </span>
                )}
              </div>
            </div>

            {/* Quick Contact & Fee in INR ₹ */}
            <div className="p-4 rounded-xl bg-[#F6F4EE] border border-black/5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[#8C8C88]">
                <span>Consultation Fee</span>
                <span className="font-bold text-lg text-[#1A1A1A] font-display">
                  ₹{doctor.consultationFee}.00
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1A1A]">
                <Building2 className="w-3.5 h-3.5 text-[#8C8C88] shrink-0" />
                <span className="truncate">{doctor.hospital}</span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1A1A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C8C88] shrink-0" />
                <span className="font-mono text-[11px]">{doctor.regNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-[#1A1A1A]">
                <Phone className="w-3.5 h-3.5 text-[#8C8C88] shrink-0" />
                <span>{doctor.contact.phone}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Stats, Education & Training */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 text-black text-xs font-mono mb-2">
                <span>{doctor.specialty}</span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#0E0E10]">
                {doctor.name}
              </h3>
              <p className="text-xs font-medium text-[#8C8C88] mt-1">{doctor.title}</p>
            </div>

            <p className="text-sm text-[#8C8C88] leading-relaxed">
              {doctor.bio}
            </p>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#F6F4EE] border border-black/5 text-center">
                <div className="font-display font-bold text-xl sm:text-2xl text-[#0E0E10]">
                  {doctor.happyPatients}+
                </div>
                <div className="text-[10px] text-[#8C8C88] uppercase tracking-wider font-mono">
                  Happy Patients
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F4EE] border border-black/5 text-center">
                <div className="font-display font-bold text-xl sm:text-2xl text-[#0E0E10]">
                  {doctor.experienceYears} yrs
                </div>
                <div className="text-[10px] text-[#8C8C88] uppercase tracking-wider font-mono">
                  Experience
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F4EE] border border-black/5 text-center">
                <div className="font-display font-bold text-xl sm:text-2xl text-[#0E0E10]">
                  {doctor.casesSuccess}+
                </div>
                <div className="text-[10px] text-[#8C8C88] uppercase tracking-wider font-mono">
                  Cases Success
                </div>
              </div>
            </div>

            {/* Quote block */}
            {doctor.quote && (
              <div className="p-4 rounded-xl border-l-2 border-[#D7FA3B] bg-[#0E0E10] text-white text-xs italic">
                "{doctor.quote}"
              </div>
            )}

            {/* Education & Training List */}
            <div>
              <div className="font-mono text-xs text-[#8C8C88] uppercase tracking-wider mb-3 font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-black" />
                <span>Education &amp; Training</span>
              </div>
              <div className="space-y-2">
                {doctor.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F6F4EE] border border-black/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#1A1A1A]">{edu.degree}</div>
                      <div className="text-[#8C8C88]">{edu.institution}</div>
                    </div>
                    <div className="font-mono text-[11px] text-[#8C8C88] shrink-0 ml-2">
                      {edu.years}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking CTA */}
            <div className="pt-4 border-t border-black/10 flex items-center justify-between">
              <span className="text-xs text-[#8C8C88] font-mono">
                {doctor.available ? 'Direct 1-to-1 scheduling' : 'Capacity reached'}
              </span>

              <button
                onClick={() => {
                  if (doctor.available) {
                    onBookWithDoctor(doctor);
                    onClose();
                  }
                }}
                disabled={!doctor.available}
                className={`px-7 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-all shadow-md ${
                  doctor.available
                    ? 'bg-[#D7FA3B] hover:bg-[#cbf128] text-black active:scale-95'
                    : 'bg-black/10 text-[#8C8C88] cursor-not-allowed'
                }`}
              >
                <span>{doctor.available ? `Schedule Consult with ${doctor.name} →` : 'Fully Booked'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
