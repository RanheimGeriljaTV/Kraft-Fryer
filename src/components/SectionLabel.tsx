interface Props {
  /** Nummer foran etiketten («01 / …»). Utelates for etiketter uten nummer. */
  index?: number;
  children: React.ReactNode;
  id?: string;
}

/** Etikett i nettsidens stil: «01 / Ovn». */
export default function SectionLabel({ index, children, id }: Props) {
  return (
    <span id={id} className="font-syne text-xs font-bold tracking-wider text-zinc-400 uppercase">
      {index !== undefined && `${String(index).padStart(2, '0')} / `}
      {children}
    </span>
  );
}
