import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../api/users";
import { getVideos } from "../../api/videos";
import { getVotes } from "../../api/votes";
import { getAwards } from "../../api/awards";
import TutorialBox from "../../components/TutorialBox.jsx";

export default function Dashboard() {
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  const { data: videosData, isLoading: loadingVideos } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
  });

  const { data: votesData, isLoading: loadingVotes } = useQuery({
    queryKey: ["votes"],
    queryFn: getVotes,
  });

  const { data: awardsData, isLoading: loadingAwards } = useQuery({
    queryKey: ["awards"],
    queryFn: getAwards,
  });

  const users = usersData?.data || [];
  const videos = videosData?.data || [];
  const votes = votesData?.data || [];
  const awards = awardsData?.data || [];

  const isLoading = loadingUsers || loadingVideos || loadingVotes || loadingAwards;

  // Calcoli statistiche
  const totalProducers = users.filter(u => u.role === "PRODUCER").length;
  const totalJuries = users.filter(u => u.role === "JURY").length;
  const totalMovies = videos.length;
  const approvedMovies = videos.filter(v => v.selection_status === "selected").length;
  const refusedMovies = videos.filter(v => v.selection_status === "refused").length;
  const pendingMovies = videos.filter(v => !v.selection_status || v.selection_status === "submitted").length;
  const totalVotes = votes.length;
  const totalAwards = awards.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AD46FF] mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
          Dashboard Admin
        </h1>
        <p className="text-gray-400 mt-2">Vue d'ensemble du festival Mars AI</p>
      </div>

      <TutorialBox
        title="Tutoriel — Dashboard"
        steps={[
          "Consultez les statistiques globales: utilisateurs, films, votes et prix.",
          "Utilisez les actions rapides pour accéder directement à la gestion Films, Catégories et Prix.",
          "Surveillez les films récents pour repérer les statuts en attente, approuvés ou refusés.",
          "Commencez chaque session admin ici pour prioriser les tâches urgentes."
        ]}
        defaultOpen={false}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Utilisateurs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">{users.length}</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Utilisateurs totaux</h3>
          <div className="flex gap-3 text-xs">
            <span className="text-gray-500">{totalProducers} Producteurs</span>
            <span className="text-gray-500">{totalJuries} Jurys</span>
          </div>
        </div>

        {/* Films */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">{totalMovies}</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Films totaux</h3>
          <div className="flex gap-3 text-xs">
            <span className="text-green-500">{approvedMovies} Approuvés</span>
            <span className="text-yellow-500">{pendingMovies} En attente</span>
            <span className="text-red-500">{refusedMovies} Refusés</span>
          </div>
        </div>

        {/* Votes */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">{totalVotes}</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Votes totaux</h3>
          <p className="text-xs text-gray-500">Évaluations des jurys</p>
        </div>

        {/* Prix */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">{totalAwards}</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Prix attribués</h3>
          <p className="text-xs text-gray-500">Récompenses du festival</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/movies"
            className="flex items-center gap-3 p-4 bg-gray-950 border border-gray-800 rounded-lg hover:border-[#AD46FF] transition"
          >
            <svg className="w-8 h-8 text-[#AD46FF]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <div>
              <h3 className="font-semibold text-white">Gérer les films</h3>
              <p className="text-xs text-gray-400">Évaluer et approuver</p>
            </div>
          </a>

          <a
            href="/admin/categories"
            className="flex items-center gap-3 p-4 bg-gray-950 border border-gray-800 rounded-lg hover:border-[#AD46FF] transition"
          >
            <svg className="w-8 h-8 text-[#F6339A]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <div>
              <h3 className="font-semibold text-white">Catégories</h3>
              <p className="text-xs text-gray-400">Gérer les catégories</p>
            </div>
          </a>

          <a
            href="/admin/awards"
            className="flex items-center gap-3 p-4 bg-gray-950 border border-gray-800 rounded-lg hover:border-[#AD46FF] transition"
          >
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div>
              <h3 className="font-semibold text-white">Attribuer des prix</h3>
              <p className="text-xs text-gray-400">Récompenses</p>
            </div>
          </a>
        </div>
      </div>

      {/* Films récents */}
      {videos.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Films récents</h2>
          <div className="space-y-3">
            {videos.slice(0, 5).map((video) => (
              <div
                key={video.id_movie}
                className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">
                    🎬
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{video.title}</h4>
                    <p className="text-xs text-gray-400">
                      {video.duration}s • {video.main_language || "-"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    video.selection_status === "selected"
                      ? "bg-green-900/40 text-green-300"
                      : video.selection_status === "refused"
                      ? "bg-red-900/40 text-red-300"
                      : "bg-yellow-900/40 text-yellow-300"
                  }`}
                >
                  {video.selection_status === "selected"
                    ? "Approuvé"
                    : video.selection_status === "refused"
                    ? "Refusé"
                    : "En attente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}