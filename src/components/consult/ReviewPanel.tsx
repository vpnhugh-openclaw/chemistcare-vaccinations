import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ConsultationCondition } from '@/lib/conditionRegistry';
import { buildClinicalNote, buildGpLetter, buildPatientSummary } from '@/lib/consultationNotes';
import { ConsultStatus } from '@/lib/consultStateMachine';
import {
  CheckCircle, FileText, Send, Loader2, AlertTriangle, Download,
  Trash2, Copy, XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewPanelProps {
  formData: Record<string, string>;
  condition?: ConsultationCondition;
  differentials: { diagnosis: string; reasonExcluded: string }[];
  hasRedFlagTriggered: boolean;
  consultStatus: ConsultStatus;
  consultId?: string;
  finalisedAt?: string;
  onFinalise: () => Promise<{ success: boolean; consultId?: string; error?: string }>;
  onDiscard: () => void;
  pinnedEvidence: { question: string; answer: string; sources: string[] }[];
}

export function ReviewPanel({
  formData, condition, differentials, hasRedFlagTriggered,
  consultStatus, consultId, finalisedAt, onFinalise, onDiscard, pinnedEvidence,
}: ReviewPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { toast } = useToast();

  const fullNote = buildClinicalNote({
    condition,
    patient: {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      dob: formData.dob || '',
      sex: formData.sex || '',
      allergies: formData.allergies || '',
      medications: formData.medications || '',
      gpName: formData.gpName || '',
    },
    assessment: Object.fromEntries(Object.entries(formData).filter(([key]) => key.startsWith('assess_')).map(([key, value]) => [key.replace(/^assess_/, ''), value])),
    differentials: {
      workingDiagnosis: formData.workingDiagnosis || '',
      items: differentials.filter((item) => item.diagnosis.trim()),
    },
    treatment: {
      selectedTherapy: formData.selectedTherapy || '',
      followUpPlan: formData.followUpPlan || '',
      safetyNet: formData.safetyNet || '',
      deviationJustification: formData.deviationJustification || '',
    },
    documentation: {
      clinicalNotes: formData.clinicalNotes || '',
      referralNotes: formData.referralNotes || '',
    },
    redFlagsChecked: {},
    hasRedFlagTriggered,
  });
  const gpLetter = buildGpLetter({
    condition,
    patient: {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      dob: formData.dob || '',
      gpName: formData.gpName || '',
    },
    differentials: {
      workingDiagnosis: formData.workingDiagnosis || '',
      items: differentials.filter((item) => item.diagnosis.trim()),
    },
    treatment: {
      selectedTherapy: formData.selectedTherapy || '',
    },
  });
  const patientSummary = buildPatientSummary({
    condition,
    patient: {
      firstName: formData.firstName || '',
    },
    treatment: {
      selectedTherapy: formData.selectedTherapy || '',
      followUpPlan: formData.followUpPlan || '',
      safetyNet: formData.safetyNet || '',
    },
  });

  const handleFinalise = async () => {
    setIsSubmitting(true);
    const result = await onFinalise();
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: '✅ Consultation Finalised',
        description: `Consult ID: ${result.consultId}`,
      });
    } else {
      toast({
        title: '❌ Finalisation Failed',
        description: result.error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    onDiscard();
    setShowDiscardConfirm(false);
    toast({ title: 'Draft discarded', description: 'All consultation data has been cleared.' });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  if (consultStatus === 'finalised') {
    return (
      <div className="space-y-4">
        <Card className="border-clinical-safe">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-clinical-safe flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg">Consultation Finalised</p>
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono">{consultId}</span>
                  {finalisedAt && <> · {new Date(finalisedAt).toLocaleString('en-AU')}</>}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/prescribing-log">View Prescribing Log</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/patients">View Patient</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/consultations/new">New Consultation</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <ReviewTabs
          fullNote={fullNote}
          gpLetter={gpLetter}
          patientSummary={patientSummary}
          onCopy={copyToClipboard}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Review & Finalise</h2>
        <Badge variant="outline" className="gap-1">
          {consultStatus === 'submitting' ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Submitting...</>
          ) : consultStatus === 'validated' ? (
            <><CheckCircle className="h-3 w-3 text-clinical-safe" /> Ready</>
          ) : (
            <><AlertTriangle className="h-3 w-3 text-clinical-warning" /> Draft</>
          )}
        </Badge>
      </div>

      <ReviewTabs
        fullNote={fullNote}
        gpLetter={gpLetter}
        patientSummary={patientSummary}
        onCopy={copyToClipboard}
      />

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {showDiscardConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-clinical-danger font-medium">Permanently discard this draft?</span>
              <Button variant="destructive" size="sm" onClick={handleDiscard} className="gap-1">
                <Trash2 className="h-3 w-3" /> Yes, discard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDiscardConfirm(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-clinical-danger gap-1"
              onClick={() => setShowDiscardConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Discard Draft
            </Button>
          )}
        </div>

        <Button
          onClick={handleFinalise}
          disabled={isSubmitting || consultStatus === 'submitting'}
          className="gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Finalising...</>
          ) : (
            <><Send className="h-4 w-4" /> Finalise Consultation</>
          )}
        </Button>
      </div>
    </div>
  );
}

function ReviewTabs({ fullNote, gpLetter, patientSummary, onCopy }: {
  fullNote: string; gpLetter: string; patientSummary: string;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <Tabs defaultValue="full-note">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="full-note" className="gap-1 text-xs">
          <FileText className="h-3 w-3" /> Full Note
        </TabsTrigger>
        <TabsTrigger value="gp-letter" className="gap-1 text-xs">
          <Send className="h-3 w-3" /> GP Letter
        </TabsTrigger>
        <TabsTrigger value="patient-summary" className="gap-1 text-xs">
          <FileText className="h-3 w-3" /> Patient Summary
        </TabsTrigger>
      </TabsList>

      {[
        { key: 'full-note', content: fullNote, label: 'Full Note' },
        { key: 'gp-letter', content: gpLetter, label: 'GP Letter' },
        { key: 'patient-summary', content: patientSummary, label: 'Patient Summary' },
      ].map(tab => (
        <TabsContent key={tab.key} value={tab.key}>
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-end gap-2 mb-2">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => onCopy(tab.content, tab.label)}>
                  <Copy className="h-3 w-3" /> Copy
                </Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  <Download className="h-3 w-3" /> PDF
                </Button>
              </div>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-[var(--font-mono)] text-foreground/80 max-h-[400px] overflow-auto">
                {tab.content}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

