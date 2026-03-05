export interface PbsItem {
  name: string;
  pbsCode: string;
  atcCode: string;
  manufacturer: string;
  packSize: string;
  priceDispensed: string;
  priceMax: string;
  restriction: string;
  schedule: string;
}

export const pbsDemoData: PbsItem[] = [
  { name: "Amoxicillin", pbsCode: "2263B", atcCode: "J01CA04", manufacturer: "Alphapharm", packSize: "20 capsules", priceDispensed: "$16.46", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Metformin hydrochloride", pbsCode: "2186H", atcCode: "A10BA02", manufacturer: "Apotex", packSize: "90 tablets", priceDispensed: "$12.22", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
  { name: "Atorvastatin", pbsCode: "8730P", atcCode: "C10AA05", manufacturer: "Pfizer", packSize: "30 tablets", priceDispensed: "$15.39", priceMax: "$42.50", restriction: "Restricted", schedule: "S4" },
  { name: "Paracetamol", pbsCode: "2168C", atcCode: "N02BE01", manufacturer: "Sanofi", packSize: "100 tablets", priceDispensed: "$9.49", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S2" },
  { name: "Esomeprazole", pbsCode: "8575D", atcCode: "A02BC05", manufacturer: "AstraZeneca", packSize: "30 tablets", priceDispensed: "$18.30", priceMax: "$42.50", restriction: "Restricted", schedule: "S4" },
  { name: "Rosuvastatin", pbsCode: "9081C", atcCode: "C10AA07", manufacturer: "AstraZeneca", packSize: "30 tablets", priceDispensed: "$14.99", priceMax: "$42.50", restriction: "Restricted", schedule: "S4" },
  { name: "Amlodipine", pbsCode: "8083Q", atcCode: "C08CA01", manufacturer: "Pfizer", packSize: "30 tablets", priceDispensed: "$11.49", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Sertraline", pbsCode: "8231E", atcCode: "N06AB06", manufacturer: "Pfizer", packSize: "30 tablets", priceDispensed: "$14.59", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Pantoprazole", pbsCode: "8522G", atcCode: "A02BC02", manufacturer: "Nycomed", packSize: "30 tablets", priceDispensed: "$16.10", priceMax: "$42.50", restriction: "Restricted", schedule: "S4" },
  { name: "Cefalexin", pbsCode: "1159L", atcCode: "J01DB01", manufacturer: "Alphapharm", packSize: "20 capsules", priceDispensed: "$13.89", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Fluoxetine", pbsCode: "8130Y", atcCode: "N06AB03", manufacturer: "Eli Lilly", packSize: "28 capsules", priceDispensed: "$13.25", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Perindopril", pbsCode: "8405W", atcCode: "C09AA04", manufacturer: "Servier", packSize: "30 tablets", priceDispensed: "$12.40", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Salbutamol inhaler", pbsCode: "1870G", atcCode: "R03AC02", manufacturer: "GSK", packSize: "1 inhaler", priceDispensed: "$10.99", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S3" },
  { name: "Prednisolone", pbsCode: "1780T", atcCode: "H02AB06", manufacturer: "Pfizer", packSize: "30 tablets", priceDispensed: "$11.99", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
  { name: "Doxycycline", pbsCode: "1429P", atcCode: "J01AA02", manufacturer: "Alphapharm", packSize: "28 capsules", priceDispensed: "$12.50", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Trimethoprim", pbsCode: "2080T", atcCode: "J01EA01", manufacturer: "Alphapharm", packSize: "14 tablets", priceDispensed: "$10.69", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Irbesartan", pbsCode: "8433B", atcCode: "C09CA04", manufacturer: "Sanofi", packSize: "30 tablets", priceDispensed: "$14.29", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Candesartan", pbsCode: "8411R", atcCode: "C09CA06", manufacturer: "AstraZeneca", packSize: "30 tablets", priceDispensed: "$13.59", priceMax: "$42.50", restriction: "Unrestricted", schedule: "S4" },
  { name: "Fluticasone / Salmeterol", pbsCode: "8623T", atcCode: "R03AK06", manufacturer: "GSK", packSize: "1 inhaler", priceDispensed: "$38.50", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
  { name: "Insulin glargine", pbsCode: "9245Q", atcCode: "A10AE04", manufacturer: "Sanofi", packSize: "5 pens", priceDispensed: "$35.80", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
  { name: "Empagliflozin", pbsCode: "11220H", atcCode: "A10BK03", manufacturer: "Boehringer", packSize: "30 tablets", priceDispensed: "$22.49", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
  { name: "Apixaban", pbsCode: "10808N", atcCode: "B01AF02", manufacturer: "BMS/Pfizer", packSize: "60 tablets", priceDispensed: "$39.80", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
  { name: "Duloxetine", pbsCode: "9377R", atcCode: "N06AX21", manufacturer: "Eli Lilly", packSize: "28 capsules", priceDispensed: "$19.99", priceMax: "$42.50", restriction: "Restricted", schedule: "S4" },
  { name: "Pregabalin", pbsCode: "9384G", atcCode: "N03AX16", manufacturer: "Pfizer", packSize: "56 capsules", priceDispensed: "$24.50", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
  { name: "Tiotropium bromide", pbsCode: "8726H", atcCode: "R03BB04", manufacturer: "Boehringer", packSize: "30 capsules", priceDispensed: "$36.99", priceMax: "$42.50", restriction: "Authority Required", schedule: "S4" },
];
