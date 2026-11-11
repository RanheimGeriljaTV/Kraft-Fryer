import { useId } from 'react';
import { formatPresetMinutes, type Preset } from '../data/presets';
import SectionLabel from './SectionLabel';

interface Props {
  presets: readonly Preset[];
  activeId: string | null;
  /** Kalles med null når det aktive hurtigvalget trykkes på nytt. */
  onSelect: (id: string | null) => void;
}

/**
 * Hurtigvalg for varer uten oppskrift, som et rutenett med små bokser (3 i bredden).
 * Alle synes uten sveiping, og flere varer gir bare en ny rad.
 */
export default function PresetBar({ presets, activeId, onSelect }: Props) {
  const labelId = useId();

  return (
    <section aria-labelledby={labelId} className="space-y-2.5">
      <SectionLabel id={labelId}>Hurtigvalg uten oppskrift</SectionLabel>
      <ul className="grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const active = preset.id === activeId;
          return (
            <li key={preset.id} className="min-w-0">
              <button
                type="button"
                aria-pressed={active}
                data-umami-event={`preset_${preset.id}`}
                data-preset-id={preset.id}
                onClick={() => onSelect(active ? null : preset.id)}
                className={`flex h-full min-h-16 w-full touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl border px-0.5 py-2 text-center transition select-none ${
                  active
                    ? 'border-accent bg-accent text-black shadow-lg shadow-orange-500/10'
                    : 'border-white/10 bg-white/[0.02] text-white hover:border-accent/50'
                }`}
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  {preset.emoji}
                </span>
                <span className="w-full text-[11px] leading-tight font-bold break-words min-[360px]:text-xs">
                  {preset.label}
                </span>{' '}
                <span
                  className={`text-[11px] leading-tight text-balance ${
                    active ? 'text-black/70' : 'text-zinc-400'
                  }`}
                >
                  {preset.temp} °C · {formatPresetMinutes(preset)} min
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
