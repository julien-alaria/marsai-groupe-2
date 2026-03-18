import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Button from "../Button.jsx";

export default function Hero() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="./src/assets/images/festival.png"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/15"></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-4 sm:px-6">
        <div className="text-center max-w-5xl mx-auto space-y-6 md:space-y-8">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
              <span className="size-2 rounded-full bg-[#C77DFF] animate-pulse"></span>
              <span className="text-xs md:text-sm tracking-widest uppercase text-white">
                {t("pages.home.hero.subtitle")} {t("pages.home.hero.year")}
              </span>
            </div>
          </div>
        
          <div className="animate-fade-in-up animation-delay-150">
            <h1 className="font-outfit font-bold md:font-extrabold text-white leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]">MARS</span>
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-gradient-hero ml-2 sm:ml-4">AI</span>
            </h1>
          </div>

          <div className="animate-fade-in-up animation-delay-300">
            <p className="font-outfit font-light text-white text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {t("pages.home.hero.title1")}{" "}
              <span className="font-semibold text-gradient-hero-soft">
                {t("pages.home.hero.title2")}
              </span>{" "}
              {t("pages.home.hero.title3")}
            </p>
          </div>

          <div className="animate-fade-in-up animation-delay-450 max-w-xl mx-auto space-y-1">
            <p className="font-outfit text-white/90 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t("pages.home.hero.description1")}
            </p>
            <p className="font-outfit font-medium text-sm sm:text-base md:text-lg text-gradient-warm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t("pages.home.hero.description2")}
            </p>
          </div>

          <div className="animate-fade-in-up animation-delay-600 pt-2">
            <Button
              title={isLoggedIn ? t("pages.home.hero.buttonLogged") : t("pages.home.hero.button")}
              href={isLoggedIn ? "/producer" : "/auth/register"}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}