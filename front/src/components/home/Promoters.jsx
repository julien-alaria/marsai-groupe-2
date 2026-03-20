import { useTranslation } from "react-i18next";
import plateformeLogo from "../../assets/images/plateforme_logo.png";
import mobileFilmLogo from "../../assets/images/mobile_film_logo.png";

export default function Promoters() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">

      {/* Section label */}
      <div className="flex items-center gap-5 mb-14">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/8" />
        <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 font-medium text-center">
          {t("pages.home.promoters.partnersTitle")}
        </p>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/8" />
      </div>

      {/* Logos */}
      <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20">
        <img
          src={plateformeLogo}
          alt="Logo de la plateforme"
          className="h-14 sm:h-16 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
        />
        <img
          src={mobileFilmLogo}
          alt="Logo Mobile Film"
          className="h-16 sm:h-20 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </section>
  );
}
