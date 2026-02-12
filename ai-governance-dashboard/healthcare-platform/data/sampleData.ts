/**
 * Sample Healthcare Platform Data
 * 
 * This file contains realistic sample data for all dashboard tabs.
 * Data follows HIPAA-compliant patterns with anonymized patient information.
 */

// ============================================================================
// PATIENT DATA
// ============================================================================

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryPhysician: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  lastVisit: string;
  nextAppointment?: string;
  status: 'Active' | 'Inactive' | 'Discharged';
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const patients: Patient[] = [
  {
    id: 'PT-001',
    mrn: 'MRN-2024-001234',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    age: 41,
    gender: 'Female',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Maple Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-789456123',
      groupNumber: 'GRP-45678',
    },
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Spouse',
      phone: '(555) 123-4568',
    },
    primaryPhysician: 'Dr. John Smith',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Latex'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    currentMedications: ['Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg'],
    lastVisit: '2026-02-05',
    nextAppointment: '2026-03-15',
    status: 'Active',
    riskLevel: 'Medium',
  },
  {
    id: 'PT-002',
    mrn: 'MRN-2024-001235',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: '1992-07-22',
    age: 33,
    gender: 'Male',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    address: {
      street: '456 Oak Avenue',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET-456789012',
      groupNumber: 'GRP-78901',
    },
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Mother',
      phone: '(555) 234-5679',
    },
    primaryPhysician: 'Dr. Emily Rodriguez',
    bloodType: 'O+',
    allergies: ['Shellfish'],
    chronicConditions: ['Asthma'],
    currentMedications: ['Albuterol Inhaler', 'Fluticasone 110mcg'],
    lastVisit: '2026-02-10',
    nextAppointment: '2026-04-10',
    status: 'Active',
    riskLevel: 'Low',
  },
  {
    id: 'PT-003',
    mrn: 'MRN-2024-001236',
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: '1978-11-08',
    age: 47,
    gender: 'Female',
    email: 'emily.davis@email.com',
    phone: '(555) 345-6789',
    address: {
      street: '789 Pine Road',
      city: 'Naperville',
      state: 'IL',
      zip: '60540',
    },
    insurance: {
      provider: 'UnitedHealthcare',
      policyNumber: 'UHC-123456789',
      groupNumber: 'GRP-12345',
    },
    emergencyContact: {
      name: 'Robert Davis',
      relationship: 'Spouse',
      phone: '(555) 345-6790',
    },
    primaryPhysician: 'Dr. John Smith',
    bloodType: 'B+',
    allergies: ['Sulfa drugs', 'Aspirin'],
    chronicConditions: ['Rheumatoid Arthritis', 'Osteoporosis'],
    currentMedications: ['Methotrexate 15mg', 'Folic Acid 1mg', 'Calcium + Vitamin D'],
    lastVisit: '2026-02-08',
    nextAppointment: '2026-02-22',
    status: 'Active',
    riskLevel: 'Medium',
  },
  {
    id: 'PT-004',
    mrn: 'MRN-2024-001237',
    firstName: 'James',
    lastName: 'Wilson',
    dateOfBirth: '1965-05-30',
    age: 60,
    gender: 'Male',
    email: 'jwilson@email.com',
    phone: '(555) 456-7890',
    address: {
      street: '321 Elm Street',
      city: 'Aurora',
      state: 'IL',
      zip: '60505',
    },
    insurance: {
      provider: 'Medicare',
      policyNumber: 'MED-987654321',
      groupNumber: 'N/A',
    },
    emergencyContact: {
      name: 'Jennifer Wilson',
      relationship: 'Daughter',
      phone: '(555) 456-7891',
    },
    primaryPhysician: 'Dr. Sarah Martinez',
    bloodType: 'AB+',
    allergies: ['Codeine'],
    chronicConditions: ['Coronary Artery Disease', 'Type 2 Diabetes', 'COPD'],
    currentMedications: [
      'Aspirin 81mg',
      'Metoprolol 50mg',
      'Metformin 1000mg',
      'Tiotropium Inhaler',
      'Rosuvastatin 20mg',
    ],
    lastVisit: '2026-02-01',
    nextAppointment: '2026-02-15',
    status: 'Active',
    riskLevel: 'High',
  },
  {
    id: 'PT-005',
    mrn: 'MRN-2024-001238',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: '1990-09-12',
    age: 35,
    gender: 'Female',
    email: 'mgarcia@email.com',
    phone: '(555) 567-8901',
    address: {
      street: '654 Birch Lane',
      city: 'Joliet',
      state: 'IL',
      zip: '60435',
    },
    insurance: {
      provider: 'Cigna',
      policyNumber: 'CIG-246813579',
      groupNumber: 'GRP-24680',
    },
    emergencyContact: {
      name: 'Carlos Garcia',
      relationship: 'Spouse',
      phone: '(555) 567-8902',
    },
    primaryPhysician: 'Dr. Emily Rodriguez',
    bloodType: 'O-',
    allergies: [],
    chronicConditions: [],
    currentMedications: ['Prenatal Vitamins'],
    lastVisit: '2026-02-11',
    nextAppointment: '2026-03-11',
    status: 'Active',
    riskLevel: 'Low',
  },
];

// ============================================================================
// APPOINTMENT DATA
// ============================================================================

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  physicianId: string;
  physicianName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'Routine Checkup' | 'Follow-up' | 'Urgent Care' | 'Consultation' | 'Procedure' | 'Telehealth';
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  reason: string;
  notes?: string;
  room?: string;
  priority: 'Low' | 'Medium' | 'High';
}

export const appointments: Appointment[] = [
  {
    id: 'APT-001',
    patientId: 'PT-001',
    patientName: 'Sarah Johnson',
    patientMRN: 'MRN-2024-001234',
    physicianId: 'DOC-001',
    physicianName: 'Dr. John Smith',
    date: '2026-02-12',
    time: '09:00',
    duration: 30,
    type: 'Follow-up',
    status: 'Scheduled',
    reason: 'Diabetes management review',
    notes: 'Review recent lab results and adjust medication if needed',
    room: 'Exam Room 3',
    priority: 'Medium',
  },
  {
    id: 'APT-002',
    patientId: 'PT-002',
    patientName: 'Michael Chen',
    patientMRN: 'MRN-2024-001235',
    physicianId: 'DOC-002',
    physicianName: 'Dr. Emily Rodriguez',
    date: '2026-02-12',
    time: '10:30',
    duration: 20,
    type: 'Routine Checkup',
    status: 'Confirmed',
    reason: 'Annual physical examination',
    room: 'Exam Room 1',
    priority: 'Low',
  },
  {
    id: 'APT-003',
    patientId: 'PT-003',
    patientName: 'Emily Davis',
    patientMRN: 'MRN-2024-001236',
    physicianId: 'DOC-001',
    physicianName: 'Dr. John Smith',
    date: '2026-02-12',
    time: '11:00',
    duration: 45,
    type: 'Consultation',
    status: 'In Progress',
    reason: 'Rheumatoid arthritis treatment options',
    notes: 'Discuss biologic therapy options',
    room: 'Exam Room 3',
    priority: 'Medium',
  },
  {
    id: 'APT-004',
    patientId: 'PT-004',
    patientName: 'James Wilson',
    patientMRN: 'MRN-2024-001237',
    physicianId: 'DOC-003',
    physicianName: 'Dr. Sarah Martinez',
    date: '2026-02-12',
    time: '14:00',
    duration: 30,
    type: 'Follow-up',
    status: 'Scheduled',
    reason: 'Post-cardiac catheterization check',
    notes: 'Review recovery progress and medication compliance',
    room: 'Exam Room 2',
    priority: 'High',
  },
  {
    id: 'APT-005',
    patientId: 'PT-005',
    patientName: 'Maria Garcia',
    patientMRN: 'MRN-2024-001238',
    physicianId: 'DOC-002',
    physicianName: 'Dr. Emily Rodriguez',
    date: '2026-02-12',
    time: '15:30',
    duration: 20,
    type: 'Routine Checkup',
    status: 'Confirmed',
    reason: 'Prenatal checkup - 24 weeks',
    room: 'Exam Room 1',
    priority: 'Medium',
  },
  {
    id: 'APT-006',
    patientId: 'PT-001',
    patientName: 'Sarah Johnson',
    date: '2026-02-13',
    patientMRN: 'MRN-2024-001234',
    physicianId: 'DOC-004',
    physicianName: 'Dr. Robert Lee',
    time: '10:00',
    duration: 60,
    type: 'Procedure',
    status: 'Scheduled',
    reason: 'Diabetic retinopathy screening',
    notes: 'Dilated eye exam',
    room: 'Ophthalmology Suite',
    priority: 'Medium',
  },
  {
    id: 'APT-007',
    patientId: 'PT-002',
    patientName: 'Michael Chen',
    patientMRN: 'MRN-2024-001235',
    physicianId: 'DOC-002',
    physicianName: 'Dr. Emily Rodriguez',
    date: '2026-02-14',
    time: '09:00',
    duration: 15,
    type: 'Telehealth',
    status: 'Scheduled',
    reason: 'Asthma medication refill consultation',
    priority: 'Low',
  },
];

// ============================================================================
// MEDICAL RECORDS DATA
// ============================================================================

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'Lab Result' | 'Imaging' | 'Prescription' | 'Visit Note' | 'Procedure Report' | 'Referral';
  title: string;
  description: string;
  provider: string;
  status: 'Final' | 'Preliminary' | 'Amended' | 'Pending';
  attachments?: string[];
}

export const medicalRecords: MedicalRecord[] = [
  {
    id: 'REC-001',
    patientId: 'PT-001',
    patientName: 'Sarah Johnson',
    date: '2026-02-05',
    type: 'Lab Result',
    title: 'Comprehensive Metabolic Panel',
    description: 'HbA1c: 7.2% (target <7.0%), Fasting glucose: 142 mg/dL, Creatinine: 0.9 mg/dL (normal)',
    provider: 'Quest Diagnostics',
    status: 'Final',
    attachments: ['lab_report_20260205.pdf'],
  },
  {
    id: 'REC-002',
    patientId: 'PT-001',
    patientName: 'Sarah Johnson',
    date: '2026-02-05',
    type: 'Visit Note',
    title: 'Diabetes Follow-up Visit',
    description: 'Patient reports improved dietary compliance. Blood pressure 128/82. Discussed increasing Metformin dosage.',
    provider: 'Dr. John Smith',
    status: 'Final',
  },
  {
    id: 'REC-003',
    patientId: 'PT-002',
    patientName: 'Michael Chen',
    date: '2026-02-10',
    type: 'Prescription',
    title: 'Albuterol Inhaler Refill',
    description: 'Albuterol 90mcg inhaler, 2 puffs every 4-6 hours as needed. Refills: 3',
    provider: 'Dr. Emily Rodriguez',
    status: 'Final',
  },
  {
    id: 'REC-004',
    patientId: 'PT-003',
    patientName: 'Emily Davis',
    date: '2026-02-08',
    type: 'Lab Result',
    title: 'Rheumatoid Factor and Anti-CCP',
    description: 'RF: 45 IU/mL (elevated), Anti-CCP: 78 U/mL (positive), ESR: 32 mm/hr (elevated)',
    provider: 'LabCorp',
    status: 'Final',
    attachments: ['rheumatology_labs_20260208.pdf'],
  },
  {
    id: 'REC-005',
    patientId: 'PT-003',
    patientName: 'Emily Davis',
    date: '2026-02-08',
    type: 'Referral',
    title: 'Rheumatology Specialist Referral',
    description: 'Referral to Dr. Amanda Foster, Rheumatology, for evaluation of biologic therapy options',
    provider: 'Dr. John Smith',
    status: 'Final',
  },
  {
    id: 'REC-006',
    patientId: 'PT-004',
    patientName: 'James Wilson',
    date: '2026-01-28',
    type: 'Procedure Report',
    title: 'Cardiac Catheterization',
    description: '70% stenosis in LAD, drug-eluting stent placed successfully. No complications.',
    provider: 'Dr. Michael Thompson, Cardiology',
    status: 'Final',
    attachments: ['cardiac_cath_report_20260128.pdf'],
  },
  {
    id: 'REC-007',
    patientId: 'PT-004',
    patientName: 'James Wilson',
    date: '2026-02-01',
    type: 'Prescription',
    title: 'Post-Procedure Medications',
    description: 'Clopidogrel 75mg daily x 12 months, Aspirin 81mg daily (continue indefinitely)',
    provider: 'Dr. Sarah Martinez',
    status: 'Final',
  },
  {
    id: 'REC-008',
    patientId: 'PT-005',
    patientName: 'Maria Garcia',
    date: '2026-02-11',
    type: 'Imaging',
    title: 'Prenatal Ultrasound - 24 weeks',
    description: 'Fetal anatomy scan normal. Estimated fetal weight: 1.3 lbs. Placenta anterior, no abnormalities.',
    provider: 'Women\'s Imaging Center',
    status: 'Final',
    attachments: ['ultrasound_20260211.pdf', 'ultrasound_images.jpg'],
  },
  {
    id: 'REC-009',
    patientId: 'PT-005',
    patientName: 'Maria Garcia',
    date: '2026-02-11',
    type: 'Lab Result',
    title: 'Glucose Tolerance Test',
    description: 'Fasting: 88 mg/dL, 1-hour: 165 mg/dL, 2-hour: 142 mg/dL. Normal results, no gestational diabetes.',
    provider: 'Quest Diagnostics',
    status: 'Final',
  },
];

// ============================================================================
// ANALYTICS DATA
// ============================================================================

export interface AnalyticsMetric {
  category: string;
  metrics: {
    name: string;
    value: number | string;
    change: number;
    trend: 'up' | 'down' | 'stable';
    unit?: string;
  }[];
}

export const analyticsData: AnalyticsMetric[] = [
  {
    category: 'Patient Volume',
    metrics: [
      { name: 'Total Active Patients', value: 2543, change: 12.5, trend: 'up' },
      { name: 'New Patients (30 days)', value: 87, change: 8.3, trend: 'up' },
      { name: 'Patient Retention Rate', value: 94.2, change: 1.8, trend: 'up', unit: '%' },
      { name: 'Average Visits per Patient', value: 3.4, change: -2.1, trend: 'down' },
    ],
  },
  {
    category: 'Appointments',
    metrics: [
      { name: 'Total Appointments (Month)', value: 1247, change: 5.7, trend: 'up' },
      { name: 'No-Show Rate', value: 4.2, change: -1.3, trend: 'down', unit: '%' },
      { name: 'Average Wait Time', value: 12, change: -15.2, trend: 'down', unit: 'min' },
      { name: 'Same-Day Appointments', value: 23, change: 18.5, trend: 'up', unit: '%' },
    ],
  },
  {
    category: 'Clinical Quality',
    metrics: [
      { name: 'Patient Satisfaction Score', value: 4.7, change: 3.2, trend: 'up', unit: '/5' },
      { name: 'Preventive Care Compliance', value: 87.5, change: 4.1, trend: 'up', unit: '%' },
      { name: 'Chronic Disease Management', value: 91.3, change: 2.8, trend: 'up', unit: '%' },
      { name: 'Medication Adherence Rate', value: 82.1, change: -1.5, trend: 'down', unit: '%' },
    ],
  },
  {
    category: 'Financial Performance',
    metrics: [
      { name: 'Revenue (Month)', value: '$487,250', change: 7.9, trend: 'up' },
      { name: 'Collection Rate', value: 96.8, change: 1.2, trend: 'up', unit: '%' },
      { name: 'Average Revenue per Visit', value: '$185', change: 3.5, trend: 'up' },
      { name: 'Insurance Claims Pending', value: 34, change: -22.7, trend: 'down' },
    ],
  },
];

export interface ChartData {
  name: string;
  data: { label: string; value: number }[];
}

export const chartData: ChartData[] = [
  {
    name: 'Patient Visits by Month',
    data: [
      { label: 'Aug', value: 1150 },
      { label: 'Sep', value: 1180 },
      { label: 'Oct', value: 1220 },
      { label: 'Nov', value: 1190 },
      { label: 'Dec', value: 1240 },
      { label: 'Jan', value: 1180 },
      { label: 'Feb', value: 1247 },
    ],
  },
  {
    name: 'Appointment Types Distribution',
    data: [
      { label: 'Routine Checkup', value: 42 },
      { label: 'Follow-up', value: 28 },
      { label: 'Urgent Care', value: 12 },
      { label: 'Consultation', value: 10 },
      { label: 'Procedure', value: 5 },
      { label: 'Telehealth', value: 3 },
    ],
  },
  {
    name: 'Patient Age Distribution',
    data: [
      { label: '0-17', value: 15 },
      { label: '18-34', value: 22 },
      { label: '35-49', value: 28 },
      { label: '50-64', value: 20 },
      { label: '65+', value: 15 },
    ],
  },
];

// ============================================================================
// PHYSICIAN MOBILE DASHBOARD DATA
// ============================================================================

export interface PhysicianDashboardPatient {
  id: string;
  name: string;
  age: number;
  mrn: string;
  urgency: 'High' | 'Medium' | 'Low';
  chiefComplaint: string;
  painScale: number;
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
  };
  historicalContext: string | string[];
  arrivalTime: string;
  location: string;
}

export const physicianDashboardPatients: PhysicianDashboardPatient[] = [
  {
    id: 'ED-001',
    name: 'Robert Martinez',
    age: 58,
    mrn: 'MRN-2024-005678',
    urgency: 'High',
    chiefComplaint: 'Chest pain radiating to left arm, onset 2 hours ago',
    painScale: 8,
    vitalSigns: {
      bloodPressure: '165/98',
      heartRate: 102,
      temperature: 98.6,
      oxygenSaturation: 96,
    },
    historicalContext: [
      'Previous MI (2022)',
      'Hypertension',
      'Type 2 Diabetes',
      'Current medications: Aspirin, Metoprolol, Atorvastatin',
    ],
    arrivalTime: '08:45 AM',
    location: 'ED Bay 3',
  },
  {
    id: 'ED-002',
    name: 'Jennifer Thompson',
    age: 34,
    mrn: 'MRN-2024-005679',
    urgency: 'Medium',
    chiefComplaint: 'Severe migraine with visual aura, nausea',
    painScale: 7,
    vitalSigns: {
      bloodPressure: '118/76',
      heartRate: 88,
      temperature: 98.2,
      oxygenSaturation: 99,
    },
    historicalContext: 'Recurrent migraines (3-4 per month), last episode 2 weeks ago. Responsive to Sumatriptan.',
    arrivalTime: '09:15 AM',
    location: 'ED Bay 7',
  },
  {
    id: 'ED-003',
    name: 'David Kim',
    age: 42,
    mrn: 'MRN-2024-005680',
    urgency: 'Low',
    chiefComplaint: 'Ankle sprain from basketball, able to bear weight',
    painScale: 4,
    vitalSigns: {
      bloodPressure: '122/78',
      heartRate: 72,
      temperature: 98.4,
      oxygenSaturation: 99,
    },
    historicalContext: 'No significant medical history. Previous ankle sprain (2023) healed without complications.',
    arrivalTime: '09:30 AM',
    location: 'Urgent Care Room 2',
  },
];

// ============================================================================
// SETTINGS DATA
// ============================================================================

export interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    title: string;
    specialty: string;
    licenseNumber: string;
    email: string;
    phone: string;
    npiNumber: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    lastPasswordChange: string;
    loginHistory: {
      date: string;
      location: string;
      device: string;
      ipAddress: string;
    }[];
  };
}

export const userSettings: UserSettings = {
  profile: {
    firstName: 'John',
    lastName: 'Smith',
    title: 'MD, FACP',
    specialty: 'Internal Medicine',
    licenseNumber: 'IL-123456',
    email: 'john.smith@healthcare.com',
    phone: '(555) 987-6543',
    npiNumber: '1234567890',
  },
  preferences: {
    theme: 'light',
    language: 'English (US)',
    timezone: 'America/Chicago',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
  },
  security: {
    twoFactorEnabled: true,
    sessionTimeout: 15,
    lastPasswordChange: '2026-01-15',
    loginHistory: [
      {
        date: '2026-02-12 08:30 AM',
        location: 'Chicago, IL',
        device: 'Chrome on macOS',
        ipAddress: '192.168.1.100',
      },
      {
        date: '2026-02-11 08:15 AM',
        location: 'Chicago, IL',
        device: 'Chrome on macOS',
        ipAddress: '192.168.1.100',
      },
      {
        date: '2026-02-10 08:45 AM',
        location: 'Chicago, IL',
        device: 'Safari on iOS',
        ipAddress: '192.168.1.105',
      },
    ],
  },
};
