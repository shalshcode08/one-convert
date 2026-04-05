import { FORMAT_LABEL, OUTPUT_FORMATS, type OutputFormat } from "@one-convert/types";
import { cn } from "@one-convert/ui";

interface FormatPickerProps {
  readonly value: OutputFormat;
  readonly onChange: (format: OutputFormat) => void;
  readonly disabled?: boolean;
}

export function FormatPicker({ value, onChange, disabled = false }: FormatPickerProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Select output format">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Convert to
      </span>
      <div className="flex gap-1">
        {OUTPUT_FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => onChange(format)}
            disabled={disabled}
            aria-pressed={value === format}
            aria-label={`Convert to ${FORMAT_LABEL[format]}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              value === format
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {FORMAT_LABEL[format]}
          </button>
        ))}
      </div>
    </div>
  );
}
