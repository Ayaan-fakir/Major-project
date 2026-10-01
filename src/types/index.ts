export type AppView = 'landing' | 'patient' | 'doctor';

export type UserRole = 'guest' | 'patient' | 'doctor';

export interface AuthUser {
  id: string;
  name: string;
  role: 'patient' | 'doctor';
  emailOrPhone: string;
  email?: string;
  phone?: string;
  password?: string;
  doctorId?: string;
  patientId?: string;
  assignedDoctorIds?: string[];
  hasPaidAppointment?: boolean;
}

export interface RegisteredPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  city: string;
  password: string; // The mailed password
  assignedDoctorIds: string[];
  condition: string;
  status: 'monitoring' | 'critical' | 'stable';
  lastActive: string;
  assignedDate: string;
  vitals: {
    bp: string;
    hr: string;
    spo2: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  rating: number;
  available: boolean;
  image: string;
  experienceYears: number;
  happyPatients: number;
  casesSuccess: number;
  regNumber: string; // Indian Medical Council / NMC registration
  hospital: string;
  bio: string;
  contact: {
    phone: string;
    email: string;
  };
  specialties: string[];
  education: Array<{
    degree: string;
    institution: string;
    years: string;
  }>;
  consultationFee?: number;
  quote?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Wellness' | 'Consult' | 'Health';
  description: string;
  fullOverview?: string;
  benefits?: string[];
  icon: string;
  typicalDuration?: string;
  startingFee?: number;
}

export interface DiagnosticTestItem {
  id: string;
  name: string;
  code: string;
  price?: number;
  description: string;
  turnaroundTime: string;
  sampleType: string;
  popular?: boolean;
}

export interface AppointmentOption {
  id: string;
  title: string;
  duration: string;
  price?: number;
  description: string;
  popular?: boolean;
  features: string[];
}

export interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
  author: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  fee?: number;
  paymentRef?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed';
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface EHRMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  indication: string;
  startDate: string;
  status: 'active' | 'completed' | 'discontinued';
}

export interface EHRAllergy {
  id: string;
  substance: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe (Anaphylaxis)';
  verifiedDate: string;
}

export interface EHRLabBiomarker {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'optimal' | 'elevated' | 'low';
  lastTested: string;
}

export interface EHRConnectedDevice {
  id: string;
  name: string;
  type: 'ECG Patch' | 'BP Cuff' | 'Pulse Oximeter' | 'Digital Stethoscope' | 'Glucose Telemetry';
  battery: string;
  status: 'online' | 'synced' | 'standby';
  lastTelemetry: string;
}

export interface ChatMessage {
  id: string;
  chatKey: string; // format: `${patientId}_${doctorId}`
  sender: 'doctor' | 'patient';
  senderName: string;
  text: string;
  timestamp: string;
  encrypted: boolean;
  attachmentName?: string;
  attachmentType?: string;
}

export interface ClinicalDocument {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  title: string;
  date: string;
  category: 'Prescription' | 'Lab Report' | 'Radiology / X-Ray' | 'Consultation Summary' | 'Patient Upload';
  pages: number;
  uploadedBy: 'patient' | 'doctor';
  contentLines: string[];
  fileUrl?: string; // for uploaded images or scans
  fileType?: string;
}
