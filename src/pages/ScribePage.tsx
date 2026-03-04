import { ClinicalLayout } from '@/components/ClinicalLayout';
import { ScribeRecorder } from '@/components/scribe/ScribeRecorder';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';

export default function ScribePage() {
  const [transcript, setTranscript] = useState('');
  const [editedNote, setEditedNote] = useState('');

  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
    if (!editedNote) setEditedNote(text);
  };

  const downloadNote = () => {
    const blob = new Blob([editedNote || transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scribe-note-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Clinical Scribe</h1>
          <p className="text-sm text-muted-foreground">Record consultations and generate transcriptions in real-time</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recorder */}
          <ScribeRecorder onTranscriptChange={handleTranscriptChange} />

          {/* Editable note */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Clinical Note
              </CardTitle>
              {(editedNote || transcript) && (
                <Button size="sm" variant="outline" onClick={downloadNote} className="gap-1.5 h-8">
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedNote || transcript}
                onChange={(e) => setEditedNote(e.target.value)}
                placeholder="Your clinical note will appear here after recording. You can edit it freely."
                className="min-h-[340px] text-sm leading-relaxed resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-2">
                Review your note before use to ensure it accurately represents the visit.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClinicalLayout>
  );
}
