import { useTranslation } from "react-i18next";
import Social from "../components/Social";
import Newsletter from "./Newsletter";
import { Link } from "react-router";

export default function Footer() {
  const { t } = useTranslation();

  const NAV_LINKS = [
    { label: t("footer.navigation.jury"),     href: "/juryPublic"  },
    { label: t("footer.navigation.program"),  href: "/program"     },
    { label: t("footer.navigation.ticketing"),href: "/auth/register"},
  ];

  const LEGAL_LINKS = [
    { label: t("footer.legal.partners"), href: "/sponsors" },
    { label: t("footer.legal.faq"),      href: "#"         },
    { label: t("footer.legal.contact"),  href: "#"         },
  ];

  return (
    <footer className="relative bg-[#06080d] text-white overflow-hidden">

      {/* Top gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#AD46FF]/30 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-[#AD46FF]/5 to-[#F6339A]/5 blur-3xl pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-12 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-start">

        {/* ── Col 1 : Brand ── */}
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-3xl font-black tracking-tight leading-none">
              MARS <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">AI</span>
            </h2>
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 font-medium mt-1.5">
              Festival · Marseille · 2026
            </p>
          </div>

          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            {t("footer.description")}
          </p>

          <Social />
        </div>

        {/* ── Col 2 : Nav + Legal ── */}
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#AD46FF]/70">
              {t("footer.navigation.title")}
            </p>
            <div className="h-px bg-gradient-to-r from-[#AD46FF]/30 to-transparent" />
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-white/45 text-sm hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block transition-transform"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#F6339A]/70">
              {t("footer.legal.title")}
            </p>
            <div className="h-px bg-gradient-to-r from-[#F6339A]/30 to-transparent" />
            <ul className="flex flex-col gap-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white/45 text-sm hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block transition-transform"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Col 3 : Newsletter ── */}
        <div>
          <Newsletter />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white/25 tracking-widest uppercase">
            {t("footer.bottom.copyright")}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#AD46FF]/40" />
            <p className="text-[10px] text-white/20 tracking-widest uppercase">
              {t("footer.bottom.design")}
            </p>
          </div>
          <a href="#" className="text-[10px] text-white/25 tracking-widest uppercase hover:text-white/60 transition-colors">
            {t("footer.bottom.legal")}
          </a>
        </div>
      </div>
    </footer>
  );
}