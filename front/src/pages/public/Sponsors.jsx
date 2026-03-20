import { useEffect, useState } from "react";
import { getSponsors } from "../../api/sponsors";
import PartenaireGrid from "../../components/PartenairesGrid";
import { useTranslation } from "react-i18next";

/* ─── Category config ─────────────────────────────────── */
const CATEGORIES = [
  {
    key: "officiels",
    accent: "text-[#AD46FF]",
    border: "border-[#AD46FF]/20",
    bar: "bg-gradient-to-r from-[#AD46FF] to-[#F6339A]",
    glow: "bg-[#AD46FF]/5",
    dot: "bg-[#AD46FF]",
  },
  {
    key: "medias",
    accent: "text-[#00D492]",
    border: "border-[#00D492]/20",
    bar: "bg-[#00D492]",
    glow: "bg-[#00D492]/5",
    dot: "bg-[#00D492]",
  },
  {
    key: "techniques",
    accent: "text-[#F6339A]",
    border: "border-[#F6339A]/20",
    bar: "bg-[#F6339A]",
    glow: "bg-[#F6339A]/5",
    dot: "bg-[#F6339A]",
  },
  {
    key: "divers",
    accent: "text-[#00B8DB]",
    border: "border-[#00B8DB]/20",
    bar: "bg-[#00B8DB]",
    glow: "bg-[#00B8DB]/5",
    dot: "bg-[#00B8DB]",
  },
];

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function Partenaires() {
  const { t } = useTranslation();

  /* ── Logic inchangée ── */
  const [data, setData] = useState({
    officiels: [],
    medias: [],
    techniques: [],
    divers: [],
  });

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await getSponsors();
        const sponsors = res.data;

        const grouped = {
          officiels: [],
          medias: [],
          techniques: [],
          divers: [],
        };

        sponsors.forEach((sponsor) => {
          const category = sponsor.category?.toLowerCase();
          if (grouped[category]) {
            grouped[category].push(sponsor);
          } else {
            grouped.divers.push(sponsor);
          }
        });

        setData(grouped);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSponsors();
  }, []);

  /* ── Total sponsors count ── */
  const totalSponsors = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="min-h-screen bg-[#06080d] text-white overflow-x-hidden">

      {/* ── HERO ────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center pt-40 pb-28 px-6 text-center overflow-hidden">

        {/* Giant ghost text */}
        <span className="absolute inset-0 flex items-center justify-center text-[20vw] font-black tracking-tighter text-white/[0.025] select-none pointer-events-none uppercase leading-none">
          SPONSORS
        </span>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-r from-[#AD46FF]/8 to-[#F6339A]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#AD46FF]/60 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/60 animate-pulse" />
            Festival MARS AI · Édition 2026
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
            <span className="text-white">{t("pages.sponsors.title")} </span>
            <br/>
            <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
              {t("pages.sponsors.titleAccent") || "du Festival"}
            </span>
          </h1>

          <p className="max-w-lg text-white/40 text-sm sm:text-base leading-relaxed mt-1">
            Ils soutiennent la création et l'innovation cinématographique par l'intelligence artificielle.
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#AD46FF]/50" />
            <div className="w-1 h-1 rounded-full bg-[#AD46FF]/60" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#F6339A]/50" />
          </div>

          {/* Count badge */}
          {totalSponsors > 0 && (
            <div className="flex items-center gap-2 mt-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/70" />
              <span className="text-[11px] text-white/40 font-medium tracking-wide">
                {totalSponsors} partenaire{totalSponsors > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORY SECTIONS ───────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-32 flex flex-col gap-24">
        {CATEGORIES.map((cat) => {
          const items = data[cat.key];
          if (items.length === 0) return null;

          return (
            <section key={cat.key}>

              {/* Section header */}
              <div className="flex items-center gap-5 mb-12">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${cat.dot} animate-pulse`} />
                    <span className="text-[9px] tracking-[0.4em] uppercase text-white/25 font-medium">
                      {t("pages.sponsors.title")}
                    </span>
                  </div>
                  <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase ${cat.accent}`}>
                    {t(`pages.sponsors.categories.${cat.key}`)}
                  </h2>
                  <div className={`h-0.5 w-12 rounded-full ${cat.bar}`} />
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
                <span className="text-[11px] text-white/20 font-medium tabular-nums">
                  {items.length} partenaire{items.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Grid */}
              <PartenaireGrid items={items} />

            </section>
          );
        })}

        {/* Empty state — no sponsors at all */}
        {totalSponsors === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center text-2xl">
              🤝
            </div>
            <p className="text-white/30 text-sm max-w-xs leading-relaxed">
              Les partenaires seront annoncés prochainement.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}