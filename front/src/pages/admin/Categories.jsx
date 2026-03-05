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
  
  // États pour les modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // État pour le tutoriel
  const [showTutorial, setShowTutorial] = useState(false);

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
      setShowCreateModal(false);
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
      setShowEditModal(false);
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
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setFeedback({ type: "success", message: "Catégorie supprimée avec succès" });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      const message = err?.response?.data?.error || "Erreur lors de la suppression";
      setFeedback({ type: "error", message });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    createCategoryMutation.mutate(categoryName.trim());
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim() || !editingCategory) return;
    updateCategoryMutation.mutate({ 
      id: editingCategory.id_categorie, 
      name: categoryName.trim() 
    });
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id_categorie);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryToDelete(null);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm text-white/70">Chargement des catégories...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 text-red-400">
          Une erreur est survenue : {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] via-[#0c0e11] to-[#0d0f12] text-white pt-8 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header avec bouton d'aide */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-white">
              Gestion des Catégories
            </h1>
            <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">
              {categories.length} catégorie{categories.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          {/* Bouton d'aide */}
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

        {/* Tutorial - Version compacte et élégante */}
        {showTutorial && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white/90 mb-2">Comment gérer les catégories ?</h3>
                <ul className="space-y-1.5 text-xs text-white/60">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Créez une catégorie avec un nom clair et unique.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Utilisez Modifier pour corriger les noms existants.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Supprimez une catégorie uniquement si elle n'est plus utilisée.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Vérifiez le message de confirmation après chaque action.</span>
                  </li>
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

        {/* Bouton Créer - avec effet glass violet */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm rounded-lg hover:bg-purple-500/20 transition-colors"
          >
            + Nouvelle catégorie
          </button>
        </div>

        {/* Liste des catégories - avec lignes de séparation */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* Header avec compteur */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light text-white/90">Catégories existantes</h2>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/40">
                {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Liste des catégories */}
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-12 h-12 text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-white/40 text-sm">Aucune catégorie pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {categories.map((category, index) => (
                <div
                  key={category.id_categorie}
                  className="px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40 w-6">{index + 1}.</span>
                    <h3 className="text-sm font-medium text-white">{category.name}</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Bouton Modifier - effet glass bleu */}
                    <button
                      onClick={() => openEditModal(category)}
                      className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      Modifier
                    </button>
                    {/* Bouton Supprimer - effet glass rouge */}
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg hover:bg-red-500/20 transition-colors"
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

      {/* MODAL CRÉATION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-gradient-to-br from-[#1a1c20] to-[#0f1114] border border-white/10 rounded-xl w-full max-w-md shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light text-white">Créer une catégorie</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="mb-4">
                  <label className="block text-xs text-white/40 mb-2">Nom de la catégorie</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Ex: Fiction, Animation, Documentaire..."
                    className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder:text-white/30"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  {/* Bouton Annuler - effet glass gris */}
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 text-xs rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Annuler
                  </button>
                  {/* Bouton Créer - effet glass violet */}
                  <button
                    type="submit"
                    disabled={!categoryName.trim()}
                    className="flex-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFICATION */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => closeModals()}>
          <div className="bg-gradient-to-br from-[#1a1c20] to-[#0f1114] border border-white/10 rounded-xl w-full max-w-md shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light text-white">Modifier la catégorie</h2>
                <button
                  onClick={() => closeModals()}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-xs text-white/40 mb-2">Nom de la catégorie</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  {/* Bouton Annuler - effet glass gris */}
                  <button
                    type="button"
                    onClick={() => closeModals()}
                    className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 text-xs rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Annuler
                  </button>
                  {/* Bouton Modifier - effet glass bleu */}
                  <button
                    type="submit"
                    disabled={!categoryName.trim()}
                    className="flex-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                  >
                    Modifier
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => closeModals()}>
          <div className="bg-gradient-to-br from-[#1a1c20] to-[#0f1114] border border-white/10 rounded-xl w-full max-w-md shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                
                <h2 className="text-lg font-semibold text-white mb-2">Confirmer la suppression</h2>
                <p className="text-sm text-white/60 mb-6">
                  Êtes-vous sûr de vouloir supprimer la catégorie <span className="text-white font-medium">"{categoryToDelete.name}"</span> ?
                </p>
                
                <div className="flex gap-2">
                  {/* Bouton Annuler - effet glass gris */}
                  <button
                    onClick={() => closeModals()}
                    className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 text-xs rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Annuler
                  </button>
                  {/* Bouton Supprimer - effet glass rouge */}
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;