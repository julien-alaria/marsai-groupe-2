import "./Home.css";
import TitleInBox from "../../components/TitleInBox";
import OneCard from "../../components/home/cards/OneCard";
import CardConferences from "../../components/CardConferences";
import { useTranslation } from "react-i18next";

export default function ProgramPublic() {
  const { t } = useTranslation();
  return (
    <>
      <div className="pt-25 pb-12 w-full flex justify-center">
        <div className="flex flex-col items-start w-full max-w-300 px-4 md:px-0">

          <div className="w-full flex justify-center pl-3.5 pb-3.5">
            <TitleInBox
              icon={
                <svg height="20" width="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4zm2 2v12h14V6H3zm2-6h2v2H5V0zm8 0h2v2h-2V0zM5 9h2v2H5V9zm0 4h2v2H5v-2zm4-4h2v2H9V9zm0 4h2v2H9v-2zm4-4h2v2h-2V9zm0 4h2v2h-2v-2z" fill="currentColor"/>
                </svg>
              }
              iconcolor="#AD46FF"
              title={t("pages.programPublic.title")}
            />
          </div>

          <OneCard
            icon={
              <svg height="60" width="60" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.455 23h1.101l.994-1.242c1.306-1.632 2.881-3.725 4.137-5.891C18.904 13.767 20 11.305 20 9c0-4.605-3.395-8-8-8S4 4.395 4 9c0 2.293 1.063 4.755 2.271 6.867c1.245 2.177 2.82 4.276 4.177 5.916zM6 9c0 2.95 2.386 6.846 4.712 9.9c.41.54.83 1.047 1.225 1.524L12 20.5q.603-.755 1.247-1.611C15.553 15.823 18 11.949 18 9c0-3.5-2.5-6-6-6S6 5.5 6 9" fill="currentColor" fillRule="evenodd"/>
                <path d="M12 11a2 2 0 1 0 0-4a2 2 0 0 0 0 4" fill="currentColor" fillRule="evenodd"/>
                <circle cx="12" cy="9" fill="currentColor" r="1"/>
              </svg>
            }
            title={t("pages.programPublic.platform.title")}
            width="w-full md:w-300"
            description={t("pages.programPublic.platform.description")}
            accentColor="#2B7FFF"
            borderColor="border-[rgba(43,127,255,0.40)]"
            hoverBorderColor="hover:border-[#2B7FFF]"
            hoverShadow="hover:shadow-[0_0_40px_rgba(43,127,255,0.7)]"
          />

          <div className="w-full flex justify-center pt-15 pb-10">
            <TitleInBox
              icon={
                <svg height="30" width="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18Zm11-9c0 6.075-4.925 11-11 11S1 18.075 1 12S5.925 1 12 1s11 4.925 11 11Zm-8 4.414l-4-4V5.5h2v6.086L16.414 15L15 16.414Z" fill="currentColor"/>
                </svg>
              }
              iconcolor="#F6339A"
              title={t("pages.programPublic.conferencesTitle")}
            />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white uppercase pl-5 pb-6">
            {t("pages.programPublic.day1.date")}
          </h2>

          <h3 className="text-3xl md:text-5xl text-[#F6339A] uppercase pl-5 pb-15">
            {t("pages.programPublic.day1.city")}
          </h3>

          {/* --- JOUR 1 --- */}

          <div className="w-full flex pb-10">
            <CardConferences
              time="10:00"
              category={t("pages.programPublic.day1.opening.category")}
              title={t("pages.programPublic.day1.opening.title")}
              accentColor="#00D492"
              borderColor="border-[rgba(0,212,146,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(0,212,146,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="11:30"
              category={t("pages.programPublic.day1.workshop.category")}
              title={t("pages.programPublic.day1.workshop.title")}
              accentColor="#C27AFF"
              borderColor="border-[rgba(194,122,255,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(173,70,255,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="13:00"
              category={t("pages.programPublic.day1.break.category")}
              title=""
              accentColor="#D9D9D9"
              borderColor="border-[rgba(217,217,217,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(217,217,217,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="14:00"
              category={t("pages.programPublic.day1.roundtable.category")}
              title={t("pages.programPublic.day1.roundtable.title")}
              accentColor="#FB64B6"
              borderColor="border-[rgba(251,100,182,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(251,100,182,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="16:00"
              category={t("pages.programPublic.day1.screening.category")}
              title={t("pages.programPublic.day1.screening.title")}
              accentColor="#2B7FFF"
              borderColor="border-[rgba(43,127,255,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(43,127,255,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="17:00"
              category={t("pages.programPublic.day1.carteBlanche.category")}
              title={t("pages.programPublic.day1.carteBlanche.title")}
              accentColor="#F5D000"
              borderColor="border-[rgba(245,208,0,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(245,208,0,0.7)]"
            />
          </div>

          {/* --- JOUR 2 --- */}

          <h2 className="text-4xl md:text-6xl font-bold text-white uppercase pt-10 pl-5 pb-6">
            {t("pages.programPublic.day2.date")}
          </h2>

          <h3 className="text-3xl md:text-5xl text-[#F6339A] uppercase pl-5 pb-15">
             {t("pages.programPublic.day2.city")}
          </h3>

          <div className="w-full flex pb-10">
            <CardConferences
              time="10:00"
              category={t("pages.programPublic.day2.roundtable.category")}
              title={t("pages.programPublic.day2.roundtable.title")}
              accentColor="#FB64B6"
              borderColor="border-[rgba(251,100,182,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(251,100,182,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="11:30"
              category={t("pages.programPublic.day2.fireside.category")}
              title={t("pages.programPublic.day2.fireside.title")}
              accentColor="#F5D000"
              borderColor="border-[rgba(245,208,0,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(245,208,0,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="13:00"
              category={t("pages.programPublic.day2.break.category")}
              title=""
              accentColor="#D9D9D9"
              borderColor="border-[rgba(217,217,217,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(217,217,217,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="14:00"
              category={t("pages.programPublic.day2.selected.category")}
              title={t("pages.programPublic.day2.selected.title")}
              accentColor="#2B7FFF"
              borderColor="border-[rgba(43,127,255,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(43,127,255,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="16:00"
              category={t("pages.programPublic.day2.keynote.category")}
              title={t("pages.programPublic.day2.keynote.title")}
              accentColor="#C27AFF"
              borderColor="border-[rgba(194,122,255,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(173,70,255,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="18:00"
              category={t("pages.programPublic.day2.awards.category")}
              title={t("pages.programPublic.day2.awards.title")}
              accentColor="#F5D000"
              borderColor="border-[rgba(245,208,0,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(245,208,0,0.7)]"
            />
          </div>

          <div className="w-full flex pb-10">
            <CardConferences
              time="19:00"
              category={t("pages.programPublic.day2.closing.category")}
              title={t("pages.programPublic.day2.closing.title")}
              accentColor="#00D492"
              borderColor="border-[rgba(0,212,146,0.40)]"
              hoverShadow="hover:shadow-[0_0_40px_rgba(0,212,146,0.7)]"
            />
          </div>

        </div>
      </div>
    </>
  );
}