import { useTranslation } from "react-i18next";
import ThreeCards from "./cards/ThreeCards";
import TitleInBox from "../TitleInBox";
import Button from "../Button.jsx";

export default function Program() {
  const { t } = useTranslation();

  return (
    <div>

      {/* TITRE PRINCIPAL */}
      <div className="w-full flex items-center justify-center pt-20 pb-3.5 px-4">
        <h2 className="text-4xl md:text-6xl font-bold text-center text-white uppercase pb-6">
          {t("pages.home.program.title")}{" "}
          <span className="text-[#F6339A]">
            {t("pages.home.program.titleAccent")}
          </span>
        </h2>
      </div>

      {/* TITLE IN BOX */}
      <div className="ml-0 md:ml-6 pl-4 md:pl-20 text-xl md:text-2xl pb-3.5">
        <TitleInBox
          icon={
            <svg height="20" width="20" viewBox="0 0 20 20">
              <path
                d="M1 4c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4zm2 2v12h14V6H3zm2-6h2v2H5V0zm8 0h2v2h-2V0zM5 9h2v2H5V9zm0 4h2v2H5v-2zm4-4h2v2H9V9zm0 4h2v2H9v-2zm4-4h2v2h-2V9zm0 4h2v2h-2v-2z"
                fill="currentColor"
              />
            </svg>
          }
          iconcolor="#AD46FF"
          title={t("pages.home.program.agendaLabel")}
        />
      </div>

      {/* LISTE */}
      <div className="ml-0 md:ml-6 pl-6 md:pl-30 text-xl md:text-2xl">
        <ul className="list-decimal pl-5 space-y-1">
          <li>{t("pages.home.program.debateItem")}</li>
          <li>{t("pages.home.program.confrontationItem")}</li>
          <li>{t("pages.home.program.interrogationItem")}</li>
        </ul>
      </div>

      {/* 3 CARTES */}
      <div className="pt-12 pb-12 px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 place-items-center gap-10">

        <ThreeCards
          icon={
            <svg height="200" width="200" viewBox="0 0 24 24">
              <path
                d="M5 5v14a2 2 0 0 0 2.75 1.84L20 13.74a2 2 0 0 0 0-3.5L7.75 3.14A2 2 0 0 0 5 4.89"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          }
          title={t("pages.home.program.projectionsTitle")}
          description={t("pages.home.program.projectionsDescription")}
          accentColor="#C27AFF"
          borderColor="border-[rgba(194,122,255,0.40)]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(173,70,255,0.7)]"
        />

        <ThreeCards
          icon={
            <svg height="200" width="200" viewBox="0 0 24 24">
              <path
                d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2m1-17.87a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          }
          title={t("pages.home.program.workshopsTitle")}
          description={t("pages.home.program.workshopsDescription")}
          accentColor="#FB64B6"
          borderColor="border-[rgba(251,100,182,0.40)]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(251,100,182,0.7)]"
        />

        <ThreeCards
          icon={
            <svg height="200" width="200" viewBox="0 0 24 24">
              <path
                d="M12.766 7.979a2.305 2.305 0 1 1 3.26 3.26a2.305 2.305 0 0 1-3.26-3.26m2.199 1.06a.805.805 0 1 0-1.139 1.14a.805.805 0 0 0 1.139-1.14"
                fill="currentColor"
              />
              <path
                d="M20.622 4.043a.75.75 0 0 0-.66-.66A12.66 12.66 0 0 0 9.55 7.015a12.7 12.7 0 0 0-1.735 2.159a6.73 6.73 0 0 0-4.505 1.972a6.8 6.8 0 0 0-1.226 1.676a.75.75 0 0 0 .812 1.08a6.14 6.14 0 0 1 3.552.35l3.302 3.3a6.14 6.14 0 0 1 .35 3.554a.75.75 0 0 0 1.079.813a6.8 6.8 0 0 0 1.677-1.227a6.73 6.73 0 0 0 1.972-4.503a12.7 12.7 0 0 0 2.161-1.737a12.66 12.66 0 0 0 3.633-10.409"
                fill="currentColor"
              />
              <path
                d="m3.03 20.25l.75-.027za.75.75 0 0 0 .722.723l.028-.75l-.028.75h.032a7 7 0 0 0 .345.003c.222-.003.528-.013.857-.044c.326-.03.696-.083 1.04-.177c.32-.088.721-.24 1.013-.532a2.305 2.305 0 1 0-3.26-3.26c-.292.292-.443.693-.531 1.014a6 6 0 0 0-.178 1.04a11 11 0 0 0-.04 1.202z"
                fill="currentColor"
              />
            </svg>
          }
          title={t("pages.home.program.awardsTitle")}
          description={t("pages.home.program.awardsDescription")}
          accentColor="#00D492"
          borderColor="border-[rgba(0,212,146,0.40)]"
          hoverShadow="hover:shadow-[0_0_40px_rgba(0,212,146,0.7)]"
        />

      </div>

      {/* BOUTON */}
      <div className="flex justify-center pt-2 mt-6 px-4">
        <Button
          title={t("pages.home.program.fullAgendaButton")}
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
