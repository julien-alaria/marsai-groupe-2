import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function NavMobile() {
  const { i18n } = useTranslation();

  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const role = localStorage.getItem("role");

  const roleHomePath = {
    ADMIN: "/admin",
    PRODUCER: "/producer",
    JURY: "/jury",
  };

  const userHomePath = role ? roleHomePath[role] : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let timeout;

    const handleScroll = () => {
      setIsVisible(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsVisible(true);
      }, 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const handleScrollTop = () => {
      setIsAtTop(window.scrollY < 10);
    };

    window.addEventListener("scroll", handleScrollTop);

    return () => {
      window.removeEventListener("scroll", handleScrollTop);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      {/* NAVBAR MOBILE */}
      <div
        className={`fixed top-4 left-4 right-4 z-[1000] h-16 rounded-full px-4 py-3 border border-white/30 flex justify-between items-center md:hidden transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        } ${isAtTop ? "bg-transparent" : "bg-black/70 backdrop-blur-md"}`}
      >
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <div className="text-white text-2xl uppercase font-bold">Mars</div>
          <div className="text-2xl font-bold uppercase bg-linear-to-b from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
            AI
          </div>
        </Link>

        <button
          onClick={() => setMenuOpen(true)}
          className="text-white w-8 h-8 flex flex-col justify-between items-center"
          aria-label="Ouvrir le menu"
        >
          <span className="block h-0.5 w-full bg-current"></span>
          <span className="block h-0.5 w-full bg-current"></span>
          <span className="block h-0.5 w-full bg-current"></span>
        </button>
      </div>

      {/* OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex flex-col justify-start items-center p-6 pt-24 gap-6 md:hidden">
          {/* CLOSE */}
          <button
            onClick={closeMenu}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white text-3xl rounded-full border border-white/30 hover:border-[#F6339A] hover:text-[#F6339A] transition"
            aria-label="Fermer le menu"
          >
            ×
          </button>

          {/* LINKS */}
          <Link
            to="/"
            className="text-xl text-white hover:text-[#F6339A]"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/program"
            className="text-xl text-white hover:text-[#F6339A]"
            onClick={closeMenu}
          >
            Agenda
          </Link>

          <Link
            to="/juryPublic"
            className="text-xl text-white hover:text-[#F6339A]"
            onClick={closeMenu}
          >
            Jury
          </Link>

          <Link
            to="/sponsors"
            className="text-xl text-white hover:text-[#F6339A]"
            onClick={closeMenu}
          >
            Sponsors
          </Link>

          <Link
            to="/infos"
            className="text-xl text-white hover:text-[#F6339A]"
            onClick={closeMenu}
          >
            Infos
          </Link>

          {userHomePath && (
            <Link
              to={userHomePath}
              className="text-xl text-white hover:text-[#F6339A]"
              onClick={closeMenu}
            >
              Account
            </Link>
          )}

          {/* LANG SWITCH */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => {
                i18n.changeLanguage("fr");
                localStorage.setItem("lang", "fr");
              }}
              title="Français"
              style={{
                opacity: i18n.language === "fr" ? 1 : 0.5,
                cursor: "pointer",
                transition: "opacity 0.3s",
                background: "none",
                border: "none",
              }}
            >
              <svg height="28" width="28" viewBox="0 0 512 512">
                <mask id="maskFr">
                  <circle cx="256" cy="256" r="256" fill="white" />
                </mask>
                <g mask="url(#maskFr)">
                  <rect width="512" height="512" fill="#eee" />
                  <rect width="167" height="512" fill="#0052b4" />
                  <rect x="345" width="167" height="512" fill="#d80027" />
                </g>
              </svg>
            </button>

            <button
              onClick={() => {
                i18n.changeLanguage("en");
                localStorage.setItem("lang", "en");
              }}
              title="English"
              style={{
                opacity: i18n.language === "en" ? 1 : 0.5,
                cursor: "pointer",
                transition: "opacity 0.3s",
                background: "none",
                border: "none",
              }}
            >
              <svg height="28" width="28" viewBox="0 0 512 512">
                <mask id="maskEn">
                  <circle cx="256" cy="256" r="256" fill="white" />
                </mask>
                <g mask="url(#maskEn)">
                  <rect width="512" height="512" fill="#eee" />
                  <path
                    d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z"
                    fill="#0052b4"
                  />
                  <path
                    d="M0 0v45l131 131h45zm208 0v208H0v96h208v208h96V304h208v-96H304V0zm259 0L336 131v45L512 0zM176 336L0 512h45l131-131zm160 0l176 176v-45L381 336z"
                    fill="#d80027"
                  />
                </g>
              </svg>
            </button>
          </div>

          {/* LOGIN / LOGOUT */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {firstName ? (
              <>
                <span className="text-white text-center">
                  Hello, {firstName}
                  {lastName && ` ${lastName}`}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-white border border-white/40 rounded-full hover:text-[#F6339A] hover:border-[#F6339A] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="text-white hover:text-[#F6339A]"
                onClick={closeMenu}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}