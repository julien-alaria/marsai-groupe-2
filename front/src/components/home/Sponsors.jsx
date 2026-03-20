import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Carousel from "./Caroussel";
import OneCardWithImage from "./cards/OneCardWithImage";
import { getSponsors } from "../../api/sponsors";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Sponsors() {
  const { t } = useTranslation();
  const [sponsors, setSponsors] = useState([]);

  /* ── Logic inchangée ── */
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await getSponsors();
        setSponsors(res.data);
      } catch (error) {
        console.error("Erreur récupération sponsors :", error);
      }
    };
    fetchSponsors();
  }, []);

  const cards = sponsors.map((sponsor, index) => (
    <OneCardWithImage
      key={index}
      image={`${API_BASE}${sponsor.logo}`}
      url={sponsor.url}
      accentColor={sponsor.accentColor || "#AD46FF"}
      borderColor={sponsor.borderColor || "#AD46FF"}
      hoverShadow={sponsor.hoverShadow || "#AD46FF"}
    />
  ));

  if (sponsors.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">

      {/* Section header */}
      <div className="flex flex-col items-center gap-3 mb-14 text-center">
        <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-[#F6339A]/20 rounded-full px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase text-[#F6339A]/70 font-medium">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#F6339A">
            <path d="M7.984 14q-.217 0-.409-.077a1.3 1.3 0 0 1-.369-.236l-.73-.671Q4.24 11.012 2.62 9.18Q1 7.35 1 5.43q0-1.453.994-2.441q.995-.99 2.445-.989q.85 0 1.784.436C6.845 2.727 7.438 3.142 8 4c.59-.858 1.189-1.273 1.798-1.564Q10.711 2 11.561 2q1.45 0 2.445.989q.994.988.994 2.44q0 1.967-1.7 3.823A59 59 0 0 1 9.526 13l-.747.687a1.15 1.15 0 0 1-.794.313z"/>
          </svg>
          {t("pages.home.sponsors.ourSupport")}
        </span>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase">
          <span className="text-white">{t("pages.home.sponsors.theySupportFuture")} </span>
          <span className="bg-gradient-to-r from-[#F6339A] to-[#AD46FF] bg-clip-text text-transparent">
            {t("pages.home.sponsors.theySupportFutureAccent")}
          </span>
        </h2>
        <div className="h-px w-20 bg-gradient-to-r from-[#F6339A]/40 to-[#AD46FF]/40 mt-1" />
      </div>

      {/* Carousel — logic inchangée */}
      <div className="w-full">
        <Carousel items={cards} interval={3000} />
      </div>
    </section>
  );
}
