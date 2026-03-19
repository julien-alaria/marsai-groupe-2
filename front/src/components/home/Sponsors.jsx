import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Carousel from "./Caroussel";
import OneCardWithImage from "./cards/OneCardWithImage";
import TitleInBox from "../TitleInBox.jsx";
import { getSponsors } from "../../api/sponsors";
import { UPLOAD_BASE } from "../../utils/constants";

export default function Sponsors() {
  const { t } = useTranslation();
  const [sponsors, setSponsors] = useState([]);

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
      image={`${UPLOAD_BASE}${sponsor.logo}`}
      url={sponsor.url}
      accentColor={sponsor.accentColor || "#F6339A"}
      borderColor={sponsor.borderColor || "#F6339A"}
      hoverShadow={sponsor.hoverShadow || "#F6339A"}
    />
  ));

  return (
    <div className="w-full pt-12 justify-center gap-10">
      <div className="w-full flex items-center justify-center pt-10">
        <TitleInBox
          icon={
            <svg height="20" width="20" viewBox="0 0 16 16">
              <path
                d="M7.984 14q-.217 0-.409-.077a1.3 1.3 0 0 1-.369-.236l-.73-.671Q4.24 11.012 2.62 9.18Q1 7.35 1 5.43q0-1.453.994-2.441q.995-.99 2.445-.989q.85 0 1.784.436C6.845 2.727 7.438 3.142 8 4c.59-.858 1.189-1.273 1.798-1.564Q10.711 2 11.561 2q1.45 0 2.445.989q.994.988.994 2.44q0 1.967-1.7 3.823A59 59 0 0 1 9.526 13l-.747.687a1.15 1.15 0 0 1-.794.313z"
                fill="#f06292"
              />
            </svg>
          }
          iconcolor="#AD46FF"
          title={t("pages.home.sponsors.ourSupport")}
        />
      </div>

      <h2 className="pt-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white uppercase leading-tight">
        {t("pages.home.sponsors.theySupportFuture")}{" "}
        <span className="text-[#F6339A]">
          {t("pages.home.sponsors.theySupportFutureAccent")}
        </span>
      </h2>

      <div className="w-full pt-10">
        <Carousel items={cards} interval={3000} />
      </div>
    </div>
  );
}















/*import { useTranslation } from "react-i18next";
import Carousel from "./Caroussel";
import OneCardWithImage from "./cards/OneCardWithImage";
import TitleInBox from "../TitleInBox.jsx";
import sponsors from "../../assets/data/sponsors.json";

// 🔥 Import automatique de toutes les images du dossier
const images = import.meta.glob("../../assets/images/sponsors/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default"
});

export default function Sponsors() {
  const { t } = useTranslation();
  const cards = sponsors.map((sponsor, index) => {
    // On cherche l’image correspondante
    const imageKey = Object.keys(images).find((path) =>
      path.includes(sponsor.image)
    );

    return (
      <OneCardWithImage
        key={index}
        image={images[imageKey]}
        accentColor={sponsor.accentColor}
        borderColor={sponsor.borderColor}
        hoverShadow={sponsor.hoverShadow}
      />
    );
  });

  return (
    <div className="w-full pt-12 justify-center gap-10">
      <div className="w-full flex items-center justify-center pt-10">
        <TitleInBox
          icon={
            <svg height="20" width="20" viewBox="0 0 16 16">
              <path
                d="M7.984 14q-.217 0-.409-.077a1.3 1.3 0 0 1-.369-.236l-.73-.671Q4.24 11.012 2.62 9.18Q1 7.35 1 5.43q0-1.453.994-2.441q.995-.99 2.445-.989q.85 0 1.784.436C6.845 2.727 7.438 3.142 8 4c.59-.858 1.189-1.273 1.798-1.564Q10.711 2 11.561 2q1.45 0 2.445.989q.994.988.994 2.44q0 1.967-1.7 3.823A59 59 0 0 1 9.526 13l-.747.687a1.15 1.15 0 0 1-.794.313z"
                fill="#f06292"
              />
            </svg>
          }
          iconcolor="#AD46FF"
          title={t("pages.home.sponsors.ourSupport")}
        />
      </div>

      <h2 className="pt-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white uppercase leading-tight">
        {t("pages.home.sponsors.theySupportFuture")} <span className="text-[#F6339A]">{t("pages.home.sponsors.theySupportFutureAccent")}</span>
      </h2>

      <div className="w-full pt-10">
        <Carousel items={cards} interval={3000} />
      </div>
    </div>
  );
}*/