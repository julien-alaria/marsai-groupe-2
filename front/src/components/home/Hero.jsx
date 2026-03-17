import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import TitleInBox from "../TitleInBox.jsx";
import Button from "../Button.jsx";
import heroVideo from "../../assets/videos/accueil_marsai_2.mp4";

export default function Hero() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Controlla se l'utente è loggato verificando il token in localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* Vidéo responsive */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          className="w-full h-full object-cover object-center
                     [@media(max-aspect-ratio:4/5)]:object-[50%_30%]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      </div>

      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/45"></div>

      {/* Contenu */}
      <div className="relative z-10 flex items-center justify-center w-full h-full px-4 md:px-6">
        <div className="text-center w-full">

          {/* Sur‑titre */}
          <TitleInBox 
            title={t("pages.home.hero.subtitle")} 
            spancolor="#AD46FF" 
            title2={t("pages.home.hero.year")}
          />
        

          {/* Titre principal */}
          <h1
            className="
              font-extrabold leading-none text-white
              text-[2.5rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem] xl:text-[11rem]
              md:whitespace-nowrap
            "
          >
            MARS{" "}
            <span className="bg-linear-to-r from-[#51A2FF] via-[#AD46FF] to-[#FF2B7F] bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          {/* Baseline */}
          <h2
            className="
              mt-4 font-semibold uppercase tracking-[0.2em] text-gray-200
              text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl
            "
          >
            {t("pages.home.hero.title1")}{" "}
            <span className="bg-linear-to-r from-[#AD46FF] via-[#F6339A] to-[#FF6900] bg-clip-text text-transparent">
              {t("pages.home.hero.title2")}
            </span>{" "}
            {t("pages.home.hero.title3")}
          </h2>

          {/* Description */}
          <div className="text-white pt-3.5">
            <TitleInBox
              title={
                <>
                  {t("pages.home.hero.description1")}
                  <br />
                  <div className="text-[#fd6cba] pt-2.5">
                    {t("pages.home.hero.description2")}
                  </div>
                </>
              }
            />
          </div>

          {/* Bouton */}
          <div className="flex justify-center pt-6 mt-6">
            <Button
              title={isLoggedIn ? t("pages.home.hero.buttonLogged") : t("pages.home.hero.button")}
              href={isLoggedIn ? "/producer" : "/auth/register"}
              backgroundColor="bg-white"
              textColor="text-black"
              hoverBackgroundColor="hover:bg-[#F5F5F5]"
              hoverBorderColor="hover:border-[#F6339A]"
              shadow = "shadow-[0_0_25px_rgba(255,255,255,0.35)]"
              hoverShadow = "hover:shadow-[0_0_40px_rgba(173,70,255,0.7)]"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
