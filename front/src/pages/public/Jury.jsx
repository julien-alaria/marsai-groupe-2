import JuryCard from "../../components/home/cards/JuryCard";
import { useTranslation } from "react-i18next";

// Import des images
import photoPierre from "../../assets/images/jury/photo-pierre-schoeller.jpg";
import tinaBaz from "../../assets/images/jury/tina-baz-le-gal_monteuse.jpg";
import jeromeGenevray from "../../assets/images/jury/jerome-genevray-réalisateur_et_scenariste.jpg";
import eveMachuel from "../../assets/images/jury/eve-machuel_productrice.jpeg";
import anneNovel from "../../assets/images/jury/anne-sophie-novel_journaliste_auteure_réalisatrice.jpeg";
import vipulan from "../../assets/images/jury/vipulan-puvaneswaran_militant_écologiste.jpg";
import barbara from "../../assets/images/jury/Barbara-schulz_comédienne.jpg";

/* ─── Inline SVG icons ────────────────────────────────── */
function IconAI() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#AD46FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4.5a3 3 0 0 0-2.567 4.554a3.001 3.001 0 0 0 0 5.893M7 4.5a2.5 2.5 0 0 1 5 0v15a2.5 2.5 0 0 1-5 0a3 3 0 0 1-2.567-4.553M7 4.5c0 .818.393 1.544 1 2m-3.567 8.447A3 3 0 0 1 6 13.67m13.25-8.92L17 7h-2m3.5-2.25a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0m.75 14.5L17 17h-2m3.5 2.25a.75.75 0 1 1 1.5 0a.75.75 0 0 1-1.5 0m.75-7.25H15m3.5 0a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0"/>
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#00D492">
      <path d="M21.92 11.6C19.9 6.91 16.1 4 12 4s-7.9 2.91-9.92 7.6a1 1 0 0 0 0 .8C4.1 17.09 7.9 20 12 20s7.9-2.91 9.92-7.6a1 1 0 0 0 0-.8ZM12 18c-3.17 0-6.17-2.29-7.9-6C5.83 8.29 8.83 6 12 6s6.17 2.29 7.9 6c-1.73 3.71-4.73 6-7.9 6Zm0-10a4 4 0 1 0 4 4a4 4 0 0 0-4-4Zm0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2Z"/>
    </svg>
  );
}
function IconWave() {
  return (
    <svg width="26" height="26" viewBox="0 0 512 512" fill="#F6339A">
      <path d="M468.53 236.03H486v39.94h-17.47v-39.94zm-34.426 51.634h17.47v-63.328h-17.47v63.328zm-33.848 32.756h17.47V191.58h-17.47v128.84zm-32.177 25.276h17.47V167.483h-17.47v178.17zm-34.448-43.521h17.47v-92.35h-17.47v92.35zm-34.994 69.879h17.47v-236.06h-17.525v236.06zM264.2 405.9h17.47V106.1H264.2v299.8zm-33.848-46.284h17.47V152.383h-17.47v207.234zm-35.016-58.85h17.47v-87.35h-17.47v87.35zm-33.847-20.823h17.47V231.98h-17.47v48.042zm-33.848 25.66h17.47v-99.24h-17.47v99.272zm-33.302 48.04h17.47V152.678H94.34v201zm-33.847-30.702h17.47V187.333h-17.47v135.642zM26 287.664h17.47v-63.328H26v63.328z"/>
    </svg>
  );
}
function IconEmoji() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#00B8DB" strokeWidth="1.5"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#00B8DB" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1.2" fill="#00B8DB"/>
      <circle cx="15" cy="10" r="1.2" fill="#00B8DB"/>
    </svg>
  );
}

/* ─── Static data arrays ──────────────────────────────── */
const MEMBERS = [
  { key: "tina",    image: tinaBaz        },
  { key: "jerome",  image: jeromeGenevray },
  { key: "eve",     image: eveMachuel     },
  { key: "anne",    image: anneNovel      },
  { key: "vipulan", image: vipulan        },
  { key: "barbara", image: barbara        },
];

const CRITERIA_META = [
  {
    key: "ai",
    icon: <IconAI />,
    accent: "text-[#AD46FF]",
    bg: "bg-[#AD46FF]/10",
    border: "border-[#AD46FF]/20",
    bar: "bg-[#AD46FF]",
    glow: "hover:shadow-[0_0_50px_rgba(173,70,255,0.18)]",
  },
  {
    key: "aesthetic",
    icon: <IconEye />,
    accent: "text-[#00D492]",
    bg: "bg-[#00D492]/10",
    border: "border-[#00D492]/20",
    bar: "bg-[#00D492]",
    glow: "hover:shadow-[0_0_50px_rgba(0,212,146,0.18)]",
  },
  {
    key: "story",
    icon: <IconWave />,
    accent: "text-[#F6339A]",
    bg: "bg-[#F6339A]/10",
    border: "border-[#F6339A]/20",
    bar: "bg-[#F6339A]",
    glow: "hover:shadow-[0_0_50px_rgba(246,51,154,0.18)]",
  },
  {
    key: "emotion",
    icon: <IconEmoji />,
    accent: "text-[#00B8DB]",
    bg: "bg-[#00B8DB]/10",
    border: "border-[#00B8DB]/20",
    bar: "bg-[#00B8DB]",
    glow: "hover:shadow-[0_0_50px_rgba(0,184,219,0.18)]",
  },
];

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
export default function JuryPublic() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#06080d] text-white overflow-x-hidden">

      {/* ── HERO ────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center pt-40 pb-28 px-6 text-center overflow-hidden">

        {/* Giant ghost text */}
        <span className="absolute inset-0 flex items-center justify-center text-[28vw] font-black tracking-tighter text-white/[0.025] select-none pointer-events-none uppercase leading-none">
          JURY
        </span>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-r from-[#AD46FF]/8 to-[#F6339A]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#AD46FF]/60 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/60 animate-pulse" />
            Festival MARS AI · Édition 2026
          </span>

          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none">
            <span className="text-white">{t("pages.juryPublic.title") || "Le"} {""}</span>
            <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
              {t("pages.juryPublic.titleAccent") || "jury"} 
            </span>
          </h1>

          <p className="max-w-lg text-white/40 text-sm sm:text-base leading-relaxed mt-1">
            {t("pages.juryPublic.membersSubtitle")}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#AD46FF]/50" />
            <div className="w-1 h-1 rounded-full bg-[#AD46FF]/60" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#F6339A]/50" />
          </div>
        </div>
      </section>

      {/* ── PRÉSIDENT ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/8 bg-white/[0.02]">

          {/* Photo col */}
          <div className="relative h-[480px] lg:h-auto min-h-[480px] overflow-hidden">
            <img
              src={photoPierre}
              alt="Pierre Schoeller"
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 hidden lg:block" />

            {/* Badge */}
            <div className="absolute top-7 left-7">
              <span className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-[#AD46FF]/30 text-[#AD46FF] text-[9px] font-semibold tracking-[0.25em] uppercase px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF] animate-pulse" />
                {t("pages.juryPublic.presidentTitle")}
              </span>
            </div>
          </div>

          {/* Bio col */}
          <div className="flex flex-col justify-center p-10 lg:p-16 gap-7">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight bg-gradient-to-br from-[#F6339A] to-[#AD46FF] bg-clip-text text-transparent">
                Pierre Schoeller
              </h2>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mt-2">
                {t("pages.juryPublic.presidentRole")}
              </p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-[#AD46FF]/20 to-transparent" />

            <p className="text-white/55 text-sm leading-7">
              {t("pages.juryPublic.presidentBio")}
            </p>

            <div className="flex gap-2">
              <div className="w-10 h-1 rounded-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A]" />
              <div className="w-4 h-1 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MEMBRES ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-32">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-16 text-center">
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/25 font-medium">
            Sélection officielle
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
            <span className="text-white">{t("pages.juryPublic.membersTitle1")} </span>
            <span className="bg-gradient-to-r from-[#F6339A] to-[#AD46FF] bg-clip-text text-transparent">
              {t("pages.juryPublic.membersTitle2")}
            </span>
          </h2>
          <div className="h-px w-20 bg-gradient-to-r from-[#AD46FF]/40 to-[#F6339A]/40 mt-1" />
        </div>

        {/* Portrait grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {MEMBERS.map(({ key, image }) => (
            <div
              key={key}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Photo */}
              <img
                src={image}
                alt={t(`pages.juryPublic.members.${key}.name`)}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />

              {/* Permanent bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Hover dark overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Border ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-[#AD46FF]/50 transition-all duration-500" />

              {/* Corner marks on hover */}
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#AD46FF]/0 group-hover:border-[#AD46FF]/70 transition-all duration-500 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#AD46FF]/0 group-hover:border-[#AD46FF]/70 transition-all duration-500 rounded-bl" />

              {/* Name / role */}
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-0.5 group-hover:translate-y-0 transition-transform duration-400">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#AD46FF]/70 font-medium mb-1 truncate">
                  {t(`pages.juryPublic.members.${key}.role`)}
                </p>
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight tracking-tight">
                  {t(`pages.juryPublic.members.${key}.name`)}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHARTE DE NOTATION ──────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pb-36 overflow-hidden">

        {/* Ambient glow behind */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-r from-[#AD46FF]/5 to-[#F6339A]/5 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex flex-col items-center gap-3 mb-16 text-center">
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/25 font-medium">
            Critères d'évaluation
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase">
            <span className="text-white">{t("pages.juryPublic.charter.title1")} </span>
            <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
              {t("pages.juryPublic.charter.title2")}
            </span>
          </h2>
          <div className="h-px w-20 bg-gradient-to-r from-[#AD46FF]/40 to-[#F6339A]/40 mt-1" />
        </div>

        {/* Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {CRITERIA_META.map((c, i) => (
            <div
              key={c.key}
              className={`group relative flex flex-col gap-6 p-8 bg-white/[0.03] border ${c.border} rounded-3xl transition-all duration-500 ${c.glow} hover:-translate-y-1`}
            >
              {/* Ghost number */}
              <span className="absolute top-5 right-7 text-7xl font-black text-white/[0.04] select-none leading-none pointer-events-none">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                {c.icon}
              </div>

              {/* Title + animated underbar */}
              <div className="flex flex-col gap-2">
                <h3 className={`text-lg font-black uppercase tracking-tight leading-tight ${c.accent}`}>
                  {t(`pages.juryPublic.criteria.${c.key}.title`)}
                </h3>
                <div className={`h-0.5 w-8 rounded-full ${c.bar} transition-all duration-700 group-hover:w-full`} />
              </div>

              {/* Description */}
              <p className="text-white/40 text-sm leading-relaxed">
                {t(`pages.juryPublic.criteria.${c.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}