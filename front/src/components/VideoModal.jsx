import { useState } from "react";
import { VideoPreview } from "./VideoPreview.jsx";

export function VideoModal({
  movie,
  onClose,
  categories,
  juries,
  categorySelection,
  onCategoryChange,
  onCategorySave,
  jurySelection,
  onJuryToggle,
  onJurySave,
  onStatusUpdate,
  onDelete,
  getPoster,
  uploadBase,
  isUpdatingCategories,
  isUpdatingJuries,
}) {
  // Optimistic local status — updates immediately on click
  // so the badge reflects the change without waiting for the refetch
  const [localStatus, setLocalStatus] = useState(movie?.selection_status);

  if (!movie) return null;

  const poster = getPoster(movie);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-3 animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto scrollbar-thin-dark shadow-2xl shadow-black/50 animate-slideUp">
        {/* Effet de brillance subtil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

        <div className="relative p-3 sm:p-4">
          {/* HEADER - VERSION ÉPURÉE */}
          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
            {/* Partie gauche */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Icône simple */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-800/50 to-blue-500/20 border border-white/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>

              {/* Titre et infos */}
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2lg font-semibold text-white truncate">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs mt-0 flex-wrap">
                  <span className="text-white/40">ID: {movie.id_movie}</span>
                  <span className="text-white/20 hidden xs:inline">•</span>
                   <span className="text-white/40 hidden sm:inline">
                    {movie.created_at
                      ? new Date(movie.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Date inconnue"}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                      localStatus === "selected"
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : localStatus === "refused"
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                    }`}
                  >
                    {localStatus === "selected"
                      ? "Sélectionné"
                      : localStatus === "refused"
                        ? "Refusé"
                        : "En attente"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bouton fermeture */}
            <button
              type="button"
              onClick={onClose}
              className="group/close w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all duration-200 flex items-center justify-center flex-shrink-0"
              aria-label="Fermer"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 group-hover/close:text-red-400 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* MAIN CONTENT: responsive grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
            {/* Colonne gauche - Bande-annonce + Description */}
            <div className="lg:col-span-5 space-y-2">
              {/* Section Bande-annonce */}
              <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-lg p-2 sm:p-3 border border-white/10 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    Bande-annonce
                  </h3>
                </div>

                {movie.trailer || movie.youtube_link ? (
                  movie.trailer ? (
                    <VideoPreview
                      title={movie.title}
                      src={`${uploadBase}/${movie.trailer}`}
                      poster={poster || undefined}
                    />
                  ) : (
                    <a
                      href={movie.youtube_link}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative flex items-center justify-center gap-3 w-full h-20 sm:h-24 md:h-28 bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-md border border-red-500/40 text-red-300 text-sm rounded-lg hover:bg-red-500/30 hover:text-red-200 hover:border-red-500/60 transition-all duration-300 overflow-hidden shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 relative"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span className="relative text-xs font-medium hidden xs:inline">
                        Regarder sur YouTube
                      </span>
                    </a>
                  )
                ) : (
                  <div className="flex items-center justify-center w-full h-20 sm:h-24 md:h-28 bg-black/50 border border-white/10 rounded-lg">
                    <div className="text-center">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm text-gray-400">
                        Aucune vidéo disponible
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Description */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 rounded-lg p-2 sm:p-3 border border-white/10 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    Description
                  </h3>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-2 sm:p-3 hover:border-white/20 transition-colors shadow-inner max-h-[150px] sm:max-h-[200px] overflow-y-auto scrollbar-thin-dark">
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic border-l-2 border-blue-400/70 pl-2 sm:pl-3 break-words">
                    {movie.synopsis ||
                      movie.description ||
                      "Aucune description disponible."}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne centrale - Galerie d'images + Métadonnées */}
            <div className="lg:col-span-4 space-y-2">
              {/* Section Galerie d'images */}
              {[movie.picture1, movie.picture2, movie.picture3].filter(Boolean)
                .length > 0 && (
                <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-lg p-2 sm:p-3 border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/20 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                        Galerie
                      </h3>
                    </div>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                      {
                        [movie.picture1, movie.picture2, movie.picture3].filter(
                          Boolean,
                        ).length
                      }{" "}
                      image(s)
                    </span>
                  </div>

                  {/* GRILLE RESPONSIVE */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[movie.picture1, movie.picture2, movie.picture3]
                      .filter(Boolean)
                      .map((pic, idx) => (
                        <div
                          key={idx}
                          className="group/img relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-white/10 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
                        >
                          <img
                            src={`${uploadBase}/${pic}`}
                            alt={`Vignette ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                            <span className="text-[10px] text-white/90 bg-black/70 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
                              Image {idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Section Métadonnées */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 rounded-lg p-2 sm:p-3 border border-white/10 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    INFORMATIONS
                  </h3>
                </div>

                <div className="space-y-1">
                  {/* Durée */}
                  <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">
                      DURÉE
                    </span>
                    <span className="text-xs font-medium text-white">
                      {movie.duration ? `${movie.duration}min` : "-"}
                    </span>
                  </div>

                  {/* Langue */}
                  <div className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">
                      LANGUE
                    </span>
                    <span className="text-xs font-medium text-white">
                      {movie.main_language || "-"}
                    </span>
                  </div>

                  {/* Nationalité */}
                  <div className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">
                      NATIONALITÉ
                    </span>
                    <span className="text-xs font-medium text-white">
                      {movie.nationality || "-"}
                    </span>
                  </div>

                  {/* Producteur */}
                  <div className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">
                      PRODUCTEUR
                    </span>
                    <span
                      className="text-xs font-medium text-white truncate max-w-[120px] sm:max-w-[150px]"
                      title={`${(movie.User || movie.Producer)?.first_name} ${(movie.User || movie.Producer)?.last_name}`}
                    >
                      {(movie.User || movie.Producer)?.first_name || ""}{" "}
                      {(movie.User || movie.Producer)?.last_name || "-"}
                    </span>
                  </div>

                  {/* Connu via */}
                  {(movie.User || movie.Producer)?.known_by_mars_ai && (
                    <div className="mt-2 pt-2">
                      <div className="flex items-center gap-2 bg-blue-500/10 rounded-lg px-2 sm:px-3 py-2 border border-blue-500/20">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs text-blue-300 font-medium break-words">
                          {movie.User?.known_by_mars_ai}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite - Actions + Catégories + Jurys */}
            <div className="lg:col-span-3 space-y-2">
              {/* Section Actions rapides */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    Actions rapides
                  </h3>
                </div>

                {/* MODIFICATION: Horizontal layout on mobile, vertical on larger screens */}
                <div className="flex flex-row lg:flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLocalStatus("selected");
                      onStatusUpdate(movie.id_movie, "selected");
                    }}
                    className="group relative flex-1 lg:w-full px-3 py-1.5 bg-green-500/10 backdrop-blur-sm border border-green-500/30 text-green-300 text-xs font-medium rounded-lg hover:bg-green-500/20 hover:text-green-200 hover:border-green-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-1.5 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="relative">Approuver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocalStatus("refused");
                      onStatusUpdate(movie.id_movie, "refused");
                    }}
                    className="group relative flex-1 lg:w-full px-3 py-1.5 bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-300 text-xs font-medium rounded-lg hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-1.5 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="relative">Refuser</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm("Supprimer définitivement ce film ?")
                      ) {
                        onDelete(movie.id_movie);
                      }
                    }}
                    className="group relative flex-1 lg:w-full px-3 py-1.5 bg-gray-500/10 backdrop-blur-sm border border-white/10 text-gray-300 text-xs font-medium rounded-lg hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-1.5 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="relative">Supprimer</span>
                  </button>
                </div>
              </div>

              {/* Section Classification */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    Classification
                  </h4>
                </div>

                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-black/30 rounded-lg p-3">
                    Aucune catégorie disponible.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={
                          (categorySelection[movie.id_movie] || [""])[0] || ""
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          onCategoryChange(
                            movie.id_movie,
                            value ? [Number(value)] : [],
                          );
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-gray-900">
                          Sélectionner une catégorie
                        </option>
                        {categories.map((category) => (
                          <option
                            key={category.id_categorie}
                            value={category.id_categorie}
                            className="bg-gray-900"
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-white/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onCategorySave(movie.id_movie)}
                      disabled={isUpdatingCategories}
                      className="group relative w-full px-4 py-1.5 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 overflow-hidden cursor"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isUpdatingCategories ? (
                          <>
                            <svg
                              className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                              />
                            </svg>
                            <span>Appliquer la catégorie</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Section Jurys assignés */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    Jurys assignés
                  </h4>
                </div>

                {juries.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-black/30 rounded-lg p-3">
                    Aucun jury disponible.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin-dark pr-1">
                    {juries.map((jury) => {
                      const selected = (
                        jurySelection[movie.id_movie] || []
                      ).includes(jury.id_user);
                      return (
                        <div
                          key={jury.id_user}
                          className="flex items-center justify-between py-1 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${selected ? "bg-green-400" : "bg-gray-500"}`}
                            />
                            <span className="text-xs sm:text-sm text-gray-300 truncate">
                              {jury.first_name} {jury.last_name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onJuryToggle(movie.id_movie, jury.id_user)
                            }
                            className={`group relative px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-medium rounded-md backdrop-blur-sm transition-all duration-200 overflow-hidden cursor-pointer flex-shrink-0 ${
                              selected
                                ? "bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 hover:text-green-200 hover:border-green-500/50"
                                : "bg-white/5 border border-white/10 text-gray-300 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/30"
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative">
                              {selected ? "Assigné" : "Assigner"}
                            </span>
                          </button>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => onJurySave(movie.id_movie)}
                      disabled={isUpdatingJuries}
                      className="group relative w-full mt-4 px-4 py-1.5 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isUpdatingJuries ? (
                          <>
                            <svg
                              className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                              />
                            </svg>
                            <span>Appliquer les jurys</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-3 sm:pt-4 border-t border-white/10">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <span className="text-xs text-white/40">
                Dernière modification par{" "}
                <span className="text-white/60">Admin</span> il y a quelques
                instants
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/20">•</span>
                <span className="text-xs text-white/40">
                  ID: {movie.id_movie}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges décoratifs */}
        <div className="absolute top-0 right-0 w-24 sm:w-48 h-24 sm:h-48 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}