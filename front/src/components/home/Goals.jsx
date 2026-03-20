import { useTranslation } from "react-i18next";

const GOALS = [
  {
    key: "card1",
    accent: "text-[#00D492]", border: "border-[#00D492]/20", bg: "bg-[#00D492]/10", bar: "bg-[#00D492]",
    glow: "hover:shadow-[0_0_50px_rgba(0,212,146,0.18)]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00D492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/>
        <path d="M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0"/>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0"/>
      </svg>
    ),
  },
  {
    key: "card2",
    accent: "text-[#00B8DB]", border: "border-[#00B8DB]/20", bg: "bg-[#00B8DB]/10", bar: "bg-[#00B8DB]",
    glow: "hover:shadow-[0_0_50px_rgba(0,184,219,0.18)]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00B8DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 10V3L5 14h6v7l8-11h-6Z"/>
      </svg>
    ),
  },
  {
    key: "card3",
    accent: "text-[#AD46FF]", border: "border-[#AD46FF]/20", bg: "bg-[#AD46FF]/10", bar: "bg-[#AD46FF]",
    glow: "hover:shadow-[0_0_50px_rgba(173,70,255,0.18)]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#AD46FF">
        <path d="M12.766 7.979a2.305 2.305 0 1 1 3.26 3.26a2.305 2.305 0 0 1-3.26-3.26m2.199 1.06a.805.805 0 1 0-1.139 1.14a.805.805 0 0 0 1.139-1.14"/>
        <path d="M20.622 4.043a.75.75 0 0 0-.66-.66A12.66 12.66 0 0 0 9.55 7.015a12.7 12.7 0 0 0-1.735 2.159a6.73 6.73 0 0 0-4.505 1.972a6.8 6.8 0 0 0-1.226 1.676a.75.75 0 0 0 .812 1.08a6.14 6.14 0 0 1 3.552.35l3.302 3.3a6.14 6.14 0 0 1 .35 3.554a.75.75 0 0 0 1.079.813a6.8 6.8 0 0 0 1.677-1.227a6.73 6.73 0 0 0 1.972-4.503a12.7 12.7 0 0 0 2.161-1.737a12.66 12.66 0 0 0 3.633-10.409"/>
      </svg>
    ),
  },
];

export default function Goals() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">

      {/* Section header */}
      <div className="flex flex-col items-center gap-3 mb-16 text-center">
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/25 font-medium">
          Festival MARS AI
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
          <span className="text-white">{t("pages.home.goals.title")} </span>
          <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
            {t("pages.home.goals.titleAccent")}
          </span>
        </h2>
        <div className="h-px w-20 bg-gradient-to-r from-[#AD46FF]/40 to-[#F6339A]/40 mt-1" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {GOALS.map((g, i) => (
          <div
            key={g.key}
            className={`group relative flex flex-col gap-6 p-8 bg-white/[0.03] border ${g.border} rounded-3xl transition-all duration-500 ${g.glow} hover:-translate-y-1`}
          >
            <span className="absolute top-5 right-7 text-7xl font-black text-white/[0.04] select-none leading-none pointer-events-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={`w-14 h-14 rounded-2xl ${g.bg} border ${g.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
              {g.icon}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className={`text-lg font-black uppercase tracking-tight ${g.accent}`}>
                {t(`pages.home.goals.${g.key}.title`)}
              </h3>
              <div className={`h-0.5 w-8 rounded-full ${g.bar} transition-all duration-700 group-hover:w-full`} />
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t(`pages.home.goals.${g.key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
