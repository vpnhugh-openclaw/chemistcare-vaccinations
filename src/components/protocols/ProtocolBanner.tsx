import { Shield, ExternalLink } from 'lucide-react';

interface ProtocolBannerProps {
  name: string;
  version: string;
  jurisdiction: string;
  effectiveDate: string;
  sourceUrl?: string;
}

export function ProtocolBanner({ name, version, jurisdiction, effectiveDate, sourceUrl }: ProtocolBannerProps) {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-2.5">
      <div className="flex items-center gap-3">
        <Shield className="h-4 w-4 text-accent shrink-0" />
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-foreground">{name}</span>
          <span className="text-muted-foreground">v{version}</span>
          <span className="clinical-badge clinical-badge-info">{jurisdiction}</span>
          <span className="text-muted-foreground">Effective: {effectiveDate}</span>
        </div>
      </div>
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent flex items-center gap-1 hover:underline">
          Protocol Reference <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
