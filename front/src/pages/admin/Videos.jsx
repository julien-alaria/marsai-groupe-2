import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
/**
 * Composant Videos (Gestion des Vidéos Admin)
 * Page administrateur pour gérer les vidéos du système
 * Fonctionnalités CRUD complètes: Créer, Lire, Mettre à jour, Supprimer
 * Utilise react-hook-form avec validation Zod
 * Utilise TanStack Query (useMutation) pour les opérations CRUD
 * @returns {JSX.Element} La page de gestion des vidéos avec tableau et modales
 */
import {
  getVideos,
  updateMovieStatus,
  sendRejectEmailForMovie,
  updateMovie,
  deleteMovie
} from "../../api/videos";
import { getVotes } from "../../api/votes";
import { getAwards, createAward, deleteAward } from "../../api/awards";

import GlassTableBody from "../../components/admin/GlassTableBody.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import { VideoPreview } from "../../components/VideoPreview.jsx";

function Videos() {

    // Schéma de validation pour la création d'un film
    const createMovieSchema = z.object({
      title: z.string().min(1, "Le titre est requis"),
      synopsis: z.string().optional(),
      url: z.string().url("URL invalide"),
    });

    // Schéma de validation pour la modification d'un film
    const updateMovieSchema = z.object({
      title: z.string().min(1, "Le titre est requis"),
      synopsis: z.string().optional(),
      url: z.string().url("URL invalide"),
    });

    const queryClient = useQueryClient();
    const [movies, setMovies] = useState([]);
    const [filter, setFilter] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [movieToDelete, setMovieToDelete] = useState(null);
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusTarget, setStatusTarget] = useState("submitted");
    const [awardName, setAwardName] = useState("");
    const uploadBase = "http://localhost:3000/uploads";

    // Fetch movies
    const { data, refetch } = useQuery({
      queryKey: ["movies"],
      queryFn: getVideos,
    });

    const { data: votesData } = useQuery({
      queryKey: ["votes"],
      queryFn: getVotes,
    });

    const { data: awardsData } = useQuery({
      queryKey: ["awards"],
      queryFn: getAwards,
    });

    useEffect(() => {
      if (data?.data) setMovies(data.data);
    }, [data]);

    useEffect(() => {
      if (!showEditModal || !editingMovie || !data?.data) return;
      const refreshed = data.data.find((movie) => movie.id_movie === editingMovie.id_movie);
      if (refreshed) {
        setEditingMovie(refreshed);
      }
    }, [data, showEditModal, editingMovie]);

    // Filtrage
    const filteredMovies = useMemo(() => {
      return movies.filter((movie) =>
        movie.title.toLowerCase().includes(filter.toLowerCase())
      );
    }, [movies, filter]);

    // Pagination
    const paginatedMovies = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return filteredMovies.slice(start, start + itemsPerPage);
    }, [filteredMovies, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
      return Math.max(1, Math.ceil(filteredMovies.length / itemsPerPage));
    }, [filteredMovies.length, itemsPerPage]);

    const voteStatsByMovie = useMemo(() => {
      const votes = votesData?.data || [];
      const stats = {};

      votes.forEach((vote) => {
        if (!stats[vote.id_movie]) {
          stats[vote.id_movie] = { count: 0, sum: 0, average: 0 };
        }

        const numeric = parseFloat(vote.note);
        if (!Number.isNaN(numeric)) {
          stats[vote.id_movie].count += 1;
          stats[vote.id_movie].sum += numeric;
          stats[vote.id_movie].average = stats[vote.id_movie].sum / stats[vote.id_movie].count;
        }
      });

      return stats;
    }, [votesData]);

    const awardsByMovie = useMemo(() => {
      const awards = awardsData?.data || [];
      return awards.reduce((acc, award) => {
        if (!acc[award.id_movie]) {
          acc[award.id_movie] = [];
        }
        acc[award.id_movie].push(award);
        return acc;
      }, {});
    }, [awardsData]);

    // Formulaires
    const createForm = useForm({
      resolver: zodResolver(createMovieSchema),
      defaultValues: { title: "", synopsis: "", url: "" },
    });
    const editForm = useForm({
      resolver: zodResolver(updateMovieSchema),
      defaultValues: { title: "", synopsis: "", url: "" },
    });

    // Mutations
    // (Remarque: la création n'est pas implémentée car l'API n'a pas createMovie)
    const updateMutation = useMutation({
      mutationFn: async ({ id, movieData }) => updateMovie(id, movieData),
      onSuccess: () => {
        setMessage("Film modifié avec succès");
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      },
      onError: () => setMessage("Erreur lors de la modification du film"),
    });

    const updateStatusMutation = useMutation({
      mutationFn: async ({ id, selection_status }) => updateMovieStatus(id, selection_status),
      onSuccess: () => {
        setMessage("Statut de votation mis à jour");
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      },
      onError: () => setMessage("Erreur lors du changement de statut"),
    });

    const sendRejectEmailMutation = useMutation({
      mutationFn: async (id_movie) => sendRejectEmailForMovie(id_movie),
      onSuccess: () => {
        setMessage("Email de refus envoyé au réalisateur");
      },
      onError: () => setMessage("Erreur lors de l'envoi de l'email de refus"),
    });

    const createAwardMutation = useMutation({
      mutationFn: async ({ id_movie, name }) => createAward(id_movie, name),
      onSuccess: () => {
        setMessage("Prix attribué avec succès");
        setAwardName("");
        queryClient.invalidateQueries({ queryKey: ["awards"] });
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      },
      onError: () => setMessage("Erreur lors de l'attribution du prix"),
    });

    const deleteAwardMutation = useMutation({
      mutationFn: async (id_award) => deleteAward(id_award),
      onSuccess: () => {
        setMessage("Prix supprimé avec succès");
        queryClient.invalidateQueries({ queryKey: ["awards"] });
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      },
      onError: () => setMessage("Erreur lors de la suppression du prix"),
    });

    const deleteMutation = useMutation({
      mutationFn: async (id) => deleteMovie(id),
      onSuccess: () => {
        setMessage("Film supprimé avec succès");
        setShowDeleteConfirm(false);
        setMovieToDelete(null);
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      },
      onError: () => setMessage("Erreur lors de la suppression du film"),
    });

    // Handlers
    function handleEdit(movie) {
      setEditingMovie(movie);
      editForm.reset({
        title: movie.title,
        synopsis: movie.synopsis || "",
        url: movie.url,
      });
      setStatusTarget(movie.selection_status || "submitted");
      setAwardName("");
      setShowEditModal(true);
    }

    function handleDelete(movie) {
      setMovieToDelete(movie);
      setShowDeleteConfirm(true);
    }

    function confirmDelete() {
      if (movieToDelete) deleteMutation.mutate(movieToDelete.id_movie);
    }

    function getPoster(movie) {
      if (!movie) return null;
      return movie.thumbnail || movie.display_picture || movie.picture1 || movie.picture2 || movie.picture3 || null;
    }

    function getTrailer(movie) {
      if (!movie) return null;
      return movie.trailer || movie.trailer_video || movie.trailerVideo || movie.filmFile || movie.video || null;
    }

    function cancelDelete() {
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
    }

    function handleChangeStatus() {
      if (!editingMovie) return;
      updateStatusMutation.mutate({ id: editingMovie.id_movie, selection_status: statusTarget });
    }

    function handleAddAward() {
      if (!editingMovie || !awardName.trim()) return;
      createAwardMutation.mutate({ id_movie: editingMovie.id_movie, name: awardName.trim() });
    }

    const movieVotes = useMemo(() => {
      if (!editingMovie) return [];
      const votes = votesData?.data || [];
      return votes.filter((vote) => vote.id_movie === editingMovie.id_movie);
    }, [votesData, editingMovie]);

    const movieAwards = useMemo(() => {
      if (!editingMovie) return [];
      return awardsByMovie[editingMovie.id_movie] || [];
    }, [awardsByMovie, editingMovie]);

    // Table columns for GlassTableBody
    const columns = [
      {
        key: "title",
        render: (movie) => (
          <span className="font-semibold text-white">{movie.title}</span>
        ),
      },
      {
        key: "synopsis",
        render: (movie) => (
          <span className="text-xs text-gray-400 line-clamp-2 max-w-[200px]">{movie.synopsis}</span>
        ),
      },
      {
        key: "url",
        render: (movie) => (
          <a href={movie.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lien</a>
        ),
      },
      {
        key: "actions",
        render: (movie) => (
          <div className="flex gap-1 items-center">
            <button
              className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded hover:bg-yellow-400/20 border border-yellow-400/20 transition-colors"
              title="Modifier"
              onClick={() => handleEdit(movie)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 border border-red-500/20 transition-colors"
              title="Supprimer"
              onClick={() => handleDelete(movie)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ];

    // Render
    return (
      <section className="bg-gradient-to-br from-[#1a1c20]/60 to-[#0f1114]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl shadow-black/30 transition-all duration-300">
        <h1 className="text-2xl font-bold mb-4">Gestion des Films</h1>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Filtrer par titre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black/30 border border-white/10 text-white px-3 py-2 rounded-lg text-xs"
          />
        </div>
        {message && <div className="mb-2 text-green-600">{message}</div>}
        <div className="overflow-x-auto scrollbar-thin-dark rounded-xl border border-white/10 bg-black/30">
          <table className="min-w-full">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Titre</th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Synopsis</th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">URL</th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Actions</th>
              </tr>
            </thead>
            <GlassTableBody data={paginatedMovies} columns={columns} />
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
        {/* Edit Modal */}
        {showEditModal && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
            <div className="relative z-[10000] bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Modifier le film</h2>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid grid-cols-12 gap-3 text-[12px]">
                <div className="col-span-12 xl:col-span-7 space-y-3">
                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                    <h4 className="text-xs uppercase text-gray-400 mb-2">Prévisualisation</h4>
                    {(getTrailer(editingMovie) || editingMovie?.youtube_link) ? (
                      <div className="aspect-video h-[210px]">
                        {getTrailer(editingMovie) ? (
                          <VideoPreview
                            title={editingMovie?.title}
                            src={`${uploadBase}/${getTrailer(editingMovie)}`}
                            poster={getPoster(editingMovie) ? `${uploadBase}/${getPoster(editingMovie)}` : undefined}
                            openMode="fullscreen"
                            modalPlacement="bottom"
                            modalTopOffsetClass="top-20 left-0 right-0 bottom-0"
                          />
                        ) : (
                          <a
                            className="text-[#AD46FF] hover:text-[#F6339A] font-semibold"
                            href={editingMovie?.youtube_link}
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
                    <h4 className="text-xs uppercase text-gray-400 mb-2">Statut de votation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                        <p className="text-[11px] text-gray-400">Votes</p>
                        <p className="text-white font-semibold">{voteStatsByMovie[editingMovie?.id_movie]?.count || 0}</p>
                      </div>
                      <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                        <p className="text-[11px] text-gray-400">Moyenne</p>
                        <p className="text-white font-semibold">
                          {voteStatsByMovie[editingMovie?.id_movie]?.count > 0
                            ? voteStatsByMovie[editingMovie.id_movie].average.toFixed(2)
                            : "-"}
                        </p>
                      </div>
                      <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                        <p className="text-[11px] text-gray-400">Sélection</p>
                        <p className="text-white font-semibold">{editingMovie?.selection_status || "submitted"}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <select
                        value={statusTarget}
                        onChange={(e) => setStatusTarget(e.target.value)}
                        className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full"
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
                        onClick={handleChangeStatus}
                        disabled={updateStatusMutation.isPending}
                        className="px-4 py-2 bg-[#AD46FF] text-white rounded hover:bg-[#9536e6] disabled:opacity-50"
                      >
                        Mettre à jour
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStatusTarget("candidate")}
                        className="px-3 py-2 bg-blue-600/80 text-white rounded hover:bg-blue-600"
                      >
                        Candidater
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusTarget("awarded")}
                        className="px-3 py-2 bg-green-600/80 text-white rounded hover:bg-green-600"
                      >
                        Marquer primé
                      </button>
                    </div>

                    {editingMovie?.selection_status === "refused" && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => sendRejectEmailMutation.mutate(editingMovie.id_movie)}
                          disabled={sendRejectEmailMutation.isPending}
                          className="w-full px-3 py-2 bg-red-600/80 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {sendRejectEmailMutation.isPending
                            ? "Envoi en cours..."
                            : "Envoyer email de refus"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                    <h4 className="text-xs uppercase text-gray-400 mb-2">Votations effectuées</h4>
                    {movieVotes.length === 0 ? (
                      <p className="text-gray-500">Aucun vote pour ce film.</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-auto pr-1">
                        {movieVotes.map((vote) => (
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

                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                    <h4 className="text-xs uppercase text-gray-400 mb-2">Prix & candidature</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={awardName}
                        onChange={(e) => setAwardName(e.target.value)}
                        placeholder="Nom du prix"
                        className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full"
                      />
                      <button
                        type="button"
                        onClick={handleAddAward}
                        disabled={!awardName.trim() || createAwardMutation.isPending}
                        className="px-4 py-2 bg-yellow-600/80 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Ajouter
                      </button>
                    </div>

                    <div className="mt-2 space-y-2">
                      {movieAwards.length === 0 ? (
                        <p className="text-gray-500">Aucun prix attribué.</p>
                      ) : (
                        movieAwards.map((award) => (
                          <div key={award.id_award} className="bg-gray-950 border border-gray-800 rounded-lg p-2 flex items-center justify-between">
                            <span className="text-yellow-200 text-xs">🏆 {award.award_name}</span>
                            <button
                              type="button"
                              onClick={() => deleteAwardMutation.mutate(award.id_award)}
                              className="px-2 py-1 text-xs bg-red-600/80 text-white rounded hover:bg-red-600"
                            >
                              Supprimer
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-12 xl:col-span-5">
                  <form onSubmit={editForm.handleSubmit((formData) => updateMutation.mutate({ id: editingMovie.id_movie, movieData: formData }))} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-3">
                    <div>
                      <label className="block mb-1 text-gray-300">Titre</label>
                      <input {...editForm.register("title")} className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full" />
                      {editForm.formState.errors.title && <span className="text-red-400 text-xs">{editForm.formState.errors.title.message}</span>}
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-300">Synopsis</label>
                      <textarea {...editForm.register("synopsis")} rows={4} className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full" />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-300">URL</label>
                      <input {...editForm.register("url")} className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded w-full" />
                      {editForm.formState.errors.url && <span className="text-red-400 text-xs">{editForm.formState.errors.url.message}</span>}
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700"
                        onClick={() => {
                          setShowEditModal(false);
                          editForm.reset();
                          setEditingMovie(null);
                        }}
                      >
                        Fermer
                      </button>
                      <button type="submit" className="px-4 py-2 bg-[#AD46FF] text-white rounded hover:bg-[#9536e6]">Enregistrer</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
        {/* Delete Confirm Modal */}
        {showDeleteConfirm && createPortal(
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
            <div className="relative z-[10000] bg-gray-950 border border-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-sm">
              <h2 className="text-xl font-bold mb-3 text-white">Confirmer la suppression</h2>
              <p className="text-gray-300 text-sm">Voulez-vous vraiment supprimer le film "{movieToDelete?.title}" ?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700" onClick={cancelDelete}>Annuler</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500" onClick={confirmDelete}>Supprimer</button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </section>
    );
}

export default Videos;
