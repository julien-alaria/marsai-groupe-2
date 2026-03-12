// /**
//  * ProducerHome.jsx — Espace producteur
//  *
//  * BUGS CORRIGÉS :
//  *  ✓ Thumbnails : fd.append("thumbnails") → fd.append("thumbnail1/2/3")
//  *    (le backend multer attend des champs nommés thumbnail1, thumbnail2, thumbnail3)
//  *  ✓ Gestion des fichiers thumbnails sortie de useFieldArray (FileList confus)
//  *    → useState simple pour les fichiers image
//  *  ✓ filmFile géré via ref pour éviter la confusion FileList de RHF
//  *  ✓ isStep2Valid() : vérifie acceptTerms (pas acceptRules inexistant)
//  *  ✓ handleResetForm : setThumbnailNames tableau (pas setThumbnail1/2/3Name)
//  *  ✓ UPLOAD_BASE centralisé
//  */

// import { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { VideoPreview } from "../../components/VideoPreview.jsx";
// // NOTE: Navbar is rendered by ProducerLayout — no import needed here.
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFieldArray, useForm, useWatch } from "react-hook-form";
// import * as z from "zod";
// import { getCurrentUser, updateCurrentUser } from "../../api/users";
// import {
//   createMovie,
//   getMyMovies,
//   updateMovieCollaborators,
// } from "../../api/movies";
// import { getCategories } from "../../api/videos.js";
// import { UPLOAD_BASE } from "../../utils/constants.js";
// import { getPoster, getTrailer } from "../../utils/movieUtils.js";

// /* ─── Schéma Zod ──────────────────────────────────────── */
// const movieSchema = z.object({
//   filmTitleOriginal: z.string().min(1, "Le titre du film est obligatoire"),
//   durationSeconds: z.coerce
//     .number()
//     .int("La durée doit être un nombre entier")
//     .min(1, "La durée est obligatoire")
//     .max(120, "La durée maximale est de 120 secondes"),
//   filmLanguage: z.string().optional(),
//   releaseYear: z.string().optional(),
//   nationality: z.string().optional(),
//   translation: z.string().optional(),
//   synopsisOriginal: z.string().min(1, "Le synopsis est obligatoire"),
//   synopsisEnglish: z.string().optional(),
//   aiClassification: z.string().min(1, "La classification IA est obligatoire"),
//   aiStack: z.string().optional(),
//   aiMethodology: z.string().optional(),
//   categoryId: z.string().min(1, "La catégorie est obligatoire"),
//   knownByMarsAi: z.string().optional(),
//   collaborators: z
//     .array(
//       z.object({
//         first_name: z.string().optional(),
//         last_name: z.string().optional(),
//         email: z
//           .string()
//           .email("Adresse e-mail invalide")
//           .optional()
//           .or(z.literal("")),
//         job: z.string().optional(),
//       }),
//     )
//     .optional(),
//   subtitlesSrt: z.any().optional(),
//   acceptTerms: z.boolean().refine((v) => v === true, {
//     message: "Vous devez accepter les conditions de participation",
//   }),
// });

// /* ─── Balanced Tailwind class constants ───────── */
// const tw = {
//   // Field inputs - comfortable but not oversized
//   fieldInput:
//     "w-full bg-white/[0.02] border border-white/[0.08] text-white px-4 py-2.5 rounded-lg text-sm transition-all duration-200 outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF] focus:ring-1 focus:ring-[#AD46FF]/20 placeholder:text-white/20",
//   fieldInputErr: "border-red-500/50 bg-red-500/[0.02] focus:ring-red-500/20",
  
//   // File buttons - comfortable
//   fileBtn:
//     "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#AD46FF]/10 border border-[#AD46FF]/25 text-[#AD46FF] text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[#AD46FF]/15 hover:border-[#AD46FF]/40",
  
//   // Cards with good padding
//   card: "bg-white/[0.03] border border-white/[0.07] rounded-xl shadow-lg",
  
//   // Primary button - good size
//   primaryBtn: "px-5 py-2.5 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#AD46FF]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
  
//   // Secondary button - good size
//   secondaryBtn: "px-5 py-2.5 border border-white/[0.08] bg-white/[0.02] text-white/70 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white/90",
  
//   // Cancel button - red
//   cancelBtn: "px-5 py-2.5 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40",
  
//   // Status badges - readable
//   statusBadge: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-lg",
  
//   // Section titles
//   sectionTitle: "text-xs font-semibold text-white/50 uppercase tracking-wider",
  
//   // Step indicator - comfortable
//   stepIndicator: "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-300",
  
//   // Film card - good proportions
//   filmCard: "bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-[#AD46FF]/40 hover:shadow-lg hover:shadow-[#AD46FF]/10 transition-all hover:scale-[1.02] text-left",
// };

// /* ─── Statuts pipeline ─────────────────────────────────── */
// const STATUS_MAP = {
//   submitted: { 
//     label: "Soumis", 
//     color: "bg-gradient-to-r from-zinc-600 to-zinc-700 text-white",
//     dot: "#a1a1aa" 
//   },
//   assigned: {
//     label: "En cours d'évaluation",
//     color: "bg-gradient-to-r from-sky-500 to-sky-600 text-white",
//     dot: "#38bdf8",
//   },
//   to_discuss: { 
//     label: "En discussion", 
//     color: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
//     dot: "#fbbf24" 
//   },
//   candidate: { 
//     label: "Candidat", 
//     color: "bg-gradient-to-r from-violet-500 to-violet-600 text-white",
//     dot: "#a78bfa" 
//   },
//   selected: { 
//     label: "Sélectionné ✓", 
//     color: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
//     dot: "#34d399" 
//   },
//   finalist: { 
//     label: "Finaliste ⭐", 
//     color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
//     dot: "#fb923c" 
//   },
//   refused: { 
//     label: "Non retenu", 
//     color: "bg-gradient-to-r from-red-500 to-red-600 text-white",
//     dot: "#f87171" 
//   },
//   awarded: { 
//     label: "Primé 🏆", 
//     color: "bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-900",
//     dot: "#facc15" 
//   },
// };
// const getStatusBadge = (s) =>
//   STATUS_MAP[s] || {
//     label: "En attente",
//     color: "bg-gradient-to-r from-zinc-600 to-zinc-700 text-white",
//     dot: "#a1a1aa",
//   };

// /* ════════════════════════════════════════════════════════
//    COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════ */
// export default function ProducerHome() {
//   const { t } = useTranslation();

//   /* États utilisateur */
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [profileForm, setProfileForm] = useState({});
//   const [profileSuccess, setProfileSuccess] = useState(null);

//   /* États films */
//   const [movies, setMovies] = useState([]);
//   const [movieSuccess, setMovieSuccess] = useState(null);
//   const [movieError, setMovieError] = useState(null);
//   const [editingMovieId, setEditingMovieId] = useState(null);
//   const [collabDrafts, setCollabDrafts] = useState({});
//   const [selectedMovie, setSelectedMovie] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   /* ── États formulaire multi-étapes ── */
//   const [formStep, setFormStep] = useState(1);
//   const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
//   const [showTermsModal, setShowTermsModal] = useState(false);

//   /* ── FIX: fichiers gérés hors RHF ── */
//   /* filmFile via ref pour éviter les problèmes de FileList RHF */
//   const filmFileRef = useRef(null);
//   const subtitleRef = useRef(null);
//   const formSectionRef = useRef(null); // scroll to form
//   const [filmFileName, setFilmFileName] = useState("");
//   const [subtitlesName, setSubtitlesName] = useState("");

//   /* FIX PRINCIPAL: thumbnails = 3 slots nommés (backend attend thumbnail1/2/3) */
//   const [thumbFiles, setThumbFiles] = useState([null, null, null]);
//   const [thumbNames, setThumbNames] = useState(["", "", ""]);
//   const thumbRefs = [useRef(null), useRef(null), useRef(null)];

//   /* ── React Hook Form ── */
//   const {
//     register: reg,
//     handleSubmit,
//     reset,
//     control,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(movieSchema) });

//   const filmTitle = useWatch({ control, name: "filmTitleOriginal" });
//   const durationSecs = useWatch({ control, name: "durationSeconds" });
//   const synopsisOrig = useWatch({ control, name: "synopsisOriginal" });
//   const aiClassif = useWatch({ control, name: "aiClassification" });
//   const categoryId = useWatch({ control, name: "categoryId" });
//   const acceptTerms = useWatch({ control, name: "acceptTerms" });

//   const {
//     fields: collabFields,
//     append: appendCollab,
//     remove: removeCollab,
//   } = useFieldArray({ control, name: "collaborators" });

//   /* ── Catégories ── */
//   const { data: categoriesData } = useQuery({
//     queryKey: ["categories"],
//     queryFn: getCategories,
//   });
//   const categories = categoriesData?.data || [];

//   /* ── Mutation soumission film ── */
//   const createMovieMutation = useMutation({
//     mutationFn: async (data) => {
//       /* Guard: un fichier vidéo est obligatoire */
//       const filmFileCheck = filmFileRef.current?.files?.[0];
//       if (!filmFileCheck) {
//         throw new Error("Veuillez sélectionner un fichier vidéo avant de soumettre.");
//       }

//       const fd = new FormData();

//       /* Champs texte */
//       fd.append("filmTitleOriginal", data.filmTitleOriginal || "");
//       fd.append("durationSeconds", String(data.durationSeconds || ""));
//       fd.append("filmLanguage", data.filmLanguage || "");
//       fd.append("releaseYear", data.releaseYear || "");
//       fd.append("nationality", data.nationality || "");
//       fd.append("translation", data.translation || "");
//       fd.append("synopsisOriginal", data.synopsisOriginal || "");
//       fd.append("synopsisEnglish", data.synopsisEnglish || "");
//       fd.append("aiClassification", data.aiClassification || "");
//       fd.append("aiStack", data.aiStack || "");
//       fd.append("aiMethodology", data.aiMethodology || "");

//       if (data.knownByMarsAi) fd.append("knownByMarsAi", data.knownByMarsAi);
//       if (data.categoryId)
//         fd.append("categories", JSON.stringify([Number(data.categoryId)]));

//       if (data.collaborators?.length) {
//         const clean = data.collaborators.filter(
//           (c) => c?.first_name || c?.last_name || c?.email,
//         );
//         if (clean.length) fd.append("collaborators", JSON.stringify(clean));
//       }

//       /* FIX: fichier vidéo via ref */
//       const filmFile = filmFileRef.current?.files?.[0];
//       if (filmFile) fd.append("filmFile", filmFile);

//       /* FIX PRINCIPAL: thumbnail1, thumbnail2, thumbnail3 séparés */
//       thumbFiles.forEach((file, i) => {
//         if (file) fd.append(`thumbnail${i + 1}`, file);
//       });

//       /* Sous-titres */
//       const subFile = subtitleRef.current?.files?.[0];
//       if (subFile) fd.append("subtitlesSrt", subFile);

//       return await createMovie(fd);
//     },
//     onSuccess: async () => {
//       setMovieError(null);
//       setMovieSuccess("Film soumis avec succès !");
//       setShowForm(false);
//       resetForm();
//       try {
//         const res = await getMyMovies();
//         setMovies(res.data || []);
//       } catch {
//         /* ignore */
//       }
//     },
//     onError: (err) => {
//       setMovieSuccess(null);
//       setMovieError(
//         err?.response?.data?.error ||
//           err?.message ||
//           "Erreur lors de la soumission.",
//       );
//     },
//   });

//   /* ── Mutation collaborateurs ── */
//   const updateCollabMutation = useMutation({
//     mutationFn: ({ id, collaborators }) =>
//       updateMovieCollaborators(id, collaborators),
//     onSuccess: async () => {
//       try {
//         const res = await getMyMovies();
//         setMovies(res.data || []);
//       } catch {
//         /* ignore */
//       }
//       setEditingMovieId(null);
//     },
//     onError: () =>
//       setMovieError("Erreur lors de la mise à jour des collaborateurs."),
//   });

//   /* ── Chargement initial ── */
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("Vous n'êtes pas authentifié.");
//       setLoading(false);
//       return;
//     }
//     Promise.all([getCurrentUser(), getMyMovies()])
//       .then(([uRes, mRes]) => {
//         setUser(uRes.data);
//         setProfileForm(uRes.data);
//         setMovies(mRes.data || []);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError("Impossible de charger vos données.");
//         setLoading(false);
//       });
//   }, []);

//   /* ── Helpers ── */
//   function resetForm() {
//     setFormStep(1);
//     reset();
//     setFilmFileName("");
//     setSubtitlesName("");
//     setThumbFiles([null, null, null]);
//     setThumbNames(["", "", ""]);
//     thumbRefs.forEach((r) => {
//       if (r.current) r.current.value = "";
//     });
//     if (filmFileRef.current) filmFileRef.current.value = "";
//     if (subtitleRef.current) subtitleRef.current.value = "";
//   }

//   const isStep1Valid = () =>
//     filmTitle?.trim().length > 0 &&
//     durationSecs > 0 &&
//     durationSecs <= 120 &&
//     synopsisOrig?.trim().length > 0;

//   const isStep2Valid = () =>
//     acceptTerms === true &&
//     aiClassif?.trim().length > 0 &&
//     categoryId?.toString().trim().length > 0 &&
//     Boolean(filmFileRef.current?.files?.[0]);

//   function handleNextStep() {
//     if (!isStep1Valid()) {
//       setMovieError("Veuillez remplir le titre, la durée (≤ 120 s) et le synopsis.");
//       setTimeout(() => setMovieError(null), 4000);
//       return;
//     }
//     setMovieError(null);
//     setFormStep(2);
//   }

//   /* ── Profil ── */
//   function handleProfileChange(e) {
//     const { name, value } = e.target;
//     setProfileForm((p) => ({ ...p, [name]: value }));
//   }
//   async function handleSaveProfile(e) {
//     e.preventDefault();
//     setProfileSuccess(null);
//     try {
//       const toSend = { ...profileForm };
//       delete toSend.email;
//       delete toSend.role;
//       const res = await updateCurrentUser(toSend);
//       setUser(res.data);
//       setEditMode(false);
//       setProfileSuccess("Profil mis à jour.");
//       if (res.data.first_name)
//         localStorage.setItem("firstName", res.data.first_name);
//     } catch {
//       setError("Erreur lors de la mise à jour du profil.");
//     }
//   }

//   /* ── Collaborateurs (film existant) ── */
//   function startEditCollaborators(movie) {
//     const existing = (movie.Collaborators || []).map((c) => ({
//       first_name: c.first_name || "",
//       last_name: c.last_name || "",
//       email: c.email || "",
//       job: c.job || "",
//     }));
//     setCollabDrafts((p) => ({
//       ...p,
//       [movie.id_movie]: existing.length
//         ? existing
//         : [{ first_name: "", last_name: "", email: "", job: "" }],
//     }));
//     setEditingMovieId(movie.id_movie);
//   }

//   function updateDraftField(movieId, idx, field, value) {
//     setCollabDrafts((p) => {
//       const list = [...(p[movieId] || [])];
//       if (!list[idx]) return p;
//       list[idx] = { ...list[idx], [field]: value };
//       return { ...p, [movieId]: list };
//     });
//   }

//   /* ── États de chargement ── */
//   if (loading)
//     return (
//       <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#AD46FF]/20 border-t-[#AD46FF] mx-auto mb-3" />
//           <p className="text-white/40 text-sm">Chargement de votre espace…</p>
//         </div>
//       </div>
//     );
//   if (error)
//     return (
//       <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
//         <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center max-w-md">
//           <span className="text-3xl mb-3 block">⚠️</span>
//           <p className="text-red-400 text-sm">{error}</p>
//         </div>
//       </div>
//     );
//   if (!user)
//     return (
//       <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center">
//         <p className="text-white/40 text-sm">Utilisateur introuvable.</p>
//       </div>
//     );

//   /* ════════════════════════════════════════════════════════
//      RENDU
//   ════════════════════════════════════════════════════════ */
//   return (
//     <>
//       <div className="min-h-screen bg-[#070709] text-white pt-24 pb-16 px-4 md:pt-28">
//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* ── En-tête ── */}
//           <div className="relative">
//             <div className="relative flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
//               <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#AD46FF] to-[#F6339A] flex items-center justify-center text-white font-bold text-base shadow-lg">
//                 {user.first_name?.[0]}
//                 {user.last_name?.[0]}
//               </div>
//               <div className="flex-1">
//                 <h1 className="text-lg font-semibold text-white">
//                   {user.first_name} {user.last_name}
//                 </h1>
//                 <p className="text-xs text-white/35">{user.email}</p>
//               </div>
//               <span className="px-3 py-1.5 bg-[#AD46FF]/10 text-[#AD46FF] border border-[#AD46FF]/25 rounded-full text-xs font-semibold">
//                 Producteur
//               </span>
//             </div>
//           </div>

//           {/* ── Section profil ── */}
//           <div className={`${tw.card} p-5`}>
//             <div className="flex items-center justify-between mb-3">
//               <h2 className={tw.sectionTitle}>Profil</h2>
//               <button
//                 onClick={() => setEditMode((v) => !v)}
//                 className="text-xs text-[#AD46FF] hover:text-[#F6339A] transition-colors"
//               >
//                 {editMode ? "Annuler" : "Modifier"}
//               </button>
//             </div>

//             {profileSuccess && (
//               <div className="mb-4 bg-emerald-900/20 border border-emerald-700/30 text-emerald-300 px-4 py-2 rounded-lg text-sm">
//                 {profileSuccess}
//               </div>
//             )}

//             {editMode ? (
//               <form
//                 onSubmit={handleSaveProfile}
//                 className="grid grid-cols-1 md:grid-cols-2 gap-3"
//               >
//                 {[
//                   { name: "first_name", label: "Prénom", type: "text" },
//                   { name: "last_name", label: "Nom", type: "text" },
//                   { name: "phone", label: "Téléphone", type: "text" },
//                   { name: "country", label: "Pays", type: "text" },
//                   { name: "biography", label: "Biographie", type: "textarea" },
//                   { name: "portfolio", label: "Site web", type: "text" },
//                 ].map(({ name, label, type }) => (
//                   <div
//                     key={name}
//                     className={
//                       type === "textarea"
//                         ? "md:col-span-2 flex flex-col gap-1"
//                         : "flex flex-col gap-1"
//                     }
//                   >
//                     <label className="text-[10px] uppercase tracking-wider text-white/30">
//                       {label}
//                     </label>
//                     {type === "textarea" ? (
//                       <textarea
//                         name={name}
//                         value={profileForm[name] || ""}
//                         onChange={handleProfileChange}
//                         rows={3}
//                         className={`${tw.fieldInput} resize-none`}
//                       />
//                     ) : (
//                       <input
//                         type={type}
//                         name={name}
//                         value={profileForm[name] || ""}
//                         onChange={handleProfileChange}
//                         className={tw.fieldInput}
//                       />
//                     )}
//                   </div>
//                 ))}
//                 <div className="md:col-span-2 flex justify-end gap-3 pt-2">
//                   <button
//                     type="button"
//                     onClick={() => setEditMode(false)}
//                     className={tw.secondaryBtn}
//                   >
//                     Annuler
//                   </button>
//                   <button
//                     type="submit"
//                     className={tw.primaryBtn}
//                   >
//                     Enregistrer
//                   </button>
//                 </div>
//               </form>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//                 {[
//                   { label: "Téléphone", value: user.phone },
//                   { label: "Pays", value: user.country },
//                   { label: "Site web", value: user.portfolio },
//                 ].map(({ label, value }) => (
//                   <div key={label}>
//                     <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">
//                       {label}
//                     </p>
//                     <p className="text-white/60 text-sm">{value || "—"}</p>
//                   </div>
//                 ))}
//                 {user.biography && (
//                   <div className="md:col-span-3">
//                     <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">
//                       Biographie
//                     </p>
//                     <p className="text-white/55 text-sm leading-relaxed">
//                       {user.biography}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* ── Mes films ── */}
//           <div className={`${tw.card} p-5`}>
//             <div className="flex items-center justify-between mb-4">
//               <h2 className={tw.sectionTitle}>
//                 Mes films
//                 {movies.length > 0 && (
//                   <span className="ml-2 text-[#AD46FF] text-sm">({movies.length})</span>
//                 )}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowForm(true);
//                   resetForm();
//                   setMovieError(null);
//                   setMovieSuccess(null);
//                   setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
//                 }}
//                 className={tw.primaryBtn}
//               >
//                 <span className="mr-1 text-base">+</span>
//                 Soumettre un film
//               </button>
//             </div>

//             {movieSuccess && !showForm && (
//               <div className="mb-4 bg-emerald-900/20 border border-emerald-700/30 text-emerald-300 px-4 py-2 rounded-lg text-sm">
//                 {movieSuccess}
//               </div>
//             )}

//             {movies.length === 0 && !showForm ? (
//               <div className="flex flex-col items-center py-12 text-white/20 gap-3">
//                 <span className="text-5xl">🎬</span>
//                 <p className="text-sm text-center">
//                   Aucun film soumis. Cliquez sur « Soumettre un film » pour
//                   commencer.
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {movies.map((movie) => {
//                   const badge = getStatusBadge(movie.selection_status);
//                   const poster = getPoster(movie);
//                   return (
//                     <button
//                       key={movie.id_movie}
//                       onClick={() => setSelectedMovie(movie)}
//                       className={tw.filmCard}
//                     >
//                       <div className="h-36 bg-black/40 relative overflow-hidden">
//                         {poster ? (
//                           <img
//                             src={poster}
//                             alt={movie.title}
//                             className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-white/15 text-3xl">
//                             🎬
//                           </div>
//                         )}
//                         <div className="absolute bottom-2 right-2">
//                           <span className={`${tw.statusBadge} ${badge.color}`}>
//                             <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
//                             {badge.label}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="p-3">
//                         <p className="text-sm font-medium text-white/90 truncate group-hover:text-[#AD46FF] transition">
//                           {movie.title}
//                         </p>
//                         <p className="text-xs text-white/35 mt-1 line-clamp-2">
//                           {movie.synopsis || movie.description || "Aucun synopsis"}
//                         </p>
//                         <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/25">
//                           {movie.duration && <span>{movie.duration}s</span>}
//                           {movie.main_language && <span>{movie.main_language}</span>}
//                         </div>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* ── Formulaire de soumission ── */}
//           {showForm && (
//             <div ref={formSectionRef} className={`${tw.card} p-5`}>
//               {/* Progression des étapes */}
//               <div className="mb-5">
//                 <div className="flex items-center gap-4">
//                   {[
//                     { n: 1, label: "Données du film" },
//                     { n: 2, label: "IA & Fichiers" },
//                   ].map(({ n, label }, i) => (
//                     <div key={n} className="flex items-center gap-4">
//                       {i > 0 && (
//                         <div
//                           className={`w-12 h-0.5 rounded-full ${
//                             formStep >= n 
//                               ? "bg-gradient-to-r from-[#AD46FF] to-[#F6339A]" 
//                               : "bg-white/10"
//                           }`}
//                         />
//                       )}
//                       <div className="flex items-center gap-2">
//                         <div
//                           className={`${tw.stepIndicator} ${
//                             formStep >= n
//                               ? "bg-gradient-to-br from-[#AD46FF] to-[#F6339A] text-white shadow-md shadow-[#AD46FF]/30"
//                               : "bg-white/[0.06] text-white/25 border border-white/10"
//                           }`}
//                         >
//                           {formStep > n ? "✓" : n}
//                         </div>
//                         <span
//                           className={`text-xs ${formStep >= n ? "text-white/70" : "text-white/20"}`}
//                         >
//                           {label}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {movieError && (
//                 <div className="mb-4 bg-red-900/20 border border-red-700/30 text-red-300 px-4 py-2.5 rounded-lg text-sm">
//                   {movieError}
//                 </div>
//               )}

//               <form
//                 onSubmit={handleSubmit((data) =>
//                   createMovieMutation.mutate(data),
//                 )}
//                 className="space-y-5"
//               >
//                 {/* ═══════ ÉTAPE 1 ═══════ */}
//                 {formStep === 1 && (
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                       <Fld
//                         label="Titre original *"
//                         error={errors.filmTitleOriginal}
//                       >
//                         <input
//                           type="text"
//                           placeholder="TITRE ORIGINAL"
//                           {...reg("filmTitleOriginal")}
//                           className={`${tw.fieldInput} ${errors.filmTitleOriginal ? tw.fieldInputErr : ""}`}
//                         />
//                       </Fld>

//                       <Fld
//                         label="Durée (s) *"
//                         hint="max 120s"
//                         error={errors.durationSeconds}
//                       >
//                         <input
//                           type="number"
//                           placeholder="60"
//                           max={120}
//                           {...reg("durationSeconds")}
//                           className={`${tw.fieldInput} ${errors.durationSeconds ? tw.fieldInputErr : ""}`}
//                         />
//                       </Fld>

//                       <Fld label="Langue">
//                         <input
//                           type="text"
//                           placeholder="Français"
//                           {...reg("filmLanguage")}
//                           className={tw.fieldInput}
//                         />
//                       </Fld>

//                       <Fld label="Année">
//                         <input
//                           type="number"
//                           placeholder="2026"
//                           {...reg("releaseYear")}
//                           className={tw.fieldInput}
//                         />
//                       </Fld>

//                       <Fld label="Nationalité">
//                         <input
//                           type="text"
//                           placeholder="France"
//                           {...reg("nationality")}
//                           className={tw.fieldInput}
//                         />
//                       </Fld>

//                       <Fld label="Comment nous avez-vous connu ?">
//                         <select {...reg("knownByMarsAi")} className={tw.fieldInput}>
//                           <option value="">Sélectionner</option>
//                           <option value="Par un ami">Par un ami</option>
//                           <option value="Vu une publicité du festival">
//                             Via une publicité
//                           </option>
//                           <option value="Via le site internet ou application de l'IA">
//                             Via le site / appli IA
//                           </option>
//                         </select>
//                       </Fld>

//                       <Fld label="Catégorie *" error={errors.categoryId}>
//                         <select
//                           {...reg("categoryId")}
//                           className={`${tw.fieldInput} ${errors.categoryId ? tw.fieldInputErr : ""}`}
//                         >
//                           <option value="">Sélectionner une catégorie</option>
//                           {categories.map((c) => (
//                             <option key={c.id_categorie} value={c.id_categorie}>
//                               {c.name}
//                             </option>
//                           ))}
//                         </select>
//                       </Fld>

//                       <Fld label="Traduction">
//                         <input
//                           type="text"
//                           placeholder="English title"
//                           {...reg("translation")}
//                           className={tw.fieldInput}
//                         />
//                       </Fld>
//                     </div>

//                     <Fld
//                       label="Synopsis original * (300 car.)"
//                       className="md:col-span-3"
//                       error={errors.synopsisOriginal}
//                     >
//                       <textarea
//                         rows={3}
//                         maxLength={300}
//                         placeholder="Résumez votre film en quelques lignes…"
//                         {...reg("synopsisOriginal")}
//                         className={`${tw.fieldInput} resize-none ${errors.synopsisOriginal ? tw.fieldInputErr : ""}`}
//                       />
//                     </Fld>

//                     <Fld
//                       label="Synopsis anglais (300 car.)"
//                       className="md:col-span-3"
//                     >
//                       <textarea
//                         rows={3}
//                         maxLength={300}
//                         placeholder="Summary in English…"
//                         {...reg("synopsisEnglish")}
//                         className={`${tw.fieldInput} resize-none`}
//                       />
//                     </Fld>

//                     <div className="flex justify-end pt-2">
//                       <button
//                         type="button"
//                         onClick={handleNextStep}
//                         className={tw.primaryBtn}
//                       >
//                         Continuer →
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* ═══════ ÉTAPE 2 ═══════ */}
//                 {formStep === 2 && (
//                   <div className="space-y-5">
//                     <div className="grid grid-cols-1 gap-4">
//                       {/* Classification IA */}
//                       <Fld
//                         label="Classification IA *"
//                         error={errors.aiClassification}
//                       >
//                         <div className="flex gap-3">
//                           {[
//                             {
//                               value: "integrale",
//                               label: "100 % IA générative",
//                             },
//                             { value: "hybride", label: "Hybride (réel + IA)" },
//                           ].map((opt) => (
//                             <label
//                               key={opt.value}
//                               className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-4 py-3 cursor-pointer hover:border-[#AD46FF]/40 transition flex-1"
//                             >
//                               <input
//                                 type="radio"
//                                 value={opt.value}
//                                 {...reg("aiClassification")}
//                                 className="w-4 h-4 accent-[#AD46FF]"
//                               />
//                               <span className="text-sm text-white/80">
//                                 {opt.label}
//                               </span>
//                             </label>
//                           ))}
//                         </div>
//                       </Fld>

//                       <Fld label="Outils IA utilisés">
//                         <textarea
//                           rows={2}
//                           maxLength={500}
//                           placeholder="Midjourney, Runway, ElevenLabs..."
//                           {...reg("aiStack")}
//                           className={`${tw.fieldInput} resize-none`}
//                         />
//                       </Fld>

//                       <Fld label="Méthodologie créative">
//                         <textarea
//                           rows={2}
//                           maxLength={500}
//                           placeholder="Décrivez votre processus..."
//                           {...reg("aiMethodology")}
//                           className={`${tw.fieldInput} resize-none`}
//                         />
//                       </Fld>

//                       {/* Collaborateurs */}
//                       <Fld label={`Collaborateurs (${collabFields.length})`}>
//                         <button
//                           type="button"
//                           onClick={() => setShowCollaboratorsModal(true)}
//                           className={`${tw.fieldInput} text-left text-white/50 text-sm`}
//                         >
//                           {collabFields.length === 0
//                             ? "Gérer les collaborateurs (facultatif)"
//                             : `${collabFields.length} collaborateur(s)`}
//                         </button>
//                       </Fld>
//                     </div>

//                     {/* ── Fichiers ── */}
//                     <div className="space-y-4">
//                       <h3 className="text-xs uppercase tracking-wider text-white/30 font-medium">
//                         Fichiers
//                       </h3>

//                       {/* Fichier film */}
//                       <div className="flex flex-col gap-2">
//                         <label className="text-sm text-white/50">
//                           Fichier vidéo <span className="text-red-400">*</span>
//                         </label>
//                         <div className="flex items-center gap-3">
//                           <label className={tw.fileBtn}>
//                             <span>📁</span> Choisir
//                             <input
//                               ref={filmFileRef}
//                               type="file"
//                               accept="video/*"
//                               className="sr-only"
//                               onChange={(e) =>
//                                 setFilmFileName(e.target.files?.[0]?.name || "")
//                               }
//                             />
//                           </label>
//                           <span className="text-sm text-white/30 truncate max-w-[200px]">
//                             {filmFileName || "Aucun fichier"}
//                           </span>
//                         </div>
//                       </div>

//                       {/* FIX: 3 vignettes nommées thumbnail1/2/3 */}
//                       <div className="flex flex-col gap-2">
//                         <label className="text-sm text-white/50">
//                           Vignettes (max 3)
//                         </label>
//                         <div className="flex gap-2">
//                           {[0, 1, 2].map((i) => (
//                             <div key={i} className="flex-1">
//                               <label className={`${tw.fileBtn} w-full justify-center`}>
//                                 {thumbFiles[i] ? (
//                                   <span className="text-emerald-400">✓ Image {i + 1}</span>
//                                 ) : (
//                                   <span>📷 Image {i + 1}</span>
//                                 )}
//                                 <input
//                                   ref={thumbRefs[i]}
//                                   type="file"
//                                   accept="image/*"
//                                   className="sr-only"
//                                   onChange={(e) => {
//                                     const file = e.target.files?.[0];
//                                     setThumbFiles((p) => {
//                                       const n = [...p];
//                                       n[i] = file || null;
//                                       return n;
//                                     });
//                                     setThumbNames((p) => {
//                                       const n = [...p];
//                                       n[i] = file?.name || "";
//                                       return n;
//                                     });
//                                   }}
//                                 />
//                               </label>
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Sous-titres */}
//                       <div className="flex flex-col gap-2">
//                         <label className="text-sm text-white/50">
//                           Sous-titres (.srt)
//                         </label>
//                         <div className="flex items-center gap-3">
//                           <label className={tw.fileBtn}>
//                             <span>📄</span> Choisir
//                             <input
//                               ref={subtitleRef}
//                               type="file"
//                               accept=".srt"
//                               className="sr-only"
//                               onChange={(e) =>
//                                 setSubtitlesName(
//                                   e.target.files?.[0]?.name || "",
//                                 )
//                               }
//                             />
//                           </label>
//                           <span className="text-sm text-white/30 truncate max-w-[200px]">
//                             {subtitlesName || "Aucun fichier"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Conditions */}
//                     <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.07] rounded-lg p-3">
//                       <input
//                         id="acceptTerms"
//                         type="checkbox"
//                         {...reg("acceptTerms")}
//                         className="w-4 h-4 mt-0.5 cursor-pointer accent-[#AD46FF]"
//                       />
//                       <label
//                         htmlFor="acceptTerms"
//                         className="text-sm text-white/60 cursor-pointer leading-relaxed"
//                       >
//                         J'accepte les{" "}
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setShowTermsModal(true);
//                           }}
//                           className="text-[#AD46FF] hover:text-[#F6339A] underline font-medium"
//                         >
//                           conditions
//                         </button>
//                       </label>
//                     </div>
//                     {errors.acceptTerms && (
//                       <p className="text-red-400 text-xs">
//                         {errors.acceptTerms.message}
//                       </p>
//                     )}

//                     {/* Button layout - Retour on left, Annuler (red) and Soumettre on right */}
//                     <div className="flex items-center justify-between pt-3">
//                       <button
//                         type="button"
//                         onClick={() => setFormStep(1)}
//                         className={tw.secondaryBtn}
//                       >
//                         ← Retour
//                       </button>
//                       <div className="flex gap-3">
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setShowForm(false);
//                             resetForm();
//                           }}
//                           className={tw.cancelBtn}
//                         >
//                           Annuler
//                         </button>
//                         <button
//                           type="submit"
//                           disabled={createMovieMutation.isPending || !acceptTerms || !filmFileName}
//                           className={tw.primaryBtn}
//                         >
//                           {createMovieMutation.isPending ? (
//                             <span className="flex items-center gap-2">
//                               <span className="animate-spin">🌀</span>
//                               Envoi...
//                             </span>
//                           ) : !filmFileName ? (
//                             "Sélectionnez une vidéo"
//                           ) : (
//                             "Soumettre"
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </form>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Modale collaborateurs ── */}
//       {showCollaboratorsModal && (
//         <Modal
//           title="Collaborateurs"
//           onClose={() => setShowCollaboratorsModal(false)}
//           maxW="max-w-4xl"
//         >
//           <button
//             type="button"
//             onClick={() =>
//               appendCollab({
//                 first_name: "",
//                 last_name: "",
//                 email: "",
//                 job: "",
//               })
//             }
//             className="mb-4 px-4 py-2 bg-[#AD46FF]/10 text-[#AD46FF] border border-[#AD46FF]/25 rounded-lg text-sm font-medium hover:bg-[#AD46FF]/15 transition"
//           >
//             + Ajouter un collaborateur
//           </button>
//           {collabFields.length === 0 && (
//             <p className="text-white/30 text-center py-8 text-sm">
//               Aucun collaborateur ajouté.
//             </p>
//           )}
//           <div className="space-y-3">
//             {collabFields.map((field, idx) => (
//               <div
//                 key={field.id}
//                 className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-white/[0.03] border border-white/[0.06] p-3 rounded-lg"
//               >
//                 {[
//                   {
//                     name: `collaborators.${idx}.first_name`,
//                     placeholder: "Prénom",
//                   },
//                   {
//                     name: `collaborators.${idx}.last_name`,
//                     placeholder: "Nom",
//                   },
//                   {
//                     name: `collaborators.${idx}.email`,
//                     placeholder: "Email",
//                   },
//                   { name: `collaborators.${idx}.job`, placeholder: "Rôle" },
//                 ].map(({ name, placeholder }) => (
//                   <input
//                     key={name}
//                     type="text"
//                     {...reg(name)}
//                     placeholder={placeholder}
//                     className={`${tw.fieldInput} text-sm`}
//                   />
//                 ))}
//                 <div className="md:col-span-4 flex justify-end">
//                   <button
//                     type="button"
//                     onClick={() => removeCollab(idx)}
//                     className="text-red-400/70 hover:text-red-400 text-xs transition"
//                   >
//                     ✕ Supprimer
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-4 flex justify-end">
//             <button
//               type="button"
//               onClick={() => setShowCollaboratorsModal(false)}
//               className={tw.secondaryBtn}
//             >
//               Fermer
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ── Modale conditions ── */}
//       {showTermsModal && (
//         <Modal
//           title="Conditions de participation"
//           onClose={() => setShowTermsModal(false)}
//           maxW="max-w-4xl"
//         >
//           <div className="space-y-4 text-white/60 text-sm leading-relaxed">
//             {[
//               {
//                 title: "1. Conditions de participation",
//                 content: [
//                   "Votre film doit être une création originale utilisant l'intelligence artificielle.",
//                   "La durée maximale est de 2 minutes (120 secondes).",
//                   "Vous détenez tous les droits nécessaires sur votre œuvre.",
//                   "Le festival peut utiliser des extraits à des fins promotionnelles.",
//                   "La décision du jury est définitive et sans appel.",
//                 ],
//               },
//               {
//                 title: "2. Droits d'auteur",
//                 content: [
//                   "Vous conservez tous les droits d'auteur sur votre film. Le festival obtient uniquement une licence non exclusive pour diffuser votre œuvre dans le cadre de l'événement et de sa promotion.",
//                 ],
//               },
//               {
//                 title: "3. Transparence IA",
//                 content: [
//                   "Vous devez indiquer de façon transparente les outils d'IA utilisés ainsi que la méthodologie employée. Le non-respect peut entraîner la disqualification.",
//                 ],
//               },
//               {
//                 title: "4. Contact",
//                 content: ["Pour toute question : contact@marsaifestival.com"],
//               },
//             ].map(({ title, content }) => (
//               <div key={title}>
//                 <h4 className="text-white font-medium mb-2 text-sm">{title}</h4>
//                 <ul className="space-y-1 list-disc list-inside">
//                   {content.map((item) => (
//                     <li key={item}>{item}</li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//           <div className="mt-5 flex justify-end">
//             <button
//               type="button"
//               onClick={() => setShowTermsModal(false)}
//               className={tw.primaryBtn}
//             >
//               J'ai compris
//             </button>
//           </div>
//         </Modal>
//       )}

//       {/* ── Modale détail film ── */}
//       {selectedMovie && (
//         <Modal
//           title={selectedMovie.title}
//           onClose={() => {
//             setSelectedMovie(null);
//             setEditingMovieId(null);
//           }}
//           maxW="max-w-5xl"
//         >
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {/* Infos */}
//             <div className="space-y-4">
//               {/* Status */}
//               {(() => {
//                 const badge = getStatusBadge(selectedMovie.selection_status);
//                 return (
//                   <div className="flex items-center gap-2">
//                     <span className="text-xs text-white/35">Statut :</span>
//                     <span className={`${tw.statusBadge} ${badge.color}`}>
//                       <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
//                       {badge.label}
//                     </span>
//                   </div>
//                 );
//               })()}

//               {/* Infos techniques */}
//               <div className="grid grid-cols-2 gap-3 text-sm text-white/55">
//                 {[
//                   ["Durée", selectedMovie.duration ? `${selectedMovie.duration}s` : "—"],
//                   ["Langue", selectedMovie.main_language || "—"],
//                   ["Nationalité", selectedMovie.nationality || "—"],
//                   ["Outil IA", selectedMovie.ai_tool || "—"],
//                 ].map(([k, v]) => (
//                   <div key={k}>
//                     <p className="text-white/25 text-[10px] uppercase mb-0.5">{k}</p>
//                     <p className="text-sm">{v}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* Synopsis */}
//               {(selectedMovie.synopsis || selectedMovie.description) && (
//                 <div>
//                   <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">
//                     Synopsis
//                   </p>
//                   <p className="text-sm text-white/50 leading-relaxed">
//                     {selectedMovie.synopsis || selectedMovie.description}
//                   </p>
//                 </div>
//               )}

//               {/* Liens */}
//               <div className="flex flex-wrap gap-3">
//                 {selectedMovie.subtitle && (
//                   <a
//                     href={`${UPLOAD_BASE}/${selectedMovie.subtitle}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     download
//                     className="text-sm text-[#AD46FF] hover:text-[#F6339A]"
//                   >
//                     📄 Sous-titres
//                   </a>
//                 )}
//                 {selectedMovie.youtube_link && (
//                   <a
//                     href={selectedMovie.youtube_link}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-sm text-[#AD46FF] hover:text-[#F6339A]"
//                   >
//                     ▶ YouTube
//                   </a>
//                 )}
//               </div>

//               {/* Collaborateurs */}
//               <div className="border-t border-white/[0.06] pt-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-[10px] uppercase tracking-wider text-white/25">
//                     Collaborateurs
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => startEditCollaborators(selectedMovie)}
//                     className="text-xs text-[#AD46FF] hover:text-[#F6339A]"
//                   >
//                     Modifier
//                   </button>
//                 </div>
//                 {selectedMovie.Collaborators?.length ? (
//                   <ul className="text-sm text-white/55 space-y-1">
//                     {selectedMovie.Collaborators.map((c) => (
//                       <li key={c.id_collaborator} className="flex items-center gap-1">
//                         <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/50" />
//                         {c.first_name} {c.last_name}
//                         {c.job && <span className="text-white/30 text-xs">— {c.job}</span>}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-sm text-white/25">Aucun collaborateur.</p>
//                 )}

//                 {editingMovieId === selectedMovie.id_movie && (
//                   <div className="mt-3 space-y-2">
//                     {(collabDrafts[selectedMovie.id_movie] || []).map(
//                       (c, idx) => (
//                         <div
//                           key={idx}
//                           className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-lg"
//                         >
//                           {["first_name", "last_name", "email", "job"].map(
//                             (field) => (
//                               <input
//                                 key={field}
//                                 type={field === "email" ? "email" : "text"}
//                                 placeholder={
//                                   {
//                                     first_name: "Prénom",
//                                     last_name: "Nom",
//                                     email: "E-mail",
//                                     job: "Rôle",
//                                   }[field]
//                                 }
//                                 value={c[field]}
//                                 onChange={(e) =>
//                                   updateDraftField(
//                                     selectedMovie.id_movie,
//                                     idx,
//                                     field,
//                                     e.target.value,
//                                   )
//                                 }
//                                 className={`${tw.fieldInput} text-sm`}
//                               />
//                             ),
//                           )}
//                           <div className="col-span-2 md:col-span-4 flex justify-end">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 setCollabDrafts((p) => {
//                                   const list = [
//                                     ...(p[selectedMovie.id_movie] || []),
//                                   ];
//                                   list.splice(idx, 1);
//                                   return {
//                                     ...p,
//                                     [selectedMovie.id_movie]: list,
//                                   };
//                                 })
//                               }
//                               className="text-red-400/60 hover:text-red-400 text-xs"
//                             >
//                               ✕ Supprimer
//                             </button>
//                           </div>
//                         </div>
//                       ),
//                     )}
//                     <div className="flex gap-2 mt-3">
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setCollabDrafts((p) => ({
//                             ...p,
//                             [selectedMovie.id_movie]: [
//                               ...(p[selectedMovie.id_movie] || []),
//                               {
//                                 first_name: "",
//                                 last_name: "",
//                                 email: "",
//                                 job: "",
//                               },
//                             ],
//                           }))
//                         }
//                         className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.07] text-white/60 rounded hover:bg-white/[0.08] transition"
//                       >
//                         + Ajouter
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() =>
//                           updateCollabMutation.mutate({
//                             id: selectedMovie.id_movie,
//                             collaborators:
//                               collabDrafts[selectedMovie.id_movie] || [],
//                           })
//                         }
//                         className="px-3 py-1.5 text-xs bg-[#AD46FF]/10 text-[#AD46FF] border border-[#AD46FF]/25 rounded hover:bg-[#AD46FF]/15 transition font-medium"
//                       >
//                         Enregistrer
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setEditingMovieId(null)}
//                         className="px-3 py-1.5 text-xs border border-white/[0.07] text-white/40 rounded hover:bg-white/[0.04] transition"
//                       >
//                         Annuler
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Vidéo */}
//             {(getTrailer(selectedMovie) || selectedMovie.youtube_link) && (
//               <div>
//                 {getTrailer(selectedMovie) ? (
//                   <div className="rounded-lg overflow-hidden border border-white/[0.07]">
//                     <VideoPreview
//                       title={selectedMovie.title}
//                       src={`${UPLOAD_BASE}/${getTrailer(selectedMovie)}`}
//                       poster={getPoster(selectedMovie) || undefined}
//                       openMode="fullscreen"
//                     />
//                   </div>
//                 ) : (
//                   <a
//                     href={selectedMovie.youtube_link}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="inline-flex items-center gap-1 text-[#AD46FF] hover:text-[#F6339A] text-base"
//                   >
//                     ▶ Ouvrir la vidéo ↗
//                   </a>
//                 )}
//               </div>
//             )}
//           </div>
//         </Modal>
//       )}
//     </>
//   );
// }

// /* ── Mini-composants ──────────────────────────────────── */
// function Modal({ title, onClose, maxW = "max-w-4xl", children }) {
//   return (
//     <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
//       <div
//         className={`bg-[#0d0f12] border border-white/[0.07] rounded-xl w-full ${maxW} max-h-[85vh] overflow-y-auto p-5 shadow-2xl`}
//       >
//         <div className="sticky top-0 z-10 flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06] bg-[#0d0f12]">
//           <h3 className="text-lg font-semibold text-white">{title}</h3>
//           <button
//             type="button"
//             onClick={onClose}
//             className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.07] rounded transition text-lg"
//           >
//             ✕
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }


// function Fld({ label, hint, error, children, className = "" }) {
//   return (
//     <div className={`flex flex-col gap-1 ${className}`}>
//       <label className="text-[10px] uppercase tracking-wider text-white/35 font-medium">
//         {label}
//       </label>
//       {children}
//       {hint && <p className="text-[9px] text-white/25">{hint}</p>}
//       {error && (
//         <p className="text-xs text-red-400">{error.message}</p>
//       )}
//     </div>
//   );
// }


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
import { getPoster, getTrailer } from "../../utils/movieUtils.js";

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
    "w-full bg-white/[0.02] border border-white/[0.08] text-white px-4 py-2.5 rounded-lg text-sm transition-all duration-200 outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF] focus:ring-1 focus:ring-[#AD46FF]/20 placeholder:text-white/20",
  fieldInputErr: "border-red-500/50 bg-red-500/[0.02] focus:ring-red-500/20",
  
  // File buttons - comfortable
  fileBtn:
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#AD46FF]/10 border border-[#AD46FF]/25 text-[#AD46FF] text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[#AD46FF]/15 hover:border-[#AD46FF]/40",
  
  // Cards with good padding
  card: "bg-white/[0.03] border border-white/[0.07] rounded-xl shadow-lg",
  
  // Primary button - good size
  primaryBtn: "px-5 py-2.5 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#AD46FF]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
  
  // Secondary button - good size
  secondaryBtn: "px-5 py-2.5 border border-white/[0.08] bg-white/[0.02] text-white/70 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white/90",
  
  // Cancel button - red
  cancelBtn: "px-5 py-2.5 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40",
  
  // Status badges - readable
  statusBadge: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-lg",
  
  // Section titles
  sectionTitle: "text-xs font-semibold text-white/50 uppercase tracking-wider",
  
  // Step indicator - comfortable
  stepIndicator: "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-300",
  
  // Film card - good proportions
  filmCard: "bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-[#AD46FF]/40 hover:shadow-lg hover:shadow-[#AD46FF]/10 transition-all hover:scale-[1.02] text-left",
};

/* ─── Statuts pipeline ─────────────────────────────────── */
const STATUS_MAP = {
  submitted: { 
    label: "Soumis", 
    color: "bg-gradient-to-r from-zinc-600 to-zinc-700 text-white",
    dot: "#a1a1aa" 
  },
  assigned: {
    label: "En cours d'évaluation",
    color: "bg-gradient-to-r from-sky-500 to-sky-600 text-white",
    dot: "#38bdf8",
  },
  to_discuss: { 
    label: "En discussion", 
    color: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
    dot: "#fbbf24" 
  },
  candidate: { 
    label: "Candidat", 
    color: "bg-gradient-to-r from-violet-500 to-violet-600 text-white",
    dot: "#a78bfa" 
  },
  selected: { 
    label: "Sélectionné ✓", 
    color: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
    dot: "#34d399" 
  },
  finalist: { 
    label: "Finaliste ⭐", 
    color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    dot: "#fb923c" 
  },
  refused: { 
    label: "Non retenu", 
    color: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    dot: "#f87171" 
  },
  awarded: { 
    label: "Primé 🏆", 
    color: "bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-900",
    dot: "#facc15" 
  },
};
const getStatusBadge = (s) =>
  STATUS_MAP[s] || {
    label: "En attente",
    color: "bg-gradient-to-r from-zinc-600 to-zinc-700 text-white",
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
  const formSectionRef = useRef(null); // scroll to form
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
        }
      } catch { /* ignore */ }
    }, INTERVAL);
  }

    const createMovieMutation = useMutation({
    mutationFn: async (data) => {
      /* Guard: un fichier vidéo est obligatoire */
      const filmFileCheck = filmFileRef.current?.files?.[0];
      if (!filmFileCheck) {
        throw new Error("Veuillez sélectionner un fichier vidéo avant de soumettre.");
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
      // Lance le polling pour rattraper la mise à jour du trailer par le watcher
      // On passe l'id_movie retourné par le backend pour stopper dès que ce film
      // spécifique a son trailer archivé — quelle que soit la durée du traitement.
      startTrailerPolling(data?.data?.movie?.id_movie);
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
    categoryId?.toString().trim().length > 0 &&
    Boolean(filmFileRef.current?.files?.[0]);

  function handleNextStep() {
    if (!isStep1Valid()) {
      setMovieError("Veuillez remplir le titre, la durée (≤ 120 s) et le synopsis.");
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
      <div className="min-h-screen bg-[#070709] text-white pt-24 pb-16 px-4 md:pt-28">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ── En-tête ── */}
          <div className="relative">
            <div className="relative flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#AD46FF] to-[#F6339A] flex items-center justify-center text-white font-bold text-base shadow-lg">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-xs text-white/35">{user.email}</p>
              </div>
              <span className="px-3 py-1.5 bg-[#AD46FF]/10 text-[#AD46FF] border border-[#AD46FF]/25 rounded-full text-xs font-semibold">
                Producteur
              </span>
            </div>
          </div>

          {/* ── Section profil ── */}
          <div className={`${tw.card} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={tw.sectionTitle}>Profil</h2>
              <button
                onClick={() => setEditMode((v) => !v)}
                className="text-xs text-[#AD46FF] hover:text-[#F6339A] transition-colors"
              >
                {editMode ? "Annuler" : "Modifier"}
              </button>
            </div>

            {profileSuccess && (
              <div className="mb-4 bg-emerald-900/20 border border-emerald-700/30 text-emerald-300 px-4 py-2 rounded-lg text-sm">
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
                    <label className="text-[10px] uppercase tracking-wider text-white/30">
                      {label}
                    </label>
                    {type === "textarea" ? (
                      <textarea
                        name={name}
                        value={profileForm[name] || ""}
                        onChange={handleProfileChange}
                        rows={3}
                        className={`${tw.fieldInput} resize-none`}
                      />
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={profileForm[name] || ""}
                        onChange={handleProfileChange}
                        className={tw.fieldInput}
                      />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className={tw.secondaryBtn}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={tw.primaryBtn}
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[
                  { label: "Téléphone", value: user.phone },
                  { label: "Pays", value: user.country },
                  { label: "Site web", value: user.portfolio },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">
                      {label}
                    </p>
                    <p className="text-white/60 text-sm">{value || "—"}</p>
                  </div>
                ))}
                {user.biography && (
                  <div className="md:col-span-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">
                      Biographie
                    </p>
                    <p className="text-white/55 text-sm leading-relaxed">
                      {user.biography}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mes films ── */}
          <div className={`${tw.card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={tw.sectionTitle}>
                Mes films
                {movies.length > 0 && (
                  <span className="ml-2 text-[#AD46FF] text-sm">({movies.length})</span>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                  setMovieError(null);
                  setMovieSuccess(null);
                  setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                }}
                className={tw.primaryBtn}
              >
                <span className="mr-1 text-base">+</span>
                Soumettre un film
              </button>
            </div>

            {movieSuccess && !showForm && (
              <div className="mb-4 bg-emerald-900/20 border border-emerald-700/30 text-emerald-300 px-4 py-2 rounded-lg text-sm">
                {movieSuccess}
              </div>
            )}

            {movies.length === 0 && !showForm ? (
              <div className="flex flex-col items-center py-12 text-white/20 gap-3">
                <span className="text-5xl">🎬</span>
                <p className="text-sm text-center">
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
                      className={tw.filmCard}
                    >
                      <div className="h-36 bg-black/40 relative overflow-hidden">
                        {poster ? (
                          <img
                            src={poster}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/15 text-3xl">
                            🎬
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2">
                          <span className={`${tw.statusBadge} ${badge.color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-white/90 truncate group-hover:text-[#AD46FF] transition">
                          {movie.title}
                        </p>
                        <p className="text-xs text-white/35 mt-1 line-clamp-2">
                          {movie.synopsis || movie.description || "Aucun synopsis"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/25">
                          {movie.duration && <span>{movie.duration}s</span>}
                          {movie.main_language && <span>{movie.main_language}</span>}
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
            <div ref={formSectionRef} className={`${tw.card} p-5`}>
              {/* Progression des étapes */}
              <div className="mb-5">
                <div className="flex items-center gap-4">
                  {[
                    { n: 1, label: "Données du film" },
                    { n: 2, label: "IA & Fichiers" },
                  ].map(({ n, label }, i) => (
                    <div key={n} className="flex items-center gap-4">
                      {i > 0 && (
                        <div
                          className={`w-12 h-0.5 rounded-full ${
                            formStep >= n 
                              ? "bg-gradient-to-r from-[#AD46FF] to-[#F6339A]" 
                              : "bg-white/10"
                          }`}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <div
                          className={`${tw.stepIndicator} ${
                            formStep >= n
                              ? "bg-gradient-to-br from-[#AD46FF] to-[#F6339A] text-white shadow-md shadow-[#AD46FF]/30"
                              : "bg-white/[0.06] text-white/25 border border-white/10"
                          }`}
                        >
                          {formStep > n ? "✓" : n}
                        </div>
                        <span
                          className={`text-xs ${formStep >= n ? "text-white/70" : "text-white/20"}`}
                        >
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {movieError && (
                <div className="mb-4 bg-red-900/20 border border-red-700/30 text-red-300 px-4 py-2.5 rounded-lg text-sm">
                  {movieError}
                </div>
              )}

              <form
                onSubmit={handleSubmit((data) =>
                  createMovieMutation.mutate(data),
                )}
                className="space-y-5"
              >
                {/* ═══════ ÉTAPE 1 ═══════ */}
                {formStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Fld
                        label="Titre original *"
                        error={errors.filmTitleOriginal}
                      >
                        <input
                          type="text"
                          placeholder="TITRE ORIGINAL"
                          {...reg("filmTitleOriginal")}
                          className={`${tw.fieldInput} ${errors.filmTitleOriginal ? tw.fieldInputErr : ""}`}
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
                          className={`${tw.fieldInput} ${errors.durationSeconds ? tw.fieldInputErr : ""}`}
                        />
                      </Fld>

                      <Fld label="Langue">
                        <input
                          type="text"
                          placeholder="Français"
                          {...reg("filmLanguage")}
                          className={tw.fieldInput}
                        />
                      </Fld>

                      <Fld label="Année">
                        <input
                          type="number"
                          placeholder="2026"
                          {...reg("releaseYear")}
                          className={tw.fieldInput}
                        />
                      </Fld>

                      <Fld label="Nationalité">
                        <input
                          type="text"
                          placeholder="France"
                          {...reg("nationality")}
                          className={tw.fieldInput}
                        />
                      </Fld>

                      <Fld label="Comment nous avez-vous connu ?">
                        <select {...reg("knownByMarsAi")} className={tw.fieldInput}>
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
                          className={`${tw.fieldInput} ${errors.categoryId ? tw.fieldInputErr : ""}`}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map((c) => (
                            <option key={c.id_categorie} value={c.id_categorie}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Fld>

                      <Fld label="Traduction">
                        <input
                          type="text"
                          placeholder="English title"
                          {...reg("translation")}
                          className={tw.fieldInput}
                        />
                      </Fld>
                    </div>

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
                        className={`${tw.fieldInput} resize-none ${errors.synopsisOriginal ? tw.fieldInputErr : ""}`}
                      />
                    </Fld>

                    <Fld
                      label="Synopsis anglais (300 car.)"
                      className="md:col-span-3"
                    >
                      <textarea
                        rows={3}
                        maxLength={300}
                        placeholder="Summary in English…"
                        {...reg("synopsisEnglish")}
                        className={`${tw.fieldInput} resize-none`}
                      />
                    </Fld>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className={tw.primaryBtn}
                      >
                        Continuer →
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══════ ÉTAPE 2 ═══════ */}
                {formStep === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Classification IA */}
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
                            { value: "hybride", label: "Hybride (réel + IA)" },
                          ].map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-4 py-3 cursor-pointer hover:border-[#AD46FF]/40 transition flex-1"
                            >
                              <input
                                type="radio"
                                value={opt.value}
                                {...reg("aiClassification")}
                                className="w-4 h-4 accent-[#AD46FF]"
                              />
                              <span className="text-sm text-white/80">
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
                          className={`${tw.fieldInput} resize-none`}
                        />
                      </Fld>

                      <Fld label="Méthodologie créative">
                        <textarea
                          rows={2}
                          maxLength={500}
                          placeholder="Décrivez votre processus..."
                          {...reg("aiMethodology")}
                          className={`${tw.fieldInput} resize-none`}
                        />
                      </Fld>

                      {/* Collaborateurs */}
                      <Fld label={`Collaborateurs (${collabFields.length})`}>
                        <button
                          type="button"
                          onClick={() => setShowCollaboratorsModal(true)}
                          className={`${tw.fieldInput} text-left text-white/50 text-sm`}
                        >
                          {collabFields.length === 0
                            ? "Gérer les collaborateurs (facultatif)"
                            : `${collabFields.length} collaborateur(s)`}
                        </button>
                      </Fld>
                    </div>

                    {/* ── Fichiers ── */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-wider text-white/30 font-medium">
                        Fichiers
                      </h3>

                      {/* Fichier film */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-white/50">
                          Fichier vidéo <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <label className={tw.fileBtn}>
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
                          <span className="text-sm text-white/30 truncate max-w-[200px]">
                            {filmFileName || "Aucun fichier"}
                          </span>
                        </div>
                      </div>

                      {/* FIX: 3 vignettes nommées thumbnail1/2/3 */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-white/50">
                          Vignettes (max 3)
                        </label>
                        <div className="flex gap-2">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="flex-1">
                              <label className={`${tw.fileBtn} w-full justify-center`}>
                                {thumbFiles[i] ? (
                                  <span className="text-emerald-400">✓ Image {i + 1}</span>
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
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sous-titres */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-white/50">
                          Sous-titres (.srt)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className={tw.fileBtn}>
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
                          <span className="text-sm text-white/30 truncate max-w-[200px]">
                            {subtitlesName || "Aucun fichier"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.07] rounded-lg p-3">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        {...reg("acceptTerms")}
                        className="w-4 h-4 mt-0.5 cursor-pointer accent-[#AD46FF]"
                      />
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm text-white/60 cursor-pointer leading-relaxed"
                      >
                        J'accepte les{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTermsModal(true);
                          }}
                          className="text-[#AD46FF] hover:text-[#F6339A] underline font-medium"
                        >
                          conditions
                        </button>
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-red-400 text-xs">
                        {errors.acceptTerms.message}
                      </p>
                    )}

                    {/* Button layout - Retour on left, Annuler (red) and Soumettre on right */}
                    <div className="flex items-center justify-between pt-3">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className={tw.secondaryBtn}
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
                          className={tw.cancelBtn}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={createMovieMutation.isPending || !acceptTerms || !filmFileName}
                          className={tw.primaryBtn}
                        >
                          {createMovieMutation.isPending ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">🌀</span>
                              Envoi...
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
            className="mb-4 px-4 py-2 bg-[#AD46FF]/10 text-[#AD46FF] border border-[#AD46FF]/25 rounded-lg text-sm font-medium hover:bg-[#AD46FF]/15 transition"
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
                className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-white/[0.03] border border-white/[0.06] p-3 rounded-lg"
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
                    placeholder: "Email",
                  },
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
                    className="text-red-400/70 hover:text-red-400 text-xs transition"
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
              className={tw.secondaryBtn}
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
              className={tw.primaryBtn}
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
                    <span className={`${tw.statusBadge} ${badge.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      {badge.label}
                    </span>
                  </div>
                );
              })()}

              {/* Infos techniques */}
              <div className="grid grid-cols-2 gap-3 text-sm text-white/55">
                {[
                  ["Durée", selectedMovie.duration ? `${selectedMovie.duration}s` : "—"],
                  ["Langue", selectedMovie.main_language || "—"],
                  ["Nationalité", selectedMovie.nationality || "—"],
                  ["Outil IA", selectedMovie.ai_tool || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-white/25 text-[10px] uppercase mb-0.5">{k}</p>
                    <p className="text-sm">{v}</p>
                  </div>
                ))}
              </div>

              {/* Synopsis */}
              {(selectedMovie.synopsis || selectedMovie.description) && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1">
                    Synopsis
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
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
                    className="text-sm text-[#AD46FF] hover:text-[#F6339A]"
                  >
                    📄 Sous-titres
                  </a>
                )}
                {selectedMovie.youtube_link && (
                  <a
                    href={selectedMovie.youtube_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[#AD46FF] hover:text-[#F6339A]"
                  >
                    ▶ YouTube
                  </a>
                )}
              </div>

              {/* Collaborateurs */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/25">
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
                      <li key={c.id_collaborator} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#AD46FF]/50" />
                        {c.first_name} {c.last_name}
                        {c.job && <span className="text-white/30 text-xs">— {c.job}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/25">Aucun collaborateur.</p>
                )}

                {editingMovieId === selectedMovie.id_movie && (
                  <div className="mt-3 space-y-2">
                    {(collabDrafts[selectedMovie.id_movie] || []).map(
                      (c, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/[0.03] border border-white/[0.06] p-2.5 rounded-lg"
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
                                className={`${tw.fieldInput} text-sm`}
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
                    <div className="flex gap-2 mt-3">
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
                        className="px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.07] text-white/60 rounded hover:bg-white/[0.08] transition"
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
                        className="px-3 py-1.5 text-xs bg-[#AD46FF]/10 text-[#AD46FF] border border-[#AD46FF]/25 rounded hover:bg-[#AD46FF]/15 transition font-medium"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMovieId(null)}
                        className="px-3 py-1.5 text-xs border border-white/[0.07] text-white/40 rounded hover:bg-white/[0.04] transition"
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
                  <div className="rounded-lg overflow-hidden border border-white/[0.07]">
                    <VideoPreview
                      title={selectedMovie.title}
                      src={`${UPLOAD_BASE}/${getTrailer(selectedMovie)}`}
                      poster={getPoster(selectedMovie) || undefined}
                      openMode="fullscreen"
                    />
                  </div>
                ) : (
                  <a
                    href={selectedMovie.youtube_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#AD46FF] hover:text-[#F6339A] text-base"
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
        className={`bg-[#0d0f12] border border-white/[0.07] rounded-xl w-full ${maxW} max-h-[85vh] overflow-y-auto p-5 shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06] bg-[#0d0f12]">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.07] rounded transition text-lg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


function Fld({ label, hint, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[10px] uppercase tracking-wider text-white/35 font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-[9px] text-white/25">{hint}</p>}
      {error && (
        <p className="text-xs text-red-400">{error.message}</p>
      )}
    </div>
  );
}