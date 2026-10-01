import React, { useState, useEffect } from 'react';
import { AuthUser, ClinicalDocument, ChatMessage, Doctor, RegisteredPatient, AppointmentRecord } from '../types';
import { DOCTORS } from '../data/telemedicineData';
import { BlackboxViewer } from './BlackboxViewer';
import { UploadDocumentModal } from './UploadDocumentModal';
import {
  getStoredChatMessages,
  saveChatMessage,
  getStoredClinicalDocuments,
  saveClinicalDocument,
  getStoredRegisteredPatients,
  getRegisteredPatientById,
  getStoredAppointments,
  updateAppointmentStatus,
  saveOrUpdateRegisteredPatient,
  dischargePatientConsultation,
} from '../services/telemedicineStorage';
import {
  Stethoscope,
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  Activity,
  PlusCircle,
  FileText,
  Clock,
  Send,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ChevronLeft,
  UploadCloud,
  MessageSquare,
  Video,
  Heart,
  Droplet,
  Eye,
  FileCheck,
  HeartHandshake,
  CheckCheck,
  XCircle,
  Inbox,
  Filter,
  Check,
  X,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

interface DoctorClinicalPortalProps {
  currentUser: AuthUser;
  onBackToLanding: () => void;
  onLogout: () => void;
}

export const DoctorClinicalPortal: React.FC<DoctorClinicalPortalProps> = ({
  currentUser,
  onBackToLanding,
  onLogout,
}) => {
  // Find current doctor object
  const doctorObj = DOCTORS.find((d) => d.id === currentUser.doctorId) || DOCTORS[0];

  // Primary Doctor Portal View: 'roster' (Patients) or 'requests' (Inbound Appointments)
  const [portalTab, setPortalTab] = useState<'roster' | 'requests'>('roster');

  // Dynamic Patients & Inbound Requests
  const [assignedPatients, setAssignedPatients] = useState<RegisteredPatient[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRecord[]>([]);
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Rejection modal
  const [rejectionModalAppt, setRejectionModalAppt] = useState<AppointmentRecord | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('Doctor clinical capacity reached for this time slot');
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);

  // Mutual Discharge & Case Closure Modal state
  const [showDischargeModal, setShowDischargeModal] = useState<boolean>(false);
  const [dischargeOutcome, setDischargeOutcome] = useState('Patient Fully Recovered & Symptoms Resolved');
  const [dischargeNotes, setDischargeNotes] = useState(
    'Comprehensive telemedicine care concluded. Vital signs stable, ECG telemetry optimal, and treatment plan successfully completed.'
  );

  // Selected patient state (null = patient list view; patient = detail workspace view)
  const [selectedPatient, setSelectedPatient] = useState<RegisteredPatient | null>(null);

  // Workspace sub-tab
  const [workspaceTab, setWorkspaceTab] = useState<'records' | 'chat' | 'prescribe' | 'video'>('records');

  // Documents state
  const [patientDocuments, setPatientDocuments] = useState<ClinicalDocument[]>([]);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Real Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // Continuous Behavioral-Biometrics Session Trust Score
  const [trustScore, setTrustScore] = useState<number>(96);
  const [showStepUpModal, setShowStepUpModal] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Prescription Composer state
  const [rxDrugName, setRxDrugName] = useState('Metoprolol Succinate ER');
  const [rxDosage, setRxDosage] = useState('25mg');
  const [rxSig, setRxSig] = useState('1 tablet orally once daily after breakfast');
  const [rxRefills, setRxRefills] = useState('2');
  const [rxSuccessNotice, setRxSuccessNotice] = useState<string | null>(null);

  // Load patients and requests for this doctor
  const refreshDoctorData = () => {
    const allPatients = getStoredRegisteredPatients();
    // Filter patients assigned to this doctor
    const myPatients = allPatients.filter((p) => p.assignedDoctorIds.includes(doctorObj.id));
    setAssignedPatients(myPatients);

    // Filter appointments for this doctor
    const myAppts = getStoredAppointments(undefined, doctorObj.id);
    setAppointmentRequests(myAppts);

    // If a patient was currently selected, refresh their document and chat state
    if (selectedPatient) {
      const refreshedPatient = allPatients.find((p) => p.id === selectedPatient.id);
      if (refreshedPatient) {
        setSelectedPatient(refreshedPatient);
      }
    }
  };

  useEffect(() => {
    refreshDoctorData();
  }, [doctorObj.id]);

  // Load documents & messages when selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      const docs = getStoredClinicalDocuments(selectedPatient.id);
      setPatientDocuments(docs);
      setSelectedDocIndex(0);

      // Load chat messages
      const msgs = getStoredChatMessages(selectedPatient.id, doctorObj.id);
      setChatMessages(msgs);
    }
  }, [selectedPatient, doctorObj.id]);

  // Listen to external storage events (e.g. when a patient books, uploads a record, or sends a message)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshDoctorData();
      if (selectedPatient) {
        setPatientDocuments(getStoredClinicalDocuments(selectedPatient.id));
        setChatMessages(getStoredChatMessages(selectedPatient.id, doctorObj.id));
      }
    };
    window.addEventListener('aegis_patients_change', handleStorageChange);
    window.addEventListener('aegis_appointments_change', handleStorageChange);
    window.addEventListener('aegis_chat_change', handleStorageChange);
    window.addEventListener('aegis_documents_change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('aegis_patients_change', handleStorageChange);
      window.removeEventListener('aegis_appointments_change', handleStorageChange);
      window.removeEventListener('aegis_chat_change', handleStorageChange);
      window.removeEventListener('aegis_documents_change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedPatient, doctorObj.id]);

  // Handle Real Doctor Reply (No auto-bots!)
  const handleDoctorSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPatient) return;

    saveChatMessage(selectedPatient.id, doctorObj.id, {
      sender: 'doctor',
      senderName: doctorObj.name,
      text: replyText.trim(),
    });

    setReplyText('');
    setChatMessages(getStoredChatMessages(selectedPatient.id, doctorObj.id));
  };

  // ACCEPT PATIENT REQUEST
  const handleAcceptRequest = (appt: AppointmentRecord) => {
    updateAppointmentStatus(appt.id, 'accepted');
    refreshDoctorData();

    setActionFeedbackToast(`Consultation request for ${appt.patientName} accepted! Added to active patient roster.`);
    setTimeout(() => setActionFeedbackToast(null), 4000);
  };

  // REJECT PATIENT REQUEST
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalAppt) return;

    updateAppointmentStatus(rejectionModalAppt.id, 'rejected', rejectionReasonText);
    refreshDoctorData();

    setActionFeedbackToast(`Consultation request for ${rejectionModalAppt.patientName} was declined.`);
    setRejectionModalAppt(null);
    setTimeout(() => setActionFeedbackToast(null), 4000);
  };

  // MUTUAL CONSULTATION DISCHARGE & CASE CLOSURE
  const handleConfirmDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    dischargePatientConsultation({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: doctorObj.id,
      doctorName: doctorObj.name,
      reason: dischargeOutcome,
      dischargeNotes: dischargeNotes,
    });

    setActionFeedbackToast(
      `Care concluded and mutual discharge certificate issued for ${selectedPatient.name}. Communication channel dissolved.`
    );
    setShowDischargeModal(false);
    setSelectedPatient(null);
    refreshDoctorData();
    setTimeout(() => setActionFeedbackToast(null), 5000);
  };

  // Trigger trust score drop test
  const handleSimulateScoreDrop = () => {
    setTrustScore(52);
    setShowStepUpModal(true);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(0, 1);
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`doc-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyStepUp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length === 6) {
      setShowStepUpModal(false);
      setTrustScore(98);
      setOtpError(null);
      setOtpCode(['', '', '', '', '', '']);
    } else {
      setOtpError('Please enter all 6 cryptographic digits.');
    }
  };

  // Compose official digital prescription
  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    saveClinicalDocument({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: doctorObj.id,
      doctorName: doctorObj.name,
      title: `Electronic Prescription — ${rxDrugName} ${rxDosage}`,
      category: 'Prescription',
      pages: 1,
      uploadedBy: 'doctor',
      contentLines: [
        'AEGIS ZERO-TRUST CLINICAL ELECTRONIC PRESCRIPTION',
        `RX IDENTIFIER: RX-${Date.now().toString().slice(-8)} | NMC REG: ${doctorObj.regNumber}`,
        `PRESCRIBER: ${doctorObj.name} (${doctorObj.hospital})`,
        `PATIENT: ${selectedPatient.name.toUpperCase()} (${selectedPatient.age}/${selectedPatient.gender}) | ID: #${selectedPatient.id}`,
        `CLINICAL DIAGNOSIS: ${selectedPatient.condition.toUpperCase()}`,
        `MEDICATION: ${rxDrugName.toUpperCase()} ${rxDosage.toUpperCase()}`,
        `DIRECTIONS / SIG: ${rxSig.toUpperCase()}`,
        `QUANTITY DISPENSED: 30 TABLETS | REFILLS AUTHORIZED: ${rxRefills}`,
        'DISPENSE AS WRITTEN: GENERIC OR EQUIVALENT SUBSTITUTION PERMITTED',
        'DISPATCH STATUS: TRANSMITTED TO ENCRYPTED EDI PHARMACY HUB (INDIA)',
        'SECURITY: VIEW-ONLY RAM RENDER · DO NOT DISCHARGE PHYSICALLY',
      ],
    });

    setPatientDocuments(getStoredClinicalDocuments(selectedPatient.id));
    setSelectedDocIndex(0);
    setRxSuccessNotice(`Prescription for ${rxDrugName} sealed to ${selectedPatient.name}'s Blackbox!`);
    setTimeout(() => {
      setRxSuccessNotice(null);
      setWorkspaceTab('records');
    }, 1800);
  };

  // Pending count for badge
  const pendingRequests = appointmentRequests.filter((r) => r.status === 'pending');
  const pendingCount = pendingRequests.length;

  // Filtered requests list
  const filteredRequests = appointmentRequests.filter((r) => {
    if (requestFilter === 'pending') return r.status === 'pending';
    if (requestFilter === 'accepted') return r.status === 'accepted' || r.status === 'confirmed';
    if (requestFilter === 'rejected') return r.status === 'rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white pt-24 sm:pt-28 pb-16 relative">
      {/* Toast Feedback */}
      {actionFeedbackToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-black border border-[#D7FA3B] text-white shadow-2xl flex items-center gap-3 animate-fade-in text-xs max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#D7FA3B] shrink-0" />
          <span>{actionFeedbackToast}</span>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#18181B] text-white rounded-3xl border border-red-500/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setRejectionModalAppt(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase mb-2">
              <XCircle className="w-4 h-4" />
              <span>Decline Patient Consultation</span>
            </div>

            <h3 className="font-display text-xl font-bold mb-2">
              Decline Request for {rejectionModalAppt.patientName}?
            </h3>
            <p className="text-xs text-[#8C8C88] mb-5 leading-relaxed">
              Select or enter the clinical justification. The patient will be notified in their portal enclave with the clinical reason.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Clinical Justification / Reason
                </label>
                <select
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-red-400 mb-2"
                >
                  <option value="Doctor clinical capacity reached for this time slot">
                    Doctor clinical capacity reached for this time slot
                  </option>
                  <option value="Condition outside specialist purview — recommend General Medicine">
                    Condition outside specialist purview — recommend General Medicine
                  </option>
                  <option value="Emergency clinical protocol: immediate hospital OPD visit advised">
                    Emergency clinical protocol: immediate hospital OPD visit advised
                  </option>
                  <option value="Physician on emergency surgical duty at hospital">
                    Physician on emergency surgical duty at hospital
                  </option>
                </select>

                <input
                  type="text"
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="Or enter custom reason..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/15 text-white text-xs focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalAppt(null)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MUTUAL CARE CONCLUSION & DISCHARGE MODAL (Mutual Enclave Dissolution) */}
      {showDischargeModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#18181B] text-white rounded-3xl border border-emerald-500/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowDischargeModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase mb-2">
              <HeartHandshake className="w-4 h-4" />
              <span>Conclude Telemedicine Care &amp; Discharge</span>
            </div>

            <h3 className="font-display text-2xl font-bold mb-2">
              Conclude Care for {selectedPatient.name}
            </h3>
            <p className="text-xs text-[#8C8C88] mb-5 leading-relaxed">
              When patient health is stabilized or recovered, concluding the consultation mutually seals the clinical file, issues a signed discharge summary, and notifies the patient in their health enclave.
            </p>

            <form onSubmit={handleConfirmDischarge} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Clinical Outcome
                </label>
                <select
                  value={dischargeOutcome}
                  onChange={(e) => setDischargeOutcome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="Patient Fully Recovered & Symptoms Resolved">
                    Patient Fully Recovered &amp; Symptoms Resolved
                  </option>
                  <option value="Clinical Treatment Course Successfully Completed">
                    Clinical Treatment Course Successfully Completed
                  </option>
                  <option value="Stabilized & Transitioned to Local Primary Care">
                    Stabilized &amp; Transitioned to Local Primary Care
                  </option>
                  <option value="Consultation Series Concluded (Satisfactory Progress)">
                    Consultation Series Concluded (Satisfactory Progress)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Discharge Clinical Notes &amp; Follow-up Advice
                </label>
                <textarea
                  rows={3}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-400 resize-none"
                  placeholder="Enter final clinical assessment..."
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  A permanent <strong>Clinical Discharge Summary</strong> will be signed with your NMC credentials and placed in {selectedPatient.name}'s Blackbox. The active 1-to-1 tele-channel will be mutually concluded.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDischargeModal(false)}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs tracking-tight transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4 text-black" />
                  <span>Confirm Clinical Discharge &amp; Conclude</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP-UP RE-AUTHENTICATION MODAL */}
      {showStepUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md bg-[#18181B] text-white rounded-3xl border border-red-500/40 p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center mb-6">
              <div className="text-xs font-mono uppercase text-red-400 font-bold tracking-wider mb-1">
                Security Threshold Tripped
              </div>
              <h3 className="font-display text-2xl font-bold">
                Step-Up Clinician Authentication
              </h3>
              <p className="text-xs text-[#8C8C88] mt-2 leading-relaxed">
                Biometric trust score dropped to {trustScore}%. To unlock patient records, enter your 6-digit cryptographic security code.
              </p>
            </div>

            <form onSubmit={handleVerifyStepUp} className="space-y-6">
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`doc-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-14 rounded-xl bg-black border border-white/20 text-center font-mono font-bold text-xl text-[#D7FA3B] focus:outline-none focus:border-[#D7FA3B]"
                  />
                ))}
              </div>

              {otpError && (
                <div className="text-xs text-red-400 text-center font-mono">{otpError}</div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-sm tracking-tight transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <span>Verify &amp; Restore Clinical Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setOtpCode(['8', '8', '1', '9', '4', '0'])}
                  className="text-xs text-[#8C8C88] hover:text-[#D7FA3B] underline font-mono"
                >
                  Auto-fill demo hardware key: 881940
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 transition-all duration-300 ${showStepUpModal ? 'filter blur-md pointer-events-none' : ''}`}>
        {/* Top Doctor Navigation & Session Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#141416] border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              ← Public Website
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#D7FA3B]" />
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Doctor Clinical Portal
                </h1>
              </div>
              <div className="text-xs text-[#8C8C88] font-mono mt-0.5">
                Logged in as <strong className="text-white">{doctorObj.name}</strong> · {doctorObj.title} · {doctorObj.regNumber}
              </div>
            </div>
          </div>

          {/* Session Trust Score & Logout */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateScoreDrop}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-950/40 text-xs font-mono text-[#8C8C88] hover:text-red-300 border border-white/10 hover:border-red-500/40 transition-colors"
              title="Test biometric drop & step-up verification modal"
            >
              ⚡ Test Biometric Drop
            </button>

            {/* Circular Trust Score Ring */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-black border border-white/10">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke={trustScore > 75 ? '#D7FA3B' : trustScore > 60 ? '#FBBF24' : '#EF4444'}
                    strokeWidth="3"
                    strokeDasharray={88}
                    strokeDashoffset={88 - (trustScore * 88) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[10px] font-mono font-bold text-white">
                  {trustScore}%
                </span>
              </div>
              <div>
                <div className="text-[9px] uppercase font-mono text-[#8C8C88]">Trust Score</div>
                <div className="text-xs font-bold text-[#D7FA3B]">Biometric Active</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-red-600/80 text-xs font-semibold transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* PRIMARY TAB SWITCHER: Assigned Patients Roster vs Inbound Appointment Requests */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setPortalTab('roster');
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              portalTab === 'roster'
                ? 'bg-[#D7FA3B] text-black shadow-md'
                : 'bg-[#141416] text-white/80 hover:text-white border border-white/10'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Assigned Patients Panel</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
              {assignedPatients.length}
            </span>
          </button>

          <button
            onClick={() => {
              setPortalTab('requests');
              setSelectedPatient(null);
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
              portalTab === 'requests'
                ? 'bg-[#D7FA3B] text-black shadow-md'
                : 'bg-[#141416] text-white/80 hover:text-white border border-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Appointment Requests</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono animate-pulse">
                {pendingCount} new
              </span>
            )}
          </button>
        </div>

        {/* VIEW A: APPOINTMENT REQUESTS TAB (Requirement: separate tab with accept/reject right) */}
        {portalTab === 'requests' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141416] border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-xs font-mono mb-2">
                    <Inbox className="w-3 h-3" />
                    <span>Inbound Consult Triage Desk · {doctorObj.name}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Patient Consultation Requests
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8C8C88] mt-1">
                    Review and triage patient booking requests. Accept to grant patient access to your active panel, or decline/reroute.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-black rounded-2xl border border-white/10 text-xs font-mono self-start sm:self-auto">
                  <button
                    onClick={() => setRequestFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition-colors ${
                      requestFilter === 'all' ? 'bg-[#D7FA3B] text-black font-bold' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    All Requests
                  </button>
                  <button
                    onClick={() => setRequestFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ${
                      requestFilter === 'pending' ? 'bg-[#D7FA3B] text-black font-bold' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>Pending</span>
                    {pendingCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setRequestFilter('accepted')}
                    className={`px-3 py-1.5 rounded-xl transition-colors ${
                      requestFilter === 'accepted' ? 'bg-[#D7FA3B] text-black font-bold' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Accepted
                  </button>
                  <button
                    onClick={() => setRequestFilter('rejected')}
                    className={`px-3 py-1.5 rounded-xl transition-colors ${
                      requestFilter === 'rejected' ? 'bg-[#D7FA3B] text-black font-bold' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Declined
                  </button>
                </div>
              </div>

              {/* Requests List */}
              {filteredRequests.length === 0 ? (
                <div className="p-12 text-center text-[#8C8C88] bg-black/40 rounded-2xl border border-white/5 space-y-2">
                  <Inbox className="w-8 h-8 text-[#8C8C88] mx-auto mb-2" />
                  <div className="font-display font-bold text-white text-base">No consultation requests in this view</div>
                  <p className="text-xs">Inbound patient requests booked through the public portal or patient enclave will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((req) => {
                    const isPending = req.status === 'pending';
                    const isAccepted = req.status === 'accepted' || req.status === 'confirmed';
                    const isRejected = req.status === 'rejected';

                    // Find corresponding patient object if exists
                    const patientObj = assignedPatients.find((p) => p.id === req.patientId);

                    return (
                      <div
                        key={req.id}
                        className="p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-display text-lg font-bold text-white">
                              {req.patientName}
                            </span>
                            <span className="text-xs font-mono text-[#D7FA3B]">
                              #{req.patientId}
                            </span>
                            <span className="text-xs font-mono text-white/60">
                              · Req ID: #{req.id.slice(-6)}
                            </span>

                            {/* Status Badges */}
                            {isPending && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                                ● Pending Your Triage Decision
                              </span>
                            )}
                            {isAccepted && (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#D7FA3B]/20 text-[#D7FA3B] font-mono text-[10px] font-bold border border-[#D7FA3B]/40">
                                ✓ Accepted &amp; Active
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px] font-bold border border-red-500/40">
                                ✕ Declined
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8C8C88]">
                            <span className="flex items-center gap-1.5 text-white/90">
                              <Calendar className="w-3.5 h-3.5 text-[#D7FA3B]" />
                              <span>{req.date} · {req.time}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{req.patientPhone}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              <span>{req.patientEmail}</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[10px] font-mono font-semibold border border-white/10">
                              Zero-Trust Teleconsult
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/90">
                            <span className="text-[#8C8C88] block text-[10px] uppercase font-mono mb-0.5">
                              Patient Reported Symptoms / Condition Notes:
                            </span>
                            {req.notes || 'Routine consultation and comprehensive medical review.'}
                          </div>

                          {isRejected && req.rejectionReason && (
                            <div className="text-xs text-red-300 font-mono">
                              Decline Justification: {req.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for Doctor */}
                        <div className="flex sm:flex-col lg:flex-row items-center gap-2.5 shrink-0">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleAcceptRequest(req)}
                                className="px-5 py-2.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                              >
                                <Check className="w-4 h-4" />
                                <span>Accept Request</span>
                              </button>

                              <button
                                onClick={() => setRejectionModalAppt(req)}
                                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-red-950/60 hover:text-red-300 text-white/80 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/10"
                              >
                                <X className="w-4 h-4" />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {isAccepted && (
                            <button
                              onClick={() => {
                                const targetPatient = patientObj || getRegisteredPatientById(req.patientId);
                                if (targetPatient) {
                                  setPortalTab('roster');
                                  setSelectedPatient(targetPatient);
                                }
                              }}
                              className="px-5 py-2.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                            >
                              <span>Open Patient Case</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW B: ASSIGNED PATIENTS ROSTER (Requirement 4) */}
        {portalTab === 'roster' && !selectedPatient && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-8 rounded-3xl bg-[#141416] border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-xs font-mono mb-2">
                    <Lock className="w-3 h-3" />
                    <span>Least-Privilege Routing · Active Patient Panel</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Assigned Patients Panel
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8C8C88] mt-1">
                    Select a patient from your verified queue to review their clinical records, reply to their messages, and compose e-prescriptions.
                  </p>
                </div>

                <div className="text-xs font-mono text-[#D7FA3B] px-3.5 py-1.5 rounded-full bg-black border border-white/10 shrink-0">
                  ● {assignedPatients.length} Active Consultations
                </div>
              </div>

              {assignedPatients.length === 0 ? (
                <div className="p-12 text-center text-[#8C8C88] bg-black/40 rounded-2xl border border-white/5 space-y-2">
                  <User className="w-8 h-8 text-[#8C8C88] mx-auto mb-2" />
                  <div className="font-display font-bold text-white text-base">No active patients in panel yet</div>
                  <p className="text-xs">Check the Appointment Requests tab to accept incoming patient requests.</p>
                </div>
              ) : (
                /* Patient Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {assignedPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-6 rounded-2xl bg-black/60 border border-white/10 hover:border-[#D7FA3B] transition-all flex flex-col justify-between group shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-[#D7FA3B]">
                            ID: #{patient.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
                            {patient.lastActive}
                          </span>
                        </div>

                        <h3 className="font-display text-xl font-bold text-white group-hover:text-[#D7FA3B] transition-colors mb-1">
                          {patient.name}
                        </h3>
                        <div className="text-xs text-[#8C8C88] mb-3">
                          {patient.age} yrs · {patient.gender} · {patient.city}
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/90 mb-4">
                          <span className="text-[#8C8C88] block text-[10px] uppercase font-mono mb-0.5">
                            Primary Clinical Indication:
                          </span>
                          {patient.condition}
                        </div>

                        {/* Vitals summary preview */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/5 text-center font-mono text-xs mb-5">
                          <div>
                            <div className="text-[10px] text-[#8C8C88]">HR</div>
                            <div className="font-bold text-white">{patient.vitals.hr}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#8C8C88]">BP</div>
                            <div className="font-bold text-white">{patient.vitals.bp}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#8C8C88]">SpO2</div>
                            <div className="font-bold text-[#D7FA3B]">{patient.vitals.spo2}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="w-full py-3 rounded-xl bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs tracking-tight transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md"
                      >
                        <span>Open Clinical Case</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 2: SELECTED PATIENT'S SPECIFIC WORKSPACE (Requirement 4) */}
        {portalTab === 'roster' && selectedPatient && (
          <div className="space-y-6 animate-fade-in">
            {/* Back Button & Patient Summary Header */}
            <div className="p-6 rounded-3xl bg-[#141416] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Patient List</span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl font-bold text-white">
                      {selectedPatient.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D7FA3B]/20 text-[#D7FA3B] font-mono text-[10px] font-bold">
                      ACTIVE CASE #{selectedPatient.id}
                    </span>
                  </div>
                  <div className="text-xs text-[#8C8C88] font-mono mt-0.5">
                    {selectedPatient.age} y/o {selectedPatient.gender} · {selectedPatient.phone} · {selectedPatient.city}
                  </div>
                </div>
              </div>

              {/* Workspace Navigation Pills & Conclude Care Action */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
                  <button
                    onClick={() => setWorkspaceTab('records')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      workspaceTab === 'records'
                        ? 'bg-[#D7FA3B] text-black shadow-md font-bold'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Records</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab('chat')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      workspaceTab === 'chat'
                        ? 'bg-[#D7FA3B] text-black shadow-md font-bold'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>E2E Chat</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab('prescribe')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      workspaceTab === 'prescribe'
                        ? 'bg-[#D7FA3B] text-black shadow-md font-bold'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Prescribe</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab('video')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      workspaceTab === 'video'
                        ? 'bg-[#D7FA3B] text-black shadow-md font-bold'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Room</span>
                  </button>
                </div>

                {/* MUTUAL CARE CONCLUSION / DISCHARGE BUTTON */}
                <button
                  onClick={() => setShowDischargeModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  title="Conclude active telemedicine care and issue mutual discharge summary"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                  <span>Conclude Care (Discharge)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: RECORDS & UPLOAD FEATURE (Requirement 7) */}
            {workspaceTab === 'records' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#141416] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-[#8C8C88]">
                      Select Patient Document:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {patientDocuments.map((doc, idx) => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocIndex(idx)}
                          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all max-w-[200px] truncate ${
                            selectedDocIndex === idx
                              ? 'bg-[#D7FA3B] text-black font-bold shadow-xs'
                              : 'bg-black/50 text-white/80 hover:bg-black'
                          }`}
                          title={doc.title}
                        >
                          {doc.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Upload Button (Requirement 7) */}
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#D7FA3B] hover:text-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>+ Upload Clinical Report / Scan</span>
                  </button>
                </div>

                {patientDocuments.length > 0 ? (
                  <BlackboxViewer
                    document={patientDocuments[selectedDocIndex] || patientDocuments[0]}
                    patientName={selectedPatient.name}
                    isDoctorView={true}
                  />
                ) : (
                  <div className="p-12 text-center text-[#8C8C88] bg-[#141416] rounded-3xl border border-white/10">
                    No clinical records uploaded for this patient yet. Use the upload button above.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: REAL CROSS-ROLE CHAT (Requirement 3: No auto replies, real reply sent by doctor) */}
            {workspaceTab === 'chat' && (
              <div className="p-6 rounded-3xl bg-[#141416] border border-white/10 shadow-xl flex flex-col h-[650px]">
                {/* Chat Top Info */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D7FA3B] text-black font-bold flex items-center justify-center font-display">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm text-white">
                        {selectedPatient.name}
                      </div>
                      <div className="text-[11px] text-[#8C8C88] font-mono">
                        Direct 1-to-1 Encrypted Channel · No automated bots
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-black text-[#D7FA3B] border border-white/10">
                    ● Live Telemetry Active
                  </span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-xs text-[#8C8C88]">
                      No messages exchanged with {selectedPatient.name} yet. Type a clinical message below.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.sender === 'doctor';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] text-[#8C8C88] font-mono mb-1 px-1">
                            {isMe ? 'You (Attending Physician)' : `${selectedPatient.name} (Patient)`}
                          </div>
                          <div
                            className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? 'bg-[#D7FA3B] text-black font-medium rounded-br-none shadow-md'
                                : 'bg-[#18181B] text-white rounded-bl-none border border-white/10'
                            }`}
                          >
                            <p>{msg.text}</p>
                          </div>
                          <div className="text-[10px] text-[#8C8C88] font-mono mt-1 px-1">
                            {msg.timestamp}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Doctor Reply Input */}
                <form
                  onSubmit={handleDoctorSendReply}
                  className="pt-3 border-t border-white/10 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type official clinical reply to ${selectedPatient.name}...`}
                    className="flex-1 px-4 py-3 rounded-full bg-black border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D7FA3B]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-[#D7FA3B] text-black font-bold text-xs hover:bg-[#cbf128] transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>Send Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: PRESCRIPTION COMPOSER */}
            {workspaceTab === 'prescribe' && (
              <div className="p-8 rounded-3xl bg-[#141416] border border-white/10 shadow-xl">
                <div className="flex items-center gap-2 mb-2 text-[#D7FA3B] text-xs font-mono uppercase">
                  <PlusCircle className="w-4 h-4" />
                  <span>Digital Prescription EDI Dispatch</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Compose Electronic Prescription for {selectedPatient.name}
                </h3>
                <p className="text-xs text-[#8C8C88] mb-6">
                  Seals directly to the patient's in-RAM Blackbox repository and transmits token to certified partner pharmacy.
                </p>

                {rxSuccessNotice && (
                  <div className="p-4 mb-6 rounded-2xl bg-[#D7FA3B]/20 border border-[#D7FA3B] text-[#D7FA3B] text-xs font-mono flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{rxSuccessNotice}</span>
                  </div>
                )}

                <form onSubmit={handleCreatePrescription} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                        Medication Name
                      </label>
                      <input
                        type="text"
                        required
                        value={rxDrugName}
                        onChange={(e) => setRxDrugName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                        Dosage / Form
                      </label>
                      <input
                        type="text"
                        required
                        value={rxDosage}
                        onChange={(e) => setRxDosage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                      Directions / SIG
                    </label>
                    <input
                      type="text"
                      required
                      value={rxSig}
                      onChange={(e) => setRxSig(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                        Refills Authorized
                      </label>
                      <select
                        value={rxRefills}
                        onChange={(e) => setRxRefills(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-[#D7FA3B]"
                      >
                        <option value="0">0 (Zero Refills)</option>
                        <option value="1">1 (One Refill)</option>
                        <option value="2">2 (Two Refills)</option>
                        <option value="3">3 (Three Refills)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                        Prescribing Clinician Key
                      </label>
                      <input
                        type="text"
                        disabled
                        value={`${doctorObj.name} · ${doctorObj.regNumber}`}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-[#8C8C88] text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8C8C88]">
                      Sealed with NMC digital certification
                    </span>

                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-bold text-xs tracking-tight transition-all active:scale-95 shadow-md flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Seal &amp; Render to Patient Blackbox</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: VIDEO CONSULT */}
            {workspaceTab === 'video' && (
              <div className="p-8 rounded-3xl bg-[#141416] border border-white/10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Launch WebRTC Clinical Room with {selectedPatient.name}
                </h3>
                <p className="text-xs text-[#8C8C88] max-w-md mx-auto mb-6">
                  DTLS-SRTP 256-bit peer-to-peer encrypted channel. Direct video consultation with live biometrics.
                </p>
                <button
                  onClick={() => {
                    setActionFeedbackToast(`Starting encrypted video consultation room for ${selectedPatient.name}...`);
                    setTimeout(() => setActionFeedbackToast(null), 4000);
                  }}
                  className="px-8 py-3.5 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-bold text-sm shadow-md"
                >
                  Start Clinical Video Stream
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Document Modal for Doctor */}
      {selectedPatient && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          uploaderRole="doctor"
          uploaderName={doctorObj.name}
          onDocumentUploaded={(newDoc) => {
            setPatientDocuments(getStoredClinicalDocuments(selectedPatient.id));
            setSelectedDocIndex(0);
          }}
        />
      )}
    </div>
  );
};
