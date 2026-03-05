import type { SafetyAlert, SafetyResult } from '@/types/safety';
import { INTERACTIONS, PREGNANCY_CONTRAINDICATED, ALLERGY_MAP } from '@/data/safety-demo-data';

interface SafetyInput {
  allergies: string[];
  currentMeds: string[];
  selectedTreatments: string[];
  sex?: string;
  pregnancyStatus?: string;
  jurisdiction?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function matchesMed(rule: string, med: string): boolean {
  const r = normalize(rule);
  const m = normalize(med);
  return m.includes(r) || r.includes(m);
}

export function evaluateSafety(input: SafetyInput): SafetyResult {
  const alerts: SafetyAlert[] = [];
  let idCounter = 0;

  const allMeds = [...input.currentMeds.map(normalize), ...input.selectedTreatments.map(normalize)];

  // 1. Drug-drug interactions
  for (const rule of INTERACTIONS) {
    const aMatch = allMeds.some(m => matchesMed(rule.a, m));
    const bMatch = allMeds.some(m => matchesMed(rule.b, m));
    if (aMatch && bMatch) {
      alerts.push({
        id: `int-${idCounter++}`,
        severity: rule.severity,
        title: `Drug interaction: ${rule.a} + ${rule.b}`,
        details: rule.message,
        blocker: rule.blocker,
        source: 'interaction',
        recommendedAction: rule.blocker ? 'Do not co-prescribe without specialist advice' : 'Monitor and counsel patient',
      });
    }
  }

  // 2. Pregnancy contraindications
  if (input.pregnancyStatus === 'pregnant' || input.pregnancyStatus === 'possibly_pregnant') {
    for (const rule of PREGNANCY_CONTRAINDICATED) {
      if (input.selectedTreatments.some(t => matchesMed(rule.medicine, t))) {
        alerts.push({
          id: `preg-${idCounter++}`,
          severity: rule.severity,
          title: `Pregnancy risk: ${rule.medicine}`,
          details: rule.message,
          blocker: rule.blocker,
          source: 'pregnancy',
          recommendedAction: 'Select alternative therapy safe in pregnancy',
        });
      }
    }
  }

  // 3. Allergy cross-reactivity
  for (const [allergyClass, meds] of Object.entries(ALLERGY_MAP)) {
    const patientAllergic = input.allergies.some(a => matchesMed(allergyClass, a) || meds.some(m => matchesMed(m, a)));
    if (patientAllergic) {
      for (const treatment of input.selectedTreatments) {
        if (meds.some(m => matchesMed(m, treatment))) {
          alerts.push({
            id: `allergy-${idCounter++}`,
            severity: 'danger',
            title: `Allergy risk: ${treatment} (${allergyClass} class)`,
            details: `Patient has ${allergyClass} allergy. ${treatment} may cause cross-reactivity.`,
            blocker: true,
            source: 'allergy',
            recommendedAction: 'Select alternative from different drug class',
          });
        }
      }
    }
  }

  // 4. Duplicate therapy (same med in current + selected)
  for (const treatment of input.selectedTreatments) {
    if (input.currentMeds.some(m => matchesMed(treatment, m))) {
      alerts.push({
        id: `dup-${idCounter++}`,
        severity: 'warn',
        title: `Possible duplicate: ${treatment}`,
        details: `${treatment} appears to already be in the patient's current medication list.`,
        blocker: false,
        source: 'duplicate',
        recommendedAction: 'Confirm not a true duplicate before proceeding',
      });
    }
  }

  const blockers = alerts.filter(a => a.blocker);
  const score = Math.max(0, 100 - (blockers.length * 40) - (alerts.filter(a => !a.blocker).length * 10));

  return { score, alerts, blockers };
}
