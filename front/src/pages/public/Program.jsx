import { useTranslation } from "react-i18next";

/* ─── Category colour map ─────────────────────────────── */
const CAT_COLORS = {
  "OUVERTURE DU FESTIVAL":                  { accent: "text-[#00D492]", border: "border-[#00D492]/25", hover: "hover:border-[#00D492]/50 hover:shadow-[0_0_30px_rgba(0,212,146,0.12)]" },
  "WORKSHOP":                               { accent: "text-[#AD46FF]", border: "border-[#AD46FF]/25", hover: "hover:border-[#AD46FF]/50 hover:shadow-[0_0_30px_rgba(173,70,255,0.12)]" },
  "Pause":                                  { accent: "text-white/30",  border: "border-white/8",      hover: "" },
  "TABLE RONDE":                            { accent: "text-[#F6339A]", border: "border-[#F6339A]/25", hover: "hover:border-[#F6339A]/50 hover:shadow-[0_0_30px_rgba(246,51,154,0.12)]" },
  "DIFFUSION HORS-COMPÉTITION":             { accent: "text-[#2B7FFF]", border: "border-[#2B7FFF]/25", hover: "hover:border-[#2B7FFF]/50 hover:shadow-[0_0_30px_rgba(43,127,255,0.12)]" },
  "CARTE BLANCHE":                          { accent: "text-[#F5D000]", border: "border-[#F5D000]/25", hover: "hover:border-[#F5D000]/50 hover:shadow-[0_0_30px_rgba(245,208,0,0.12)]"  },
  "FIRESIDE CHAT":                          { accent: "text-[#F5D000]", border: "border-[#F5D000]/25", hover: "hover:border-[#F5D000]/50 hover:shadow-[0_0_30px_rgba(245,208,0,0.12)]"  },
  "PRÉSENTATION DES PROJETS SÉLECTIONNÉS": { accent: "text-[#2B7FFF]", border: "border-[#2B7FFF]/25", hover: "hover:border-[#2B7FFF]/50 hover:shadow-[0_0_30px_rgba(43,127,255,0.12)]" },
  "KEYNOTE":                                { accent: "text-[#AD46FF]", border: "border-[#AD46FF]/25", hover: "hover:border-[#AD46FF]/50 hover:shadow-[0_0_30px_rgba(173,70,255,0.12)]" },
  "REMISE DES PRIX":                        { accent: "text-[#F5D000]", border: "border-[#F5D000]/25", hover: "hover:border-[#F5D000]/50 hover:shadow-[0_0_30px_rgba(245,208,0,0.12)]"  },
  "SOIRÉE DE CLÔTURE":                      { accent: "text-[#00D492]", border: "border-[#00D492]/25", hover: "hover:border-[#00D492]/50 hover:shadow-[0_0_30px_rgba(0,212,146,0.12)]"  },
};
const DEFAULT_COLOR = { accent: "text-white/40", border: "border-white/8", hover: "" };
const getColor = (cat) => CAT_COLORS[cat] || DEFAULT_COLOR;

/* ─── Schedule card ───────────────────────────────────── */
function EventCard({ time, category, title }) {
  const c = getColor(category);
  const isBreak = category === "Pause";

  return (
    <div className={`flex flex-col gap-3 p-6 bg-white/[0.03] border ${c.border} rounded-2xl transition-all duration-300 ${c.hover} hover:-translate-y-0.5 ${isBreak ? "opacity-50" : ""}`}>
      <span className="text-2xl font-black text-white tabular-nums leading-none">
        {time}
      </span>
      <span className={`text-xs font-bold tracking-[0.18em] uppercase leading-snug ${c.accent}`}>
        {category}
      </span>
      {title && !isBreak ? (
        <p className="text-white/55 text-sm leading-relaxed">
          {title}
        </p>
      ) : (
        <span className="text-white/20 text-sm">—</span>
      )}
    </div>
  );
}

/* ─── Day header — matches screenshot style ───────────── */
function DayHeader({ number, date, city, cityColor }) {
  return (
    <div className="flex items-end gap-6 mb-10 pb-6 border-b border-white/8">
      {/* Pink left bar + number — exactly like screenshots */}
      <div className="flex items-stretch gap-5">
        <div className="w-1 rounded-full bg-[#F6339A] self-stretch" />
        <span className="text-7xl sm:text-8xl font-black text-white/[0.12] leading-none select-none tabular-nums">
          {number}
        </span>
      </div>
      <div className="pb-1">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
          {date}
        </h2>
        <p className={`text-sm font-bold uppercase tracking-[0.2em] mt-1.5 ${cityColor}`}>
          {city}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function ProgramPublic() {
  const { t } = useTranslation();

  const day1Events = [
    { time: "10:00", category: t("pages.programPublic.day1.opening.category"),      title: t("pages.programPublic.day1.opening.title")      },
    { time: "11:30", category: t("pages.programPublic.day1.workshop.category"),     title: t("pages.programPublic.day1.workshop.title")     },
    { time: "13:00", category: t("pages.programPublic.day1.break.category"),        title: null                                             },
    { time: "14:00", category: t("pages.programPublic.day1.roundtable.category"),   title: t("pages.programPublic.day1.roundtable.title")   },
    { time: "16:00", category: t("pages.programPublic.day1.screening.category"),    title: t("pages.programPublic.day1.screening.title")    },
    { time: "17:00", category: t("pages.programPublic.day1.carteBlanche.category"), title: t("pages.programPublic.day1.carteBlanche.title") },
  ];

  const day2Events = [
    { time: "10:00", category: t("pages.programPublic.day2.roundtable.category"),   title: t("pages.programPublic.day2.roundtable.title")   },
    { time: "11:30", category: t("pages.programPublic.day2.fireside.category"),     title: t("pages.programPublic.day2.fireside.title")     },
    { time: "13:00", category: t("pages.programPublic.day2.break.category"),        title: null                                             },
    { time: "14:00", category: t("pages.programPublic.day2.selected.category"),     title: t("pages.programPublic.day2.selected.title")     },
    { time: "16:00", category: t("pages.programPublic.day2.keynote.category"),      title: t("pages.programPublic.day2.keynote.title")      },
    { time: "18:00", category: t("pages.programPublic.day2.awards.category"),       title: t("pages.programPublic.day2.awards.title")       },
    { time: "19:00", category: t("pages.programPublic.day2.closing.category"),      title: t("pages.programPublic.day2.closing.title")      },
  ];

  return (
    <div className="min-h-screen bg-[#06080d] text-white overflow-x-hidden">

      {/* ── HERO ────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center pt-40 pb-28 px-6 text-center overflow-hidden">

        <span className="absolute inset-0 flex items-center justify-center text-[18vw] font-black tracking-tighter text-white/[0.025] select-none pointer-events-none uppercase leading-none">
          PROG
        </span>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-r from-[#AD46FF]/8 to-[#F6339A]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#AD46FF]/60 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/60 animate-pulse" />
            Festival MARS AI · Édition 2026
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
            <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">{t("pages.programPublic.title") || "programme"} </span>
              <br/>
            <span className="text-white">
              {t("pages.programPublic.titleAccent") || "du Festival"}
            </span>
          </h1>

          <p className="max-w-lg text-white/40 text-sm sm:text-base leading-relaxed mt-1">
            {t("pages.programPublic.platform.description")}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#AD46FF]/50" />
            <div className="w-1 h-1 rounded-full bg-[#AD46FF]/60" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#F6339A]/50" />
          </div>

          {/* Date pills */}
          <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
            <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-[11px] text-white/50 font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F6339A]/70" />
              {t("pages.programPublic.day1.date")}
            </span>
            <span className="text-white/20 text-xs">·</span>
            <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-[11px] text-white/50 font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/70" />
              {t("pages.programPublic.day2.date")}
            </span>
          </div>
        </div>
      </section>

      {/* ── SCHEDULE ────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-32 flex flex-col gap-20">

        {/* ── DAY 1 ── */}
        <section>
          <DayHeader
            number="01"
            date={t("pages.programPublic.day1.date")}
            city={t("pages.programPublic.day1.city")}
            cityColor="text-[#F6339A]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {day1Events.map((event, i) => (
              <EventCard key={i} time={event.time} category={event.category} title={event.title} />
            ))}
          </div>
        </section>

        {/* ── DAY 2 ── */}
        <section>
          <DayHeader
            number="02"
            date={t("pages.programPublic.day2.date")}
            city={t("pages.programPublic.day2.city")}
            cityColor="text-[#AD46FF]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {day2Events.map((event, i) => (
              <EventCard key={i} time={event.time} category={event.category} title={event.title} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}