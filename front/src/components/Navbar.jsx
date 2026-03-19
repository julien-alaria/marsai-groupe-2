import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const role = localStorage.getItem("role");

  const roleHomePath = {
    ADMIN: "/admin",
    PRODUCER: "/producer",
    JURY: "/jury",
  };

  const userHomePath = role ? roleHomePath[role] : null;
  const showRetourButton = userHomePath && location.pathname !== "/producer";

  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Accueil" },
    { to: "/program", label: "Programme" },
    { to: "/juryPublic", label: "Jury" },
    { to: "/sponsors", label: "Sponsors" },
    { to: "/infos", label: "Infos" },
  ];

  useEffect(() => {
    let timeout;
    const handleScroll = () => {
      setIsVisible(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsVisible(true), 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleScrollTop = () => setIsAtTop(window.scrollY < 10);
    window.addEventListener("scroll", handleScrollTop);
    return () => window.removeEventListener("scroll", handleScrollTop);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileMenuOpen]);

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  function setLang(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  }

  return (
    <div
      className={`mt-0 ml-2.5 mr-2.5 bg-black/30 text-white rounded-2xl md:rounded-full p-2 border-white/30 border-2 fixed top-4 md:top-8 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
      } ${isAtTop ? "bg-transparent" : "bg-black/100"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Link to="/">
          <div className="ml-2 md:ml-3 flex gap-2 items-center">
            <div className="text-white text-2xl md:text-3xl uppercase font-bold">Mars</div>
            <div className="text-2xl md:text-3xl uppercase font-bold bg-gradient-to-b from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
              AI
            </div>
          </div>
        </Link>

        <div className="hidden md:flex gap-6 items-center font-bold uppercase text-sm">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-[#F6339A]">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 mr-1 md:mr-3">
          <button
            onClick={() => setLang("fr")}
            title="Français"
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              i18n.language === "fr" ? "border-white/70 text-white" : "border-white/20 text-white/60"
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLang("en")}
            title="English"
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              i18n.language === "en" ? "border-white/70 text-white" : "border-white/20 text-white/60"
            }`}
          >
            EN
          </button>

          <div className="hidden md:flex items-center gap-2">
            {firstName ? (
              <>
                <span className="text-sm normal-case">
                  Hello, {firstName}
                  {lastName && ` ${lastName}`}
                </span>
                {showRetourButton && (
                  <Link to={userHomePath}>
                    <button className="px-3 py-1 text-sm font-semibold border border-white/40 rounded-full hover:text-[#F6339A] hover:border-[#F6339A] transition-colors">
                      Retour
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm font-semibold border border-white/40 rounded-full hover:text-[#F6339A] hover:border-[#F6339A] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="text-sm px-3 py-1 border border-white/40 rounded-full hover:text-[#F6339A] hover:border-[#F6339A] transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="md:hidden w-10 h-10 rounded-xl border border-white/30 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 bg-black/95 border border-white/20 rounded-2xl p-3 space-y-3 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 rounded-xl border border-white/15 text-sm font-semibold normal-case text-center hover:border-[#F6339A] hover:text-[#F6339A]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-white/15 normal-case">
            {firstName ? (
              <div className="space-y-2">
                <div className="text-sm text-white/80">
                  Hello, {firstName}
                  {lastName && ` ${lastName}`}
                </div>
                <div className="flex gap-2">
                  {showRetourButton && (
                    <Link to={userHomePath} className="flex-1">
                      <button className="w-full px-3 py-2 text-sm font-semibold border border-white/40 rounded-xl hover:text-[#F6339A] hover:border-[#F6339A] transition-colors">
                        Retour
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-3 py-2 text-sm font-semibold border border-white/40 rounded-xl hover:text-[#F6339A] hover:border-[#F6339A] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth/login" className="block w-full">
                <button className="w-full px-3 py-2 text-sm font-semibold border border-white/40 rounded-xl hover:text-[#F6339A] hover:border-[#F6339A] transition-colors">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
