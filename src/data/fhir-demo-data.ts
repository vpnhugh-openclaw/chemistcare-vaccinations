export interface FhirPatient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  medicare: string;
  recentScripts: { drug: string; date: string; prescriber: string }[];
  pbsTotal: string;
  mbsTotal: string;
}

export const fhirDemoPatients: FhirPatient[] = [
  {
    id: "PT-001", name: "Margaret Smith", dob: "1954-03-12", gender: "Female", medicare: "2345 67890 1",
    recentScripts: [
      { drug: "Metformin 500mg", date: "2026-02-18", prescriber: "Dr J. Chen" },
      { drug: "Atorvastatin 40mg", date: "2026-02-18", prescriber: "Dr J. Chen" },
      { drug: "Perindopril 5mg", date: "2026-01-10", prescriber: "Dr J. Chen" },
    ],
    pbsTotal: "$142.80", mbsTotal: "$312.00",
  },
  {
    id: "PT-002", name: "James Wilson", dob: "1968-07-25", gender: "Male", medicare: "3456 78901 2",
    recentScripts: [
      { drug: "Apixaban 5mg", date: "2026-02-20", prescriber: "Dr S. Patel" },
      { drug: "Rosuvastatin 10mg", date: "2026-01-15", prescriber: "Dr S. Patel" },
    ],
    pbsTotal: "$98.60", mbsTotal: "$187.50",
  },
  {
    id: "PT-003", name: "Susan Brown", dob: "1972-11-03", gender: "Female", medicare: "4567 89012 3",
    recentScripts: [
      { drug: "Sertraline 50mg", date: "2026-02-22", prescriber: "Dr A. Nguyen" },
      { drug: "Esomeprazole 20mg", date: "2026-02-22", prescriber: "Dr A. Nguyen" },
      { drug: "Salbutamol inhaler", date: "2026-01-28", prescriber: "Dr A. Nguyen" },
      { drug: "Fluticasone/Salmeterol", date: "2026-01-28", prescriber: "Dr A. Nguyen" },
    ],
    pbsTotal: "$210.40", mbsTotal: "$425.00",
  },
  {
    id: "PT-004", name: "David Lee", dob: "1945-01-19", gender: "Male", medicare: "5678 90123 4",
    recentScripts: [
      { drug: "Insulin glargine", date: "2026-02-25", prescriber: "Dr M. Ali" },
      { drug: "Empagliflozin 25mg", date: "2026-02-25", prescriber: "Dr M. Ali" },
      { drug: "Pregabalin 75mg", date: "2026-02-10", prescriber: "Dr M. Ali" },
    ],
    pbsTotal: "$320.10", mbsTotal: "$540.00",
  },
  {
    id: "PT-005", name: "Catherine Taylor", dob: "1980-06-30", gender: "Female", medicare: "6789 01234 5",
    recentScripts: [
      { drug: "Amoxicillin 500mg", date: "2026-03-01", prescriber: "Dr K. Wang" },
    ],
    pbsTotal: "$16.46", mbsTotal: "$78.00",
  },
];
