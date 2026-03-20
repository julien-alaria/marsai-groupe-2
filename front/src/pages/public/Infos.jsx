import { useTranslation } from "react-i18next";

/* ─── SVG Icons ───────────────────────────────────────── */
function IconTransit() {
  return (
    <svg width="26" height="26" viewBox="0 0 16 16" fill="#00D492">
      <path d="M13 11.2V3.8c0-1-.8-1.8-1.8-1.8H9V1h2V0H5v1h2v1H4.8C3.8 2 3 2.8 3 3.8v7.4c0 1 .8 1.8 1.8 1.8H5l-.7 1H3v1h.7L3 16h2l.6-1h4.9l.6 1h2l-.7-1h.6v-1h-1.3l-.7-1h.2c1 0 1.8-.8 1.8-1.8zM4 3.9c0-.5.4-.9.9-.9H11c.6 0 1 .4 1 .9V6c0 .6-.4 1-.9 1H4.9c-.5 0-.9-.4-.9-.9V3.9zM4 11c0-.6.4-1 1-1s1 .4 1 1s-.4 1-1 1s-1-.4-1-1zm5.9 3H6.1l.6-1h2.6l.6 1zm.1-3c0-.6.4-1 1-1s1 .4 1 1s-.4 1-1 1s-1-.4-1-1z"/>
    </svg>
  );
}
function IconCar() {
  return (
    <svg width="26" height="26" viewBox="0 0 384 384" fill="#F6339A">
      <path d="m340 64l44 128v171q0 8-6.5 14.5T363 384h-22q-8 0-14.5-6.5T320 363v-22H64v22q0 8-6.5 14.5T43 384H21q-8 0-14.5-6.5T0 363V192L44 64q8-21 31-21h234q23 0 31 21zM74.5 277q13.5 0 23-9t9.5-22.5t-9.5-23t-23-9.5t-22.5 9.5t-9 23t9 22.5t22.5 9zm235 0q13.5 0 22.5-9t9-22.5t-9-23t-22.5-9.5t-23 9.5t-9.5 23t9.5 22.5t23 9zM43 171h298l-32-96H75z"/>
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#AD46FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

/* ─── Access info blocks ──────────────────────────────── */
const ACCESS_ITEMS = [
  {
    key: "publicTransport",
    icon: <IconTransit />,
    accent: "text-[#00D492]",
    bg: "bg-[#00D492]/10",
    border: "border-[#00D492]/20",
    bar: "bg-[#00D492]",
    glow: "hover:shadow-[0_0_40px_rgba(0,212,146,0.15)]",
    lines: ["line1", "line2", "line3"],
  },
  {
    key: "car",
    icon: <IconCar />,
    accent: "text-[#F6339A]",
    bg: "bg-[#F6339A]/10",
    border: "border-[#F6339A]/20",
    bar: "bg-[#F6339A]",
    glow: "hover:shadow-[0_0_40px_rgba(246,51,154,0.15)]",
    lines: ["line1", "line2"],
  },
  {
    key: "address",
    icon: <IconPin />,
    accent: "text-[#AD46FF]",
    bg: "bg-[#AD46FF]/10",
    border: "border-[#AD46FF]/20",
    bar: "bg-[#AD46FF]",
    glow: "hover:shadow-[0_0_40px_rgba(173,70,255,0.15)]",
    lines: ["line1", "line2"],
  },
];

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function InfosPublic() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#06080d] text-white overflow-x-hidden">

      {/* ── HERO ────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center pt-40 pb-28 px-6 text-center overflow-hidden">

        {/* Giant ghost text */}
        <span className="absolute inset-0 flex items-center justify-center text-[26vw] font-black tracking-tighter text-white/[0.025] select-none pointer-events-none uppercase leading-none">
          INFO
        </span>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-r from-[#AD46FF]/8 to-[#F6339A]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#AD46FF]/60 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/60 animate-pulse" />
            Festival MARS AI · Édition 2026
          </span>

          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none">
            <span className="text-white">{t("pages.infos.title")} </span>
            <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
              {t("pages.infos.subtitle")}
            </span>
          </h1>

          <p className="max-w-lg text-white/40 text-sm sm:text-base leading-relaxed mt-1">
            Tout ce qu'il vous faut pour venir nous rejoindre.
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#AD46FF]/50" />
            <div className="w-1 h-1 rounded-full bg-[#AD46FF]/60" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#F6339A]/50" />
          </div>
        </div>
      </section>

      {/* ── ACCESS SECTION TITLE ────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-5 mb-14">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2B7FFF]/15 border border-[#2B7FFF]/25 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path d="M24 47.998c13.255 0 24-10.745 24-24C48 10.746 37.255 0 24 0S0 10.745 0 23.999s10.745 23.999 24 23.999" fill="#2B7FFF"/>
                <path d="M12.43 22.595a.873.873 0 0 1-.04-1.648l21.643-8.103a.872.872 0 0 1 1.123 1.123L27.053 35.61a.873.873 0 0 1-1.648-.04l-3.014-9.397a.87.87 0 0 0-.564-.564z" fill="#f0f1f1"/>
                <path d="M34.033 12.844L12.39 20.947a.874.874 0 0 0 .04 1.648l9.397 3.013a.9.9 0 0 1 .263.145l12.776-12.776a.87.87 0 0 0-.833-.133" fill="#fff"/>
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              {t("pages.infos.access")}
            </h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ACCESS_ITEMS.map((item, i) => (
            <div
              key={item.key}
              className={`group relative flex flex-col gap-5 p-7 bg-white/[0.03] border ${item.border} rounded-3xl transition-all duration-500 ${item.glow} hover:-translate-y-1`}
            >
              {/* Ghost number */}
              <span className="absolute top-5 right-7 text-6xl font-black text-white/[0.04] select-none leading-none pointer-events-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className={`w-13 h-13 w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                {item.icon}
              </div>

              {/* Title + animated bar */}
              <div className="flex flex-col gap-2">
                <h3 className={`text-lg font-black uppercase tracking-tight leading-tight ${item.accent}`}>
                  {t(`pages.infos.${item.key}.title`)}
                </h3>
                <div className={`h-0.5 w-8 rounded-full ${item.bar} transition-all duration-700 group-hover:w-full`} />
              </div>

              {/* Lines */}
              <ul className="flex flex-col gap-2">
                {item.lines.map((lineKey) => (
                  <li key={lineKey} className="flex items-start gap-2.5 text-white/50 text-sm leading-relaxed">
                    <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${item.bar}`} />
                    {t(`pages.infos.${item.key}.${lineKey}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAP ─────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-32 pt-10">

        {/* Map header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[9px] tracking-[0.35em] uppercase text-white/25 font-medium">
            155 rue Peyssonnel, 13002 Marseille
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
        </div>

        {/* Map frame */}
        <div className="relative rounded-3xl overflow-hidden border border-white/8 shadow-[0_0_60px_rgba(173,70,255,0.12)]">
          {/* Gradient overlay on top edge */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#AD46FF]/30 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F6339A]/20 to-transparent z-10 pointer-events-none" />

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5806.007572123465!2d5.366207076720204!3d43.31418017429094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9c0f3f2295ed9%3A0xe8332bddf8f8ffdb!2s155%20Rue%20Peyssonnel%2C%2013002%20Marseille!5e0!3m2!1sfr!2sfr!4v1770892741990!5m2!1sfr!2sfr"
            className="w-full h-96 sm:h-[480px] block"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

    </div>
  );
}