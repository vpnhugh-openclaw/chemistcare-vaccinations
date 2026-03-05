const STORAGE_KEY = 'chemistcare:audit:v1';

export interface AuditEntry {
  id: string;
  at: string;
  consultId: string;
  action: string;
  details?: Record<string, unknown>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function appendAudit(entry: Omit<AuditEntry, 'id' | 'at'>): AuditEntry {
  const full: AuditEntry = {
    id: generateId(),
    at: new Date().toISOString(),
    ...entry,
  };
  try {
    const existing = listAudit();
    existing.unshift(full);
    // Keep max 500 entries
    const capped = existing.slice(0, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Storage full or unavailable
    console.warn('[AuditStore] Failed to persist audit entry');
  }
  return full;
}

export function listAudit(filters?: {
  search?: string;
  from?: string;
  to?: string;
}): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    let entries: AuditEntry[] = JSON.parse(raw);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      entries = entries.filter(
        e => e.action.toLowerCase().includes(q) ||
             e.consultId.toLowerCase().includes(q) ||
             JSON.stringify(e.details || {}).toLowerCase().includes(q)
      );
    }
    if (filters?.from) {
      entries = entries.filter(e => e.at >= filters.from!);
    }
    if (filters?.to) {
      entries = entries.filter(e => e.at <= filters.to!);
    }

    return entries;
  } catch {
    return [];
  }
}

export function clearAudit(): void {
  localStorage.removeItem(STORAGE_KEY);
}
