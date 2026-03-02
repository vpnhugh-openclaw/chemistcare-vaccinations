import { useState } from 'react';
import { CalcSection, ScorePicker, DetailResult, ResultRow, ResultAdvice, ResultNote } from './shared';

const questions = [
  'In the past 4 weeks, how much did asthma keep you from getting as much done at work/school/home?',
  'How often have you had shortness of breath?',
  'How often did asthma symptoms wake you up at night or earlier than usual?',
  'How often have you used your reliever inhaler?',
  'How would you rate your asthma control?',
];

function getControl(score: number): { level: string; advice: string } {
  if (score >= 20) return {
    level: 'Well controlled',
    advice: 'Continue current therapy. Review in 3 months. Consider step-down if well controlled ≥3 months. Ensure good inhaler technique and adherence.',
  };
  if (score >= 16) return {
    level: 'Not well controlled',
    advice: 'Step up therapy: If on SABA-only → add low-dose ICS. If on low-dose ICS → increase to medium-dose or add LABA. Check inhaler technique, adherence, and trigger avoidance. Review in 4–6 weeks.',
  };
  return {
    level: 'Poorly controlled',
    advice: 'Urgent step-up: Ensure medium-dose ICS/LABA combination. Consider oral prednisolone short course if exacerbation. Review inhaler technique. Refer to respiratory specialist if no improvement. Follow-up within 2 weeks.',
  };
}

export function ACTCalculator() {
  const [scores, setScores] = useState([3, 3, 3, 3, 3]);
  const [r, setR] = useState<{ total: number; level: string; advice: string } | null>(null);
  const clear = () => { setScores([3, 3, 3, 3, 3]); setR(null); };
  const calc = () => {
    const total = scores.reduce((a, b) => a + b, 0);
    setR({ total, ...getControl(total) });
  };

  return (
    <CalcSection
      title="Asthma Control Test (ACT)"
      disclaimer="Validated 5-item questionnaire for patients ≥12 years. Each item scored 1 (worst) to 5 (best). Total 5–25. ≥20 = well controlled, 16–19 = not well controlled, ≤15 = poorly controlled."
      onClear={clear}
      onCalc={calc}
      result={r ? (
        <DetailResult>
          <ResultRow label="ACT Score" value={`${r.total}/25`} />
          <ResultRow label="Control level" value={r.level} />
          <ResultAdvice>{r.advice}</ResultAdvice>
          <ResultNote>Asthma Control Test™ (Nathan et al., 2004). Scores: 20–25 well controlled, 16–19 not well controlled, ≤15 poorly controlled.</ResultNote>
        </DetailResult>
      ) : null}
    >
      {questions.map((q, i) => (
        <ScorePicker
          key={i}
          label={`Q${i + 1}: ${q}`}
          value={scores[i]}
          onChange={v => setScores(prev => { const n = [...prev]; n[i] = v; return n; })}
        />
      ))}
    </CalcSection>
  );
}
