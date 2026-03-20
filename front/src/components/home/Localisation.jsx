import { useTranslation } from "react-i18next";

export default function Localisation() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">

      {/* Section header */}
      <div className="flex flex-col items-center gap-3 mb-16 text-center">
        <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-[#AD46FF]/20 rounded-full px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase text-[#AD46FF]/70 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AD46FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {t("pages.home.localisation.howToGetThere")}
        </span>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
          <span className="text-white">Nous </span>
          <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">trouver</span>
        </h2>
        <div className="h-px w-20 bg-gradient-to-r from-[#AD46FF]/40 to-[#F6339A]/40 mt-1" />
      </div>

      {/* Location info pills */}
      <div className="flex flex-wrap justify-center gap-4 mb-14">
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-[#F6339A]/20 rounded-full px-5 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F6339A]" />
          <span className="text-[#F6339A]/80 text-sm font-medium">{t("pages.home.localisation.city")}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 rounded-full px-5 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span className="text-white/55 text-sm">{t("pages.home.localisation.address")}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-[#00D492]/20 rounded-full px-5 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D492]" />
          <span className="text-white/55 text-sm">{t("pages.home.localisation.transport")}</span>
        </div>
      </div>

      {/* Room cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
        {[
          { titleKey: "room1Title", descKey: "room1Description", accent: "text-[#2B7FFF]", border: "border-[#2B7FFF]/20", bg: "bg-[#2B7FFF]/10", bar: "bg-[#2B7FFF]", glow: "hover:shadow-[0_0_40px_rgba(43,127,255,0.15)]" },
          { titleKey: "room2Title", descKey: "room2Description", accent: "text-[#AD46FF]", border: "border-[#AD46FF]/20", bg: "bg-[#AD46FF]/10", bar: "bg-[#AD46FF]", glow: "hover:shadow-[0_0_40px_rgba(173,70,255,0.15)]" },
        ].map((room) => (
          <div
            key={room.titleKey}
            className={`group flex flex-col gap-4 p-8 bg-white/[0.03] border ${room.border} rounded-3xl transition-all duration-400 ${room.glow} hover:-translate-y-1`}
          >
            <div className={`w-12 h-12 rounded-xl ${room.bg} border ${room.border} flex items-center justify-center`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={room.accent}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className={`text-lg font-black uppercase tracking-tight ${room.accent}`}>
                {t(`pages.home.localisation.${room.titleKey}`)}
              </h3>
              <div className={`h-0.5 w-8 rounded-full ${room.bar} transition-all duration-700 group-hover:w-full`} />
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              {t(`pages.home.localisation.${room.descKey}`)}
            </p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="relative rounded-3xl overflow-hidden border border-white/8 shadow-[0_0_60px_rgba(173,70,255,0.10)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#AD46FF]/30 to-transparent z-10 pointer-events-none" />
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5806.007572123465!2d5.366207076720204!3d43.31418017429094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9c0f3f2295ed9%3A0xe8332bddf8f8ffdb!2s155%20Rue%20Peyssonnel%2C%2013002%20Marseille!5e0!3m2!1sfr!2sfr!4v1770892741990!5m2!1sfr!2sfr"
          className="w-full h-80 sm:h-96 block"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
