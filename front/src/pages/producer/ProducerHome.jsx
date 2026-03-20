import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { VideoPreview, PendingVideoPlaceholder } from "../../components/VideoPreview.jsx";
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
import { getPoster, getTrailer, isPending } from "../../utils/movieUtils.js";
import Pagination from "../../components/admin/Pagination.jsx";

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

/* ─── Balanced Tailwind class constants ───────── */
const tw = {
  // Field inputs - comfortable but not oversized
  fieldInput:
    "w-full bg-white/[0.02] border border-white/[0.08] text-white px-4 py-2.5 rounded-lg text-sm transition-all duration-200 outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF] focus:ring-1 focus:ring-[#AD46FF]/20 placeholder:text-white/50",
  fieldInputErr: "border-red-500/50 bg-red-500/[0.02] focus:ring-red-500/20",

  // File buttons - comfortable
  fileBtn:
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#AD46FF]/10 border border-[#AD46FF]/25 text-[#AD46FF] text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[#AD46FF]/15 hover:border-[#AD46FF]/40",

  // Cards with good padding
  card: "bg-white/[0.03] border border-white/[0.07] rounded-xl shadow-lg",

  // Primary button - good size
  primaryBtn:
    "px-5 py-2.5 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#AD46FF]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",

  // Secondary button - good size
  secondaryBtn:
    "px-5 py-2.5 border border-white/[0.08] bg-white/[0.02] text-white/70 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white/90",

  // Cancel button - red
  cancelBtn:
    "px-5 py-2.5 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40",

  // Status badges - readable
  statusBadge:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-lg",

  // Section titles
  sectionTitle: "text-xs font-semibold text-white/50 uppercase tracking-wider",

  // Step indicator - comfortable
  stepIndicator:
    "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-300",

  // Film card - good proportions
  filmCard:
    "bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-[#AD46FF]/40 hover:shadow-lg hover:shadow-[#AD46FF]/10 transition-all hover:scale-[1.02] text-left",
};

const STATUS_MAP = {
  submitted:  { label: "Soumis",               color: "bg-white/5 border border-white/10 text-white/50",                      dot: "bg-white/30"         },
  assigned:   { label: "En cours d'évaluation",         color: "bg-sky-500/15 border border-sky-500/25 text-sky-300",                  dot: "bg-sky-400"          },
  to_discuss: { label: "En discussion",         color: "bg-amber-500/15 border border-amber-500/25 text-amber-300",            dot: "bg-amber-400"        },
  candidate:  { label: "Candidat",              color: "bg-violet-500/15 border border-violet-500/25 text-violet-300",         dot: "bg-violet-400"       },
  selected:   { label: "Sélectionné ✓",         color: "bg-emerald-500/15 border border-emerald-500/25 text-emerald-300",      dot: "bg-emerald-400"      },
  finalist:   { label: "Finaliste ⭐",           color: "bg-orange-500/15 border border-orange-500/25 text-orange-300",        dot: "bg-orange-400"       },
  refused:    { label: "Non retenu",            color: "bg-red-500/10 border border-red-500/20 text-red-400/70",               dot: "bg-red-400"          },
  awarded:    { label: "Primé 🏆",              color: "bg-yellow-500/15 border border-yellow-500/25 text-yellow-300",        dot: "bg-yellow-400"       },
};
const getStatusBadge = (s) =>
  STATUS_MAP[s] || { label: "En attente", color: "bg-white/5 border border-white/10 text-white/50", dot: "bg-white/30" };


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
  /* POLLING FIX: store only the selected movie's ID, not the full object.
     This way every re-render (including the 5s polling setMovies calls) will
     automatically resolve selectedMovie to the freshest copy from the movies array.
     Previously setSelectedMovie(movie) stored a snapshot → isPending() never saw
     the updated trailer path and the spinner never disappeared. */
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const selectedMovie = movies.find((m) => m.id_movie === selectedMovieId) ?? null;
  const [lightboxImg, setLightboxImg] = useState(null);

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(8);
  const totalPages = Math.max(1, Math.ceil(movies.length / moviesPerPage));
  const paginatedMovies = movies.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  function goToPage(page) {
    setCurrentPage(page);
    setTimeout(() => {
      mesFilmsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  // Reset to page 1 when movies list changes (e.g. after submit)
  const prevMoviesLengthRef = useRef(movies.length);
  useEffect(() => {
    if (movies.length !== prevMoviesLengthRef.current) {
      setCurrentPage(1);
      prevMoviesLengthRef.current = movies.length;
    }
  }, [movies.length]);
  const [showForm, setShowForm] = useState(false);

  /* ── États formulaire multi-étapes ── */
  const [formStep, setFormStep] = useState(1);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  /* ── FIX: fichiers gérés hors RHF ── */
  /* filmFile via ref pour éviter les problèmes de FileList RHF */
  const filmFileRef = useRef(null);
  const subtitleRef = useRef(null);
  const formSectionRef = useRef(null); // scroll to form
  const mesFilmsRef = useRef(null);    // scroll to Mes films on page change
  /* BUG #1 FIX: pollIntervalRef was used but never declared → ReferenceError on submit */
  const pollIntervalRef = useRef(null);
  const [filmFileName, setFilmFileName] = useState("");
  const [subtitlesName, setSubtitlesName] = useState("");

  /* FIX PRINCIPAL: thumbnails = 3 slots nommés (backend attend thumbnail1/2/3) */
  const [thumbFiles, setThumbFiles] = useState([null, null, null]);
  const [thumbNames, setThumbNames] = useState(["", "", ""]);
  // FIX (Rules of Hooks): useRef ne peut pas être appelé dans un tableau.
  // Déclaration en trois refs séparées puis regroupées en array constant.
  const thumbRef0 = useRef(null);
  const thumbRef1 = useRef(null);
  const thumbRef2 = useRef(null);
  // thumbRefs est un array stable (référence fixe) — pas un hook lui-même.
  const thumbRefs = [thumbRef0, thumbRef1, thumbRef2];

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
  // Lance un polling sur getMyMovies() toutes les 5s.
  // S'arrête dès que le film visé a son trailer mis à jour vers "uploaded/..."
  // (signe que le watcher a terminé le traitement), sans timeout arbitraire.
  function startTrailerPolling(movieId) {
    const INTERVAL = 5000;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await getMyMovies();
        const updated = res.data || [];
        setMovies(updated);
        // Arrêt dès que le trailer du film ciblé commence par "uploaded/"
        const target = updated.find((m) => m.id_movie === movieId);
        if (target?.trailer?.startsWith("uploaded/")) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          // Affiche le message de succès générique et l'efface après 4s
          setMovieSuccess("Film soumis avec succès !");
          setTimeout(() => setMovieSuccess(null), 4000);
        }
      } catch {
        /* ignore */
      }
    }, INTERVAL);
  }

  const createMovieMutation = useMutation({
    mutationFn: async (data) => {
      /* Guard: un fichier vidéo est obligatoire */
      const filmFileCheck = filmFileRef.current?.files?.[0];
      if (!filmFileCheck) {
        throw new Error(
          "Veuillez sélectionner un fichier vidéo avant de soumettre.",
        );
      }

      const fd = new FormData();

      /* Champs texte */
      fd.append("filmTitleOriginal", data.filmTitleOriginal || "");
      fd.append("durationSeconds", String(data.durationSeconds || ""));
      fd.append("filmLanguage", data.filmLanguage || "");
      fd.append("releaseYear", data.releaseYear || "");
      fd.append("nationality", data.nationality || "");
      fd.append("translation", data.translation || "");
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
    /* BUG #3 FIX: onSuccess must capture the mutation result as first argument.
       Previously declared as async () => {} with no param, so `data` was undefined
       and startTrailerPolling(data?.data?.movie?.id_movie) always received undefined. */
    onSuccess: async (result) => {
      setMovieError(null);
      setShowForm(false);
      resetForm();
      try {
        const res = await getMyMovies();
        setMovies(res.data || []);
      } catch {
        /* ignore */
      }
      // BUG #3 FIX: use result (not undefined data) to get the new movie id
      startTrailerPolling(result?.data?.movie?.id_movie);
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

  // FIX (fuite mémoire): nettoyer l'intervalle de polling si le composant est démonté
  // avant que le watcher ait fini de traiter la vidéo. Sans ce cleanup, setMovies()
  // serait appelé sur un composant démonté → avertissement React + fuite mémoire.
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
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
    categoryId?.toString().trim().length > 0 &&
    Boolean(filmFileRef.current?.files?.[0]);

  function handleNextStep() {
    if (!isStep1Valid()) {
      setMovieError(
        "Veuillez remplir le titre, la durée (≤ 120 s) et le synopsis.",
      );
      setTimeout(() => setMovieError(null), 4000);
      return;
    }
    setMovieError(null);
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

  /* ── États de chargement ── */
  if (loading)
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#AD46FF]/20 border-t-[#AD46FF] mx-auto mb-3" />
          <p className="text-white/40 text-sm">Chargement de votre espace…</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center max-w-md">
          <span className="text-3xl mb-3 block">⚠️</span>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
        <p className="text-white/40 text-sm">Utilisateur introuvable.</p>
      </div>
    );

  /* ════════════════════════════════════════════════════════
     RENDU
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="min-h-screen bg-[#06080d] text-white pt-28 pb-24 px-4 md:pt-32">
        <div className="max-w-6xl mx-auto">
          {/* ── Toast ── */}
          {movieSuccess && !showForm && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 px-5 py-3 rounded-2xl text-sm backdrop-blur-xl shadow-2xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {movieSuccess}
            </div>
          )}

          {/* ── En-tête ── */}
          <div className="mb-12">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#AD46FF]/50 mb-2 font-medium">
              Festival MARS AI
            </p>
            <div className="flex items-end justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Espace Producteur
                </h1>
                <p className="text-white/55 mt-1 text-sm font-medium uppercase tracking-wide">
                  {user.first_name} {user.last_name}
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#AD46FF]/15 text-[#AD46FF]/80 border border-[#AD46FF]/20 font-medium tracking-wide uppercase">
                    Producteur
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] tracking-widest uppercase text-white/50 mb-0.5">
                    Films soumis
                  </p>
                  <p className="text-2xl font-bold text-white leading-none">
                    {movies.length}
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="w-10 h-10 rounded-2xl bg-[#AD46FF]/10 text-[#AD46FF]/70 border border-[#AD46FF]/50 flex items-center justify-center font-bold text-sm shadow-lg shadow-[#AD46FF]/20">
                    {user.first_name?.[0]}{user.last_name?.[0]} {/* FIX: ordre prénom + nom */}
                </div>
              </div>
            </div>
            <div className="mt-8 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          </div>

          <div className="space-y-5">
            {/* ── Profil ── */}
            <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                <p className="text-[12px] tracking-widest uppercase text-white/75 font-medium ">
                  Profil
                </p>
                 <div className="mt-1 h-px w-30 bg-gradient-to-r from-white/50 via-white/5 to-transparent" />
                </div>
                <button
                  onClick={() => setEditMode((v) => !v)}
                  className="text-[11px] text-[#AD46FF]/70 hover:text-[#AD46FF] transition-colors"
                >
                  {editMode ? "Annuler" : "Modifier"}
                </button>
              </div>

              {profileSuccess && (
                <div className="mb-4 flex items-center gap-2.5 bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-xl text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
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
                    { name: "country", label: "Pays", type: "text" },
                    {
                      name: "biography",
                      label: "Biographie",
                      type: "textarea",
                    },
                    { name: "portfolio", label: "Site web", type: "text" },
                  ].map(({ name, label, type }) => (
                    <div
                      key={name}
                      className={
                        type === "textarea"
                          ? "md:col-span-2 flex flex-col gap-1.5"
                          : "flex flex-col gap-1.5"
                      }
                    >
                      <label className="text-[9px] uppercase tracking-widest text-white/50 font-medium">
                        {label}
                      </label>
                      {type === "textarea" ? (
                        <textarea
                          name={name}
                          value={profileForm[name] || ""}
                          onChange={handleProfileChange}
                          rows={3}
                          className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 resize-none placeholder:text-white/15 transition-all duration-200"
                        />
                      ) : (
                        <input
                          type={type}
                          name={name}
                          value={profileForm[name] || ""}
                          onChange={handleProfileChange}
                          className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200"
                        />
                      )}
                    </div>
                  ))}
                  <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-white/8 bg-white/3 text-white/50 rounded-xl text-sm font-medium hover:bg-white/6 hover:text-white/70 transition-all duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 hover:from-[#AD46FF] hover:to-[#F6339A] text-white rounded-xl text-sm font-semibold transition-all duration-200"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: "Téléphone", value: user.phone },
                    { label: "Pays", value: user.country },
                    { label: "Site web", value: user.portfolio },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-widest text-white/90 mb-1.5 font-medium">
                        {label}
                      </p>
                      <p className="text-white/50 text-sm">{value || "—"}</p>
                    </div>
                  ))}
                  {user.biography && (
                    <div className="md:col-span-3">
                      <p className="text-[10px] uppercase tracking-widest text-white/90 mb-1.5 font-medium">
                        Biographie
                      </p>
                      <p className="text-white/65 text-sm leading-relaxed">
                        {user.biography}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Mes films ── */}
            <div ref={mesFilmsRef} className="bg-white/3 border border-white/6 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <p className="text-[12px] tracking-widest uppercase text-white/70 font-medium">
                    Mes films
                  </p>
                  {movies.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#AD46FF]/10 text-[#AD46FF]/70 border border-[#AD46FF]/50">
                      {movies.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowForm(true);
                    resetForm();
                    setMovieError(null);
                    setMovieSuccess(null);
                    setTimeout(
                      () =>
                        formSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        }),
                      50,
                    );
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 hover:from-[#AD46FF] hover:to-[#F6339A] text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <span className="text-base leading-none">+</span> Soumettre un
                  film
                </button>
              </div>

              {movies.length === 0 && !showForm ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center text-2xl">
                    🎬
                  </div>
                  <p className="text-sm text-white/50 text-center max-w-xs leading-relaxed">
                    Aucun film soumis. Cliquez sur « Soumettre un film » pour
                    commencer.
                  </p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {paginatedMovies.map((movie) => {
                    const badge = getStatusBadge(movie.selection_status);
                    const poster = getPoster(movie);
                    const pending = isPending(movie);
                    return (
                      <button
                        key={movie.id_movie}
                        onClick={() => setSelectedMovieId(movie.id_movie)}
                        className="group relative text-left focus:outline-none"
                        style={{ aspectRatio: "2/3" }}
                      >
                        {/* Poster frame */}
                        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.7)] group-hover:shadow-[0_12px_40px_rgba(173,70,255,0.22)] transition-all duration-500 group-hover:-translate-y-2 cursor-pointer">

                          {/* Background image or fallback */}
                          {poster ? (
                            <img
                              src={poster}
                              alt={movie.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1025] via-[#0d0f14] to-[#1a0a20] flex items-center justify-center">
                              <span className="text-5xl opacity-20">🎬</span>
                            </div>
                          )}

                          {/* Film grain */}
                          <div
                            className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                              backgroundSize: "120px 120px",
                            }}
                          />

                          {/* Top vignette */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
                          {/* Bottom vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                          {/* Corner marks */}
                          <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-white/20" />
                          <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-white/20" />
                          <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-white/20" />
                          <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-white/20" />

                          {/* Status badge */}
                          <div className="absolute top-3 right-3">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm rounded-sm ${badge.color}`}>
                              <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>

                          {/* Pending spinner */}
                          {pending && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-7 h-7 border-2 border-[#AD46FF]/30 border-t-[#AD46FF] rounded-full animate-spin" />
                            </div>
                          )}

                          {/* Bottom text */}
                          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-1">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <div className="flex-1 h-px bg-white/20" />
                              <span className="text-[6px] tracking-[0.2em] text-white/35 uppercase font-medium">MarsAI</span>
                              <div className="flex-1 h-px bg-white/20" />
                            </div>
                            <p
                              className="font-bold uppercase tracking-wide leading-tight text-white group-hover:text-[#C179FB] transition-colors duration-300 line-clamp-2"
                              style={{ fontSize: "clamp(8px, 1.8vw, 12px)", textShadow: "0 1px 6px rgba(0,0,0,1)" }}
                            >
                              {movie.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-white/35" style={{ fontSize: "8px" }}>
                              {movie.main_language && <span className="uppercase tracking-wider">{movie.main_language}</span>}
                              {movie.duration && movie.main_language && <span>·</span>}
                              {movie.duration && <span>{movie.duration}s</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="mt-6 px-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <span className="text-[9px] tracking-[0.3em] uppercase text-white/20 font-medium">
                        {movies.length} films · page {currentPage}/{totalPages}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className={`w-8 h-8 flex items-center justify-center rounded border text-xs transition-all duration-300 ${currentPage === 1 ? "border-white/5 text-white/15 cursor-not-allowed" : "border-white/10 text-white/40 hover:border-[#AD46FF]/40 hover:text-[#AD46FF] hover:bg-[#AD46FF]/5"}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                      </button>
                      <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`w-8 h-8 flex items-center justify-center rounded border text-xs transition-all duration-300 ${currentPage === 1 ? "border-white/5 text-white/15 cursor-not-allowed" : "border-white/10 text-white/40 hover:border-[#AD46FF]/40 hover:text-[#AD46FF] hover:bg-[#AD46FF]/5"}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-medium tracking-wider transition-all duration-300 ${
                            currentPage === page
                              ? "border-[#AD46FF]/60 bg-gradient-to-b from-[#AD46FF]/20 to-[#AD46FF]/10 text-[#C179FB] shadow-[0_0_12px_rgba(173,70,255,0.2)]"
                              : "border-white/8 text-white/35 hover:border-[#AD46FF]/30 hover:text-[#AD46FF]/70 hover:bg-[#AD46FF]/5"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`w-8 h-8 flex items-center justify-center rounded border text-xs transition-all duration-300 ${currentPage === totalPages ? "border-white/5 text-white/15 cursor-not-allowed" : "border-white/10 text-white/40 hover:border-[#AD46FF]/40 hover:text-[#AD46FF] hover:bg-[#AD46FF]/5"}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`w-8 h-8 flex items-center justify-center rounded border text-xs transition-all duration-300 ${currentPage === totalPages ? "border-white/5 text-white/15 cursor-not-allowed" : "border-white/10 text-white/40 hover:border-[#AD46FF]/40 hover:text-[#AD46FF] hover:bg-[#AD46FF]/5"}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>

            {/* ── Formulaire de soumission ── */}
            {showForm && (
              <div
                ref={formSectionRef}
                className="bg-white/3 border border-white/6 rounded-2xl p-6"
              >
                <div className="mb-7">
                  <div className="flex items-center gap-4">
                    {[
                      { n: 1, label: "Données du film" },
                      { n: 2, label: "IA & Fichiers" },
                    ].map(({ n, label }, i) => (
                      <div key={n} className="flex items-center gap-4">
                        {i > 0 && (
                          <div
                            className={`w-16 h-px rounded-full ${formStep >= n ? "bg-gradient-to-r from-[#AD46FF] to-[#F6339A]" : "bg-white/8"}`}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-300 ${formStep >= n ? "bg-gradient-to-br from-[#AD46FF] to-[#F6339A] text-white shadow-md shadow-[#AD46FF]/25" : "bg-white/4 text-white/50 border border-white/8"}`}
                          >
                            {formStep > n ? "✓" : n}
                          </div>
                          <span
                            className={`text-[11px] font-medium ${formStep >= n ? "text-white/60" : "text-white/50"}`}
                          >
                            {label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {movieError && (
                  <div className="mb-4 flex items-center gap-2.5 bg-red-950/60 border border-red-500/20 text-red-300 px-4 py-2.5 rounded-xl text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {movieError}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit((data) =>
                    createMovieMutation.mutate(data),
                  )}
                  className="space-y-5"
                >
                  {/* ═══ ÉTAPE 1 ═══ */}
                  {formStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Fld
                          label="Titre original *"
                          error={errors.filmTitleOriginal}
                        >
                          <input
                            type="text"
                            placeholder="TITRE ORIGINAL"
                            {...reg("filmTitleOriginal")}
                            className={`w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200 ${errors.filmTitleOriginal ? "border-red-500/40" : ""}`}
                          />
                        </Fld>
                        <Fld
                          label="Durée (s) *"
                          hint="max 120s"
                          error={errors.durationSeconds}
                        >
                          <input
                            type="number"
                            placeholder="60"
                            max={120}
                            {...reg("durationSeconds")}
                            className={`w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200 ${errors.durationSeconds ? "border-red-500/40" : ""}`}
                          />
                        </Fld>
                        <Fld label="Langue">
                          <input
                            type="text"
                            placeholder="Français"
                            {...reg("filmLanguage")}
                            className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200"
                          />
                        </Fld>
                        <Fld label="Année">
                          <input
                            type="number"
                            placeholder="2026"
                            {...reg("releaseYear")}
                            className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200"
                          />
                        </Fld>
                        <Fld label="Nationalité">
                          <input
                            type="text"
                            placeholder="France"
                            {...reg("nationality")}
                            className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200"
                          />
                        </Fld>
                        <Fld label="Comment nous avez-vous connu ?">
                          <select
                            {...reg("knownByMarsAi")}
                            className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 transition-all duration-200"
                          >
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
                            className={`w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 transition-all duration-200 ${errors.categoryId ? "border-red-500/40" : ""}`}
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((cat) => (
                              <option
                                key={cat.id_categorie}
                                value={cat.id_categorie}
                              >
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </Fld>
                        <Fld label="Traduction">
                          <input
                            type="text"
                            placeholder="English title"
                            {...reg("translation")}
                            className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200"
                          />
                        </Fld>
                      </div>
                      <Fld
                        label="Synopsis original * (300 car.)"
                        error={errors.synopsisOriginal}
                      >
                        <textarea
                          rows={3}
                          maxLength={300}
                          placeholder="Résumez votre film en quelques lignes…"
                          {...reg("synopsisOriginal")}
                          className={`w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 resize-none placeholder:text-white/15 transition-all duration-200 ${errors.synopsisOriginal ? "border-red-500/40" : ""}`}
                        />
                      </Fld>
                      <Fld label="Synopsis anglais (300 car.)">
                        <textarea
                          rows={3}
                          maxLength={300}
                          placeholder="Summary in English…"
                          {...reg("synopsisEnglish")}
                          className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 resize-none placeholder:text-white/15 transition-all duration-200"
                        />
                      </Fld>
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 hover:from-[#AD46FF] hover:to-[#F6339A] text-white rounded-xl text-sm font-semibold transition-all duration-200"
                        >
                          Continuer →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ═══ ÉTAPE 2 ═══ */}
                  {formStep === 2 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 gap-4">
                        <Fld
                          label="Classification IA *"
                          error={errors.aiClassification}
                        >
                          <div className="flex gap-3">
                            {[
                              {
                                value: "integrale",
                                label: "100 % IA générative",
                              },
                              {
                                value: "hybride",
                                label: "Hybride (réel + IA)",
                              },
                            ].map((opt) => (
                              <label
                                key={opt.value}
                                className="flex items-center gap-2.5 bg-white/3 border border-white/8 rounded-xl px-4 py-3 cursor-pointer hover:border-[#AD46FF]/30 hover:bg-white/5 transition-all duration-200 flex-1"
                              >
                                <input
                                  type="radio"
                                  value={opt.value}
                                  {...reg("aiClassification")}
                                  className="w-4 h-4 accent-[#AD46FF]"
                                />
                                <span className="text-sm text-white/60">
                                  {opt.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </Fld>
                        <Fld label="Outils IA utilisés">
                          <textarea
                            rows={2}
                            maxLength={500}
                            placeholder="Midjourney, Runway, ElevenLabs..."
                            {...reg("aiStack")}
                            className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 resize-none placeholder:text-white/15 transition-all duration-200"
                          />
                        </Fld>
                        <Fld label="Méthodologie créative">
                          <textarea
                            rows={2}
                            maxLength={500}
                            placeholder="Décrivez votre processus..."
                            {...reg("aiMethodology")}
                            className="w-full bg-white/3 border border-white/8 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 resize-none placeholder:text-white/15 transition-all duration-200"
                          />
                        </Fld>
                        <Fld label={`Collaborateurs (${collabFields.length})`}>
                          <button
                            type="button"
                            onClick={() => setShowCollaboratorsModal(true)}
                            className="w-full bg-white/3 border border-white/8 text-white/40 px-3.5 py-2.5 rounded-xl text-sm text-left hover:border-[#AD46FF]/30 hover:bg-white/5 transition-all duration-200"
                          >
                            {collabFields.length === 0
                              ? "Gérer les collaborateurs (facultatif)"
                              : `${collabFields.length} collaborateur(s)`}
                          </button>
                        </Fld>
                      </div>

                      {/* Fichiers */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] uppercase tracking-widest text-white/50 font-medium">
                            Fichiers
                          </p>
                          <div className="flex-1 h-px bg-white/6" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-[9px] uppercase tracking-widest text-white/50 font-medium">
                            Fichier vidéo{" "}
                            <span className="text-red-400/60">*</span>
                          </p>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#AD46FF]/10 border border-[#AD46FF]/20 text-[#AD46FF]/80 text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[#AD46FF]/15 hover:border-[#AD46FF]/30 hover:text-[#AD46FF]">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                                />
                              </svg>
                              Choisir
                              <input
                                ref={filmFileRef}
                                type="file"
                                accept="video/*"
                                className="sr-only"
                                onChange={(e) =>
                                  setFilmFileName(
                                    e.target.files?.[0]?.name || "",
                                  )
                                }
                              />
                            </label>
                            <span className="text-[11px] text-white/50 truncate max-w-[220px]">
                              {filmFileName || "Aucun fichier sélectionné"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-[9px] uppercase tracking-widest text-white/50 font-medium">
                            Vignettes (max 3)
                          </p>
                          <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="flex-1">
                                <label className="inline-flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#AD46FF]/10 border border-[#AD46FF]/20 text-[#AD46FF]/70 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#AD46FF]/15 hover:border-[#AD46FF]/30 hover:text-[#AD46FF]">
                                  {thumbFiles[i] ? (
                                    <span className="text-emerald-400 text-xs">
                                      ✓ Image {i + 1}
                                    </span>
                                  ) : (
                                    <span className="text-xs">📷 {i + 1}</span>
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
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-[9px] uppercase tracking-widest text-white/50 font-medium">
                            Sous-titres (.srt)
                          </p>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#AD46FF]/10 border border-[#AD46FF]/20 text-[#AD46FF]/80 text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[#AD46FF]/15 hover:border-[#AD46FF]/30 hover:text-[#AD46FF]">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Choisir
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
                            <span className="text-[11px] text-white/50 truncate max-w-[220px]">
                              {subtitlesName || "Aucun fichier"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-white/3 border border-white/6 rounded-xl p-3.5">
                        <input
                          id="acceptTerms"
                          type="checkbox"
                          {...reg("acceptTerms")}
                          className="w-4 h-4 mt-0.5 cursor-pointer accent-[#AD46FF]"
                        />
                        <label
                          htmlFor="acceptTerms"
                          className="text-xs text-white/65 cursor-pointer leading-relaxed"
                        >
                          J'accepte les{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowTermsModal(true);
                            }}
                            className="text-[#AD46FF]/80 hover:text-[#AD46FF] underline font-medium transition-colors"
                          >
                            conditions de participation
                          </button>
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="text-[11px] text-red-400/80 -mt-2">
                          {errors.acceptTerms.message}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setFormStep(1)}
                          className="px-4 py-2 border border-white/8 bg-white/3 text-white/50 rounded-xl text-sm font-medium hover:bg-white/6 hover:text-white/70 transition-all duration-200"
                        >
                          ← Retour
                        </button>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowForm(false);
                              resetForm();
                            }}
                            className="px-4 py-2 border border-red-500/20 bg-red-500/8 text-red-400/70 rounded-xl text-sm font-medium hover:bg-red-500/15 hover:text-red-400 transition-all duration-200"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={
                              createMovieMutation.isPending ||
                              !acceptTerms ||
                              // FIX: vérifier le ref directement (source de vérité) au lieu du state filmFileName
                              !filmFileRef.current?.files?.[0]
                            }
                            className="px-5 py-2 bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 hover:from-[#AD46FF] hover:to-[#F6339A] text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {createMovieMutation.isPending ? (
                              <span className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                Envoi…
                              </span>
                            ) : !filmFileName ? (
                              "Sélectionnez une vidéo"
                            ) : (
                              "Soumettre"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
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
            className="mb-4 px-4 py-2 bg-[#AD46FF]/10 text-[#AD46FF] border border-[#AD46FF]/25 rounded-xl text-sm font-medium hover:bg-[#AD46FF]/15 transition-all duration-200"
          >
            + Ajouter un collaborateur
          </button>
          {collabFields.length === 0 && (
            <p className="text-white/55 text-center py-8 text-sm">
              Aucun collaborateur ajouté.
            </p>
          )}
          <div className="space-y-3">
            {collabFields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-white/3 border border-white/6 p-3 rounded-xl"
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
                  { name: `collaborators.${idx}.email`, placeholder: "Email" },
                  { name: `collaborators.${idx}.job`, placeholder: "Rôle" },
                ].map(({ name, placeholder }) => (
                  <input
                    key={name}
                    type="text"
                    {...reg(name)}
                    placeholder={placeholder}
                    className={`${tw.fieldInput} text-sm`}
                  />
                ))}
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeCollab(idx)}
                    className="text-red-400/70 hover:text-red-400 text-xs transition-colors"
                  >
                    ✕ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowCollaboratorsModal(false)}
              className="px-4 py-2 border border-white/8 bg-white/3 text-white/50 rounded-xl text-sm font-medium hover:bg-white/6 hover:text-white/70 transition-all duration-200"
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
          <div className="space-y-4 text-white/60 text-sm leading-relaxed">
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
                <h4 className="text-white font-medium mb-2 text-sm">{title}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  {content.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 hover:from-[#AD46FF] hover:to-[#F6339A] text-white rounded-xl text-sm font-semibold transition-all duration-200"
            >
              J'ai compris
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modale détail film ── */}
      {selectedMovie &&
        (() => {
          const badge = getStatusBadge(selectedMovie.selection_status);
          return (
            <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#0e1017] border border-white/8 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/6">
                  <h3 className="text-base font-bold text-white">
                    {selectedMovie.title}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedMovieId(null);
                      setEditingMovieId(null);
                    }}
                    className="text-white/55 hover:text-white transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
                  {/* ── Colonne gauche ── */}
                  <div className="space-y-6">
                    {/* Statut */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm text-white/40">Statut :</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${badge.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                        />
                        {badge.label}
                      </span>
                    </div>

                    {/* Champs techniques */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                      {[
                        [
                          "Durée",
                          selectedMovie.duration
                            ? `${selectedMovie.duration}s`
                            : "—",
                        ],
                        ["Langue", selectedMovie.main_language || "—"],
                        ["Nationalité", selectedMovie.nationality || "—"],
                        ["Outil IA", selectedMovie.ai_tool || "—"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-[10px] tracking-widest uppercase text-white/55 mb-1 font-medium">
                            {label}
                          </p>
                          <p className="text-sm text-white/80">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Synopsis */}
                    {(selectedMovie.synopsis || selectedMovie.description) && (
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-white/55 mb-2 font-medium">
                          Synopsis
                        </p>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {selectedMovie.synopsis || selectedMovie.description}
                        </p>
                      </div>
                    )}

                    {/* Liens */}
                    <div className="flex flex-wrap gap-4">
                      {selectedMovie.subtitle?.endsWith?.(".srt") && (
                        <a
                          href={`${UPLOAD_BASE}/${selectedMovie.subtitle}`}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-1.5 text-sm text-[#AD46FF] hover:text-[#F6339A] transition-colors font-medium"
                        >
                          ↓ Sous-titres
                        </a>
                      )}
                    </div>

                    {/* Collaborateurs */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] tracking-widest uppercase text-white/55 font-medium">
                          Collaborateurs
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditCollaborators(selectedMovie)}
                          className="text-sm text-[#AD46FF] hover:text-[#F6339A] transition-colors font-medium"
                        >
                          Modifier
                        </button>
                      </div>
                      {selectedMovie.Collaborators?.length ? (
                        <ul className="space-y-1.5">
                          {selectedMovie.Collaborators.map((c) => (
                            <li
                              key={c.id_collaborator}
                              className="flex items-center gap-2 text-sm text-white/60"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/50 flex-shrink-0" />
                              {c.first_name} {c.last_name}
                              {c.job && (
                                <span className="text-white/55">— {c.job}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-white/50">
                          Aucun collaborateur.
                        </p>
                      )}

                      {editingMovieId === selectedMovie.id_movie && (
                        <div className="mt-4 space-y-2 border-t border-white/6 pt-4">
                          {(collabDrafts[selectedMovie.id_movie] || []).map(
                            (c, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-2 gap-2 bg-white/3 border border-white/6 p-3 rounded-xl"
                              >
                                {[
                                  "first_name",
                                  "last_name",
                                  "email",
                                  "job",
                                ].map((field) => (
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
                                    className="w-full bg-white/3 border border-white/8 text-white px-3 py-2 rounded-lg text-xs outline-none hover:border-[#AD46FF]/25 focus:border-[#AD46FF]/40 placeholder:text-white/15 transition-all duration-200"
                                  />
                                ))}
                                <div className="col-span-2 flex justify-end">
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
                                    className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                                  >
                                    ✕ Supprimer
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                          <div className="flex gap-2 pt-1">
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
                              className="px-3 py-1.5 text-xs bg-white/4 border border-white/8 text-white/50 rounded-lg hover:bg-white/6 hover:text-white/70 transition-all duration-200"
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
                              className="px-3 py-1.5 text-xs bg-[#AD46FF]/10 text-[#AD46FF]/80 border border-[#AD46FF]/20 rounded-lg hover:bg-[#AD46FF]/15 hover:text-[#AD46FF] transition-all duration-200 font-medium"
                            >
                              Enregistrer
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMovieId(null)}
                              className="px-3 py-1.5 text-xs border border-white/8 text-white/55 rounded-lg hover:bg-white/4 transition-all duration-200"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Colonne droite : vidéo ── */}
                  <div>
                    {isPending(selectedMovie) ? (
                      <PendingVideoPlaceholder accepted={false} />
                    ) : getTrailer(selectedMovie) ? (
                      <VideoPreview
                        title={selectedMovie.title}
                        label="MarsAI Festival"
                        src={`${UPLOAD_BASE}/${getTrailer(selectedMovie)}`}
                        poster={getPoster(selectedMovie) || undefined}
                      />
                    ) : (
                      <div className="w-full aspect-video rounded-xl border border-white/6 bg-white/3 flex items-center justify-center text-white/15 text-xs">
                        Pas de média
                      </div>
                    )}

                    {/* ── Vignettes ── */}
                    {(() => {
                      const imgs = [
                        selectedMovie.thumbnail,  // FIX: décommenté — champ prioritaire de getPoster()
                        selectedMovie.display_picture,
                        selectedMovie.picture1,
                        selectedMovie.picture2,
                        selectedMovie.picture3,
                      ].filter(Boolean);
                      if (!imgs.length) return null;
                      return (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {imgs.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setLightboxImg(`${UPLOAD_BASE}/${img}`)}
                              className="group relative aspect-video rounded-lg overflow-hidden border border-white/8 hover:border-[#AD46FF]/50 transition-all duration-200"
                            >
                              <img
                                src={`${UPLOAD_BASE}/${img}`}
                                alt={`Vignette ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImg}
            alt="Vignette"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ── Mini-composants ──────────────────────────────────── */
function Modal({ title, onClose, maxW = "max-w-4xl", children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`bg-[#0d0f14] border border-white/8 rounded-3xl w-full ${maxW} max-h-[88vh] overflow-y-auto shadow-2xl shadow-black/60`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/6 bg-[#0d0f14]">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/8 rounded-xl transition-all duration-200 text-sm"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalBlock({ title, children }) {
  return (
    <div className="bg-white/3 border border-white/6 rounded-xl p-2.5">
      <p className="text-[9px] tracking-widest uppercase text-white/50 font-medium mb-1.5">
        {title}
      </p>
      {children}
    </div>
  );
}

function ModalRow({ label, value }) {
  return (
    <div className="flex gap-1.5 mb-0.5 last:mb-0">
      <span className="text-white/50 text-[11px] shrink-0">{label} :</span>
      <span className="text-white/50 text-[11px] truncate">{value}</span>
    </div>
  );
}

function Fld({ label, hint, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] uppercase tracking-widest text-white/90 font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-white/50 mt-0.5">{hint}</p>}
      {error && (
        <p className="text-[11px] text-red-400/80 mt-0.5">{error.message}</p>
      )}
    </div>
  );
}