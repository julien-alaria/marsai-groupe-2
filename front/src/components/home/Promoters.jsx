import { useTranslation } from "react-i18next";
import logoplateforme from "../../assets/images/plateforme_logo.png";
import logomobilefilm from "../../assets/images/mobile_film_logo.png";


export default function Promoters() {
    const { t } = useTranslation();
    return (
<div>
    <h2 className="pt-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white uppercase leading-tight">
          {t("pages.home.promoters.partnersTitle")}
        </h2>
    <div className="w-full flex items-center justify-center pt-20 pb-3.5 gap-100">
     <img className="w-100" src={logoplateforme} alt="Logo de la plateforme" />
    <img className="w-120" src={logomobilefilm} alt="Logo mobile film" />
      </div>
</div>
    )
}