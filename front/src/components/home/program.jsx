import { useTranslation } from "react-i18next";
import Button from "../Button.jsx";

const FEATURES = [
  {
    key: "projections",
    accent: "text-[#AD46FF]", border: "border-[#AD46FF]/20", bg: "bg-[#AD46FF]/10", bar: "bg-[#AD46FF]",
    glow: "hover:shadow-[0_0_50px_rgba(173,70,255,0.18)]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#AD46FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5v14a2 2 0 0 0 2.75 1.84L20 13.74a2 2 0 0 0 0-3.5L7.75 3.14A2 2 0 0 0 5 4.89"/>
      </svg>
    ),
  },
  {
    key: "workshops",
    accent: "text-[#F6339A]", border: "border-[#F6339A]/20", bg: "bg-[#F6339A]/10", bar: "bg-[#F6339A]",
    glow: "hover:shadow-[0_0_50px_rgba(246,51,154,0.18)]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F6339A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m1-17.87a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"/>
      </svg>
    ),
  },
  {
    key: "awards",
    accent: "text-[#00D492]", border: "border-[#00D492]/20", bg: "bg-[#00D492]/10", bar: "bg-[#00D492]",
    glow: "hover:shadow-[0_0_50px_rgba(0,212,146,0.18)]",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#00D492">
        <path d="M12.766 7.979a2.305 2.305 0 1 1 3.26 3.26a2.305 2.305 0 0 1-3.26-3.26m2.199 1.06a.805.805 0 1 0-1.139 1.14a.805.805 0 0 0 1.139-1.14"/>
        <path d="M20.622 4.043a.75.75 0 0 0-.66-.66A12.66 12.66 0 0 0 9.55 7.015a12.7 12.7 0 0 0-1.735 2.159a6.73 6.73 0 0 0-4.505 1.972a6.8 6.8 0 0 0-1.226 1.676a.75.75 0 0 0 .812 1.08a6.14 6.14 0 0 1 3.552.35l3.302 3.3a6.14 6.14 0 0 1 .35 3.554a.75.75 0 0 0 1.079.813a6.8 6.8 0 0 0 1.677-1.227a6.73 6.73 0 0 0 1.972-4.503a12.7 12.7 0 0 0 2.161-1.737a12.66 12.66 0 0 0 3.633-10.409"/>
      </svg>
    ),
  },
];

export default function Program() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">

      {/* Section header */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center">
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/25 font-medium">
          12 & 13 juin 2026
        </span>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase">
          <span className="text-white">{t("pages.home.program.title")} </span>
          <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
            {t("pages.home.program.titleAccent")}
          </span>
        </h2>
        <div className="h-px w-20 bg-gradient-to-r from-[#AD46FF]/40 to-[#F6339A]/40 mt-1" />
      </div>

      {/* Programme list */}
      <div className="flex justify-center mb-14">
        <ul className="flex flex-col gap-3 text-center">
          {["debateItem", "confrontationItem", "interrogationItem"].map((item, i) => (
            <li key={item} className="flex items-center gap-3 text-white/50 text-sm sm:text-base">
              <span className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] text-white/30 flex items-center justify-center font-bold flex-shrink-0">
                {i + 1}
              </span>
              {t(`pages.home.program.${item}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {FEATURES.map((f, i) => (
          <div
            key={f.key}
            className={`group relative flex flex-col gap-6 p-8 bg-white/[0.03] border ${f.border} rounded-3xl transition-all duration-500 ${f.glow} hover:-translate-y-1`}
          >
            <span className="absolute top-5 right-7 text-7xl font-black text-white/[0.04] select-none leading-none pointer-events-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={`w-14 h-14 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
              {f.icon}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className={`text-lg font-black uppercase tracking-tight ${f.accent}`}>
                {t(`pages.home.program.${f.key}Title`)}
              </h3>
              <div className={`h-0.5 w-8 rounded-full ${f.bar} transition-all duration-700 group-hover:w-full`} />
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t(`pages.home.program.${f.key}Description`)}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Button title={t("pages.home.program.fullAgendaButton")} href="/program" size="lg" variant="gradient" />
      </div>
    </section>
  );
}
