import { useTranslation } from "react-i18next";
import Button from "../Button.jsx";

const STATS = [
  { key: "card1", accent: "text-[#AD46FF]", border: "border-[#AD46FF]/20", bar: "bg-[#AD46FF]", glow: "hover:shadow-[0_0_40px_rgba(173,70,255,0.15)]" },
  { key: "card2", accent: "text-[#00D492]", border: "border-[#00D492]/20", bar: "bg-[#00D492]", glow: "hover:shadow-[0_0_40px_rgba(0,212,146,0.15)]"  },
  { key: "card3", accent: "text-[#F6339A]", border: "border-[#F6339A]/20", bar: "bg-[#F6339A]", glow: "hover:shadow-[0_0_40px_rgba(246,51,154,0.15)]"  },
  { key: "card4", accent: "text-[#2B7FFF]", border: "border-[#2B7FFF]/20", bar: "bg-[#2B7FFF]", glow: "hover:shadow-[0_0_40px_rgba(43,127,255,0.15)]"  },
];

export default function Protocole() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">

      {/* Badge */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-[#AD46FF]/20 rounded-full px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase text-[#AD46FF]/70 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#AD46FF">
            <path d="M2.27 14.333a2.272 2.272 0 0 1 0-4.543a2.272 2.272 0 0 1 0 4.543zm19.46.858a3.122 3.122 0 0 1-1.822-.584c-.743.837-1.046 1.047-2.067 1.047c-1.541 0-3.12-2.32-4.558-4.315c1.497-2.335 2.87-3.878 4.331-3.878c1.115 0 2.185.493 2.787 1.767a3.115 3.115 0 0 1 1.329-.296a3.105 3.105 0 0 1 1.17.226c-.88-2.599-2.997-3.913-5.113-3.913c-2.335 0-4.06 2.16-5.576 4.629c-1.783-2.432-3.483-4.63-5.923-4.63c-2.077 0-4.154 1.287-5.044 3.83a3.118 3.118 0 0 1 .936-.142a3.113 3.113 0 0 1 1.718.514c.546-.773 1.245-1.235 2.007-1.21c1.537.052 2.928 1.85 4.687 4.325c-1.28 1.959-2.923 3.868-4.31 3.868c-1.057 0-2.074-.444-2.69-1.574a3.114 3.114 0 0 1-1.412.336c-.371.007-.734-.077-1.085-.185c.932 2.417 2.972 3.64 5.013 3.64c2.326 0 3.931-2.056 5.525-4.615c1.748 2.464 3.5 4.724 5.992 4.724c2.025 0 4.297-1.333 5.223-3.75c-.358.088-.724.2-1.118.186z"/>
          </svg>
          {t("pages.home.protocole.immersion")}
        </span>
      </div>

      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase">
          <span className="text-white">{t("pages.home.protocole.title")} </span>
          <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
            {t("pages.home.protocole.titleAccent")}
          </span>
          <span className="text-white"> {t("pages.home.protocole.titleEnd")}</span>
        </h2>
        <div className="flex justify-center mt-4">
          <div className="h-px w-20 bg-gradient-to-r from-[#AD46FF]/40 to-[#F6339A]/40" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {STATS.map((s) => (
          <div
            key={s.key}
            className={`group flex flex-col items-center justify-center gap-3 p-8 bg-white/[0.03] border ${s.border} rounded-3xl text-center transition-all duration-400 ${s.glow} hover:-translate-y-1`}
          >
            <h3 className={`text-3xl sm:text-4xl font-black tracking-tight ${s.accent}`}>
              {t(`pages.home.protocole.${s.key}.title`)}
            </h3>
            <div className={`h-0.5 w-8 rounded-full ${s.bar} transition-all duration-500 group-hover:w-3/4`} />
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium">
              {t(`pages.home.protocole.${s.key}.description`)}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Button title={t("pages.home.protocole.button")} href="/auth/register" size="lg" variant="gradient" />
      </div>
    </section>
  );
}
