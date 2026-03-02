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
        <h1 className="text-3xl md:text-5xl font-bold">{t("pages.juryPublic.presidentTitle")}</h1>
      </div>

      <section className="flex flex-col lg:flex-row justify-center items-center mt-8 mb-8 gap-6 px-4">
        <div>
          <img
            className="h-72 md:h-85 rounded-xl grayscale-30"
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


          {/* MEMBRES  DU  JURY */}


<div className="flex flex-col md:flex-row justify-center items-center pt-10 pb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold">{t("pages.juryPublic.membersTitle1")}</h1>
        <h1 className="text-3xl md:text-5xl font-bold md:ml-3 text-[#F6339A]">
          {t("pages.juryPublic.membersTitle2")}
        </h1>
      </div>


    <div className=" flex justify-center items-center mt-5">  
    <p className="mb-8">{t("pages.juryPublic.membersSubtitle")}</p>
    </div>
    
    <section className="text-[#2B7FFF] px-70">

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
    <div className="bg-[url(../src/assets/images/jury/tina-baz-le-gal_monteuse.jpg)] h-80 w-80 bg-cover justify-center hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">

    <h2 className="mt-65  font-bold text-xl text-center">{t("pages.juryPublic.members.tina.name")}</h2>
    <p className="text-white text-center">{t("pages.juryPublic.members.tina.role")}</p>
  </div>
     <div className="bg-[url(../src/assets/images/jury/jerome-genevray-réalisateur_et_scenariste.jpg)] h-80 w-80 bg-cover justify-center hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">

    <h2 className="mt-65 font-bold text-xl text-center">{t("pages.juryPublic.members.jerome.name")}</h2>
    <p className="text-white text-center">{t("pages.juryPublic.members.jerome.role")}</p>

  </div>


<div className="bg-[url(../src/assets/images/jury/eve-machuel_productrice.jpeg)] h-80 w-80 bg-cover justify-center hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">

    <h2 className="mt-65 font-bold text-xl text-center">{t("pages.juryPublic.members.eve.name")}</h2>
    <p className="text-white text-center">{t("pages.juryPublic.members.eve.role")}</p>

  </div>


  </div>
  
  </section>

<section className="text-[#2B7FFF] px-70 py-5">

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">


<div className="bg-[url(../src/assets/images/jury/anne-sophie-novel_journaliste_auteure_réalisatrice.jpeg)] h-80 w-80 bg-cover justify-center hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">

    <h2 className="mt-65 font-bold text-xl text-center">{t("pages.juryPublic.members.anne.name")}</h2>
    <p className="text-white text-center">{t("pages.juryPublic.members.anne.role")}</p>
</div>


<div className="bg-[url(../src/assets/images/jury/vipulan-puvaneswaran_militant_écologiste.jpg)] h-80 w-80 bg-cover justify-center hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">

    <h2 className="mt-65 font-bold text-xl text-center">{t("pages.juryPublic.members.vipulan.name")}</h2>
    <p className="text-white text-center">{t("pages.juryPublic.members.vipulan.role")}</p>
</div>

<div className="bg-[url(../src/assets/images/jury/Barbara-schulz_comédienne.jpg)] h-80 w-80 bg-cover justify-center hover:shadow-[0_0_20px_rgba(2,183,255,0.8)] transition-shadow duration-200">

    <h2 className="mt-65 font-bold text-xl text-center">{t("pages.juryPublic.members.barbara.name")}</h2>
    <p className="text-white text-center">{t("pages.juryPublic.members.barbara.role")}</p>

</div>

  </div>

</section>


          {/* LA  CHARTE  DE  NOTATION */}


      <div className="flex flex-col md:flex-row justify-center items-center pt-20 md:pt-30 font-bold text-3xl md:text-5xl uppercase text-center">
        <h2>{t("pages.juryPublic.charter.title1")}</h2>
        <h2 className="md:ml-4 text-[#F6339A]">{t("pages.juryPublic.charter.title2")}</h2>
      </div>

        {/* LA  CHARTE  DE  NOTATION ( cards ) */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center pt-20 md:pt-30 pb-20 md:pb-30 px-4">



  <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 pr-6 pl-6 border-2 border-[#ad46ff]/20 rounded-4xl h-60 w-90 hover:shadow-[0_0_20px_rgba(173,70,255,0.5)] transition-shadow duration-200">

    <svg className=" bg-[#252525] rounded-full p-1 border-[#ad46ff]/50 border-2 hover:shadow-[0_0_20px_rgba(173,70,255,0.8)] transition-shadow duration-200"
    height="55" width="55" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
	<path d="M7 4.5a3 3 0 0 0-2.567 4.554a3.001 3.001 0 0 0 0 5.893M7 4.5a2.5 2.5 0 0 1 5 0v15a2.5 2.5 0 0 1-5 0a3 3 0 0 1-2.567-4.553M7 4.5c0 .818.393 1.544 1 2m-3.567 8.447A3 3 0 0 1 6 13.67m13.25-8.92L17 7h-2m3.5-2.25a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0m.75 14.5L17 17h-2m3.5 2.25a.75.75 0 1 1 1.5 0a.75.75 0 0 1-1.5 0m.75-7.25H15m3.5 0a.75.75 0 1 0 1.5 0a.75.75 0 0 0-1.5 0" fill="none" stroke="#AD46FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
</svg>

    <h2 className="text-[#ad46ff] uppercase font-bold text-2xl mt-3 mb-3"> {t("pages.juryPublic.criteria.ai.title")}</h2>
    <p className="text-white flex justify-center items-center">{t("pages.juryPublic.criteria.ai.description")}</p>
  </div>




  <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 border-2 border-[#00D492]/20 rounded-4xl h-60 w-90  hover:shadow-[0_0_20px_rgba(0,212,146,0.5)] transition-shadow duration-200">

    <svg className=" bg-[#252525] rounded-full p-1 border-[#00D492]/50 border-2 hover:shadow-[0_0_20px_rgba(0,212,146,0.8)] transition-shadow duration-200" height="55" width="55" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
	<path d="M21.92 11.6C19.9 6.91 16.1 4 12 4s-7.9 2.91-9.92 7.6a1 1 0 0 0 0 .8C4.1 17.09 7.9 20 12 20s7.9-2.91 9.92-7.6a1 1 0 0 0 0-.8ZM12 18c-3.17 0-6.17-2.29-7.9-6C5.83 8.29 8.83 6 12 6s6.17 2.29 7.9 6c-1.73 3.71-4.73 6-7.9 6Zm0-10a4 4 0 1 0 4 4a4 4 0 0 0-4-4Zm0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2Z" fill="#00D492"/>
</svg>

    <h2 className="text-[#00D492] uppercase font-bold text-2xl mt-3 mb-3"> {t("pages.juryPublic.criteria.aesthetic.title")} </h2>
    <p className="text-white flex justify-center items-center">{t("pages.juryPublic.criteria.aesthetic.description")} <br/>
    rendu global.</p>
  </div>




  <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 pr-8 pl-8 border-2 border-[#F6339A]/20 rounded-4xl h-60 w-90  hover:shadow-[0_0_20px_rgba(246,51,154,0.5)] transition-shadow duration-200">

    <svg className=" bg-[#252525] rounded-full p-1 border-[#F6339A]/50 border-2  hover:shadow-[0_0_20px_rgba(246,51,154,0.8)] transition-shadow duration-200" height="55" width="55" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
	<path d="M468.53 236.03H486v39.94h-17.47v-39.94zm-34.426 51.634h17.47v-63.328h-17.47v63.328zm-33.848 32.756h17.47V191.58h-17.47v128.84zm-32.177 25.276h17.47V167.483h-17.47v178.17zm-34.448-43.521h17.47v-92.35h-17.47v92.35zm-34.994 69.879h17.47v-236.06h-17.525v236.06zM264.2 405.9h17.47V106.1H264.2v299.8zm-33.848-46.284h17.47V152.383h-17.47v207.234zm-35.016-58.85h17.47v-87.35h-17.47v87.35zm-33.847-20.823h17.47V231.98h-17.47v48.042zm-33.848 25.66h17.47v-99.24h-17.47v99.272zm-33.302 48.04h17.47V152.678H94.34v201zm-33.847-30.702h17.47V187.333h-17.47v135.642zM26 287.664h17.47v-63.328H26v63.328z" fill="#F6339A"/>
</svg>

    <h2 className="text-[#F6339A] uppercase font-bold text-2xl mt-3 mb-3"> {t("pages.juryPublic.criteria.story.title")} </h2>
    <p className="text-white flex justify-center items-center">{t("pages.juryPublic.criteria.story.description")}</p>
  </div>




  <div className="bg-[#0d0d0d] flex flex-col justify-center items-center pt-4 pb-4 pr-8 pl-8 border-2 border-[#00B8DB]/20 rounded-4xl h-60 w-90  hover:shadow-[0_0_20px_rgba(0,184,219,0.5)] transition-shadow duration-200">

    <svg className=" bg-[#252525] rounded-full p-1.5 border-[#00B8DB]/50 border-2 hover:shadow-[0_0_20px_rgba(0,184,219,0.8)] transition-shadow duration-200" height="55" width="55" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
	<path d="M12 1.316C6.099 1.316 1.316 6.099 1.316 12S6.099 22.684 12 22.684S22.684 17.901 22.684 12c-.012-5.896-4.788-10.672-10.683-10.684H12zm0 22.297C5.586 23.613.387 18.414.387 12S5.586.387 12 .387S23.613 5.586 23.613 12v.015c0 6.405-5.192 11.597-11.597 11.597H12h.001z" fill="#00B8DB"/>
	<path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12c-.034 6.614-5.386 11.966-11.997 12zM12 .774C5.8.774.774 5.8.774 12S5.8 23.226 12 23.226S23.226 18.2 23.226 12C23.222 5.802 18.198.779 12.001.774zm0 22.374C5.886 23.148.929 18.191.929 12.077S5.886 1.006 12 1.006s11.071 4.957 11.071 11.071S18.114 23.148 12 23.148zm0-21.445C6.313 1.703 1.703 6.313 1.703 12S6.313 22.297 12 22.297S22.297 17.687 22.297 12v-.005c0-5.684-4.608-10.292-10.292-10.292H12z" fill="#00B8DB"/>
	<path d="M18.116 14.245v.036a6.08 6.08 0 0 1-6.08 6.08h-.038H12h-.036a6.08 6.08 0 0 1-6.08-6.08v-.038v.002zM9.677 9.91v.009c0 1.15-.932 2.082-2.082 2.082h-.009a2.09 2.09 0 1 1 2.09-2.09zm8.904 0a2.09 2.09 0 0 1-4.18 0v-.009c0-1.15.932-2.082 2.082-2.082h.009a2.132 2.132 0 0 1 2.09 2.088v.002z" fill="#00B8DB"/>
</svg>

    <h2 className="text-[#00B8DB] uppercase font-bold text-2xl mt-3 mb-3"> {t("pages.juryPublic.criteria.emotion.title")} </h2>
    <p className="text-white flex justify-center items-center">
    {t("pages.juryPublic.criteria.emotion.description")}</p>
  </div>



</section>


    </>
      );
}