type ResultCardProps = {
  title: string;
  content: string;
};

export function ResultCard({ title, content }: ResultCardProps) {
  return (
    <section className="ritual-panel p-4">
      <h3 className="mb-2 font-display text-xl font-bold text-bronze">{title}</h3>
      <p className="text-sm font-medium leading-7 text-parchment/80">{content}</p>
    </section>
  );
}
