/**
 * ProducerHome.jsx — Espace producteur
 *
 * BUGS CORRIGÉS :
 *  ✓ Thumbnails : fd.append("thumbnails") → fd.append("thumbnail1/2/3")
 *    (le backend multer attend des champs nommés thumbnail1, thumbnail2, thumbnail3)
 *  ✓ Gestion des fichiers thumbnails sortie de useFieldArray (FileList confus)
 *    → useState simple pour les fichiers image
 *  ✓ filmFile géré via ref pour éviter la confusion FileList de RHF
 *  ✓ isStep2Valid() : vérifie acceptTerms (pas acceptRules inexistant)
 *  ✓ handleResetForm : setThumbnailNames tableau (pas setThumbnail1/2/3Name)
 *  ✓ UPLOAD_BASE centralisé
 */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { VideoPreview } from "../../components/VideoPreview.jsx";
// NOTE: Navbar is rendered by ProducerLayout — no import needed here.
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { getCurrentUser, updateCurrentUser } from "../../api/users";
import {
  createMovie,
  getMyMovies,
  updateMovieCollaborators,
} from "../../api/movies";
import { getCategories } from "../../api/videos.js";
import { UPLOAD_BASE } from "../../utils/constants.js";

/* ─── Schéma Zod ──────────────────────────────────────── */
const movieSchema = z.object({
  filmTitleOriginal: z.string().min(1, "Le titre du film est obligatoire"),
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
  synopsisOriginal: z.string().min(1, "Le synopsis est obligatoire"),
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
        email: z
          .string()
          .email("Adresse e-mail invalide")
          .optional()
          .or(z.literal("")),
        job: z.string().optional(),
      }),
    )
    .optional(),
  subtitlesSrt: z.any().optional(),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter les conditions de participation",
  }),
});

/* ─── Statuts pipeline ─────────────────────────────────── */
const STATUS_MAP = {
  submitted: { label: "Soumis", color: "bg-zinc-700", dot: "#a1a1aa" },
  assigned: {
    label: "En cours d'évaluation",
    color: "bg-sky-700",
    dot: "#38bdf8",
  },
  to_discuss: { label: "En discussion", color: "bg-amber-700", dot: "#fbbf24" },
  candidate: { label: "Candidat", color: "bg-violet-700", dot: "#a78bfa" },
  selected: { label: "Sélectionné ✓", color: "bg-emerald-700", dot: "#34d399" },
  finalist: { label: "Finaliste ⭐", color: "bg-orange-700", dot: "#fb923c" },
  refused: { label: "Non retenu", color: "bg-red-700", dot: "#f87171" },
  awarded: { label: "Primé 🏆", color: "bg-yellow-600", dot: "#facc15" },
};
const getStatusBadge = (s) =>
  STATUS_MAP[s] || {
    label: "En attente",
    color: "bg-zinc-700",
    dot: "#a1a1aa",
  };

/* ════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════════════ */
export default function ProducerHome() {
  const { t } = useTranslation();

  /* États utilisateur */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileSuccess, setProfileSuccess] = useState(null);

  /* États films */
  const [movies, setMovies] = useState([]);
  const [movieSuccess, setMovieSuccess] = useState(null);
  const [movieError, setMovieError] = useState(null);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [collabDrafts, setCollabDrafts] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /* ── États formulaire multi-étapes ── */
  const [formStep, setFormStep] = useState(1);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  /* ── FIX: fichiers gérés hors RHF ── */
  /* filmFile via ref pour éviter les problèmes de FileList RHF */
  const filmFileRef = useRef(null);
  const subtitleRef = useRef(null);
  const [filmFileName, setFilmFileName] = useState("");
  const [subtitlesName, setSubtitlesName] = useState("");

  /* FIX PRINCIPAL: thumbnails = 3 slots nommés (backend attend thumbnail1/2/3) */
  const [thumbFiles, setThumbFiles] = useState([null, null, null]);
  const [thumbNames, setThumbNames] = useState(["", "", ""]);
  const thumbRefs = [useRef(null), useRef(null), useRef(null)];

  /* ── React Hook Form ── */
  const {
    register: reg,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(movieSchema) });

  const filmTitle = useWatch({ control, name: "filmTitleOriginal" });
  const durationSecs = useWatch({ control, name: "durationSeconds" });
  const synopsisOrig = useWatch({ control, name: "synopsisOriginal" });
  const aiClassif = useWatch({ control, name: "aiClassification" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const acceptTerms = useWatch({ control, name: "acceptTerms" });

  const {
    fields: collabFields,
    append: appendCollab,
    remove: removeCollab,
  } = useFieldArray({ control, name: "collaborators" });

  /* ── Catégories ── */
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const categories = categoriesData?.data || [];

  /* ── Mutation soumission film ── */
  const createMovieMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();

      /* Champs texte */
      fd.append("filmTitleOriginal", data.filmTitleOriginal || "");
      fd.append("durationSeconds", String(data.durationSeconds || ""));
      fd.append("filmLanguage", data.filmLanguage || "");
      fd.append("releaseYear", data.releaseYear || "");
      fd.append("nationality", data.nationality || "");
      fd.append("translation", data.translation || "");
      fd.append("youtubeLink", data.youtubeLink || "");
      fd.append("synopsisOriginal", data.synopsisOriginal || "");
      fd.append("synopsisEnglish", data.synopsisEnglish || "");
      fd.append("aiClassification", data.aiClassification || "");
      fd.append("aiStack", data.aiStack || "");
      fd.append("aiMethodology", data.aiMethodology || "");

      if (data.knownByMarsAi) fd.append("knownByMarsAi", data.knownByMarsAi);
      if (data.categoryId)
        fd.append("categories", JSON.stringify([Number(data.categoryId)]));

      if (data.collaborators?.length) {
        const clean = data.collaborators.filter(
          (c) => c?.first_name || c?.last_name || c?.email,
        );
        if (clean.length) fd.append("collaborators", JSON.stringify(clean));
      }

      /* FIX: fichier vidéo via ref */
      const filmFile = filmFileRef.current?.files?.[0];
      if (filmFile) fd.append("filmFile", filmFile);

      /* FIX PRINCIPAL: thumbnail1, thumbnail2, thumbnail3 séparés */
      thumbFiles.forEach((file, i) => {
        if (file) fd.append(`thumbnail${i + 1}`, file);
      });

      /* Sous-titres */
      const subFile = subtitleRef.current?.files?.[0];
      if (subFile) fd.append("subtitlesSrt", subFile);

      return await createMovie(fd);
    },
    onSuccess: async () => {
      setMovieError(null);
      setMovieSuccess("Film soumis avec succès !");
      setShowForm(false);
      resetForm();
      try {
        const res = await getMyMovies();
        setMovies(res.data || []);
      } catch {
        /* ignore */
      }
    },
    onError: (err) => {
      setMovieSuccess(null);
      setMovieError(
        err?.response?.data?.error ||
          err?.message ||
          "Erreur lors de la soumission.",
      );
    },
  });

  /* ── Mutation collaborateurs ── */
  const updateCollabMutation = useMutation({
    mutationFn: ({ id, collaborators }) =>
      updateMovieCollaborators(id, collaborators),
    onSuccess: async () => {
      try {
        const res = await getMyMovies();
        setMovies(res.data || []);
      } catch {
        /* ignore */
      }
      setEditingMovieId(null);
    },
    onError: () =>
      setMovieError("Erreur lors de la mise à jour des collaborateurs."),
  });

  /* ── Chargement initial ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous n'êtes pas authentifié.");
      setLoading(false);
      return;
    }
    Promise.all([getCurrentUser(), getMyMovies()])
      .then(([uRes, mRes]) => {
        setUser(uRes.data);
        setProfileForm(uRes.data);
        setMovies(mRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger vos données.");
        setLoading(false);
      });
  }, []);

  /* ── Helpers ── */
  function resetForm() {
    setFormStep(1);
    reset();
    setFilmFileName("");
    setSubtitlesName("");
    setThumbFiles([null, null, null]);
    setThumbNames(["", "", ""]);
    thumbRefs.forEach((r) => {
      if (r.current) r.current.value = "";
    });
    if (filmFileRef.current) filmFileRef.current.value = "";
    if (subtitleRef.current) subtitleRef.current.value = "";
  }

  const isStep1Valid = () =>
    filmTitle?.trim().length > 0 &&
    durationSecs > 0 &&
    durationSecs <= 120 &&
    synopsisOrig?.trim().length > 0;

  const isStep2Valid = () =>
    acceptTerms === true &&
    aiClassif?.trim().length > 0 &&
    categoryId?.toString().trim().length > 0;

  function handleNextStep() {
    if (!isStep1Valid()) {
      alert("Remplissez le titre, la durée (≤120s) et le synopsis.");
      return;
    }
    setFormStep(2);
  }

  /* ── Profil ── */
  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
  }
  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileSuccess(null);
    try {
      const toSend = { ...profileForm };
      delete toSend.email;
      delete toSend.role;
      const res = await updateCurrentUser(toSend);
      setUser(res.data);
      setEditMode(false);
      setProfileSuccess("Profil mis à jour.");
      if (res.data.first_name)
        localStorage.setItem("firstName", res.data.first_name);
    } catch {
      setError("Erreur lors de la mise à jour du profil.");
    }
  }

  /* ── Collaborateurs (film existant) ── */
  function startEditCollaborators(movie) {
    const existing = (movie.Collaborators || []).map((c) => ({
      first_name: c.first_name || "",
      last_name: c.last_name || "",
      email: c.email || "",
      job: c.job || "",
    }));
    setCollabDrafts((p) => ({
      ...p,
      [movie.id_movie]: existing.length
        ? existing
        : [{ first_name: "", last_name: "", email: "", job: "" }],
    }));
    setEditingMovieId(movie.id_movie);
  }

  function updateDraftField(movieId, idx, field, value) {
    setCollabDrafts((p) => {
      const list = [...(p[movieId] || [])];
      if (!list[idx]) return p;
      list[idx] = { ...list[idx], [field]: value };
      return { ...p, [movieId]: list };
    });
  }

  const getPoster = (movie) =>
    movie.thumbnail
      ? `${UPLOAD_BASE}/${movie.thumbnail}`
      : movie.display_picture
        ? `${UPLOAD_BASE}/${movie.display_picture}`
        : movie.picture1
          ? `${UPLOAD_BASE}/${movie.picture1}`
          : movie.picture2
            ? `${UPLOAD_BASE}/${movie.picture2}`
            : movie.picture3
              ? `${UPLOAD_BASE}/${movie.picture3}`
              : null;

  const getTrailer = (m) =>
    m.trailer ||
    m.trailer_video ||
    m.trailerVideo ||
    m.filmFile ||
    m.video ||
    null;

  /* ── États de chargement ── */
  if (loading)
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#AD46FF] mx-auto mb-3" />
          <p className="text-white/40 text-sm">Chargement de votre espace…</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <p className="text-white/40">Utilisateur introuvable.</p>
      </div>
    );

  /* ════════════════════════════════════════════════════════
     RENDU
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="min-h-screen bg-[#070709] text-white pt-28 pb-20 px-4 md:pt-32">
        <style>{`
          .field-input {
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            color: white;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 14px;
            transition: border-color .2s;
            outline: none;
          }
          .field-input:focus { border-color: rgba(173,70,255,.4); }
          .field-input.err   { border-color: rgba(239,68,68,.5); background: rgba(239,68,68,.04); }
          .field-input option { background: #0f1014; }
          .file-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 16px; border-radius: 10px;
            background: rgba(173,70,255,.1); border: 1px solid rgba(173,70,255,.25);
            color: #c084fc; font-size: 13px; cursor: pointer; white-space: nowrap;
            transition: all .2s;
          }
          .file-btn:hover { background: rgba(173,70,255,.2); border-color: rgba(173,70,255,.45); }
          .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; }
        `}</style>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* ── En-tête ── */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#AD46FF] to-[#F6339A] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-xs text-white/35">{user.email}</p>
            </div>
            <span className="ml-auto text-[10px] font-semibold px-3 py-1 bg-[#AD46FF]/15 text-[#AD46FF] border border-[#AD46FF]/25 rounded-full">
              Producteur
            </span>
          </div>

          {/* ── Section profil ── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">
                Profil
              </h2>
              <button
                onClick={() => setEditMode((v) => !v)}
                className="text-xs text-[#AD46FF] hover:text-[#F6339A] transition"
              >
                {editMode ? "Annuler" : "Modifier"}
              </button>
            </div>

            {profileSuccess && (
              <div className="mb-4 bg-emerald-900/20 border border-emerald-700/30 text-emerald-300 px-4 py-2 rounded-lg text-xs">
                {profileSuccess}
              </div>
            )}

            {editMode ? (
              <form
                onSubmit={handleSaveProfile}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {[
                  { name: "first_name", label: "Prénom", type: "text" },
                  { name: "last_name", label: "Nom", type: "text" },
                  { name: "phone", label: "Téléphone", type: "text" },
                  { name: "nationality", label: "Nationalité", type: "text" },
                  { name: "biography", label: "Biographie", type: "textarea" },
                  { name: "website", label: "Site web", type: "text" },
                ].map(({ name, label, type }) => (
                  <div
                    key={name}
                    className={
                      type === "textarea"
                        ? "md:col-span-2 flex flex-col gap-1"
                        : "flex flex-col gap-1"
                    }
                  >
                    <label className="text-[10px] uppercase tracking-widest text-white/30">
                      {label}
                    </label>
                    {type === "textarea" ? (
                      <textarea
                        name={name}
                        value={profileForm[name] || ""}
                        onChange={handleProfileChange}
                        rows={3}
                        className="field-input resize-none"
                      />
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={profileForm[name] || ""}
                        onChange={handleProfileChange}
                        className="field-input"
                      />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-5 py-2 border border-white/10 text-white/60 rounded-lg text-sm hover:bg-white/5 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[
                  { label: "Téléphone", value: user.phone },
                  { label: "Nationalité", value: user.nationality },
                  { label: "Site web", value: user.website },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1">
                      {label}
                    </p>
                    <p className="text-white/60">{value || "—"}</p>
                  </div>
                ))}
                {user.biography && (
                  <div className="md:col-span-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/25 mb-1">
                      Biographie
                    </p>
                    <p className="text-white/55 leading-relaxed">
                      {user.biography}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mes films ── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">
                Mes films
                {movies.length > 0 && (
                  <span className="ml-2 text-[#AD46FF]">({movies.length})</span>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                  setMovieError(null);
                  setMovieSuccess(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
              >
                <span className="text-lg leading-none">+</span>
                Soumettre un film
              </button>
            </div>

            {movieSuccess && !showForm && (
              <div className="mb-4 bg-emerald-900/20 border border-emerald-700/30 text-emerald-300 px-4 py-2 rounded-lg text-sm">
                {movieSuccess}
              </div>
            )}

            {movies.length === 0 && !showForm ? (
              <div className="flex flex-col items-center py-16 text-white/20 gap-3">
                <span className="text-5xl">🎬</span>
                <p className="text-sm">
                  Aucun film soumis. Cliquez sur « Soumettre un film » pour
                  commencer.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movies.map((movie) => {
                  const badge = getStatusBadge(movie.selection_status);
                  const poster = getPoster(movie);
                  return (
                    <button
                      key={movie.id_movie}
                      onClick={() => setSelectedMovie(movie)}
                      className="bg-white/[0.025] border border-white/[0.06] rounded-xl overflow-hidden hover:border-[#AD46FF]/40 transition group text-left"
                    >
                      <div className="h-36 bg-black/40 relative overflow-hidden">
                        {poster ? (
                          <img
                            src={poster}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/15 text-4xl">
                            🎬
                          </div>
                        )}
                        {/* Status dot */}
                        <div className="absolute bottom-2 right-2">
                          <span
                            className={`text-[9px] font-bold px-2 py-1 rounded-full text-white ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-[#AD46FF] transition">
                          {movie.title}
                        </p>
                        <p className="text-xs text-white/35 mt-1 line-clamp-2">
                          {movie.synopsis ||
                            movie.description ||
                            "Aucun synopsis"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-white/25">
                          {movie.duration && <span>{movie.duration}s</span>}
                          {movie.main_language && (
                            <span>{movie.main_language}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Formulaire de soumission ── */}
          {showForm && (
            <div className="card p-6">
              {/* Progression des étapes */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-6">
                  {[
                    { n: 1, label: "Données du film" },
                    { n: 2, label: "IA & Fichiers" },
                  ].map(({ n, label }, i) => (
                    <div key={n} className="flex items-center gap-6">
                      {i > 0 && (
                        <div
                          className={`w-20 h-px ${formStep >= n ? "bg-gradient-to-r from-[#AD46FF] to-[#F6339A]" : "bg-white/10"}`}
                        />
                      )}
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                            formStep >= n
                              ? "bg-gradient-to-br from-[#AD46FF] to-[#F6339A] text-white shadow-lg shadow-[#AD46FF]/30"
                              : "bg-white/[0.06] text-white/25 border border-white/10"
                          }`}
                        >
                          {formStep > n ? "✓" : n}
                        </div>
                        <span
                          className={`text-[10px] whitespace-nowrap ${formStep >= n ? "text-white/70" : "text-white/20"}`}
                        >
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {movieError && (
                <div className="mb-5 bg-red-900/20 border border-red-700/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {movieError}
                </div>
              )}

              <form
                onSubmit={handleSubmit((data) =>
                  createMovieMutation.mutate(data),
                )}
                className="space-y-6"
              >
                {/* ═══════ ÉTAPE 1 ═══════ */}
                {formStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Fld
                      label="Titre original *"
                      error={errors.filmTitleOriginal}
                    >
                      <input
                        type="text"
                        placeholder="TITRE ORIGINAL"
                        {...reg("filmTitleOriginal")}
                        className={`field-input ${errors.filmTitleOriginal ? "err" : ""}`}
                      />
                    </Fld>

                    <Fld
                      label="Durée (secondes) *"
                      hint="120 s maximum"
                      error={errors.durationSeconds}
                    >
                      <input
                        type="number"
                        placeholder="60"
                        max={120}
                        {...reg("durationSeconds")}
                        className={`field-input ${errors.durationSeconds ? "err" : ""}`}
                      />
                    </Fld>

                    <Fld label="Langue">
                      <input
                        type="text"
                        placeholder="Français"
                        {...reg("filmLanguage")}
                        className="field-input"
                      />
                    </Fld>

                    <Fld label="Année">
                      <input
                        type="number"
                        placeholder="2026"
                        {...reg("releaseYear")}
                        className="field-input"
                      />
                    </Fld>

                    <Fld label="Nationalité">
                      <input
                        type="text"
                        placeholder="France"
                        {...reg("nationality")}
                        className="field-input"
                      />
                    </Fld>

                    <Fld label="Comment nous avez-vous connu ?">
                      <select {...reg("knownByMarsAi")} className="field-input">
                        <option value="">Sélectionner</option>
                        <option value="Par un ami">Par un ami</option>
                        <option value="Vu une publicité du festival">
                          Via une publicité
                        </option>
                        <option value="Via le site internet ou application de l'IA">
                          Via le site / appli IA
                        </option>
                      </select>
                    </Fld>

                    <Fld label="Catégorie *" error={errors.categoryId}>
                      <select
                        {...reg("categoryId")}
                        className={`field-input ${errors.categoryId ? "err" : ""}`}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((c) => (
                          <option key={c.id_categorie} value={c.id_categorie}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Fld>

                    <Fld label="Traduction du titre">
                      <input
                        type="text"
                        placeholder="English title"
                        {...reg("translation")}
                        className="field-input"
                      />
                    </Fld>

                    <Fld label="Lien YouTube" className="md:col-span-1">
                      <input
                        type="text"
                        placeholder="https://youtube.com/…"
                        {...reg("youtubeLink")}
                        className="field-input"
                      />
                    </Fld>

                    <Fld
                      label="Synopsis original * (300 car.)"
                      className="md:col-span-3"
                      error={errors.synopsisOriginal}
                    >
                      <textarea
                        rows={3}
                        maxLength={300}
                        placeholder="Résumez votre film en quelques lignes…"
                        {...reg("synopsisOriginal")}
                        className={`field-input resize-none ${errors.synopsisOriginal ? "err" : ""}`}
                      />
                    </Fld>

                    <Fld
                      label="Synopsis en anglais (300 car.)"
                      className="md:col-span-3"
                    >
                      <textarea
                        rows={3}
                        maxLength={300}
                        placeholder="Summary in English…"
                        {...reg("synopsisEnglish")}
                        className="field-input resize-none"
                      />
                    </Fld>

                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-3 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-xl font-semibold hover:opacity-90 transition"
                      >
                        Continuer →
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══════ ÉTAPE 2 ═══════ */}
                {formStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Classification IA */}
                      <Fld
                        label="Classification IA *"
                        className="md:col-span-2"
                        error={errors.aiClassification}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            {
                              value: "integrale",
                              label: "100 % IA générative",
                            },
                            { value: "hybride", label: "Hybride (réel + IA)" },
                          ].map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 cursor-pointer hover:border-[#AD46FF]/40 transition"
                            >
                              <input
                                type="radio"
                                value={opt.value}
                                {...reg("aiClassification")}
                                className="accent-[#AD46FF]"
                              />
                              <span className="text-sm text-white/80">
                                {opt.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </Fld>

                      <Fld label="Outils IA utilisés" className="md:col-span-2">
                        <textarea
                          rows={2}
                          maxLength={500}
                          placeholder="ex. : Midjourney, Runway, ElevenLabs, Sora…"
                          {...reg("aiStack")}
                          className="field-input resize-none"
                        />
                      </Fld>

                      <Fld
                        label="Méthodologie créative"
                        className="md:col-span-2"
                      >
                        <textarea
                          rows={2}
                          maxLength={500}
                          placeholder="Décrivez l'interaction humain-machine dans votre processus…"
                          {...reg("aiMethodology")}
                          className="field-input resize-none"
                        />
                      </Fld>

                      {/* Collaborateurs */}
                      <Fld
                        label={`Collaborateurs (${collabFields.length})`}
                        className="md:col-span-2"
                      >
                        <button
                          type="button"
                          onClick={() => setShowCollaboratorsModal(true)}
                          className="field-input text-left text-white/50"
                        >
                          {collabFields.length === 0
                            ? "Gérer les collaborateurs (facultatif)"
                            : `${collabFields.length} collaborateur(s) — cliquer pour modifier`}
                        </button>
                      </Fld>
                    </div>

                    {/* ── Fichiers ── */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase tracking-widest text-white/30">
                        Fichiers
                      </h3>

                      {/* Fichier film */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-white/50">
                          Fichier vidéo
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="file-btn">
                            <span>📁</span> Choisir
                            <input
                              ref={filmFileRef}
                              type="file"
                              accept="video/*"
                              className="sr-only"
                              onChange={(e) =>
                                setFilmFileName(e.target.files?.[0]?.name || "")
                              }
                            />
                          </label>
                          <span className="text-xs text-white/30 truncate max-w-xs">
                            {filmFileName || "Aucun fichier sélectionné"}
                          </span>
                        </div>
                      </div>

                      {/* FIX: 3 vignettes nommées thumbnail1/2/3 */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-white/50">
                          Vignettes (jusqu'à 3 images)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="flex flex-col gap-1">
                              <label className="file-btn justify-center">
                                {thumbFiles[i] ? (
                                  <span className="text-emerald-400">
                                    ✓ Image {i + 1}
                                  </span>
                                ) : (
                                  <span>📷 Image {i + 1}</span>
                                )}
                                <input
                                  ref={thumbRefs[i]}
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setThumbFiles((p) => {
                                      const n = [...p];
                                      n[i] = file || null;
                                      return n;
                                    });
                                    setThumbNames((p) => {
                                      const n = [...p];
                                      n[i] = file?.name || "";
                                      return n;
                                    });
                                  }}
                                />
                              </label>
                              {thumbNames[i] && (
                                <p className="text-[9px] text-white/25 truncate text-center">
                                  {thumbNames[i]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sous-titres */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-white/50">
                          Sous-titres (.srt) — optionnel
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="file-btn">
                            <span>📄</span> Choisir
                            <input
                              ref={subtitleRef}
                              type="file"
                              accept=".srt"
                              className="sr-only"
                              onChange={(e) =>
                                setSubtitlesName(
                                  e.target.files?.[0]?.name || "",
                                )
                              }
                            />
                          </label>
                          <span className="text-xs text-white/30 truncate max-w-xs">
                            {subtitlesName || "Aucun fichier sélectionné"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        {...reg("acceptTerms")}
                        className="w-4 h-4 cursor-pointer accent-[#AD46FF]"
                      />
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm text-white/60 cursor-pointer flex-1"
                      >
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
                    {errors.acceptTerms && (
                      <p className="text-red-400 text-xs">
                        {errors.acceptTerms.message}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="px-6 py-3 border border-white/10 text-white/60 rounded-xl hover:bg-white/[0.04] transition font-semibold"
                      >
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        disabled={createMovieMutation.isPending || !acceptTerms}
                        className="flex-1 py-3 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-40"
                      >
                        {createMovieMutation.isPending
                          ? "Envoi en cours…"
                          : "Soumettre le film"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        className="px-4 py-3 border border-white/10 text-white/30 rounded-xl hover:bg-white/[0.04] transition text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Modale collaborateurs ── */}
      {showCollaboratorsModal && (
        <Modal
          title="Collaborateurs"
          onClose={() => setShowCollaboratorsModal(false)}
          maxW="max-w-4xl"
        >
          <button
            type="button"
            onClick={() =>
              appendCollab({
                first_name: "",
                last_name: "",
                email: "",
                job: "",
              })
            }
            className="mb-4 px-4 py-2 bg-[#AD46FF]/15 text-[#AD46FF] border border-[#AD46FF]/25 rounded-lg text-sm hover:bg-[#AD46FF]/25 transition"
          >
            + Ajouter un collaborateur
          </button>
          {collabFields.length === 0 && (
            <p className="text-white/30 text-center py-8 text-sm">
              Aucun collaborateur ajouté.
            </p>
          )}
          <div className="space-y-3">
            {collabFields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl"
              >
                {[
                  {
                    name: `collaborators.${idx}.first_name`,
                    placeholder: "Prénom",
                  },
                  {
                    name: `collaborators.${idx}.last_name`,
                    placeholder: "Nom",
                  },
                  {
                    name: `collaborators.${idx}.email`,
                    placeholder: "email@exemple.com",
                  },
                  { name: `collaborators.${idx}.job`, placeholder: "Rôle" },
                ].map(({ name, placeholder }) => (
                  <input
                    key={name}
                    type="text"
                    {...reg(name)}
                    placeholder={placeholder}
                    className="field-input"
                  />
                ))}
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeCollab(idx)}
                    className="text-red-400/70 hover:text-red-400 text-xs transition"
                  >
                    ✕ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setShowCollaboratorsModal(false)}
              className="px-5 py-2 bg-white/[0.05] border border-white/[0.08] text-white/70 rounded-lg hover:bg-white/[0.09] transition text-sm"
            >
              Fermer
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modale conditions ── */}
      {showTermsModal && (
        <Modal
          title="Conditions de participation"
          onClose={() => setShowTermsModal(false)}
          maxW="max-w-4xl"
        >
          <div className="space-y-5 text-white/55 text-sm leading-relaxed">
            {[
              {
                title: "1. Conditions de participation",
                content: [
                  "Votre film doit être une création originale utilisant l'intelligence artificielle.",
                  "La durée maximale est de 2 minutes (120 secondes).",
                  "Vous détenez tous les droits nécessaires sur votre œuvre.",
                  "Le festival peut utiliser des extraits à des fins promotionnelles.",
                  "La décision du jury est définitive et sans appel.",
                ],
              },
              {
                title: "2. Droits d'auteur",
                content: [
                  "Vous conservez tous les droits d'auteur sur votre film. Le festival obtient uniquement une licence non exclusive pour diffuser votre œuvre dans le cadre de l'événement et de sa promotion.",
                ],
              },
              {
                title: "3. Transparence IA",
                content: [
                  "Vous devez indiquer de façon transparente les outils d'IA utilisés ainsi que la méthodologie employée. Le non-respect peut entraîner la disqualification.",
                ],
              },
              {
                title: "4. Contact",
                content: ["Pour toute question : contact@marsaifestival.com"],
              },
            ].map(({ title, content }) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-2">{title}</h4>
                <ul className="space-y-1 list-disc list-inside ml-2">
                  {content.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="px-6 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
            >
              J'ai compris
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modale détail film ── */}
      {selectedMovie && (
        <Modal
          title={selectedMovie.title}
          onClose={() => {
            setSelectedMovie(null);
            setEditingMovieId(null);
          }}
          maxW="max-w-5xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Infos */}
            <div className="space-y-4">
              {/* Status */}
              {(() => {
                const badge = getStatusBadge(selectedMovie.selection_status);
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/35">Statut :</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })()}

              {/* Infos techniques */}
              <div className="grid grid-cols-2 gap-3 text-xs text-white/55">
                {[
                  [
                    "Durée",
                    selectedMovie.duration ? `${selectedMovie.duration}s` : "—",
                  ],
                  ["Langue", selectedMovie.main_language || "—"],
                  ["Nationalité", selectedMovie.nationality || "—"],
                  ["Outil IA", selectedMovie.ai_tool || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-white/25 text-[9px] uppercase mb-0.5">
                      {k}
                    </p>
                    <p>{v}</p>
                  </div>
                ))}
              </div>

              {/* Synopsis */}
              {(selectedMovie.synopsis || selectedMovie.description) && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/25 mb-1">
                    Synopsis
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {selectedMovie.synopsis || selectedMovie.description}
                  </p>
                </div>
              )}

              {/* Liens */}
              <div className="flex flex-wrap gap-3">
                {selectedMovie.subtitle && (
                  <a
                    href={`${UPLOAD_BASE}/${selectedMovie.subtitle}`}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="text-xs text-[#AD46FF] hover:text-[#F6339A]"
                  >
                    📄 Sous-titres
                  </a>
                )}
                {selectedMovie.youtube_link && (
                  <a
                    href={selectedMovie.youtube_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#AD46FF] hover:text-[#F6339A]"
                  >
                    ▶ YouTube
                  </a>
                )}
              </div>

              {/* Collaborateurs */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] uppercase tracking-widest text-white/25">
                    Collaborateurs
                  </p>
                  <button
                    type="button"
                    onClick={() => startEditCollaborators(selectedMovie)}
                    className="text-xs text-[#AD46FF] hover:text-[#F6339A]"
                  >
                    Modifier
                  </button>
                </div>
                {selectedMovie.Collaborators?.length ? (
                  <ul className="text-sm text-white/55 space-y-1">
                    {selectedMovie.Collaborators.map((c) => (
                      <li key={c.id_collaborator}>
                        {c.first_name} {c.last_name}
                        {c.job ? ` — ${c.job}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-white/25">Aucun collaborateur.</p>
                )}

                {editingMovieId === selectedMovie.id_movie && (
                  <div className="mt-3 space-y-2">
                    {(collabDrafts[selectedMovie.id_movie] || []).map(
                      (c, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/[0.03] border border-white/[0.06] p-2 rounded-lg"
                        >
                          {["first_name", "last_name", "email", "job"].map(
                            (field) => (
                              <input
                                key={field}
                                type={field === "email" ? "email" : "text"}
                                placeholder={
                                  {
                                    first_name: "Prénom",
                                    last_name: "Nom",
                                    email: "E-mail",
                                    job: "Rôle",
                                  }[field]
                                }
                                value={c[field]}
                                onChange={(e) =>
                                  updateDraftField(
                                    selectedMovie.id_movie,
                                    idx,
                                    field,
                                    e.target.value,
                                  )
                                }
                                className="field-input text-xs"
                              />
                            ),
                          )}
                          <div className="col-span-2 md:col-span-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setCollabDrafts((p) => {
                                  const list = [
                                    ...(p[selectedMovie.id_movie] || []),
                                  ];
                                  list.splice(idx, 1);
                                  return {
                                    ...p,
                                    [selectedMovie.id_movie]: list,
                                  };
                                })
                              }
                              className="text-red-400/60 hover:text-red-400 text-xs"
                            >
                              ✕ Supprimer
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCollabDrafts((p) => ({
                            ...p,
                            [selectedMovie.id_movie]: [
                              ...(p[selectedMovie.id_movie] || []),
                              {
                                first_name: "",
                                last_name: "",
                                email: "",
                                job: "",
                              },
                            ],
                          }))
                        }
                        className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.07] text-white/60 rounded-lg hover:bg-white/[0.08] transition"
                      >
                        + Ajouter
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateCollabMutation.mutate({
                            id: selectedMovie.id_movie,
                            collaborators:
                              collabDrafts[selectedMovie.id_movie] || [],
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#AD46FF]/15 text-[#AD46FF] border border-[#AD46FF]/25 rounded-lg hover:bg-[#AD46FF]/25 transition font-semibold"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMovieId(null)}
                        className="px-3 py-1.5 text-xs border border-white/[0.07] text-white/40 rounded-lg hover:bg-white/[0.04] transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vidéo */}
            {(getTrailer(selectedMovie) || selectedMovie.youtube_link) && (
              <div>
                {getTrailer(selectedMovie) ? (
                  <VideoPreview
                    title={selectedMovie.title}
                    src={`${UPLOAD_BASE}/${getTrailer(selectedMovie)}`}
                    poster={getPoster(selectedMovie) || undefined}
                    openMode="fullscreen"
                  />
                ) : (
                  <a
                    href={selectedMovie.youtube_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#AD46FF] hover:text-[#F6339A] text-sm"
                  >
                    ▶ Ouvrir la vidéo ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

/* ── Mini-composants ──────────────────────────────────── */
function Modal({ title, onClose, maxW = "max-w-4xl", children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`bg-[#0d0f12] border border-white/[0.07] rounded-2xl w-full ${maxW} max-h-[88vh] overflow-y-auto p-6 shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.07] rounded-lg transition text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// inputCls removed — was never called; form uses inline .field-input CSS class.

function Fld({ label, hint, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-[9px] text-white/25 mt-0.5">{hint}</p>}
      {error && (
        <p className="text-[10px] text-red-400 mt-0.5">{error.message}</p>
      )}
    </div>
  );
}
