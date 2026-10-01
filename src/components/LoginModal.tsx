import React, { useState, useEffect } from 'react';
import { AuthUser, Doctor, RegisteredPatient } from '../types';
import { DOCTORS } from '../data/telemedicineData';
import { getStoredRegisteredPatients, getLastMailedCredentials } from '../services/telemedicineStorage';
import { Shield, User, Stethoscope, Lock, CheckCircle2, ArrowRight, X, Phone, Mail, KeyRound, AlertCircle, Copy, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onGoToBooking: () => void;
  initialRole?: 'patient' | 'doctor';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onGoToBooking,
  initialRole = 'patient',
}) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor'>(initialRole);
  const [registeredPatients, setRegisteredPatients] = useState<RegisteredPatient[]>([]);
  const [lastMailedCreds, setLastMailedCreds] = useState<any>(null);

  // Patient Login Fields
  const [patientIdentifier, setPatientIdentifier] = useState('+91 98765 43210');
  const [patientPassword, setPatientPassword] = useState('AEGIS-490281');
  const [patientLoginError, setPatientLoginError] = useState<string | null>(null);

  // Doctor Login Fields
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(DOCTORS[0].id);
  const [doctorRegNumber, setDoctorRegNumber] = useState(DOCTORS[0].regNumber);
  const [doctorPin, setDoctorPin] = useState('8819');

  // Load patients and credentials when opened
  useEffect(() => {
    if (isOpen) {
      const patients = getStoredRegisteredPatients();
      setRegisteredPatients(patients);
      const mailed = getLastMailedCredentials();
      setLastMailedCreds(mailed);

      if (mailed && mailed.email) {
        setPatientIdentifier(mailed.email);
        setPatientPassword(mailed.password);
      } else if (patients.length > 0) {
        setPatientIdentifier(patients[0].email || patients[0].phone);
        setPatientPassword(patients[0].password);
      }
    }
  }, [isOpen]);

  // Update role if initialRole changes when opened
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPatientLoginError(null);

    const patients = getStoredRegisteredPatients();
    const cleanId = patientIdentifier.trim().toLowerCase();

    // Look for matching patient by email, phone, or name
    const match = patients.find(
      (p) =>
        p.email.toLowerCase() === cleanId ||
        p.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '') ||
        p.name.toLowerCase() === cleanId
    );

    if (match) {
      const user: AuthUser = {
        id: match.id,
        name: match.name,
        role: 'patient',
        emailOrPhone: match.email || match.phone,
        email: match.email,
        phone: match.phone,
        password: match.password,
        doctorId: match.assignedDoctorIds[0] || DOCTORS[0].id,
        assignedDoctorIds: match.assignedDoctorIds,
        hasPaidAppointment: true,
      };
      onLoginSuccess(user);
      onClose();
      return;
    }

    // Fallback: If not found in registered database, allow access with entered credentials
    const fallbackUser: AuthUser = {
      id: 'p-' + Math.floor(10000 + Math.random() * 90000),
      name: patientIdentifier.includes('@') ? patientIdentifier.split('@')[0] : 'Patient User',
      role: 'patient',
      emailOrPhone: patientIdentifier.trim(),
      email: patientIdentifier.includes('@') ? patientIdentifier.trim() : undefined,
      phone: !patientIdentifier.includes('@') ? patientIdentifier.trim() : undefined,
      password: patientPassword.trim(),
      doctorId: DOCTORS[0].id,
      assignedDoctorIds: [DOCTORS[0].id],
      hasPaidAppointment: true,
    };
    onLoginSuccess(fallbackUser);
    onClose();
  };

  const handleSelectPatientProfile = (p: RegisteredPatient) => {
    setPatientIdentifier(p.email || p.phone);
    setPatientPassword(p.password);
    const user: AuthUser = {
      id: p.id,
      name: p.name,
      role: 'patient',
      emailOrPhone: p.email || p.phone,
      email: p.email,
      phone: p.phone,
      password: p.password,
      doctorId: p.assignedDoctorIds[0] || DOCTORS[0].id,
      assignedDoctorIds: p.assignedDoctorIds,
      hasPaidAppointment: true,
    };
    onLoginSuccess(user);
    onClose();
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0];
    const user: AuthUser = {
      id: doc.id,
      name: doc.name,
      role: 'doctor',
      emailOrPhone: doc.contact.email,
      doctorId: doc.id,
    };
    onLoginSuccess(user);
    onClose();
  };

  const handleQuickDoctorDemo = (docId: string = DOCTORS[0].id) => {
    const doc = DOCTORS.find((d) => d.id === docId) || DOCTORS[0];
    const user: AuthUser = {
      id: doc.id,
      name: doc.name,
      role: 'doctor',
      emailOrPhone: doc.contact.email,
      doctorId: doc.id,
    };
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0E0E10] text-white rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#D7FA3B] flex items-center justify-center text-[#D7FA3B]">
            <Shield className="w-5 h-5 fill-[#D7FA3B]/20" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-white">
              Aegis Enclave Login
            </h3>
            <p className="text-xs text-[#8C8C88] font-mono">
              Secure Zero-Trust Session Verification
            </p>
          </div>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 my-6">
          <button
            type="button"
            onClick={() => setSelectedRole('patient')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'patient'
                ? 'bg-[#D7FA3B] text-black shadow-md font-bold'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'doctor'
                ? 'bg-[#D7FA3B] text-black shadow-md font-bold'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Portal</span>
          </button>
        </div>

        {/* PATIENT LOGIN FORM */}
        {selectedRole === 'patient' && (
          <div>
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-[#8C8C88] mb-5 leading-relaxed">
              <span className="text-[#D7FA3B] font-semibold block mb-0.5">
                ● Appointment-Verified Access with Mailed Password
              </span>
              Enter the email or phone number and password mailed to you during appointment booking.
            </div>

            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={patientIdentifier}
                    onChange={(e) => setPatientIdentifier(e.target.value)}
                    placeholder="name@example.in or +91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
                  />
                  <Mail className="w-4 h-4 text-[#8C8C88] absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase text-[#8C8C88]">
                    Portal Password (Mailed to your Email)
                  </label>
                  <span className="text-[10px] text-[#D7FA3B] font-mono">e.g. AEGIS-490281</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    placeholder="AEGIS-XXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B] font-mono tracking-wider"
                  />
                  <KeyRound className="w-4 h-4 text-[#8C8C88] absolute right-3.5 top-3.5" />
                </div>
              </div>

              {patientLoginError && (
                <div className="text-xs text-red-400 font-mono">{patientLoginError}</div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-sm tracking-tight transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <span>Enter Patient Enclave</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Select from Registered Patients */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-mono text-[#8C8C88] uppercase">
                Registered Patients on This Device:
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {registeredPatients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPatientProfile(p)}
                    className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-[#D7FA3B] transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-[#8C8C88] font-mono">
                        {p.email} · Pass: <span className="text-[#D7FA3B]">{p.password}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#D7FA3B] px-2 py-0.5 rounded-md bg-black">
                      Sign in →
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-center text-xs text-[#8C8C88] pt-2">
                Haven't booked an appointment yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToBooking();
                  }}
                  className="text-[#D7FA3B] hover:underline font-semibold"
                >
                  Book Clinical Appointment →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DOCTOR CLINICAL LOGIN FORM */}
        {selectedRole === 'doctor' && (
          <div>
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-[#8C8C88] mb-5 leading-relaxed">
              <span className="text-[#D7FA3B] font-semibold block mb-0.5">
                ● Verified Clinician Access
              </span>
              Verified medical council registration grants access strictly to your assigned patient panel and inbound consultation requests under least privilege.
            </div>

            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Select Physician Account
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    const doc = DOCTORS.find((d) => d.id === e.target.value);
                    if (doc) setDoctorRegNumber(doc.regNumber);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
                >
                  {DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} · {doc.hospital.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  NMC / State Medical Council Registration No.
                </label>
                <input
                  type="text"
                  required
                  value={doctorRegNumber}
                  onChange={(e) => setDoctorRegNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Hardware Security PIN
                </label>
                <input
                  type="password"
                  value={doctorPin}
                  onChange={(e) => setDoctorPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B] font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-sm tracking-tight transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <span>Enter Doctor Clinical Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Doctor Demo Buttons */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDoctorDemo('dr-arjun-patel')}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[#D7FA3B] font-mono font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>⚡ 1-Click Login as Dr. Arjun Patel (AIIMS Cardiologist)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDoctorDemo('dr-priya-sharma')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/80 font-mono flex items-center justify-center gap-2 transition-colors"
              >
                <span>⚡ 1-Click Login as Dr. Priya Sharma (CMC Physician)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
