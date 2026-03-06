import { useQuery } from "@tanstack/react-query";
import instance from "../../api/config";

function useGoogleStatus() {
  return useQuery({
    queryKey: ["googleAuthStatus"],
    queryFn: () => instance.get("google/status").then((r) => r.data),
    refetchInterval: 15_000,
    retry: false,
    throwOnError: false,
  });
}

export default function DashboardHero() {
  const { data, isLoading, refetch } = useGoogleStatus();
  const active = data?.active === true;

  function handleConnect() {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    window.open(`${apiBase}/google/auth`, "_blank");
    setTimeout(() => refetch(), 5000);
    setTimeout(() => refetch(), 12000);
  }

  return (
    <div
      className="
        group
        relative
        bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-950/80
        backdrop-blur-xl
        border border-white/10 hover:border-blue-500/30
        rounded-xl
        min-h-[80px] h-auto
        flex flex-col xs:flex-row items-start xs:items-center justify-between
        p-4 xs:px-6 xs:py-0
        shadow-xl shadow-black/30
        hover:shadow-2xl hover:shadow-blue-500/20
        transition-all duration-500
        hover:scale-[1.01]
        overflow-hidden
      "
    >
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Left — Title */}
      <div className="relative flex items-center gap-3 mb-2 xs:mb-0">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/30 blur-lg rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
          <span className="relative text-xl sm:text-2xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300 inline-block">
            🌐
          </span>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-white drop-shadow-sm">
            Vue d'ensemble
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">
            Festival MarsAI
          </p>
        </div>
      </div>

      {/* Right — Stats + YouTube */}
      <div className="relative flex items-center gap-3 sm:gap-4 ml-auto">

        {/* YouTube status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path
              style={{ color: active ? "#ef4444" : "rgba(255,255,255,0.2)" }}
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            />
          </svg>
          {isLoading ? (
            <span className="text-[10px] text-white/30">…</span>
          ) : active ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-[10px] text-green-400 font-medium">YouTube connecté</span>
              <button
                onClick={() => refetch()}
                title="Actualiser"
                className="ml-1 w-4 h-4 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
              <span className="text-[10px] text-white/40">YouTube déconnecté</span>
              <button
                onClick={handleConnect}
                className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              >
                Connecter
              </button>
            </div>
          )}
        </div>

        <div className="h-4 sm:h-8 w-px bg-white/10" />

        <div className="text-right">
          <span className="text-[10px] sm:text-xs text-white/60">Édition</span>
          <p className="text-xs sm:text-sm font-medium text-white">2026</p>
        </div>
        {/* <div className="h-4 sm:h-8 w-px bg-white/10" /> */}
        {/* <div className="text-right">
          <span className="text-[10px] sm:text-xs text-white/60">Statut</span>
          <p className="text-xs sm:text-sm font-medium text-green-400">Actif</p>
        </div> */}
      </div>

      {/* Decorative badge */}
      <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 overflow-hidden opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-2xl" />
      </div>
    </div>
  );
}