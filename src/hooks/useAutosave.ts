import { useCallback, useEffect, useRef, useState } from 'react';

const AUTOSAVE_DEBOUNCE_MS = 1500;

export function useAutosave<T>(key: string, data: T, enabled = true) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoad = useRef(true);

  // Save to localStorage with debounce
  useEffect(() => {
    if (!enabled || initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSaving(true);

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        setLastSaved(new Date());
      } catch {
        // localStorage quota exceeded — fail silently
      }
      setIsSaving(false);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, data, enabled]);

  const loadDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
    setLastSaved(null);
  }, [key]);

  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(key) !== null;
  }, [key]);

  return { lastSaved, isSaving, loadDraft, clearDraft, hasDraft };
}
