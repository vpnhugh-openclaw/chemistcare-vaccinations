import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image, Trash2, Eye } from "lucide-react";

export interface AttachmentFile {
  id: string;
  file: File | null;
  file_name: string;
  file_type: string;
  category: string;
  notes: string;
  storage_path: string;
  filesize: number;
  uploaded_at: string;
  preview_url?: string;
}

interface Props {
  attachments: AttachmentFile[];
  onChange: (attachments: AttachmentFile[]) => void;
  consentPdfNeeded: boolean;
}

export function AttachmentsSection({ attachments, onChange, consentPdfNeeded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments: AttachmentFile[] = Array.from(files).map(file => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'OTHER';
      const fileType = ['PDF', 'JPG', 'JPEG', 'PNG'].includes(ext) ? (ext === 'JPEG' ? 'JPG' : ext) : 'OTHER';
      return {
        id: crypto.randomUUID(),
        file,
        file_name: file.name,
        file_type: fileType as string,
        category: 'OTHER',
        notes: '',
        storage_path: '',
        filesize: file.size,
        uploaded_at: new Date().toISOString(),
        preview_url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };
    });
    
    onChange([...attachments, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateAttachment = (index: number, data: Partial<AttachmentFile>) => {
    const updated = [...attachments];
    updated[index] = { ...updated[index], ...data };
    onChange(updated);
  };

  const removeAttachment = (index: number) => {
    const att = attachments[index];
    if (att.preview_url) URL.revokeObjectURL(att.preview_url);
    onChange(attachments.filter((_, i) => i !== index));
  };

  const hasConsent = attachments.some(a => a.category === 'CONSENT_FORM');
  const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Attachments</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Upload consent forms, GP reports, handwritten notes (PDF, JPG, PNG).</p>
        </div>
        <div className="flex items-center gap-2">
          {consentPdfNeeded && !hasConsent && (
            <Badge className="clinical-badge-warning">Consent form missing</Badge>
          )}
          <Badge variant="outline">{attachments.length} file{attachments.length !== 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dt = e.dataTransfer;
            if (dt.files.length > 0) {
              const input = fileInputRef.current;
              if (input) {
                const dataTransfer = new DataTransfer();
                Array.from(dt.files).forEach(f => dataTransfer.items.add(f));
                input.files = dataTransfer.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
          <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, PNG accepted</p>
        </div>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileSelect} />

        {attachments.map((att, i) => (
          <div key={att.id} className="flex items-start gap-3 border rounded-lg p-3">
            <div className="shrink-0 mt-1">
              {att.preview_url ? (
                <img src={att.preview_url} alt="" className="h-12 w-12 rounded object-cover" />
              ) : att.file_type === 'PDF' ? (
                <div className="h-12 w-12 rounded bg-destructive/10 flex items-center justify-center"><FileText className="h-5 w-5 text-destructive" /></div>
              ) : (
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center"><Image className="h-5 w-5 text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{att.file_name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(att.filesize)} · {att.file_type}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeAttachment(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Category</Label>
                  <Select value={att.category} onValueChange={(v) => updateAttachment(i, { category: v })}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSENT_FORM">Consent Form</SelectItem>
                      <SelectItem value="GP_REPORT">GP Report</SelectItem>
                      <SelectItem value="PATIENT_REPORT">Patient Report</SelectItem>
                      <SelectItem value="HANDWRITTEN_NOTES">Handwritten Notes</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px]">Notes</Label>
                  <Input className="h-7 text-xs" value={att.notes} onChange={(e) => updateAttachment(i, { notes: e.target.value })} placeholder="Optional" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
