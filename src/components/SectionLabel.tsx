interface Props {
  /** Nummer foran etiketten («01 / …»). Utelates for etiketter uten nummer. */
  index?: number;
  children: React.ReactNode;
  id?: string;
}

/**
 * Etikett i nettsidens stil: «01 / Ovn».
 * Er en h2, så skjermleserbrukere kan hoppe mellom delene med overskriftsnavigasjon.
 */
export default function SectionLabel({ index, children, id }: Props) {
  return (
    <h2 id={id} className="font-syne text-xs font-bold tracking-wider text-zinc-400 uppercase">
      {index !== undefined && (
        <span aria-hidden="true">{`${String(index).padStart(2, '0')} / `}</span>
      )}
      {children}
    </h2>
  );
}
