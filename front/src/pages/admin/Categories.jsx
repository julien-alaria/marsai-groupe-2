/**
 * Composant Categories (Gestion des Catégories)
 * Page administrateur pour créer, modifier et supprimer les catégories
 * @returns {JSX.Element} La page de gestion des catégories
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../api/videos.js";
import TutorialBox from "../../components/TutorialBox.jsx";

function Categories() {
  const queryClient = useQueryClient();
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = data?.data || [];

  const createCategoryMutation = useMutation({
    mutationFn: (name) => createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryName("");
      setFeedback({ type: "success", message: "Catégorie créée avec succès" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      const message = err?.response?.data?.error || "Erreur lors de la création";
      setFeedback({ type: "error", message });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }) => updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      setCategoryName("");
      setFeedback({ type: "success", message: "Catégorie modifiée avec succès" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      const message = err?.response?.data?.error || "Erreur lors de la modification";
      setFeedback({ type: "error", message });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setFeedback({ type: "success", message: "Catégorie supprimée avec succès" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      const message = err?.response?.data?.error || "Erreur lors de la suppression";
      setFeedback({ type: "error", message });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id_categorie, name: categoryName.trim() });
    } else {
      createCategoryMutation.mutate(categoryName.trim());
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName("");
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white p-8">
        <div className="text-gray-300">Chargement en cours...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white p-8">
        <div className="text-red-300">Une erreur est survenue : {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
            Gestion des Catégories
          </h1>
          <p className="text-gray-400 mt-2">
            Créez, modifiez et supprimez les catégories de films
          </p>
        </div>

        <div className="mb-8">
          <TutorialBox
            title="Tutoriel — Gestion des catégories"
            steps={[
              "Créez une catégorie avec un nom clair et unique.",
              "Utilisez Modifier pour corriger les noms existants.",
              "Supprimez une catégorie uniquement si elle n'est plus utilisée.",
              "Vérifiez le message de confirmation après chaque action."
            ]}
            defaultOpen={false}
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border ${
              feedback.type === "success"
                ? "bg-green-900/30 border-green-600 text-green-300"
                : "bg-red-900/30 border-red-600 text-red-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? "Modifier la catégorie" : "Créer une nouvelle catégorie"}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nom de la catégorie"
              className="flex-1 bg-gray-950 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD46FF]"
            />
            <button
              type="submit"
              disabled={!categoryName.trim()}
              className="px-6 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingCategory ? "Modifier" : "Créer"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Annuler
              </button>
            )}
          </form>
        </div>

        {/* List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Catégories existantes</h2>
          {categories.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune catégorie pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id_categorie}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-[#AD46FF]/50 transition"
                >
                  <div>
                    <h3 className="text-white font-semibold">{category.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-3 py-1.5 bg-blue-600/80 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
                          deleteCategoryMutation.mutate(category.id_categorie);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600/80 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;
