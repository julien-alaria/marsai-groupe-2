/**
 * Composant ProducerHome (Accueil Producteur)
 * Page permettant aux producteurs de voir et modifier leur profil complet
* Fonctionnalités: 
 * - Affichage des informations utilisateur (18 champs optionnels)
 * - Mode édition pour modifier les informations
 * - Appel API getCurrentUser pour récupérer les données
 * - Validation et mise à jour via updateCurrentUser
 * @returns {JSX.Element} La page d'accueil du producteur avec formulaire de profil
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { VideoPreview } from "../../components/VideoPreview.jsx";
import Navbar from "../../components/Navbar.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { getCurrentUser, updateCurrentUser } from "../../api/users";
import { createMovie, getMyMovies, updateMovieCollaborators } from "../../api/movies";
import { getCategories } from "../../api/videos.js";

const movieSchema = z.object({
  filmTitleOriginal: z.string().min(1, "Le titre du film est requis"),
  durationSeconds: z.coerce
    .number()
    .int("La durée doit être un nombre entier")
    .min(1, "La durée est obligatoire")
    .max(120, "La durée maximale est de 120 secondes"),
  filmLanguage: z.string().optional(),
  releaseYear: z.string().optional(),
  nationality: z.string().optional(),
  translation: z.string().optional(),
  youtubeLink: z.string().optional(),
  synopsisOriginal: z.string().min(1, "Le synopsis est requis"),
  synopsisEnglish: z.string().optional(),
  aiClassification: z.string().min(1, "La classification IA est obligatoire"),
  aiStack: z.string().optional(),
  aiMethodology: z.string().optional(),
  categoryId: z.string().min(1, "La catégorie est obligatoire"),
  knownByMarsAi: z.string().optional(),
  collaborators: z
    .array(
      z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email("Email invalide").optional(),
        job: z.string().optional()
      })
    )
    .optional(),
  filmFile: z.any().optional(),
  thumbnails: z.array(z.any()).optional(),
  subtitlesSrt: z.any().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions de participation"
  })
});

export default function ProducerHome() {
  // Stato per mostrare la modale di upload/update
  const [showEditMovieModal, setShowEditMovieModal] = useState(false);
  const [editMovieFiles, setEditMovieFiles] = useState({ filmFile: null, thumbnails: [] });
  const { t } = useTranslation();
  // État pour stocker les données utilisateur
  const [user, setUser] = useState(null);
  // État pour indiquer si les données sont en cours de chargement
  const [loading, setLoading] = useState(true);
  // État pour gérer les messages d'erreur
  const [error, setError] = useState(null);
  // État pour basculer entre mode lecture et mode édition
  const [editMode, setEditMode] = useState(false);
  // État pour stocker les données du formulaire d'édition
  const [form, setForm] = useState({});
  // État pour afficher les messages de succès
  const [success, setSuccess] = useState(null);
  // État pour stocker les films du producteur
  const [movies, setMovies] = useState([]);
  const [movieSuccess, setMovieSuccess] = useState(null);
  const [movieError, setMovieError] = useState(null);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [collabDrafts, setCollabDrafts] = useState({});
  const [filmFileName, setFilmFileName] = useState("Aucun fichier sélectionné");
  const [thumbnailNames, setThumbnailNames] = useState(["Aucun fichier sélectionné"]);
  const [subtitlesName, setSubtitlesName] = useState("Aucun fichier sélectionné");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Stato per il successo upload vignette
  const [thumbnailUploadSuccess, setThumbnailUploadSuccess] = useState(false);

  const handleFileName = (event, setter) => {
    const file = event.target.files?.[0];
    setter(file ? file.name : "Aucun fichier sélectionné");
  };

  const {
    register: registerMovie,
    handleSubmit: handleSubmitMovie,
    reset: resetMovie,
    control: movieControl,
    formState: { errors: movieErrors }
  } = useForm({
    resolver: zodResolver(movieSchema)
  });

  // Watch form fields for validation
  const filmTitleOriginal = useWatch({ control: movieControl, name: "filmTitleOriginal" });
  const durationSeconds = useWatch({ control: movieControl, name: "durationSeconds" });
  const synopsisOriginal = useWatch({ control: movieControl, name: "synopsisOriginal" });
  const acceptRules = useWatch({ control: movieControl, name: "acceptRules" });
  const aiClassification = useWatch({ control: movieControl, name: "aiClassification" });
  const categoryId = useWatch({ control: movieControl, name: "categoryId" });
  const acceptTerms = useWatch({ control: movieControl, name: "acceptTerms" });

  const {
    fields: collaboratorFields,
    append: appendCollaborator,
    remove: removeCollaborator
  } = useFieldArray({
    control: movieControl,
    name: "collaborators"
  });

  // Dynamic thumbnails field array
  const { fields, append, remove } = useFieldArray({ control: movieControl, name: "thumbnails" });

  const createMovieMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("filmTitleOriginal", data.filmTitleOriginal || "");
      formData.append("durationSeconds", data.durationSeconds || "");
      formData.append("filmLanguage", data.filmLanguage || "");
      formData.append("releaseYear", data.releaseYear || "");
      formData.append("nationality", data.nationality || "");
      formData.append("translation", data.translation || "");
      formData.append("youtubeLink", data.youtubeLink || "");
      formData.append("synopsisOriginal", data.synopsisOriginal || "");
      formData.append("synopsisEnglish", data.synopsisEnglish || "");
      formData.append("aiClassification", data.aiClassification || "");
      formData.append("aiStack", data.aiStack || "");
      formData.append("aiMethodology", data.aiMethodology || "");

      if (data.knownByMarsAi) {
        formData.append("knownByMarsAi", data.knownByMarsAi);
      }

      if (data.categoryId) {
        formData.append("categories", JSON.stringify([Number(data.categoryId)]));
      }

      if (data.collaborators?.length) {
        const normalized = data.collaborators.filter(
          (collab) => collab?.first_name || collab?.last_name || collab?.email
        );
        formData.append("collaborators", JSON.stringify(normalized));
      }


      if (data.filmFile?.[0]) formData.append("filmFile", data.filmFile[0]);
      if (data.thumbnails?.length) {
        data.thumbnails.forEach((file, idx) => {
          if (file) formData.append(`thumbnails`, file);
        });
      }
      if (data.subtitlesSrt?.[0]) formData.append("subtitlesSrt", data.subtitlesSrt[0]);

      return await createMovie(formData);
    },
    onSuccess: async () => {
      setMovieError(null);
      setMovieSuccess("Film soumis avec succès.");
      setSubmittedSuccess(true);
      setFormStep(1);
      resetMovie();
      setFilmFileName("Aucun fichier sélectionné");
      setThumbnailNames(["Aucun fichier sélectionné"]);
      setSubtitlesName("Aucun fichier sélectionné");
      try {
        const moviesRes = await getMyMovies();
        setMovies(moviesRes.data || []);
      } catch {
        // ignore refresh errors
      }
    },
    onError: (err) => {
      setMovieSuccess(null);
      setMovieError(
        err?.response?.data?.error
        || err?.message
        || "Erreur lors de la soumission du film."
      );
    }
  });

  const updateCollaboratorsMutation = useMutation({
    mutationFn: ({ id, collaborators }) => updateMovieCollaborators(id, collaborators),
    onSuccess: async () => {
      try {
        const moviesRes = await getMyMovies();
        setMovies(moviesRes.data || []);
      } catch {
        // ignore refresh errors
      }
      setEditingMovieId(null);
    },
    onError: () => {
      setMovieError("Erreur lors de la mise à jour des collaborateurs.");
    }
  });

  function onSubmitMovie(data) {
    return createMovieMutation.mutate(data);
  }

  // Validation functions
  const isStep1Valid = () => {
    return (
      filmTitleOriginal && 
      filmTitleOriginal.trim().length > 0 &&
      durationSeconds && 
      durationSeconds > 0 && 
      durationSeconds <= 120 &&
      synopsisOriginal && 
      synopsisOriginal.trim().length > 0
    );
  };

  const isStep2Valid = () => {
    return (
      acceptRules === true &&
      aiClassification && 
      aiClassification.trim().length > 0 &&
      categoryId && 
      categoryId.toString().trim().length > 0
    );
  };

  const handleNextStep = () => {
    if (!isStep1Valid()) {
      alert(t('producerHome.alertStep1'));
      return;
    }
    setFormStep(2);
  };

  const handlePreviousStep = () => {
    setFormStep(1);
  };

  const handleResetForm = () => {
    setSubmittedSuccess(false);
    setFormStep(1);
    setMovieSuccess(null); // Nascondere il messaggio di successo
    setMovieError(null); // Nascondere eventuali errori
    resetMovie();
    setFilmFileName("Aucun fichier sélectionné");
    setThumbnailNames(["Aucun fichier sélectionné"]);
    setSubtitlesName("Aucun fichier sélectionné");
  };

  /**
   * Effect - Récupère les données utilisateur au chargement du composant
   * Vérifie que l'utilisateur est authentifié avant de faire l'appel API
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Non authentifié");
      setLoading(false);
      return;
    }
    Promise.all([getCurrentUser(), getMyMovies()])
      .then(([userRes, moviesRes]) => {
        setUser(userRes.data);
        setForm(userRes.data);
        const userMovies = moviesRes.data || [];
        setMovies(userMovies);
        // Se l'utilisateur a déjà soumis des films, afficher la liste
        setSubmittedSuccess(userMovies.length > 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors de la récupération des données utilisateur");
        setLoading(false);
      });
  }, []);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

  const categories = categoriesData?.data || [];


  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t('common.loading')}</div>;
  if (error) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{error}</div>;
  if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t('common.userNotFound')}</div>;

  const uploadBase = "http://localhost:3000/uploads";
  const getPoster = (movie) => (
    movie.thumbnail
      ? `${uploadBase}/${movie.thumbnail}`
      : movie.display_picture
        ? `${uploadBase}/${movie.display_picture}`
        : movie.picture1
          ? `${uploadBase}/${movie.picture1}`
          : movie.picture2
            ? `${uploadBase}/${movie.picture2}`
            : movie.picture3
              ? `${uploadBase}/${movie.picture3}`
              : null
  );

  const getTrailer = (movie) => (
    movie.trailer
      || movie.trailer_video
      || movie.trailerVideo
      || movie.filmFile
      || movie.video
      || null
  );

  /**
   * Fonction handleEditChange
   * Met à jour le state form lors de chaque modification de champ
   * @param {Event} e - L'événement du champ modifié
   */
  function handleEditChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }
  /**
   * Fonction handleSave
   * Envoie les données modifiées au serveur via updateCurrentUser
   * Supprime les champs email et role car ils ne peuvent pas être modifiés
   * Met à jour le localStorage avec le nouveau prénom
   * @param {Event} e - L'événement du formulaire
   */
  async function handleSave(e) {
    e.preventDefault();
    setSuccess(null);
    try {
      const toSend = { ...form };
      delete toSend.email;
      delete toSend.role;
      const res = await updateCurrentUser(toSend);
      setUser(res.data);
      setEditMode(false);
      setSuccess("Profil mis à jour avec succès.");
      if (res.data.first_name) localStorage.setItem("firstName", res.data.first_name);
    } catch (err) {
      setError("Erreur lors de la mise à jour du profil");
    }
  }

  function startEditCollaborators(movie) {
    const existing = (movie.Collaborators || []).map((collab) => ({
      first_name: collab.first_name || "",
      last_name: collab.last_name || "",
      email: collab.email || "",
      job: collab.job || ""
    }));

    setCollabDrafts((prev) => ({
      ...prev,
      [movie.id_movie]: existing.length ? existing : [{ first_name: "", last_name: "", email: "", job: "" }]
    }));
    setEditingMovieId(movie.id_movie);
  }

  function updateDraftField(movieId, index, field, value) {
    setCollabDrafts((prev) => {
      const list = [...(prev[movieId] || [])];
      if (!list[index]) return prev;
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [movieId]: list };
    });
  }

  function addDraftCollaborator(movieId) {
    setCollabDrafts((prev) => ({
      ...prev,
      [movieId]: [
        ...(prev[movieId] || []),
        { first_name: "", last_name: "", email: "", job: "" }
      ]
    }));
  }

  function removeDraftCollaborator(movieId, index) {
    setCollabDrafts((prev) => {
      const list = [...(prev[movieId] || [])];
      list.splice(index, 1);
      return { ...prev, [movieId]: list };
    });
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white font-light pt-28 pb-20 px-4 md:pt-32">
      <div className="max-w-6xl mx-auto space-y-10">

        {submittedSuccess ? (
          <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">

            {movies.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-6">Mes films soumis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movies.map((movie) => (
                    <div
                      key={movie.id_movie}
                      onClick={() => setSelectedMovie(movie)}
                      className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden hover:border-[#AD46FF] transition cursor-pointer group"
                    >
                      {getPoster(movie) && (
                        <div className="relative overflow-hidden h-40 bg-gray-800">
                          <img
                            src={getPoster(movie)}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="text-white font-semibold truncate group-hover:text-[#AD46FF] transition">
                          {movie.title || movie.filmTitleOriginal}
                        </h4>
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {movie.synopsis || movie.synopsisOriginal || "Pas de synopsis"}
                        </p>
                        <div className="mt-3 space-y-1 text-xs text-gray-500">
                          <div><span className="text-gray-400">Durée:</span> {movie.duration || movie.durationSeconds}s</div>
                          <div><span className="text-gray-400">Langue:</span> {movie.main_language || movie.filmLanguage || "-"}</div>
                          <div><span className="text-gray-400">Nationalité:</span> {movie.nationality || "-"}</div>
                          <div className="pt-2 flex items-center gap-2">
                            <span className="text-gray-400">Statut:</span>
                            <span className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ${
                              movie.selection_status === "selected" ? "bg-green-600" :
                              movie.selection_status === "refused" ? "bg-red-600" :
                              "bg-yellow-600"
                            }`}>
                              {movie.selection_status === "selected" ? "Approuvé" :
                               movie.selection_status === "refused" ? "Refusé" :
                               "En attente"}
                            </span>
                          </div>
                        </div>
                        {/* Bottone promozione candidatura */}
                        {movie.selection_status === "selected" && (user?.role === "admin" || user?.role === "producer") && (
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-[#5EEAD4]/80 text-white rounded-lg text-xs hover:bg-[#5EEAD4] mt-2"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await fetch(`/api/movies/${movie.id_movie}/jury-candidate`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                                });
                                if (res.ok) {
                                  setMovieSuccess("Film promu à la candidature !");
                                  // Aggiorna la lista
                                  const moviesRes = await getMyMovies();
                                  setMovies(moviesRes.data || []);
                                } else {
                                  setMovieError("Erreur lors de la promotion.");
                                }
                              } catch {
                                setMovieError("Erreur lors de la promotion.");
                              }
                            }}
                          >
                            Promouvoir les candidats primés
                          </button>
                        )}
                        {/* Bouton Modifier le film (admin ou producteur) */}
                        {(user?.role === "admin" || user?.role === "producer") && (
                          <button
                            type="button"
                            className="mt-4 w-full bg-[#AD46FF] text-white font-bold py-2 rounded-lg hover:bg-[#F6339A] transition"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedMovie(movie);
                              setShowEditMovieModal(true);
                            }}
                          >
                            Modifier le film
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleResetForm}
                className="px-6 py-3 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white font-bold rounded-lg uppercase hover:opacity-90 transition"
              >
                Soumettre un nouveau film
              </button>
            </div>
          </section>
        ) : (
          <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  formStep >= 1 ? "bg-[#AD46FF] text-white" : "bg-gray-700 text-gray-400"
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 ${formStep >= 2 ? "bg-[#AD46FF]" : "bg-gray-700"}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  formStep >= 2 ? "bg-[#AD46FF] text-white" : "bg-gray-700 text-gray-400"
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <span className={formStep >= 1 ? "text-white font-semibold" : "text-gray-400"}>Données du film</span>
                <span className={formStep >= 2 ? "text-white font-semibold" : "text-gray-400"}>IA, Fichiers & Collaborateurs</span>
              </div>
            </div>

            <form onSubmit={handleSubmitMovie(onSubmitMovie)} className="space-y-8">
              {formStep === 1 && (
                <section className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col">
                      <label htmlFor="filmTitleOriginal" className="text-white font-semibold mb-1 text-xs uppercase">
                        Titre original *
                      </label>
                      <input
                        id="filmTitleOriginal"
                        type="text"
                        placeholder="TITRE ORIGINAL"
                    {...registerMovie("filmTitleOriginal")}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  />
                  {movieErrors.filmTitleOriginal && (
                    <p className="text-red-400 text-sm mt-1">{movieErrors.filmTitleOriginal.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="durationSeconds" className="text-white font-semibold mb-1 text-xs uppercase">
                    Durée (sec) *
                  </label>
                  <input
                    id="durationSeconds"
                    type="number"
                    placeholder="60"
                    {...registerMovie("durationSeconds")}
                    max={120}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  />
                  <p className="text-xs text-gray-300 mt-0.5">Max 120s</p>
                  {movieErrors.durationSeconds && (
                    <p className="text-red-400 text-sm mt-1">{movieErrors.durationSeconds.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="filmLanguage" className="text-white font-semibold mb-1 text-xs uppercase">
                    Langue
                  </label>
                  <input
                    id="filmLanguage"
                    type="text"
                    placeholder="Français"
                    {...registerMovie("filmLanguage")}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="releaseYear" className="text-white font-semibold mb-1 text-xs uppercase">
                    Année
                  </label>
                  <input
                    id="releaseYear"
                    type="number"
                    placeholder="2026"
                    {...registerMovie("releaseYear")}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="nationality" className="text-white font-semibold mb-1 text-xs uppercase">
                    Nationalité
                  </label>
                  <input
                    id="nationality"
                    type="text"
                    placeholder="France"
                    {...registerMovie("nationality")}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="knownByMarsAi" className="text-white font-semibold mb-1 text-xs uppercase">
                    Comment connu ?
                  </label>
                  <select
                    id="knownByMarsAi"
                    {...registerMovie("knownByMarsAi")}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Par un ami">Par un ami</option>
                    <option value="Vu une publicité du festival">Vu une publicité du festival</option>
                    <option value="Via le site internet ou application de l'IA">Via le site internet ou application de l'IA</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="categoryId" className="text-white font-semibold mb-1 text-xs uppercase">
                    Catégorie
                  </label>
                  <select
                    id="categoryId"
                    {...registerMovie("categoryId")}
                    className={`bg-gray-800 border text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm ${
                      movieErrors.categoryId ? "border-red-500 bg-red-950/20" : "border-gray-700"
                    }`}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id_categorie} value={category.id_categorie}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {movieErrors.categoryId && (
                    <p className="text-red-400 text-sm mt-1">{movieErrors.categoryId.message}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="translation" className="text-white font-semibold mb-1 text-xs uppercase">
                    Traduction titre
                  </label>
                  <input
                    id="translation"
                    type="text"
                    placeholder="English"
                    {...registerMovie("translation")}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="youtubeLink" className="text-white font-semibold mb-1 text-xs uppercase">
                    Lien YouTube
                  </label>
                  <input
                    id="youtubeLink"
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    {...registerMovie("youtubeLink")}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition text-sm"
                  />
                </div>

                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="synopsisOriginal" className="text-white font-semibold mb-1 text-xs uppercase">
                    Synopsis original * (300 char max)
                  </label>
                  <textarea
                    id="synopsisOriginal"
                    rows="2"
                    placeholder="Résumez votre film en quelques lignes..."
                    {...registerMovie("synopsisOriginal")}
                    maxLength={300}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition resize-none text-sm"
                  />
                  {movieErrors.synopsisOriginal && (
                    <p className="text-red-400 text-sm mt-1">{movieErrors.synopsisOriginal.message}</p>
                  )}
                </div>

                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="synopsisEnglish" className="text-white font-semibold mb-1 text-xs uppercase">
                    Synopsis anglais (300 char max)
                  </label>
                  <textarea
                    id="synopsisEnglish"
                    rows="2"
                    placeholder="Summary in English..."
                    {...registerMovie("synopsisEnglish")}
                    maxLength={300}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition resize-none text-sm"
                  />
                </div>
              </div>
            </section>
            )}

            {formStep === 2 && (
              <>
            <section className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex flex-col md:col-span-3">
                  <label className="text-white font-semibold mb-1 text-xs uppercase">
                    Classification IA *
                  </label>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-lg p-2 ${
                    movieErrors.aiClassification
                      ? "border-red-500 bg-red-950/20"
                      : "border-transparent"
                  }`}>
                    <label className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 cursor-pointer">
                      <input type="radio" value="integrale" {...registerMovie("aiClassification")} className="cursor-pointer" />
                      <span className="text-sm">100% IA</span>
                    </label>
                    <label className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 cursor-pointer">
                      <input type="radio" value="hybride" {...registerMovie("aiClassification")} className="cursor-pointer" />
                      <span className="text-sm">Hybride (Réel + IA)</span>
                    </label>
                  </div>
                  {movieErrors.aiClassification && (
                    <p className="text-red-400 text-sm mt-2">{movieErrors.aiClassification.message}</p>
                  )}
                </div>

                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="aiStack" className="text-white font-semibold mb-1 text-xs uppercase">
                    Stack Technologique
                  </label>
                  <textarea
                    id="aiStack"
                    rows="2"
                    maxLength={500}
                    {...registerMovie("aiStack")}
                    placeholder="Listez les outils IA utilisés (ex: Midjourney, Runway, ElevenLabs...)"
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition resize-none text-sm"
                  />
                </div>

                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="aiMethodology" className="text-white font-semibold mb-1 text-xs uppercase">
                    Méthodologie Créative
                  </label>
                  <textarea
                    id="aiMethodology"
                    rows="2"
                    maxLength={500}
                    {...registerMovie("aiMethodology")}
                    placeholder="Décrivez l'interaction humain-machine dans le processus créatif..."
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#AD46FF] transition resize-none text-sm"
                  />
                </div>
                <div className="flex flex-col md:col-span-3">
                  <label className="text-white font-semibold mb-1 text-xs uppercase">
                    Collaborateurs ({collaboratorFields.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCollaboratorsModal(true)}
                    className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg hover:bg-gray-700 transition text-sm text-left"
                  >
                    {collaboratorFields.length === 0 ? "Gérer les collaborateurs" : `${collaboratorFields.length} collaborateur(s) ajouté(s) - Cliquez pour modifier`}
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="filmFile" className="text-white font-semibold mb-1 text-xs uppercase">
                    Fichier du film
                  </label>
                  {(() => {
                    const { onChange, ...rest } = registerMovie("filmFile");
                    return (
                      <input
                        id="filmFile"
                        type="file"
                        {...rest}
                        className="sr-only"
                        onChange={(event) => {
                          onChange(event);
                          handleFileName(event, setFilmFileName);
                        }}
                      />
                    );
                  })()}
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                    <label htmlFor="filmFile" className="cursor-pointer text-white font-semibold text-sm">
                      Choisir
                    </label>
                    <span className="text-gray-400 text-sm truncate">{filmFileName}</span>
                  </div>
                </div>


                {/* Dynamic thumbnails upload */}
                <div className="flex flex-col md:col-span-3">
                  <label className="text-white font-semibold mb-1 text-xs uppercase">Vignettes</label>
                  {/* Move useFieldArray to top of component */}
                  {/* Dynamic thumbnails upload */}
                  <div className="flex flex-col md:col-span-3">
                    <label className="text-white font-semibold mb-1 text-xs uppercase">Vignettes</label>
                    {fields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="file"
                          accept="image/*"
                          {...registerMovie(`thumbnails.${idx}`)}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setThumbnailNames(prev => {
                                const next = [...prev];
                                next[idx] = file.name;
                                return next;
                              });
                              // Add a new empty field if last
                              if (idx === fields.length - 1) append({});
                            }
                          }}
                          className="sr-only"
                          id={`thumbnail-upload-${idx}`}
                        />
                        <label htmlFor={`thumbnail-upload-${idx}`} className="cursor-pointer text-white font-semibold text-sm bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                          Choisir
                        </label>
                        <span className="text-gray-400 text-xs truncate">{thumbnailNames[idx]}</span>
                        {idx > 0 && (
                          <button type="button" onClick={() => remove(idx)} className="text-red-500 text-xs ml-2">Supprimer</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:col-span-3">
                  <label htmlFor="subtitlesSrt" className="text-white font-semibold mb-1 text-xs uppercase">
                    Sous-titres (.srt)
                  </label>
                  {(() => {
                    const { onChange, ...rest } = registerMovie("subtitlesSrt");
                    return (
                      <input
                        id="subtitlesSrt"
                        type="file"
                        accept=".srt"
                        {...rest}
                        className="sr-only"
                        onChange={(event) => {
                          onChange(event);
                          handleFileName(event, setSubtitlesName);
                        }}
                      />
                    );
                  })()}
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                    <label htmlFor="subtitlesSrt" className="cursor-pointer text-white font-semibold text-sm">
                      Choisir
                    </label>
                    <span className="text-gray-400 text-sm truncate">{subtitlesName}</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
              <input
                id="acceptTerms"
                type="checkbox"
                {...registerMovie("acceptTerms")}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="acceptTerms" className="text-white text-xs cursor-pointer flex-1">
                J'accepte les{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="text-[#AD46FF] hover:text-[#F6339A] underline font-semibold"
                >
                  conditions de participation
                </button>
              </label>
            </div>

            {movieErrors.acceptTerms && (
              <p className="text-red-400 text-sm">{movieErrors.acceptTerms.message}</p>
            )}
              </>
            )}

            <div className="flex flex-col gap-4 pt-2">
                          {/* Mostra errori globali dei campi obbligatori in entrambe le parti del form */}
                          {movieErrors.categoryId && (
                            <p className="text-red-400 text-sm text-center">{movieErrors.categoryId.message}</p>
                          )}
                          {movieErrors.filmTitleOriginal && (
                            <p className="text-red-400 text-sm text-center">{movieErrors.filmTitleOriginal.message}</p>
                          )}
                          {movieErrors.durationSeconds && (
                            <p className="text-red-400 text-sm text-center">{movieErrors.durationSeconds.message}</p>
                          )}
                          {movieErrors.synopsisOriginal && (
                            <p className="text-red-400 text-sm text-center">{movieErrors.synopsisOriginal.message}</p>
                          )}
                          {movieErrors.aiClassification && (
                            <p className="text-red-400 text-sm text-center">{movieErrors.aiClassification.message}</p>
                          )}
              {formStep === 1 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white font-bold py-4 rounded-lg uppercase hover:opacity-90 transition"
                >
                  {t('common.next')}
                </button>
              )}
              {formStep === 2 && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="w-full border border-gray-600 text-white font-bold py-4 rounded-lg uppercase hover:bg-gray-800 transition"
                  >
                    {t('common.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={createMovieMutation.isPending || !acceptTerms}
                    className="w-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white font-bold py-4 rounded-lg uppercase hover:opacity-90 transition disabled:opacity-50"
                  >
                    {createMovieMutation.isPending ? t('producerHome.submitting') : 'SOUMETTRE LE FILM'}
                  </button>
                </>
              )}
            </div>

            {movieSuccess && (
              <div className="bg-green-900/30 border border-green-600 text-green-300 px-4 py-3 rounded-lg">
                {movieSuccess}
              </div>
            )}

            {movieError && (
              <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
                {movieError}
              </div>
            )}
          </form>
        </section>
        )}

        {showCollaboratorsModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Gérer les collaborateurs et médias</h3>
                <button
                  type="button"
                  onClick={() => setShowCollaboratorsModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Upload vignette (max 3) */}
              <div className="mb-4">
                <label className="text-white font-semibold mb-1 text-xs uppercase">Vignettes</label>
                {[0,1,2].map(idx => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setThumbnailNames(prev => {
                            const next = [...prev];
                            next[idx] = file.name;
                            return next;
                          });
                          setThumbnailUploadSuccess(true);
                          setTimeout(() => setThumbnailUploadSuccess(false), 2000);
                        }
                      }}
                      className="sr-only"
                      id={`modal-thumbnail-upload-${idx}`}
                      disabled={thumbnailNames.filter(n => n && n !== "Aucun fichier sélectionné").length >= 3}
                    />
                    <label htmlFor={`modal-thumbnail-upload-${idx}`} className="cursor-pointer text-white font-semibold text-sm bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                      Choisir
                    </label>
                    <span className="text-gray-400 text-xs truncate">{thumbnailNames[idx]}</span>
                    {thumbnailNames[idx] && thumbnailNames[idx] !== "Aucun fichier sélectionné" && (
                      <button type="button" onClick={() => {
                        setThumbnailNames(prev => {
                          const next = [...prev];
                          next[idx] = "Aucun fichier sélectionné";
                          return next;
                        });
                      }} className="text-red-500 text-xs ml-2">Supprimer</button>
                    )}
                  </div>
                ))}
                {thumbnailUploadSuccess && (
                  <div className="text-green-400 text-xs mb-2">Vignette téléchargée avec succès !</div>
                )}
              </div>

              {/* Upload film file */}
              <div className="mb-4">
                <label className="text-white font-semibold mb-1 text-xs uppercase">Fichier du film</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    setFilmFileName(file ? file.name : "Aucun fichier sélectionné");
                  }}
                  className="sr-only"
                  id="modal-film-upload"
                  placeholder="Choisir un fichier"
                />
                <label htmlFor="modal-film-upload" className="cursor-pointer text-white font-semibold text-sm bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                  Choisir un fichier
                </label>
                <span className="text-gray-400 text-xs truncate">{filmFileName}</span>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => appendCollaborator({ first_name: "", last_name: "", email: "", job: "" })}
                  className="px-4 py-2 bg-[#AD46FF] text-white rounded-lg hover:opacity-90 transition"
                >
                  + Ajouter un collaborateur
                </button>
              </div>

              {collaboratorFields.length === 0 && (
                <p className="text-gray-400 text-center py-8">Aucun collaborateur ajouté.</p>
              )}

              <div className="space-y-3">
                {collaboratorFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-900 border border-gray-800 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase text-gray-400 mb-1">Prénom</label>
                      <input
                        type="text"
                        {...registerMovie(`collaborators.${index}.first_name`)}
                        className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg text-sm"
                        placeholder="Prénom"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase text-gray-400 mb-1">Nom</label>
                      <input
                        type="text"
                        {...registerMovie(`collaborators.${index}.last_name`)}
                        className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg text-sm"
                        placeholder="Nom"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        {...registerMovie(`collaborators.${index}.email`)}
                        className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase text-gray-400 mb-1">Rôle</label>
                      <input
                        type="text"
                        {...registerMovie(`collaborators.${index}.job`)}
                        className="bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded-lg text-sm"
                        placeholder="Réalisateur, Acteur..."
                      />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeCollaborator(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCollaboratorsModal(false)}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Conditions de Participation & Politique de Confidentialité</h3>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-gray-300 text-sm">
                <section>
                  <h4 className="text-white font-bold text-base mb-2">1. Conditions de Participation</h4>
                  <p className="mb-2">
                    En soumettant votre film au Festival MARS AI, vous acceptez que :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Votre film doit être une création originale utilisant l'intelligence artificielle</li>
                    <li>La durée maximale est de 2 minutes (120 secondes)</li>
                    <li>Vous détenez tous les droits nécessaires sur votre œuvre</li>
                    <li>Le festival peut utiliser des extraits à des fins promotionnelles</li>
                    <li>La décision du jury est finale et sans appel</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-white font-bold text-base mb-2">2. Droits d'Auteur</h4>
                  <p>
                    Vous conservez tous les droits d'auteur sur votre film. Le festival obtient uniquement 
                    une licence non-exclusive pour diffuser votre œuvre dans le cadre de l'événement et de sa promotion.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold text-base mb-2">3. Politique de Confidentialité</h4>
                  <p className="mb-2">
                    Vos données personnelles sont collectées uniquement pour :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>La gestion de votre inscription au festival</li>
                    <li>La communication concernant votre soumission</li>
                    <li>Les statistiques anonymisées du festival</li>
                  </ul>
                  <p className="mt-2">
                    Vos données ne seront jamais vendues ou partagées avec des tiers sans votre consentement explicite.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold text-base mb-2">4. Utilisation de l'IA</h4>
                  <p>
                    Vous devez indiquer de manière transparente les outils d'IA utilisés dans la création de votre film 
                    et la méthodologie employée. Le non-respect de cette obligation peut entraîner la disqualification.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold text-base mb-2">5. Contact</h4>
                  <p>
                    Pour toute question concernant ces conditions ou vos données personnelles, contactez-nous à : 
                    <a href="mailto:contact@marsaifestival.com" className="text-[#AD46FF] hover:text-[#F6339A] ml-1">
                      contact@marsaifestival.com
                    </a>
                  </p>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2 bg-[#AD46FF] text-white rounded-lg hover:opacity-90 transition"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedMovie && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{selectedMovie.title}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedMovie(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#AD46FF] text-white rounded-lg text-xs hover:bg-[#F6339A]"
                  onClick={() => setShowEditMovieModal(true)}
                >
                  Modifier le film / vignettes
                </button>
              </div>
                      {/* Modale upload/update film/vignettes */}
                      {showEditMovieModal && (
                        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-white">Mettre à jour le film ou les vignettes</h3>
                              <button
                                type="button"
                                onClick={() => setShowEditMovieModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                              >✕</button>
                            </div>
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData();
                                if (editMovieFiles.filmFile) formData.append("filmFile", editMovieFiles.filmFile);
                                editMovieFiles.thumbnails.forEach((file) => {
                                  if (file) formData.append("thumbnails", file);
                                });
                                try {
                                  await fetch(`/api/movies/${selectedMovie.id_movie}`, {
                                    method: "PUT",
                                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                                    body: formData,
                                  });
                                  setShowEditMovieModal(false);
                                  setSelectedMovie(null);
                                  const moviesRes = await getMyMovies();
                                  setMovies(moviesRes.data || []);
                                } catch {
                                  alert("Erreur lors de la mise à jour du film.");
                                }
                              }}
                            >
                              <div className="mb-4">
                                <label className="text-white font-semibold mb-1 text-xs uppercase">Nouveau fichier du film</label>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={e => setEditMovieFiles(f => ({ ...f, filmFile: e.target.files?.[0] }))}
                                  className="block w-full text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="text-white font-semibold mb-1 text-xs uppercase">Nouvelles vignettes (max 3)</label>
                                {[0,1,2].map(idx => (
                                  <input
                                    key={idx}
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      setEditMovieFiles(f => {
                                        const thumbs = [...f.thumbnails];
                                        thumbs[idx] = file;
                                        return { ...f, thumbnails: thumbs };
                                      });
                                    }}
                                    className="block w-full text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1 mb-2"
                                  />
                                ))}
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <button
                                  type="button"
                                  onClick={() => setShowEditMovieModal(false)}
                                  className="px-4 py-2 border border-gray-700 rounded-lg text-white"
                                >Annuler</button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-[#AD46FF] text-white rounded-lg hover:bg-[#F6339A]"
                                >Sauvegarder</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
              <p className="text-gray-400 mt-1 text-sm line-clamp-2">{selectedMovie.synopsis || selectedMovie.description || "-"}</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                    <div><span className="text-gray-400">Durée:</span> {selectedMovie.duration ? `${selectedMovie.duration}s` : "-"}</div>
                    <div><span className="text-gray-400">Langue:</span> {selectedMovie.main_language || "-"}</div>
                    <div><span className="text-gray-400">Nationalité:</span> {selectedMovie.nationality || "-"}</div>
                    <div><span className="text-gray-400">Statut:</span> {selectedMovie.selection_status || "submitted"}</div>
                    <div><span className="text-gray-400">Outils IA:</span> {selectedMovie.ai_tool || "-"}</div>
                    <div><span className="text-gray-400">Méthodologie:</span> {selectedMovie.workshop || "-"}</div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    {getTrailer(selectedMovie) && (
                      <span className="text-xs text-gray-400">
                        Trailer : cliquez pour plein écran
                      </span>
                    )}
                    {selectedMovie.subtitle ? (
                      <a className="text-[#AD46FF] hover:text-[#F6339A] font-semibold" href={`${uploadBase}/${selectedMovie.subtitle}`} target="_blank" rel="noreferrer">Sous-titres</a>
                    ) : null}
                    {selectedMovie.youtube_link && (
                      <a className="text-[#AD46FF] hover:text-[#F6339A] font-semibold" href={selectedMovie.youtube_link} target="_blank" rel="noreferrer">YouTube</a>
                    )}
                  </div>
                </div>

                {(getTrailer(selectedMovie) || selectedMovie.youtube_link) && (
                  <div>
                    {getTrailer(selectedMovie) ? (
                      <VideoPreview
                        title={selectedMovie.title}
                        src={`${uploadBase}/${getTrailer(selectedMovie)}`}
                        poster={getPoster(selectedMovie) || undefined}
                        openMode="fullscreen"
                      />
                    ) : (
                      <a className="text-[#AD46FF] hover:text-[#F6339A]" href={selectedMovie.youtube_link} target="_blank" rel="noreferrer">
                        Ouvrir la vidéo
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 border-t border-gray-800 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm uppercase text-gray-400">Collaborateurs</h4>
                  <button
                    type="button"
                    onClick={() => startEditCollaborators(selectedMovie)}
                    className="text-sm text-[#AD46FF] hover:text-[#F6339A]"
                  >
                    Éditer
                  </button>
                </div>
                {selectedMovie.Collaborators?.length ? (
                  <ul className="mt-2 text-sm text-gray-300 space-y-1">
                    {selectedMovie.Collaborators.map((collab) => (
                      <li key={collab.id_collaborator}>
                        {collab.first_name} {collab.last_name} {collab.job ? `— ${collab.job}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">Aucun collaborateur.</p>
                )}

                {editingMovieId === selectedMovie.id_movie && (
                  <div className="mt-4 space-y-3">
                    {(collabDrafts[selectedMovie.id_movie] || []).map((collab, idx) => (
                      <div key={`${selectedMovie.id_movie}-collab-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-900 border border-gray-800 p-3 rounded-lg">
                        <input
                          type="text"
                          placeholder="Prénom"
                          value={collab.first_name}
                          onChange={(e) => updateDraftField(selectedMovie.id_movie, idx, "first_name", e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Nom"
                          value={collab.last_name}
                          onChange={(e) => updateDraftField(selectedMovie.id_movie, idx, "last_name", e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={collab.email}
                          onChange={(e) => updateDraftField(selectedMovie.id_movie, idx, "email", e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Rôle"
                          value={collab.job}
                          onChange={(e) => updateDraftField(selectedMovie.id_movie, idx, "job", e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
                        />
                        <div className="md:col-span-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeDraftCollaborator(selectedMovie.id_movie, idx)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => addDraftCollaborator(selectedMovie.id_movie)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                      >
                        Ajouter un collaborateur
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCollaboratorsMutation.mutate({
                          id: selectedMovie.id_movie,
                          collaborators: collabDrafts[selectedMovie.id_movie] || []
                        })}
                        className="px-4 py-2 bg-[#AD46FF] text-white rounded-lg hover:opacity-90"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMovieId(null)}
                        className="px-4 py-2 border border-gray-700 rounded-lg"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
