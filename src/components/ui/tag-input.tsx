import * as React from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
}

const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  ({ value, onChange, placeholder = "Type and press Enter…", suggestions = [], className, disabled }, ref) => {
    const [input, setInput] = React.useState("");
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [selectedSuggestionIdx, setSelectedSuggestionIdx] = React.useState(-1);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const filtered = React.useMemo(() => {
      if (!input.trim() || suggestions.length === 0) return [];
      const lower = input.toLowerCase();
      return suggestions
        .filter(s => s.toLowerCase().includes(lower) && !value.includes(s))
        .slice(0, 8);
    }, [input, suggestions, value]);

    const addTag = (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInput("");
      setShowSuggestions(false);
      setSelectedSuggestionIdx(-1);
    };

    const removeTag = (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (showSuggestions && selectedSuggestionIdx >= 0 && filtered[selectedSuggestionIdx]) {
          addTag(filtered[selectedSuggestionIdx]);
        } else if (input.trim()) {
          addTag(input);
        }
      } else if (e.key === "Backspace" && !input && value.length > 0) {
        removeTag(value.length - 1);
      } else if (e.key === "ArrowDown" && showSuggestions) {
        e.preventDefault();
        setSelectedSuggestionIdx(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp" && showSuggestions) {
        e.preventDefault();
        setSelectedSuggestionIdx(prev => Math.max(prev - 1, -1));
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      setShowSuggestions(true);
      setSelectedSuggestionIdx(-1);
    };

    // Close suggestions on outside click
    React.useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <div
          ref={ref}
          className={cn(
            "flex flex-wrap items-center gap-1.5 min-h-[2.5rem] w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {value.map((tag, i) => (
            <Badge
              key={`${tag}-${i}`}
              variant="secondary"
              className="gap-1 py-0.5 pl-2 pr-1 text-xs font-normal shrink-0"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </Badge>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => input.trim() && setShowSuggestions(true)}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => addTag(input)}
              className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-[160px] overflow-auto">
            {filtered.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-xs hover:bg-accent/10 transition-colors",
                  i === selectedSuggestionIdx && "bg-accent/10"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
TagInput.displayName = "TagInput";

/** Parse a comma-separated string into an array (for backwards compatibility) */
export function parseTagString(val: string | string[] | undefined | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(",").map(s => s.trim()).filter(Boolean);
}

/** Serialise tags to comma-separated string for legacy storage */
export function tagsToString(tags: string[]): string {
  return tags.join(", ");
}

export { TagInput };
