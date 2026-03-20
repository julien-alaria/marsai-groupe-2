import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

/* ─── Nav links ───────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",     to: "/"          },
  { label: "Programme", to: "/program"  },
  { label: "Jury",     to: "/juryPublic"},
  { label: "Sponsors", to: "/sponsors" },
  { label: "Infos",    to: "/infos"     },
];

/* ─── Flag SVGs ───────────────────────────────────────── */
function FlagFR({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512">
      <mask id="fr-mask"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
      <g mask="url(#fr-mask)">
        <path d="M167 0h178l25.9 252.3L345 512H167l-29.8-253.4z" fill="#eee"/>
        <path d="M0 0h167v512H0z" fill="#0052b4"/>
        <path d="M345 0h167v512H345z" fill="#d80027"/>
      </g>
    </svg>
  );
}
function FlagEN({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512">
      <mask id="en-mask"><circle cx="256" cy="256" r="256" fill="#fff"/></mask>
      <g mask="url(#en-mask)">
        <path d="m0 0l8 22l-8 23v23l32 54l-32 54v32l32 48l-32 48v32l32 54l-32 54v68l22-8l23 8h23l54-32l54 32h32l48-32l48 32h32l54-32l54 32h68l-8-22l8-23v-23l-32-54l32-54v-32l-32-48l32-48v-32l-32-54l32-54V0l-22 8l-23-8h-23l-54 32l-54-32h-32l-48 32l-48-32h-32l-54 32L68 0z" fill="#eee"/>
        <path d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z" fill="#0052b4"/>
        <path d="M0 0v45l131 131h45zm208 0v208H0v96h208v208h96V304h208v-96H304V0zm259 0L336 131v45L512 0zM176 336L0 512h45l131-131zm160 0l176 176v-45L381 336z" fill="#d80027"/>
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════════════════ */
export default function Navbar() {
  const { i18n } = useTranslation();
  const location = useLocation();

  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [user, setUser] = useState({ firstName: null, lastName: null, role: null });

  /* ── Auth state ── */
  useEffect(() => {
    setUser({
      firstName: localStorage.getItem("firstName"),
      lastName:  localStorage.getItem("lastName"),
      role:      localStorage.getItem("role"),
    });
  }, []);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  /* ── Lock body scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* ── Close user dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".user-menu-container")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Helpers ── */
  const roleHomePath = { ADMIN: "/admin", PRODUCER: "/producer", JURY: "/jury" };
  const userHomePath = user.role ? roleHomePath[user.role] : null;

  const handleLogout = () => {
    localStorage.clear();
    setUser({ firstName: null, lastName: null, role: null });
    window.location.href = "/";
  };

  const toggleLanguage = () => {
    const next = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  /* ── Initials ── */
  const initials = user.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) ?? ""}`.toUpperCase()
    : null;

  return (
    <>
      {/* ════════════════════════════════
          DESKTOP NAV — pill flottante
      ════════════════════════════════ */}
      <nav
        className={`
          hidden md:flex items-center justify-between gap-2
          fixed top-3 left-1/2 -translate-x-1/2 z-50
          px-3 py-2 rounded-full
          border transition-all duration-500 will-change-transform
          ${scrolled
            ? "bg-[#06080d]/90 backdrop-blur-xl border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-white/[0.06] backdrop-blur-md border-white/15 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
          }
        `}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 mr-2 hover:opacity-90 transition-opacity flex-shrink-0">
          <span className="text-white text-base font-black uppercase tracking-tight">MARS</span>
          <span className="text-base font-black uppercase tracking-tight bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">AI</span>
        </Link>

        {/* Separator */}
        <div className="w-px h-4 bg-white/15" />

        {/* Nav links */}
        <div className="flex items-center">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  relative px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200
                  ${active
                    ? "text-white"
                    : "text-white/50 hover:text-white/85"
                  }
                `}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/10" />
                )}
                <span className="relative">{link.label}</span>
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-white/15" />

        {/* Right section */}
        <div className="flex items-center gap-1">

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            aria-label={i18n.language === "fr" ? "Switch to English" : "Passer en français"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/[0.08] transition-all duration-200 text-white/60 hover:text-white"
          >
            {i18n.language === "fr" ? <FlagFR /> : <FlagEN />}
            <span className="text-[11px] font-semibold tracking-wider">
              {i18n.language === "fr" ? "FR" : "EN"}
            </span>
          </button>

          {/* User */}
          <div className="relative user-menu-container">
            {user.firstName ? (
              <>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#AD46FF] to-[#F6339A] flex items-center justify-center text-[11px] font-bold text-white hover:shadow-[0_0_14px_rgba(173,70,255,0.5)] transition-all duration-200"
                >
                  {initials}
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-[#0d0f14]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-white/35 mt-0.5 capitalize tracking-wide">
                        {user.role?.toLowerCase()}
                      </p>
                    </div>
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <Link
                        to={userHomePath || "#"}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all duration-200 w-full text-left"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 hover:from-[#AD46FF] hover:to-[#F6339A] text-white text-[12px] font-semibold transition-all duration-200 hover:shadow-[0_0_18px_rgba(173,70,255,0.4)]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M5 20v-1a7 7 0 0 1 14 0v1"/>
                </svg>
                Connexion
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
          MOBILE NAV — top bar
      ════════════════════════════════ */}
      <nav
        className={`
          md:hidden fixed top-0 left-0 right-0 z-50
          flex items-center justify-between
          px-5 h-16
          border-b transition-all duration-500
          ${scrolled
            ? "bg-[#06080d]/95 backdrop-blur-xl border-white/8"
            : "bg-transparent border-transparent"
          }
        `}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="text-white text-lg font-black uppercase tracking-tight">MARS</span>
          <span className="text-lg font-black uppercase tracking-tight bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">AI</span>
        </Link>

        {/* Right: lang + burger */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/60 hover:text-white transition-all duration-200"
          >
            {i18n.language === "fr" ? <FlagFR size={16} /> : <FlagEN size={16} />}
            <span className="text-[10px] font-bold">{i18n.language === "fr" ? "FR" : "EN"}</span>
          </button>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            className="w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <span className="w-4 h-0.5 bg-white/70 rounded-full" />
            <span className="w-4 h-0.5 bg-white/70 rounded-full" />
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════
          MOBILE FULL-SCREEN OVERLAY
      ════════════════════════════════ */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-[#06080d]/98 backdrop-blur-2xl flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/8">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-1">
              <span className="text-white text-lg font-black uppercase">MARS</span>
              <span className="text-lg font-black uppercase bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">AI</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 flex flex-col justify-center px-8 gap-2">
            {NAV_LINKS.map((link, i) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center justify-between py-4 border-b transition-all duration-200
                    ${active
                      ? "border-white/10 text-white"
                      : "border-white/[0.06] text-white/40 hover:text-white/80"
                    }
                  `}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="text-3xl font-black uppercase tracking-tight">
                    {link.label}
                  </span>
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom — user info + auth */}
          <div className="px-8 pb-10 pt-6 border-t border-white/8 flex items-center justify-between gap-4">
            {user.firstName ? (
              <>
                <div>
                  <p className="text-white text-sm font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-white/35 text-xs capitalize mt-0.5">{user.role?.toLowerCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {userHomePath && (
                    <Link
                      to={userHomePath}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 text-sm font-medium hover:border-white/20 hover:text-white transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/15 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white text-center font-bold text-base hover:shadow-[0_0_24px_rgba(173,70,255,0.4)] transition-all duration-300"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}