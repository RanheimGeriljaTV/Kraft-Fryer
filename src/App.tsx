import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PresetBar from './components/PresetBar';
import SegmentedToggle, { type ToggleOption } from './components/SegmentedToggle';
import Stepper from './components/Stepper';
import ResultCard from './components/ResultCard';
import { PRESETS, findPreset } from './data/presets';
import {
  OVEN_MINUTES,
  OVEN_TEMP,
  QUICK_MINUTES,
  TEMP_REDUCTION,
  TIME_FACTOR,
  convert,
  type Load,
  type OvenType,
} from './lib/convert';
import { fromConvert, fromPreset } from './lib/settings';

const formatFactor = (factor: number) => `× ${factor.toFixed(2).replace('.', ',')}`;

const OVEN_OPTIONS: readonly ToggleOption<OvenType>[] = [
  {
    value: 'conventional',
    label: 'Over-/undervarme',
    hint: `−${TEMP_REDUCTION.conventional} °C`,
  },
  { value: 'fan', label: 'Varmluft', hint: `−${TEMP_REDUCTION.fan} °C` },
];

const LOAD_OPTIONS: readonly ToggleOption<Load>[] = [
  { value: 'normal', label: 'Normalt (1 lag)', hint: `tid ${formatFactor(TIME_FACTOR.normal)}` },
  { value: 'full', label: 'Full kurv / Mye mat', hint: `tid ${formatFactor(TIME_FACTOR.full)}` },
];

export default function App() {
  const [ovenType, setOvenType] = useState<OvenType>('conventional');
  const [ovenTemp, setOvenTemp] = useState<number>(OVEN_TEMP.default);
  const [ovenMinutes, setOvenMinutes] = useState<number>(OVEN_MINUTES.default);
  const [load, setLoad] = useState<Load>('normal');
  const [presetId, setPresetId] = useState<string | null>(null);

  const preset = findPreset(presetId);
  const settings = preset
    ? fromPreset(preset)
    : fromConvert(convert({ ovenType, ovenTemp, ovenMinutes, load }));

  /**
   * ×-knappen forsvinner når hurtigvalget fjernes. Fokus flyttes til hurtigvalg-knappen,
   * så tastatur- og skjermleserbrukere ikke havner på toppen av siden.
   */
  const clearPreset = () => {
    const id = presetId;
    setPresetId(null);
    document
      .querySelector<HTMLButtonElement>(`[data-preset-id="${id}"]`)
      ?.focus({ preventScroll: true });
  };

  /** Enhver endring i oppskriftsfeltene går tilbake til omregning. */
  const edit =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setPresetId(null);
      setter(value);
    };

  return (
    <div
      className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-6 px-4 pt-4 pb-4"
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <Header />

      <main className="flex flex-1 flex-col gap-5">
        <PresetBar presets={PRESETS} activeId={presetId} onSelect={setPresetId} />

        <div className={`flex flex-col gap-5 transition-opacity ${preset ? 'opacity-60' : ''}`}>
          <p className="text-sm leading-relaxed text-zinc-400">
            {preset
              ? 'Hurtigvalg er i bruk. Endrer du noe under, regner vi om oppskriften i stedet.'
              : 'Eller skriv inn det som står i stekeovnsoppskriften, så regner vi om til airfryer.'}
          </p>

          <SegmentedToggle
            index={1}
            label="Ovnstype i oppskriften"
            options={OVEN_OPTIONS}
            value={ovenType}
            onChange={edit(setOvenType)}
          />

          <Stepper
            index={2}
            label="Temperatur i oppskriften"
            name="Temperatur i oppskriften"
            value={ovenTemp}
            min={OVEN_TEMP.min}
            max={OVEN_TEMP.max}
            step={OVEN_TEMP.step}
            unit="°C"
            onChange={edit(setOvenTemp)}
          />

          <Stepper
            index={3}
            label="Tid i oppskriften"
            name="Tid i oppskriften"
            value={ovenMinutes}
            min={OVEN_MINUTES.min}
            max={OVEN_MINUTES.max}
            step={OVEN_MINUTES.step}
            unit="min"
            quickValues={QUICK_MINUTES}
            onChange={edit(setOvenMinutes)}
          />

          <SegmentedToggle
            index={4}
            label="Mengde i kurven"
            options={LOAD_OPTIONS}
            value={load}
            onChange={edit(setLoad)}
          />
        </div>

        <ResultCard settings={settings} onClearPreset={clearPreset} />
      </main>

      <Footer />
    </div>
  );
}
