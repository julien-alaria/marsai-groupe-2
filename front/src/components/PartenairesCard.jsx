/**
 * PartenaireCard
 *
 * FIX: remplace http://localhost:3000 hardcodé par VITE_API_URL (env var)
 * FIX: plus de inline styles pour border/boxShadow — Tailwind uniquement
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function PartenaireCard({ name, logo, url }) {
  const logoSrc = logo ? `${API_BASE}${logo}` : null;

  const card = (
    <div className="group flex flex-col items-center justify-center gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-6 w-52 h-40 transition-all duration-400 hover:border-[#AD46FF]/40 hover:bg-white/[0.07] hover:shadow-[0_0_30px_rgba(173,70,255,0.18)] hover:-translate-y-0.5 cursor-pointer">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={name || "Partenaire"}
          className="max-h-20 max-w-full object-contain transition-transform duration-400 group-hover:scale-105"
        />
      ) : (
        <span className="text-white/20 text-sm font-medium">{name || "—"}</span>
      )}
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {card}
      </a>
    );
  }

  return card;
}