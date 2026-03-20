import PartenaireCard from "./PartenairesCard";

export default function PartenaireGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-white/20 text-sm">
        Aucun partenaire dans cette catégorie pour le moment.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {items.map((p, index) => (
        <PartenaireCard
          key={index}
          logo={p.logo}
          name={p.name}
          url={p.url}
        />
      ))}
    </div>
  );
}