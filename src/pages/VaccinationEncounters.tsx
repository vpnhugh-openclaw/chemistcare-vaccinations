import { useState, useMemo } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Syringe, Search, Calendar, Clock, User, FileText, CheckCircle2, AlertTriangle, Eye, ShieldCheck, Thermometer, HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VaccineDose {
  brand: string;
  type: string;
  batchNumber: string;
  expiryDate: string;
  site: string;
  route: string;
  ndc: string;
}

interface Encounter {
  id: string;
  date: string;
  time: string;
  durationMinutes: number;
  pharmacistName: string;
  patientName: string;
  patientDOB: string;
  patientMedicare: string;
  serviceType: string;
  status: 'completed' | 'in-progress' | 'cancelled' | 'no-show';
  vaccines?: VaccineDose[];
  medicationSupplied?: string[];
  clinicalNotes: string;
  observations: {
    bp?: string;
    hr?: string;
    temp?: string;
    weight?: string;
    height?: string;
    bmi?: string;
  };
  adverseEvent: boolean;
  adverseEventDetails?: string;
  observationCompleted: boolean;
  observationMinutes: number;
  airReported: boolean;
    followUpScheduled?: string;
  followUpType?: string;
  consentSigned: boolean;
  eligibilityScreening: string[];
  redFlags: string[];
  interpreterUsed: boolean;
  interpreterLanguage?: string;
}

const INITIAL_ENCOUNTERS: Encounter[] = [
  {
    id: 'enc-001',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    time: '09:00',
    durationMinutes: 20,
    pharmacistName: 'Dr. Sarah Mitchell',
    patientName: 'Jane Smith',
    patientDOB: '1985-03-14',
    patientMedicare: '2345 67890 1',
    serviceType: 'UTI Consultation',
    status: 'completed',
    medicationSupplied: ['Trimethoprim 300mg tablets x 3 days'],
    clinicalNotes: 'Uncomplicated UTI. No fever, no flank pain. Dysuria and frequency x 2 days. Dipstick: LE+, nitrite+. Trimethoprim 300mg od x 3 days supplied. Advised to drink plenty of fluids. Follow up if no improvement in 48hrs or if symptoms worsen. Safety net counselling provided.',
    observations: { bp: '118/76', hr: '72', temp: '36.8°C' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    followUpType: 'SMS check-in',
    consentSigned: true,
    eligibilityScreening: ['Female 18-65', 'Not pregnant', 'No fever/flank pain', '2 UTIs in 6mo'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-002',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    time: '09:30',
    durationMinutes: 15,
    pharmacistName: 'Dr. Sarah Mitchell',
    patientName: 'Robert Lee',
    patientDOB: '1972-08-22',
    patientMedicare: '3456 78901 2',
    serviceType: 'Blood Pressure Review',
    status: 'completed',
    clinicalNotes: 'BP 128/82 (seated, L arm, appropriate cuff). Home BP log reviewed: average 126/80 over past 2 weeks. Current meds: Perindopril 5mg, Amlodipine 5mg. Adherence confirmed ( Webster-pak ). No dizziness, oedema, or chest pain. Lifestyle: walking 3x/week, salt reduction ongoing. Continue current regimen. Review in 1 month.',
    observations: { bp: '128/82', hr: '68', temp: '36.5°C', weight: '78.2kg', height: '175cm', bmi: '25.5' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10),
    followUpType: 'BP Review appointment',
    consentSigned: true,
    eligibilityScreening: ['On BP meds', 'No chest pain/SOB'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-003',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    time: '11:00',
    durationMinutes: 20,
    pharmacistName: 'James Chen',
    patientName: "Margaret O'Brien",
    patientDOB: '1958-12-03',
    patientMedicare: '6789 01234 5',
    serviceType: 'Influenza Vaccination',
    status: 'completed',
    vaccines: [{
      brand: 'FluQuadri (Sanofi)',
      type: 'Influenza quadrivalent',
      batchNumber: 'SN-2026-F33491',
      expiryDate: '2026-06-01',
      site: 'Left deltoid',
      route: 'Intramuscular',
      ndc: 'AUST R 345678',
    }],
    clinicalNotes: 'Annual influenza vaccination. NIP-eligible (age 65+). Pre-screening: no fever, no egg allergy (patient allergic to eggs but tolerates cooked eggs and previous flu vaccines without issue). Informed consent obtained. Vaccine administered L deltoid IM. 15-minute observation completed without adverse events. AIR encounter submitted successfully at 11:22. Patient advised to monitor for 48hrs and call if fever >38.5C or systemic symptoms develop.',
    observations: { bp: '132/78', hr: '70', temp: '36.4°C' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 15,
    airReported: true,
    consentSigned: true,
    eligibilityScreening: ['Age 10+', 'No severe egg allergy', 'No fever today'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-004',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    time: '14:00',
    durationMinutes: 30,
    pharmacistName: 'Dr. Sarah Mitchell',
    patientName: 'Mei Wong',
    patientDOB: '1990-11-05',
    patientMedicare: '4567 89012 3',
    serviceType: 'Travel Health Consultation',
    status: 'no-show',
    clinicalNotes: 'Patient did not attend. No prior cancellation. SMS reminder sent 24hrs and 2hrs before. Follow-up SMS sent offering reschedule. Nepal trip in 3 weeks — time-sensitive for hepatitis A/B and typhoid schedule.',
    observations: {},
    adverseEvent: false,
    observationCompleted: false,
    observationMinutes: 0,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    followUpType: 'Reschedule outreach',
    consentSigned: false,
    eligibilityScreening: [],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-005',
    date: new Date().toISOString().slice(0, 10),
    time: '08:30',
    durationMinutes: 15,
    pharmacistName: 'Dr. Sarah Mitchell',
    patientName: 'David Nguyen',
    patientDOB: '1965-07-30',
    patientMedicare: '5678 90123 4',
    serviceType: 'Blood Pressure Review',
    status: 'completed',
    clinicalNotes: 'BP 135/88 seated, R arm. Home log: average 138/86. Current: Perindopril/Indapamide combo. Discussed lifestyle: reduced sodium intake, increased walking. Smoking status: former smoker (quit 2019). Alcohol: 2 standard drinks/week. No target organ damage symptoms. Continue current regimen. Refer to GP if home BP persistently >140/90. Review 4 weeks.',
    observations: { bp: '135/88', hr: '74', temp: '36.6°C', weight: '82.1kg', height: '172cm', bmi: '27.7' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10),
    followUpType: 'BP Review appointment',
    consentSigned: true,
    eligibilityScreening: ['On BP meds', 'No chest pain/SOB'],
    redFlags: [],
    interpreterUsed: true,
    interpreterLanguage: 'Vietnamese',
  },
  {
    id: 'enc-006',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    durationMinutes: 10,
    pharmacistName: 'James Chen',
    patientName: 'Linda Park',
    patientDOB: '1958-12-03',
    patientMedicare: '6789 01234 5',
    serviceType: 'Influenza Vaccination',
    status: 'completed',
    vaccines: [{
      brand: 'FluQuadri (Sanofi)',
      type: 'Influenza quadrivalent',
      batchNumber: 'SN-2026-F33491',
      expiryDate: '2026-06-01',
      site: 'Left deltoid',
      route: 'Intramuscular',
      ndc: 'AUST R 345678',
    }],
    clinicalNotes: 'Corporate flu program — Medicare-ineligible (overseas visitor, no Medicare). Private fee $25 collected. Pre-screening: no fever, no egg allergy. Vaccine administered L deltoid IM. 15-minute observation completed. Mild soreness at injection site reported — normal. Paracetamol 500mg 2 tablets offered and accepted. AIR not applicable (no Medicare). Vaccination record provided on paper.',
    observations: { bp: '128/74', hr: '68', temp: '36.5°C' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 15,
    airReported: false,
    consentSigned: true,
    eligibilityScreening: ['Age 10+', 'No severe egg allergy', 'No fever today'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-007',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    durationMinutes: 20,
    pharmacistName: 'Dr. Sarah Mitchell',
    patientName: 'Peter Thompson',
    patientDOB: '1949-05-18',
    patientMedicare: '7890 12345 6',
    serviceType: 'Shingles Treatment',
    status: 'completed',
    medicationSupplied: ['Acyclovir 800mg tablets x 25 tablets'],
    clinicalNotes: 'Shingles (Herpes Zoster) — rash onset ~48hrs ago. Thoracic dermatomal distribution T7-T8, left side. No eye/ear/nose involvement. Immunocompetent. No immunosuppressants. Pain score 6/10. Acyclovir 800mg 5x/day x 5 days supplied. Analgesia: Paracetamol 1g qid + Ibuprofen 400mg tds (patient not NSAID-allergic, no CKD). Advised rest, hydration, keep rash clean/dry. Red flags discussed: eye involvement, facial weakness, severe headache, confusion — seek urgent care if any develop. Follow-up in 3 days or sooner if worsening.',
    observations: { bp: '142/84', hr: '76', temp: '37.1°C', weight: '71.5kg' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    followUpType: 'Phone check-in',
    consentSigned: true,
    eligibilityScreening: ['Age 18+', 'Rash within 72hrs', 'No facial involvement', 'Immunocompetent'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-008',
    date: new Date().toISOString().slice(0, 10),
    time: '10:30',
    durationMinutes: 15,
    pharmacistName: 'Emily O\'Brien',
    patientName: 'Sophie Anderson',
    patientDOB: '1995-09-22',
    patientMedicare: '8901 23456 7',
    serviceType: 'OCP Resupply',
    status: 'completed',
    medicationSupplied: ['Levlen ED (3 x 28 tablets)'],
    clinicalNotes: 'OCP resupply — Levlen ED. Patient on this formulation for 4 years. BP check: 112/72. No migraines with aura. No smoking. No family history VTE. No new medications. No breast tenderness or mood changes. 3-month supply dispensed. Next BP check due in 2 months. Reminder set. Counselling on missed pill protocol provided.',
    observations: { bp: '112/72', hr: '64', temp: '36.4°C', weight: '58.3kg', height: '165cm', bmi: '21.4' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 84 * 86400000).toISOString().slice(0, 10),
    followUpType: 'BP check + resupply',
    consentSigned: true,
    eligibilityScreening: ['On OCP >12mo', 'BP check within 12mo', 'No red flags'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-009',
    date: new Date().toISOString().slice(0, 10),
    time: '11:30',
    durationMinutes: 30,
    pharmacistName: 'Dr. Sarah Mitchell',
    patientName: 'Ahmed Hassan',
    patientDOB: '1978-01-11',
    patientMedicare: '9012 34567 8',
    serviceType: 'Diabetes MedsCheck',
    status: 'in-progress',
    clinicalNotes: '8CPA Diabetes MedsCheck in progress. Type 2 DM diagnosed 2019. Current meds: Metformin XR 1g BD, Sitagliptin 100mg daily, Atorvastatin 40mg nocte, Aspirin 100mg daily. HbA1c last: 7.2% (3mo ago). Home BGL log: fasting 6.5-8.0, post-prandial 8.5-11.0. No hypoglycaemia episodes. Feet inspected: no ulcers, good sensation (10g monofilament). Medication adherence: good (DAA). Discussion points: glucose monitoring technique, sick day management, when to seek urgent care. MedsCheck report to be completed and sent to GP.',
    observations: { bp: '138/82', hr: '72', temp: '36.7°C', weight: '89.4kg', height: '178cm', bmi: '28.2' },
    adverseEvent: false,
    observationCompleted: false,
    observationMinutes: 0,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    followUpType: 'Diabetes MedsCheck (annual)',
    consentSigned: true,
    eligibilityScreening: ['T2DM confirmed', 'On DM meds'],
    redFlags: [],
    interpreterUsed: true,
    interpreterLanguage: 'Arabic',
  },
  {
    id: 'enc-010',
    date: new Date().toISOString().slice(0, 10),
    time: '13:00',
    durationMinutes: 15,
    pharmacistName: 'James Chen',
    patientName: 'Geraldine White',
    patientDOB: '1942-04-08',
    patientMedicare: '0123 45678 9',
    serviceType: 'MedsCheck',
    status: 'completed',
    clinicalNotes: '8CPA MedsCheck — 7 regular medications. Warfarin 3mg (Mon/Wed/Fri) / 2mg (Tue/Thu/Sat/Sun), Digoxin 62.5mcg daily, Perindopril 5mg, Atorvastatin 20mg, Metformin 500mg BD, Pantoprazole 40mg, Paracetamol 1g prn. INR last week: 2.4 (target 2.0-3.0). Medication adherence: Webster-pak, excellent. No recent falls, no dizziness. Drug interactions checked: no new additions. Adherence aids discussed. MedsCheck report completed and sent to GP via secure message. Next review: 6 months or after any hospitalisation.',
    observations: { bp: '126/78', hr: '62 (irregular — AF)', temp: '36.3°C', weight: '64.2kg' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    followUpType: '6-month MedsCheck review',
    consentSigned: true,
    eligibilityScreening: ['5+ meds', 'Recent hospitalisation (6mo ago)'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-011',
    date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    time: '10:00',
    durationMinutes: 20,
    pharmacistName: 'Dr. Sarah Mitchell',
    patientName: 'Rachel Green',
    patientDOB: '1988-06-10',
    patientMedicare: '5678 90123 4',
    serviceType: 'UTI Consultation',
    status: 'completed',
    medicationSupplied: ['Nitrofurantoin 100mg capsules x 10'],
    clinicalNotes: 'Uncomplicated UTI. Dysuria, frequency, urgency x 1 day. No fever, no flank pain. Dipstick: LE++, nitrite+, blood+. Nitrofurantoin 100mg BD x 5 days supplied. Urine culture sent to lab. Patient advised to increase fluid intake and complete full course. Follow-up: if no improvement in 48hrs, or if fever develops, see GP. Culture results will be forwarded to GP.',
    observations: { bp: '110/70', hr: '78', temp: '36.9°C' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    followUpType: 'Culture result review',
    consentSigned: true,
    eligibilityScreening: ['Female 18-65', 'Not pregnant', 'No fever/flank pain'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-012',
    date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    time: '14:00',
    durationMinutes: 15,
    pharmacistName: 'James Chen',
    patientName: 'Steve Rogers',
    patientDOB: '1945-07-04',
    patientMedicare: '1234 56789 0',
    serviceType: 'Influenza Vaccination',
    status: 'completed',
    vaccines: [{
      brand: 'FluQuadri (Sanofi)',
      type: 'Influenza quadrivalent',
      batchNumber: 'SN-2026-F33491',
      expiryDate: '2026-06-01',
      site: 'Right deltoid',
      route: 'Intramuscular',
      ndc: 'AUST R 345678',
    }],
    clinicalNotes: 'Annual influenza vaccination — NIP-eligible (age 65+). Pre-vaccination screening completed. No contraindications. No egg allergy. No fever. Informed consent obtained and documented. Vaccine: FluQuadri 0.5mL IM R deltoid. Post-vaccination observation: 15 minutes. No immediate adverse events. Patient educated on common side effects (sore arm, mild fever, fatigue) and when to seek medical attention. AIR encounter submitted at 14:18. Vaccination certificate available via myGov/Medicare app.',
    observations: { bp: '130/80', hr: '66', temp: '36.5°C' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 15,
    airReported: true,
    consentSigned: true,
    eligibilityScreening: ['Age 10+', 'No egg allergy', 'No fever today'],
    redFlags: [],
    interpreterUsed: false,
  },
  {
    id: 'enc-013',
    date: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    time: '11:00',
    durationMinutes: 20,
    pharmacistName: 'Dr. Michael Park',
    patientName: 'Emma Wilson',
    patientDOB: '2002-01-15',
    patientMedicare: '6789 01234 5',
    serviceType: 'Acne Consultation',
    status: 'completed',
    medicationSupplied: ['Doxycycline 50mg tablets x 21', 'Adapalene 0.1% gel 30g'],
    clinicalNotes: 'Mild-to-moderate inflammatory acne, face and upper back. Papules and pustules, no nodules or cysts. No scarring. Patient aged 18 — within scope. No pregnancy (confirmed via screening). No history of photosensitivity. Doxycycline 50mg daily x 3 weeks (review before continuing). Adapalene 0.1% gel thin layer nightly. Skincare advice: gentle cleanser, non-comedogenic moisturiser, sunscreen essential with doxycycline. Follow-up in 3 weeks to assess response. If no improvement, refer to GP/dermatologist. Pregnancy test if amenorrhoea before next supply.',
    observations: { bp: '108/68', hr: '72', temp: '36.6°C', weight: '55.0kg', height: '168cm', bmi: '19.5' },
    adverseEvent: false,
    observationCompleted: true,
    observationMinutes: 5,
    airReported: false,
    followUpScheduled: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
    followUpType: 'Acne review + possible resupply',
    consentSigned: true,
    eligibilityScreening: ['Age 12-65', 'Facial/chest/back acne', 'No severe/cystic acne'],
    redFlags: [],
    interpreterUsed: false,
  },
];

const STATUS_CONFIG = {
  completed: { label: 'Completed', colour: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'in-progress': { label: 'In Progress', colour: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', colour: 'bg-slate-100 text-slate-500 border-slate-200' },
  'no-show': { label: 'No Show', colour: 'bg-red-50 text-red-700 border-red-200' },
};

const SERVICE_ICON: Record<string, React.ReactNode> = {
  'Influenza Vaccination': <Syringe className="h-4 w-4" />,
  'COVID-19 Vaccination': <Syringe className="h-4 w-4" />,
  'Travel Health Consultation': <ShieldCheck className="h-4 w-4" />,
  'UTI Consultation': <FileText className="h-4 w-4" />,
  'Blood Pressure Review': <HeartPulse className="h-4 w-4" />,
  'Diabetes MedsCheck': <FileText className="h-4 w-4" />,
  'MedsCheck': <FileText className="h-4 w-4" />,
  'OCP Resupply': <FileText className="h-4 w-4" />,
  'Shingles Treatment': <FileText className="h-4 w-4" />,
  'Acne Consultation': <FileText className="h-4 w-4" />,
  'Smoking Cessation': <FileText className="h-4 w-4" />,
};

export default function VaccinationEncounters() {
  const [encounters] = useState<Encounter[]>(INITIAL_ENCOUNTERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Encounter['status']>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailEncounter, setDetailEncounter] = useState<Encounter | null>(null);

  const filtered = useMemo(() => {
    let result = encounters;
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.patientName.toLowerCase().includes(q) ||
        e.serviceType.toLowerCase().includes(q) ||
        e.pharmacistName.toLowerCase().includes(q) ||
        e.clinicalNotes.toLowerCase().includes(q)
      );
    }
    return result;
  }, [encounters, search, statusFilter]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      today: encounters.filter(e => e.date === today && e.status === 'completed').length,
      week: encounters.filter(e => {
        const d = new Date(e.date);
        const now = new Date();
        const diff = (now.getTime() - d.getTime()) / 86400000;
        return diff >= 0 && diff <= 7 && e.status === 'completed';
      }).length,
      airPending: encounters.filter(e => e.vaccines && !e.airReported).length,
      adverseEvents: encounters.filter(e => e.adverseEvent).length,
      inProgress: encounters.filter(e => e.status === 'in-progress').length,
      followUps: encounters.filter(e => e.followUpScheduled && new Date(e.followUpScheduled) >= new Date()).length,
    };
  }, [encounters]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Encounters</h1>
            <p className="text-sm text-muted-foreground mt-1">Vaccination and prescribing encounter history</p>
          </div>
          <Link to="/consultations/new">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> New Encounter
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Today's Completed", value: stats.today },
            { label: 'This Week', value: stats.week },
            { label: 'In Progress', value: stats.inProgress, colour: 'text-amber-600' },
            { label: 'AIR Pending', value: stats.airPending, colour: 'text-blue-600' },
            { label: 'Follow-ups Due', value: stats.followUps, colour: 'text-purple-600' },
            { label: 'Adverse Events', value: stats.adverseEvents, colour: 'text-red-600' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-semibold mt-1 ${stat.colour || ''}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients, services, or notes..."
                  className="pl-10"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex bg-secondary/50 rounded-md p-0.5">
                {(['all', 'completed', 'in-progress', 'no-show', 'cancelled'] as const).map(f => (
                  <Button
                    key={f}
                    variant="ghost"
                    size="sm"
                    className={`h-8 text-xs capitalize ${statusFilter === f ? 'bg-card shadow-sm' : ''}`}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encounters List */}
        <div className="space-y-2">
          {filtered.map((enc) => {
            const status = STATUS_CONFIG[enc.status];
            const isExpanded = expandedId === enc.id;
            return (
              <Card key={enc.id} className={`transition-all ${enc.status === 'cancelled' || enc.status === 'no-show' ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                        {SERVICE_ICON[enc.serviceType] || <FileText className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{enc.patientName}</p>
                          <Badge variant="outline" className={`text-[0.625rem] ${status.colour}`}>{status.label}</Badge>
                          {enc.airReported && <Badge variant="secondary" className="text-[0.625rem] gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> AIR</Badge>}
                          {enc.adverseEvent && <Badge variant="destructive" className="text-[0.625rem]">Adverse Event</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {enc.serviceType} · {enc.pharmacistName} · {new Date(enc.date).toLocaleDateString('en-AU')} {enc.time}
                        </p>
                        {!isExpanded && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{enc.clinicalNotes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setDetailEncounter(enc)}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleExpand(enc.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground mb-1">Clinical Notes</p>
                            <p className="text-sm leading-relaxed">{enc.clinicalNotes}</p>
                          </div>
                          {enc.medicationSupplied && enc.medicationSupplied.length > 0 && (
                            <div>
                              <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground mb-1">Medication Supplied</p>
                              <div className="flex flex-wrap gap-1">
                                {enc.medicationSupplied.map(med => (
                                  <Badge key={med} variant="outline" className="text-xs">{med}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {enc.vaccines && enc.vaccines.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground mb-1">Vaccine Administration</p>
                              {enc.vaccines.map((v, i) => (
                                <div key={i} className="rounded-md border p-2.5 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Syringe className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-medium">{v.brand}</span>
                                    <Badge variant="outline" className="text-[0.625rem]">{v.type}</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                                    <span>Batch: {v.batchNumber}</span>
                                    <span>Expiry: {new Date(v.expiryDate).toLocaleDateString('en-AU')}</span>
                                    <span>Site: {v.site}</span>
                                    <span>Route: {v.route}</span>
                                    <span className="col-span-2">NDC: {v.ndc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {enc.observations.bp && (
                              <div className="rounded-md bg-muted/50 p-2">
                                <div className="flex items-center gap-1"><HeartPulse className="h-3 w-3 text-muted-foreground" /><span className="text-[0.625rem] text-muted-foreground">BP</span></div>
                                <p className="text-sm font-medium">{enc.observations.bp}</p>
                              </div>
                            )}
                            {enc.observations.hr && (
                              <div className="rounded-md bg-muted/50 p-2">
                                <div className="flex items-center gap-1"><HeartPulse className="h-3 w-3 text-muted-foreground" /><span className="text-[0.625rem] text-muted-foreground">HR</span></div>
                                <p className="text-sm font-medium">{enc.observations.hr}</p>
                              </div>
                            )}
                            {enc.observations.temp && (
                              <div className="rounded-md bg-muted/50 p-2">
                                <div className="flex items-center gap-1"><Thermometer className="h-3 w-3 text-muted-foreground" /><span className="text-[0.625rem] text-muted-foreground">Temp</span></div>
                                <p className="text-sm font-medium">{enc.observations.temp}</p>
                              </div>
                            )}
                            {enc.observations.weight && (
                              <div className="rounded-md bg-muted/50 p-2">
                                <div className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /><span className="text-[0.625rem] text-muted-foreground">Weight</span></div>
                                <p className="text-sm font-medium">{enc.observations.weight}</p>
                              </div>
                            )}
                            {enc.observations.bmi && (
                              <div className="rounded-md bg-muted/50 p-2">
                                <div className="flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /><span className="text-[0.625rem] text-muted-foreground">BMI</span></div>
                                <p className="text-sm font-medium">{enc.observations.bmi}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {enc.consentSigned && <Badge variant="secondary" className="text-[0.625rem] gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Consent Signed</Badge>}
                            {enc.observationCompleted && <Badge variant="secondary" className="text-[0.625rem] gap-1"><Clock className="h-3 w-3" /> {enc.observationMinutes}min Obs</Badge>}
                            {enc.interpreterUsed && <Badge variant="outline" className="text-[0.625rem]">Interpreter: {enc.interpreterLanguage}</Badge>}
                          </div>

                          {enc.eligibilityScreening.length > 0 && (
                            <div>
                              <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground mb-1">Eligibility Screening</p>
                              <div className="flex flex-wrap gap-1">
                                {enc.eligibilityScreening.map(s => (
                                  <Badge key={s} variant="outline" className="text-[0.625rem]"><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />{s}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {enc.followUpScheduled && (
                            <div className="flex items-center gap-2 rounded-md bg-primary/5 p-2">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs">Follow-up: {enc.followUpType} on {new Date(enc.followUpScheduled).toLocaleDateString('en-AU')}</span>
                            </div>
                          )}

                          {enc.adverseEvent && enc.adverseEventDetails && (
                            <div className="flex items-start gap-2 rounded-md bg-red-50 p-2">
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-red-700">{enc.adverseEventDetails}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No encounters match your search.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailEncounter} onOpenChange={() => setDetailEncounter(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailEncounter && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {SERVICE_ICON[detailEncounter.serviceType]}
                  {detailEncounter.serviceType}
                </DialogTitle>
                <DialogDescription>
                  {detailEncounter.patientName} · Medicare {detailEncounter.patientMedicare} · {new Date(detailEncounter.date).toLocaleDateString('en-AU')} {detailEncounter.time}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={STATUS_CONFIG[detailEncounter.status].colour}>
                    {STATUS_CONFIG[detailEncounter.status].label}
                  </Badge>
                  {detailEncounter.airReported && <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> AIR Reported</Badge>}
                  {detailEncounter.consentSigned && <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Consent</Badge>}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Clinical Notes</p>
                  <p className="text-sm leading-relaxed">{detailEncounter.clinicalNotes}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {detailEncounter.observations.bp && <div className="rounded-md bg-muted p-2 text-center"><p className="text-[0.625rem] text-muted-foreground">BP</p><p className="text-sm font-semibold">{detailEncounter.observations.bp}</p></div>}
                  {detailEncounter.observations.hr && <div className="rounded-md bg-muted p-2 text-center"><p className="text-[0.625rem] text-muted-foreground">HR</p><p className="text-sm font-semibold">{detailEncounter.observations.hr}</p></div>}
                  {detailEncounter.observations.temp && <div className="rounded-md bg-muted p-2 text-center"><p className="text-[0.625rem] text-muted-foreground">Temp</p><p className="text-sm font-semibold">{detailEncounter.observations.temp}</p></div>}
                  {detailEncounter.observations.weight && <div className="rounded-md bg-muted p-2 text-center"><p className="text-[0.625rem] text-muted-foreground">Weight</p><p className="text-sm font-semibold">{detailEncounter.observations.weight}</p></div>}
                  {detailEncounter.observations.bmi && <div className="rounded-md bg-muted p-2 text-center"><p className="text-[0.625rem] text-muted-foreground">BMI</p><p className="text-sm font-semibold">{detailEncounter.observations.bmi}</p></div>}
                </div>
                {detailEncounter.vaccines && detailEncounter.vaccines.map((v, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-1">
                    <p className="text-sm font-medium">{v.brand}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Type: {v.type}</span>
                      <span>Batch: {v.batchNumber}</span>
                      <span>Expiry: {new Date(v.expiryDate).toLocaleDateString('en-AU')}</span>
                      <span>Site: {v.site}</span>
                      <span>Route: {v.route}</span>
                      <span>NDC: {v.ndc}</span>
                    </div>
                  </div>
                ))}
                {detailEncounter.medicationSupplied && detailEncounter.medicationSupplied.length > 0 && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Medication Supplied</p>
                    <div className="flex flex-wrap gap-1">
                      {detailEncounter.medicationSupplied.map(m => (
                        <Badge key={m} variant="outline">{m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {detailEncounter.followUpScheduled && (
                  <div className="rounded-md bg-primary/5 p-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Follow-up scheduled: {detailEncounter.followUpType} on {new Date(detailEncounter.followUpScheduled).toLocaleDateString('en-AU')}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ClinicalLayout>
  );
}
