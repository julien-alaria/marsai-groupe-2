import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
/**
 * Composant Categories (Gestion des Catégories)
 * Page admin pour gérer les catégories de films.
 * Utilise le style e i colori della dashboard admin, awards.jsx e users.jsx.
 * Utilise TanStack Query pour CRUD, modale per aggiunta/modifica, layout full-page.
 */
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../api/videos";
import GlassTableBody from "../../components/admin/GlassTableBody.jsx";
import Pagination from "../../components/admin/Pagination.jsx";


function Categories() {
  const categorySchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
  });

  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Query
  const { data, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const filteredCategories = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(cat => cat.name.toLowerCase().includes(filter.toLowerCase()));
  }, [data, filter]);

  // Pagination
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  }, [filteredCategories.length, itemsPerPage]);

  // Form
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (cat) => createCategory(cat.name),
    onSuccess: () => { setMessage("Catégorie ajoutée"); setShowModal(false); form.reset(); refetch(); },
    onError: () => setMessage("Erreur lors de l'ajout"),
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => updateCategory(id, name),
    onSuccess: () => { setMessage("Catégorie modifiée"); setShowModal(false); setEditingCategory(null); form.reset(); refetch(); },
    onError: () => setMessage("Erreur lors de la modification"),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => deleteCategory(id),
    onSuccess: () => { setMessage("Catégorie supprimée"); refetch(); },
    onError: () => setMessage("Erreur lors de la suppression"),
  });

  // Handlers
  function handleEdit(cat) {
    setEditingCategory(cat);
    form.reset({ name: cat.name });
    setShowModal(true);
  }
  function handleDelete(cat) {
    if (window.confirm("Supprimer cette catégorie ?")) deleteMutation.mutate(cat.id_categorie);
  }
  function handleSubmit(data) {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id_categorie, name: data.name });
    } else {
      createMutation.mutate(data);
    }
  }
  function handleAdd() {
    setEditingCategory(null);
    form.reset({ name: "" });
    setShowModal(true);
  }

  // Table columns for GlassTableBody
  const columns = [
    {
      key: "name",
      render: (cat) => (
        <span className="font-semibold text-white">{cat.name}</span>
      ),
    },
    {
      key: "actions",
      render: (cat) => (
        <div className="flex gap-1 items-center">
          <button
            className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded hover:bg-yellow-400/20 border border-yellow-400/20 transition-colors"
            title="Modifier"
            onClick={() => handleEdit(cat)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 border border-red-500/20 transition-colors"
            title="Supprimer"
            onClick={() => handleDelete(cat)}
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
      <h1 className="text-2xl font-bold mb-4">Gestion des Catégories</h1>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Filtrer par nom..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-black/30 border border-white/10 text-white px-3 py-2 rounded-lg text-xs"
        />
        <button
          className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white rounded-lg font-semibold border border-blue-500/30 shadow hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] transition-all duration-200"
          onClick={handleAdd}
        >
          Ajouter
        </button>
      </div>
      {message && <div className="mb-4 text-green-400 text-center">{message}</div>}
      <div className="overflow-x-auto scrollbar-thin-dark rounded-xl border border-white/10 bg-black/30">
        <table className="min-w-full">
          <thead className="bg-gray-900/70">
            <tr>
              <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Nom</th>
              <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Actions</th>
            </tr>
          </thead>
          <GlassTableBody data={paginatedCategories} columns={columns} />
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#23272f] border border-[#393950] rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 text-center">{editingCategory ? "Modifier" : "Ajouter"} une catégorie</h2>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nom</label>
                <input {...form.register("name")} className="w-full bg-[#18181b] border border-[#393950] text-white px-3 py-2 rounded-lg" />
                {form.formState.errors.name && <span className="text-red-400 text-xs">{form.formState.errors.name.message}</span>}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white rounded-lg font-semibold">{editingCategory ? "Enregistrer" : "Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Categories;
