import { useTranslation } from "react-i18next";
import FourCards from "./cards/FourCards";
import TitleInBox from "../TitleInBox";
import Button from "../Button";

export default function Protocole() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="w-full flex items-center justify-center pb-3.5"> 
        <TitleInBox 
          icon={<svg height="25" width="25" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.27 14.333a2.272 2.272 0 0 1 0-4.543a2.272 2.272 0 0 1 0 4.543zm19.46.858a3.122 3.122 0 0 1-1.822-.584c-.743.837-1.046 1.047-2.067 1.047c-1.541 0-3.12-2.32-4.558-4.315c1.497-2.335 2.87-3.878 4.331-3.878c1.115 0 2.185.493 2.787 1.767a3.115 3.115 0 0 1 1.329-.296a3.105 3.105 0 0 1 1.17.226c-.88-2.599-2.997-3.913-5.113-3.913c-2.335 0-4.06 2.16-5.576 4.629c-1.783-2.432-3.483-4.63-5.923-4.63c-2.077 0-4.154 1.287-5.044 3.83a3.118 3.118 0 0 1 .936-.142a3.113 3.113 0 0 1 1.718.514c.546-.773 1.245-1.235 2.007-1.21c1.537.052 2.928 1.85 4.687 4.325c-1.28 1.959-2.923 3.868-4.31 3.868c-1.057 0-2.074-.444-2.69-1.574a3.114 3.114 0 0 1-1.412.336c-.371.007-.734-.077-1.085-.185c.932 2.417 2.972 3.64 5.013 3.64c2.326 0 3.931-2.056 5.525-4.615c1.748 2.464 3.5 4.724 5.992 4.724c2.025 0 4.297-1.333 5.223-3.75c-.358.088-.724.2-1.118.186zm0-5.401a2.272 2.272 0 0 0 0 4.543a2.272 2.272 0 0 0 0-4.543z" fill="currentColor"/>
          </svg>}
          iconcolor="#AD46FF" 
          title={t("pages.home.protocole.immersion")} 
        /> 
      </div>
                    
      <h2 className="text-6xl font-bold text-center text-white uppercase pb-6">
        {t("pages.home.protocole.title")} <span className="text-[#F6339A]">{t("pages.home.protocole.titleAccent")}</span> {t("pages.home.protocole.titleEnd")}
      </h2>

      <div className="pt-12 pb-12 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 place-items-center gap-10">
      
        <FourCards
          title={t("pages.home.protocole.card1.title")}
          description={t("pages.home.protocole.card1.description")}
          accentColor="#C27AFF"
          borderColor="border-[rgba(194,122,255,0.40)]"
          hoverBorderColor="hover:border-[#C27AFF]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(173,70,255,0.7)]"
          height="h-40"
        />

        <FourCards
          title={t("pages.home.protocole.card2.title")}
          description={t("pages.home.protocole.card2.description")}
          accentColor="#00D492"
          borderColor="border-[rgba(0,212,146,0.40)]"
          hoverBorderColor="hover:border-[#00D492]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(0,212,146,0.7)]"
          height="h-40"
        />

        <FourCards
          title={t("pages.home.protocole.card3.title")}
          description={t("pages.home.protocole.card3.description")}
          accentColor="#FB64B6"
          borderColor="border-[rgba(251,100,182,0.40)]"
          hoverBorderColor="hover:border-[#FB64B6]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(251,100,182,0.7)]"
          height="h-40"
        />

        <FourCards
          title={t("pages.home.protocole.card4.title")}
          description={t("pages.home.protocole.card4.description")}
          accentColor="#2B7FFF"
          borderColor="border-[rgba(43,127,255,0.40)]"
          hoverBorderColor="hover:border-[#2B7FFF]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(43,127,255,0.7)]"
          height="h-40"
        />
      </div>

      {/* Bouton */}
      <div className="flex justify-center pt-2 mt-6">
        <Button
          title={t("pages.home.protocole.button")}
          href="/auth/register"
          border="border-white"
          backgroundColor="bg-gradient-to-r from-[#9810FA] to-[#E60076]"
          textColor="text-white"
          hovertextColor="hover:text-black"
          hoverBackgroundColor="hover:bg-white hover:bg-none"
          hoverBorderColor="hover:border-[#F6339A]"
          shadow="shadow-[0_0_25px_rgba(255,255,255,0.35)]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(173,70,255,0.7)]"
        />
      </div>
    </div>
  );
}