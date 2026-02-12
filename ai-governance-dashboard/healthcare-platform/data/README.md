# Healthcare Platform Sample Data

This directory contains comprehensive sample data for all dashboard tabs in the Healthcare Platform.

## Overview

The sample data is designed to be realistic, HIPAA-compliant (using anonymized information), and comprehensive enough to demonstrate all features of the platform.

## Data Files

### `sampleData.ts`

Main data file containing all sample data with TypeScript interfaces.

## Data Categories

### 1. Patient Data (`patients`)

**5 sample patients** with complete medical profiles including:

- Demographics (name, DOB, age, gender, contact info)
- Insurance information
- Emergency contacts
- Medical history (allergies, chronic conditions, medications)
- Blood type and risk level
- Appointment history

**Sample Patients:**
- Sarah Johnson (41F) - Type 2 Diabetes, Hypertension
- Michael Chen (33M) - Asthma
- Emily Davis (47F) - Rheumatoid Arthritis, Osteoporosis
- James Wilson (60M) - Coronary Artery Disease, COPD
- Maria Garcia (35F) - Prenatal care (24 weeks)

### 2. Appointment Data (`appointments`)

**7 sample appointments** covering:

- Different appointment types (Routine, Follow-up, Urgent Care, Consultation, Procedure, Telehealth)
- Various statuses (Scheduled, Confirmed, In Progress, Completed)
- Priority levels (Low, Medium, High)
- Room assignments
- Duration and timing

**Appointment Types:**
- Routine Checkup
- Follow-up
- Urgent Care
- Consultation
- Procedure
- Telehealth

### 3. Medical Records Data (`medicalRecords`)

**9 sample records** including:

- Lab results (metabolic panels, rheumatology labs, glucose tests)
- Imaging reports (ultrasounds)
- Prescriptions and refills
- Visit notes
- Procedure reports (cardiac catheterization)
- Referrals to specialists

**Record Types:**
- Lab Result
- Imaging
- Prescription
- Visit Note
- Procedure Report
- Referral

### 4. Analytics Data (`analyticsData`, `chartData`)

**4 metric categories** with comprehensive KPIs:

#### Patient Volume
- Total Active Patients: 2,543 (+12.5%)
- New Patients (30 days): 87 (+8.3%)
- Patient Retention Rate: 94.2% (+1.8%)
- Average Visits per Patient: 3.4 (-2.1%)

#### Appointments
- Total Appointments (Month): 1,247 (+5.7%)
- No-Show Rate: 4.2% (-1.3%)
- Average Wait Time: 12 min (-15.2%)
- Same-Day Appointments: 23% (+18.5%)

#### Clinical Quality
- Patient Satisfaction Score: 4.7/5 (+3.2%)
- Preventive Care Compliance: 87.5% (+4.1%)
- Chronic Disease Management: 91.3% (+2.8%)
- Medication Adherence Rate: 82.1% (-1.5%)

#### Financial Performance
- Revenue (Month): $487,250 (+7.9%)
- Collection Rate: 96.8% (+1.2%)
- Average Revenue per Visit: $185 (+3.5%)
- Insurance Claims Pending: 34 (-22.7%)

**Chart Data:**
- Patient Visits by Month (7 months trend)
- Appointment Types Distribution (6 categories)
- Patient Age Distribution (5 age groups)

### 5. Physician Mobile Dashboard Data (`physicianDashboardPatients`)

**3 emergency/urgent patients** with:

- Triage priority (High, Medium, Low)
- Chief complaints
- Pain scale (0-10)
- Complete vital signs
- Historical medical context
- Arrival time and location

**Sample Cases:**
- Robert Martinez (58M) - High Priority: Chest pain, possible MI
- Jennifer Thompson (34F) - Medium Priority: Severe migraine
- David Kim (42M) - Low Priority: Ankle sprain

### 6. User Settings Data (`userSettings`)

Complete user profile and preferences:

**Profile:**
- Name, title, specialty
- License and NPI numbers
- Contact information

**Preferences:**
- Theme (light/dark/auto)
- Language and timezone
- Date/time formats
- Notification settings (email, SMS, push)

**Security:**
- Two-factor authentication status
- Session timeout (15 minutes for HIPAA compliance)
- Password change history
- Login history with device and location tracking

## Usage Examples

### Importing Data

```typescript
import {
  patients,
  appointments,
  medicalRecords,
  analyticsData,
  chartData,
  physicianDashboardPatients,
  userSettings,
} from '@/data/sampleData';
```

### Using in Components

```typescript
// Display patient list
export function PatientList() {
  return (
    <div>
      {patients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  );
}

// Display today's appointments
export function TodayAppointments() {
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(apt => apt.date === today);
  
  return (
    <div>
      {todayAppts.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}

// Display analytics metrics
export function AnalyticsDashboard() {
  return (
    <div>
      {analyticsData.map((category) => (
        <MetricCategory key={category.category} data={category} />
      ))}
    </div>
  );
}
```

### Filtering and Searching

```typescript
// Find high-risk patients
const highRiskPatients = patients.filter(p => p.riskLevel === 'High');

// Find appointments by physician
const drSmithAppts = appointments.filter(
  apt => apt.physicianName === 'Dr. John Smith'
);

// Find recent lab results
const recentLabs = medicalRecords.filter(
  rec => rec.type === 'Lab Result' && 
  new Date(rec.date) > new Date('2026-02-01')
);
```

## Data Relationships

### Patient → Appointments
```typescript
const patientAppointments = appointments.filter(
  apt => apt.patientId === 'PT-001'
);
```

### Patient → Medical Records
```typescript
const patientRecords = medicalRecords.filter(
  rec => rec.patientId === 'PT-001'
);
```

### Appointment → Patient
```typescript
const appointment = appointments[0];
const patient = patients.find(p => p.id === appointment.patientId);
```

## HIPAA Compliance Notes

All sample data uses:
- Anonymized patient names
- Fictional contact information
- Generic addresses
- Placeholder insurance policy numbers
- Simulated medical record numbers (MRN)

This data is for **demonstration purposes only** and should not be used with real patient information.

## Extending the Data

To add more sample data:

1. Follow the existing TypeScript interfaces
2. Maintain realistic medical scenarios
3. Use anonymized information only
4. Ensure data relationships are consistent (patient IDs, dates, etc.)
5. Include appropriate metadata (timestamps, status, priority)

## Data Statistics

- **Total Patients:** 5
- **Total Appointments:** 7
- **Total Medical Records:** 9
- **Analytics Metrics:** 16 KPIs across 4 categories
- **Chart Datasets:** 3 visualizations
- **Emergency Patients:** 3
- **Physicians:** 4 (Dr. John Smith, Dr. Emily Rodriguez, Dr. Sarah Martinez, Dr. Robert Lee)

## Future Enhancements

Potential additions to sample data:
- Billing and insurance claims data
- Prescription history and pharmacy information
- Lab result trends over time
- Imaging studies with DICOM metadata
- Care team assignments
- Clinical pathways and protocols
- Quality measure tracking
- Patient portal messages
- Telemedicine session logs
