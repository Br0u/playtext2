type MarginaliaProps = {
  items: string[];
};

export function Marginalia({ items }: MarginaliaProps) {
  return (
    <aside className="marginalia" aria-label="keywords">
      {items.map((item) => (
        <span key={item} className="marginalia-item">
          {item}
        </span>
      ))}
    </aside>
  );
}
