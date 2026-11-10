import { useId } from 'react';
import { clamp } from '../lib/convert';
import { useRepeatPress } from '../hooks/useRepeatPress';
import SectionLabel from './SectionLabel';

interface Props {
  index: number;
  label: string;
  /** Navn for skjermlesere, f.eks. «Temperatur i oppskrift». */
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  quickValues?: readonly number[];
}

/** Stor verdi med −/+ (gjentas ved langt trykk), slider og valgfrie hurtigknapper. */
export default function Stepper({
  index,
  label,
  name,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  quickValues,
}: Props) {
  const labelId = useId();
  const set = (next: number) => onChange(clamp(next, min, max));
  const decrease = useRepeatPress(() => set(value - step), value > min);
  const increase = useRepeatPress(() => set(value + step), value < max);
  const fill = ((value - min) / (max - min)) * 100;

  const roundButton =
    'flex size-14 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-syne text-2xl font-bold text-white transition select-none hover:border-accent/50 active:scale-95 active:bg-accent active:text-black disabled:opacity-30 disabled:active:scale-100 disabled:active:bg-white/[0.04] disabled:active:text-white';

  return (
    <section
      aria-labelledby={labelId}
      className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
    >
      <SectionLabel index={index} id={labelId}>
        {label}
      </SectionLabel>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label={`Mindre ${name.toLowerCase()}`}
          disabled={value <= min}
          className={roundButton}
          {...decrease}
        >
          −
        </button>
        <output className="font-syne text-5xl font-black tracking-tighter text-white tabular-nums">
          {value}
          <span className="ml-1 text-2xl text-zinc-400">{unit}</span>
        </output>
        <button
          type="button"
          aria-label={`Mer ${name.toLowerCase()}`}
          disabled={value >= max}
          className={roundButton}
          {...increase}
        >
          +
        </button>
      </div>

      <input
        type="range"
        className="range"
        aria-label={name}
        aria-valuetext={`${value} ${unit}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => set(Number(event.target.value))}
        style={{ '--fill': `${fill}%` } as React.CSSProperties}
      />
      <div className="-mt-2 flex justify-between font-mono text-[11px] text-zinc-500">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>

      {quickValues && (
        <div className="grid grid-cols-4 gap-2">
          {quickValues.map((quick) => (
            <button
              key={quick}
              type="button"
              aria-pressed={quick === value}
              aria-label={`${quick} ${unit}`}
              onClick={() => set(quick)}
              className={`min-h-12 touch-manipulation rounded-full border font-mono text-sm font-bold transition select-none ${
                quick === value
                  ? 'border-accent bg-accent text-black'
                  : 'border-white/10 text-zinc-300 hover:border-accent/50 hover:text-white'
              }`}
            >
              {quick}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
