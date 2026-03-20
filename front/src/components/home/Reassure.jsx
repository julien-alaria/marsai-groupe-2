import { useTranslation } from "react-i18next";

const CARDS = [
  { key: "card1", accent: "text-[#AD46FF]", border: "border-[#AD46FF]/20", bg: "bg-[#AD46FF]/10", bar: "bg-[#AD46FF]", glow: "hover:shadow-[0_0_40px_rgba(173,70,255,0.15)]" },
  { key: "card2", accent: "text-[#00D492]", border: "border-[#00D492]/20", bg: "bg-[#00D492]/10", bar: "bg-[#00D492]", glow: "hover:shadow-[0_0_40px_rgba(0,212,146,0.15)]"  },
  { key: "card3", accent: "text-[#F6339A]", border: "border-[#F6339A]/20", bg: "bg-[#F6339A]/10", bar: "bg-[#F6339A]", glow: "hover:shadow-[0_0_40px_rgba(246,51,154,0.15)]"  },
  { key: "card4", accent: "text-[#2B7FFF]", border: "border-[#2B7FFF]/20", bg: "bg-[#2B7FFF]/10", bar: "bg-[#2B7FFF]", glow: "hover:shadow-[0_0_40px_rgba(43,127,255,0.15)]"  },
];

export default function Reassure() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c) => (
          <div
            key={c.key}
            className={`group flex flex-col items-center justify-center gap-3 p-8 bg-white/[0.03] border ${c.border} rounded-3xl text-center transition-all duration-400 ${c.glow} hover:-translate-y-1`}
          >
            <h3 className={`text-3xl sm:text-4xl font-black tracking-tight ${c.accent}`}>
              {t(`pages.home.reassure.${c.key}.title`)}
            </h3>
            <div className={`h-0.5 w-8 rounded-full ${c.bar} transition-all duration-500 group-hover:w-3/4`} />
            <p className="text-white/45 text-sm leading-relaxed">
              {t(`pages.home.reassure.${c.key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
