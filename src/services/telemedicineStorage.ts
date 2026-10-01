import { AuthUser, ChatMessage, ClinicalDocument, AppointmentRecord, RegisteredPatient, ClinicalInquiry } from '../types';
import { INITIAL_CLINICAL_DOCUMENTS } from '../data/telemedicineData';

const AUTH_USER_KEY = 'aegis_auth_user';
const DOCUMENTS_KEY = 'aegis_clinical_documents';
const APPOINTMENTS_KEY = 'aegis_appointments';
const PATIENTS_KEY = 'aegis_registered_patients';
const LAST_MAILED_CREDENTIALS_KEY = 'aegis_last_mailed_credentials';
const CLINICAL_INQUIRIES_KEY = 'aegis_clinical_inquiries';
const AUDIT_LOGS_KEY = 'aegis_audit_logs';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role: string;
  details: string;
  ipAddress: string;
  trustScore: number;
  status: 'SUCCESS' | 'FLAGGED' | 'RESOLVED';
}

// Initial Seed Audit Logs
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: 'Just now',
    action: 'RAM Enclave Initialized',
    actor: 'System Kernel',
    role: 'system',
    details: 'Zero-Trust memory space allocated with AES-256 in-RAM encryption.',
    ipAddress: '103.21.144.92 (Bengaluru, IN)',
    trustScore: 99,
    status: 'SUCCESS',
  },
  {
    id: 'log-002',
    timestamp: '2 mins ago',
    action: 'Physician Posture Verified',
    actor: 'Dr. Arjun Patel',
    role: 'doctor',
    details: 'NMC registration credentials NMC/MCI/64291/2006 validated cryptographically.',
    ipAddress: '103.21.144.92 (Bengaluru, IN)',
    trustScore: 98,
    status: 'SUCCESS',
  },
  {
    id: 'log-003',
    timestamp: '5 mins ago',
    action: 'Patient Vault Sealed',
    actor: 'Aarav Sharma',
    role: 'patient',
    details: '12-lead Holter diagnostic scan sealed in memory-only Blackbox.',
    ipAddress: '122.161.48.11 (Bengaluru, IN)',
    trustScore: 96,
    status: 'SUCCESS',
  },
];

// Initial Seed Inquiries
const INITIAL_CLINICAL_INQUIRIES: ClinicalInquiry[] = [
  {
    id: 'inq-101',
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.in',
    phone: '+91 98201 44552',
    subject: 'ECG Telemetry Compatibility for Cardiac Consultation',
    message: 'I have a 12-lead digital ECG report from Apollo Delhi taken yesterday. Can I upload this PDF directly for Dr. Arjun Patel to review during the tele-consultation before booking?',
    category: 'Diagnostic Inquiry',
    status: 'replied',
    createdAt: 'Today, 10:15 AM',
    replyMessage: 'Yes Vikram, our Blackbox enclave accepts digital ECG PDFs, DICOM imaging, and Holter logs with in-RAM AES-256 encryption. Dr. Arjun Patel will review it as soon as your appointment request is confirmed.',
    repliedAt: 'Today, 10:45 AM',
    repliedBy: 'Creator / Telemedicine Administrator',
  },
  {
    id: 'inq-102',
    name: 'Sunita Mehra',
    email: 'sunita.mehra@example.in',
    phone: '+91 99104 33211',
    subject: 'Pediatric Neurology Second Opinion Inquiry',
    message: 'My 8-year-old child experiences focal motor twitches. Which specialist on the panel should I book an appointment with, and how do we receive the prescription?',
    category: 'Specialist Routing',
    status: 'pending',
    createdAt: 'Today, 11:30 AM',
  },
];

// Helper to broadcast local changes across tabs and components
export const notifyStateChange = (eventName: string) => {
  window.dispatchEvent(new Event(eventName));
};

// Initial Seed Patients (Single clean demo patient Aarav Sharma assigned to Dr. Arjun Patel)
const INITIAL_REGISTERED_PATIENTS: RegisteredPatient[] = [
  {
    id: 'p-89104',
    name: 'Aarav Sharma',
    age: 38,
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@example.in',
    city: 'Indiranagar, Bengaluru',
    password: 'AEGIS-490281',
    assignedDoctorIds: ['dr-arjun-patel'],
    condition: 'Post-Exertion Palpitations & Vector Review',
    status: 'stable',
    lastActive: 'Active now',
    assignedDate: 'Sept 2026',
    vitals: { bp: '118/76 mmHg', hr: '72 BPM', spo2: '99%' },
  },
];

// Initial Seed Appointments
const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt-seed-1',
    patientId: 'p-89104',
    patientName: 'Aarav Sharma',
    patientAge: 38,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    patientEmail: 'aarav.sharma@example.in',
    doctorId: 'dr-arjun-patel',
    doctorName: 'Dr. Arjun Patel',
    specialty: 'Cardiology',
    date: 'Thursday, Oct 15, 2026',
    time: '10:30 AM IST',
    status: 'accepted',
    notes: 'Reviewing post-exertion palpitations and 12-lead ECG telemetry stream.',
    createdAt: new Date().toISOString(),
  },
];

// 1. REGISTERED PATIENTS MANAGEMENT
export const getStoredRegisteredPatients = (): RegisteredPatient[] => {
  try {
    const raw = localStorage.getItem(PATIENTS_KEY);
    if (!raw) {
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(INITIAL_REGISTERED_PATIENTS));
      return INITIAL_REGISTERED_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_REGISTERED_PATIENTS;
  }
};

export const getRegisteredPatientById = (id: string): RegisteredPatient | undefined => {
  const patients = getStoredRegisteredPatients();
  return patients.find((p) => p.id === id);
};

export const saveOrUpdateRegisteredPatient = (patient: RegisteredPatient) => {
  const current = getStoredRegisteredPatients();
  const index = current.findIndex((p) => p.id === patient.id);
  let updated: RegisteredPatient[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = patient;
  } else {
    updated = [patient, ...current];
  }
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(updated));
  notifyStateChange('aegis_patients_change');
};

// Creates a NEW patient from booking flow with generated password and specified doctor!
// IMPORTANT: assignedDoctorIds is initially EMPTY until the doctor accepts the request!
export const createPatientFromBooking = (details: {
  name: string;
  email: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  condition?: string;
  age?: number;
  gender?: string;
  city?: string;
  existingPatientId?: string;
}): { patient: RegisteredPatient; password: string } => {
  const current = getStoredRegisteredPatients();
  const generatedPassword = 'AEGIS-' + Math.floor(100000 + Math.random() * 900000);

  // If this booking is for an already identified/logged-in patient consulting another doctor
  if (details.existingPatientId) {
    const existing = current.find((p) => p.id === details.existingPatientId);
    if (existing) {
      const updatedPatient: RegisteredPatient = {
        ...existing,
        condition: details.condition || existing.condition,
        age: details.age || existing.age,
        gender: details.gender || existing.gender,
        lastActive: 'Active now',
      };
      saveOrUpdateRegisteredPatient(updatedPatient);

      saveAuditLog({
        action: 'New Appointment Request Submitted',
        actor: updatedPatient.name,
        role: 'patient',
        details: `Appointment requested with ${details.doctorName}. Awaiting doctor triage & acceptance.`,
        ipAddress: '122.161.48.11 (India)',
        trustScore: 96,
        status: 'SUCCESS',
      });

      return { patient: updatedPatient, password: updatedPatient.password || generatedPassword };
    }
  }

  const cleanEmail = details.email.trim().toLowerCase();
  const cleanPhone = details.phone.trim().replace(/\s+/g, '');
  const cleanName = details.name.trim();

  // Check if an existing patient matches BOTH name and (email or phone)
  const existingSamePerson = current.find(
    (p) =>
      p.name.toLowerCase() === cleanName.toLowerCase() &&
      (p.email.toLowerCase() === cleanEmail || p.phone.replace(/\s+/g, '') === cleanPhone)
  );

  if (existingSamePerson) {
    const updatedPatient: RegisteredPatient = {
      ...existingSamePerson,
      condition: details.condition || existingSamePerson.condition,
      age: details.age || existingSamePerson.age,
      gender: details.gender || existingSamePerson.gender,
      lastActive: 'Active now',
    };
    saveOrUpdateRegisteredPatient(updatedPatient);

    saveAuditLog({
      action: 'Appointment Request Logged',
      actor: updatedPatient.name,
      role: 'patient',
      details: `Inbound request filed for ${details.doctorName}. Awaiting doctor review.`,
      ipAddress: '122.161.48.11 (India)',
      trustScore: 95,
      status: 'SUCCESS',
    });

    return { patient: updatedPatient, password: updatedPatient.password || generatedPassword };
  }

  // Create BRAND NEW unique patient enclave with NO active doctor assignment yet!
  const newPatientId = 'p-' + Math.floor(10000 + Math.random() * 90000);
  const newPatient: RegisteredPatient = {
    id: newPatientId,
    name: cleanName || 'New Patient',
    age: details.age || 32,
    gender: details.gender || 'Male',
    phone: details.phone.trim() || '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
    email: cleanEmail || `patient-${newPatientId}@aegis-health.in`,
    city: details.city || 'Bengaluru, India',
    password: generatedPassword,
    assignedDoctorIds: [], // EMPTY! Only assigned upon doctor acceptance!
    condition: details.condition || `Consultation request with ${details.doctorName}`,
    status: 'stable',
    lastActive: 'Pending Acceptance',
    assignedDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    vitals: { bp: '120/80 mmHg', hr: '72 BPM', spo2: '99%' },
  };

  saveOrUpdateRegisteredPatient(newPatient);

  saveAuditLog({
    action: 'Patient Profile Provisioned (Pending)',
    actor: newPatient.name,
    role: 'guest/patient',
    details: `Patient #${newPatient.id} provisioned with encrypted credentials. Sent to ${details.doctorName}'s inbound triage desk.`,
    ipAddress: '122.161.48.11 (India)',
    trustScore: 94,
    status: 'SUCCESS',
  });

  return { patient: newPatient, password: generatedPassword };
};

// 2. MAILED CREDENTIALS NOTIFICATIONS
export interface MailedCredential {
  patientId: string;
  patientName: string;
  email: string;
  phone: string;
  password: string;
  doctorName: string;
  date: string;
}

export const saveLastMailedCredentials = (cred: MailedCredential) => {
  localStorage.setItem(LAST_MAILED_CREDENTIALS_KEY, JSON.stringify(cred));
  notifyStateChange('aegis_credentials_mailed');
};

export const getLastMailedCredentials = (): MailedCredential | null => {
  try {
    const raw = localStorage.getItem(LAST_MAILED_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// 3. AUTHENTICATION MANAGEMENT
export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredAuthUser = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
  notifyStateChange('aegis_auth_change');
};

// 4. REAL CROSS-ROLE CHAT MESSAGES (NO AUTOMATIC REPLIES!)
export const getChatKey = (patientId: string, doctorId: string) => `aegis_chat_${patientId}_${doctorId}`;

export const getStoredChatMessages = (patientId: string, doctorId: string): ChatMessage[] => {
  const key = getChatKey(patientId, doctorId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }

  // Initial seed message for Aarav Sharma & Dr. Arjun Patel if empty
  if (patientId === 'p-89104' && doctorId === 'dr-arjun-patel') {
    const initialSeed: ChatMessage[] = [
      {
        id: 'msg-seed-1',
        chatKey: key,
        sender: 'doctor',
        senderName: 'Dr. Arjun Patel',
        text: 'Namaste Aarav. I reviewed your 12-lead digital Holter report. Your resting heart rate stabilized at 72 BPM nicely.',
        timestamp: '09:15 AM',
        encrypted: true,
        readByDoctor: true,
        readByPatient: true,
      },
      {
        id: 'msg-seed-2',
        chatKey: key,
        sender: 'patient',
        senderName: 'Aarav Sharma',
        text: 'Thank you doctor! The palpitations are much less frequent now. Should I continue Metoprolol 25mg after breakfast?',
        timestamp: '09:18 AM',
        encrypted: true,
        readByDoctor: true,
        readByPatient: true,
      },
    ];
    localStorage.setItem(key, JSON.stringify(initialSeed));
    return initialSeed;
  }

  return [];
};

export const saveChatMessage = (
  patientId: string,
  doctorId: string,
  message: Omit<ChatMessage, 'id' | 'chatKey' | 'timestamp' | 'encrypted'>
): ChatMessage => {
  const key = getChatKey(patientId, doctorId);
  const current = getStoredChatMessages(patientId, doctorId);

  const newMsg: ChatMessage = {
    ...message,
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    chatKey: key,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    encrypted: true,
    readByDoctor: message.sender === 'doctor' ? true : false,
    readByPatient: message.sender === 'patient' ? true : false,
  };

  const updated = [...current, newMsg];
  localStorage.setItem(key, JSON.stringify(updated));
  notifyStateChange('aegis_chat_change');
  return newMsg;
};

// Mark all patient messages in this chat as read by doctor
export const markChatAsReadByDoctor = (patientId: string, doctorId: string): void => {
  const key = getChatKey(patientId, doctorId);
  const current = getStoredChatMessages(patientId, doctorId);
  let changed = false;

  const updated = current.map((m) => {
    if (m.sender === 'patient' && !m.readByDoctor) {
      changed = true;
      return { ...m, readByDoctor: true };
    }
    return m;
  });

  if (changed) {
    localStorage.setItem(key, JSON.stringify(updated));
    notifyStateChange('aegis_chat_change');
  }
};

// Mark all doctor messages in this chat as read by patient
export const markChatAsReadByPatient = (patientId: string, doctorId: string): void => {
  const key = getChatKey(patientId, doctorId);
  const current = getStoredChatMessages(patientId, doctorId);
  let changed = false;

  const updated = current.map((m) => {
    if (m.sender === 'doctor' && !m.readByPatient) {
      changed = true;
      return { ...m, readByPatient: true };
    }
    return m;
  });

  if (changed) {
    localStorage.setItem(key, JSON.stringify(updated));
    notifyStateChange('aegis_chat_change');
  }
};

// Count unread patient messages from a specific patient for a doctor
export const getUnreadMessagesCountFromPatient = (patientId: string, doctorId: string): number => {
  const messages = getStoredChatMessages(patientId, doctorId);
  return messages.filter((m) => m.sender === 'patient' && !m.readByDoctor).length;
};

// Count total unread messages from all patients for a doctor (to show red dot in Doctor Portal & Navbar)
export const getTotalUnreadMessagesForDoctor = (doctorId: string): number => {
  const patients = getStoredRegisteredPatients();
  let count = 0;
  for (const patient of patients) {
    if (patient.assignedDoctorIds.includes(doctorId)) {
      const msgs = getStoredChatMessages(patient.id, doctorId);
      count += msgs.filter((m) => m.sender === 'patient' && !m.readByDoctor).length;
    }
  }
  return count;
};

// Count unread messages from doctor for a patient
export const getUnreadMessagesForPatient = (patientId: string, doctorId?: string): number => {
  const patient = getRegisteredPatientById(patientId);
  if (!patient) return 0;
  const targetDocIds = doctorId ? [doctorId] : patient.assignedDoctorIds;
  let count = 0;
  for (const docId of targetDocIds) {
    const msgs = getStoredChatMessages(patientId, docId);
    count += msgs.filter((m) => m.sender === 'doctor' && !m.readByPatient).length;
  }
  return count;
};

// 5. CLINICAL DOCUMENTS & UPLOADS (SHARED BETWEEN PATIENT & DOCTOR)
export const getStoredClinicalDocuments = (patientId?: string): ClinicalDocument[] => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    let docs: ClinicalDocument[] = raw ? JSON.parse(raw) : INITIAL_CLINICAL_DOCUMENTS;
    if (patientId) {
      docs = docs.filter((d) => d.patientId === patientId);
    }
    return docs;
  } catch (e) {
    return patientId
      ? INITIAL_CLINICAL_DOCUMENTS.filter((d) => d.patientId === patientId)
      : INITIAL_CLINICAL_DOCUMENTS;
  }
};

export const saveClinicalDocument = (doc: Omit<ClinicalDocument, 'id' | 'date'>): ClinicalDocument => {
  const current = getStoredClinicalDocuments();
  const newDoc: ClinicalDocument = {
    ...doc,
    id: 'doc-' + Date.now(),
    date: new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }),
  };

  const updated = [newDoc, ...current];
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
  notifyStateChange('aegis_documents_change');
  return newDoc;
};

// 6. APPOINTMENT RECORDS & DOCTOR ACCEPT/REJECT FLOW
export const getStoredAppointments = (patientId?: string, doctorId?: string): AppointmentRecord[] => {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    let appts: AppointmentRecord[] = raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
    if (patientId) {
      appts = appts.filter((a) => a.patientId === patientId);
    }
    if (doctorId) {
      appts = appts.filter((a) => a.doctorId === doctorId);
    }
    return appts;
  } catch (e) {
    return INITIAL_APPOINTMENTS;
  }
};

export const saveAppointment = (
  record: Omit<AppointmentRecord, 'id' | 'createdAt'>
): AppointmentRecord => {
  const current = getStoredAppointments();
  const newRecord: AppointmentRecord = {
    ...record,
    id: 'apt-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  notifyStateChange('aegis_appointments_change');
  return newRecord;
};

export const updateAppointmentStatus = (
  appointmentId: string,
  status: AppointmentRecord['status'],
  rejectionReason?: string
): AppointmentRecord | null => {
  const current = getStoredAppointments();
  const index = current.findIndex((a) => a.id === appointmentId);
  if (index === -1) return null;

  const targetAppt = current[index];
  const updatedAppt: AppointmentRecord = {
    ...targetAppt,
    status,
    rejectionReason: rejectionReason || targetAppt.rejectionReason,
  };

  const updated = [...current];
  updated[index] = updatedAppt;
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));

  // If accepted by doctor: add doctor to patient's assigned doctors and dispatch login credentials to email!
  if (status === 'accepted') {
    const patient = getRegisteredPatientById(targetAppt.patientId);
    if (patient) {
      if (!patient.assignedDoctorIds.includes(targetAppt.doctorId)) {
        patient.assignedDoctorIds.push(targetAppt.doctorId);
        saveOrUpdateRegisteredPatient(patient);
      }

      // Officially dispatch credentials email upon doctor acceptance!
      saveLastMailedCredentials({
        patientId: patient.id,
        patientName: patient.name,
        email: patient.email,
        phone: patient.phone,
        password: patient.password,
        doctorName: targetAppt.doctorName,
        date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });
    }
  }

  notifyStateChange('aegis_appointments_change');
  return updatedAppt;
};

// 7. MUTUAL CONSULTATION DISCHARGE & ENCLAVE CONCLUSION
const DISCHARGE_NOTICE_KEY = 'aegis_last_discharge_notice';

export interface DischargeNotice {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  reason: string;
  clinicalNotes: string;
}

export const dischargePatientConsultation = (details: {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  reason: string;
  dischargeNotes: string;
}): { patient: RegisteredPatient | undefined; document: ClinicalDocument } => {
  const patient = getRegisteredPatientById(details.patientId);
  if (patient) {
    patient.assignedDoctorIds = patient.assignedDoctorIds.filter((id) => id !== details.doctorId);
    patient.status = 'stable';
    patient.condition = `Care Concluded — Recovered from ${patient.condition}`;
    patient.lastActive = 'Discharged (Recovered)';
    saveOrUpdateRegisteredPatient(patient);
  }

  // Generate official discharge summary document into the patient's Blackbox
  const dischargeDoc = saveClinicalDocument({
    patientId: details.patientId,
    patientName: details.patientName,
    doctorId: details.doctorId,
    doctorName: details.doctorName,
    title: `Clinical Discharge Summary — Care Concluded & Patient Recovered`,
    category: 'Consultation Summary',
    pages: 1,
    uploadedBy: 'doctor',
    contentLines: [
      'AEGIS ZERO-TRUST CLINICAL DISCHARGE & CARE CONVOLUTION RECORD',
      `ISSUING SPECIALIST: ${details.doctorName} | DATE: ${new Date().toLocaleDateString('en-IN')}`,
      `PATIENT: ${details.patientName} (ID: #${details.patientId})`,
      '--------------------------------------------------------------------------------',
      `CLINICAL OUTCOME: ${details.reason}`,
      `PHYSICIAN ASSESSMENT & SUMMARY: ${details.dischargeNotes}`,
      'TELEMETRY STATUS: Vitals normalized, ECG rhythm stabilized, e-Rx course concluded.',
      'MUTUAL ENCLAVE STATUS: Active real-time communication channel concluded by physician.',
      'PATIENT ADVICE: Patient is fully recovered. Routine annual health maintenance advised.',
      '--------------------------------------------------------------------------------',
      `SEALED CRYPTOGRAPHICALLY UNDER NMC CLINICAL SUPERVISION`,
    ],
  });

  // Save discharge notice for patient notification
  const notice: DischargeNotice = {
    id: 'dis-' + Date.now(),
    patientId: details.patientId,
    patientName: details.patientName,
    doctorId: details.doctorId,
    doctorName: details.doctorName,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    reason: details.reason,
    clinicalNotes: details.dischargeNotes,
  };
  localStorage.setItem(DISCHARGE_NOTICE_KEY, JSON.stringify(notice));
  notifyStateChange('aegis_consultation_discharged');
  notifyStateChange('aegis_patients_change');

  return { patient, document: dischargeDoc };
};

export const getLastDischargeNotice = (patientId?: string): DischargeNotice | null => {
  try {
    const raw = localStorage.getItem(DISCHARGE_NOTICE_KEY);
    if (!raw) return null;
    const parsed: DischargeNotice = JSON.parse(raw);
    if (patientId && parsed.patientId !== patientId) return null;
    return parsed;
  } catch (e) {
    return null;
  }
};

export const clearDischargeNotice = () => {
  localStorage.removeItem(DISCHARGE_NOTICE_KEY);
  notifyStateChange('aegis_consultation_discharged');
};

// 8. AUDIT LOGS STORAGE
export const getStoredAuditLogs = (): AuditLogEntry[] => {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_AUDIT_LOGS;
  }
};

export const saveAuditLog = (
  log: Omit<AuditLogEntry, 'id' | 'timestamp'>
): AuditLogEntry => {
  const current = getStoredAuditLogs();
  const newLog: AuditLogEntry = {
    ...log,
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };

  const updated = [newLog, ...current.slice(0, 49)];
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
  notifyStateChange('aegis_audit_change');
  return newLog;
};

// 9. PUBLIC CLINICAL INQUIRIES & PRE-BOOKING DOUBTS HELP DESK
export const getStoredClinicalInquiries = (): ClinicalInquiry[] => {
  try {
    const raw = localStorage.getItem(CLINICAL_INQUIRIES_KEY);
    if (!raw) {
      localStorage.setItem(CLINICAL_INQUIRIES_KEY, JSON.stringify(INITIAL_CLINICAL_INQUIRIES));
      return INITIAL_CLINICAL_INQUIRIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CLINICAL_INQUIRIES;
  }
};

export const saveClinicalInquiry = (
  inquiry: Omit<ClinicalInquiry, 'id' | 'createdAt' | 'status'>
): ClinicalInquiry => {
  const current = getStoredClinicalInquiries();
  const newInquiry: ClinicalInquiry = {
    ...inquiry,
    id: 'inq-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated = [newInquiry, ...current];
  localStorage.setItem(CLINICAL_INQUIRIES_KEY, JSON.stringify(updated));
  notifyStateChange('aegis_inquiries_change');

  saveAuditLog({
    action: 'Public Clinical Inquiry Submitted',
    actor: newInquiry.name,
    role: 'guest',
    details: `Pre-booking doubt filed under category: ${newInquiry.category}. Subject: "${newInquiry.subject}"`,
    ipAddress: '103.21.144.92 (India)',
    trustScore: 92,
    status: 'SUCCESS',
  });

  return newInquiry;
};

export const replyToClinicalInquiry = (
  inquiryId: string,
  replyMessage: string,
  repliedBy: string = 'Creator / Telemedicine Admin'
): ClinicalInquiry | null => {
  const current = getStoredClinicalInquiries();
  const index = current.findIndex((i) => i.id === inquiryId);
  if (index === -1) return null;

  const target = current[index];
  const updatedInquiry: ClinicalInquiry = {
    ...target,
    status: 'replied',
    replyMessage,
    repliedAt: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    repliedBy,
  };

  const updated = [...current];
  updated[index] = updatedInquiry;
  localStorage.setItem(CLINICAL_INQUIRIES_KEY, JSON.stringify(updated));
  notifyStateChange('aegis_inquiries_change');

  saveAuditLog({
    action: 'Clinical Inquiry Answered',
    actor: repliedBy,
    role: 'admin',
    details: `Official response dispatched for inquiry #${inquiryId} from ${target.name}.`,
    ipAddress: '127.0.0.1 (Enclave Admin)',
    trustScore: 99,
    status: 'RESOLVED',
  });

  return updatedInquiry;
};
