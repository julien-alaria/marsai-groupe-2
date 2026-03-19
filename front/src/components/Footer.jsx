import { useTranslation } from "react-i18next";
import React from "react";
import Social from "../components/Social";
import Newsletter from "./Newsletter";

export default function Footer() {
const { t } = useTranslation();

  return (
    <footer className="w-full bg-black text-white font-light bottom-0 m-auto text-base">
      {/* Section principale */}
      <div className="w-full px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
        
        {/* Colonne gauche : identité + réseaux */}
        <div>
          <h2 className="text-4xl font-semibold mb-4">MARS <span className="text-[#AD46FF]">
AI</span></h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            {t("footer.description")}

          </p>
          <div className="flex space-x-4 text-gray-400">
            <Social />
          </div>
        </div>

        {/* Colonne centrale : NAVIGATION + LÉGAL */}
        <div className="grid grid-cols-2 gap-8">
          <div className="text-right">
            <h3 className="text-base font-semibold mb-4 text-[#AD46FF]">{t("footer.navigation.title")}</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/juryPublic" className="hover:text-white transition">{t("footer.navigation.jury")}</a></li>
              <li><a href="/program" className="hover:text-white transition">{t("footer.navigation.program")}</a></li>
              <li><a href="/program" className="hover:text-white transition">{t("footer.navigation.ticketing")}</a></li>
            </ul>
          </div>
          <div className="text-right">
            <h3 className="text-base font-semibold mb-4 text-[#F6339A]">{t("footer.legal.title")}</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/sponsors" className="hover:text-white transition">{t("footer.legal.partners")}</a></li>
              <li><a href="/infos" className="hover:text-white transition">{t("footer.legal.faq")}</a></li>
              <li><a href="/infos" className="hover:text-white transition">{t("footer.legal.contact")}</a></li>
            </ul>
          </div>
        </div>

        {/* Colonne droite : formulaire */}
        <div className="flex justify-end">
        <Newsletter />
        </div>
  </div>
      {/* Bas de page */}
      <div className="w-full border-t border-gray-800 px-8 py-6 text-center text-sm text-gray-400 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-16">
        <div>{t("footer.bottom.copyright")}</div>
        <div>{t("footer.bottom.design")}</div>
        <div><a href="#" className="hover:text-white transition">{t("footer.bottom.legal")}</a></div>
      </div>
    </footer>
  );
}


