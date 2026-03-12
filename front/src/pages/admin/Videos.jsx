// /**
//  * Videos.jsx — Gestion des films (Admin)
//  *
//  * Pipeline strict :
//  *   submitted  → admin vérifie → Accepter (→ assigned) | Refuser
//  *   assigned   → jury vote Phase 1 → Ouvrir Phase 2 (→ to_discuss) | Refuser
//  *   to_discuss → jury vote Phase 2 → Promouvoir (→ selected) | Finaliste | Refuser
//  *   selected   → Finaliste | Primer (→ awarded) | Refuser
//  *   finalist   → Primer (→ awarded) | Refuser
//  *   awarded    → Retirer du palmarès (→ finalist)
//  *   refused    → Remettre en attente (→ submitted)
//  *
//  * FIXES :
//  *   B-07 — Le panneau "Forcer un statut" passe désormais force_transition:true au backend.
//  *   B-08 — Confirmation visuelle affichée après la suppression définitive d'un film.
//  */

// import { useEffect, useMemo, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   getCategories, getVideos, deleteMovie,
//   updateMovie, updateMovieCategories, updateMovieStatus
// } from "../../api/videos.js";
// import { getVotes } from "../../api/votes.js";
// import { VideoPreview } from "../../components/VideoPreview.jsx";
// import { UPLOAD_BASE } from "../../utils/constants.js";
// import { getPoster, getTrailer } from "../../utils/movieUtils.js";

// /* ─── Statuts ─────────────────────────────────────────── */
// const S = {
//   submitted:  { label: "Soumis",       dot: "bg-zinc-400",    badge: "bg-zinc-800 text-zinc-300"          },
//   assigned:   { label: "Phase 1",      dot: "bg-sky-500",     badge: "bg-sky-950 text-sky-300"            },
//   to_discuss: { label: "Phase 2",      dot: "bg-amber-400",   badge: "bg-amber-950 text-amber-300"        },
//   candidate:  { label: "Candidat",     dot: "bg-violet-400",  badge: "bg-violet-950 text-violet-300"      },
//   selected:   { label: "Sélectionné",  dot: "bg-emerald-400", badge: "bg-emerald-950 text-emerald-300"    },
//   finalist:   { label: "Finaliste",    dot: "bg-orange-400",  badge: "bg-orange-950 text-orange-300"      },
//   refused:    { label: "Refusé",       dot: "bg-red-500",     badge: "bg-red-950 text-red-400"            },
//   awarded:    { label: "Primé 🏆",     dot: "bg-yellow-400",  badge: "bg-yellow-900 text-yellow-200"      },
// };
// const scfg = (s) => S[s] || S.submitted;

// const TABS = [
//   { key: "all",        label: "Tous"         },
//   { key: "submitted",  label: "À vérifier"   },
//   { key: "assigned",   label: "Phase 1"      },
//   { key: "to_discuss", label: "Phase 2"      },
//   { key: "selected",   label: "Sélectionnés" },
//   { key: "finalist",   label: "Finalistes"   },
//   { key: "refused",    label: "Refusés"      },
//   { key: "awarded",    label: "Primés"       },
// ];

// const PIPELINE = [
//   { key: "submitted",  short: "Soumis"    },
//   { key: "assigned",   short: "Phase 1"   },
//   { key: "to_discuss", short: "Phase 2"   },
//   { key: "selected",   short: "Sélection" },
//   { key: "finalist",   short: "Finaliste" },
//   { key: "awarded",    short: "Palmarès"  },
// ];
// const PIPELINE_ORDER = PIPELINE.map((p) => p.key);

// /* ─── Actions contextuelles par statut ───────────────── */
// function contextualActions(status, hasVotes, juriesCount) {
//   switch (status) {
//     case "submitted":
//       return {
//         primary: [{
//           to: "assigned", cls: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20",
//           label: "✓ Accepter — lancer la Phase 1",
//           tip: juriesCount === 0
//             ? "⚠ Aucun jury assigné. Après acceptation, allez dans Distribution & Jury."
//             : null,
//         }],
//         danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Refuser le film" }],
//         info: "Vérifiez le film avant d'accepter. Toutes les vérifications doivent être au vert.",
//       };
//     case "assigned":
//       return {
//         primary: [{
//           to: "to_discuss", cls: hasVotes
//             ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/20"
//             : "bg-amber-500/10 text-amber-400/40 border border-amber-500/10 cursor-not-allowed",
//           label: "💬 Ouvrir la Phase 2 (délibération)",
//           tip: !hasVotes ? "En attente des votes Phase 1. Au moins un jury doit avoir voté." : null,
//         }],
//         danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Refuser" }],
//         info: hasVotes
//           ? `${juriesCount} jury(s) assigné(s) — votes reçus. Vous pouvez ouvrir la Phase 2.`
//           : `Phase 1 en cours — ${juriesCount} jury(s) assigné(s). En attente de votes.`,
//       };
//     case "to_discuss":
//       return {
//         primary: [
//           { to: "selected", cls: "bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/20", label: "★ Promouvoir — Sélection officielle" },
//           { to: "finalist",  cls: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20", label: "⭐ Passer directement en Finaliste" },
//         ],
//         danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Refuser" }],
//         info: "Phase 2 ouverte. Attendez les votes de délibération du jury.",
//       };
//     case "selected":
//     case "candidate":
//       return {
//         primary: [
//           { to: "finalist", cls: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20", label: "⭐ Passer en Finaliste" },
//           { to: "awarded",  cls: "bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30", label: "🏆 Primer ce film" },
//         ],
//         danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Retirer de la sélection" }],
//         info: null,
//       };
//     case "finalist":
//       return {
//         primary: [{ to: "awarded", cls: "bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30", label: "🏆 Ajouter au palmarès" }],
//         danger:  [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20",  label: "✗ Retirer" }],
//         info: null,
//       };
//     case "awarded":
//       return {
//         primary: [],
//         danger:  [{ to: "finalist", cls: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20", label: "↩ Retirer du palmarès" }],
//         info: "🏆 Ce film fait partie du palmarès.",
//       };
//     case "refused":
//       return {
//         primary: [{ to: "submitted", cls: "bg-white/10 hover:bg-white/20 text-white/60 border border-white/10", label: "↺ Remettre en attente" }],
//         danger:  [],
//         info: null,
//       };
//     default:
//       return { primary: [], danger: [], info: null };
//   }
// }

// /* ════════════════════════════════════════════════════════
//    COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════ */
// export default function Videos() {
//   const qc = useQueryClient();

//   const { isPending, isError, data, error } = useQuery({
//     queryKey: ["listVideos"], queryFn: getVideos, refetchInterval: 30_000,
//   });
//   const { data: catsData }  = useQuery({ queryKey: ["categories"], queryFn: getCategories });
//   const { data: votesData } = useQuery({ queryKey: ["votes"],      queryFn: getVotes });

//   const allMovies  = data?.data     || [];
//   const categories = catsData?.data || [];
//   const votes      = votesData?.data || [];

//   const voteSummary = useMemo(() => votes.reduce((acc, v) => {
//     if (!acc[v.id_movie]) acc[v.id_movie] = { YES: 0, NO: 0, "TO DISCUSS": 0, total: 0, votes: [] };
//     const s = acc[v.id_movie];
//     if (["YES","NO","TO DISCUSS"].includes(v.note)) s[v.note]++;
//     s.total++;
//     s.votes.push(v);
//     return acc;
//   }, {}), [votes]);

//   const [activeTab,     setActiveTab]     = useState("all");
//   const [search,        setSearch]        = useState("");
//   const [selectedIds,   setSelectedIds]   = useState([]);
//   const [selectedMovie, setSelectedMovie] = useState(null);
//   const [adminComment,  setAdminComment]  = useState("");
//   const [modalNotice,   setModalNotice]   = useState(null);
//   const [catSel,        setCatSel]        = useState({});

//   useEffect(() => {
//     if (!allMovies.length) return;
//     const c = {};
//     allMovies.forEach((m) => { c[m.id_movie] = (m.Categories || []).map((x) => x.id_categorie); });
//     setCatSel(c);
//   }, [data]);

//   useEffect(() => {
//     if (!selectedMovie) { setModalNotice(null); return; }
//     setAdminComment(selectedMovie.admin_comment || "");
//     setModalNotice(null);
//   }, [selectedMovie]);

//   useEffect(() => {
//     if (!modalNotice) return;
//     const t = setTimeout(() => setModalNotice(null), 4500);
//     return () => clearTimeout(t);
//   }, [modalNotice]);

//   const filteredMovies = useMemo(() => allMovies.filter((m) => {
//     const s = m.selection_status || "submitted";
//     if (activeTab !== "all") {
//       const norm = (activeTab === "selected" && ["selected","candidate"].includes(s)) ? true : s === activeTab;
//       if (!norm) return false;
//     }
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       const pr = `${m.Producer?.first_name||""} ${m.Producer?.last_name||""}`.toLowerCase();
//       return m.title?.toLowerCase().includes(q) || pr.includes(q);
//     }
//     return true;
//   }), [allMovies, activeTab, search]);

//   const tabCounts = useMemo(() => {
//     const c = { all: allMovies.length };
//     TABS.slice(1).forEach((t) => {
//       c[t.key] = t.key === "selected"
//         ? allMovies.filter((m) => ["selected","candidate"].includes(m.selection_status||"submitted")).length
//         : allMovies.filter((m) => (m.selection_status||"submitted") === t.key).length;
//     });
//     return c;
//   }, [allMovies]);

//   function inv() { qc.invalidateQueries({ queryKey: ["listVideos"] }); qc.invalidateQueries({ queryKey: ["votes"] }); }
//   const NOTE = { assigned:"✓ Film accepté — Phase 1 lancée.", refused:"Film refusé.", to_discuss:"Phase 2 ouverte.", selected:"Film promu.", finalist:"Film finaliste.", awarded:"🏆 Film primé !", submitted:"Film remis en attente.", candidate:"Statut mis à jour." };

//   const statusM = useMutation({
//     mutationFn: ({ id, status, force }) => updateMovieStatus(id, status, force ? { force_transition: true } : {}),
//     onSuccess: (_,v) => { inv(); setModalNotice(NOTE[v.status] || "Statut mis à jour."); },
//     onError: () => setModalNotice("❌ Erreur lors de la mise à jour."),
//   });
//   const commentM  = useMutation({ mutationFn: ({ id, c }) => updateMovie(id, { admin_comment: c }), onSuccess: () => { inv(); setModalNotice("✓ Note enregistrée."); }, onError: () => setModalNotice("❌ Erreur lors de la sauvegarde de la note.") });
//   const catM      = useMutation({ mutationFn: ({ id, cats }) => updateMovieCategories(id, cats),   onSuccess: () => { inv(); setModalNotice("Catégories mises à jour."); } });

//   // FIX B-08: onSuccess affiche une notice de confirmation AVANT de fermer la modale.
//   // L'utilisateur voit "✓ Film supprimé." pendant 1.5 s puis la modale se ferme.
//   const deleteM = useMutation({
//     mutationFn: (id) => deleteMovie(id),
//     onSuccess: () => {
//       inv();
//       setModalNotice("✓ Film supprimé définitivement.");
//       setTimeout(() => setSelectedMovie(null), 1500);
//     },
//     onError: () => setModalNotice("❌ Erreur lors de la suppression."),
//   });

//   async function batchStatus(s) {
//     if (!selectedIds.length) return;
//     await Promise.all(selectedIds.map((id) => updateMovieStatus(id, s)));
//     inv(); setSelectedIds([]);
//   }

//   if (isPending) return (
//     <div className="flex flex-col items-center justify-center h-64 gap-3">
//       <div className="w-7 h-7 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
//       <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Chargement</p>
//     </div>
//   );

//   if (isError) return (
//     <div className="m-6 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 backdrop-blur-sm">
//       <span>!</span>
//       <span>Erreur : {error?.message}</span>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#06080d] text-white pb-20">

//       {/* ── Header sticky ── */}
//       <div className="sticky top-0 z-20 bg-[#06080d]/97 backdrop-blur-xl border-b border-white/5 px-6 py-0">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
//             <div>
//               <p className="text-[9px] tracking-[0.18em] uppercase text-blue-400/50 mb-1 font-medium">Administration</p>
//               <h1 className="text-[22px] font-semibold tracking-tight text-white">Gestion des films</h1>
//               <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">
//                 {allMovies.length} film{allMovies.length !== 1 ? "s" : ""} enregistres
//               </p>
//             </div>
//             <div className="flex items-center gap-2 flex-wrap">
//               {[
//                 { key:"submitted",  col:"text-zinc-300",   bg:"bg-zinc-500/10"   },
//                 { key:"assigned",   col:"text-sky-300",    bg:"bg-sky-500/10"    },
//                 { key:"to_discuss", col:"text-amber-300",  bg:"bg-amber-500/10"  },
//                 { key:"selected",   col:"text-violet-300", bg:"bg-violet-500/10" },
//                 { key:"finalist",   col:"text-orange-300", bg:"bg-orange-500/10" },
//                 { key:"awarded",    col:"text-yellow-300", bg:"bg-yellow-500/10" },
//               ].map((s) => (
//                 <div key={s.key} className={`flex flex-col items-center min-w-[52px] px-3 py-2 rounded-xl ${s.bg} border border-white/10`}>
//                   <span className={`font-['JetBrains_Mono'] text-lg font-semibold leading-none ${s.col}`}>{tabCounts[s.key] || 0}</span>
//                   <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">{scfg(s.key).label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="flex flex-wrap border-t border-white/5">
//             {TABS.map((tab) => (
//               <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedIds([]); }}
//                 className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all duration-300 ${
//                   activeTab === tab.key
//                     ? "text-amber-400 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-amber-400 after:rounded-t"
//                     : "text-white/35 hover:text-white/60"
//                 }`}>
//                 {tab.label}
//                 {(tabCounts[tab.key] || 0) > 0 && (
//                   <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
//                     activeTab === tab.key ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/25"
//                   }`}>
//                     {tabCounts[tab.key]}
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 pt-5 space-y-4">

//         {/* Recherche + batch */}
//         <div className="flex flex-wrap gap-2 items-center">
//           <div className="relative flex-1 min-w-[240px]">
//             <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
//               placeholder="Titre ou producteur…"
//               className="w-full bg-white/5 border border-white/10 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/30 focus:bg-white/10 placeholder:text-white/15 transition-all duration-300" />
//           </div>
//           {selectedIds.length > 0 && (
//             <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2 text-[10px] backdrop-blur-sm">
//               <span className="text-white/35">{selectedIds.length} film(s)</span>
//               <span className="h-3 w-px bg-white/10" />
//               <button onClick={() => batchStatus("assigned")} className="text-emerald-400 hover:text-emerald-300 transition-all duration-300 font-medium">✓ Accepter</button>
//               <span className="h-3 w-px bg-white/10" />
//               <button onClick={() => batchStatus("refused")} className="text-red-400 hover:text-red-300 transition-all duration-300">✗ Refuser</button>
//               <span className="h-3 w-px bg-white/10" />
//               <button onClick={() => setSelectedIds([])} className="text-white/25 hover:text-white/50 transition-all duration-300">✕</button>
//             </div>
//           )}
//         </div>

//         {/* Liste */}
//         {filteredMovies.length === 0 ? (
//           <div className="flex flex-col items-center py-24 text-white/20 gap-4">
//             <span className="text-4xl">🎬</span>
//             <p className="text-sm">{allMovies.length === 0 ? "Aucun film soumis." : "Aucun film pour ce filtre."}</p>
//           </div>
//         ) : (
//           <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
//             <div className="grid grid-cols-[40px_70px_minmax(200px,1fr)_130px_100px_120px_1fr] gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
//               <input type="checkbox" checked={selectedIds.length === filteredMovies.length && filteredMovies.length > 0}
//                 onChange={() => setSelectedIds(selectedIds.length === filteredMovies.length ? [] : filteredMovies.map((m) => m.id_movie))}
//                 className="accent-amber-500" />
//               <span />
//               <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Film</span>
//               <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Producteur</span>
//               <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Votes</span>
//               <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Statut</span>
//               <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Actions</span>
//             </div>

//             <div className="divide-y divide-white/5">
//               {filteredMovies.map((movie) => {
//                 const status  = movie.selection_status || "submitted";
//                 const meta    = scfg(status);
//                 const summary = voteSummary[movie.id_movie];
//                 const poster  = getPoster(movie);
//                 const isSel   = selectedIds.includes(movie.id_movie);

//                 return (
//                   <div key={movie.id_movie}
//                     className={`grid grid-cols-[40px_70px_minmax(200px,1fr)_130px_100px_120px_1fr] gap-2 px-4 py-1 items-center transition-all duration-300 border-l-2 ${
//                       isSel ? "bg-amber-500/10 border-l-amber-500/50" : "border-l-transparent hover:bg-white/5"
//                     }`}>

//                     <div className="flex items-center">
//                       <input type="checkbox" checked={isSel}
//                         onChange={() => setSelectedIds((p) => p.includes(movie.id_movie) ? p.filter((x) => x !== movie.id_movie) : [...p, movie.id_movie])}
//                         className="accent-amber-500" />
//                     </div>

//                     <button type="button" onClick={() => setSelectedMovie(movie)}
//                       className="w-16 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 group cursor-pointer">
//                       {poster
//                         ? <img src={poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
//                         : <div className="w-full h-full flex items-center justify-center text-white/10 text-xl">🎬</div>}
//                     </button>

//                     <button type="button" onClick={() => setSelectedMovie(movie)} className="text-left min-w-0 py-2 flex flex-col justify-center">
//                       <p className="text-sm font-medium text-white/80 truncate hover:text-amber-300 transition-all duration-300 leading-snug">{movie.title}</p>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {(movie.Categories || []).slice(0, 2).map((c) => (
//                           <span key={c.id_categorie} className="text-[8px] text-white/25 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{c.name}</span>
//                         ))}
//                         {movie.duration && <span className="text-[8px] text-white/20 font-['JetBrains_Mono']">{movie.duration}s</span>}
//                       </div>
//                     </button>

//                     <p className="text-xs text-white/35 truncate self-center">
//                       {movie.Producer ? `${movie.Producer.first_name} ${movie.Producer.last_name}` : "—"}
//                     </p>

//                     <div className="self-center">
//                       {summary ? (
//                         <div className="space-y-1.5">
//                           <div className="flex gap-2 text-[10px] font-['JetBrains_Mono']">
//                             <span className="text-emerald-400">{summary.YES}👍</span>
//                             <span className="text-amber-400">{summary["TO DISCUSS"]}💬</span>
//                             <span className="text-red-400">{summary.NO}👎</span>
//                           </div>
//                           {summary.total > 0 && (
//                             <div className="h-1 rounded-full flex overflow-hidden bg-white/10 w-20">
//                               <div className="bg-emerald-500 h-full transition-all duration-300" style={{width:`${(summary.YES/summary.total)*100}%`}} />
//                               <div className="bg-amber-500 h-full transition-all duration-300"  style={{width:`${(summary["TO DISCUSS"]/summary.total)*100}%`}} />
//                               <div className="bg-red-500 h-full transition-all duration-300"    style={{width:`${(summary.NO/summary.total)*100}%`}} />
//                             </div>
//                           )}
//                         </div>
//                       ) : <span className="text-white/15 font-['JetBrains_Mono'] text-[10px]">—</span>}
//                     </div>

//                     <div>
//                       <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1.5 rounded-lg font-medium ${meta.badge}`}>
//                         <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
//                         {meta.label}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-1 flex-wrap self-center py-2">
//                       {status === "submitted" && (
//                         <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "assigned" })}
//                           className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20">✓ Accepter</button>
//                       )}
//                       {status === "assigned" && summary?.total > 0 && (
//                         <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "to_discuss" })}
//                           className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/20">Phase 2 →</button>
//                       )}
//                       {status === "to_discuss" && (
//                         <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "selected" })}
//                           className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/20">★ Sélect.</button>
//                       )}
//                       {(status === "selected" || status === "candidate") && (
//                         <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "finalist" })}
//                           className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20">⭐ Final.</button>
//                       )}
//                       {status === "finalist" && (
//                         <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "awarded" })}
//                           className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30">🏆</button>
//                       )}
//                       {status === "refused" && (
//                         <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "submitted" })}
//                           className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-white/10 hover:bg-white/20 text-white/60 border border-white/10">↺</button>
//                       )}
//                       {status !== "refused" && status !== "awarded" && (
//                         <button type="button"
//                           onClick={() => window.confirm(`Refuser "${movie.title}" ?`) && statusM.mutate({ id: movie.id_movie, status: "refused" })}
//                           className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20">✕</button>
//                       )}
//                       <button type="button" onClick={() => setSelectedMovie(movie)}
//                         className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-white/5 hover:bg-white/10 text-white/40 border border-white/10">
//                         ···
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* MODAL */}
//       {selectedMovie && (
//         <FilmModal
//           movie={selectedMovie}
//           summary={voteSummary[selectedMovie.id_movie]}
//           categories={categories}
//           catSel={catSel} setCatSel={setCatSel}
//           adminComment={adminComment} setAdminComment={setAdminComment}
//           notice={modalNotice}
//           onClose={() => setSelectedMovie(null)}
//           onStatus={(id, s) => statusM.mutate({ id, status: s })}
//           onForceStatus={(id, s) => statusM.mutate({ id, status: s, force: true })}
//           onComment={(id) => commentM.mutate({ id, c: adminComment })}
//           onCategories={(id) => catM.mutate({ id, cats: catSel[id] || [] })}
//           onDelete={(id) => { if (window.confirm("Supprimer définitivement ? Action irréversible.")) deleteM.mutate(id); }}
//         />
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════
//    MODAL
// ══════════════════════════════════════════════════════ */
// function FilmModal({ movie, summary, categories, catSel, setCatSel,
//   adminComment, setAdminComment, notice, onClose, onStatus, onForceStatus, onComment, onCategories, onDelete }) {

//   const status   = movie.selection_status || "submitted";
//   const meta     = scfg(status);
//   const trailer  = getTrailer(movie);
//   const poster   = getPoster(movie);
//   const juries   = movie.Juries || [];
//   const hasVotes = (summary?.total || 0) > 0;
//   const { primary, danger, info } = contextualActions(status, hasVotes, juries.length);
//   const pIdx     = PIPELINE_ORDER.indexOf(status);
//   const [manual,  setManual]  = useState(false);
//   const [fsVideo, setFsVideo] = useState(false);
//   const currentCats = catSel[movie.id_movie] || [];

//   return (
//     <>
//     {/* Fullscreen video overlay */}
//     {fsVideo && (
//       <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xl flex items-center justify-center"
//            onClick={() => setFsVideo(false)}>
//         <button className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl z-10 transition-all duration-300" onClick={() => setFsVideo(false)}>✕</button>
//         {trailer
//           ? <div className="w-full max-w-5xl px-2" onClick={(e) => e.stopPropagation()}>
//               <VideoPreview title={movie.title} src={`${UPLOAD_BASE}/${trailer}`} poster={poster || undefined} />
//             </div>
//           : <a href={movie.youtube_link} target="_blank" rel="noreferrer" className="text-amber-400 text-lg underline hover:text-amber-300 transition-all duration-300">
//               Ouvrir sur YouTube ↗
//             </a>
//         }
//       </div>
//     )}

//     <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
//       <div className="min-h-full flex items-start justify-center p-4 py-6">
//         <div className="bg-gradient-to-b from-[#1a1c20]/60 to-[#0f1114]/60 border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl shadow-black/70 overflow-hidden backdrop-blur-sm">

//           {/* ── Header bar ── */}
//           <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/10 bg-white/5">
//             <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-lg font-medium flex-shrink-0 ${meta.badge}`}>
//               <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
//             </span>
//             <h2 className="text-sm font-semibold text-white flex-1 truncate">{movie.title}</h2>
//             {(movie.Awards || []).length > 0 && (
//               <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-lg border border-yellow-500/30 font-medium flex-shrink-0">
//                 🏆 {movie.Awards.length} prix
//               </span>
//             )}
//             {/* Pipeline */}
//             {status !== "refused" && (
//               <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto flex-shrink-0 scrollbar-thin-dark">
//                 {PIPELINE.map((step, i) => {
//                   const cur  = step.key === status || (step.key === "selected" && status === "candidate");
//                   const past = !cur && pIdx > i;
//                   return (
//                     <div key={step.key} className="flex items-center gap-0.5 flex-shrink-0">
//                       {i > 0 && <div className={`w-3 h-px ${past || cur ? "bg-amber-500/40" : "bg-white/10"}`} />}
//                       <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${
//                         cur  ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" :
//                         past ? "text-white/35" : "text-white/15"
//                       }`}>{step.short}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//             <button onClick={onClose}
//               className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/10 border border-white/10 text-white/40 hover:bg-red-500/20 hover:text-white transition-all duration-300 text-xs">
//               ✕
//             </button>
//           </div>

//           {/* ── Notice ── */}
//           {notice && (
//             <div className={`mx-5 mt-3 px-4 py-2 rounded-xl text-xs border flex items-center gap-2 backdrop-blur-sm ${
//               notice.startsWith("❌")
//                 ? "bg-red-500/20 border-red-500/30 text-red-300"
//                 : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
//             }`}>{notice}</div>
//           )}

//           {/* ── Body: 3 columns ── */}
//           <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] divide-y lg:divide-y-0 lg:divide-x divide-white/10 min-h-0">

//             {/* ── COL 1: Visual + checks ── */}
//             <div className="p-4 flex flex-col gap-4">

//               <div>
//                 <div
//                   className="relative group w-full aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
//                   onClick={() => (trailer || movie.youtube_link) && setFsVideo(true)}
//                 >
//                   {poster
//                     ? <img src={poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
//                     : <div className="w-full h-full flex items-center justify-center text-white/10 text-3xl">🎬</div>}
//                   {(trailer || movie.youtube_link) && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                       <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
//                         <span className="text-black text-sm ml-0.5">▶</span>
//                       </div>
//                       <span className="absolute bottom-2 right-2 text-[9px] text-white/60 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
//                         Plein écran
//                       </span>
//                     </div>
//                   )}
//                   {!trailer && !movie.youtube_link && (
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <span className="text-[9px] text-white/15">Aucun fichier</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
//                   {trailer && (
//                     <a href={`${UPLOAD_BASE}/${trailer}`} target="_blank" rel="noreferrer"
//                       className="text-[10px] text-amber-400/50 hover:text-amber-300 transition-all duration-300">↓ Film</a>
//                   )}
//                   {movie.subtitle && (
//                     <a href={`${UPLOAD_BASE}/${movie.subtitle}`} target="_blank" rel="noreferrer" download
//                       className="text-[10px] text-amber-400/50 hover:text-amber-300 transition-all duration-300">📄 Sous-titres</a>
//                   )}
//                   {movie.youtube_link && (
//                     <a href={movie.youtube_link} target="_blank" rel="noreferrer"
//                       className="text-[10px] text-red-400/50 hover:text-red-300 transition-all duration-300">▶ YouTube</a>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 {[
//                   ["Durée", movie.duration ? `${movie.duration}s` : "—"],
//                   ["Langue", movie.main_language || "—"],
//                   ["Nationalité", movie.nationality || "—"],
//                   ["Outil IA", movie.ai_tool || "—"],
//                 ].map(([lbl, val]) => (
//                   <div key={lbl}>
//                     <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-0.5">{lbl}</p>
//                     <p className="text-white/55 text-[11px] truncate">{val}</p>
//                   </div>
//                 ))}
//               </div>

//               <CheckStrip movie={movie} />

//             </div>

//             {/* ── COL 2: Info + synopsis + votes ── */}
//             <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5 scrollbar-thin-dark">

//               <div>
//                 <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-3">Informations</p>
//                 <div className="grid grid-cols-2 gap-x-5 gap-y-3">
//                   {[
//                     ["Producteur",    movie.Producer ? `${movie.Producer.first_name} ${movie.Producer.last_name}` : "—"],
//                     ["E-mail",        movie.Producer?.email || "—"],
//                     ["Classif. IA",   movie.production || "—"],
//                     ["Méthodo IA",   movie.workshop || "—"],
//                     ["Connu via",     movie.Producer?.known_by_mars_ai || "—"],
//                   ].map(([lbl, val]) => (
//                     <div key={lbl} className="min-w-0">
//                       <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-0.5">{lbl}</p>
//                       <p className="text-white/60 text-xs truncate">{val}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Synopsis</p>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="bg-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
//                     <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-1.5">Français</p>
//                     <p className="text-xs text-white/45 leading-relaxed line-clamp-5">{movie.synopsis || movie.description || "—"}</p>
//                   </div>
//                   <div className="bg-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
//                     <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-1.5">English</p>
//                     <p className="text-xs text-white/45 leading-relaxed line-clamp-5">{movie.synopsis_anglais || "—"}</p>
//                   </div>
//                 </div>
//               </div>

//               {(summary?.votes?.length || 0) > 0 && (
//                 <div>
//                   <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Votes Phase 1 — {summary.total} réponse{summary.total > 1 ? "s" : ""}</p>

//                   <div className="flex items-center gap-3 mb-3">
//                     {[["Validé","YES","text-emerald-400","bg-emerald-500/10 border-emerald-500/20"],
//                       ["À discuter","TO DISCUSS","text-amber-400","bg-amber-500/10 border-amber-500/20"],
//                       ["Refusé","NO","text-red-400","bg-red-500/10 border-red-500/20"]].map(([lbl,k,col,bg]) => (
//                       <div key={k} className={`${bg} border rounded-xl px-3 py-2 text-center min-w-[58px]`}>
//                         <p className={`text-xl font-bold font-['JetBrains_Mono'] leading-none ${col}`}>{summary[k]}</p>
//                         <p className="text-[8px] text-white/25 mt-1">{lbl}</p>
//                       </div>
//                     ))}
//                     {summary.total > 0 && (
//                       <div className="flex-1 h-2 rounded-full flex overflow-hidden bg-white/10">
//                         <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width:`${(summary.YES/summary.total)*100}%` }} />
//                         <div className="bg-amber-500 h-full transition-all duration-300"   style={{ width:`${(summary["TO DISCUSS"]/summary.total)*100}%` }} />
//                         <div className="bg-red-500 h-full transition-all duration-300"     style={{ width:`${(summary.NO/summary.total)*100}%` }} />
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin-dark">
//                     {summary.votes.map((v) => (
//                       <div key={v.id_vote} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-300">
//                         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/50 to-pink-500/50 flex items-center justify-center text-[7px] font-bold flex-shrink-0 text-white/60">
//                           {v.User ? `${v.User.first_name?.[0]}${v.User.last_name?.[0]}` : "?"}
//                         </div>
//                         <span className="text-white/40 flex-1 truncate text-[11px]">
//                           {v.User ? `${v.User.first_name} ${v.User.last_name}` : `Jury #${v.id_user}`}
//                         </span>
//                         <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
//                           v.note === "YES" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" :
//                           v.note === "NO"  ? "bg-red-500/20 text-red-300 border-red-500/20" :
//                           "bg-amber-500/20 text-amber-300 border-amber-500/20"
//                         }`}>{v.note}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//             </div>

//             {/* ── COL 3: Actions sidebar ── */}
//             <div className="flex flex-col divide-y divide-white/10 overflow-y-auto max-h-[80vh] scrollbar-thin-dark">

//               {/* Actions */}
//               <div className="p-4">
//                 <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-3">Actions</p>
//                 {info && (
//                   <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/55 leading-relaxed backdrop-blur-sm">
//                     {info}
//                   </div>
//                 )}
//                 {primary.length > 0 && (
//                   <div className="space-y-1.5 mb-2">
//                     {primary.map((a) => (
//                       <button key={a.to} type="button"
//                         disabled={a.cls.includes("cursor-not-allowed")}
//                         onClick={() => !a.cls.includes("cursor-not-allowed") && onStatus(movie.id_movie, a.to)}
//                         className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all duration-300 ${a.cls}`}>
//                         {a.label}
//                         {a.tip && <p className="text-[9px] font-normal opacity-55 mt-0.5">{a.tip}</p>}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//                 {danger.length > 0 && (
//                   <div className={`space-y-1.5 ${primary.length > 0 ? "pt-2 border-t border-white/10" : ""}`}>
//                     {danger.map((a) => (
//                       <button key={a.to} type="button" onClick={() => onStatus(movie.id_movie, a.to)}
//                         className={`w-full px-3 py-2.5 rounded-xl text-xs text-left transition-all duration-300 ${a.cls}`}>
//                         {a.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//                 {primary.length === 0 && danger.length === 0 && !info && (
//                   <p className="text-xs text-white/20 italic">Aucune action disponible.</p>
//                 )}
//               </div>

//               {/* Jurys */}
//               <div className="p-4">
//                 <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Jurys assignés</p>
//                 {juries.length === 0
//                   ? <p className="text-xs text-white/25 italic">Aucun jury assigné.</p>
//                   : <div className="space-y-2 mb-2">
//                       {juries.map((j) => (
//                         <div key={j.id_user} className="flex items-center gap-2">
//                           <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[8px] font-bold flex-shrink-0 ring-1 ring-white/20">
//                             {j.first_name?.[0]}{j.last_name?.[0]}
//                           </div>
//                           <span className="text-white/50 text-xs">{j.first_name} {j.last_name}</span>
//                         </div>
//                       ))}
//                     </div>
//                 }
//                 <p className="text-[9px] text-white/20 italic font-['JetBrains_Mono']">
//                   Gérer dans <span className="text-amber-400/45">Distribution &amp; Jury</span>.
//                 </p>
//               </div>

//               {/* Catégories */}
//               <div className="p-4">
//                 <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Catégories</p>
//                 <div className="flex flex-wrap gap-1.5 mb-2.5">
//                   {categories.map((c) => (
//                     <button key={c.id_categorie} type="button"
//                       onClick={() => {
//                         const curr = catSel[movie.id_movie] || [];
//                         const next = curr.includes(c.id_categorie) ? curr.filter((x) => x !== c.id_categorie) : [...curr, c.id_categorie];
//                         setCatSel((p) => ({ ...p, [movie.id_movie]: next }));
//                       }}
//                       className={`text-[10px] px-2 py-1 rounded-lg border transition-all duration-300 ${
//                         currentCats.includes(c.id_categorie)
//                           ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
//                           : "bg-white/5 border-white/10 text-white/35 hover:bg-white/10 hover:text-white/65"
//                       }`}>
//                       {c.name}
//                     </button>
//                   ))}
//                 </div>
//                 <button type="button" onClick={() => onCategories(movie.id_movie)}
//                   className="w-full px-3 py-2 bg-blue-500/20 border border-blue-700/20 text-white/45 text-xs rounded-xl hover:bg-blue-700/20 hover:text-white/70 transition-all duration-300 font-medium cursor-pointer">
//                   Enregistrer
//                 </button>
//               </div>

//               {/* Note interne */}
//               <div className="p-4">
//                 <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Note interne</p>
//                 <textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
//                   rows={3} placeholder="Note confidentielle…"
//                   className="w-full bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/30 focus:bg-white/10 resize-none mb-2 placeholder:text-white/15 transition-all duration-300" />
//                 <button type="button" onClick={() => onComment(movie.id_movie)}
//                   className="w-full px-3 py-2 bg-blue-500/20 border border-blue-700/20 text-white/45 text-xs rounded-xl hover:bg-blue-700/20 hover:text-white/70 transition-all duration-300 font-medium cursor-pointer">
//                   Enregistrer
//                 </button>
//               </div>

//               {/* Forcer un statut */}
//               {/* FIX B-07 : les boutons de ce panneau appellent onForceStatus au lieu de onStatus.
//                   onForceStatus passe { force_transition: true } au backend via l'API,
//                   ce qui bypass la transitionMap et autorise n'importe quelle transition. */}
//               <div className="p-4">
//                 <button onClick={() => setManual((p) => !p)}
//                   className="w-full flex items-center justify-between text-[11px] text-white/30 hover:text-white/50 transition-all duration-300">
//                   <span>Forcer un statut</span>
//                   <span className={`transition-transform duration-300 ${manual ? "rotate-180" : ""}`}>▾</span>
//                 </button>
//                 {manual && (
//                   <div className="mt-3 grid grid-cols-2 gap-1.5 pt-3 border-t border-white/10">
//                     {Object.entries(S).filter(([s]) => s !== status).map(([s, m]) => (
//                       <button key={s} type="button" onClick={() => onForceStatus(movie.id_movie, s)}
//                         className="flex items-center gap-1.5 px-2 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] rounded-xl hover:bg-white/10 hover:text-white/65 hover:border-white/20 transition-all duration-300">
//                         <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
//                         {m.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Delete */}
//               <div className="p-4 mt-auto">
//                 <button type="button" onClick={() => onDelete(movie.id_movie)}
//                   className="w-full px-3 py-2 text-[11px] text-red-300/90 border bg-red-500/10 border-red-900/20 rounded-xl hover:bg-red-500/20 hover:text-red-400/90 hover:border-red-500/30 transition-all duration-300">
//                   🗑 Supprimer définitivement
//                 </button>
//               </div>

//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//     </>
//   );
// }

// /* ── Vérifications ────────────────────────────────── */
// function CheckStrip({ movie }) {
//   const trailer = getTrailer(movie);
//   const checks = [
//     { label: "Durée ≤ 120s",      ok: !movie.duration || movie.duration <= 120, note: movie.duration ? `${movie.duration}s` : "non renseignée" },
//     { label: "Titre",             ok: Boolean(movie.title?.trim())                                                    },
//     { label: "Synopsis",          ok: Boolean((movie.synopsis || movie.description)?.trim())                          },
//     { label: "Fichier vidéo",     ok: Boolean(trailer || movie.youtube_link), note: "absent"                          },
//     { label: "Classif. IA",       ok: Boolean(movie.production?.trim()), note: "non renseignée"                       },
//   ];
//   const passed = checks.filter((c) => c.ok).length;
//   const allOk  = passed === checks.length;
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-2">
//         <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold">Vérifications</p>
//         <span className={`text-[9px] font-['JetBrains_Mono'] ${allOk ? "text-emerald-400" : "text-amber-400"}`}>{passed}/{checks.length}</span>
//       </div>
//       <div className="flex flex-col gap-1">
//         {checks.map((c) => (
//           <div key={c.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] ${
//             c.ok ? "text-emerald-400/80" : "text-red-400/80"
//           }`}>
//             <span className="font-['JetBrains_Mono'] text-[9px] w-3 flex-shrink-0">{c.ok ? "✓" : "✗"}</span>
//             <span className="flex-1">{c.label}</span>
//             {!c.ok && c.note && <span className="text-[9px] opacity-40">({c.note})</span>}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


/**
 * Videos.jsx — Gestion des films (Admin)
 *
 * Pipeline strict :
 *   submitted  → admin vérifie → Accepter (→ assigned) | Refuser
 *   assigned   → jury vote Phase 1 → Ouvrir Phase 2 (→ to_discuss) | Refuser
 *   to_discuss → jury vote Phase 2 → Promouvoir (→ selected) | Finaliste | Refuser
 *   selected   → Finaliste | Primer (→ awarded) | Refuser
 *   finalist   → Primer (→ awarded) | Refuser
 *   awarded    → Retirer du palmarès (→ finalist)
 *   refused    → Remettre en attente (→ submitted)
 *
 * FIXES :
 *   B-07 — Le panneau "Forcer un statut" passe désormais force_transition:true au backend.
 *   B-08 — Confirmation visuelle affichée après la suppression définitive d'un film.
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories, getVideos, deleteMovie,
  updateMovie, updateMovieCategories, updateMovieStatus
} from "../../api/videos.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function getFestivalPhase() {
  const r = await fetch(`${API}/festival/phase`);
  return r.json();
}
async function setFestivalPhase(phase) {
  const token = localStorage.getItem("token");
  const r = await fetch(`${API}/festival/phase`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ phase })
  });
  return r.json();
}
import { getVotes } from "../../api/votes.js";
import { VideoPreview } from "../../components/VideoPreview.jsx";
import { UPLOAD_BASE } from "../../utils/constants.js";
import { getPoster, getTrailer } from "../../utils/movieUtils.js";

/* ─── Statuts ─────────────────────────────────────────── */
const S = {
  submitted:  { label: "Soumis",       dot: "bg-zinc-400",    badge: "bg-zinc-800 text-zinc-300"          },
  assigned:   { label: "Phase 1",      dot: "bg-sky-500",     badge: "bg-sky-950 text-sky-300"            },
  to_discuss: { label: "Phase 2",      dot: "bg-amber-400",   badge: "bg-amber-950 text-amber-300"        },
  candidate:  { label: "Candidat",     dot: "bg-violet-400",  badge: "bg-violet-950 text-violet-300"      },
  selected:   { label: "Sélectionné",  dot: "bg-emerald-400", badge: "bg-emerald-950 text-emerald-300"    },
  finalist:   { label: "Finaliste",    dot: "bg-orange-400",  badge: "bg-orange-950 text-orange-300"      },
  refused:    { label: "Refusé",       dot: "bg-red-500",     badge: "bg-red-950 text-red-400"            },
  awarded:    { label: "Primé 🏆",     dot: "bg-yellow-400",  badge: "bg-yellow-900 text-yellow-200"      },
};
const scfg = (s) => S[s] || S.submitted;

const TABS = [
  { key: "all",        label: "Tous"         },
  { key: "submitted",  label: "À vérifier"   },
  { key: "assigned",   label: "Phase 1"      },
  { key: "to_discuss", label: "Phase 2"      },
  { key: "selected",   label: "Sélectionnés" },
  { key: "finalist",   label: "Finalistes"   },
  { key: "refused",    label: "Refusés"      },
  { key: "awarded",    label: "Primés"       },
];

const PIPELINE = [
  { key: "submitted",  short: "Soumis"    },
  { key: "assigned",   short: "Phase 1"   },
  { key: "to_discuss", short: "Phase 2"   },
  { key: "selected",   short: "Sélection" },
  { key: "finalist",   short: "Finaliste" },
  { key: "awarded",    short: "Palmarès"  },
];
const PIPELINE_ORDER = PIPELINE.map((p) => p.key);

/* ─── Actions contextuelles par statut ───────────────── */
function contextualActions(status, hasVotes, juriesCount) {
  switch (status) {
    case "submitted":
      return {
        primary: [{
          to: "assigned", cls: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20",
          label: "✓ Accepter — lancer la Phase 1",
          tip: juriesCount === 0
            ? "⚠ Aucun jury assigné. Après acceptation, allez dans Distribution & Jury."
            : null,
        }],
        danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Refuser le film" }],
        info: "Vérifiez le film avant d'accepter. Toutes les vérifications doivent être au vert.",
      };
    case "assigned":
      return {
        primary: [{
          to: "to_discuss", cls: hasVotes
            ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/20"
            : "bg-amber-500/10 text-amber-400/40 border border-amber-500/10 cursor-not-allowed",
          label: "💬 Ouvrir la Phase 2 (délibération)",
          tip: !hasVotes ? "En attente des votes Phase 1. Au moins un jury doit avoir voté." : null,
        }],
        danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Refuser" }],
        info: hasVotes
          ? `${juriesCount} jury(s) assigné(s) — votes reçus. Vous pouvez ouvrir la Phase 2.`
          : `Phase 1 en cours — ${juriesCount} jury(s) assigné(s). En attente de votes.`,
      };
    case "to_discuss":
      return {
        primary: [
          { to: "selected", cls: "bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/20", label: "★ Promouvoir — Sélection officielle" },
          { to: "finalist",  cls: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20", label: "⭐ Passer directement en Finaliste" },
        ],
        danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Refuser" }],
        info: "Phase 2 ouverte. Attendez les votes de délibération du jury.",
      };
    case "selected":
    case "candidate":
      return {
        primary: [
          { to: "finalist", cls: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20", label: "⭐ Passer en Finaliste" },
          { to: "awarded",  cls: "bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30", label: "🏆 Primer ce film" },
        ],
        danger: [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20", label: "✗ Retirer de la sélection" }],
        info: null,
      };
    case "finalist":
      return {
        primary: [{ to: "awarded", cls: "bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30", label: "🏆 Ajouter au palmarès" }],
        danger:  [{ to: "refused", cls: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20",  label: "✗ Retirer" }],
        info: null,
      };
    case "awarded":
      return {
        primary: [],
        danger:  [{ to: "finalist", cls: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20", label: "↩ Retirer du palmarès" }],
        info: "🏆 Ce film fait partie du palmarès.",
      };
    case "refused":
      return {
        primary: [{ to: "submitted", cls: "bg-white/10 hover:bg-white/20 text-white/60 border border-white/10", label: "↺ Remettre en attente" }],
        danger:  [],
        info: null,
      };
    default:
      return { primary: [], danger: [], info: null };
  }
}

/* ════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════════════ */
export default function Videos() {
  const qc = useQueryClient();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["listVideos"], queryFn: getVideos, refetchInterval: 30_000,
  });
  const { data: catsData }  = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: votesData } = useQuery({ queryKey: ["votes"],      queryFn: getVotes });

  const allMovies  = data?.data     || [];
  const categories = catsData?.data || [];
  const votes      = votesData?.data || [];

  const voteSummary = useMemo(() => votes.reduce((acc, v) => {
    if (!acc[v.id_movie]) acc[v.id_movie] = { YES: 0, NO: 0, "TO DISCUSS": 0, total: 0, votes: [] };
    const s = acc[v.id_movie];
    if (["YES","NO","TO DISCUSS"].includes(v.note)) s[v.note]++;
    s.total++;
    s.votes.push(v);
    return acc;
  }, {}), [votes]);

  const [activeTab,     setActiveTab]     = useState("all");
  const [search,        setSearch]        = useState("");
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [adminComment,  setAdminComment]  = useState("");
  const [modalNotice,   setModalNotice]   = useState(null);
  const [phase2Active,  setPhase2Active]  = useState(false);
  const [phase3Active,  setPhase3Active]  = useState(false);
  const [phaseLoading,  setPhaseLoading]  = useState(false);
  const [catSel,        setCatSel]        = useState({});

  useEffect(() => {
    if (!allMovies.length) return;
    const c = {};
    allMovies.forEach((m) => { c[m.id_movie] = (m.Categories || []).map((x) => x.id_categorie); });
    setCatSel(c);
  }, [data]);

  useEffect(() => {
    if (!selectedMovie) { setModalNotice(null); return; }
    setAdminComment(selectedMovie.admin_comment || "");
    setModalNotice(null);
  }, [selectedMovie]);

  useEffect(() => {
    if (!modalNotice) return;
    const t = setTimeout(() => setModalNotice(null), 4500);
    return () => clearTimeout(t);
  }, [modalNotice]);

  useEffect(() => {
    getFestivalPhase().then((d) => {
      setPhase2Active(d.phase === 2);
      setPhase3Active(d.phase === 3);
    }).catch(() => {});
  }, []);

  async function handlePhase2Toggle() {
    setPhaseLoading(true);
    try {
      const next = phase2Active ? 0 : 2;        // toggle phase 2 ON/OFF
      await setFestivalPhase(next);
      setPhase2Active(!phase2Active);
      if (!phase2Active) setPhase3Active(false); // activer 2 désactive 3
    } catch { /* ignore */ }
    setPhaseLoading(false);
  }

  async function handlePhase3Toggle() {
    setPhaseLoading(true);
    try {
      const next = phase3Active ? 0 : 3;        // toggle phase 3 ON/OFF
      await setFestivalPhase(next);
      setPhase3Active(!phase3Active);
      if (!phase3Active) setPhase2Active(false); // activer 3 désactive 2
    } catch { /* ignore */ }
    setPhaseLoading(false);
  }

  const filteredMovies = useMemo(() => allMovies.filter((m) => {
    const s = m.selection_status || "submitted";
    if (activeTab !== "all") {
      const norm = (activeTab === "selected" && ["selected","candidate"].includes(s)) ? true : s === activeTab;
      if (!norm) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const pr = `${m.Producer?.first_name||""} ${m.Producer?.last_name||""}`.toLowerCase();
      return m.title?.toLowerCase().includes(q) || pr.includes(q);
    }
    return true;
  }), [allMovies, activeTab, search]);

  const tabCounts = useMemo(() => {
    const c = { all: allMovies.length };
    TABS.slice(1).forEach((t) => {
      c[t.key] = t.key === "selected"
        ? allMovies.filter((m) => ["selected","candidate"].includes(m.selection_status||"submitted")).length
        : allMovies.filter((m) => (m.selection_status||"submitted") === t.key).length;
    });
    return c;
  }, [allMovies]);

  function inv() { qc.invalidateQueries({ queryKey: ["listVideos"] }); qc.invalidateQueries({ queryKey: ["votes"] }); }
  const NOTE = { assigned:"✓ Film accepté — Phase 1 lancée.", refused:"Film refusé.", to_discuss:"Phase 2 ouverte.", selected:"Film promu.", finalist:"Film finaliste.", awarded:"🏆 Film primé !", submitted:"Film remis en attente.", candidate:"Statut mis à jour." };

  const statusM = useMutation({
    mutationFn: ({ id, status, force }) => updateMovieStatus(id, status, force ? { force_transition: true } : {}),
    onSuccess: (_,v) => { inv(); setModalNotice(NOTE[v.status] || "Statut mis à jour."); },
    onError: () => setModalNotice("❌ Erreur lors de la mise à jour."),
  });
  const commentM  = useMutation({ mutationFn: ({ id, c }) => updateMovie(id, { admin_comment: c }), onSuccess: () => { inv(); setModalNotice("✓ Note enregistrée."); }, onError: () => setModalNotice("❌ Erreur lors de la sauvegarde de la note.") });
  const catM      = useMutation({ mutationFn: ({ id, cats }) => updateMovieCategories(id, cats),   onSuccess: () => { inv(); setModalNotice("Catégories mises à jour."); } });

  // FIX B-08: onSuccess affiche une notice de confirmation AVANT de fermer la modale.
  // L'utilisateur voit "✓ Film supprimé." pendant 1.5 s puis la modale se ferme.
  const deleteM = useMutation({
    mutationFn: (id) => deleteMovie(id),
    onSuccess: () => {
      inv();
      setModalNotice("✓ Film supprimé définitivement.");
      setTimeout(() => setSelectedMovie(null), 1500);
    },
    onError: () => setModalNotice("❌ Erreur lors de la suppression."),
  });

  async function batchStatus(s) {
    if (!selectedIds.length) return;
    await Promise.all(selectedIds.map((id) => updateMovieStatus(id, s)));
    inv(); setSelectedIds([]);
  }

  async function batchDelete() {
    if (!selectedIds.length) return;
    if (!window.confirm(`Supprimer définitivement ${selectedIds.length} film(s) ? Action irréversible.`)) return;
    await Promise.all(selectedIds.map((id) => deleteMovie(id)));
    inv();
    setSelectedIds([]);
    setSelectedMovie(null);
  }

  if (isPending) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-7 h-7 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Chargement</p>
    </div>
  );

  if (isError) return (
    <div className="m-6 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 backdrop-blur-sm">
      <span>!</span>
      <span>Erreur : {error?.message}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06080d] text-white pb-20">

      {/* ── Header sticky ── */}
      <div className="sticky top-0 z-20 bg-[#06080d]/97 backdrop-blur-xl border-b border-white/5 px-6 py-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="text-[9px] tracking-[0.18em] uppercase text-blue-400/50 mb-1 font-medium">Administration</p>
              <h1 className="text-[22px] font-semibold tracking-tight text-white">Gestion des films</h1>
              <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">
                {allMovies.length} film{allMovies.length !== 1 ? "s" : ""} enregistres
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key:"submitted",  col:"text-zinc-300",   bg:"bg-zinc-500/10"   },
                { key:"assigned",   col:"text-sky-300",    bg:"bg-sky-500/10"    },
                { key:"to_discuss", col:"text-amber-300",  bg:"bg-amber-500/10"  },
                { key:"selected",   col:"text-violet-300", bg:"bg-violet-500/10" },
                { key:"finalist",   col:"text-orange-300", bg:"bg-orange-500/10" },
                { key:"awarded",    col:"text-yellow-300", bg:"bg-yellow-500/10" },
              ].map((s) => (
                <div key={s.key} className={`flex flex-col items-center min-w-[52px] px-3 py-2 rounded-xl ${s.bg} border border-white/10`}>
                  <span className={`font-['JetBrains_Mono'] text-lg font-semibold leading-none ${s.col}`}>{tabCounts[s.key] || 0}</span>
                  <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">{scfg(s.key).label}</span>
                </div>
              ))}
            </div>
            {/* ── Boutons phase publique ── */}
            <div className="flex items-center gap-2 self-end pb-1">
              {/* Phase 2 — Candidats */}
              <button
                type="button"
                onClick={handlePhase2Toggle}
                disabled={phaseLoading}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium border transition-all duration-300 disabled:opacity-50 ${
                  phase2Active
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
                }`}
                title={phase2Active ? "Masquer les candidats du public" : "Publier les candidats (phase 2) sur le site public"}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${phase2Active ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                {phase2Active ? "● Candidats publiés" : "Publier Candidats"}
              </button>

              {/* Phase 3 — Primés */}
              <button
                type="button"
                onClick={handlePhase3Toggle}
                disabled={phaseLoading}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium border transition-all duration-300 disabled:opacity-50 ${
                  phase3Active
                    ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
                }`}
                title={phase3Active ? "Masquer le palmarès du public" : "Publier le palmarès (primés) sur le site public"}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${phase3Active ? "bg-yellow-400 animate-pulse" : "bg-white/20"}`} />
                {phase3Active ? "🏆 Palmarès publié" : "Publier Palmarès"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-t border-white/5">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedIds([]); }}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? "text-amber-400 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-amber-400 after:rounded-t"
                    : "text-white/35 hover:text-white/60"
                }`}>
                {tab.label}
                {(tabCounts[tab.key] || 0) > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    activeTab === tab.key ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/25"
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-5 space-y-4">

        {/* Recherche + batch */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Titre ou producteur…"
              className="w-full bg-white/5 border border-white/10 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/30 focus:bg-white/10 placeholder:text-white/15 transition-all duration-300" />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2 text-[10px] backdrop-blur-sm">
              <span className="text-white/35">{selectedIds.length} film(s)</span>
              <span className="h-3 w-px bg-white/10" />
              <button onClick={() => batchStatus("assigned")} className="text-emerald-400 hover:text-emerald-300 transition-all duration-300 font-medium">✓ Accepter</button>
              <span className="h-3 w-px bg-white/10" />
              <button onClick={() => batchStatus("refused")} className="text-red-400 hover:text-red-300 transition-all duration-300">✗ Refuser</button>
              <span className="h-3 w-px bg-white/10" />
              <button onClick={batchDelete} className="text-red-300/70 hover:text-red-300 transition-all duration-300">🗑 Supprimer</button>
              <span className="h-3 w-px bg-white/10" />
              <button onClick={() => setSelectedIds([])} className="text-white/25 hover:text-white/50 transition-all duration-300">✕</button>
            </div>
          )}
        </div>

        {/* Liste */}
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-white/20 gap-4">
            <span className="text-4xl">🎬</span>
            <p className="text-sm">{allMovies.length === 0 ? "Aucun film soumis." : "Aucun film pour ce filtre."}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-[40px_70px_minmax(200px,1fr)_130px_100px_120px_1fr] gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <input type="checkbox" checked={selectedIds.length === filteredMovies.length && filteredMovies.length > 0}
                onChange={() => setSelectedIds(selectedIds.length === filteredMovies.length ? [] : filteredMovies.map((m) => m.id_movie))}
                className="accent-amber-500" />
              <span />
              <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Film</span>
              <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Producteur</span>
              <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Votes</span>
              <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Statut</span>
              <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium">Actions</span>
            </div>

            <div className="divide-y divide-white/5">
              {filteredMovies.map((movie) => {
                const status  = movie.selection_status || "submitted";
                const meta    = scfg(status);
                const summary = voteSummary[movie.id_movie];
                const poster  = getPoster(movie);
                const isSel   = selectedIds.includes(movie.id_movie);

                return (
                  <div key={movie.id_movie}
                    className={`grid grid-cols-[40px_70px_minmax(200px,1fr)_130px_100px_120px_1fr] gap-2 px-4 py-1 items-center transition-all duration-300 border-l-2 ${
                      isSel ? "bg-amber-500/10 border-l-amber-500/50" : "border-l-transparent hover:bg-white/5"
                    }`}>

                    <div className="flex items-center">
                      <input type="checkbox" checked={isSel}
                        onChange={() => setSelectedIds((p) => p.includes(movie.id_movie) ? p.filter((x) => x !== movie.id_movie) : [...p, movie.id_movie])}
                        className="accent-amber-500" />
                    </div>

                    <button type="button" onClick={() => setSelectedMovie(movie)}
                      className="w-16 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 group cursor-pointer">
                      {poster
                        ? <img src={poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        : <div className="w-full h-full flex items-center justify-center text-white/10 text-xl">🎬</div>}
                    </button>

                    <button type="button" onClick={() => setSelectedMovie(movie)} className="text-left min-w-0 py-2 flex flex-col justify-center">
                      <p className="text-sm font-medium text-white/80 truncate hover:text-amber-300 transition-all duration-300 leading-snug">{movie.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(movie.Categories || []).slice(0, 2).map((c) => (
                          <span key={c.id_categorie} className="text-[8px] text-white/25 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{c.name}</span>
                        ))}
                        {movie.duration && <span className="text-[8px] text-white/20 font-['JetBrains_Mono']">{movie.duration}s</span>}
                      </div>
                    </button>

                    <p className="text-xs text-white/35 truncate self-center">
                      {movie.Producer ? `${movie.Producer.first_name} ${movie.Producer.last_name}` : "—"}
                    </p>

                    <div className="self-center">
                      {summary ? (
                        <div className="space-y-1.5">
                          <div className="flex gap-2 text-[10px] font-['JetBrains_Mono']">
                            <span className="text-emerald-400">{summary.YES}👍</span>
                            <span className="text-amber-400">{summary["TO DISCUSS"]}💬</span>
                            <span className="text-red-400">{summary.NO}👎</span>
                          </div>
                          {summary.total > 0 && (
                            <div className="h-1 rounded-full flex overflow-hidden bg-white/10 w-20">
                              <div className="bg-emerald-500 h-full transition-all duration-300" style={{width:`${(summary.YES/summary.total)*100}%`}} />
                              <div className="bg-amber-500 h-full transition-all duration-300"  style={{width:`${(summary["TO DISCUSS"]/summary.total)*100}%`}} />
                              <div className="bg-red-500 h-full transition-all duration-300"    style={{width:`${(summary.NO/summary.total)*100}%`}} />
                            </div>
                          )}
                        </div>
                      ) : <span className="text-white/15 font-['JetBrains_Mono'] text-[10px]">—</span>}
                    </div>

                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1.5 rounded-lg font-medium ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap self-center py-2">
                      {status === "submitted" && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "assigned" })}
                          className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20">✓ Accepter</button>
                      )}
                      {status === "assigned" && summary?.total > 0 && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "to_discuss" })}
                          className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/20">Phase 2 →</button>
                      )}
                      {status === "to_discuss" && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "selected" })}
                          className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/20">★ Sélect.</button>
                      )}
                      {(status === "selected" || status === "candidate") && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "finalist" })}
                          className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/20">⭐ Final.</button>
                      )}
                      {status === "finalist" && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "awarded" })}
                          className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-yellow-500/30 hover:bg-yellow-500/40 text-yellow-300 border border-yellow-500/30">🏆</button>
                      )}
                      {status === "refused" && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "submitted" })}
                          className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-white/10 hover:bg-white/20 text-white/60 border border-white/10">↺</button>
                      )}
                      {status !== "refused" && status !== "awarded" && (
                        <button type="button"
                          onClick={() => window.confirm(`Refuser "${movie.title}" ?`) && statusM.mutate({ id: movie.id_movie, status: "refused" })}
                          className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20">✕</button>
                      )}
                      <button type="button" onClick={() => setSelectedMovie(movie)}
                        className="px-2 py-1 rounded-lg text-[9px] font-medium transition-all duration-300 whitespace-nowrap bg-white/5 hover:bg-white/10 text-white/40 border border-white/10">
                        ···
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedMovie && (
        <FilmModal
          movie={selectedMovie}
          summary={voteSummary[selectedMovie.id_movie]}
          categories={categories}
          catSel={catSel} setCatSel={setCatSel}
          adminComment={adminComment} setAdminComment={setAdminComment}
          notice={modalNotice}
          onClose={() => setSelectedMovie(null)}
          onStatus={(id, s) => statusM.mutate({ id, status: s })}
          onForceStatus={(id, s) => statusM.mutate({ id, status: s, force: true })}
          onComment={(id) => commentM.mutate({ id, c: adminComment })}
          onCategories={(id) => catM.mutate({ id, cats: catSel[id] || [] })}
          onDelete={(id) => { if (window.confirm("Supprimer définitivement ? Action irréversible.")) deleteM.mutate(id); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════ */
function FilmModal({ movie, summary, categories, catSel, setCatSel,
  adminComment, setAdminComment, notice, onClose, onStatus, onForceStatus, onComment, onCategories, onDelete }) {

  const status   = movie.selection_status || "submitted";
  const meta     = scfg(status);
  const trailer  = getTrailer(movie);
  const poster   = getPoster(movie);
  const juries   = movie.Juries || [];
  const hasVotes = (summary?.total || 0) > 0;
  const { primary, danger, info } = contextualActions(status, hasVotes, juries.length);
  const pIdx     = PIPELINE_ORDER.indexOf(status);
  const [manual,  setManual]  = useState(false);
  const [fsVideo, setFsVideo] = useState(false);
  const currentCats = catSel[movie.id_movie] || [];

  return (
    <>
    {/* Fullscreen video overlay */}
    {fsVideo && (
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xl flex items-center justify-center"
           onClick={() => setFsVideo(false)}>
        <button className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl z-10 transition-all duration-300" onClick={() => setFsVideo(false)}>✕</button>
        {trailer
          ? <div className="w-full max-w-5xl px-2" onClick={(e) => e.stopPropagation()}>
              <VideoPreview title={movie.title} src={`${UPLOAD_BASE}/${trailer}`} poster={poster || undefined} />
            </div>
          : <a href={movie.youtube_link} target="_blank" rel="noreferrer" className="text-amber-400 text-lg underline hover:text-amber-300 transition-all duration-300">
              Ouvrir sur YouTube ↗
            </a>
        }
      </div>
    )}

    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-6">
        <div className="bg-gradient-to-b from-[#1a1c20]/60 to-[#0f1114]/60 border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl shadow-black/70 overflow-hidden backdrop-blur-sm">

          {/* ── Header bar ── */}
          <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/10 bg-white/5">
            <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-lg font-medium flex-shrink-0 ${meta.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
            </span>
            <h2 className="text-sm font-semibold text-white flex-1 truncate">{movie.title}</h2>
            {(movie.Awards || []).length > 0 && (
              <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-lg border border-yellow-500/30 font-medium flex-shrink-0">
                🏆 {movie.Awards.length} prix
              </span>
            )}
            {/* Pipeline */}
            {status !== "refused" && (
              <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto flex-shrink-0 scrollbar-thin-dark">
                {PIPELINE.map((step, i) => {
                  const cur  = step.key === status || (step.key === "selected" && status === "candidate");
                  const past = !cur && pIdx > i;
                  return (
                    <div key={step.key} className="flex items-center gap-0.5 flex-shrink-0">
                      {i > 0 && <div className={`w-3 h-px ${past || cur ? "bg-amber-500/40" : "bg-white/10"}`} />}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                        cur  ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" :
                        past ? "text-white/35" : "text-white/15"
                      }`}>{step.short}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={onClose}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/10 border border-white/10 text-white/40 hover:bg-red-500/20 hover:text-white transition-all duration-300 text-xs">
              ✕
            </button>
          </div>

          {/* ── Notice ── */}
          {notice && (
            <div className={`mx-5 mt-3 px-4 py-2 rounded-xl text-xs border flex items-center gap-2 backdrop-blur-sm ${
              notice.startsWith("❌")
                ? "bg-red-500/20 border-red-500/30 text-red-300"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            }`}>{notice}</div>
          )}

          {/* ── Body: 3 columns ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] divide-y lg:divide-y-0 lg:divide-x divide-white/10 min-h-0">

            {/* ── COL 1: Visual + checks ── */}
            <div className="p-4 flex flex-col gap-4">

              <div>
                <div
                  className="relative group w-full aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                  onClick={() => (trailer || movie.youtube_link) && setFsVideo(true)}
                >
                  {poster
                    ? <img src={poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center text-white/10 text-3xl">🎬</div>}
                  {(trailer || movie.youtube_link) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <span className="text-black text-sm ml-0.5">▶</span>
                      </div>
                      <span className="absolute bottom-2 right-2 text-[9px] text-white/60 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        Plein écran
                      </span>
                    </div>
                  )}
                  {!trailer && !movie.youtube_link && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] text-white/15">Aucun fichier</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {trailer && (
                    <a href={`${UPLOAD_BASE}/${trailer}`} target="_blank" rel="noreferrer"
                      className="text-[10px] text-amber-400/50 hover:text-amber-300 transition-all duration-300">↓ Film</a>
                  )}
                  {movie.subtitle && (
                    <a href={`${UPLOAD_BASE}/${movie.subtitle}`} target="_blank" rel="noreferrer" download
                      className="text-[10px] text-amber-400/50 hover:text-amber-300 transition-all duration-300">📄 Sous-titres</a>
                  )}
                  {movie.youtube_link && (
                    <a href={movie.youtube_link} target="_blank" rel="noreferrer"
                      className="text-[10px] text-red-400/50 hover:text-red-300 transition-all duration-300">▶ YouTube</a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Durée", movie.duration ? `${movie.duration}s` : "—"],
                  ["Langue", movie.main_language || "—"],
                  ["Nationalité", movie.nationality || "—"],
                  ["Outil IA", movie.ai_tool || "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-0.5">{lbl}</p>
                    <p className="text-white/55 text-[11px] truncate">{val}</p>
                  </div>
                ))}
              </div>

              <CheckStrip movie={movie} />

            </div>

            {/* ── COL 2: Info + synopsis + votes ── */}
            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5 scrollbar-thin-dark">

              <div>
                <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-3">Informations</p>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                  {[
                    ["Producteur",    movie.Producer ? `${movie.Producer.first_name} ${movie.Producer.last_name}` : "—"],
                    ["E-mail",        movie.Producer?.email || "—"],
                    ["Classif. IA",   movie.production || "—"],
                    ["Méthodo IA",   movie.workshop || "—"],
                    ["Connu via",     movie.Producer?.known_by_mars_ai || "—"],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="min-w-0">
                      <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-0.5">{lbl}</p>
                      <p className="text-white/60 text-xs truncate">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Synopsis</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-1.5">Français</p>
                    <p className="text-xs text-white/45 leading-relaxed line-clamp-5">{movie.synopsis || movie.description || "—"}</p>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mb-1.5">English</p>
                    <p className="text-xs text-white/45 leading-relaxed line-clamp-5">{movie.synopsis_anglais || "—"}</p>
                  </div>
                </div>
              </div>

              {(summary?.votes?.length || 0) > 0 && (
                <div>
                  <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Votes Phase 1 — {summary.total} réponse{summary.total > 1 ? "s" : ""}</p>

                  <div className="flex items-center gap-3 mb-3">
                    {[["Validé","YES","text-emerald-400","bg-emerald-500/10 border-emerald-500/20"],
                      ["À discuter","TO DISCUSS","text-amber-400","bg-amber-500/10 border-amber-500/20"],
                      ["Refusé","NO","text-red-400","bg-red-500/10 border-red-500/20"]].map(([lbl,k,col,bg]) => (
                      <div key={k} className={`${bg} border rounded-xl px-3 py-2 text-center min-w-[58px]`}>
                        <p className={`text-xl font-bold font-['JetBrains_Mono'] leading-none ${col}`}>{summary[k]}</p>
                        <p className="text-[8px] text-white/25 mt-1">{lbl}</p>
                      </div>
                    ))}
                    {summary.total > 0 && (
                      <div className="flex-1 h-2 rounded-full flex overflow-hidden bg-white/10">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width:`${(summary.YES/summary.total)*100}%` }} />
                        <div className="bg-amber-500 h-full transition-all duration-300"   style={{ width:`${(summary["TO DISCUSS"]/summary.total)*100}%` }} />
                        <div className="bg-red-500 h-full transition-all duration-300"     style={{ width:`${(summary.NO/summary.total)*100}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin-dark">
                    {summary.votes.map((v) => (
                      <div key={v.id_vote} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-300">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/50 to-pink-500/50 flex items-center justify-center text-[7px] font-bold flex-shrink-0 text-white/60">
                          {v.User ? `${v.User.first_name?.[0]}${v.User.last_name?.[0]}` : "?"}
                        </div>
                        <span className="text-white/40 flex-1 truncate text-[11px]">
                          {v.User ? `${v.User.first_name} ${v.User.last_name}` : `Jury #${v.id_user}`}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                          v.note === "YES" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" :
                          v.note === "NO"  ? "bg-red-500/20 text-red-300 border-red-500/20" :
                          "bg-amber-500/20 text-amber-300 border-amber-500/20"
                        }`}>{v.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── COL 3: Actions sidebar ── */}
            <div className="flex flex-col divide-y divide-white/10 overflow-y-auto max-h-[80vh] scrollbar-thin-dark">

              {/* Actions */}
              <div className="p-4">
                <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-3">Actions</p>
                {info && (
                  <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/55 leading-relaxed backdrop-blur-sm">
                    {info}
                  </div>
                )}
                {primary.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {primary.map((a) => (
                      <button key={a.to} type="button"
                        disabled={a.cls.includes("cursor-not-allowed")}
                        onClick={() => !a.cls.includes("cursor-not-allowed") && onStatus(movie.id_movie, a.to)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all duration-300 ${a.cls}`}>
                        {a.label}
                        {a.tip && <p className="text-[9px] font-normal opacity-55 mt-0.5">{a.tip}</p>}
                      </button>
                    ))}
                  </div>
                )}
                {danger.length > 0 && (
                  <div className={`space-y-1.5 ${primary.length > 0 ? "pt-2 border-t border-white/10" : ""}`}>
                    {danger.map((a) => (
                      <button key={a.to} type="button" onClick={() => onStatus(movie.id_movie, a.to)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs text-left transition-all duration-300 ${a.cls}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
                {primary.length === 0 && danger.length === 0 && !info && (
                  <p className="text-xs text-white/20 italic">Aucune action disponible.</p>
                )}
              </div>

              {/* Jurys */}
              <div className="p-4">
                <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Jurys assignés</p>
                {juries.length === 0
                  ? <p className="text-xs text-white/25 italic">Aucun jury assigné.</p>
                  : <div className="space-y-2 mb-2">
                      {juries.map((j) => (
                        <div key={j.id_user} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[8px] font-bold flex-shrink-0 ring-1 ring-white/20">
                            {j.first_name?.[0]}{j.last_name?.[0]}
                          </div>
                          <span className="text-white/50 text-xs">{j.first_name} {j.last_name}</span>
                        </div>
                      ))}
                    </div>
                }
                <p className="text-[9px] text-white/20 italic font-['JetBrains_Mono']">
                  Gérer dans <span className="text-amber-400/45">Distribution &amp; Jury</span>.
                </p>
              </div>

              {/* Catégories */}
              <div className="p-4">
                <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Catégories</p>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {categories.map((c) => (
                    <button key={c.id_categorie} type="button"
                      onClick={() => {
                        const curr = catSel[movie.id_movie] || [];
                        const next = curr.includes(c.id_categorie) ? curr.filter((x) => x !== c.id_categorie) : [...curr, c.id_categorie];
                        setCatSel((p) => ({ ...p, [movie.id_movie]: next }));
                      }}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all duration-300 ${
                        currentCats.includes(c.id_categorie)
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                          : "bg-white/5 border-white/10 text-white/35 hover:bg-white/10 hover:text-white/65"
                      }`}>
                      {c.name}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => onCategories(movie.id_movie)}
                  className="w-full px-3 py-2 bg-blue-500/20 border border-blue-700/20 text-white/45 text-xs rounded-xl hover:bg-blue-700/20 hover:text-white/70 transition-all duration-300 font-medium cursor-pointer">
                  Enregistrer
                </button>
              </div>

              {/* Note interne */}
              <div className="p-4">
                <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold mb-2.5">Note interne</p>
                <textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                  rows={3} placeholder="Note confidentielle…"
                  className="w-full bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/30 focus:bg-white/10 resize-none mb-2 placeholder:text-white/15 transition-all duration-300" />
                <button type="button" onClick={() => onComment(movie.id_movie)}
                  className="w-full px-3 py-2 bg-blue-500/20 border border-blue-700/20 text-white/45 text-xs rounded-xl hover:bg-blue-700/20 hover:text-white/70 transition-all duration-300 font-medium cursor-pointer">
                  Enregistrer
                </button>
              </div>

              {/* Forcer un statut */}
              {/* FIX B-07 : les boutons de ce panneau appellent onForceStatus au lieu de onStatus.
                  onForceStatus passe { force_transition: true } au backend via l'API,
                  ce qui bypass la transitionMap et autorise n'importe quelle transition. */}
              <div className="p-4">
                <button onClick={() => setManual((p) => !p)}
                  className="w-full flex items-center justify-between text-[11px] text-white/30 hover:text-white/50 transition-all duration-300">
                  <span>Forcer un statut</span>
                  <span className={`transition-transform duration-300 ${manual ? "rotate-180" : ""}`}>▾</span>
                </button>
                {manual && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5 pt-3 border-t border-white/10">
                    {Object.entries(S).filter(([s]) => s !== status).map(([s, m]) => (
                      <button key={s} type="button" onClick={() => onForceStatus(movie.id_movie, s)}
                        className="flex items-center gap-1.5 px-2 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] rounded-xl hover:bg-white/10 hover:text-white/65 hover:border-white/20 transition-all duration-300">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete */}
              <div className="p-4 mt-auto">
                <button type="button" onClick={() => onDelete(movie.id_movie)}
                  className="w-full px-3 py-2 text-[11px] text-red-300/90 border bg-red-500/10 border-red-900/20 rounded-xl hover:bg-red-500/20 hover:text-red-400/90 hover:border-red-500/30 transition-all duration-300">
                  🗑 Supprimer définitivement
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}

/* ── Vérifications ────────────────────────────────── */
function CheckStrip({ movie }) {
  const trailer = getTrailer(movie);
  const checks = [
    { label: "Durée ≤ 120s",      ok: !movie.duration || movie.duration <= 120, note: movie.duration ? `${movie.duration}s` : "non renseignée" },
    { label: "Titre",             ok: Boolean(movie.title?.trim())                                                    },
    { label: "Synopsis",          ok: Boolean((movie.synopsis || movie.description)?.trim())                          },
    { label: "Fichier vidéo",     ok: Boolean(trailer || movie.youtube_link), note: "absent"                          },
    { label: "Classif. IA",       ok: Boolean(movie.production?.trim()), note: "non renseignée"                       },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const allOk  = passed === checks.length;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[8px] tracking-[0.25em] uppercase text-white/20 font-semibold">Vérifications</p>
        <span className={`text-[9px] font-['JetBrains_Mono'] ${allOk ? "text-emerald-400" : "text-amber-400"}`}>{passed}/{checks.length}</span>
      </div>
      <div className="flex flex-col gap-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] ${
            c.ok ? "text-emerald-400/80" : "text-red-400/80"
          }`}>
            <span className="font-['JetBrains_Mono'] text-[9px] w-3 flex-shrink-0">{c.ok ? "✓" : "✗"}</span>
            <span className="flex-1">{c.label}</span>
            {!c.ok && c.note && <span className="text-[9px] opacity-40">({c.note})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}