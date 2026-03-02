import "./Home.css";
import { useTranslation } from "react-i18next";

export default function InfosPublic() {
  const { t } = useTranslation();

  return (
    <>
      <div className="pt-40 pb-12 w-full flex justify-center">
        <div className="flex flex-col w-full max-w-300 px-4 md:px-0">

          {/* TITRE */}
          <h2 className="text-4xl md:text-6xl font-bold text-white uppercase text-center pb-6">
            {t("pages.infos.title")}{" "} <span className="text-[#F6339A]">{t("pages.infos.subtitle")}</span>
          </h2>

          {/* ACCÈS */}
          <h3 className="text-4xl md:text-5xl font-bold text-white uppercase text-left pt-40 pb-6 flex items-center gap-4">
            <svg height="60" width="60" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g fill="none">
                <path d="M24 47.998c13.255 0 24-10.745 24-24C48 10.746 37.255 0 24 0S0 10.745 0 23.999s10.745 23.999 24 23.999" fill="#2B7FFF"/>
                <path d="M12.43 22.595a.873.873 0 0 1-.04-1.648l21.643-8.103a.872.872 0 0 1 1.123 1.123L27.053 35.61a.873.873 0 0 1-1.648-.04l-3.014-9.397a.87.87 0 0 0-.564-.564z" fill="#f0f1f1"/>
                <path d="M34.033 12.844L12.39 20.947a.874.874 0 0 0 .04 1.648l9.397 3.013a.9.9 0 0 1 .263.145l12.776-12.776a.87.87 0 0 0-.833-.133" fill="#fff"/>
              </g>
            </svg>
            {t("pages.infos.access")}
          </h3>

          {/* TRANSPORTS */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 text-white text-left text-base uppercase pt-20 gap-10">

            <div className="flex items-start gap-6">
              <div className="
                mb-6
                w-20 h-20
                rounded-full
                border-2
                border-[rgba(0,212,146,0.70)]
                hover:shadow-[0_0_40px_rgba(0,212,146,0.7)]
                flex items-center justify-center
                bg-white/10
              ">
                <svg height="50" width="50" viewBox="0 0 16 16">
                  <path d="M13 11.2V3.8c0-1-.8-1.8-1.8-1.8H9V1h2V0H5v1h2v1H4.8C3.8 2 3 2.8 3 3.8v7.4c0 1 .8 1.8 1.8 1.8H5l-.7 1H3v1h.7L3 16h2l.6-1h4.9l.6 1h2l-.7-1h.6v-1h-1.3l-.7-1h.2c1 0 1.8-.8 1.8-1.8zM4 3.9c0-.5.4-.9.9-.9H11c.6 0 1 .4 1 .9V6c0 .6-.4 1-.9 1H4.9c-.5 0-.9-.4-.9-.9V3.9zM4 11c0-.6.4-1 1-1s1 .4 1 1s-.4 1-1 1s-1-.4-1-1zm5.9 3H6.1l.6-1h2.6l.6 1zm.1-3c0-.6.4-1 1-1s1 .4 1 1s-.4 1-1 1s-1-.4-1-1z" fill="#00D492"/>
                </svg>
              </div>

              <div className="pt-2">
                <h4 className="text-[#00D492] text-3xl font-bold"> {t("pages.infos.publicTransport.title")}</h4>
                <p className="text-white text-base uppercase pt-4">
                  {t("pages.infos.publicTransport.line1")}<br/>
                  {t("pages.infos.publicTransport.line2")}<br/>
                  {t("pages.infos.publicTransport.line3")}
                </p>
              </div>
            </div>

          </div>

          {/* VOITURE */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 text-white text-left text-base uppercase pt-15 gap-10">

            <div className="flex items-start gap-6">
              <div className="
                mb-6
                w-20 h-20
                rounded-full
                border-2
                border-[rgba(251,100,182,0.70)]
                hover:shadow-[0_0_40px_rgba(251,100,182,0.7)]
                flex items-center justify-center
                bg-white/10
              ">
                <svg height="40" width="40" viewBox="0 0 384 384">
                  <path d="m340 64l44 128v171q0 8-6.5 14.5T363 384h-22q-8 0-14.5-6.5T320 363v-22H64v22q0 8-6.5 14.5T43 384H21q-8 0-14.5-6.5T0 363V192L44 64q8-21 31-21h234q23 0 31 21zM74.5 277q13.5 0 23-9t9.5-22.5t-9.5-23t-23-9.5t-22.5 9.5t-9 23t9 22.5t22.5 9zm235 0q13.5 0 22.5-9t9-22.5t-9-23t-22.5-9.5t-23 9.5t-9.5 23t9.5 22.5t23 9zM43 171h298l-32-96H75z" fill="#FB64B6"/>
                </svg>
              </div>

              <div className="pt-2">
                <h4 className="text-[#FB64B6] text-3xl font-bold">{t("pages.infos.car.title")}</h4>
                <p className="text-white text-base uppercase pt-4">
                  {t("pages.infos.car.line1")}<br/>
                  {t("pages.infos.car.line2")}
                </p>
              </div>
            </div>

          </div>

          {/* ADRESSE */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 text-white text-left text-base uppercase pt-15 gap-10">

            <div className="flex items-start gap-6">
              <div className="
                mb-6
                w-20 h-20
                rounded-full
                border-2
                border-[rgba(194,122,255,0.70)]
                hover:shadow-[0_0_40px_rgba(173,70,255,0.7)]
                flex items-center justify-center
                bg-white/10
              ">
                <svg height="50" width="50" viewBox="0 0 24 24">
                  <g fill="none" stroke="#C27AFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </g>
                </svg>
              </div>

              <div className="pt-2">
                <h4 className="text-[#C27AFF] text-3xl font-bold">{t("pages.infos.address.title")}</h4>
                <p className="text-white text-base uppercase pt-4">
                  {t("pages.infos.address.line1")}<br/>
                  {t("pages.infos.address.line2")}
                </p>
              </div>
            </div>

          </div>

          {/* MAP */}
          <div className="w-full flex justify-center pt-30 pb-16 px-6">
            <div className="w-full max-w-300 border-2 border-[rgba(255,255,255,0.82)] rounded-4xl overflow-hidden shadow-[0_0_25px_rgba(173,70,255,0.3)]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5806.007572123465!2d5.366207076720204!3d43.31418017429094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9c0f3f2295ed9%3A0xe8332bddf8f8ffdb!2s155%20Rue%20Peyssonnel%2C%2013002%20Marseille!5e0!3m2!1sfr!2sfr!4v1770892741990!5m2!1sfr!2sfr"
                className="w-full h-150"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}