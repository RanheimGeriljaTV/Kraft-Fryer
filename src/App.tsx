import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SegmentedToggle, { type ToggleOption } from './components/SegmentedToggle';
import Stepper from './components/Stepper';
import ResultCard from './components/ResultCard';
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

  const result = convert({ ovenType, ovenTemp, ovenMinutes, load });

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
        <p className="text-sm leading-relaxed text-zinc-400">
          Skriv inn det som står i stekeovnsoppskriften, så regner vi om til airfryer.
        </p>

        <SegmentedToggle
          index={1}
          label="Ovnstype i oppskriften"
          options={OVEN_OPTIONS}
          value={ovenType}
          onChange={setOvenType}
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
          onChange={setOvenTemp}
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
          onChange={setOvenMinutes}
        />

        <SegmentedToggle
          index={4}
          label="Mengde i kurven"
          options={LOAD_OPTIONS}
          value={load}
          onChange={setLoad}
        />

        <ResultCard result={result} />
      </main>

      <Footer />
    </div>
  );
}
