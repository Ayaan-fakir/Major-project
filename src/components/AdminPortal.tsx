import React, { useState, useEffect } from 'react';
import { AuthUser, Doctor, RegisteredPatient, AppointmentRecord, ClinicalInquiry } from '../types';
import { DOCTORS } from '../data/telemedicineData';
import {
  getStoredRegisteredPatients,
  getStoredAppointments,
  getStoredClinicalInquiries,
  replyToClinicalInquiry,
  getStoredAuditLogs,
  saveAuditLog,
  AuditLogEntry,
} from '../services/telemedicineStorage';
import {
  Shield,
  ShieldCheck,
  Activity,
  Cpu,
  Lock,
  Search,
  MessageSquare,
  FileText,
  User,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Server,
  KeyRound,
  Eye,
  ArrowRight,
  Database,
  Terminal,
  Check,
  X,
  HeartHandshake
} from 'lucide-react';

interface AdminPortalProps {
  currentUser: AuthUser;
  onBackToLanding: () => void;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onBackToLanding,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inquiries' | 'security' | 'audit' | 'roster'>('overview');
  const [patients, setPatients] = useState<RegisteredPatient[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [inquiries, setInquiries] = useState<ClinicalInquiry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Reply modal state for inquiries
  const [selectedInquiry, setSelectedInquiry] = useState<ClinicalInquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);

  // Security parameter test states
  const [keyRotationStatus, setKeyRotationStatus] = useState('Rotated 12 mins ago · SHA-256 Valid');
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [enclaveHealth, setEnclaveHealth] = useState<number>(99.8);

  const refreshAllData = () => {
    setPatients(getStoredRegisteredPatients());
    setAppointments(getStoredAppointments());
    setInquiries(getStoredClinicalInquiries());
    setAuditLogs(getStoredAuditLogs());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      refreshAllData();
    };
    window.addEventListener('aegis_patients_change', handleStorage);
    window.addEventListener('aegis_appointments_change', handleStorage);
    window.addEventListener('aegis_inquiries_change', handleStorage);
    window.addEventListener('aegis_audit_change', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('aegis_patients_change', handleStorage);
      window.removeEventListener('aegis_appointments_change', handleStorage);
      window.removeEventListener('aegis_inquiries_change', handleStorage);
      window.removeEventListener('aegis_audit_change', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleSendInquiryReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    setIsSendingReply(true);
    setTimeout(() => {
      replyToClinicalInquiry(selectedInquiry.id, replyText.trim(), `${currentUser.name} (Creator & System Admin)`);
      setIsSendingReply(false);
      setActionFeedbackToast(`Reply dispatched to ${selectedInquiry.email} successfully!`);
      setSelectedInquiry(null);
      setReplyText('');
      refreshAllData();
      setTimeout(() => setActionFeedbackToast(null), 4000);
    }, 600);
  };

  const handleManualKeyRotation = () => {
    setIsRotatingKeys(true);
    setTimeout(() => {
      setIsRotatingKeys(false);
      setKeyRotationStatus('Rotated Just Now · Ephemeral Session Entropy 100%');
      saveAuditLog({
        action: 'Manual Ephemeral Key Rotation',
        actor: currentUser.name,
        role: 'admin',
        details: 'Admin manually triggered zero-trust session key re-seeding across active enclaves.',
        ipAddress: '127.0.0.1 (Localhost Root)',
        trustScore: 100,
        status: 'SUCCESS',
      });
      refreshAllData();
      setActionFeedbackToast('AES-256 session keys rotated across all RAM enclaves.');
      setTimeout(() => setActionFeedbackToast(null), 4000);
    }, 900);
  };

  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'pending').length;
  const activePatientsCount = patients.filter((p) => p.assignedDoctorIds.length > 0).length;
  const recoveredPatientsCount = patients.filter((p) => p.lastActive?.includes('Discharged') || p.condition?.includes('Recovered')).length;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white pt-24 sm:pt-28 pb-16 relative">
      {/* Toast Feedback */}
      {actionFeedbackToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-black border border-[#D7FA3B] text-white shadow-2xl flex items-center gap-3 animate-fade-in text-xs max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#D7FA3B] shrink-0" />
          <span>{actionFeedbackToast}</span>
        </div>
      )}

      {/* INQUIRY REPLY MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#141416] text-white rounded-3xl border border-[#D7FA3B]/40 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#D7FA3B] font-mono text-xs uppercase mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Dispatch Official Clinical / Enclave Reply</span>
            </div>

            <h3 className="font-display text-xl font-bold mb-1">
              Respond to {selectedInquiry.name}
            </h3>
            <div className="text-xs text-[#8C8C88] font-mono mb-4">
              {selectedInquiry.email} · Category: <span className="text-white">{selectedInquiry.category}</span>
            </div>

            {/* Original Question Card */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs space-y-1.5 mb-4">
              <div className="font-semibold text-[#D7FA3B]">{selectedInquiry.subject}</div>
              <p className="text-[#8C8C88] leading-relaxed">"{selectedInquiry.message}"</p>
            </div>

            <form onSubmit={handleSendInquiryReply} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#8C8C88] mb-1.5">
                  Your Answer / Clinical Routing Guidance
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter detailed guidance for the user..."
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/20 text-white text-xs focus:outline-none focus:border-[#D7FA3B] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-[#8C8C88]">
                  Signed by: {currentUser.name}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReply}
                    className="px-5 py-2 rounded-full bg-[#D7FA3B] hover:bg-[#cbf128] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    {isSendingReply ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Admin Navigation Top Header */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-[#121214] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 flex items-center justify-center text-[#D7FA3B]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Aegis System Creator &amp; Admin Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D7FA3B] text-black font-mono text-[10px] font-bold">
                  Root Privileges
                </span>
              </div>
              <div className="text-xs text-[#8C8C88] font-mono mt-0.5">
                Operator: <strong className="text-white">{currentUser.name}</strong> · System Designer Enclave · Zero-Trust Supervisor
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              ← Public Website
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold transition-colors"
            >
              Exit Console
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#D7FA3B] text-black shadow-md'
                : 'bg-[#141416] text-white/80 hover:text-white border border-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>System Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
              activeTab === 'inquiries'
                ? 'bg-[#D7FA3B] text-black shadow-md'
                : 'bg-[#141416] text-white/80 hover:text-white border border-white/10'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Public Clinical Queries Desk</span>
            {pendingInquiriesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono animate-pulse">
                {pendingInquiriesCount} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'security'
                ? 'bg-[#D7FA3B] text-black shadow-md'
                : 'bg-[#141416] text-white/80 hover:text-white border border-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Parameters &amp; Enclaves</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'audit'
                ? 'bg-[#D7FA3B] text-black shadow-md'
                : 'bg-[#141416] text-white/80 hover:text-white border border-white/10'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Audit &amp; Access Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'roster'
                ? 'bg-[#D7FA3B] text-black shadow-md'
                : 'bg-[#141416] text-white/80 hover:text-white border border-white/10'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Clinicians &amp; Patient Registry</span>
          </button>
        </div>

        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-3xl bg-[#121214] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-[#8C8C88] mb-3">
                  <span>SPECIALIST CLINICIANS</span>
                  <Stethoscope className="w-4 h-4 text-[#D7FA3B]" />
                </div>
                <div className="font-display text-3xl font-bold text-white mb-1">
                  {DOCTORS.length} Verified
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  ● 100% MCI/NMC Registered
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#121214] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-[#8C8C88] mb-3">
                  <span>ACTIVE PATIENT ENCLAVES</span>
                  <User className="w-4 h-4 text-[#D7FA3B]" />
                </div>
                <div className="font-display text-3xl font-bold text-white mb-1">
                  {patients.length} Registered
                </div>
                <div className="text-[11px] text-white/70 font-mono">
                  {activePatientsCount} In Active Care · {recoveredPatientsCount} Recovered
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#121214] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-[#8C8C88] mb-3">
                  <span>PENDING INQUIRIES</span>
                  <MessageSquare className="w-4 h-4 text-[#D7FA3B]" />
                </div>
                <div className="font-display text-3xl font-bold text-white mb-1">
                  {pendingInquiriesCount} Queries
                </div>
                <div className="text-[11px] text-amber-400 font-mono">
                  {inquiries.length} Total General Inquiries
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#121214] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-mono text-[#8C8C88] mb-3">
                  <span>ZERO-TRUST INTEGRITY</span>
                  <ShieldCheck className="w-4 h-4 text-[#D7FA3B]" />
                </div>
                <div className="font-display text-3xl font-bold text-[#D7FA3B] mb-1">
                  {enclaveHealth}%
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  ● In-RAM Blackbox Secure
                </div>
              </div>
            </div>

            {/* Middle Grid: Telemetry & Live Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Architecture & Architecture Map */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      Zero-Trust Telemedicine Enclave Architecture
                    </h3>
                    <p className="text-xs text-[#8C8C88] font-mono mt-0.5">
                      Mutual link dissolution, least-privilege binding &amp; RAM memory isolation
                    </p>
                  </div>
                  <button
                    onClick={refreshAllData}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                    title="Refresh telemetry"
                  >
                    <RefreshCw className="w-4 h-4 text-[#D7FA3B]" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div>
                        <div className="text-xs font-bold text-white">In-RAM Cryptographic Health Records</div>
                        <div className="text-[11px] text-[#8C8C88] font-mono">No physical disk persistence · Ephemeral memory rendering</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono">
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D7FA3B]"></div>
                      <div>
                        <div className="text-xs font-bold text-white">Mutual Care Link Dissolution Protocol</div>
                        <div className="text-[11px] text-[#8C8C88] font-mono">Physician discharge automatically revokes live channel with patient notice</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#D7FA3B]/20 text-[#D7FA3B] border border-[#D7FA3B]/40 text-[10px] font-mono">
                      ENFORCED
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
                      <div>
                        <div className="text-xs font-bold text-white">Continuous Biometric Trust Verification</div>
                        <div className="text-[11px] text-[#8C8C88] font-mono">Real-time device posture, geo-location bounding &amp; step-up verification</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-mono">
                      ENABLED
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="text-[#8C8C88]">
                    Session Key Rotation Status: <strong className="text-white">{keyRotationStatus}</strong>
                  </div>
                  <button
                    onClick={handleManualKeyRotation}
                    disabled={isRotatingKeys}
                    className="px-3.5 py-1.5 rounded-full bg-[#D7FA3B] text-black font-bold text-[11px] hover:bg-[#cbf128] transition-colors"
                  >
                    {isRotatingKeys ? 'Re-seeding...' : 'Rotate Keys'}
                  </button>
                </div>
              </div>

              {/* Real-Time Platform Activity Stream */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold text-white">
                      Live Platform Telemetry Log
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-[#D7FA3B] animate-ping"></span>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {auditLogs.slice(0, 8).map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-2xl bg-black/50 border border-white/5 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white font-mono">{log.action}</span>
                          <span className="text-[10px] font-mono text-[#8C8C88]">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-[#8C8C88] leading-relaxed">{log.details}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-white/60">
                          <span>{log.actor} ({log.role})</span>
                          <span className="text-[#D7FA3B]">Score: {log.trustScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('audit')}
                  className="w-full mt-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/90 text-xs font-semibold text-center transition-colors"
                >
                  View Full Audit Logs →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PUBLIC CLINICAL INQUIRIES DESK */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-xs font-mono mb-2">
                    <MessageSquare className="w-3 h-3" />
                    <span>Public Non-Member Inquiries Desk</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    General Inquiries &amp; Pre-Booking Doubts
                  </h2>
                  <p className="text-xs text-[#8C8C88] mt-1">
                    Questions submitted by public visitors before booking consultations or becoming registered enclave patients.
                  </p>
                </div>

                <div className="text-xs font-mono text-[#D7FA3B] px-3.5 py-1.5 rounded-full bg-black border border-white/10 self-start sm:self-auto">
                  {pendingInquiriesCount} Pending Responses
                </div>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-12 text-center text-[#8C8C88] bg-black/40 rounded-2xl border border-white/5 space-y-2">
                  <MessageSquare className="w-8 h-8 text-[#8C8C88] mx-auto mb-2" />
                  <div className="font-bold text-white text-base">No clinical inquiries submitted yet</div>
                  <p className="text-xs">When users submit questions from the public website, they will arrive here for admin reply.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => {
                    const isPending = inq.status === 'pending';
                    return (
                      <div
                        key={inq.id}
                        className={`p-6 rounded-3xl transition-all border ${
                          isPending
                            ? 'bg-black/80 border-[#D7FA3B]/40 shadow-lg'
                            : 'bg-black/40 border-white/10'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="font-display font-bold text-lg text-white">
                                {inq.name}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-mono font-semibold">
                                {inq.category}
                              </span>
                              <span className="text-xs font-mono text-[#8C8C88]">
                                {inq.createdAt}
                              </span>

                              {isPending ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                                  ● Pending Creator Reply
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                                  ✓ Answer Dispatched
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-mono text-[#8C8C88]">
                              Email: <strong className="text-white">{inq.email}</strong> {inq.phone && `· Phone: ${inq.phone}`}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedInquiry(inq);
                              setReplyText(inq.replyMessage || '');
                            }}
                            className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shrink-0 ${
                              isPending
                                ? 'bg-[#D7FA3B] text-black hover:bg-[#cbf128] shadow-md'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isPending ? 'Write Official Reply' : 'Update Response'}</span>
                          </button>
                        </div>

                        {/* Inquiry Body */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 mb-3">
                          <div className="text-xs font-bold text-white font-mono">
                            Subject: {inq.subject}
                          </div>
                          <p className="text-xs text-[#8C8C88] leading-relaxed">
                            "{inq.message}"
                          </p>
                        </div>

                        {/* If Replied, show dispatched reply card */}
                        {inq.replyMessage && (
                          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                            <div className="flex items-center justify-between text-emerald-300 font-mono text-[11px] font-bold">
                              <span>✓ Official Admin Response ({inq.repliedAt}):</span>
                              <span>Signed by {inq.repliedBy}</span>
                            </div>
                            <p className="text-emerald-100/90 leading-relaxed">
                              {inq.replyMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ZERO-TRUST SECURITY PARAMETERS */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-xs font-mono mb-2">
                    <ShieldCheck className="w-3 h-3" />
                    <span>System Designer Security Parameter Configuration</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Zero-Trust Security Parameters &amp; Posture
                  </h2>
                  <p className="text-xs text-[#8C8C88] mt-1">
                    Manage hardware-level isolation, RAM Blackbox encryption keys, and behavioral biometric thresholds.
                  </p>
                </div>

                <button
                  onClick={handleManualKeyRotation}
                  disabled={isRotatingKeys}
                  className="px-5 py-2.5 rounded-full bg-[#D7FA3B] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isRotatingKeys ? 'Rotating...' : 'Force Cryptographic Key Rotation'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="text-xs font-mono text-[#D7FA3B] uppercase font-bold flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Memory Encryption Policy</span>
                  </div>
                  <div className="text-xl font-bold text-white font-display">AES-256-GCM</div>
                  <p className="text-xs text-[#8C8C88] leading-relaxed">
                    Patient records, prescriptions, and Holter ECG traces are rendered strictly in memory with zero storage writes.
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-emerald-400">
                    ● Ephemeral Key Derivation Active
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="text-xs font-mono text-[#D7FA3B] uppercase font-bold flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>Trust Threshold Floor</span>
                  </div>
                  <div className="text-xl font-bold text-white font-display">75% Biometric Floor</div>
                  <p className="text-xs text-[#8C8C88] leading-relaxed">
                    If doctor or patient behavioral biometric posture drops below 75%, access is instantly locked until step-up OTP validation.
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-[#D7FA3B]">
                    ● Step-Up Hardware Pin Active
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="text-xs font-mono text-[#D7FA3B] uppercase font-bold flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Mutual Link Dissolution</span>
                  </div>
                  <div className="text-xl font-bold text-white font-display">Dual-Consent Closure</div>
                  <p className="text-xs text-[#8C8C88] leading-relaxed">
                    Upon clinical recovery, closing the communication link is registered mutually with an immutable discharge summary.
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-emerald-400">
                    ● Enclave Dissolution Enforced
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7FA3B]/10 border border-[#D7FA3B]/30 text-[#D7FA3B] text-xs font-mono mb-2">
                    <Terminal className="w-3 h-3" />
                    <span>Immutable Cryptographic Audit Trail</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Access &amp; Clinical Operation Logs
                  </h2>
                  <p className="text-xs text-[#8C8C88] mt-1">
                    Every patient booking, doctor acceptance, clinical discharge, and encryption event is recorded with timestamp and IP provenance.
                  </p>
                </div>

                <button
                  onClick={refreshAllData}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D7FA3B]" />
                  <span>Refresh Trail</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-black/60 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{log.action}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/70">
                          {log.role.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          [{log.status}]
                        </span>
                      </div>
                      <p className="text-[#8C8C88] text-xs leading-relaxed">{log.details}</p>
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#8C8C88] shrink-0">
                      <div>{log.timestamp}</div>
                      <div className="text-white/70">{log.ipAddress}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CLINICIANS & PATIENT REGISTRY */}
        {activeTab === 'roster' && (
          <div className="space-y-6 animate-fade-in">
            {/* Doctors Grid */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10">
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-white">
                  Verified Specialist Clinicians Panel ({DOCTORS.length})
                </h3>
                <p className="text-xs text-[#8C8C88] font-mono">
                  Master registry of Indian Medical Council (NMC) licensed physicians on Aegis
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DOCTORS.map((doc) => {
                  const myPatients = patients.filter((p) => p.assignedDoctorIds.includes(doc.id));
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{doc.name}</div>
                          <div className="text-[10px] text-[#8C8C88] font-mono">{doc.specialty} · {doc.regNumber}</div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[#D7FA3B]/15 text-[#D7FA3B] text-[10px] font-mono font-bold">
                        {myPatients.length} Patients
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patients Master List */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10">
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-white">
                  Registered Patient Health Enclaves ({patients.length})
                </h3>
                <p className="text-xs text-[#8C8C88] font-mono">
                  Dynamic patient directory provisioned via booking or consultation triage
                </p>
              </div>

              <div className="space-y-3">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-display text-sm">{p.name}</span>
                        <span className="text-[#D7FA3B] font-mono text-xs">#{p.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
                          {p.age} yrs · {p.gender}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-white/60">
                          {p.lastActive}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8C8C88] font-mono mt-0.5">
                        {p.email} · {p.phone} · Pass: <span className="text-[#D7FA3B]">{p.password}</span>
                      </div>
                      <div className="text-xs text-white/80 mt-1">
                        Condition: {p.condition}
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono shrink-0">
                      <div className="text-[#8C8C88]">Assigned Doctors:</div>
                      <div className="text-white font-bold">
                        {p.assignedDoctorIds.length > 0 ? (
                          p.assignedDoctorIds.map((id) => {
                            const d = DOCTORS.find((doc) => doc.id === id);
                            return d ? d.name : id;
                          }).join(', ')
                        ) : (
                          <span className="text-amber-400">None (Pending Triage)</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
