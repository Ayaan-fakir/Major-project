import { AuthUser, ChatMessage, ClinicalDocument, AppointmentRecord, RegisteredPatient } from '../types';
import { INITIAL_CLINICAL_DOCUMENTS } from '../data/telemedicineData';

const AUTH_USER_KEY = 'aegis_auth_user';
const DOCUMENTS_KEY = 'aegis_clinical_documents';
const APPOINTMENTS_KEY = 'aegis_appointments';
const PATIENTS_KEY = 'aegis_registered_patients';
const LAST_MAILED_CREDENTIALS_KEY = 'aegis_last_mailed_credentials';

// Helper to broadcast local changes across tabs and components
export const notifyStateChange = (eventName: string) => {
  window.dispatchEvent(new Event(eventName));
};

// Initial Seed Patients
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
    assignedDoctorIds: ['dr-arjun-patel', 'dr-priya-sharma'],
    condition: 'Post-Exertion Palpitations & Vector Review',
    status: 'stable',
    lastActive: 'Active now',
    assignedDate: 'Sept 2026',
    vitals: { bp: '118/76 mmHg', hr: '72 BPM', spo2: '99%' },
  },
  {
    id: 'p-77219',
    name: 'Rajiv Sengupta',
    age: 54,
    gender: 'Male',
    phone: '+91 98200 44112',
    email: 'rajiv.sengupta@example.in',
    city: 'Bandra West, Mumbai',
    password: 'AEGIS-881920',
    assignedDoctorIds: ['dr-arjun-patel'],
    condition: 'Post-Angioplasty Stent Follow-Up',
    status: 'monitoring',
    lastActive: '45m ago',
    assignedDate: 'Aug 2026',
    vitals: { bp: '128/82 mmHg', hr: '78 BPM', spo2: '98%' },
  },
  {
    id: 'p-64102',
    name: 'Sneha Deshmukh',
    age: 42,
    gender: 'Female',
    phone: '+91 99100 88231',
    email: 'sneha.deshmukh@example.in',
    city: 'Hauz Khas, New Delhi',
    password: 'AEGIS-319024',
    assignedDoctorIds: ['dr-arjun-patel'],
    condition: 'Mild Labile Hypertension & Lifestyle Stabilization',
    status: 'stable',
    lastActive: '2h ago',
    assignedDate: 'July 2026',
    vitals: { bp: '122/78 mmHg', hr: '68 BPM', spo2: '99%' },
  },
];

// Initial Seed Appointments
const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt-seed-1',
    patientId: 'p-89104',
    patientName: 'Aarav Sharma',
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
      const assigned = existing.assignedDoctorIds.includes(details.doctorId)
        ? existing.assignedDoctorIds
        : [...existing.assignedDoctorIds, details.doctorId];

      const updatedPatient: RegisteredPatient = {
        ...existing,
        assignedDoctorIds: assigned,
        condition: details.condition || existing.condition,
        lastActive: 'Active now',
      };
      saveOrUpdateRegisteredPatient(updatedPatient);

      saveLastMailedCredentials({
        patientId: updatedPatient.id,
        patientName: updatedPatient.name,
        email: updatedPatient.email,
        phone: updatedPatient.phone,
        password: updatedPatient.password || generatedPassword,
        doctorName: details.doctorName,
        date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
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
    const assigned = existingSamePerson.assignedDoctorIds.includes(details.doctorId)
      ? existingSamePerson.assignedDoctorIds
      : [...existingSamePerson.assignedDoctorIds, details.doctorId];

    const updatedPatient: RegisteredPatient = {
      ...existingSamePerson,
      assignedDoctorIds: assigned,
      condition: details.condition || existingSamePerson.condition,
      lastActive: 'Active now',
    };
    saveOrUpdateRegisteredPatient(updatedPatient);

    saveLastMailedCredentials({
      patientId: updatedPatient.id,
      patientName: updatedPatient.name,
      email: updatedPatient.email,
      phone: updatedPatient.phone,
      password: updatedPatient.password || generatedPassword,
      doctorName: details.doctorName,
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });

    return { patient: updatedPatient, password: updatedPatient.password || generatedPassword };
  }

  // Create BRAND NEW unique patient enclave
  const newPatientId = 'p-' + Math.floor(10000 + Math.random() * 90000);
  const newPatient: RegisteredPatient = {
    id: newPatientId,
    name: cleanName || 'New Patient',
    age: details.age || 34,
    gender: details.gender || 'Prefer not to say',
    phone: details.phone.trim() || '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
    email: cleanEmail || `patient-${newPatientId}@aegis-health.in`,
    city: details.city || 'Bengaluru, India',
    password: generatedPassword,
    assignedDoctorIds: [details.doctorId],
    condition: details.condition || `Consultation regarding specialist review with ${details.doctorName}`,
    status: 'stable',
    lastActive: 'Active now',
    assignedDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    vitals: { bp: '120/80 mmHg', hr: '72 BPM', spo2: '99%' },
  };

  saveOrUpdateRegisteredPatient(newPatient);

  // Save mailed credentials record
  saveLastMailedCredentials({
    patientId: newPatient.id,
    patientName: newPatient.name,
    email: newPatient.email,
    phone: newPatient.phone,
    password: generatedPassword,
    doctorName: details.doctorName,
    date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
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
      },
      {
        id: 'msg-seed-2',
        chatKey: key,
        sender: 'patient',
        senderName: 'Aarav Sharma',
        text: 'Thank you doctor! The palpitations are much less frequent now. Should I continue Metoprolol 25mg after breakfast?',
        timestamp: '09:18 AM',
        encrypted: true,
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
  };

  const updated = [...current, newMsg];
  localStorage.setItem(key, JSON.stringify(updated));
  notifyStateChange('aegis_chat_change');
  return newMsg;
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
