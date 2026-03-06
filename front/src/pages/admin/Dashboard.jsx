import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { getAdminStats } from "../../api/dashboard";

import DashboardHero from "../../components/admin/DashboardHero.jsx";
import StatsGrid from "../../components/admin/StatsGrid.jsx";
import VotesChart from "../../components/admin/VotesChart.jsx";
import VoteDistribution from "../../components/admin/VoteDistribution.jsx";

/* ─── Actions rapides ─────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    icon: "🎬",
    label: "Films",
    description: "Consulter, filtrer et gérer tous les films soumis",
    path: "/admin/movies",
    color: "from-violet-600/20 to-purple-600/20",
    border: "hover:border-violet-500/40",
    glow: "hover:shadow-violet-500/20",
  },
  {
    icon: "⚖️",
    label: "Distribution & jury",
    description: "Assigner les films aux membres du jury",
    path: "/admin/jury",
    color: "from-blue-600/20 to-cyan-600/20",
    border: "hover:border-blue-500/40",
    glow: "hover:shadow-blue-500/20",
  },
  {
    icon: "🏆",
    label: "Prix & récompenses",
    description: "Attribuer et gérer les prix du festival",
    path: "/admin/awards",
    color: "from-yellow-600/20 to-amber-600/20",
    border: "hover:border-yellow-500/40",
    glow: "hover:shadow-yellow-500/20",
  },
  {
    icon: "📂",
    label: "Catégories",
    description: "Créer et organiser les catégories de films",
    path: "/admin/categories",
    color: "from-emerald-600/20 to-green-600/20",
    border: "hover:border-emerald-500/40",
    glow: "hover:shadow-emerald-500/20",
  },
  {
    icon: "👥",
    label: "Utilisateurs",
    description: "Gérer les comptes producteurs et membres du jury",
    path: "/admin/users",
    color: "from-pink-600/20 to-rose-600/20",
    border: "hover:border-pink-500/40",
    glow: "hover:shadow-pink-500/20",
  },
  {
    icon: "📊",
    label: "Résultats",
    description: "Consulter les classements, scores et statistiques",
    path: "/admin/results",
    color: "from-orange-600/20 to-red-600/20",
    border: "hover:border-orange-500/40",
    glow: "hover:shadow-orange-500/20",
  },
  {
    icon: "⚙️",
    label: "Configuration",
    description: "Paramétrer le festival, les couleurs et les textes",
    path: "/admin/settings",
    color: "from-slate-600/20 to-gray-600/20",
    border: "hover:border-slate-500/40",
    glow: "hover:shadow-slate-500/20",
  },
];

/* ─── Composant ───────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-violet-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-400">
            Chargement des statistiques…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-screen">
        <div className="text-center px-4">
          <p className="text-base sm:text-xl text-red-500 mb-2">
            ❌ Erreur de chargement
          </p>
          <p className="text-xs sm:text-sm text-gray-400 break-words">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-6">
      {/* En-tête */}
      <DashboardHero />

      {/* Statistiques globales */}
      <StatsGrid stats={stats} />

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-4">
        <div>
          <VotesChart votesData={stats?.votes} />
        </div>
        <div>
          <VoteDistribution
            distribution={stats?.votes?.distribution}
            total={stats?.votes?.total}
          />
        </div>
      </div>

      {/* Actions rapides */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Actions rapides
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Accédez directement aux principales sections de gestion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`
                group relative
                bg-gradient-to-br ${action.color}
                backdrop-blur-xl
                border border-white/10 ${action.border}
                rounded-xl sm:rounded-2xl
                p-4 sm:p-5
                shadow-xl shadow-black/30
                hover:shadow-2xl ${action.glow}
                transition-all duration-300
                hover:scale-[1.03] hover:-translate-y-0.5
                text-left overflow-hidden
                cursor-pointer
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <span className="text-2xl sm:text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                {action.icon}
              </span>
              <p className="text-sm sm:text-base font-semibold text-white mb-1">
                {action.label}
              </p>
              <p className="text-[10px] sm:text-xs text-white/50 leading-relaxed">
                {action.description}
              </p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Pipeline des films */}
      {stats?.movies?.pipeline && (
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            Pipeline de sélection
          </h2>
          <FilmPipeline pipeline={stats.movies.pipeline} total={stats.movies.total} />
        </section>
      )}
    </div>
  );
}

/* ─── Pipeline de sélection ───────────────────────────── */
const PIPELINE_STAGES = [
  { key: "submitted",  label: "Soumis",        color: "bg-gray-500",   icon: "📥" },
  { key: "assigned",   label: "En évaluation", color: "bg-blue-500",   icon: "🔍" },
  { key: "to_discuss", label: "À discuter",     color: "bg-yellow-500", icon: "💬" },
  { key: "candidate",  label: "Candidat",       color: "bg-purple-500", icon: "⭐" },
  { key: "selected",   label: "Sélectionné",    color: "bg-green-500",  icon: "✅" },
  { key: "finalist",   label: "Finaliste",      color: "bg-orange-500", icon: "🎖️" },
  { key: "awarded",    label: "Primé",          color: "bg-yellow-400", icon: "🏆" },
];

function FilmPipeline({ pipeline, total }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const count = pipeline[stage.key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={stage.key} className="text-center space-y-2">
              <span className="text-xl">{stage.icon}</span>
              <p className="text-lg sm:text-2xl font-bold text-white">{count}</p>
              <p className="text-[10px] text-white/50 leading-tight">{stage.label}</p>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[9px] text-white/30">{pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}