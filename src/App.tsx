import Header from './components/Header';
import Footer from './components/Footer';

const SECTIONS = ['Ovn', 'Temperatur', 'Tid', 'Mengde'];

export default function App() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-[480px] flex-col gap-8 px-4 pt-4 pb-6"
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <Header />

      <main className="flex-1 space-y-4">
        <ol className="grid grid-cols-2 gap-3">
          {SECTIONS.map((label, i) => (
            <li
              key={label}
              className="space-y-1 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
            >
              <span className="font-syne text-xl font-bold text-zinc-600">0{i + 1}</span>
              <p className="font-syne text-sm font-bold tracking-wider text-white uppercase">
                {label}
              </p>
            </li>
          ))}
        </ol>

        <section
          aria-label="Status"
          className="space-y-2 rounded-2xl border border-white/10 bg-brand-navy p-5"
        >
          <span className="font-syne text-xs font-bold tracking-wider text-accent uppercase">
            Under bygging
          </span>
          <p className="text-sm leading-relaxed text-zinc-400">
            Kalkulatoren kommer snart. Her skal du kunne gjøre om temperatur og tid fra en
            stekeovnsoppskrift til airfryer, med hurtigvalg og nedtellingsklokke.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
