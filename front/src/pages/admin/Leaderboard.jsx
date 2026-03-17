/**
 * Composant Leaderboard Officiel (Gestion system de votation et récompenses)
 * Permet à l'admin de gérer les films votés, nominés et refusés.
 * Ici l'admin peut riassegner pour deuxième votation ou nominer directement.
 */
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVideos,
  updateMovieStatus
} from "../../api/videos";
import { getVotes } from "../../api/votes";
import { VideoPreview } from "../../components/VideoPreview";
import { UPLOAD_BASE } from "../../utils/constants.js";

function Leaderboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [message, setMessage] = useState("");
  const [showVotesModal, setShowVotesModal] = useState(false);
  const [movieToView, setMovieToView] = useState(null);
  const uploadBase = UPLOAD_BASE;

  // Fetch all movies
  const { data } = useQuery({
    queryKey: ["movies"],
    queryFn: getVideos,
  });
  const { data: votesData } = useQuery({
    queryKey: ["votes"],
    queryFn: getVotes,
  });

  const movies = data?.data || [];
  const votes = votesData?.data || [];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Filtrer uniquement films avec status votés, nominés ou refusés
  const trackedMovies = useMemo(() => {
    return movies.filter(m => 
      ["assigned", "to_discuss", "refused", "candidate"].includes(m.selection_status)
    );
  }, [movies]);

  const votesByMovie = useMemo(() => {
    return votes.reduce((acc, vote) => {
      if (!acc[vote.id_movie]) acc[vote.id_movie] = [];
      acc[vote.id_movie].push(vote);
      return acc;
    }, {});
  }, [votes]);

  // Filtraggio
  const filteredMovies = useMemo(() => {
    return trackedMovies.filter((movie) =>
      movie.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [trackedMovies, filter]);

  // Mutations
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, payload = {} }) => updateMovieStatus(id, status, payload),
    onSuccess: () => {
      setMessage("Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setSelectedMovies([]);
    },
    onError: (error) => {
      const backendMessage = error?.response?.data?.error;
      setMessage(backendMessage || "Erreur lors du changement de statut");
    },
  });

  // Actions
  function handleSelect(movie) {
    setSelectedMovies((prev) => prev.includes(movie.id_movie)
      ? prev.filter(id => id !== movie.id_movie)
      : [...prev, movie.id_movie]);
  }

  function handleSetStatus(movie, status) {
    statusMutation.mutate({
      id: movie.id_movie,
      status,
      payload: {},
    });
  }

  function handleDetectAllAsRefused() {
    if (selectedMovies.length === 0) {
      setMessage("Sélectionnez au moins un film.");
      return;
    }
    selectedMovies.forEach((id) =>
      statusMutation.mutate({
        id,
        status: "refused",
        payload: {},
      })
    );
  }

  function handleBulkReassign() {
    if (selectedMovies.length === 0) {
      setMessage("Sélectionnez au moins un film.");
      return;
    }
    selectedMovies.forEach((id) =>
      statusMutation.mutate({
        id,
        status: "assigned",
        payload: {},
      })
    );
  }

  function handleBulkNominate() {
    if (selectedMovies.length === 0) {
      setMessage("Sélectionnez au moins un film.");
      return;
    }
    selectedMovies.forEach((id) =>
      statusMutation.mutate({
        id,
        status: "candidate",
        payload: {},
      })
    );
  }

  function handleViewVotes(movie) {
    setMovieToView(movie);
    setShowVotesModal(true);
  }

  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(start, start + itemsPerPage);
  }, [filteredMovies, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredMovies.length / itemsPerPage));
  }, [filteredMovies.length, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const selectedMovieVotes = useMemo(() => {
    if (!movieToView) return [];
    return votesByMovie[movieToView.id_movie] || [];
  }, [movieToView, votesByMovie]);

  const selectedMovieVoteStats = useMemo(() => {
    if (!selectedMovieVotes.length) return { count: 0, average: null };
    const numericVotes = selectedMovieVotes
      .map((vote) => Number(vote.note))
      .filter((value) => Number.isFinite(value));

    if (!numericVotes.length) return { count: 0, average: null };

    const sum = numericVotes.reduce((acc, value) => acc + value, 0);
    return { count: numericVotes.length, average: sum / numericVotes.length };
  }, [selectedMovieVotes]);

  function getPoster(movie) {
    if (!movie) return null;
    return movie.thumbnail
      || movie.display_picture
      || movie.picture1
      || movie.picture2
      || movie.picture3
      || (movie.youtube_movie_id ? `https://img.youtube.com/vi/${movie.youtube_movie_id}/hqdefault.jpg` : null)
      || null;
  }

  function getPosterSrc(movie) {
    const poster = getPoster(movie);
    if (!poster) return null;
    return poster.startsWith("http") ? poster : `${uploadBase}/${poster}`;
  }

  function getTrailer(movie) {
    if (!movie) return null;
    if (typeof movie.youtube_link === "string" && movie.youtube_link.trim()) return null;
    return movie.trailer || movie.trailer_video || movie.trailerVideo || movie.filmFile || movie.video || null;
  }

  function getStatusStepMeta(status) {
    const map = {
      submitted: { label: "Soumis", className: "bg-gray-700/70 text-gray-200" },
      assigned: { label: "Step 1 • Assigné", className: "bg-indigo-600/80 text-white" },
      to_discuss: { label: "Step 2 • En Discussion", className: "bg-purple-700/80 text-white" },
      candidate: { label: "Step 3 • Nominé", className: "bg-yellow-600/80 text-white" },
      awarded: { label: "Step 4 • Gagnant du Prix", className: "bg-green-600/80 text-white" },
      refused: { label: "Refusé", className: "bg-red-600/80 text-white" },
      selected: { label: "Sélectionné (legacy)", className: "bg-blue-700/70 text-white" },
      finalist: { label: "Finaliste (legacy)", className: "bg-cyan-700/70 text-white" }
    };

    return map[status] || { label: status || "-", className: "bg-gray-700/70 text-gray-200" };
  }

  function getThumbnails(movie) {
    if (!movie) return [];
    const unique = [movie.thumbnail, movie.display_picture, movie.picture1, movie.picture2, movie.picture3]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);
    return unique;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
          Système de Votation & Récompenses
        </h1>
        <p className="text-gray-400 mt-2">Gestion des films votés, nominés et refusés. Ici vous pouvez réassigner pour une deuxième votation ou nominer directement à la récompense.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 items-start lg:items-center lg:flex-row lg:justify-between">
        <input 
          type="text" 
          placeholder="Filtrer par titre..." 
          value={filter} 
          onChange={e => setFilter(e.target.value)} 
          className="border px-3 py-2 rounded bg-gray-900 border-gray-700 text-white w-full lg:w-auto"
        />
        {selectedMovies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleBulkReassign} 
              className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-500 text-sm"
            >
              Réassigner votation ({selectedMovies.length})
            </button>
            <button 
              onClick={handleBulkNominate} 
              className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-500 text-sm"
            >
              Nominer directement ({selectedMovies.length})
            </button>
            <button 
              onClick={handleDetectAllAsRefused} 
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-500 text-sm"
            >
              Refuser ({selectedMovies.length})
            </button>
          </div>
        )}
      </div>

      {message && <div className="mb-2 text-green-600 text-sm">{message}</div>}

      {filteredMovies.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
          Aucun film en votation, nomination ou refusé.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMovies.map(movie => (
          <div key={movie.id_movie} className={`border border-gray-800 bg-gray-900/50 rounded p-3 relative ${selectedMovies.includes(movie.id_movie) ? 'ring-2 ring-blue-500' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedMovies.includes(movie.id_movie)} 
              onChange={() => handleSelect(movie)} 
              className="absolute top-2 left-2"
            />
            <div className="flex gap-3">
              <img 
                src={getPosterSrc(movie) || undefined} 
                alt="Vignette" 
                className="w-24 h-16 object-cover rounded bg-gray-800"
              />
              <div className="flex-1">
                <h2 className="font-bold text-lg">{movie.title}</h2>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusStepMeta(movie.selection_status).className}`}>
                    {getStatusStepMeta(movie.selection_status).label}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{movie.synopsis}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button 
                    className="text-blue-600 underline text-xs" 
                    onClick={() => handleViewVotes(movie)}
                  >
                    Voir votes
                  </button>
                  <button 
                    className="text-indigo-400 underline text-xs" 
                    onClick={() => handleSetStatus(movie, "assigned")}
                  >
                    Réassigner
                  </button>
                  <button 
                    className="text-yellow-500 underline text-xs" 
                    onClick={() => handleSetStatus(movie, "candidate")}
                  >
                    Nominer
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-gray-400">{currentPage} / {totalPages}</span>
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
      {/* Modal votes */}
      {showVotesModal && movieToView && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-5xl max-h-[92vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Votes pour {movieToView.title}</h2>
              <button className="px-3 py-1 bg-gray-800 text-gray-200 rounded hover:bg-gray-700" onClick={() => setShowVotesModal(false)}>Fermer</button>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 xl:col-span-7 bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                <h4 className="text-xs uppercase text-gray-400 mb-2">Prévisualisation</h4>
                {(getTrailer(movieToView) || movieToView.youtube_link) ? (
                  <div className="aspect-video h-[230px]">
                    {getTrailer(movieToView) ? (
                      <VideoPreview
                        title={movieToView.title}
                        src={`${uploadBase}/${getTrailer(movieToView)}`}
                        poster={getPosterSrc(movieToView) || undefined}
                        openMode="fullscreen"
                        modalPlacement="bottom"
                        modalTopOffsetClass="top-20 left-0 right-0 bottom-0"
                      />
                    ) : (
                      <a href={movieToView.youtube_link} target="_blank" rel="noreferrer" className="text-[#AD46FF] hover:text-[#F6339A]">
                        Ouvrir la vidéo YouTube
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune vidéo disponible.</p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div><span className="text-gray-400">Statut:</span> {movieToView.selection_status || "submitted"}</div>
                  <div><span className="text-gray-400">Durée:</span> {movieToView.duration ? `${movieToView.duration}s` : "-"}</div>
                  <div><span className="text-gray-400">Langue:</span> {movieToView.main_language || "-"}</div>
                  <div><span className="text-gray-400">Nationalité:</span> {movieToView.nationality || "-"}</div>
                </div>

                <div className="mt-3">
                  <h4 className="text-xs uppercase text-gray-400 mb-2">Vignettes</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {getThumbnails(movieToView).length === 0 ? (
                      <p className="text-gray-500 text-xs col-span-4">Aucune vignette disponible.</p>
                    ) : (
                      getThumbnails(movieToView).map((thumb) => (
                        <img
                          key={thumb}
                          src={`${uploadBase}/${thumb}`}
                          alt="Vignette film"
                          className="w-full h-16 object-cover rounded border border-gray-800 bg-gray-950"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-5 bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                <h4 className="text-xs uppercase text-gray-400 mb-2">Workflow votation</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button className="px-3 py-2 bg-purple-700/80 text-white rounded hover:bg-purple-700" onClick={() => handleSetStatus(movieToView, "to_discuss")}>Effectuer un 2e vote</button>
                  <button className="px-3 py-2 bg-yellow-600/80 text-white rounded hover:bg-yellow-600" onClick={() => handleSetStatus(movieToView, "candidate")}>Sauter à la nomination</button>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">L'admin peut toujours consulter les votes avant la décision.</p>
              </div>

              <div className="col-span-12 bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                <h4 className="text-xs uppercase text-gray-400 mb-2">Votations effectuées</h4>
                <div className="mb-2 text-xs text-gray-300 flex gap-4">
                  <span><span className="text-gray-400">Votes:</span> {selectedMovieVoteStats.count}</span>
                  <span><span className="text-gray-400">Moyenne:</span> {selectedMovieVoteStats.average !== null ? selectedMovieVoteStats.average.toFixed(2) : "-"}</span>
                </div>
                {selectedMovieVotes.length === 0 ? (
                  <p className="text-gray-500">Aucun vote pour ce film.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    {selectedMovieVotes.map((vote) => (
                      <div key={vote.id_vote} className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">
                            {vote.User ? `${vote.User.first_name || ""} ${vote.User.last_name || ""}`.trim() : `Jury #${vote.id_user}`}
                          </span>
                          <span className="text-white font-semibold">Note: {vote.note}</span>
                        </div>
                        {vote.comments && <p className="text-[11px] text-gray-400 mt-1">{vote.comments}</p>}
                        {Array.isArray(vote.history) && vote.history.length > 0 && (
                          <div className="mt-2 text-[11px] text-gray-500">
                            <p className="text-gray-400">Historique:</p>
                            {vote.history.map((entry) => (
                              <p key={entry.id_vote_history || `${vote.id_vote}-${entry.createdAt}`}>
                                - {entry.note} {entry.comments ? `| ${entry.comments}` : ""}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
