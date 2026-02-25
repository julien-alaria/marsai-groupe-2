/**
 * Composant Users (Gestion des Utilisateurs Admin)
 * Page administrateur pour gérer les utilisateurs du système
 * Fonctionnalités CRUD complètes: Créer, Lire, Mettre à jour, Supprimer
 * Utilise react-hook-form avec validation Zod
 * Utilise TanStack Query (useMutation) pour les opérations CRUD
 * @returns {JSX.Element} La page de gestion des utilisateurs avec tableau et modales
 */
import { useEffect, useState, useMemo } from "react";
import { deleteUser, getUsers, updateUser, createUser } from "../../api/users.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Pagination from "../../components/admin/Pagination.jsx"; 
import TutorialBox from "../../components/TutorialBox.jsx";
import { loadTutorialSteps } from "../../utils/tutorialLoader.js";


/**
 * Schéma de validation pour la création d'un utilisateur
 * Champs requis: prénom, nom, email (valide), mot de passe (min 6 caractères)
 * Rôle par défaut: PRODUCER
 */
const createUserSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum(["ADMIN", "JURY", "PRODUCER"]).default("PRODUCER"),
});

/**
 * Schéma de validation pour la modification d'un utilisateur
 * Mot de passe optionnel pour permettre les modifications sans changer le mot de passe
 */
const updateUserSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "JURY", "PRODUCER"]),
});

/**
 * Fonction Users
 * Gère l'affichage et la manipulation des utilisateurs
 * - Affiche une liste de tous les utilisateurs dans un tableau
 * - Permet de créer, modifier et supprimer des utilisateurs
 * - Utilise des modales pour les formulaires de création et modification
 * @returns {JSX.Element} La page de gestion des utilisateurs
 */
function Users() {
    const [tutorial, setTutorial] = useState({ title: "Tutoriel", steps: [] });

    useEffect(() => {
      async function fetchTutorial() {
        try {
          const tutorialData = await loadTutorialSteps("/src/pages/admin/TutorialUsers.fr.md");
          setTutorial(tutorialData);
        } catch (err) {
          setTutorial({ title: "Tutoriel", steps: ["Impossible de charger le tutoriel."] });
        }
      }
      fetchTutorial();
    }, []);
  // État pour stocker la liste des utilisateurs
  const [users, setUsers] = useState([]);
  // État pour afficher/masquer la modale de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  // État pour afficher/masquer la modale de modification
  const [showEditModal, setShowEditModal] = useState(false);
  // État pour afficher/masquer la modale de confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // État pour stocker l'utilisateur en cours de modification
  const [editingUser, setEditingUser] = useState(null);
  // État pour stocker l'utilisateur à supprimer
  const [userToDelete, setUserToDelete] = useState(null);
  // État pour afficher les messages de succès/erreur
  const [message, setMessage] = useState("");

  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /**
   * Effect - Charge la liste des utilisateurs au montage du composant
   */
  useEffect(() => {
    getUsers().then((data) => {
      setUsers(data.data);
    });
  }, []);

  /**
   * Calcul des données paginées
   */
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
  }, [users, currentPage, itemsPerPage]);

  /**
   * Calcul du nombre total de pages
   */
  const totalPages = useMemo(() => {
    return Math.ceil(users.length / itemsPerPage);
  }, [users.length, itemsPerPage]);

  /**
   * Calcul des informations d'affichage
   */
  const displayInfo = useMemo(() => {
    const totalUsers = users.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(currentPage * itemsPerPage, totalUsers);
    
    return {
      start: totalUsers > 0 ? startIndex + 1 : 0,
      end: endIndex,
      total: totalUsers
    };
  }, [users.length, currentPage, itemsPerPage]);

  /**
   * Gère le changement de page
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Gère le changement du nombre d'éléments par page
   */
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Retour à la première page
  };

  /**
   * Formulaire React Hook Form pour la création d'utilisateur
   * Applique la validation du schéma createUserSchema avec Zod
   */
  const createForm = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: { 
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "PRODUCER" 
    },
  });

  /**
   * Formulaire React Hook Form pour la modification d'utilisateur
   * Applique la validation du schéma updateUserSchema avec Zod
   */
  const editForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { 
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "PRODUCER" 
    },
  });

  /**
   * Mutation TanStack Query pour créer un utilisateur
   * Appelle createUser de l'API, réinitialise le formulaire et rafraîchit la liste
   */
  const createMutation = useMutation({
    mutationFn: async (newUser) => {
      return await createUser(newUser);
    },
    onSuccess: (data) => {
      setMessage("Utilisateur créé avec succès");
      setShowCreateModal(false);
      createForm.reset();
      // Rafraîchit la liste des utilisateurs
      getUsers().then((data) => setUsers(data.data));
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (error) => {
      setMessage(error.response?.data?.error || "Erreur lors de la création de l'utilisateur");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  /**
   * Mutation TanStack Query pour modifier un utilisateur
   * Appelle updateUser de l'API, réinitialise le formulaire et rafraîchit la liste
   */
  const updateMutation = useMutation({
    mutationFn: async ({ id, userData }) => {
      return await updateUser(id, userData);
    },
    onSuccess: (data) => {
      setMessage("Utilisateur mis à jour avec succès");
      setShowEditModal(false);
      setEditingUser(null);
      editForm.reset();
      // Rafraîchit la liste des utilisateurs
      getUsers().then((data) => setUsers(data.data));
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (error) => {
      setMessage(error.response?.data?.error || "Erreur lors de la mise à jour");
      setTimeout(() => setMessage(""), 3000);
    },
  });

  /**
   * Mutation TanStack Query pour supprimer un utilisateur
   * Appelle deleteUser de l'API et rafraîchit la liste
   */
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteUser(id);
    },
    onSuccess: () => {
      setMessage("Utilisateur supprimé avec succès");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      // Rafraîchit la liste des utilisateurs
      getUsers().then((data) => setUsers(data.data));
      setTimeout(() => setMessage(""), 3000);
    },
    onError: (error) => {
      setMessage(error.response?.data?.error || "Erreur lors de la suppression");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setTimeout(() => setMessage(""), 3000);
    },
  });

  /**
   * Fonction handleDelete
   * Ouvre la modale de confirmation avant de supprimer un utilisateur
   * @param {number} id - L'ID de l'utilisateur à supprimer
   * @param {string} name - Le nom de l'utilisateur à supprimer
   */
  function handleDelete(id, name) {
    setUserToDelete({ id, name });
    setShowDeleteConfirm(true);
  }

  /**
   * Fonction confirmDelete
   * Confirme la suppression de l'utilisateur
   */
  function confirmDelete() {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  }

  /**
   * Fonction cancelDelete
   * Annule la suppression de l'utilisateur
   */
  function cancelDelete() {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  }

  /**
   * Fonction handleEdit
   * Prépare le formulaire pour la modification d'un utilisateur
   * Définit les valeurs actuelles du formulaire à partir de l'utilisateur sélectionné
   * @param {Object} user - L'utilisateur à modifier
   */
  function handleEdit(user) {
    setEditingUser(user);
    editForm.setValue("firstName", user.first_name);
    editForm.setValue("lastName", user.last_name);
    editForm.setValue("email", user.email);
    editForm.setValue("password", "");
    editForm.setValue("role", user.role || "PRODUCER");
    setShowEditModal(true);
  }

  /**
   * Fonction onCreateSubmit
   * Appelée lors de la soumission du formulaire de création
   * Transmet les données au createMutation
   * @param {Object} data - Les données du formulaire validées
   */
  function onCreateSubmit(data) {
    // Converti i dati in snake_case per il backend
    const snakeData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role
    };
    createMutation.mutate(snakeData);
  }

  /**
   * Fonction onUpdateSubmit
   * Appelée lors de la soumission du formulaire de modification
   * Supprime le champ password si vide pour ne pas le modifier
   * @param {Object} data - Les données du formulaire validées
   */
  function onUpdateSubmit(data) {
    // Converti i dati in snake_case per il backend
    const userData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role
    };
    if (data.password) {
      userData.password = data.password;
    }
    updateMutation.mutate({
      id: editingUser.id_user,
      userData
    });
  }


return (
    <section className="bg-gradient-to-br from-[#1a1c20]/60 to-[#0f1114]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl shadow-black/30 transition-all duration-300">
      <div className="mb-4">
        <TutorialBox title={tutorial.title} steps={tutorial.steps} defaultOpen={false} />
      </div>

      {message && (
        <div className={`mb-3 p-3 rounded-lg ${
          message.includes("succès") 
            ? "bg-green-500/10 border border-green-500/25 text-green-300" 
            : "bg-red-500/10 border border-red-500/25 text-red-300"
        }`}>
          <div className="flex items-center text-sm">
            {message.includes("succès") ? (
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {message}
          </div>
        </div>
      )}

  
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Gestion des utilisateurs</h2>
          <p className="text-xs text-gray-400 mt-1">
            Affichage {displayInfo.start}-{displayInfo.end} sur {displayInfo.total} utilisateur{displayInfo.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600/30 to-blue-700/30 text-blue-200 border border-blue-500/30 rounded-lg hover:from-blue-700/40 hover:to-blue-800/40 hover:text-white hover:scale-[1.02] transition-all duration-200 shadow hover:shadow-blue-500/20"
        >
          + Nouvel utilisateur
        </button>
      </div>

<div className="border border-white/10 rounded-lg overflow-hidden bg-black/30 backdrop-blur-sm">
  <table className="min-w-full">
    <thead className="bg-gray-900/70">
      <tr>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Prénom</th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Nom</th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Email</th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10">Rôle</th>
        <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-300 uppercase border-b border-white/10 w-20">Actions</th>
      </tr>
    </thead>
    
    <tbody>
      {paginatedUsers.length > 0 ? (
        paginatedUsers.map((user) => (
          <tr key={user.id_user} className="group hover:bg-white/5 transition-colors duration-150">
            <td className="px-3 py-1.5 text-sm text-gray-200 border-b border-white/5">{user.first_name}</td>
            <td className="px-3 py-1.5 text-sm text-gray-200 border-b border-white/5">{user.last_name}</td>
            <td className="px-3 py-1.5 text-sm text-gray-300 truncate max-w-[160px] border-b border-white/5" title={user.email}>
              {user.email}
            </td>
            <td className="px-3 py-1.5 border-b border-white/5">
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                user.role === 'ADMIN' ? 'text-red-500' :
                user.role === 'JURY' ? 'text-purple-500' :
                'text-green-500'
              }`}>
                {user.role}
              </span>
            </td>
            <td className="px-3 py-1.5 border-b border-white/5">
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(user)}
                  className="p-1 bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-300 hover:text-white hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/20 rounded transition-all duration-150"
                  title="Modifier"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDelete(user.id_user, `${user.first_name} ${user.last_name}`)}
                  className="p-1 bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-300 hover:text-white hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 rounded transition-all duration-150"
                  title="Supprimer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="px-6 py-3 text-center text-gray-400 text-sm">
            Aucun utilisateur trouvé
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* Pagination */}
      {users.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    

      {/* Modal de création d'utilisateur */}
{showCreateModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 animate-fadeIn mobile-modal-overlay">
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl shadow-black/40 mobile-modal-panel">
      {/* En-tête minimaliste */}
      <div className="flex justify-between items-center mb-6 mobile-modal-header">
        <h3 className="text-lg font-semibold text-white">Nouvel utilisateur</h3>
        <button
          onClick={() => {
            setShowCreateModal(false);
            createForm.reset();
          }}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pb-20 sm:pb-0">
        {/* Grille compacte Prénom/Nom */}
        <div className="grid grid-cols-2 gap-3">
          {/* Champ: Prénom */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-400">Prénom</label>
            <input 
              type="text" 
              {...createForm.register("firstName")} 
              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 ${
                          createForm.formState.errors.firstName 
                            ? 'border-red-500/40' 
                            : 'border-white/10 focus:border-blue-500/30'
                        }`}
              placeholder="Jean"
            />
            {createForm.formState.errors.firstName && (
              <p className="text-red-400 text-[10px] mt-1">{createForm.formState.errors.firstName.message}</p>
            )}
          </div>

          {/* Champ: Nom */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-400">Nom</label>
            <input 
              type="text" 
              {...createForm.register("lastName")} 
              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 ${
                          createForm.formState.errors.lastName 
                            ? 'border-red-500/40' 
                            : 'border-white/10 focus:border-blue-500/30'
                        }`}
              placeholder="Dupont"
            />
            {createForm.formState.errors.lastName && (
              <p className="text-red-400 text-[10px] mt-1">{createForm.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Champ: Email */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-400">Email</label>
          <div className="relative">
            <input 
              type="email" 
              {...createForm.register("email")} 
              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 ${
                          createForm.formState.errors.email 
                            ? 'border-red-500/40' 
                            : 'border-white/10 focus:border-blue-500/30'
                        }`}
              placeholder="exemple@email.com"
            />
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
          {createForm.formState.errors.email && (
            <p className="text-red-400 text-[10px] mt-1">{createForm.formState.errors.email.message}</p>
          )}
        </div>

        {/* Champ: Mot de passe */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-400">Mot de passe</label>
          <div className="relative">
            <input 
              type="password" 
              {...createForm.register("password")} 
              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 ${
                          createForm.formState.errors.password 
                            ? 'border-red-500/40' 
                            : 'border-white/10 focus:border-blue-500/30'
                        }`}
              placeholder="••••••••"
            />
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          {createForm.formState.errors.password && (
            <p className="text-red-400 text-[10px] mt-1">{createForm.formState.errors.password.message}</p>
          )}
        </div>

        {/* Champ: Rôle - style compact */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-400">Rôle</label>
          <div className="relative">
            <select 
              {...createForm.register("role")} 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white 
                       focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 
                       appearance-none cursor-pointer"
            >
              <option value="PRODUCER" className="bg-gray-900 text-sm">Producteur</option>
              <option value="JURY" className="bg-gray-900 text-sm">Jury</option>
              <option value="ADMIN" className="bg-gray-900 text-sm">Administrateur</option>
            </select>
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Indicateurs de rôle visuels */}
          <div className="flex gap-1 mt-2">
            <div className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
              createForm.watch("role") === "PRODUCER" 
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                : "bg-black/20 text-gray-500 border-white/5"
            }`}>
              Producteur
            </div>
            <div className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
              createForm.watch("role") === "JURY" 
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                : "bg-black/20 text-gray-500 border-white/5"
            }`}>
              Jury
            </div>
            <div className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
              createForm.watch("role") === "ADMIN" 
                ? "bg-red-500/20 text-red-300 border-red-500/30" 
                : "bg-black/20 text-gray-500 border-white/5"
            }`}>
              Admin
            </div>
          </div>
        </div>

        {/* Boutons - style élégant et fin */}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/5 mobile-modal-footer">
          <button 
            type="button"
            onClick={() => {
              setShowCreateModal(false);
              createForm.reset();
            }}
            className="px-3 py-1.5 text-xs border border-white/10 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
          >
            Annuler
          </button>
          <button 
            type="submit"
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white text-xs rounded 
                     hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-200 border border-blue-500/30 shadow-sm hover:shadow"
          >
            Créer
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Modal de modification d'utilisateur */}
{showEditModal && editingUser && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 animate-fadeIn mobile-modal-overlay">
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl shadow-black/40 mobile-modal-panel">
      {/* En-tête avec info utilisateur */}
      <div className="flex justify-between items-center mb-6 mobile-modal-header">
        <div>
          <h3 className="text-lg font-semibold text-white">Modifier l'utilisateur</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {editingUser.first_name} {editingUser.last_name}
          </p>
        </div>
        <button
          onClick={() => {
            setShowEditModal(false);
            setEditingUser(null);
            editForm.reset();
          }}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={editForm.handleSubmit(onUpdateSubmit)} className="space-y-4 pb-20 sm:pb-0">
        {/* Grille compacte Prénom/Nom */}
        <div className="grid grid-cols-2 gap-3">
          {/* Champ: Prénom */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-400">Prénom</label>
            <input 
              type="text" 
              {...editForm.register("firstName")} 
              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 ${
                          editForm.formState.errors.firstName 
                            ? 'border-red-500/40' 
                            : 'border-white/10 focus:border-blue-500/30'
                        }`}
            />
            {editForm.formState.errors.firstName && (
              <p className="text-red-400 text-[10px] mt-1">{editForm.formState.errors.firstName.message}</p>
            )}
          </div>

          {/* Champ: Nom */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-400">Nom</label>
            <input 
              type="text" 
              {...editForm.register("lastName")} 
              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 ${
                          editForm.formState.errors.lastName 
                            ? 'border-red-500/40' 
                            : 'border-white/10 focus:border-blue-500/30'
                        }`}
            />
            {editForm.formState.errors.lastName && (
              <p className="text-red-400 text-[10px] mt-1">{editForm.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Champ: Email */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-400">Email</label>
          <div className="relative">
            <input 
              type="email" 
              {...editForm.register("email")} 
              className={`w-full bg-black/30 border rounded-lg px-3 py-2 text-sm text-white 
                        focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 ${
                          editForm.formState.errors.email 
                            ? 'border-red-500/40' 
                            : 'border-white/10 focus:border-blue-500/30'
                        }`}
            />
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
          {editForm.formState.errors.email && (
            <p className="text-red-400 text-[10px] mt-1">{editForm.formState.errors.email.message}</p>
          )}
        </div>

        {/* Champ: Mot de passe (optionnel) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-gray-400">Mot de passe</label>
            <span className="text-[10px] text-gray-500">Optionnel</span>
          </div>
          <div className="relative">
            <input 
              type="password" 
              {...editForm.register("password")} 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white 
                       focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
              placeholder="Nouveau mot de passe"
            />
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 text-[10px] mt-1">Laisser vide pour conserver l'actuel</p>
          {editForm.formState.errors.password && (
            <p className="text-red-400 text-[10px] mt-1">{editForm.formState.errors.password.message}</p>
          )}
        </div>

        {/* Champ: Rôle avec indicateurs */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-400">Rôle</label>
          <div className="relative">
            <select 
              {...editForm.register("role")} 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white 
                       focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 
                       appearance-none cursor-pointer"
            >
              <option value="PRODUCER" className="bg-gray-900 text-sm">Producteur</option>
              <option value="JURY" className="bg-gray-900 text-sm">Jury</option>
              <option value="ADMIN" className="bg-gray-900 text-sm">Administrateur</option>
            </select>
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Indicateurs de rôle */}
          <div className="flex gap-1 mt-2">
            <div className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
              editForm.watch("role") === "PRODUCER" 
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                : "bg-black/20 text-gray-500 border-white/5"
            }`}>
              Producteur
            </div>
            <div className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
              editForm.watch("role") === "JURY" 
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                : "bg-black/20 text-gray-500 border-white/5"
            }`}>
              Jury
            </div>
            <div className={`px-2 py-0.5 rounded text-[9px] font-medium border ${
              editForm.watch("role") === "ADMIN" 
                ? "bg-red-500/20 text-red-300 border-red-500/30" 
                : "bg-black/20 text-gray-500 border-white/5"
            }`}>
              Admin
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/5 mobile-modal-footer">
          <button 
            type="button"
            onClick={() => {
              setShowEditModal(false);
              setEditingUser(null);
              editForm.reset();
            }}
            className="px-3 py-1.5 text-xs border border-white/10 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
          >
            Annuler
          </button>
          <button 
            type="submit"
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white text-xs rounded 
                     hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-200 border border-blue-500/30 shadow-sm hover:shadow"
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 mobile-modal-overlay">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl shadow-black/50 mobile-modal-panel">
            <div className="text-center">
              {/* Icône d'avertissement */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.142 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">Confirmer la suppression</h3>
              
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <span className="font-semibold text-white">{userToDelete.name}</span> ? Cette action est irréversible.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-5 py-2 border border-white/10 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300"
                  disabled={deleteMutation.isLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/30 flex items-center"
                  disabled={deleteMutation.isLoading}
                >
                  {deleteMutation.isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    'Supprimer définitivement'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Users;