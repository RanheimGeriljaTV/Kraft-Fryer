import { useId } from 'react';
import { formatPresetMinutes, type Preset } from '../data/presets';
import SectionLabel from './SectionLabel';

interface Props {
  presets: readonly Preset[];
  activeId: string | null;
  /** Kalles med null når det aktive hurtigvalget trykkes på nytt. */
  onSelect: (id: string | null) => void;
}

/** Sveipbar rad med hurtigvalg for varer uten oppskrift. */
export default function PresetBar({ presets, activeId, onSelect }: Props) {
  const labelId = useId();

  return (
    <section aria-labelledby={labelId} className="space-y-2.5">
      <SectionLabel id={labelId}>Hurtigvalg uten oppskrift</SectionLabel>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-4 px-4 pb-1">
        {presets.map((preset) => {
          const active = preset.id === activeId;
          return (
            <li key={preset.id} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={active}
                data-umami-event={`preset_${preset.id}`}
                data-preset-id={preset.id}
                onClick={() => onSelect(active ? null : preset.id)}
                className={`flex min-h-16 touch-manipulation items-center gap-2.5 rounded-2xl border py-2 pr-4 pl-3 text-left transition select-none ${
                  active
                    ? 'border-accent bg-accent text-black shadow-lg shadow-orange-500/10'
                    : 'border-white/10 bg-white/[0.02] text-white hover:border-accent/50'
                }`}
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  {preset.emoji}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm leading-tight font-bold whitespace-nowrap">
                    {preset.label}
                  </span>{' '}
                  <span
                    className={`font-mono text-[11px] whitespace-nowrap ${
                      active ? 'text-black/70' : 'text-zinc-400'
                    }`}
                  >
                    {preset.temp} °C · {formatPresetMinutes(preset)} min
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
