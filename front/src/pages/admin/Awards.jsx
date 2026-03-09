/**
 * Composant Awards (Gestion des Prix)
 * Page administrateur pour créer, modifier et gérer les prix du festival
 * @returns {JSX.Element} La page de gestion des prix
 */
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAwards, createAward, deleteAward } from "../../api/awards.js";
import { getVideos, updateMovieStatus } from "../../api/videos.js";
import { getVotes } from "../../api/votes.js";
import { VideoPreview } from "../../components/VideoPreview.jsx";

function Awards() {
  const queryClient = useQueryClient();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [awardName, setAwardName] = useState("");
  const [statusTarget, setStatusTarget] = useState("candidate");
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("create"); // "create" ou "awarded"

  const { data: awardsData, isPending: awardsLoading, isError: awardsError } = useQuery({
    queryKey: ["awards"],
    queryFn: getAwards,
  });

  const { data: moviesData } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
  });

  const { data: votesData } = useQuery({
    queryKey: ["votes"],
    queryFn: getVotes,
  });

  const awards = awardsData?.data || [];
  const movies = moviesData?.data || [];
  const votes = votesData?.data || [];

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

  const updateStatusMutation = useMutation({
    mutationFn: ({ id_movie, selection_status }) => updateMovieStatus(id_movie, selection_status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setFeedback({ type: "success", message: "Statut du film mis à jour" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Erreur lors du changement de statut" });
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
    setStatusTarget(movie.selection_status || "candidate");
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
    if (window.confirm("Marquer ce film comme primé et le retirer de la votation ?")) {
      markAsAwardedMutation.mutate(movieId);
    }
  };

  const handleResetAwardedMovies = () => {
    if (window.confirm(`Réinitialiser ${awardedMovies.length} films primés en candidats pour les tests ?`)) {
      resetAwardedMoviesMutation.mutate();
    }
  };

  const handleDeleteAllAwards = () => {
    if (window.confirm(`Supprimer définitivement tous les ${awards.length} prix existants ?`)) {
      deleteAllAwardsMutation.mutate();
    }
  };

  const handleDeleteAward = (award) => {
    const movie = movies.find((m) => m.id_movie === award.id_movie);
    const movieTitle = movie ? movie.title : `Film #${award.id_movie}`;
    if (window.confirm(`Supprimer le prix "${award.award_name}" pour "${movieTitle}" ?`)) {
      deleteAwardMutation.mutate(award.id_award);
    }
  };

  const getPoster = (movie) => {
    const uploadBase = "http://localhost:3000/uploads";
    return movie.thumbnail
      ? `${uploadBase}/${movie.thumbnail}`
      : movie.display_picture
        ? `${uploadBase}/${movie.display_picture}`
        : movie.picture1
          ? `${uploadBase}/${movie.picture1}`
          : null;
  };

  const getTrailer = (movie) => (
    movie?.trailer || movie?.trailer_video || movie?.trailerVideo || movie?.filmFile || movie?.video || null
  );

  const votesByMovie = useMemo(() => {
    return votes.reduce((acc, vote) => {
      if (!acc[vote.id_movie]) acc[vote.id_movie] = [];
      acc[vote.id_movie].push(vote);
      return acc;
    }, {});
  }, [votes]);

  const voteStatsByMovie = useMemo(() => {
    const stats = {};
    votes.forEach((vote) => {
      if (!stats[vote.id_movie]) stats[vote.id_movie] = { count: 0, sum: 0, average: 0 };
      const numeric = parseFloat(vote.note);
      if (!Number.isNaN(numeric)) {
        stats[vote.id_movie].count += 1;
        stats[vote.id_movie].sum += numeric;
        stats[vote.id_movie].average = stats[vote.id_movie].sum / stats[vote.id_movie].count;
      }
    });
    return stats;
  }, [votes]);

  if (awardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AD46FF] mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (awardsError) {
    return <div className="text-red-300">Une erreur est survenue lors du chargement des prix</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
            Gestion des Prix
          </h1>
          <p className="text-gray-400 mt-2">
            Cliquez sur un film candidat pour créer un nouveau prix
          </p>
        </div>
        
        {/* Boutons de test */}
        <div className="flex gap-2">
          {awards.length > 0 && (
            <button
              onClick={handleDeleteAllAwards}
              className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
            >
              Supprimer tous les prix ({awards.length})
            </button>
          )}
          {awardedMovies.length > 0 && (
            <button
              onClick={handleResetAwardedMovies}
              className="px-4 py-2 bg-yellow-600/80 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold"
            >
              Réinitialiser films primés ({awardedMovies.length})
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg border ${
            feedback.type === "success"
              ? "bg-green-900/30 border-green-600 text-green-300"
              : "bg-red-900/30 border-red-600 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "create"
              ? "text-[#AD46FF] border-b-2 border-[#AD46FF]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Films Candidats ({candidateMovies.length})
        </button>
        <button
          onClick={() => setActiveTab("awarded")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "awarded"
              ? "text-[#AD46FF] border-b-2 border-[#AD46FF]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Films Primés ({awardedMovies.length})
        </button>
      </div>

      {activeTab === "create" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total des prix</p>
              <p className="text-3xl font-bold text-white mt-1">{awards.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Films candidats</p>
              <p className="text-3xl font-bold text-white mt-1">{candidateMovies.length}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Films primés</p>
              <p className="text-3xl font-bold text-white mt-1">{awardedMovies.length}</p>
            </div>
          </div>

          {/* Liste candidats */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Films candidats - Cliquez pour créer un prix</h2>
            {candidateMovies.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun film candidat.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                {candidateMovies.map((movie) => {
                  const poster = getPoster(movie);
                  const movieAwards = (movie.Awards || []);
                  return (
                    <div
                      key={movie.id_movie}
                      className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden hover:border-[#AD46FF] hover:scale-105 transition-all text-left"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenModal(movie)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenModal(movie);
                          }
                        }}
                        className="w-full text-left cursor-pointer"
                      >
                      <div className="relative aspect-[3/4] bg-gray-800">
                        {poster ? (
                          <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">?</div>
                        )}
                        {movieAwards.length > 0 && (
                          <div className="absolute top-1.5 right-1.5">
                            <span className="bg-yellow-500/90 text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              🏆 {movieAwards.length}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <div className="text-white">
                            <div className="text-xs font-bold">Créer un prix</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className="text-xs font-semibold text-white truncate">{movie.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(movie.Categories || []).slice(0, 2).map((cat) => (
                            <span
                              key={cat.id_categorie}
                              className="text-[10px] bg-[#AD46FF]/20 text-[#AD46FF] px-1.5 py-0.5 rounded-full"
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
                            className="w-full mt-2 px-2 py-1 bg-green-600/80 text-white rounded text-[10px] hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Passer en films primés
                          </button>
                        )}
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "awarded" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-3">Films proposés à la candidature</h2>
          {proposedMovies.length === 0 ? (
            <p className="text-gray-500 text-sm mb-6">Aucun film proposé pour le moment.</p>
          ) : (
            <div className="mb-6 space-y-2">
              {proposedMovies.map((movie) => (
                <div key={`proposed-${movie.id_movie}`} className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-white text-sm truncate">{movie.title}</span>
                  <span className="text-[11px] bg-green-900/40 text-green-200 px-2 py-0.5 rounded-full">Proposé</span>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Films primés</h2>
          {awardedMovies.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun film primé pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {awardedMovies.map((movie) => {
                const poster = getPoster(movie);
                const movieAwards = (movie.Awards || []);
                return (
                  <div
                    key={movie.id_movie}
                    className="bg-gray-950 border border-gray-800 rounded-lg hover:bg-gray-900/50 transition-all"
                  >
                    <div className="flex items-center gap-3 p-3">
                      {/* Thumbnail */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden">
                          {poster ? (
                            <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">?</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold">{movie.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(movie.Categories || []).map((cat) => (
                            <span
                              key={cat.id_categorie}
                              className="text-xs bg-[#AD46FF]/20 text-[#AD46FF] px-2 py-0.5 rounded-full"
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
                              className="bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-yellow-500/30 transition"
                              title="Cliquer pour supprimer"
                            >
                              <span>🏆 {award.award_name}</span>
                              <span className="text-[10px] opacity-70">✕</span>
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
      )}

      {/* Modal pour créer un prix */}
      {showModal && selectedMovie && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 mobile-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-6xl max-h-[92vh] overflow-auto mobile-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Créer un prix</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-12 gap-3 text-[12px]">
              <div className="col-span-12 xl:col-span-7 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                  <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {(() => {
                      const poster = getPoster(selectedMovie);
                      return poster ? (
                        <img src={poster} alt={selectedMovie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">?</div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{selectedMovie.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(selectedMovie.Categories || []).map((cat) => (
                        <span
                          key={cat.id_categorie}
                          className="text-[10px] bg-[#AD46FF]/20 text-[#AD46FF] px-1.5 py-0.5 rounded-full"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <h4 className="text-xs uppercase text-gray-400 mb-2">Prévisualisation</h4>
                  {(getTrailer(selectedMovie) || selectedMovie.youtube_link) ? (
                    <div className="aspect-video h-[210px]">
                      {getTrailer(selectedMovie) ? (
                        <VideoPreview
                          title={selectedMovie.title}
                          src={`http://localhost:3000/uploads/${getTrailer(selectedMovie)}`}
                          poster={getPoster(selectedMovie) || undefined}
                          openMode="fullscreen"
                          modalPlacement="bottom"
                          modalTopOffsetClass="top-20 left-0 right-0 bottom-0"
                        />
                      ) : (
                        <a
                          className="text-[#AD46FF] hover:text-[#F6339A] font-semibold"
                          href={selectedMovie.youtube_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ouvrir la vidéo YouTube
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune vidéo disponible.</p>
                  )}
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <h4 className="text-xs uppercase text-gray-400 mb-2">Votations effectuées</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                      <p className="text-[11px] text-gray-400">Votes</p>
                      <p className="text-white font-semibold">{voteStatsByMovie[selectedMovie.id_movie]?.count || 0}</p>
                    </div>
                    <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                      <p className="text-[11px] text-gray-400">Moyenne</p>
                      <p className="text-white font-semibold">
                        {voteStatsByMovie[selectedMovie.id_movie]?.count > 0
                          ? voteStatsByMovie[selectedMovie.id_movie].average.toFixed(2)
                          : "-"}
                      </p>
                    </div>
                    <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                      <p className="text-[11px] text-gray-400">Statut</p>
                      <p className="text-white font-semibold">{selectedMovie.selection_status || "submitted"}</p>
                    </div>
                  </div>

                  {(votesByMovie[selectedMovie.id_movie] || []).length === 0 ? (
                    <p className="text-gray-500">Aucun vote pour ce film.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-auto pr-1">
                      {(votesByMovie[selectedMovie.id_movie] || []).map((vote) => (
                        <div key={vote.id_vote} className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">
                              {vote.User ? `${vote.User.first_name || ""} ${vote.User.last_name || ""}`.trim() : `Jury #${vote.id_user}`}
                            </span>
                            <span className="text-white font-semibold">Note: {vote.note}</span>
                          </div>
                          {vote.comments && <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{vote.comments}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-12 xl:col-span-5 space-y-3">
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-white mb-2">Changer statut votation</h4>
                  <div className="flex gap-2">
                    <select
                      value={statusTarget}
                      onChange={(e) => setStatusTarget(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded"
                    >
                      <option value="submitted">submitted</option>
                      <option value="assigned">assigned</option>
                      <option value="to_discuss">to_discuss</option>
                      <option value="candidate">candidate</option>
                      <option value="selected">selected</option>
                      <option value="finalist">finalist</option>
                      <option value="awarded">awarded</option>
                      <option value="refused">refused</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id_movie: selectedMovie.id_movie, selection_status: statusTarget })}
                      className="px-4 py-2 bg-[#AD46FF] text-white rounded hover:bg-[#9536e6]"
                    >
                      Appliquer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id_movie: selectedMovie.id_movie, selection_status: "candidate" })}
                      className="px-3 py-2 bg-blue-600/80 text-white rounded hover:bg-blue-600"
                    >
                      Candidater
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate({ id_movie: selectedMovie.id_movie, selection_status: "awarded" })}
                      className="px-3 py-2 bg-green-600/80 text-white rounded hover:bg-green-600"
                    >
                      Marquer primé
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-3 mt-3">
                    <label className="block text-sm text-gray-400">Nom du prix *</label>

                    <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                      <input
                        type="text"
                        value={awardName}
                        onChange={(e) => setAwardName(e.target.value)}
                        placeholder="Ex: Meilleur Film, Grand Prix, Mention Spéciale..."
                        className="flex-1 bg-gray-950 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD46FF]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!awardName.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Créer le prix
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-semibold"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Awards;
