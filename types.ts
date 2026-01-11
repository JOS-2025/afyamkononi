
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isEmergency?: boolean;
  groundingLinks?: { title: string; uri: string }[];
}

export interface VitalsRecord {
  id: string;
  type: 'BP' | 'Weight' | 'Temp' | 'Glucose';
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

export interface Prescription {
  id: string;
  consultationId: string;
  medication: string;
  dosage: string;
  instructions: string;
  issuedAt: Date;
  doctorName: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  status: 'pending' | 'active' | 'completed' | 'scheduled' | 'awaiting_payment';
  summary?: string;
  doctorNotes?: string;
  aiPatientSummary?: string;
  scheduledAt: Date;
  createdAt: Date;
  fee: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: boolean;
  slots: string[];
  availabilityMap?: { [date: string]: string[] };
  blockedDates?: string[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: 'nutrition' | 'maternal' | 'malaria' | 'general';
  imageUrl: string;
  content: string;
}
