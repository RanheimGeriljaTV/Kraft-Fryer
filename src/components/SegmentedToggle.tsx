import { useId, useRef } from 'react';
import SectionLabel from './SectionLabel';

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string> {
  index: number;
  label: string;
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Store valgknapper side om side (radiogruppe). Piltaster flytter valget. */
export default function SegmentedToggle<T extends string>({
  index,
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  const labelId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent, i: number) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = (i + delta + options.length) % options.length;
    onChange(options[next].value);
    buttons.current[next]?.focus();
  };

  return (
    <section className="space-y-2.5">
      <SectionLabel index={index} id={labelId}>
        {label}
      </SectionLabel>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5"
      >
        {options.map((option, i) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, i)}
              className={`flex min-h-16 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center transition select-none ${
                selected
                  ? 'bg-accent text-black shadow-lg shadow-orange-500/10'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-sm leading-tight font-bold">{option.label}</span>
              {option.hint && (
                <span
                  className={`font-mono text-[11px] ${selected ? 'text-black/70' : 'text-zinc-500'}`}
                >
                  {option.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
