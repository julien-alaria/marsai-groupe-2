import { useTranslation } from "react-i18next";
import Button from "../Button.jsx";

export default function Party() {
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">

      {/* Badge */}
      <div className="flex justify-center mb-10">
        <span className="inline-flex items-center gap-2 bg-white/[0.04] border border-[#F6339A]/20 rounded-full px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase text-[#F6339A]/70 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F6339A]/70 animate-pulse" />
          {t("pages.home.party.closingNight")}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Left — text */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-none text-white">
              {t("pages.home.party.title")}
            </h2>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase leading-none bg-gradient-to-r from-[#F6339A] to-[#AD46FF] bg-clip-text text-transparent">
              {t("pages.home.party.titleAccent")}
            </h2>
          </div>

          <div className="h-px w-20 bg-gradient-to-r from-[#F6339A]/50 to-transparent" />

          <p className="text-white/55 text-base sm:text-lg leading-relaxed max-w-md">
            {t("pages.home.party.description")}
          </p>

          <Button title={t("pages.home.party.bookButton")} href="/auth/register" size="lg" variant="gradient" />
        </div>

        {/* Right — date card */}
        <div className="flex justify-center lg:justify-end">
          <div className="group flex flex-col items-center justify-center gap-5 p-10 bg-white/[0.03] border border-[#F6339A]/20 rounded-3xl w-72 transition-all duration-500 hover:shadow-[0_0_60px_rgba(246,51,154,0.18)] hover:-translate-y-1">

            {/* Clock icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#F6339A]/10 border border-[#F6339A]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <svg width="28" height="28" viewBox="0 0 432 432" fill="#F6339A">
                <path d="M213.5 3q88.5 0 151 62.5T427 216t-62.5 150.5t-151 62.5t-151-62.5T0 216T62.5 65.5T213.5 3zm0 384q70.5 0 120.5-50t50-121t-50-121t-120.5-50T93 95T43 216t50 121t120.5 50zM224 109v112l96 57l-16 27l-112-68V109h32z"/>
              </svg>
            </div>

            <div className="flex flex-col gap-2 text-center">
              <h3 className="text-2xl font-black text-white">{t("pages.home.party.date")}</h3>
              <div className="h-0.5 w-8 rounded-full bg-[#F6339A] mx-auto transition-all duration-500 group-hover:w-3/4" />
              <p className="text-[#F6339A]/70 text-xs font-bold tracking-[0.2em] uppercase">
                {t("pages.home.party.timeLocation")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
