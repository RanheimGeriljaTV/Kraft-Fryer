import { AIRFRYER_MAX_TEMP, shakeMinutesLabel } from '../lib/convert';
import { MIDWAY_ICON, MIDWAY_VERB, type AirfryerSettings } from '../lib/settings';
import { useAnnouncement } from '../hooks/useAnnouncement';
import { useAirfryerTimer } from '../hooks/useAirfryerTimer';
import { ChangedPrompt, DoneRow, MidwayBanner, StartButton, TimerRow } from './Timer';

const ANNOUNCE_DELAY_MS = 700;

interface Props {
  settings: AirfryerSettings;
  /** Vises som ×-knapp når et hurtigvalg er aktivt. */
  onClearPreset?: () => void;
}

/**
 * Resultatet, festet nederst på skjermen så det alltid er synlig.
 * Kortet holdes lavt: startknappen står på samme rad som tallene, og mens klokka
 * går, tar nedtellingen plassen til tallene (som flyttes opp i toppraden).
 */
export default function ResultCard({ settings, onClearPreset }: Props) {
  const { temp, minutes, capped, timeBoostPercent, midway, preset, note } = settings;
  const timer = useAirfryerTimer(settings);
  const timerShown = timer.active || timer.status === 'done';
  const midwayTime = midway && shakeMinutesLabel(midway.atSeconds);
  const summary = `${preset ? `${preset.name}: ` : ''}${temp} grader i ${minutes} minutter.`;

  // Skjermlesere får resultatet først når verdien har stått stille litt,
  // ellers leses hvert steg opp mens man drar i slideren eller holder inne +.
  const announcement = useAnnouncement(summary, ANNOUNCE_DELAY_MS);

  const bigNumber =
    'font-syne text-[1.625rem] min-[370px]:text-[1.75rem] min-[420px]:text-3xl leading-none font-black tracking-tighter text-white tabular-nums';

  return (
    <section
      aria-label="Airfryer-innstillinger"
      className="sticky bottom-0 z-10 -mx-4 border-t border-white/10 bg-brand-navy/95 px-4 pt-2.5 shadow-[0_-12px_30px_rgba(0,0,0,0.5)] backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border"
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
    >
      <div className="space-y-2">
        <p aria-live="polite" aria-atomic="true" className="sr-only" data-testid="announcement">
          {announcement && `Nytt resultat: ${announcement}`}
        </p>

        <div className="flex min-h-5 items-center justify-between gap-2">
          {preset ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden="true">{preset.emoji}</span>
              <span className="truncate font-syne text-xs font-bold tracking-wider text-accent uppercase">
                {preset.name}
              </span>
              {onClearPreset && (
                // Liten ×, men 48 × 48 px trykkflate (negativ marg holder raden lav).
                <button
                  type="button"
                  onClick={onClearPreset}
                  data-umami-event="preset_clear"
                  aria-label="Fjern hurtigvalg og gå tilbake til oppskriften"
                  className="-my-3.5 -ml-2 flex size-12 shrink-0 touch-manipulation items-center justify-center text-zinc-400 transition hover:text-white"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-6 items-center justify-center rounded-full border border-white/15 text-sm leading-none"
                  >
                    ×
                  </span>
                </button>
              )}
            </span>
          ) : (
            <span className="font-syne text-xs font-bold tracking-wider text-accent uppercase">
              I airfryeren
            </span>
          )}

          {timerShown ? (
            <span className="shrink-0 font-mono text-xs text-zinc-300">
              {temp} °C · {minutes} min
            </span>
          ) : (
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
                <span className="text-zinc-400">Trenger ikke ristes</span>
              )}
            </span>
          )}
        </div>

        <MidwayBanner timer={timer} />

        {timer.status === 'done' ? (
          <DoneRow timer={timer} />
        ) : timer.active ? (
          <TimerRow timer={timer} />
        ) : (
          <div className="flex items-center gap-3">
            {/* Bredden følger innholdet, så tallene aldri glir inn i skillelinjen. */}
            <div className="flex min-w-0 flex-1 items-center">
              <span className="sr-only">{summary}</span>
              {/* key gjør at tallet «spretter» når det endres (av ved redusert bevegelse). */}
              <div
                key={`t${temp}`}
                aria-hidden="true"
                className={`animate-pop pr-2.5 whitespace-nowrap ${bigNumber}`}
              >
                {temp}
                <span className="ml-0.5 text-sm tracking-normal text-accent">°C</span>
              </div>
              <div
                key={`m${minutes}`}
                aria-hidden="true"
                className={`animate-pop border-l border-white/10 pl-2.5 whitespace-nowrap ${bigNumber}`}
              >
                {minutes}
                <span className="ml-0.5 text-sm tracking-normal text-accent">min</span>
              </div>
            </div>

            <StartButton timer={timer} minutes={minutes} />
          </div>
        )}

        {!timerShown && capped && (
          <p role="note" className="flex gap-2 text-xs leading-relaxed text-orange-200/90">
            <span aria-hidden="true">⚠️</span>
            <span>
              Maks {AIRFRYER_MAX_TEMP} °C på de fleste airfryere
              {timeBoostPercent ? ` – tiden er økt ${timeBoostPercent} % for å veie opp` : ''}.
            </span>
          </p>
        )}

        {!timerShown && note && (
          <p className="flex gap-2 text-xs leading-relaxed text-zinc-300">
            <span aria-hidden="true">💡</span>
            <span>{note}</span>
          </p>
        )}

        <ChangedPrompt timer={timer} minutes={minutes} />
      </div>
    </section>
  );
}
