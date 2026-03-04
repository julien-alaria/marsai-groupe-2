//import data from "../../assets/data/categoriesPartenaires.json";
import { useEffect, useState } from "react";
import { getSponsors } from "../../api/sponsors";
import PartenaireGrid from "../../components/PartenairesGrid";
import { useTranslation } from "react-i18next";


export default function Partenaires() {
  const { t } = useTranslation();
  const [data, setData] = useState({
    officiels: [],
    medias: [],
    techniques: [],
    divers: []
  });

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await getSponsors();
        const sponsors = res.data;

        const grouped = {
          officiels: [],
          medias: [],
          techniques: [],
          divers: []
        };

        sponsors.forEach((sponsor) => {
          const category = sponsor.category?.toLowerCase();

          if (grouped[category]) {
            grouped[category].push(sponsor);
          } else {
            grouped.divers.push(sponsor);
          }
        });

        setData(grouped);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSponsors();
  }, []);

  return (
    <>
      <div className="container mx-auto px-12 py-30">

        {/* OFFICIELS */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pb-15">
          {t("pages.sponsors.title")}{" "}
          <span className="text-[#F6339A]">
            {t("pages.sponsors.categories.officiels")}
          </span>
        </h2>
        <PartenaireGrid items={data.officiels} />

        {/* MEDIAS */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pt-6 pb-15">
          {t("pages.sponsors.title")}{" "}
          <span className="text-[#F6339A]">
            {t("pages.sponsors.categories.medias")}
          </span>
        </h2>
        <PartenaireGrid items={data.medias} />

        {/* TECHNIQUES */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pt-6 pb-15">
          {t("pages.sponsors.title")}{" "}
          <span className="text-[#F6339A]">
            {t("pages.sponsors.categories.techniques")}
          </span>
        </h2>
        <PartenaireGrid items={data.techniques} />

        {/* DIVERS */}
        <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pt-6 pb-15">
          {t("pages.sponsors.title")}{" "}
          <span className="text-[#F6339A]">
            {t("pages.sponsors.categories.divers")}
          </span>
        </h2>
        <PartenaireGrid items={data.divers} />

      </div>
    </>
  );
}

