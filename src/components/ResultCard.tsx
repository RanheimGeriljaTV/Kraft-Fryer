import { AIRFRYER_MAX_TEMP, shakeMinutesLabel, type ConvertResult } from '../lib/convert';

interface Props {
  result: ConvertResult;
}

/** Resultatet, festet nederst på skjermen så det alltid er synlig. */
export default function ResultCard({ result }: Props) {
  const { airTemp, capped, airMinutes, shakeAtSeconds } = result;
  const shake = shakeMinutesLabel(shakeAtSeconds);

  return (
    <section
      aria-label="Airfryer-innstillinger"
      className="sticky bottom-0 z-10 -mx-4 border-t border-white/10 bg-brand-navy/95 px-4 pt-3 shadow-[0_-12px_30px_rgba(0,0,0,0.5)] backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div aria-live="polite" aria-atomic="true" className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-syne text-xs font-bold tracking-wider text-accent uppercase">
            I airfryeren
          </span>
          <span className="flex items-center gap-1.5 text-sm text-zinc-300">
            <span aria-hidden="true">🔄</span>
            <span>
              Rist etter{' '}
              <strong className="text-white">
                {shake.approx ? 'ca. ' : ''}
                {shake.minutes} min
              </strong>
            </span>
          </span>
          <span className="sr-only">
            {airTemp} grader i {airMinutes} minutter.
          </span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-white/10" aria-hidden="true">
          <div className="font-syne text-4xl leading-none font-black tracking-tighter text-white tabular-nums">
            {airTemp}
            <span className="ml-1 text-lg tracking-normal text-accent">°C</span>
          </div>
          <div className="pl-4 font-syne text-4xl leading-none font-black tracking-tighter text-white tabular-nums">
            {airMinutes}
            <span className="ml-1 text-lg tracking-normal text-accent">min</span>
          </div>
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
      </div>
    </section>
  );
}
