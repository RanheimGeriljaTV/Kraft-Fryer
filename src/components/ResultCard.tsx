import { AIRFRYER_MAX_TEMP, shakeMinutesLabel } from '../lib/convert';
import { MIDWAY_ICON, MIDWAY_VERB, type AirfryerSettings } from '../lib/settings';

interface Props {
  settings: AirfryerSettings;
  /** Vises som ×-knapp når et hurtigvalg er aktivt. */
  onClearPreset?: () => void;
  /** Nedtellingsklokken, nederst i kortet. */
  children?: React.ReactNode;
}

/** Resultatet, festet nederst på skjermen så det alltid er synlig. */
export default function ResultCard({ settings, onClearPreset, children }: Props) {
  const { temp, minutes, capped, midway, preset } = settings;
  const midwayTime = midway && shakeMinutesLabel(midway.atSeconds);

  return (
    <section
      aria-label="Airfryer-innstillinger"
      className="sticky bottom-0 z-10 -mx-4 border-t border-white/10 bg-brand-navy/95 px-4 pt-3 shadow-[0_-12px_30px_rgba(0,0,0,0.5)] backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="space-y-2.5">
        <div className="flex min-h-6 items-center justify-between gap-2">
          {preset ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden="true">{preset.emoji}</span>
              <span className="truncate font-syne text-xs font-bold tracking-wider text-accent uppercase">
                {preset.name}
              </span>
            </span>
          ) : (
            <span className="font-syne text-xs font-bold tracking-wider text-accent uppercase">
              I airfryeren
            </span>
          )}

          <span className="flex shrink-0 items-center gap-1.5 text-sm text-zinc-300">
            {midway && midwayTime ? (
              <>
                <span aria-hidden="true">{MIDWAY_ICON[midway.action]}</span>
                <span>
                  {MIDWAY_VERB[midway.action]} etter{' '}
                  <strong className="text-white">
                    {midwayTime.approx ? 'ca. ' : ''}
                    {midwayTime.minutes} min
                  </strong>
                </span>
              </>
            ) : (
              <span className="text-zinc-500">Trenger ikke ristes</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="grid flex-1 grid-cols-2 divide-x divide-white/10"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">
              {preset ? `${preset.name}: ` : ''}
              {temp} grader i {minutes} minutter.
            </span>
            <div
              aria-hidden="true"
              className="font-syne text-4xl leading-none font-black tracking-tighter text-white tabular-nums"
            >
              {temp}
              <span className="ml-1 text-lg tracking-normal text-accent">°C</span>
            </div>
            <div
              aria-hidden="true"
              className="pl-4 font-syne text-4xl leading-none font-black tracking-tighter text-white tabular-nums"
            >
              {minutes}
              <span className="ml-1 text-lg tracking-normal text-accent">min</span>
            </div>
          </div>

          {preset && onClearPreset && (
            <button
              type="button"
              onClick={onClearPreset}
              aria-label="Fjern hurtigvalg og gå tilbake til oppskriften"
              className="flex size-12 shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/10 text-xl text-zinc-300 transition hover:border-accent/50 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {capped && (
          <p role="note" className="flex gap-2 text-xs leading-relaxed text-orange-200/90">
            <span aria-hidden="true">⚠️</span>
            <span>
              Satt til {AIRFRYER_MAX_TEMP} °C, som er maks på de fleste airfryere. Går din høyere,
              kan du bruke oppskriftens temperatur minus fradraget.
            </span>
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
