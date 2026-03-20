import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import Button from "../Button.jsx";
import festivalImg from "../../assets/images/festival.png";

export default function Hero() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0">
        <img src={festivalImg} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-black/20 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-4 sm:px-6">
        <div className="text-center max-w-5xl mx-auto flex flex-col items-center gap-6 md:gap-8">

          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF] animate-pulse" />
            <span className="text-xs tracking-[0.3em] uppercase text-white/80">
              {t("pages.home.hero.subtitle")} {t("pages.home.hero.year")}
            </span>
          </span>

          {/* Main title */}
          <h1 className="font-black text-white leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]">MARS</span>
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent ml-2 sm:ml-4">AI</span>
          </h1>

          {/* Tagline */}
          <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {t("pages.home.hero.title1")}{" "}
            <span className="font-semibold bg-gradient-to-r from-[#AD46FF]/90 to-[#F6339A]/90 bg-clip-text text-transparent">
              {t("pages.home.hero.title2")}
            </span>{" "}
            {t("pages.home.hero.title3")}
          </p>

          {/* Description */}
          <div className="max-w-xl mx-auto space-y-1">
            <p className="text-white/85 text-sm sm:text-base leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t("pages.home.hero.description1")}
            </p>
            <p className="font-medium text-sm sm:text-base bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t("pages.home.hero.description2")}
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button
              title={isLoggedIn ? t("pages.home.hero.buttonLogged") : t("pages.home.hero.button")}
              href={isLoggedIn ? "/producer" : "/auth/register"}
              size="lg"
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Bottom fade into page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#06080d] to-transparent pointer-events-none" />
    </div>
  );
}
