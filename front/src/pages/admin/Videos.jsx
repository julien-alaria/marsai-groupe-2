import React, { useState, useEffect, useMemo } from "react";
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
  updateMovie,
  deleteMovie
} from "../../api/videos";

import GlassTableBody from "../../components/admin/GlassTableBody.jsx";
import Pagination from "../../components/admin/Pagination.jsx";

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

    // Fetch movies
    const { data, refetch } = useQuery({
      queryKey: ["movies"],
      queryFn: getVideos,
    });

    useEffect(() => {
      if (data?.data) setMovies(data.data);
    }, [data]);

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
        setShowEditModal(false);
        editForm.reset();
        setEditingMovie(null);
        refetch();
      },
      onError: () => setMessage("Erreur lors de la modification du film"),
    });

    const deleteMutation = useMutation({
      mutationFn: async (id) => deleteMovie(id),
      onSuccess: () => {
        setMessage("Film supprimé avec succès");
        setShowDeleteConfirm(false);
        setMovieToDelete(null);
        refetch();
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
      setShowEditModal(true);
    }

    function handleDelete(movie) {
      setMovieToDelete(movie);
      setShowDeleteConfirm(true);
    }

    function confirmDelete() {
      if (movieToDelete) deleteMutation.mutate(movieToDelete.id_movie);
    }

    function cancelDelete() {
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
    }

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
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Modifier le film</h2>
              <form onSubmit={editForm.handleSubmit((data) => updateMutation.mutate({ id: editingMovie.id_movie, movieData: data }))} className="space-y-3">
                <div>
                  <label className="block mb-1">Titre</label>
                  <input {...editForm.register("title")} className="border px-2 py-1 rounded w-full" />
                  {editForm.formState.errors.title && <span className="text-red-500 text-xs">{editForm.formState.errors.title.message}</span>}
                </div>
                <div>
                  <label className="block mb-1">Synopsis</label>
                  <textarea {...editForm.register("synopsis")} className="border px-2 py-1 rounded w-full" />
                </div>
                <div>
                  <label className="block mb-1">URL</label>
                  <input {...editForm.register("url")} className="border px-2 py-1 rounded w-full" />
                  {editForm.formState.errors.url && <span className="text-red-500 text-xs">{editForm.formState.errors.url.message}</span>}
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowEditModal(false)}>Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirm Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
              <p>Voulez-vous vraiment supprimer le film \"{movieToDelete?.title}\" ?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={cancelDelete}>Annuler</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDelete}>Supprimer</button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
}

export default Videos;
