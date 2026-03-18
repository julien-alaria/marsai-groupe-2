import "./Home.css";
import TitleInBox from "../../components/TitleInBox";
import OneCard from "../../components/home/cards/OneCard";
import CardConferences from "../../components/CardConferences";
import { useTranslation } from "react-i18next";

export default function ProgramPublic() {
  const { t } = useTranslation();
  return (
    <>
      <div className="pt-25 pb-12 w-full flex justify-center bg-black">
        <div className="flex flex-col w-full max-w-6xl px-4 md:px-0">

         {/* Header */}
<div className="w-full mb-12 border-b border-white/10 pb-6">
  <div className="flex items-center gap-4">
    <div className="w-1 h-8 bg-[#F6339A]" />
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
</div>

{/* Featured platform */}
<div className="w-full mb-16">
  <div className="flex items-start gap-6">
    <div className="w-1 h-16 bg-[#2B7FFF]" />
    <div className="flex-1">
      <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Featured</div>
      <h3 className="text-2xl font-light text-white mb-3">
        {t("pages.programPublic.platform.title")}
      </h3>
      <p className="text-white/60 text-sm max-w-2xl leading-relaxed">
        {t("pages.programPublic.platform.description")}
      </p>
    </div>
    <div className="text-[#2B7FFF] opacity-50">
      <svg height="32" width="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.455 23h1.101l.994-1.242c1.306-1.632 2.881-3.725 4.137-5.891C18.904 13.767 20 11.305 20 9c0-4.605-3.395-8-8-8S4 4.395 4 9c0 2.293 1.063 4.755 2.271 6.867c1.245 2.177 2.82 4.276 4.177 5.916zM6 9c0 2.95 2.386 6.846 4.712 9.9c.41.54.83 1.047 1.225 1.524L12 20.5q.603-.755 1.247-1.611C15.553 15.823 18 11.949 18 9c0-3.5-2.5-6-6-6S6 5.5 6 9" fill="currentColor" fillRule="evenodd"/>
        <path d="M12 11a2 2 0 1 0 0-4a2 2 0 0 0 0 4" fill="currentColor" fillRule="evenodd"/>
        <circle cx="12" cy="9" fill="currentColor" r="1"/>
      </svg>
    </div>
  </div>
</div>
          {/* Conference header - film festival style */}
          <div className="w-full mb-10 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[#F6339A] flex items-center justify-center">
                <svg height="16" width="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-[#F6339A]">
                  <path d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18Zm11-9c0 6.075-4.925 11-11 11S1 18.075 1 12S5.925 1 12 1s11 4.925 11 11Zm-8 4.414l-4-4V5.5h2v6.086L16.414 15L15 16.414Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-white/60 text-sm tracking-widest">PROGRAM • 2024</span>
            </div>
          </div>

          {/* Day 1 - Film festival layout */}
          <div className="w-full mb-8">
            <div className="flex items-baseline gap-6 border-l-4 border-[#F6339A] pl-4">
              <span className="text-7xl font-bold text-white/20">01</span>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
                  {t("pages.programPublic.day1.date")}
                </h2>
                <h3 className="text-xl text-[#F6339A] uppercase tracking-wider mt-1">
                  {t("pages.programPublic.day1.city")}
                </h3>
              </div>
            </div>
          </div>

          {/* Day 1 Events - Grid layout like film festival */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="border border-white/10 hover:border-[#00D492]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">10:00</div>
              <div className="text-[#00D492] text-sm tracking-wider mb-2">{t("pages.programPublic.day1.opening.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day1.opening.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#C27AFF]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">11:30</div>
              <div className="text-[#C27AFF] text-sm tracking-wider mb-2">{t("pages.programPublic.day1.workshop.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day1.workshop.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#D9D9D9]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">13:00</div>
              <div className="text-[#D9D9D9] text-sm tracking-wider mb-2">{t("pages.programPublic.day1.break.category")}</div>
              <div className="text-white/80 text-sm italic">—</div>
            </div>

            <div className="border border-white/10 hover:border-[#FB64B6]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">14:00</div>
              <div className="text-[#FB64B6] text-sm tracking-wider mb-2">{t("pages.programPublic.day1.roundtable.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day1.roundtable.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#2B7FFF]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">16:00</div>
              <div className="text-[#2B7FFF] text-sm tracking-wider mb-2">{t("pages.programPublic.day1.screening.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day1.screening.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#F5D000]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">17:00</div>
              <div className="text-[#F5D000] text-sm tracking-wider mb-2">{t("pages.programPublic.day1.carteBlanche.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day1.carteBlanche.title")}</div>
            </div>
          </div>

          {/* Day 2 */}
          <div className="w-full mb-8">
            <div className="flex items-baseline gap-6 border-l-4 border-[#FB64B6] pl-4">
              <span className="text-7xl font-bold text-white/20">02</span>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
                  {t("pages.programPublic.day2.date")}
                </h2>
                <h3 className="text-xl text-[#FB64B6] uppercase tracking-wider mt-1">
                  {t("pages.programPublic.day2.city")}
                </h3>
              </div>
            </div>
          </div>

          {/* Day 2 Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-white/10 hover:border-[#FB64B6]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">10:00</div>
              <div className="text-[#FB64B6] text-sm tracking-wider mb-2">{t("pages.programPublic.day2.roundtable.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day2.roundtable.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#F5D000]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">11:30</div>
              <div className="text-[#F5D000] text-sm tracking-wider mb-2">{t("pages.programPublic.day2.fireside.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day2.fireside.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#D9D9D9]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">13:00</div>
              <div className="text-[#D9D9D9] text-sm tracking-wider mb-2">{t("pages.programPublic.day2.break.category")}</div>
              <div className="text-white/80 text-sm italic">—</div>
            </div>

            <div className="border border-white/10 hover:border-[#2B7FFF]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">14:00</div>
              <div className="text-[#2B7FFF] text-sm tracking-wider mb-2">{t("pages.programPublic.day2.selected.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day2.selected.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#C27AFF]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">16:00</div>
              <div className="text-[#C27AFF] text-sm tracking-wider mb-2">{t("pages.programPublic.day2.keynote.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day2.keynote.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#F5D000]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">18:00</div>
              <div className="text-[#F5D000] text-sm tracking-wider mb-2">{t("pages.programPublic.day2.awards.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day2.awards.title")}</div>
            </div>

            <div className="border border-white/10 hover:border-[#00D492]/50 transition-colors duration-300 p-4">
              <div className="text-2xl font-bold text-white mb-2">19:00</div>
              <div className="text-[#00D492] text-sm tracking-wider mb-2">{t("pages.programPublic.day2.closing.category")}</div>
              <div className="text-white/80 text-sm line-clamp-2">{t("pages.programPublic.day2.closing.title")}</div>
            </div>
          </div>

         

        </div>
      </div>
    </>
  );
}