import type { OutputFormat } from "@one-convert/types";

interface QualitySliderProps {
  readonly value: number; // 0–1
  readonly onChange: (quality: number) => void;
  readonly format: OutputFormat;
  readonly disabled?: boolean;
}

const LOSSY_FORMATS: OutputFormat[] = ["jpg", "webp", "avif"];

export function QualitySlider({
  value,
  onChange,
  format,
  disabled = false,
}: QualitySliderProps) {
  if (!LOSSY_FORMATS.includes(format)) return null;

  const pct = Math.round(value * 100);

  return (
    <div
      className="flex items-center gap-2"
      style={{
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <style>{`
        .oc-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 80px;
          height: 4px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
          background: linear-gradient(
            to right,
            var(--color-foreground) 0%,
            var(--color-foreground) ${pct}%,
            var(--color-border) ${pct}%,
            var(--color-border) 100%
          );
        }
        .oc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-background);
          border: 2px solid var(--color-foreground);
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .oc-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-foreground) 12%, transparent);
        }
        .oc-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-background);
          border: 2px solid var(--color-foreground);
          cursor: pointer;
        }
        .oc-slider::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: var(--color-border);
        }
        .oc-slider::-moz-range-progress {
          height: 4px;
          border-radius: 9999px;
          background: var(--color-foreground);
        }
      `}</style>

      <input
        type="range"
        min={10}
        max={100}
        step={1}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="oc-slider"
        title={`Quality: ${pct}%`}
      />

      <span
        className="w-6 text-right font-mono text-[11px] tabular-nums"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {pct}
      </span>
    </div>
  );
}
