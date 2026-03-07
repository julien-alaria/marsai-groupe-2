// 


import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAwards, createAward, deleteAward } from "../../api/awards.js";
import { getVideos, updateMovieStatus } from "../../api/videos.js";
import { UPLOAD_BASE } from "../../utils/constants.js";

const TUTORIAL_STEPS = [
  "Toutes les récompenses disponibles sont affichées.",
  "Vous pouvez voir quels films sont candidats pour chaque récompense.",
  "Les administrateurs peuvent attribuer des récompenses aux films sélectionnés.",
  "Chaque récompense a des critères spécifiques et peut être attribuée manuellement.",
  "Une fois les récompenses attribuées, vous pouvez publier les résultats.",
  "Les films primés seront visibles sur la page publique.",
  "Vous pouvez modifier ou révoquer des récompenses en cas d'erreur.",
  "Vérifiez les critères d'attribution avant de récompenser un film.",
  "Communiquez les résultats aux participants.",
];

function Awards() {
  const [showTutorial, setShowTutorial] = useState(false);
  const queryClient = useQueryClient();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [awardName, setAwardName] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [confirmModal, setConfirmModal] = useState(null);

  const { data: awardsData, isPending: awardsLoading, isError: awardsError } = useQuery({
    queryKey: ["awards"],
    queryFn: getAwards,
  });

  const { data: moviesData } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
  });

  const awards = awardsData?.data || [];
  const movies = moviesData?.data || [];

  // Films candidats (status: candidate, selected, finalist) qui peuvent recevoir un prix
  const candidateMovies = useMemo(() => {
    return movies.filter((movie) => 
      ["candidate", "selected", "finalist"].includes(movie.selection_status)
    );
  }, [movies]);

  // Films déjà primés (status: awarded)
  const awardedMovies = useMemo(() => {
    return movies.filter((movie) => movie.selection_status === "awarded");
  }, [movies]);

  const proposedMovies = useMemo(() => {
    return movies.filter((movie) => movie.selection_status === "selected" || movie.selection_status === "finalist");
  }, [movies]);

  // Grouper les prix par film
  const awardsByMovie = useMemo(() => {
    const grouped = {};
    awards.forEach((award) => {
      if (!grouped[award.id_movie]) {
        grouped[award.id_movie] = [];
      }
      grouped[award.id_movie].push(award);
    });
    return grouped;
  }, [awards]);

  const createAwardMutation = useMutation({
    mutationFn: ({ id_movie, award_name }) => createAward(id_movie, award_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setAwardName("");
      setSelectedMovie(null);
      setShowModal(false);
      setFeedback({ type: "success", message: "Prix attribué avec succès" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Erreur lors de l'attribution du prix" });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const deleteAwardMutation = useMutation({
    mutationFn: (id) => deleteAward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setFeedback({ type: "success", message: "Prix supprimé avec succès" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Erreur lors de la suppression du prix" });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const markAsAwardedMutation = useMutation({
    mutationFn: (id_movie) => updateMovieStatus(id_movie, "awarded"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setFeedback({ type: "success", message: "Film marqué comme primé" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Erreur lors de la mise à jour" });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const resetAwardedMoviesMutation = useMutation({
    mutationFn: async () => {
      const promises = awardedMovies.map((movie) =>
        updateMovieStatus(movie.id_movie, "candidate")
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setFeedback({ type: "success", message: "Films réinitialisés en candidats" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Erreur lors de la réinitialisation" });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const deleteAllAwardsMutation = useMutation({
    mutationFn: async () => {
      const promises = awards.map((award) => deleteAward(award.id_award));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setFeedback({ type: "success", message: "Tous les prix ont été supprimés" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Erreur lors de la suppression des prix" });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const handleOpenModal = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
    setAwardName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!awardName.trim() || !selectedMovie) return;

    createAwardMutation.mutate({
      id_movie: selectedMovie.id_movie,
      award_name: awardName.trim(),
    });
  };

  const handleAwardMovie = (movieId) => {
    setConfirmModal({
      title: "Passer en film primé",
      message: "Marquer ce film comme primé et le retirer de la votation ?",
      onConfirm: () => {
        markAsAwardedMutation.mutate(movieId);
        setConfirmModal(null);
      },
    });
  };

  const handleResetAwardedMovies = () => {
    setConfirmModal({
      title: "Réinitialiser les films primés",
      message: `Réinitialiser ${awardedMovies.length} film(s) primé(s) en candidats ?`,
      onConfirm: () => {
        resetAwardedMoviesMutation.mutate();
        setConfirmModal(null);
      },
    });
  };

  const handleDeleteAllAwards = () => {
    setConfirmModal({
      title: "Supprimer tous les prix",
      message: `Supprimer définitivement tous les ${awards.length} prix existants ? Cette action est irréversible.`,
      onConfirm: () => {
        deleteAllAwardsMutation.mutate();
        setConfirmModal(null);
      },
      danger: true,
    });
  };

  const handleDeleteAward = (award) => {
    const movie = movies.find((m) => m.id_movie === award.id_movie);
    const movieTitle = movie ? movie.title : `Film #${award.id_movie}`;
    setConfirmModal({
      title: "Supprimer le prix",
      message: `Supprimer le prix "${award.award_name}" pour "${movieTitle}" ?`,
      onConfirm: () => {
        deleteAwardMutation.mutate(award.id_award);
        setConfirmModal(null);
      },
      danger: true,
    });
  };

  const getPoster = (movie) => {
    return movie.thumbnail
      ? `${UPLOAD_BASE}/${movie.thumbnail}`
      : movie.display_picture
        ? `${UPLOAD_BASE}/${movie.display_picture}`
        : movie.picture1
          ? `${UPLOAD_BASE}/${movie.picture1}`
          : null;
  };

  if (awardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm text-white/70">Chargement des prix...</span>
        </div>
      </div>
    );
  }

  if (awardsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 text-red-400">
          Une erreur est survenue lors du chargement des prix
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] text-white pt-8 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header — titre à gauche, bouton aide top-right */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-white">
              Gestion des Prix
            </h1>
            <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">
              Cliquez sur un film candidat pour lui attribuer un prix
            </p>
          </div>
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            title="Afficher l'aide"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {showTutorial && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white/90 mb-2">Tutoriel : Système de Récompenses</h3>
                <ul className="space-y-1.5 text-xs text-white/60">
                  {TUTORIAL_STEPS.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-px flex-shrink-0">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        {(awards.length > 0 || awardedMovies.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            {awards.length > 0 && (
              <button
                onClick={handleDeleteAllAwards}
                className="group relative px-4 py-2 bg-red-500/10 backdrop-blur-sm border border-red-500/30 text-red-300 text-sm rounded-lg hover:bg-red-500/20 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Supprimer tous les prix ({awards.length})</span>
              </button>
            )}
            {awardedMovies.length > 0 && (
              <button
                onClick={handleResetAwardedMovies}
                className="group relative px-4 py-2 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 text-yellow-300 text-sm rounded-lg hover:bg-yellow-500/20 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Réinitialiser films primés ({awardedMovies.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-lg text-sm ${
              feedback.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-300"
                : "bg-red-500/10 border border-red-500/30 text-red-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "create"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Films Candidats ({candidateMovies.length})
          </button>
          <button
            onClick={() => setActiveTab("awarded")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "awarded"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Films Primés ({awardedMovies.length})
          </button>
        </div>

        {activeTab === "create" && (
          <>
            {/* Stats Cards - Liquid glass */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                <div className="relative">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Total des prix</p>
                  <p className="text-3xl font-light text-white mt-2">{awards.length}</p>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                <div className="relative">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Films candidats</p>
                  <p className="text-3xl font-light text-white mt-2">{candidateMovies.length}</p>
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                <div className="relative">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Films primés</p>
                  <p className="text-3xl font-light text-white mt-2">{awardedMovies.length}</p>
                </div>
              </div>
            </div>

            {/* Liste candidats - Liquid glass */}
            <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-6 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              
              <div className="relative">
                <h2 className="text-lg font-light text-white/90 mb-4">Films candidats - Cliquez pour créer un prix</h2>
                {candidateMovies.length === 0 ? (
                  <p className="text-white/40 text-center py-8">Aucun film candidat.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {candidateMovies.map((movie) => {
                      const poster = getPoster(movie);
                      const movieAwards = (movie.Awards || []);
                      return (
                        <div
                          key={movie.id_movie}
                          className="group/card relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 cursor-pointer"
                          onClick={() => handleOpenModal(movie)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 pointer-events-none" />
                          
                          <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900">
                            {poster ? (
                              <img src={poster} alt={movie.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            {movieAwards.length > 0 && (
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-[9px] font-bold">
                                  🏆 {movieAwards.length}
                                </span>
                              </div>
                            )}
                            
                            {/* Overlay au survol */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-3">
                              <span className="text-xs text-white/90 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Créer un prix
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-2">
                            <h3 className="text-xs font-medium text-white truncate">{movie.title}</h3>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(movie.Categories || []).slice(0, 2).map((cat) => (
                                <span
                                  key={cat.id_categorie}
                                  className="text-[7px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1 py-0.5 rounded-full"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                            
                            {movieAwards.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAwardMovie(movie.id_movie);
                                }}
                                disabled={markAsAwardedMutation.isPending}
                                className="w-full mt-2 px-2 py-1 bg-gradient-to-r from-green-600/80 to-green-700/80 text-white text-[8px] rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50"
                              >
                                Passer en films primés
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden opacity-5 pointer-events-none">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl" />
              </div>
            </div>
          </>
        )}

        {activeTab === "awarded" && (
          <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-6 shadow-2xl shadow-black/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-lg font-light text-white/90 mb-4">Films proposés à la candidature</h2>
              {proposedMovies.length === 0 ? (
                <p className="text-white/40 text-sm mb-6">Aucun film proposé pour le moment.</p>
              ) : (
                <div className="mb-6 space-y-2">
                  {proposedMovies.map((movie) => (
                    <div key={`proposed-${movie.id_movie}`} className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg">
                      <span className="text-sm text-white truncate">{movie.title}</span>
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-300 text-[10px] rounded-full">Proposé</span>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-lg font-light text-white/90 mb-4">Films primés</h2>
              {awardedMovies.length === 0 ? (
                <p className="text-white/40 text-center py-8">Aucun film primé pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {awardedMovies.map((movie) => {
                    const poster = getPoster(movie);
                    const movieAwards = (movie.Awards || []);
                    return (
                      <div
                        key={movie.id_movie}
                        className="group/row bg-black/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors overflow-hidden"
                      >
                        <div className="flex items-center gap-3 p-3">
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                              {poster ? (
                                <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(movie.Categories || []).map((cat) => (
                                <span
                                  key={cat.id_categorie}
                                  className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                            
                            {/* Awards */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {movieAwards.map((award) => (
                                <button
                                  key={award.id_award}
                                  onClick={() => handleDeleteAward(award)}
                                  className="group/btn relative px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[9px] rounded-lg hover:bg-yellow-500/20 transition-all duration-200 overflow-hidden flex items-center gap-1"
                                  title="Cliquer pour supprimer"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                  <span className="relative flex items-center gap-1">
                                    <span>🏆 {award.award_name}</span>
                                    <span className="text-[8px] opacity-70">✕</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden opacity-5 pointer-events-none">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl" />
            </div>
          </div>
        )}
      </div>

      {/* Modal pour créer un prix - Liquid glass */}
      {showModal && selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="group relative bg-gradient-to-br from-[#1a1c20] to-[#0f1114] backdrop-blur-2xl border border-white/10 rounded-xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light text-white">Créer un prix</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Film info */}
              <div className="mb-6 flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex-shrink-0">
                  {(() => {
                    const poster = getPoster(selectedMovie);
                    return poster ? (
                      <img src={poster} alt={selectedMovie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{selectedMovie.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(selectedMovie.Categories || []).slice(0, 2).map((cat) => (
                      <span
                        key={cat.id_categorie}
                        className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-2">Nom du prix *</label>
                  <input
                    type="text"
                    value={awardName}
                    onChange={(e) => setAwardName(e.target.value)}
                    placeholder="Ex: Meilleur Film, Grand Prix..."
                    className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder:text-white/30"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="group/btn relative flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/80 text-sm rounded-lg hover:bg-white/10 transition-all duration-200 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="relative">Annuler</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!awardName.trim()}
                    className="group/btn relative flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    <span className="relative">Créer le prix</span>
                  </button>
                </div>
              </form>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden opacity-5 pointer-events-none">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmation générique */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-gradient-to-br from-[#1a1c20] to-[#0f1114] border border-white/10 rounded-xl w-full max-w-md shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmModal.danger ? "bg-red-500/20 border border-red-500/30" : "bg-yellow-500/20 border border-yellow-500/30"}`}>
                <svg className={`w-6 h-6 ${confirmModal.danger ? "text-red-400" : "text-yellow-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.142 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">{confirmModal.title}</h2>
              <p className="text-sm text-white/60 mb-6">{confirmModal.message}</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmModal(null)} className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 text-xs rounded-lg hover:bg-white/10 transition-colors">
                  Annuler
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${confirmModal.danger ? "bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20" : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"}`}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Awards;