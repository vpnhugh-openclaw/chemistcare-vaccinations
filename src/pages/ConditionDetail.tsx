import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useParams, useNavigate } from 'react-router-dom';
import { getConditionById } from '@/lib/conditionRegistry';
import { AlertTriangle, ArrowLeft, Shield, Pill, FileText, Clock, XCircle, CheckCircle } from 'lucide-react';

const ConditionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const condition = getConditionById(id || '');

  if (!condition) {
    return (
      <ClinicalLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Condition not found.</p>
          <Button variant="ghost" onClick={() => navigate('/conditions')} className="mt-2">← Back to library</Button>
        </div>
      </ClinicalLayout>
    );
  }

  return (
    <ClinicalLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/conditions')} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Conditions Library
        </Button>

        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold">{condition.name}</h1>
            <span className={`clinical-badge ${
              condition.category === 'acute' ? 'clinical-badge-danger' :
              condition.category === 'chronic' ? 'clinical-badge-info' :
              condition.category === 'preventive' ? 'clinical-badge-safe' :
              condition.category === 'travel' ? 'clinical-badge-info' : 'clinical-badge-warning'
            }`}>
              {condition.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{condition.description}</p>
          <p className="text-xs text-muted-foreground mt-1 italic">Reference: {condition.guidelineReference}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" /> Scope Validation Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {condition.scopeValidation.minAge && <div className="flex justify-between"><span className="text-muted-foreground">Minimum Age</span><span className="font-medium">{condition.scopeValidation.minAge} years</span></div>}
              {condition.scopeValidation.maxAge && <div className="flex justify-between"><span className="text-muted-foreground">Maximum Age</span><span className="font-medium">{condition.scopeValidation.maxAge} years</span></div>}
              {condition.scopeValidation.sexRestriction && <div className="flex justify-between"><span className="text-muted-foreground">Sex Restriction</span><span className="font-medium capitalize">{condition.scopeValidation.sexRestriction} only</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Pregnancy Excluded</span><span className="font-medium">{condition.scopeValidation.pregnancyExcluded ? 'Yes' : 'No'}</span></div>
              {condition.scopeValidation.temporalConstraint && <div className="flex justify-between"><span className="text-muted-foreground">Temporal</span><span className="font-medium">{condition.scopeValidation.temporalConstraint}</span></div>}
              {condition.scopeValidation.jurisdictionNotes && (<><Separator /><p className="text-muted-foreground italic">{condition.scopeValidation.jurisdictionNotes}</p></>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-clinical-danger" /> Red Flags ({condition.redFlags.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {condition.redFlags.map((rf) => (
                <div key={rf.id} className="flex items-start gap-2 text-xs">
                  <XCircle className="h-3.5 w-3.5 text-clinical-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{rf.description}</p>
                    <p className="text-muted-foreground capitalize">{rf.action.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" /> Assessment Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {condition.template.assessmentFields.map((field) => (
                  <Badge key={field.id} variant="secondary" className="text-xs font-normal">{field.label}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-clinical-warning" /> Follow-up & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p><span className="text-muted-foreground">Interval:</span> <span className="font-medium">{condition.followUpInterval}</span></p>
              {condition.monitoringChecklist && (
                <div className="space-y-1 mt-2">
                  {condition.monitoringChecklist.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-clinical-safe" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {condition.therapyOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Pill className="h-4 w-4 text-accent" /> Therapeutic Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {condition.therapyOptions.map((therapy) => (
                <div key={therapy.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">{therapy.medicineName}</h4>
                      <span className={`clinical-badge ${therapy.line === 'first' ? 'clinical-badge-safe' : therapy.line === 'second' ? 'clinical-badge-info' : 'clinical-badge-warning'}`}>{therapy.line}-line</span>
                      {therapy.authorityRequired && <span className="clinical-badge clinical-badge-danger">Authority Required</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-muted-foreground block">Dose</span><span className="font-medium">{therapy.dose}</span></div>
                    <div><span className="text-muted-foreground block">Frequency</span><span className="font-medium">{therapy.frequency}</span></div>
                    <div><span className="text-muted-foreground block">Duration</span><span className="font-medium">{therapy.duration}</span></div>
                    <div><span className="text-muted-foreground block">Max Qty / Repeats</span><span className="font-medium">{therapy.maxQuantity} / {therapy.repeats}</span></div>
                  </div>
                  {therapy.pbsRestriction && <p className="text-xs text-muted-foreground">PBS: {therapy.pbsRestriction}</p>}
                  {therapy.contraindications.length > 0 && <div className="text-xs"><span className="text-clinical-danger font-medium">Contraindications: </span>{therapy.contraindications.join(', ')}</div>}
                  {therapy.interactions.length > 0 && <div className="text-xs"><span className="text-clinical-warning font-medium">Interactions: </span>{therapy.interactions.join(', ')}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={() => navigate(`/consultations/new/${condition.slug}`)} className="gap-2">
            Start Consultation for {condition.name}
          </Button>
        </div>
      </div>
    </ClinicalLayout>
  );
};

export default ConditionDetail;
