import React, { useState } from 'react';
import { DOCTORS, DEPARTMENTS } from '../data/telemedicineData';
import { Doctor } from '../types';
import { saveAppointment, createPatientFromBooking } from '../services/telemedicineStorage';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Shield,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

interface AppointmentBookingProps {
  initialDoctor?: Doctor | null;
  initialDepartment?: string;
  onBookingConfirmed: (details: {
    patientId: string;
    doctor: Doctor;
    date: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    password: string;
  }) => void;
  onEnterPatientPortal?: () => void;
  onEnterDoctorPortal?: () => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  initialDoctor = null,
  initialDepartment = 'Cardiology',
  onBookingConfirmed,
  onEnterPatientPortal,
  onEnterDoctorPortal,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(
    initialDoctor ? initialDoctor.specialty : initialDepartment
  );

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(
    initialDoctor || DOCTORS[0]
  );

  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedMonth] = useState<string>('October 2026');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');

  // Indian Patient details
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>(
    'Consultation regarding health symptoms and doctor diagnostic review.'
  );

  const fillSamplePatient = () => {
    setPatientName('Ayaan Khan');
    setPatientEmail('ayaan.khan@example.in');
    setPatientPhone('+91 98450 77123');
    setPatientNotes('Cardiovascular flutter review and blood pressure checkup.');
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [createdPassword, setCreatedPassword] = useState<string>('');
  const [createdPatientId, setCreatedPatientId] = useState<string>('');
  const [lastPaymentRef, setLastPaymentRef] = useState<string>('');
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  // Filter available doctors for the chosen department
  const availableDoctors = DOCTORS.filter((d) => {
    if (!d.available) return false;
    return (
      d.specialty.toLowerCase() === selectedDept.toLowerCase() ||
      d.specialties.some((s) => s.toLowerCase().includes(selectedDept.toLowerCase())) ||
      selectedDept === 'General consultation'
    );
  });

  const handleSelectDepartment = (dept: string) => {
    setSelectedDept(dept);
    const matching = DOCTORS.find(
      (d) =>
        d.available &&
        (d.specialty.toLowerCase() === dept.toLowerCase() ||
          d.specialties.some((s) => s.toLowerCase().includes(dept.toLowerCase())))
    );
    if (matching) {
      setSelectedDoctor(matching);
    }
  };

  const timeSlots = [
    '08:30 AM',
    '09:45 AM',
    '10:30 AM',
    '11:15 AM',
    '02:00 PM',
    '03:45 PM',
    '05:30 PM',
    '07:00 PM',
  ];

  const calendarDays = [
    { day: '01', num: 1 },
    { day: '02', num: 2 },
    { day: '03', num: 3 },
    { day: '04', num: 4 },
    { day: '05', num: 5 },
    { day: '06', num: 6 },
    { day: '07', num: 7 },
    { day: '08', num: 8 },
    { day: '09', num: 9 },
    { day: '10', num: 10 },
    { day: '11', num: 11 },
    { day: '12', num: 12 },
    { day: '13', num: 13 },
    { day: '14', num: 14 },
    { day: '15', num: 15 },
    { day: '16', num: 16 },
    { day: '17', num: 17 },
    { day: '18', num: 18 },
    { day: '19', num: 19 },
    { day: '20', num: 20 },
    { day: '21', num: 21 },
    { day: '22', num: 22 },
    { day: '23', num: 23 },
    { day: '24', num: 24 },
    { day: '25', num: 25 },
    { day: '26', num: 26 },
    { day: '27', num: 27 },
    { day: '28', num: 28 },
    { day: '29', num: 29 },
    { day: '30', num: 30 },
    { day: '31', num: 31 },
  ];

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingSuccess(true);

      // Create new patient or link with specified doctor
      const { patient, password } = createPatientFromBooking({
        name: patientName.trim() || 'New Patient',
        email: patientEmail.trim(),
        phone: patientPhone.trim(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        condition: patientNotes.trim() || `Consultation regarding ${selectedDept}`,
      });

      setCreatedPassword(password);
      setCreatedPatientId(patient.id);

      // Save appointment with status 'pending' (doctor has right to accept or reject!)
      const saved = saveAppointment({
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: `Thursday, Oct ${selectedDay}, 2026`,
        time: `${selectedTimeSlot} IST`,
        status: 'pending',
        notes: patientNotes,
      });

      setLastPaymentRef(saved.id);

      onBookingConfirmed({
        patientId: patient.id,
        doctor: selectedDoctor,
        date: `Thursday, Oct ${selectedDay}, 2026`,
        time: `${selectedTimeSlot} IST`,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        password,
      });
    }, 800);
  };

  return (
    <section id="booking" className="bg-[#0E0E10] text-white py-16 sm:py-24 relative overflow-hidden">
      {/* Top Banner with APPOINTMENT header & bracket motif */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="relative rounded-3xl bg-[#141416] border border-white/10 p-8 sm:p-14 overflow-hidden">
          {/* Subtle background bracket graphic (pointer-events-none to prevent click interference) */}
          <div className="absolute right-6 -bottom-6 text-white/5 font-mono text-[160px] select-none pointer-events-none">
            {'{ }'}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-xs font-mono uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D7FA3B] animate-pulse"></span>
                <span>Single Consultation Booking</span>
              </div>

              <h2 className="font-display text-4xl sm:text-7xl font-extrabold tracking-tight text-white uppercase mb-4">
                Appointment
              </h2>

              <div className="text-white/80 text-xs sm:text-sm font-mono flex items-center gap-2 max-w-xl">
                <span className="text-[#D7FA3B] text-xl font-bold">{'{'}</span>
                <span>Zero-trust clinical consults across India: Pay per session with zero subscriptions</span>
                <span className="text-[#D7FA3B] text-xl font-bold">{'}'}</span>
              </div>
            </div>

            {/* Operating Hours (India IST) */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono shrink-0">
              <div className="text-[#8C8C88] uppercase tracking-wider mb-2 font-semibold">
                Clinical Hours (IST)
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-6 text-white/90">
                  <span>Monday – Saturday</span>
                  <span className="text-[#D7FA3B]">08:00 – 21:00</span>
                </div>
                <div className="flex justify-between gap-6 text-white/90">
                  <span>Sunday (Emergency)</span>
                  <span className="text-[#D7FA3B]">09:00 – 16:00</span>
                </div>
                <div className="flex justify-between gap-6 text-[#8C8C88]">
                  <span>Emergency Triage</span>
                  <span>24/7 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Booking Workspace */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Steps 1 to 4 */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Select Department */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141416] border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D7FA3B] text-black text-xs font-mono font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>Select Department</span>
                </h3>
                <span className="text-xs font-mono text-[#8C8C88]">
                  Active: <strong className="text-[#D7FA3B]">{selectedDept}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = selectedDept === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => handleSelectDepartment(dept)}
                      className={`px-3.5 py-3 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#D7FA3B] text-black border-[#D7FA3B] shadow-sm'
                          : 'bg-black/40 hover:bg-black/70 text-white/90 border-white/10'
                      }`}
                    >
                      <span className="truncate pr-1">{dept}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Doctor */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141416] border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D7FA3B] text-black text-xs font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>Select Specialist</span>
                </h3>
                <span className="text-xs font-mono text-[#8C8C88]">
                  {availableDoctors.length} available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availableDoctors.map((doc) => {
                  const isSelected = selectedDoctor.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                        isSelected
                          ? 'bg-white/10 border-[#D7FA3B] ring-2 ring-[#D7FA3B]'
                          : 'bg-black/30 hover:bg-black/60 border-white/10'
                      }`}
                    >
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <div className="font-display text-xs font-bold text-white truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-[#8C8C88] truncate">{doc.title}</div>
                        <div className="text-[10px] font-mono text-[#D7FA3B] mt-0.5 font-bold">
                          {doc.experienceYears} yrs exp · {doc.hospital.split(',')[0]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Select Date & Time */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141416] border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D7FA3B] text-black text-xs font-mono font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>Select Date &amp; Time</span>
                </h3>
                <span className="text-xs font-mono text-[#D7FA3B]">
                  Slots for {selectedDoctor.name}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Calendar Column */}
                <div className="md:col-span-7">
                  <div className="flex items-center justify-between mb-3 text-sm font-semibold">
                    <span>{selectedMonth}</span>
                    <span className="text-xs text-[#8C8C88] font-mono">IST Enclave</span>
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                      <span key={d} className="text-[#8C8C88] text-[10px] font-mono uppercase pb-1">
                        {d}
                      </span>
                    ))}
                    {calendarDays.map((item) => {
                      const isSelected = selectedDay === item.num;
                      return (
                        <button
                          key={item.num}
                          onClick={() => setSelectedDay(item.num)}
                          className={`h-9 rounded-lg font-mono text-xs transition-colors flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#D7FA3B] text-black font-bold shadow-md'
                              : 'bg-white/5 hover:bg-white/15 text-white/90'
                          }`}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots Column */}
                <div className="md:col-span-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#8C8C88] block mb-3 font-semibold">
                      Available Time Slots
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-3 rounded-xl font-mono text-xs transition-all border ${
                              isSelected
                                ? 'bg-black text-[#D7FA3B] border-[#D7FA3B] font-bold shadow-sm'
                                : 'bg-black/30 hover:bg-black/60 text-white/80 border-white/10'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-[#8C8C88] font-mono">
                    ✦ Instant encrypted room link generated on booking
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Patient Information */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141416] border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D7FA3B] text-black text-xs font-mono font-bold flex items-center justify-center">
                    4
                  </span>
                  <span>Patient Information &amp; Zero-Trust Credentials</span>
                </h3>

                <button
                  type="button"
                  onClick={fillSamplePatient}
                  className="text-xs font-mono text-[#D7FA3B] hover:underline"
                >
                  ⚡ Fill Sample Patient
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-xs font-mono uppercase text-[#8C8C88] block mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#8C8C88] block mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="aarav@example.in"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-mono uppercase text-[#8C8C88] block mb-2">
                  Mobile Number (SMS / WhatsApp Encrypted Token) *
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-[#8C8C88] block mb-2">
                  Primary Symptoms / Health Concerns
                </label>
                <textarea
                  rows={3}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Describe symptoms, previous investigations, or current medications..."
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-[#D7FA3B] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Booking Summary */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#18181B] border border-white/15 shadow-2xl text-[#F6F4EE]">
              <div className="font-display font-bold text-lg text-white mb-5 pb-3 border-b border-white/10 flex items-center justify-between">
                <span>Appointment Summary</span>
                <span className="w-2 h-2 rounded-full bg-[#D7FA3B] animate-pulse"></span>
              </div>

              {/* Doctor Mini Profile */}
              <div className="flex items-center gap-3.5 mb-6 p-3 rounded-2xl bg-black/40 border border-white/10">
                <img
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <div className="font-bold text-white text-sm font-display truncate">
                    {selectedDoctor.name}
                  </div>
                  <div className="text-xs text-[#8C8C88] truncate">{selectedDoctor.specialty}</div>
                  <div className="text-[10px] text-[#D7FA3B] truncate font-mono">
                    {selectedDoctor.hospital.split(',')[0]}
                  </div>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="space-y-3 mb-6 text-xs">
                <div className="flex items-center gap-2.5 text-white/90">
                  <Calendar className="w-4 h-4 text-[#D7FA3B]" />
                  <span>Thursday, Oct {selectedDay}, 2026</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90">
                  <Clock className="w-4 h-4 text-[#D7FA3B]" />
                  <span>{selectedTimeSlot} IST · 30 Min Consult</span>
                </div>
              </div>

              {/* Clinical Consultation Enclave Summary (No Price / Payment!) */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs font-mono mb-6">
                <div className="flex justify-between text-[#8C8C88]">
                  <span>Consultation Format</span>
                  <span className="text-white">1-on-1 Encrypted Tele-Video</span>
                </div>
                <div className="flex justify-between text-[#8C8C88]">
                  <span>Clinical Records</span>
                  <span className="text-[#D7FA3B]">In-RAM Blackbox Encrypted</span>
                </div>
                <div className="flex justify-between text-[#8C8C88]">
                  <span>Zero-Trust Verification</span>
                  <span className="text-[#D7FA3B]">Active Posture</span>
                </div>
                <div className="flex justify-between text-[#8C8C88]">
                  <span>Doctor Triage Desk</span>
                  <span className="text-white font-semibold">Specialist Review Queue</span>
                </div>
              </div>

              {/* Confirm Booking Button */}
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || bookingSuccess}
                className="w-full py-4 rounded-full bg-[#D7FA3B] hover:bg-[#c9ec2e] text-black font-bold text-sm tracking-tight transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Clinical Request...</span>
                ) : bookingSuccess ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Request Dispatched to Doctor!</span>
                  </span>
                ) : (
                  <>
                    <span>Submit Consultation Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-[#8C8C88] text-center font-mono flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-[#D7FA3B]" />
                <span>Zero-Trust Remote Healthcare · Continuous Identity Enclave</span>
              </div>
            </div>

            {/* Instant Confirmation State */}
            {bookingSuccess && (
              <div className="mt-4 p-5 rounded-3xl bg-[#141416] border border-[#D7FA3B]/40 text-xs animate-fade-in space-y-3.5 shadow-2xl">
                <div className="font-bold text-[#D7FA3B] flex items-center justify-between font-display text-sm">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D7FA3B]" />
                    <span>Consultation Request Sent!</span>
                  </span>
                  <span className="font-mono text-[10px] text-white/60">ID #{lastPaymentRef?.slice(-6)}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 space-y-2">
                  <div className="text-white font-semibold text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#D7FA3B]" />
                    <span>Awaiting Doctor Acceptance</span>
                  </div>
                  <p className="text-[11px] text-[#8C8C88] leading-relaxed">
                    Dr. {selectedDoctor.name} will review your consultation request. Upon acceptance, your access credentials (Email and Enclave Password) will be emailed to <strong className="text-white">{patientEmail}</strong> so you can log in through the main website.
                  </p>
                </div>

                <div className="text-white/80 leading-relaxed text-xs space-y-1">
                  <div>
                    Patient Profile: <strong className="text-white">{patientName}</strong> · ID #{createdPatientId}
                  </div>
                  <div>
                    Specialist: <strong className="text-white">{selectedDoctor.name}</strong> · {selectedDoctor.specialty}
                  </div>
                  <div>
                    Date &amp; Time: <strong className="text-white">Oct {selectedDay}, 2026 · {selectedTimeSlot} IST</strong>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#D7FA3B]" />
                    <span>View Dispatched Credential Email</span>
                  </button>

                  {onEnterDoctorPortal && (
                    <button
                      onClick={onEnterDoctorPortal}
                      className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/90 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-[#D7FA3B]" />
                      <span>Review in Doctor Portal →</span>
                    </button>
                  )}

                  {onEnterPatientPortal && (
                    <button
                      onClick={onEnterPatientPortal}
                      className="w-full py-3 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <span>Proceed to Patient Portal →</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISPATCHED EMAIL PREVIEW MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#18181B] text-white rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-4 text-[#D7FA3B] font-mono text-xs">
              <Mail className="w-4 h-4" />
              <span>Simulated Secure Mail Delivery Enclave</span>
            </div>

            <div className="rounded-2xl bg-black/70 border border-white/10 p-5 space-y-4 text-xs font-mono">
              <div className="border-b border-white/10 pb-3 space-y-1">
                <div><span className="text-[#8C8C88]">From:</span> security-enclave@aegis-health.in</div>
                <div><span className="text-[#8C8C88]">To:</span> {patientEmail}</div>
                <div><span className="text-[#8C8C88]">Subject:</span> Your Aegis Telemedicine Credentials &amp; Portal Password</div>
                <div><span className="text-[#8C8C88]">Date:</span> {new Date().toLocaleString('en-IN')}</div>
              </div>

              <div className="space-y-3 font-sans text-sm text-white/90">
                <p>Namaste {patientName},</p>
                <p className="text-xs text-[#8C8C88] leading-relaxed">
                  Your appointment booking with <strong>{selectedDoctor.name}</strong> · {selectedDoctor.hospital.split(',')[0]} has been initiated. Your private patient enclave has been provisioned.
                </p>

                <div className="p-4 rounded-xl bg-white/[0.04] border border-[#D7FA3B]/40 space-y-1.5 font-mono text-xs">
                  <div className="text-[10px] text-[#8C8C88] uppercase">Official Login Credentials:</div>
                  <div><strong>Username / Identifier:</strong> {patientEmail} or {patientPhone}</div>
                  <div><strong>Patient ID:</strong> #{createdPatientId}</div>
                  <div className="text-[#D7FA3B]"><strong>Temporary Security Password:</strong> {createdPassword}</div>
                </div>

                <p className="text-xs text-[#8C8C88]">
                  Dr. {selectedDoctor.name} has been notified of your consultation request. You can now log into your patient enclave to upload previous health reports and message your doctor.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    if (onEnterPatientPortal) onEnterPatientPortal();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#D7FA3B] text-black font-bold text-xs"
                >
                  Proceed to Patient Portal →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
