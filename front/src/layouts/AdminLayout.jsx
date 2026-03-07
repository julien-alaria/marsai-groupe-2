import { Outlet, NavLink, useNavigate } from "react-router";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);      // desktop: wide vs mini
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // mobile drawer
  const navigate = useNavigate();

  const firstName = localStorage.getItem("firstName") || "Admin";
  const role = localStorage.getItem("role") || "ADMIN";
  const token = localStorage.getItem("token");

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) navigate("/auth/login", { replace: true });
  }, [token, navigate]);

  // Close mobile menu when going to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login", { replace: true });
  };

  const menuItems = [
    {
      path: "/admin",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: "Vue d'ensemble",
      exact: true,
    },
    {
      path: "/admin/movies",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
      ),
      label: "Gestion des films",
    },
    {
      path: "/admin/categories",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          />
        </svg>
      ),
      label: "Catégories",
    },
    {
      path: "/admin/awards",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 4.5a1 1 0 011-1h4a1 1 0 011 1V6h3a1 1 0 011 1v2a5 5 0 01-4 4.9V18h2a1 1 0 110 2H7a1 1 0 110-2h2v-4.1A5 5 0 015 9V7a1 1 0 011-1h3V4.5z"
          />
        </svg>
      ),
      label: "Prix & récompenses",
    },
    {
      path: "/admin/users",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      label: "Utilisateurs",
    },
    {
      path: "/admin/jury",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      label: "Distribution & Jury",
    },
    {
      path: "/admin/results",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: "Résultats & classement",
    },
    {
      path: "/admin/settings",
      icon: (className) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      label: "Configuration Festival",
    },
  ];

  const renderNavLinks = (onClickExtra) =>
    menuItems.map((item, index) => (
      <NavLink
        key={index}
        to={item.path}
        end={item.exact}
        title={item.label}
        onClick={onClickExtra}
        className={({ isActive }) =>
          `
          group relative flex items-center px-3 py-2 mb-1 rounded-xl transition-all duration-200
          ${
            isActive
              ? "bg-gradient-to-r from-blue-600/20 to-blue-400/10 border border-blue-500/30 shadow-lg shadow-blue-500/10"
              : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent"
          }
        `
        }
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl" />
        <span className="relative flex-shrink-0">{item.icon("w-5 h-5")}</span>
        <span className="relative text-sm font-medium flex-1 ml-3 truncate">
          {item.label}
        </span>
      </NavLink>
    ));

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] text-white overflow-hidden">
      {/* ========== DESKTOP SIDEBAR (lg and up) ========== */}
      <aside
        className={`
          hidden lg:flex
          ${isSidebarOpen ? "w-64" : "w-20"}
          bg-gradient-to-b from-[#111318]/90 to-[#0c0e11]/90
          backdrop-blur-xl border-r border-white/10
          flex-col transition-all duration-300 shadow-2xl shadow-black/40
          relative
        `}
      >
        {/* profile */}
        <div className="p-5 border-b border-white/10">
          <div
            className={`flex ${
              isSidebarOpen ? "items-center space-x-3" : "flex-col items-center"
            }`}
          >
            <div className="relative group/avatar flex-shrink-0">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-0 group-hover/avatar:scale-150 transition-transform duration-500" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-2 border-white/20 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                <span className="text-lg text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111318] animate-pulse" />
              </div>
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{firstName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    {role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin-dark">
          {renderNavLinks(undefined)}
        </nav>

       {/* logout - FANCY VERSION */}
<div className="p-4 border-t border-white/10">
  {isSidebarOpen ? (
    <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-4 shadow-xl shadow-black/30 hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
      {/* Mars AI info */}
      <div className="relative flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Mars AI</h3>
          <p className="text-[10px] text-white/40 flex items-center gap-1">
            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            Dashboard Admin
          </p>
        </div>
      </div>
      
      {/* FANCY LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="group/btn relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
                   bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 
                   hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30
                   transition-all duration-200 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
        <svg className="w-4 h-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="relative text-sm">Se déconnecter</span>
      </button>
    </div>
  ) : (
    <button
      onClick={handleLogout}
      className="group relative w-full flex items-center justify-center p-3 rounded-lg 
                 bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 
                 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30
                 transition-all duration-200 overflow-hidden"
      title="Se déconnecter"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <svg className="w-5 h-5 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  )}
</div>

      </aside>

      {/* ========== MOBILE OVERLAY + SIDEBAR (below lg) ========== */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64
          bg-gradient-to-b from-[#111318]/95 to-[#0c0e11]/95
          backdrop-blur-xl border-r border-white/10
          flex flex-col transition-transform duration-300 shadow-2xl shadow-black/40
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* mobile profile header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-2 border-white/20 flex items-center justify-center">
                <span className="text-base text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="font-semibold text-white text-sm truncate">{firstName}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                {role}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* mobile nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin-dark">
          {renderNavLinks(() => setIsMobileMenuOpen(false))}
        </nav>

        {/* mobile logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all duration-200"
          >
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* ========== MAIN AREA ========== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop header */}
        <header className="hidden lg:flex bg-gradient-to-r from-[#111318]/80 to-[#0f1116]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2 items-center justify-between shadow-xl shadow-black/20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg transition-all duration-500"
              title={isSidebarOpen ? "Réduire le menu" : "Afficher le menu"}
            >
              <span
                className={`inline-block transition-all duration-500 text-2xl hover:scale-120 ${isSidebarOpen ? "rotate-90" : ""}`}
              >
                {isSidebarOpen ? "✕" : "☰"}
              </span>
            </button>
            <div className="flex items-center">
              <span className="text-2xl font-light bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
                MARS
              </span>
              <span className="text-2xl font-light text-white/60 ml-1">AI</span>
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-[#111318]/90 to-[#0f1116]/90 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex items-center justify-between shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg"
            >
              <span className="text-2xl">
                {isMobileMenuOpen ? "✕" : "☰"}
              </span>
            </button>
            <div className="flex items-center">
              <span className="text-xl font-light bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
                MARS
              </span>
              <span className="text-xl font-light text-white/60 ml-1">AI</span>
            </div>
          </div>
        </header>

        {/* Content (with top padding for mobile header) */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0c0f] via-[#0c0e11] to-[#0d0f12] p-3 sm:p-4 md:p-6 pt-16 lg:pt-6 scrollbar-thin-dark">
          <Outlet />
        </div>
      </main>
    </div>
  );
}