import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getVideos,
  updateMovie,
  updateMovieCategories,
  updateMovieStatus
} from "../../api/videos";
import { deleteVotesByMovie, getVotes } from "../../api/votes";
import Pagination from "../../components/admin/Pagination.jsx";

function Videos() {
  const queryClient = useQueryClient();
  const uploadBase = "http://localhost:3000/uploads";

  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [categorySelection, setCategorySelection] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    synopsis_anglais: "",
    admin_comment: ""
  });

  const { data } = useQuery({
    queryKey: ["movies"],
    queryFn: getVideos
  });

  const { data: votesData } = useQuery({
    queryKey: ["votes"],
    queryFn: getVotes
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

  const categories = categoriesData?.data || [];

  useEffect(() => {
    if (data?.data) {
      setMovies(data.data);
    }
  }, [data]);

  const filteredMovies = useMemo(() => {
    const safeFilter = filter.trim().toLowerCase();
    if (!safeFilter) return movies;

    return movies.filter((movie) =>
      String(movie.title || "").toLowerCase().includes(safeFilter)
    );
  }, [movies, filter]);

  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(start, start + itemsPerPage);
  }, [filteredMovies, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredMovies.length / itemsPerPage)),
    [filteredMovies.length, itemsPerPage]
  );

  const voteStatsByMovie = useMemo(() => {
    const votes = votesData?.data || [];
    const stats = {};

    votes.forEach((vote) => {
      if (!stats[vote.id_movie]) {
        stats[vote.id_movie] = { count: 0, sum: 0, average: 0 };
      }
      const numeric = Number(vote.note);
      if (!Number.isNaN(numeric)) {
        stats[vote.id_movie].count += 1;
        stats[vote.id_movie].sum += numeric;
        stats[vote.id_movie].average =
          stats[vote.id_movie].sum / stats[vote.id_movie].count;
      }
    });

    return stats;
  }, [votesData]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, selection_status, payload = {} }) =>
      updateMovieStatus(id, selection_status, payload)
  });

  const updateMovieMutation = useMutation({
    mutationFn: async ({ id, payload }) => updateMovie(id, payload)
  });

  const updateCategoriesMutation = useMutation({
    mutationFn: async ({ id, categoryIds }) => updateMovieCategories(id, categoryIds)
  });

  const resetVotesMutation = useMutation({
    mutationFn: async (id_movie) => deleteVotesByMovie(id_movie)
  });

  const refreshMovies = async (successMessage) => {
    await queryClient.invalidateQueries({ queryKey: ["movies"] });
    await queryClient.invalidateQueries({ queryKey: ["listVideos"] });
    await queryClient.invalidateQueries({ queryKey: ["votes"] });
    if (successMessage) setMessage(successMessage);
  };

  function getPoster(movie) {
    if (!movie) return null;
    const filename =
      movie.thumbnail || movie.display_picture || movie.picture1 || movie.picture2 || movie.picture3;
    return filename ? `${uploadBase}/${filename}` : null;
  }

  function getTrailer(movie) {
    if (!movie) return null;
    const trailer = movie.trailer || movie.trailer_video || movie.filmFile || movie.video;
    return trailer ? `${uploadBase}/${trailer}` : null;
  }

  function openDetailsModal(movie) {
    setEditingMovie(movie);
    setCategorySelection((movie.Categories || []).map((cat) => cat.id_categorie));
    setFormData({
      title: movie.title || "",
      synopsis: movie.synopsis || movie.description || "",
      synopsis_anglais: movie.synopsis_anglais || "",
      admin_comment: movie.admin_comment || movie.jury_comment || ""
    });
    setShowDetailsModal(true);
  }

  function closeDetailsModal() {
    setShowDetailsModal(false);
    setEditingMovie(null);
  }

  function toggleMovieSelection(movieId) {
    setSelectedMovieIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  }

  function toggleSelectAllFiltered() {
    const allFilteredIds = filteredMovies.map((movie) => movie.id_movie);
    const allAlreadySelected = allFilteredIds.length > 0
      && allFilteredIds.every((id) => selectedMovieIds.includes(id));

    if (allAlreadySelected) {
      setSelectedMovieIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
      return;
    }

    setSelectedMovieIds((prev) => [...new Set([...prev, ...allFilteredIds])]);
  }

  async function bulkUpdateSelectionStatus(selection_status, successMessage) {
    if (selectedMovieIds.length === 0) {
      setMessage("Sélectionnez au moins un film.");
      return;
    }

    try {
      await Promise.all(
        selectedMovieIds.map((id) =>
          updateStatusMutation.mutateAsync({
            id,
            selection_status,
            payload: { force_transition: true }
          })
        )
      );
      await refreshMovies(successMessage);
      setSelectedMovieIds([]);
    } catch {
      setMessage("Erreur lors de la mise à jour des films sélectionnés.");
    }
  }

  async function handleSaveTexts() {
    if (!editingMovie) return;

    try {
      await updateMovieMutation.mutateAsync({
        id: editingMovie.id_movie,
        payload: {
          title: formData.title,
          synopsis: formData.synopsis,
          description: formData.synopsis,
          synopsis_anglais: formData.synopsis_anglais,
          admin_comment: formData.admin_comment
        }
      });
      await refreshMovies("Texte du film mis à jour.");
    } catch {
      setMessage("Erreur lors de la mise à jour du texte.");
    }
  }

  async function handleSaveCategories() {
    if (!editingMovie) return;

    try {
      await updateCategoriesMutation.mutateAsync({
        id: editingMovie.id_movie,
        categoryIds: categorySelection
      });
      await refreshMovies("Catégories mises à jour.");
    } catch {
      setMessage("Erreur lors de la mise à jour des catégories.");
    }
  }

  async function handleRejectMovie() {
    if (!editingMovie) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: editingMovie.id_movie,
        selection_status: "refused",
        payload: {
          jury_comment: formData.admin_comment,
          force_transition: true
        }
      });
      await refreshMovies("Film refusé.");
    } catch {
      setMessage("Erreur lors du refus du film.");
    }
  }

  async function handleLaunchVoting() {
    if (!editingMovie) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: editingMovie.id_movie,
        selection_status: "assigned",
        payload: {
          jury_comment: formData.admin_comment,
          force_transition: true
        }
      });
      await refreshMovies("Film lancé en votation.");
    } catch {
      setMessage("Erreur lors du lancement en votation.");
    }
  }

  async function handleNominateFinalist() {
    if (!editingMovie) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: editingMovie.id_movie,
        selection_status: "finalist",
        payload: {
          jury_comment: formData.admin_comment,
          force_transition: true
        }
      });
      await refreshMovies("Film nommé finaliste.");
    } catch {
      setMessage("Erreur lors de la nomination finaliste.");
    }
  }

  async function handleResetVotesAndRelaunch() {
    if (!editingMovie) return;

    try {
      await resetVotesMutation.mutateAsync(editingMovie.id_movie);
      await updateStatusMutation.mutateAsync({
        id: editingMovie.id_movie,
        selection_status: "assigned",
        payload: {
          jury_comment: formData.admin_comment,
          force_transition: true
        }
      });
      await refreshMovies("Votes réinitialisés et votation relancée.");
    } catch {
      setMessage("Erreur lors de la réinitialisation des votes.");
    }
  }

  const allFilteredSelected =
    filteredMovies.length > 0
    && filteredMovies.every((movie) => selectedMovieIds.includes(movie.id_movie));

  return (
    <section className="bg-gradient-to-br from-[#1a1c20]/60 to-[#0f1114]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl shadow-black/30 transition-all duration-300">
      <h1 className="text-2xl font-bold mb-4">Gestion des Films</h1>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Filtrer par titre..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-black/30 border border-white/10 text-white px-3 py-2 rounded-lg text-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-xs"
          >
            {allFilteredSelected ? "Désélectionner tout" : "Tout sélectionner"}
          </button>
          <button
            type="button"
            onClick={() => bulkUpdateSelectionStatus("refused", "Films refusés.")}
            disabled={selectedMovieIds.length === 0 || updateStatusMutation.isPending}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 text-xs"
          >
            Refuser la sélection
          </button>
          <button
            type="button"
            onClick={() => bulkUpdateSelectionStatus("assigned", "Films envoyés en votation.")}
            disabled={selectedMovieIds.length === 0 || updateStatusMutation.isPending}
            className="px-3 py-2 bg-[#AD46FF] text-white rounded-lg hover:bg-[#9536e6] disabled:opacity-50 text-xs"
          >
            Sélectionner pour votation
          </button>
        </div>
      </div>

      {message && <div className="mb-2 text-green-500 text-sm">{message}</div>}

      <div className="overflow-x-auto scrollbar-thin-dark rounded-xl border border-white/10 bg-black/30">
        <table className="min-w-full">
          <thead className="bg-gray-900/70">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllFiltered}
                  className="w-4 h-4 accent-[#AD46FF]"
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Film</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Synopsis</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Statut</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMovies.map((movie) => {
              const isSelected = selectedMovieIds.includes(movie.id_movie);
              const poster = getPoster(movie);
              return (
                <tr key={movie.id_movie} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-3 py-2 align-top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMovieSelection(movie.id_movie)}
                      className="w-4 h-4 accent-[#AD46FF]"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => openDetailsModal(movie)}
                        className="shrink-0 w-14 h-10 rounded overflow-hidden border border-white/10 bg-gray-900"
                        title="Ouvrir les détails"
                      >
                        {poster ? (
                          <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400">Aperçu</span>
                        )}
                      </button>
                      <div>
                        <p className="text-white font-semibold text-sm">{movie.title}</p>
                        <p className="text-[11px] text-gray-400">ID: {movie.id_movie}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <p className="text-xs text-gray-300 line-clamp-3 max-w-[320px]">
                      {movie.synopsis || movie.description || "-"}
                    </p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="inline-flex px-2 py-1 rounded-full text-[11px] bg-white/10 text-white">
                      {movie.selection_status || "submitted"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {paginatedMovies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-400">
                  Aucun film trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {showDetailsModal && editingMovie && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
          <div className="relative z-[10000] bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Détails du film</h2>
              <button
                type="button"
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4 text-sm">
              <div className="col-span-12 lg:col-span-7 space-y-3">
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <h3 className="text-xs uppercase text-gray-400 mb-2">Média</h3>
                  {getPoster(editingMovie) && (
                    <img
                      src={getPoster(editingMovie)}
                      alt={editingMovie.title}
                      className="w-full max-h-56 object-cover rounded border border-gray-800"
                    />
                  )}
                  {getTrailer(editingMovie) && (
                    <a
                      className="inline-block mt-2 text-[#AD46FF] hover:text-[#F6339A]"
                      href={getTrailer(editingMovie)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ouvrir la vidéo uploadée
                    </a>
                  )}
                  {editingMovie.youtube_link && (
                    <a
                      className="inline-block mt-2 ml-3 text-[#AD46FF] hover:text-[#F6339A]"
                      href={editingMovie.youtube_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ouvrir YouTube
                    </a>
                  )}
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <h3 className="text-xs uppercase text-gray-400 mb-2">Producteur lié</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-200">
                    <p><span className="text-gray-400">Nom:</span> {editingMovie?.Producer ? `${editingMovie.Producer.first_name || ""} ${editingMovie.Producer.last_name || ""}`.trim() : "-"}</p>
                    <p><span className="text-gray-400">ID user:</span> {editingMovie?.Producer?.id_user || "-"}</p>
                    <p><span className="text-gray-400">Film ID:</span> {editingMovie.id_movie}</p>
                    <p><span className="text-gray-400">Statut:</span> {editingMovie.selection_status || "submitted"}</p>
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <h3 className="text-xs uppercase text-gray-400 mb-2">Votation</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-950 border border-gray-800 rounded p-2">
                      <p className="text-xs text-gray-400">Votes</p>
                      <p className="text-white font-semibold">{voteStatsByMovie[editingMovie.id_movie]?.count || 0}</p>
                    </div>
                    <div className="bg-gray-950 border border-gray-800 rounded p-2">
                      <p className="text-xs text-gray-400">Moyenne</p>
                      <p className="text-white font-semibold">
                        {voteStatsByMovie[editingMovie.id_movie]?.count > 0
                          ? voteStatsByMovie[editingMovie.id_movie].average.toFixed(2)
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleRejectMovie}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                      Refuser le film
                    </button>
                    <button
                      type="button"
                      onClick={handleLaunchVoting}
                      className="px-3 py-2 bg-[#AD46FF] text-white rounded hover:bg-[#9536e6]"
                    >
                      Lancer la votation
                    </button>
                    <button
                      type="button"
                      onClick={handleNominateFinalist}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                    >
                      Nommer finaliste
                    </button>
                    <button
                      type="button"
                      onClick={handleResetVotesAndRelaunch}
                      className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-500"
                    >
                      Reset vote + relancer
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 space-y-3">
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-3">
                  <h3 className="text-xs uppercase text-gray-400">Textes & commentaire</h3>
                  <div>
                    <label className="block text-gray-300 mb-1">Titre</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Synopsis FR</label>
                    <textarea
                      rows={4}
                      value={formData.synopsis}
                      onChange={(e) => setFormData((prev) => ({ ...prev, synopsis: e.target.value }))}
                      className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Synopsis EN</label>
                    <textarea
                      rows={3}
                      value={formData.synopsis_anglais}
                      onChange={(e) => setFormData((prev) => ({ ...prev, synopsis_anglais: e.target.value }))}
                      className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Commentaire admin</label>
                    <textarea
                      rows={3}
                      value={formData.admin_comment}
                      onChange={(e) => setFormData((prev) => ({ ...prev, admin_comment: e.target.value }))}
                      className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveTexts}
                    className="w-full px-4 py-2 bg-[#AD46FF] text-white rounded hover:bg-[#9536e6]"
                  >
                    Enregistrer les textes
                  </button>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                  <h3 className="text-xs uppercase text-gray-400 mb-2">Catégories</h3>
                  <div className="space-y-2 max-h-52 overflow-auto">
                    {categories.map((category) => {
                      const checked = categorySelection.includes(category.id_categorie);
                      return (
                        <label key={category.id_categorie} className="flex items-center gap-2 text-gray-200 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setCategorySelection((prev) =>
                                checked
                                  ? prev.filter((id) => id !== category.id_categorie)
                                  : [...prev, category.id_categorie]
                              );
                            }}
                            className="w-4 h-4 accent-[#AD46FF]"
                          />
                          {category.name}
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCategories}
                    className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Changer catégorie
                  </button>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-xs text-gray-300 space-y-1">
                  <p><span className="text-gray-400">Langue:</span> {editingMovie.main_language || "-"}</p>
                  <p><span className="text-gray-400">Durée:</span> {editingMovie.duration || "-"}</p>
                  <p><span className="text-gray-400">Année:</span> {editingMovie.release_year || "-"}</p>
                  <p><span className="text-gray-400">Nationalité:</span> {editingMovie.nationality || "-"}</p>
                  <p><span className="text-gray-400">AI Tool:</span> {editingMovie.ai_tool || "-"}</p>
                  <p><span className="text-gray-400">Production:</span> {editingMovie.production || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

export default Videos;