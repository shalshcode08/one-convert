import {
  FORMAT_LABEL,
  OUTPUT_FORMATS,
  type OutputFormat,
} from "@one-convert/types";
import { cn } from "@one-convert/ui";
import { useState } from "react";

interface FormatPickerProps {
  readonly value: OutputFormat;
  readonly onChange: (format: OutputFormat) => void;
  readonly disabled?: boolean;
}

export function FormatPicker({
  value,
  onChange,
  disabled = false,
}: FormatPickerProps) {
  const [hovered, setHovered] = useState<OutputFormat | null>(null);

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg border p-0.5"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-muted)",
      }}
      role="group"
      aria-label="Select output format"
    >
      {OUTPUT_FORMATS.map((format) => {
        const isActive = value === format;
        const isHovered = hovered === format && !isActive && !disabled;

        return (
          <button
            key={format}
            type="button"
            onClick={() => !disabled && onChange(format)}
            disabled={disabled}
            aria-pressed={isActive}
            aria-label={`Convert to ${FORMAT_LABEL[format]}`}
            onMouseEnter={() => setHovered(format)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "relative rounded-md px-3 py-1 text-xs font-medium transition-all duration-100 focus-visible:z-10",
              isActive
                ? "cursor-default shadow-[var(--shadow-xs)]"
                : "cursor-pointer",
              disabled && "pointer-events-none opacity-50",
            )}
            style={{
              backgroundColor:
                isActive || isHovered
                  ? "var(--color-background)"
                  : "transparent",
              color: isActive
                ? "var(--color-foreground)"
                : isHovered
                  ? "var(--color-foreground)"
                  : "var(--color-muted-foreground)",
              opacity: isHovered && !isActive ? 0.7 : 1,
            }}
          >
            {FORMAT_LABEL[format]}
          </button>
        );
      })}
    </div>
  );
}
