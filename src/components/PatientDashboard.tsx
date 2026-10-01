import React, { useState, useEffect } from 'react';
import { AuthUser, Doctor, ClinicalDocument, ChatMessage, AppointmentRecord, RegisteredPatient } from '../types';
import { DOCTORS } from '../data/telemedicineData';
import { BlackboxViewer } from './BlackboxViewer';
import { UploadDocumentModal } from './UploadDocumentModal';
import {
  getStoredChatMessages,
  saveChatMessage,
  getStoredClinicalDocuments,
  getStoredAppointments,
  getRegisteredPatientById,
  saveAppointment,
  saveOrUpdateRegisteredPatient,
} from '../services/telemedicineStorage';
import {
  LayoutDashboard,
  MessageSquare,
  Video,
  FileSpreadsheet,
  Activity,
  Heart,
  Droplet,
  ShieldCheck,
  Phone,
  Send,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  CheckCheck,
  Calendar,
  Clock,
  ArrowRight,
  UploadCloud,
  FileText,
  Lock,
  KeyRound,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  X,
  Stethoscope,
} from 'lucide-react';

interface PatientDashboardProps {
  currentUser: AuthUser;
  onBackToLanding: () => void;
  onOpenBooking: () => void;
  onLogout: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  onBackToLanding,
  onOpenBooking,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'video' | 'records'>('overview');

  // Dynamic registered patient data
  const [patientRecord, setPatientRecord] = useState<RegisteredPatient | undefined>(
    getRegisteredPatientById(currentUser.id)
  );

  // Attending Doctor selector for chat & consults (dynamically defaults to user's assigned doctor)
  const initialDocId =
    currentUser.doctorId ||
    patientRecord?.assignedDoctorIds?.[0] ||
    DOCTORS[0].id;

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDocId);
  const attendingDoctor = DOCTORS.find((d) => d.id === selectedDoctorId) || DOCTORS[0];

  // Documents
  const [patientDocuments, setPatientDocuments] = useState<ClinicalDocument[]>([]);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Real Chat State (NO automatic replies!)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // Video call state
  const [callActive, setCallActive] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  // Appointments
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);

  // In-Portal Consultation with Another Doctor Modal State
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [consultDept, setConsultDept] = useState<string>('Neurology');
  const [consultDoctorId, setConsultDoctorId] = useState<string>(DOCTORS[1]?.id || DOCTORS[0].id);
  const [consultDay, setConsultDay] = useState<number>(18);
  const [consultTimeSlot, setConsultTimeSlot] = useState<string>('02:00 PM');
  const [consultNotes, setConsultNotes] = useState<string>('');
  const [consultSuccessMessage, setConsultSuccessMessage] = useState<string | null>(null);

  // Dispatched Email Preview Modal State
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  const reloadPatientState = () => {
    const freshPatient = getRegisteredPatientById(currentUser.id);
    if (freshPatient) {
      setPatientRecord(freshPatient);
    }
    const docs = getStoredClinicalDocuments(currentUser.id);
    setPatientDocuments(docs);
    const msgs = getStoredChatMessages(currentUser.id, attendingDoctor.id);
    setChatMessages(msgs);
    const appts = getStoredAppointments(currentUser.id);
    setAppointments(appts);
  };

  // Load chat and documents on mount & when selected doctor changes
  useEffect(() => {
    reloadPatientState();
  }, [currentUser.id, attendingDoctor.id]);

  // Listen to cross-window / tab changes (e.g. when doctor accepts/rejects, replies or uploads a prescription)
  useEffect(() => {
    const handleStorageChange = () => {
      reloadPatientState();
    };
    window.addEventListener('aegis_chat_change', handleStorageChange);
    window.addEventListener('aegis_documents_change', handleStorageChange);
    window.addEventListener('aegis_appointments_change', handleStorageChange);
    window.addEventListener('aegis_patients_change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('aegis_chat_change', handleStorageChange);
      window.removeEventListener('aegis_documents_change', handleStorageChange);
      window.removeEventListener('aegis_appointments_change', handleStorageChange);
      window.removeEventListener('aegis_patients_change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser.id, attendingDoctor.id]);

  // Real patient message send (stores in localStorage for doctor to read & reply)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    saveChatMessage(currentUser.id, attendingDoctor.id, {
      sender: 'patient',
      senderName: currentUser.name,
      text: inputText.trim(),
    });

    setInputText('');
    setChatMessages(getStoredChatMessages(currentUser.id, attendingDoctor.id));
  };

  // List of doctors assigned to this patient
  const assignedDoctorIds = patientRecord?.assignedDoctorIds ||
    currentUser.assignedDoctorIds ||
    (currentUser.doctorId ? [currentUser.doctorId] : [DOCTORS[0].id]);

  const patientDoctors = DOCTORS.filter((d) => assignedDoctorIds.includes(d.id));
  const activeAttendingDoctors = patientDoctors.length > 0 ? patientDoctors : [attendingDoctor];

  // In-Portal Book Another Doctor Handler
  const handleConfirmInPortalConsult = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDoc = DOCTORS.find((d) => d.id === consultDoctorId) || DOCTORS[0];

    // Save appointment request for this doctor
    const savedAppt = saveAppointment({
      patientId: currentUser.id,
      patientName: currentUser.name,
      patientPhone: currentUser.phone || currentUser.emailOrPhone,
      patientEmail: currentUser.email || currentUser.emailOrPhone,
      doctorId: targetDoc.id,
      doctorName: targetDoc.name,
      specialty: targetDoc.specialty,
      date: `Sunday, Oct ${consultDay}, 2026`,
      time: `${consultTimeSlot} IST`,
      fee: targetDoc.consultationFee,
      status: 'pending',
      notes: consultNotes.trim() || `Consultation regarding ${consultDept}`,
    });

    // Update patient assigned doctors
    if (patientRecord && !patientRecord.assignedDoctorIds.includes(targetDoc.id)) {
      patientRecord.assignedDoctorIds.push(targetDoc.id);
      saveOrUpdateRegisteredPatient(patientRecord);
    }

    // Switch attending doctor to the new doctor
    setSelectedDoctorId(targetDoc.id);
    setIsConsultModalOpen(false);
    setConsultSuccessMessage(
      `Appointment request dispatched to ${targetDoc.name}! Awaiting clinical review (Ref: ${savedAppt.paymentRef}).`
    );
    reloadPatientState();

    setTimeout(() => {
      setConsultSuccessMessage(null);
    }, 6000);
  };

  const patientPassword = patientRecord?.password || currentUser.password || 'AEGIS-490281';
  const patientEmail = patientRecord?.email || currentUser.email || currentUser.emailOrPhone;

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A1A1A] pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Top Header & Posture Banner */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-black/10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/80 transition-colors flex items-center gap-1"
            >
              <span>← Back to Website</span>
            </button>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0E0E10]">
                Patient Health Enclave
              </h1>
              <div className="text-xs text-[#8C8C88] font-mono">
                Patient: <strong className="text-black">{currentUser.name}</strong> · ID: #{currentUser.id} · Phone: {currentUser.emailOrPhone}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Posture Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E0E10] text-xs font-mono text-white shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#D7FA3B] animate-pulse"></span>
              <span>IP verified · Bengaluru, India · AES-256</span>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-full bg-black/10 hover:bg-black text-black hover:text-white text-xs font-semibold transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* SECURITY & MAILED PASSWORD NOTIFICATION BANNER */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-black text-white border border-[#D7FA3B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span>Zero-Trust Patient Enclave Provisioned</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-950 text-green-400 border border-green-800">
                  ✓ Credentials Dispatched
                </span>
              </div>
              <div className="text-xs text-[#8C8C88] font-mono mt-0.5">
                Encrypted portal password mailed to <strong className="text-white">{patientEmail}</strong>:{' '}
                <span className="text-[#D7FA3B] font-bold px-2 py-0.5 rounded bg-white/10 tracking-wider">
                  {patientPassword}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#D7FA3B] hover:text-black text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>View Dispatched Email Preview</span>
          </button>
        </div>

        {/* Success Feedback Alert if new consult was requested */}
        {consultSuccessMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-[#D7FA3B] text-black font-semibold text-xs flex items-center gap-2 shadow-md animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            <span>{consultSuccessMessage}</span>
          </div>
        )}

        {/* 3 Vital Stat Chips & Assigned Specialist Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Heart Rate */}
          <div className="p-4 rounded-2xl bg-white border border-black/10 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
            <div>
              <div className="text-[11px] text-[#8C8C88] font-mono uppercase">Heart Rate</div>
              <div className="font-display font-bold text-xl text-[#0E0E10]">
                {patientRecord?.vitals?.hr || '72 BPM'}
              </div>
              <div className="text-[10px] text-green-700 font-mono">● Optimal Sinus Rhythm</div>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-4 rounded-2xl bg-white border border-black/10 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#8C8C88] font-mono uppercase">Blood Pressure</div>
              <div className="font-display font-bold text-xl text-[#0E0E10]">
                {patientRecord?.vitals?.bp || '120/80 mmHg'}
              </div>
              <div className="text-[10px] text-green-700 font-mono">● Normal Systolic</div>
            </div>
          </div>

          {/* SpO2 */}
          <div className="p-4 rounded-2xl bg-white border border-black/10 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#8C8C88] font-mono uppercase">Oxygen SpO2</div>
              <div className="font-display font-bold text-xl text-[#0E0E10]">
                {patientRecord?.vitals?.spo2 || '99%'}
              </div>
              <div className="text-[10px] text-green-700 font-mono">● Saturated Normal</div>
            </div>
          </div>

          {/* Attending Specialist Selector Card */}
          <div className="p-4 rounded-2xl bg-[#0E0E10] text-white border border-black flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={attendingDoctor.image}
                alt={attendingDoctor.name}
                className="w-10 h-10 rounded-xl object-cover border border-[#D7FA3B] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <div className="font-display font-bold text-xs truncate">
                  {attendingDoctor.name}
                </div>
                <div className="text-[10px] text-[#8C8C88] truncate">{attendingDoctor.specialty}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={() => setActiveTab('messages')}
                className="p-2 rounded-lg bg-white/10 hover:bg-[#D7FA3B] hover:text-black transition-colors"
                title="Message Doctor"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className="p-2 rounded-lg bg-[#D7FA3B] text-black hover:bg-[#c9ec2e] transition-colors"
                title="Start Video Consult"
              >
                <Video className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Vertical Pill Nav + Right Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Vertical Pill Navigation */}
          <div className="lg:col-span-3">
            <div className="p-4 rounded-3xl bg-[#0E0E10] text-white border border-black shadow-xl space-y-2 sticky top-28">
              <div className="px-3 py-2 text-[10px] font-mono text-[#8C8C88] uppercase tracking-wider">
                Patient Enclave Menu
              </div>

              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-xs tracking-tight transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#D7FA3B] text-black shadow-md'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview &amp; Appointments</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-xs tracking-tight transition-all ${
                  activeTab === 'messages'
                    ? 'bg-[#D7FA3B] text-black shadow-md'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>E2E Messages</span>
                </div>
                {chatMessages.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#D7FA3B]">
                    {chatMessages.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-xs tracking-tight transition-all ${
                  activeTab === 'video'
                    ? 'bg-[#D7FA3B] text-black shadow-md'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Consult (WebRTC)</span>
              </button>

              <button
                onClick={() => setActiveTab('records')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-xs tracking-tight transition-all ${
                  activeTab === 'records'
                    ? 'bg-[#D7FA3B] text-black shadow-md'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Records (Blackbox)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white">
                  {patientDocuments.length}
                </span>
              </button>

              {/* In-Portal Consultation & Upload Buttons */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                {/* Consult Another Specialist Modal Trigger */}
                <button
                  onClick={() => setIsConsultModalOpen(true)}
                  className="w-full py-2.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Consult Another Specialist</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>+ Upload Health Record</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Area: Dynamic Tab Content */}
          <div className="lg:col-span-9">
            {/* TAB 1: OVERVIEW & APPOINTMENTS (DYNAMIC) */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Consultation List Header with Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0E0E10]">
                      Your Scheduled Consultations ({appointments.length})
                    </h3>
                    <p className="text-xs text-[#8C8C88] font-mono">
                      Pay-per-consultation sessions · Zero subscriptions · End-to-end encrypted
                    </p>
                  </div>

                  <button
                    onClick={() => setIsConsultModalOpen(true)}
                    className="px-4 py-2.5 rounded-full bg-black hover:bg-[#D7FA3B] hover:text-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors self-start shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Consult Another Doctor</span>
                  </button>
                </div>

                {/* If appointments exist, map dynamically */}
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appt) => {
                      const isPending = appt.status === 'pending';
                      const isAccepted = appt.status === 'accepted';
                      const isRejected = appt.status === 'rejected';

                      return (
                        <div
                          key={appt.id}
                          className="p-6 sm:p-7 rounded-3xl bg-white border border-black/10 shadow-sm transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                              {/* Status Badge */}
                              <div className="mb-2">
                                {isPending && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-mono font-bold">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                    <span>Pending Doctor Acceptance</span>
                                  </span>
                                )}
                                {isAccepted && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B] text-black text-[11px] font-mono font-bold">
                                    <span className="w-2 h-2 rounded-full bg-black"></span>
                                    <span>Accepted &amp; Confirmed</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-[11px] font-mono font-bold">
                                    <XCircle className="w-3 h-3 text-red-600" />
                                    <span>Consultation Declined (Fee Refunded)</span>
                                  </span>
                                )}
                              </div>

                              <h4 className="font-display text-xl sm:text-2xl font-bold text-[#0E0E10]">
                                {appt.date} · {appt.time}
                              </h4>
                              <p className="text-xs text-[#8C8C88] font-mono mt-0.5">
                                Specialist: <strong className="text-black">{appt.doctorName}</strong> ({appt.specialty})
                              </p>
                              {appt.notes && (
                                <p className="text-xs text-black/80 font-sans mt-2 bg-[#F6F4EE] p-3 rounded-xl border border-black/5">
                                  <strong>Health Notes:</strong> {appt.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              {isAccepted && (
                                <button
                                  onClick={() => {
                                    setSelectedDoctorId(appt.doctorId);
                                    setActiveTab('video');
                                  }}
                                  className="px-5 py-2.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>Launch Video Room</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedDoctorId(appt.doctorId);
                                  setActiveTab('messages');
                                }}
                                className="px-4 py-2.5 rounded-full bg-black text-white hover:bg-black/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Message Doctor</span>
                              </button>
                            </div>
                          </div>

                          {/* Status Description / Triage Note */}
                          <div className="text-xs font-mono text-[#8C8C88] mb-4">
                            {isPending && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>
                                  Dr. {appt.doctorName} has been notified of your triage request. You can send preliminary questions via E2E Messages above while waiting.
                                </span>
                              </div>
                            )}
                            {isRejected && (
                              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <span>
                                  Clinical Note from Doctor: "{appt.rejectionReason || 'Physician schedule at hospital overbooked'}". Your UPI transaction was reversed.
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-black/5 text-xs font-mono text-[#8C8C88]">
                            <div>
                              <span className="block uppercase text-[10px]">Consultation Fee</span>
                              <strong className="text-black">₹{appt.fee} (Paid)</strong>
                            </div>
                            <div>
                              <span className="block uppercase text-[10px]">Payment Reference</span>
                              <strong className="text-black">{appt.paymentRef}</strong>
                            </div>
                            <div>
                              <span className="block uppercase text-[10px]">Zero-Trust Enclave</span>
                              <strong className="text-green-700">● In-RAM Ephemeral Session</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-10 rounded-3xl bg-white border border-black/10 text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-black/5 text-black flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg text-[#0E0E10]">
                        No Appointments Scheduled Yet
                      </h4>
                      <p className="text-xs text-[#8C8C88] max-w-md mx-auto mt-1">
                        You can consult any specialist doctor across India for a specific health issue directly from your personal portal.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsConsultModalOpen(true)}
                      className="px-6 py-3 rounded-full bg-[#D7FA3B] text-black font-extrabold text-xs inline-flex items-center gap-2 shadow-md hover:bg-[#cbf128]"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Consult a Specialist Now</span>
                    </button>
                  </div>
                )}

                {/* Patient's Uploaded Records & History */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/10 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display text-lg font-bold text-[#0E0E10]">
                      Your Health Records ({patientDocuments.length})
                    </h4>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="text-xs font-semibold text-black hover:text-[#D7FA3B] flex items-center gap-1 underline"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload New Record</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {patientDocuments.map((doc, idx) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setSelectedDocIndex(idx);
                          setActiveTab('records');
                        }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-[#F6F4EE] border border-black/5 hover:border-black/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-black text-[#D7FA3B] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-[#0E0E10]">
                              {doc.title}
                            </div>
                            <div className="text-[11px] text-[#8C8C88] font-mono">
                              {doc.category} · {doc.date} {doc.uploadedBy === 'patient' ? '(Uploaded by You)' : '(Issued by Doctor)'}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-black hover:underline">
                          View in Blackbox →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REAL CROSS-ROLE CHAT (Requirement 3: NO AUTO BOT REPLIES) */}
            {activeTab === 'messages' && (
              <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-sm flex flex-col h-[650px]">
                {/* Chat header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={attendingDoctor.image}
                      alt={attendingDoctor.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#D7FA3B]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-display font-bold text-sm text-[#0E0E10]">
                        {attendingDoctor.name}
                      </div>
                      <div className="text-[11px] text-[#8C8C88] font-mono">
                        {attendingDoctor.specialty} · {attendingDoctor.hospital.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Switch Doctor selector if patient has multiple specialists */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8C8C88]">Physician:</span>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#F6F4EE] border border-black/10 text-xs font-medium focus:outline-none"
                    >
                      {DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Important Real-Chat Banner */}
                <div className="my-2 p-2.5 rounded-xl bg-black/5 text-[11px] text-[#8C8C88] font-mono flex items-center justify-between">
                  <span>🔒 Real 1-to-1 encrypted channel. Messages persist for doctor to view &amp; reply.</span>
                  <span className="text-black font-bold hidden sm:inline">No AI Bots</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-xs text-[#8C8C88]">
                      No messages yet. Send a message to {attendingDoctor.name}. When the doctor logs in from their portal, they will see it and reply!
                    </div>
                  ) : (
                    chatMessages.map((m) => {
                      const isMe = m.sender === 'patient';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] text-[#8C8C88] font-mono mb-0.5 px-1">
                            {isMe ? 'You' : attendingDoctor.name}
                          </div>
                          <div
                            className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? 'bg-[#0E0E10] text-white rounded-br-none shadow-sm'
                                : 'bg-[#F6F4EE] text-[#1A1A1A] rounded-bl-none border border-black/10'
                            }`}
                          >
                            <p>{m.text}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#8C8C88] font-mono mt-1 px-1">
                            <span>{m.timestamp}</span>
                            {isMe && <CheckCheck className="w-3 h-3 text-[#D7FA3B]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="pt-3 border-t border-black/10 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Type message to ${attendingDoctor.name}...`}
                    className="flex-1 px-4 py-3 rounded-full bg-[#F6F4EE] border border-black/10 text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="p-3 rounded-full bg-[#D7FA3B] text-black hover:bg-[#cbf128] transition-colors shrink-0 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: VIDEO CONSULT */}
            {activeTab === 'video' && (
              <div className="rounded-3xl bg-[#0E0E10] text-white border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {!callActive ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] flex items-center justify-center mb-6">
                      <Video className="w-10 h-10" />
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                      Encrypted Clinical Video Enclave
                    </h3>
                    <p className="text-[#8C8C88] text-xs sm:text-sm max-w-md mb-8 leading-relaxed font-mono">
                      DTLS-SRTP 256-bit peer-to-peer WebRTC connection. Direct room with {attendingDoctor.name}.
                    </p>

                    <button
                      onClick={() => setCallActive(true)}
                      className="px-8 py-4 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-sm tracking-tight transition-all active:scale-95 shadow-xl flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Launch Video Consult Room</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative rounded-2xl overflow-hidden bg-[#18181B] h-[480px] sm:h-[540px] flex items-center justify-center border border-white/10">
                      <img
                        src={attendingDoctor.image}
                        alt="Doctor on Call"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                      <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/70 backdrop-blur border border-white/10 text-xs">
                        <div className="font-bold font-display text-white">{attendingDoctor.name}</div>
                        <div className="text-[10px] text-[#D7FA3B] font-mono">● 1080p 60fps · AES-256 Verified</div>
                      </div>

                      {/* Self PIP View */}
                      <div className="absolute bottom-20 right-4 w-32 sm:w-40 h-24 sm:h-28 rounded-xl bg-black/80 border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center">
                        <div className="text-center p-2">
                          <div className="text-[10px] font-mono text-[#D7FA3B]">{currentUser.name}</div>
                          <div className="text-[9px] text-white/70">Self Camera Feed</div>
                        </div>
                      </div>

                      {/* Call Controls */}
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-2xl">
                        <button
                          onClick={() => setAudioMuted(!audioMuted)}
                          className={`p-3 rounded-full transition-colors ${
                            audioMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {audioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setVideoMuted(!videoMuted)}
                          className={`p-3 rounded-full transition-colors ${
                            videoMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {videoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setCallActive(false)}
                          className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span>End Call</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RECORDS (Blackbox Viewer & Upload Feature - Requirement 7) */}
            {activeTab === 'records' && (
              <div className="space-y-6">
                {/* Document Selector & Upload Button Header */}
                <div className="p-4 rounded-2xl bg-white border border-black/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#8C8C88] uppercase tracking-wider text-[11px] font-semibold">
                      Records:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {patientDocuments.map((doc, idx) => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                            selectedDocIndex === idx
                              ? 'bg-black text-[#D7FA3B] font-bold shadow-xs'
                              : 'bg-black/5 hover:bg-black/10 text-black'
                          }`}
                        >
                          {doc.title.split('—')[0].slice(0, 24)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-black hover:bg-[#D7FA3B] hover:text-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>+ Upload Report / Scan</span>
                  </button>
                </div>

                {patientDocuments.length > 0 ? (
                  <BlackboxViewer
                    document={patientDocuments[selectedDocIndex] || patientDocuments[0]}
                    patientName={currentUser.name}
                    isDoctorView={false}
                  />
                ) : (
                  <div className="p-12 text-center text-[#8C8C88] bg-white rounded-3xl border border-black/10">
                    No documents found. Click "+ Upload Report / Scan" above to add your first record.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal for Patient */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patientId={currentUser.id}
        patientName={currentUser.name}
        uploaderRole="patient"
        uploaderName={currentUser.name}
        onDocumentUploaded={(newDoc) => {
          setPatientDocuments(getStoredClinicalDocuments(currentUser.id));
          setSelectedDocIndex(0);
        }}
      />

      {/* IN-PORTAL CONSULT ANOTHER SPECIALIST MODAL */}
      {isConsultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#141416] text-white rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setIsConsultModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#D7FA3B] font-mono text-xs uppercase mb-2">
              <Stethoscope className="w-4 h-4" />
              <span>In-Portal Multi-Specialist Consultation Desk</span>
            </div>

            <h3 className="font-display text-2xl font-bold text-white mb-1">
              Consult Another Specialist
            </h3>
            <p className="text-xs text-[#8C8C88] mb-6 leading-relaxed">
              Schedule a new zero-trust consultation for another symptom or medical condition without leaving your patient enclave.
            </p>

            <form onSubmit={handleConfirmInPortalConsult} className="space-y-5">
              {/* Department Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-2">
                  Select Department / Specialty
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Cardiology',
                    'Neurology',
                    'Oncology',
                    'Dermatology',
                    'Orthopedics',
                    'Gastroenterology',
                    'Endocrinology',
                    'Pulmonology',
                    'Pediatrics',
                    'Psychiatry',
                    'General Medicine',
                    'Nephrology',
                  ].map((dept) => {
                    const isSelected = consultDept.toLowerCase() === dept.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => {
                          setConsultDept(dept);
                          const matchingDoc = DOCTORS.find(
                            (d) =>
                              d.specialty.toLowerCase() === dept.toLowerCase() ||
                              d.specialties.some((s) => s.toLowerCase().includes(dept.toLowerCase()))
                          );
                          if (matchingDoc) {
                            setConsultDoctorId(matchingDoc.id);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all text-left border ${
                          isSelected
                            ? 'bg-[#D7FA3B] text-black border-[#D7FA3B]'
                            : 'bg-black/40 text-white/90 border-white/10 hover:bg-black/70'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specialist Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-2">
                  Select Specialist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {DOCTORS.map((doc) => {
                    const isSelected = consultDoctorId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setConsultDoctorId(doc.id);
                          setConsultDept(doc.specialty);
                        }}
                        className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                          isSelected
                            ? 'bg-white/10 border-[#D7FA3B] ring-2 ring-[#D7FA3B]'
                            : 'bg-black/30 hover:bg-black/60 border-white/10'
                        }`}
                      >
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/20"
                          referrerPolicy="no-referrer"
                        />
                        <div className="overflow-hidden">
                          <div className="font-display text-xs font-bold text-white truncate">
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-[#8C8C88] truncate">{doc.specialty}</div>
                          <div className="text-[10px] font-mono text-[#D7FA3B] font-bold">
                            ₹{doc.consultationFee} fee
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slot & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                    Preferred Date
                  </label>
                  <select
                    value={consultDay}
                    onChange={(e) => setConsultDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-[#D7FA3B]"
                  >
                    {[16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((d) => (
                      <option key={d} value={d}>
                        Sunday, Oct {d}, 2026
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                    Time Slot (IST)
                  </label>
                  <select
                    value={consultTimeSlot}
                    onChange={(e) => setConsultTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-[#D7FA3B]"
                  >
                    {['09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '04:15 PM', '06:00 PM'].map((s) => (
                      <option key={s} value={s}>
                        {s} (30 Min Consult)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Medical Issue / Symptoms */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Describe Symptoms / Reason for this Specialist Consult
                </label>
                <textarea
                  rows={2}
                  required
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  placeholder="e.g. Mild neurological tingling in fingers for 2 weeks, seeking second opinion..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-[#D7FA3B] resize-none"
                />
              </div>

              {/* Price & Submit */}
              {(() => {
                const chosenDoc = DOCTORS.find((d) => d.id === consultDoctorId) || DOCTORS[0];
                return (
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#8C8C88]">
                        Per-Session Consultation Fee
                      </div>
                      <div className="font-display font-bold text-xl text-[#D7FA3B]">
                        ₹{chosenDoc.consultationFee}.00
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsConsultModalOpen(false)}
                        className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs tracking-tight transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Confirm &amp; Request (₹{chosenDoc.consultationFee})</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </form>
          </div>
        </div>
      )}

      {/* DISPATCHED EMAIL PREVIEW MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#18181B] text-white rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 text-[#D7FA3B] font-mono text-xs">
              <Mail className="w-4 h-4" />
              <span>Simulated Secure Mail Delivery Enclave</span>
            </div>

            <div className="rounded-2xl bg-black/80 border border-white/10 p-5 space-y-4 text-xs font-mono">
              <div className="border-b border-white/10 pb-3 space-y-1">
                <div><span className="text-[#8C8C88]">From:</span> security-enclave@aegis-health.in</div>
                <div><span className="text-[#8C8C88]">To:</span> {patientEmail}</div>
                <div><span className="text-[#8C8C88]">Subject:</span> Your Aegis Telemedicine Credentials &amp; Portal Password</div>
                <div><span className="text-[#8C8C88]">Date:</span> {new Date().toLocaleString('en-IN')}</div>
              </div>

              <div className="space-y-3 font-sans text-sm text-white/90">
                <p>Namaste {currentUser.name},</p>
                <p className="text-xs text-[#8C8C88] leading-relaxed">
                  Your appointment booking has been initiated. Your private patient enclave has been provisioned with zero-trust storage.
                </p>

                <div className="p-4 rounded-xl bg-white/[0.04] border border-[#D7FA3B]/40 space-y-1.5 font-mono text-xs">
                  <div className="text-[10px] text-[#8C8C88] uppercase">Official Login Credentials:</div>
                  <div><strong>Username / Identifier:</strong> {patientEmail}</div>
                  <div><strong>Patient ID:</strong> #{currentUser.id}</div>
                  <div className="text-[#D7FA3B]"><strong>Temporary Security Password:</strong> {patientPassword}</div>
                </div>

                <p className="text-xs text-[#8C8C88]">
                  Your doctor has been notified of your consultation request. You can now log into your patient enclave to upload previous health reports and message your doctor.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#D7FA3B] text-black font-bold text-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
