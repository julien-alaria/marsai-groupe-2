import data from "../../assets/data/categoriesPartenaires.json";
import PartenaireGrid from "../../components/PartenairesGrid";
import { useTranslation } from "react-i18next";

export default function Partenaires() {
  const { t } = useTranslation();
  return (
    <>
      <div className="container mx-auto px-12 py-30">

        {/* TITRE OFFICIELS */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pb-15">
          {t("pages.sponsors.title")}{" "} <span className="text-[#F6339A]">{t("pages.sponsors.categories.officiels")}</span>
        </h2>
        <PartenaireGrid items={data.officiels} />

        {/* TITRE MEDIAS */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pt-6 pb-15">
          {t("pages.sponsors.title")}{" "} <span className="text-[#F6339A]">{t("pages.sponsors.categories.medias")}</span>
        </h2>
        <PartenaireGrid items={data.medias} />

        {/* TITRE TECHNIQUES */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pt-6 pb-15">
          {t("pages.sponsors.title")}{" "} <span className="text-[#F6339A]">{t("pages.sponsors.categories.techniques")}</span>
        </h2>
        <PartenaireGrid items={data.techniques} />
15
        {/* TITRE DIVERS */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pt-6 pb-15">
          {t("pages.sponsors.title")}{" "} <span className="text-[#F6339A]">{t("pages.sponsors.categories.divers")}</span>
        </h2>
        <PartenaireGrid items={data.divers} />

      </div>
    </>
  );
}