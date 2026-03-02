import "./Home.css";
import { useTranslation } from "react-i18next";

export default function JuryPublic() {
  const { t } = useTranslation();

  return (
    <>
      {/* PRESIDENT */}

      <div className="flex flex-row items-center justify-center gap-5 pt-20 md:pt-35">
        <div className="bg-[#252525] rounded-full border-[#2B7FFF] border-2 h-12 w-12 flex items-center justify-center hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">
          <svg height="40" width="40" viewBox="0 0 32 32">
            <path d="M20.77 12.364s.85-3.51 0-4.7c-.85-1.188-1.188-1.98-3.057-2.547s-1.188-.454-2.547-.396c-1.36.058-2.492.793-2.492 1.19c0 0-.85.056-1.188.396c-.34.34-.906 1.924-.906 2.32s.283 3.06.566 3.625l-.337.114c-.284 3.283 1.13 3.68 1.13 3.68c.51 3.058 1.02 1.756 1.02 2.548s-.51.51-.51.51s-.452 1.245-1.584 1.698c-1.132.452-7.416 2.886-7.927 3.396c-.512.51-.454 2.888-.454 2.888h26.947s.06-2.377-.452-2.888c-.51-.51-6.795-2.944-7.927-3.396c-1.132-.453-1.584-1.698-1.584-1.698s-.51.282-.51-.51s.51.51 1.02-2.548c0 0 1.413-.397 1.13-3.68h-.34z" fill="#2B7FFF"/>
          </svg>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold">
          {t("pages.juryPublic.presidentTitle")}
        </h1>
      </div>

      <section className="flex flex-col lg:flex-row justify-center items-center mt-8 mb-8 gap-8 px-4 lg:px-8 max-w-6xl mx-auto">
        <div>
          <img
            className="w-58 max-w-sm md:max-w-md rounded-xl grayscale-30 object-cover"
            src="../src/assets/images/jury/photo-pierre-schoeller.jpg"
          />
        </div>

        <div className="bg-[#101828] border-[#364153] border-2 rounded-xl h-auto lg:h-85 w-full lg:w-120 m-5 pr-8 pl-8 pb-4 pt-4 text-center flex flex-col justify-center items-center">
          <h1 className="text-pink-500 text-2xl md:text-3xl">
            Pierre Schoeller
          </h1>

          <h2 className="text-white text-center text-xl md:text-2xl font-bold">
            {t("pages.juryPublic.presidentRole")}
          </h2>

          <p className="text-white text-center flex flex-col justify-center items-center pb-4 pt-4 text-sm md:text-base">
            {t("pages.juryPublic.presidentBio")}
          </p>
        </div>
      </section>

      {/* MEMBRES DU JURY */}

      <div className="flex flex-col md:flex-row justify-center items-center pt-10 pb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold">
          {t("pages.juryPublic.membersTitle1")}
        </h1>
        <h1 className="text-3xl md:text-5xl font-bold md:ml-3 text-[#F6339A]">
          {t("pages.juryPublic.membersTitle2")}
        </h1>
      </div>

      <div className="flex justify-center items-center mt-5">
        <p className="mb-8">
          {t("pages.juryPublic.membersSubtitle")}
        </p>
      </div>

      {/* GRID JURY */}

      <section className="text-[#2B7FFF] px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-10 pl-10">

          <div className="bg-[url(../src/assets/images/jury/tina-baz-le-gal_monteuse.jpg)] relative w-full aspect-square bg-cover bg-center flex flex-col justify-end items-center p-4 hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">
            <h2 className="font-bold text-xl text-center">
              {t("pages.juryPublic.members.tina.name")}
            </h2>
            <p className="text-white text-center">
              {t("pages.juryPublic.members.tina.role")}
            </p>
          </div>

          <div className="bg-[url(../src/assets/images/jury/jerome-genevray-réalisateur_et_scenariste.jpg)] relative w-full aspect-square bg-cover bg-center flex flex-col justify-end items-center p-4 hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">
            <h2 className="font-bold text-xl text-center">
              {t("pages.juryPublic.members.jerome.name")}
            </h2>
            <p className="text-white text-center">
              {t("pages.juryPublic.members.jerome.role")}
            </p>
          </div>

          <div className="bg-[url(../src/assets/images/jury/eve-machuel_productrice.jpeg)] relative w-full aspect-square bg-cover bg-center flex flex-col justify-end items-center p-4 hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">
            <h2 className="font-bold text-xl text-center">
              {t("pages.juryPublic.members.eve.name")}
            </h2>
            <p className="text-white text-center">
              {t("pages.juryPublic.members.eve.role")}
            </p>
          </div>

          <div className="bg-[url(../src/assets/images/jury/anne-sophie-novel_journaliste_auteure_réalisatrice.jpeg)] relative w-full aspect-square bg-cover bg-center flex flex-col justify-end items-center p-4 hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">
            <h2 className="font-bold text-xl text-center">
              {t("pages.juryPublic.members.anne.name")}
            </h2>
            <p className="text-white text-center">
              {t("pages.juryPublic.members.anne.role")}
            </p>
          </div>

          <div className="bg-[url(../src/assets/images/jury/vipulan-puvaneswaran_militant_écologiste.jpg)] relative w-full aspect-square bg-cover bg-center flex flex-col justify-end items-center p-4 hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">
            <h2 className="font-bold text-xl text-center">
              {t("pages.juryPublic.members.vipulan.name")}
            </h2>
            <p className="text-white text-center">
              {t("pages.juryPublic.members.vipulan.role")}
            </p>
          </div>

          <div className="bg-[url(../src/assets/images/jury/Barbara-schulz_comédienne.jpg)] relative w-full aspect-square bg-cover bg-center flex flex-col justify-end items-center p-4 hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">
            <h2 className="font-bold text-xl text-center">
              {t("pages.juryPublic.members.barbara.name")}
            </h2>
            <p className="text-white text-center">
              {t("pages.juryPublic.members.barbara.role")}
            </p>
          </div>

        </div>
      </section>

      {/* CHARTE */}

      <div className="flex flex-col md:flex-row justify-center items-center pt-20 md:pt-30 font-bold text-3xl md:text-5xl uppercase text-center">
        <h2>{t("pages.juryPublic.charter.title1")}</h2>
        <h2 className="md:ml-4 text-[#F6339A]">
          {t("pages.juryPublic.charter.title2")}
        </h2>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center pt-20 md:pt-30 pb-20 md:pb-30 px-4">

        {/* AI */}
        <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 pr-6 pl-6 border-2 border-[#ad46ff]/20 rounded-4xl w-full min-h-60 max-w-[320px] mx-auto hover:shadow-[0_0_20px_rgba(173,70,255,0.5)] transition-shadow duration-200">
          <h2 className="text-[#ad46ff] uppercase font-bold text-2xl mt-3 mb-3">
            {t("pages.juryPublic.criteria.ai.title")}
          </h2>
          <p className="text-white text-center">
            {t("pages.juryPublic.criteria.ai.description")}
          </p>
        </div>

        {/* Aesthetic */}
        <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 border-2 border-[#00D492]/20 rounded-4xl w-full min-h-60 max-w-[320px] mx-auto hover:shadow-[0_0_20px_rgba(0,212,146,0.5)] transition-shadow duration-200">
          <h2 className="text-[#00D492] uppercase font-bold text-2xl mt-3 mb-3">
            {t("pages.juryPublic.criteria.aesthetic.title")}
          </h2>
          <p className="text-white text-center">
            {t("pages.juryPublic.criteria.aesthetic.description")}
          </p>
        </div>

        {/* Story */}
        <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 pr-8 pl-8 border-2 border-[#F6339A]/20 rounded-4xl w-full min-h-60 max-w-[320px] mx-auto hover:shadow-[0_0_20px_rgba(246,51,154,0.5)] transition-shadow duration-200">
          <h2 className="text-[#F6339A] uppercase font-bold text-2xl mt-3 mb-3">
            {t("pages.juryPublic.criteria.story.title")}
          </h2>
          <p className="text-white text-center">
            {t("pages.juryPublic.criteria.story.description")}
          </p>
        </div>

        {/* Emotion */}
        <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 pr-8 pl-8 border-2 border-[#00B8DB]/20 rounded-4xl w-full min-h-60 max-w-[320px] mx-auto hover:shadow-[0_0_20px_rgba(0,184,219,0.5)] transition-shadow duration-200">
          <h2 className="text-[#00B8DB] uppercase font-bold text-2xl mt-3 mb-3">
            {t("pages.juryPublic.criteria.emotion.title")}
          </h2>
          <p className="text-white text-center">
            {t("pages.juryPublic.criteria.emotion.description")}
          </p>
        </div>

      </section>
    </>
  );
}