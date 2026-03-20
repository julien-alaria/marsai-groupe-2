import { useTranslation } from "react-i18next";

export default function Statistics() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">

        {/* Left — title */}
        <div className="flex flex-col gap-5">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
            <span className="text-white">{t("pages.home.statistics.title")} </span>
            <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
              {t("pages.home.statistics.titleAccent")}
            </span>
          </h2>
          <div className="h-px w-20 bg-gradient-to-r from-[#AD46FF]/40 to-transparent" />
          <p className="text-white/40 text-sm uppercase tracking-widest font-medium">
            {t("pages.home.statistics.description")}
          </p>
        </div>

        {/* Stat cards */}
        {[
          { titleKey: "card1Title", descKey: "card1Description", accent: "text-[#2B7FFF]", border: "border-[#2B7FFF]/20", bar: "bg-[#2B7FFF]", glow: "hover:shadow-[0_0_40px_rgba(43,127,255,0.18)]" },
          { titleKey: "card2Title", descKey: "card2Description", accent: "text-[#AD46FF]", border: "border-[#AD46FF]/20", bar: "bg-[#AD46FF]", glow: "hover:shadow-[0_0_40px_rgba(173,70,255,0.18)]" },
        ].map((s) => (
          <div
            key={s.titleKey}
            className={`group flex flex-col items-center justify-center gap-4 p-10 bg-white/[0.03] border ${s.border} rounded-3xl text-center transition-all duration-400 ${s.glow} hover:-translate-y-1`}
          >
            <h3 className={`text-5xl sm:text-6xl font-black tabular-nums ${s.accent}`}>
              {t(`pages.home.statistics.${s.titleKey}`)}
            </h3>
            <div className={`h-0.5 w-8 rounded-full ${s.bar} transition-all duration-500 group-hover:w-3/4`} />
            <p className="text-white/40 text-sm uppercase tracking-widest font-medium">
              {t(`pages.home.statistics.${s.descKey}`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
