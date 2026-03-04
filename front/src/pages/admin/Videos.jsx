/**
 * Videos.jsx — Gestion des films (Admin)
 *
 * Pipeline strict :
 *   submitted  → admin vérifie → Accepter (→ assigned) | Refuser
 *   assigned   → jury vote Phase 1 → Ouvrir Phase 2 (→ to_discuss) | Refuser
 *   to_discuss → jury vote Phase 2 → Promouvoir (→ selected) | Finaliste | Refuser
 *   selected   → Finaliste | Primer (→ awarded) | Refuser
 *   finalist   → Primer (→ awarded) | Refuser
 *   awarded    → Retirer du palmarès
 *   refused    → Remettre en attente (→ submitted)
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories, getVideos, deleteMovie,
  updateMovie, updateMovieCategories, updateMovieStatus
} from "../../api/videos.js";
import { getVotes } from "../../api/votes.js";
import { VideoPreview } from "../../components/VideoPreview.jsx";
import { UPLOAD_BASE } from "../../utils/constants.js";

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
          to: "assigned", cls: "act-green",
          label: "✓ Accepter — lancer la Phase 1",
          tip: juriesCount === 0
            ? "⚠ Aucun jury assigné. Après acceptation, allez dans Distribution & Jury."
            : null,
        }],
        danger: [{ to: "refused", cls: "act-red", label: "✗ Refuser le film" }],
        info: "Vérifiez le film avant d'accepter. Toutes les vérifications doivent être au vert.",
      };
    case "assigned":
      return {
        primary: [{
          to: "to_discuss", cls: hasVotes ? "act-amber" : "act-amber act-disabled",
          label: "💬 Ouvrir la Phase 2 (délibération)",
          tip: !hasVotes ? "En attente des votes Phase 1. Au moins un jury doit avoir voté." : null,
        }],
        danger: [{ to: "refused", cls: "act-red", label: "✗ Refuser" }],
        info: hasVotes
          ? `${juriesCount} jury(s) assigné(s) — votes reçus. Vous pouvez ouvrir la Phase 2.`
          : `Phase 1 en cours — ${juriesCount} jury(s) assigné(s). En attente de votes.`,
      };
    case "to_discuss":
      return {
        primary: [
          { to: "selected", cls: "act-violet", label: "★ Promouvoir — Sélection officielle" },
          { to: "finalist",  cls: "act-orange", label: "⭐ Passer directement en Finaliste" },
        ],
        danger: [{ to: "refused", cls: "act-red", label: "✗ Refuser" }],
        info: "Phase 2 ouverte. Attendez les votes de délibération du jury.",
      };
    case "selected":
    case "candidate":
      return {
        primary: [
          { to: "finalist", cls: "act-orange", label: "⭐ Passer en Finaliste" },
          { to: "awarded",  cls: "act-gold",   label: "🏆 Primer ce film" },
        ],
        danger: [{ to: "refused", cls: "act-red", label: "✗ Retirer de la sélection" }],
        info: null,
      };
    case "finalist":
      return {
        primary: [{ to: "awarded", cls: "act-gold", label: "🏆 Ajouter au palmarès" }],
        danger:  [{ to: "refused", cls: "act-red",  label: "✗ Retirer" }],
        info: null,
      };
    case "awarded":
      return {
        primary: [],
        danger:  [{ to: "finalist", cls: "act-orange", label: "↩ Retirer du palmarès" }],
        info: "🏆 Ce film fait partie du palmarès.",
      };
    case "refused":
      return {
        primary: [{ to: "submitted", cls: "act-slate", label: "↺ Remettre en attente" }],
        danger:  [],
        info: null,
      };
    default:
      return { primary: [], danger: [], info: null };
  }
}

/* ─── Utilitaires ─────────────────────────────────────── */
const getPoster  = (m) =>
  m.thumbnail       ? `${UPLOAD_BASE}/${m.thumbnail}`       :
  m.display_picture ? `${UPLOAD_BASE}/${m.display_picture}` :
  m.picture1        ? `${UPLOAD_BASE}/${m.picture1}`        :
  m.picture2        ? `${UPLOAD_BASE}/${m.picture2}`        :
  m.picture3        ? `${UPLOAD_BASE}/${m.picture3}`        : null;

const getTrailer = (m) =>
  m.trailer || m.trailer_video || m.trailerVideo || m.filmFile || m.video || null;

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
  const NOTE = { assigned:"✓ Film accepté — Phase 1 lancée.", refused:"Film refusé.", to_discuss:"Phase 2 ouverte.", selected:"Film promu.", finalist:"Film finaliste.", awarded:"🏆 Film primé !", submitted:"Film remis en attente." };

  const statusM = useMutation({
    mutationFn: ({ id, status }) => updateMovieStatus(id, status),
    onSuccess: (_,v) => { inv(); setModalNotice(NOTE[v.status] || "Statut mis à jour."); },
    onError: () => setModalNotice("❌ Erreur lors de la mise à jour."),
  });
  const commentM  = useMutation({ mutationFn: ({ id, c }) => updateMovie(id, { admin_comment: c }), onSuccess: () => { inv(); setModalNotice("Note enregistrée."); } });
  const catM      = useMutation({ mutationFn: ({ id, cats }) => updateMovieCategories(id, cats),   onSuccess: () => { inv(); setModalNotice("Catégories mises à jour."); } });
  const deleteM   = useMutation({ mutationFn: (id) => deleteMovie(id), onSuccess: () => { inv(); setSelectedMovie(null); } });

  async function batchStatus(s) {
    if (!selectedIds.length) return;
    await Promise.all(selectedIds.map((id) => updateMovieStatus(id, s)));
    inv(); setSelectedIds([]);
  }

  if (isPending) return <div className="flex flex-col items-center justify-center h-64 gap-3"><div className="w-7 h-7 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" /><p className="vid-label">Chargement</p></div>;
  if (isError) return <div className="m-6 px-5 py-4 bg-red-950/30 border border-red-900/40 rounded-2xl text-red-400 text-sm flex items-center gap-3"><span>!</span><span>Erreur : {error?.message}</span></div>;

  return (
    <div className="min-h-screen bg-[#06080d] text-white pb-20 vid-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .vid-root { font-family:'Inter',system-ui,sans-serif; }
        .vid-label { font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,.25); font-weight:500; }
        .vid-section-label { font-size:8px; letter-spacing:0.25em; text-transform:uppercase; color:rgba(255,255,255,.2); font-weight:600; }
        .vid-num { font-family:'JetBrains Mono',monospace; font-size:18px; font-weight:600; line-height:1; }
        .vid-pill { font-size:9px; padding:2px 7px; border-radius:10px; font-weight:500; }
        .film-row { transition:background .12s,border-color .12s; }
        .row-thumb { transition:transform .3s; } .film-row:hover .row-thumb { transform:scale(1.08); }
        .t-scroll::-webkit-scrollbar{width:3px;} .t-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
        .act-green  { background:rgba(5,150,105,.12); color:#6ee7b7; border:1px solid rgba(5,150,105,.2); }
        .act-green:hover:not(:disabled)  { background:rgba(5,150,105,.22); border-color:rgba(5,150,105,.38); }
        .act-red    { background:rgba(185,28,28,.12);  color:#fca5a5; border:1px solid rgba(185,28,28,.2); }
        .act-red:hover:not(:disabled)    { background:rgba(185,28,28,.22); border-color:rgba(185,28,28,.38); }
        .act-amber  { background:rgba(180,83,9,.12);   color:#fcd34d; border:1px solid rgba(180,83,9,.2); }
        .act-amber:hover:not(:disabled)  { background:rgba(180,83,9,.22); border-color:rgba(180,83,9,.38); }
        .act-disabled    { opacity:.3 !important; cursor:not-allowed !important; }
        .act-violet { background:rgba(109,40,217,.12); color:#c4b5fd; border:1px solid rgba(109,40,217,.2); }
        .act-violet:hover:not(:disabled) { background:rgba(109,40,217,.22); border-color:rgba(109,40,217,.38); }
        .act-orange { background:rgba(194,65,12,.12);  color:#fdba74; border:1px solid rgba(194,65,12,.2); }
        .act-orange:hover:not(:disabled) { background:rgba(194,65,12,.22); border-color:rgba(194,65,12,.38); }
        .act-gold   { background:rgba(161,98,7,.2);    color:#fde68a; border:1px solid rgba(161,98,7,.32); font-weight:600; }
        .act-gold:hover:not(:disabled)   { background:rgba(161,98,7,.34); border-color:rgba(161,98,7,.52); }
        .act-slate  { background:rgba(71,85,105,.15);  color:#94a3b8; border:1px solid rgba(71,85,105,.25); }
        .act-slate:hover:not(:disabled)  { background:rgba(71,85,105,.28); }
        .qbtn { padding:4px 9px; border-radius:7px; font-size:10px; font-weight:500; transition:all .15s; white-space:nowrap; font-family:'Inter',sans-serif; }
      `}</style>

      {/* ── Header sticky ── */}
      <div className="sticky top-0 z-20 bg-[#06080d]/97 backdrop-blur-xl border-b border-white/[0.04] px-6 py-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="vid-label text-amber-500/50 mb-1">Administration</p>
              <h1 className="text-[22px] font-semibold tracking-tight text-white">Gestion des films</h1>
              <p className="vid-label mt-1">{allMovies.length} film{allMovies.length !== 1 ? "s" : ""} enregistres</p>
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
                <div key={s.key} className={`flex flex-col items-center min-w-[52px] px-3 py-2 rounded-xl ${s.bg} border border-white/[0.06]`}>
                  <span className={`vid-num ${s.col}`}>{tabCounts[s.key] || 0}</span>
                  <span className="vid-label mt-1">{scfg(s.key).label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-t border-white/[0.04]">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedIds([]); }}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all ${  
                  activeTab === tab.key
                    ? "text-amber-400 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-amber-400 after:rounded-t"
                    : "text-white/35 hover:text-white/60"
                }`}>
                {tab.label}
                {(tabCounts[tab.key] || 0) > 0 && (
                  <span className={`vid-pill ${activeTab === tab.key ? "bg-amber-500/20 text-amber-400" : "bg-white/[0.06] text-white/25"}`}>
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
              className="w-full bg-white/[0.04] border border-white/[0.07] text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.05] placeholder:text-white/15 transition" />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-3.5 py-2 text-[10px]">
              <span className="text-white/35">{selectedIds.length} film(s)</span>
              <span className="h-3 w-px bg-white/10" />
              <button onClick={() => batchStatus("assigned")} className="text-emerald-400 hover:text-emerald-300 transition font-medium">✓ Accepter</button>
              <span className="h-3 w-px bg-white/10" />
              <button onClick={() => batchStatus("refused")} className="text-red-400 hover:text-red-300 transition">✗ Refuser</button>
              <span className="h-3 w-px bg-white/10" />
              <button onClick={() => setSelectedIds([])} className="text-white/25 hover:text-white/50 transition">✕</button>
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
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="grid grid-cols-[20px_56px_1fr_110px_90px_105px_auto] gap-4 px-5 py-3 border-b border-white/[0.05] bg-white/[0.02]">
              <input type="checkbox" checked={selectedIds.length === filteredMovies.length && filteredMovies.length > 0}
                onChange={() => setSelectedIds(selectedIds.length === filteredMovies.length ? [] : filteredMovies.map((m) => m.id_movie))}
                className="accent-amber-500" />
              <span />
              <span>Film</span>
              <span className="vid-label">Producteur</span>
              <span className="vid-label">Votes</span>
              <span className="vid-label">Statut</span>
              <span className="vid-label">Actions</span>
            </div>

            <div className="divide-y divide-white/[0.035]">
              {filteredMovies.map((movie) => {
                const status  = movie.selection_status || "submitted";
                const meta    = scfg(status);
                const summary = voteSummary[movie.id_movie];
                const poster  = getPoster(movie);
                const isSel   = selectedIds.includes(movie.id_movie);

                return (
                  <div key={movie.id_movie}
                    className={`grid grid-cols-[20px_56px_1fr_110px_90px_105px_auto] gap-4 px-5 py-0 items-stretch transition film-row border-l-2 ${
                      isSel ? "bg-amber-500/[0.04] !border-l-amber-500/50" : "!border-l-transparent"
                    }`}>

                    <input type="checkbox" checked={isSel}
                      onChange={() => setSelectedIds((p) => p.includes(movie.id_movie) ? p.filter((x) => x !== movie.id_movie) : [...p, movie.id_movie])}
                      className="accent-amber-500" />

                    <button type="button" onClick={() => setSelectedMovie(movie)}
                      className="w-14 h-14 my-2.5 rounded-xl overflow-hidden bg-white/5 border border-white/[0.07] flex-shrink-0">
                      {poster
                        ? <img src={poster} alt={movie.title} className="row-thumb w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white/10 text-xl">🎬</div>}
                    </button>

                    <button type="button" onClick={() => setSelectedMovie(movie)} className="text-left min-w-0 py-3 flex flex-col justify-center">
                      <p className="text-sm font-medium text-white/80 truncate hover:text-amber-300 transition leading-snug">{movie.title}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {(movie.Categories || []).slice(0, 2).map((c) => (
                          <span key={c.id_categorie} className="text-[8px] text-white/25 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.05]">{c.name}</span>
                        ))}
                        {movie.duration && <span className="text-[8px] text-white/20 font-mono">{movie.duration}s</span>}
                      </div>
                    </button>

                    <p className="text-xs text-white/35 truncate self-center">
                      {movie.Producer ? `${movie.Producer.first_name} ${movie.Producer.last_name}` : "—"}
                    </p>

                    <div className="self-center">
                      {summary ? (
                        <div className="space-y-1.5">
                          <div className="flex gap-2 text-[10px] font-mono">
                            <span className="text-emerald-400">{summary.YES}✓</span>
                            <span className="text-amber-400">{summary["TO DISCUSS"]}◇</span>
                            <span className="text-red-400">{summary.NO}✗</span>
                          </div>
                          {summary.total > 0 && (
                            <div className="h-1 rounded-full flex overflow-hidden bg-white/[0.06] w-20">
                              <div className="bg-emerald-500 h-full" style={{width:`${(summary.YES/summary.total)*100}%`}} />
                              <div className="bg-amber-500 h-full"  style={{width:`${(summary["TO DISCUSS"]/summary.total)*100}%`}} />
                              <div className="bg-red-500 h-full"    style={{width:`${(summary.NO/summary.total)*100}%`}} />
                            </div>
                          )}
                        </div>
                      ) : <span className="text-white/15 font-mono text-[10px]">—</span>}
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
                          className="qbtn act-green">✓ Accepter</button>
                      )}
                      {status === "assigned" && summary?.total > 0 && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "to_discuss" })}
                          className="qbtn act-amber">Phase 2 →</button>
                      )}
                      {status === "to_discuss" && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "selected" })}
                          className="qbtn act-violet">★ Sélect.</button>
                      )}
                      {(status === "selected" || status === "candidate") && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "finalist" })}
                          className="qbtn act-orange">⭐ Final.</button>
                      )}
                      {status === "finalist" && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "awarded" })}
                          className="qbtn act-gold">🏆</button>
                      )}
                      {status === "refused" && (
                        <button type="button" onClick={() => statusM.mutate({ id: movie.id_movie, status: "submitted" })}
                          className="qbtn act-slate">↺</button>
                      )}
                      {status !== "refused" && status !== "awarded" && (
                        <button type="button"
                          onClick={() => window.confirm(`Refuser "${movie.title}" ?`) && statusM.mutate({ id: movie.id_movie, status: "refused" })}
                          className="qbtn act-red">✗</button>
                      )}
                      <button type="button" onClick={() => setSelectedMovie(movie)}
                        className="qbtn" style={{ background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.3)", border: "1px solid rgba(255,255,255,.06)" }}>
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
  adminComment, setAdminComment, notice, onClose, onStatus, onComment, onCategories, onDelete }) {

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
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
           onClick={() => setFsVideo(false)}>
        <button className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl z-10" onClick={() => setFsVideo(false)}>✕</button>
        {trailer
          ? <div className="w-full max-w-5xl px-4" onClick={(e) => e.stopPropagation()}>
              <VideoPreview title={movie.title} src={`${UPLOAD_BASE}/${trailer}`} poster={poster || undefined} />
            </div>
          : <a href={movie.youtube_link} target="_blank" rel="noreferrer" className="text-amber-400 text-lg underline">
              Ouvrir sur YouTube ↗
            </a>
        }
      </div>
    )}

    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-6">
        <div className="bg-[#0b0d11] border border-white/[0.07] rounded-2xl w-full max-w-6xl shadow-2xl shadow-black/60 overflow-hidden">

          {/* ── Header bar ── */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.01]">
            <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-lg font-medium flex-shrink-0 ${meta.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
            </span>
            <h2 className="text-sm font-semibold text-white flex-1 truncate">{movie.title}</h2>
            {(movie.Awards || []).length > 0 && (
              <span className="text-[9px] bg-yellow-800/30 text-yellow-300 px-2 py-1 rounded-lg border border-yellow-700/25 font-medium flex-shrink-0">
                🏆 {movie.Awards.length} prix
              </span>
            )}
            {/* Pipeline — inline in header */}
            {status !== "refused" && (
              <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto flex-shrink-0">
                {PIPELINE.map((step, i) => {
                  const cur  = step.key === status || (step.key === "selected" && status === "candidate");
                  const past = !cur && pIdx > i;
                  return (
                    <div key={step.key} className="flex items-center gap-0.5 flex-shrink-0">
                      {i > 0 && <div className={`w-3 h-px ${past || cur ? "bg-amber-500/40" : "bg-white/[0.06]"}`} />}
                      <span className={`px-2 py-0.5 rounded text-[8px] font-medium ${
                        cur  ? "bg-amber-500/15 text-amber-300" :
                        past ? "text-white/25" : "text-white/10"
                      }`}>{step.short}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={onClose}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.07] text-white/40 hover:bg-white/[0.1] hover:text-white transition text-xs">
              ✕
            </button>
          </div>

          {/* ── Notice ── */}
          {notice && (
            <div className={`mx-5 mt-3 px-4 py-2 rounded-xl text-xs border flex items-center gap-2 ${
              notice.startsWith("❌")
                ? "bg-red-900/15 border-red-800/25 text-red-300"
                : "bg-emerald-900/15 border-emerald-800/25 text-emerald-300"
            }`}>{notice}</div>
          )}

          {/* ── Body: 3 columns ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.05] min-h-0">

            {/* ── COL 1: Visual + checks ── */}
            <div className="p-4 flex flex-col gap-4">

              {/* Poster thumbnail — click = fullscreen */}
              <div>
                <div
                  className="relative group w-full aspect-video rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.07] cursor-pointer"
                  onClick={() => (trailer || movie.youtube_link) && setFsVideo(true)}
                >
                  {poster
                    ? <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-white/10 text-3xl">🎬</div>}
                  {(trailer || movie.youtube_link) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <span className="text-black text-sm ml-0.5">▶</span>
                      </div>
                      <span className="absolute bottom-2 right-2 text-[9px] text-white/60 bg-black/50 px-1.5 py-0.5 rounded">
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

                {/* File links */}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {trailer && (
                    <a href={`${UPLOAD_BASE}/${trailer}`} target="_blank" rel="noreferrer"
                      className="text-[10px] text-amber-400/50 hover:text-amber-300 transition">↓ Film</a>
                  )}
                  {movie.subtitle && (
                    <a href={`${UPLOAD_BASE}/${movie.subtitle}`} target="_blank" rel="noreferrer" download
                      className="text-[10px] text-amber-400/50 hover:text-amber-300 transition">📄 Sous-titres</a>
                  )}
                  {movie.youtube_link && (
                    <a href={movie.youtube_link} target="_blank" rel="noreferrer"
                      className="text-[10px] text-red-400/50 hover:text-red-300 transition">▶ YouTube</a>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Durée", movie.duration ? `${movie.duration}s` : "—"],
                  ["Langue", movie.main_language || "—"],
                  ["Nationalité", movie.nationality || "—"],
                  ["Outil IA", movie.ai_tool || "—"],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <p className="vid-label mb-0.5">{lbl}</p>
                    <p className="text-white/55 text-[11px] truncate">{val}</p>
                  </div>
                ))}
              </div>

              {/* Checks */}
              <CheckStrip movie={movie} />

            </div>

            {/* ── COL 2: Info + synopsis + votes ── */}
            <div className="p-4 overflow-y-auto max-h-[75vh] t-scroll space-y-5">

              {/* Producer info */}
              <div>
                <p className="vid-section-label mb-3">Informations</p>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                  {[
                    ["Producteur",    movie.Producer ? `${movie.Producer.first_name} ${movie.Producer.last_name}` : "—"],
                    ["E-mail",        movie.Producer?.email || "—"],
                    ["Classif. IA",   movie.production || "—"],
                    ["Méthodo IA",   movie.workshop || "—"],
                    ["Connu via",     movie.Producer?.known_by_mars_ai || "—"],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="min-w-0">
                      <p className="vid-label mb-0.5">{lbl}</p>
                      <p className="text-white/60 text-xs truncate">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <p className="vid-section-label mb-2.5">Synopsis</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
                    <p className="vid-label mb-1.5">Français</p>
                    <p className="text-xs text-white/45 leading-relaxed line-clamp-5">{movie.synopsis || movie.description || "—"}</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
                    <p className="vid-label mb-1.5">English</p>
                    <p className="text-xs text-white/45 leading-relaxed line-clamp-5">{movie.synopsis_anglais || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Votes */}
              {(summary?.votes?.length || 0) > 0 && (
                <div>
                  <p className="vid-section-label mb-2.5">Votes Phase 1 — {summary.total} réponse{summary.total > 1 ? "s" : ""}</p>

                  {/* Stats + bar */}
                  <div className="flex items-center gap-3 mb-3">
                    {[["Validé","YES","text-emerald-400","bg-emerald-500/10 border-emerald-800/20"],
                      ["À discuter","TO DISCUSS","text-amber-400","bg-amber-500/10 border-amber-800/20"],
                      ["Refusé","NO","text-red-400","bg-red-500/10 border-red-800/20"]].map(([lbl,k,col,bg]) => (
                      <div key={k} className={`${bg} border rounded-xl px-3 py-2 text-center min-w-[58px]`}>
                        <p className={`text-xl font-bold font-mono leading-none ${col}`}>{summary[k]}</p>
                        <p className="text-[8px] text-white/25 mt-1">{lbl}</p>
                      </div>
                    ))}
                    {summary.total > 0 && (
                      <div className="flex-1 h-2 rounded-full flex overflow-hidden bg-white/[0.05]">
                        <div className="bg-emerald-500 h-full" style={{ width:`${(summary.YES/summary.total)*100}%` }} />
                        <div className="bg-amber-500 h-full"   style={{ width:`${(summary["TO DISCUSS"]/summary.total)*100}%` }} />
                        <div className="bg-red-500 h-full"     style={{ width:`${(summary.NO/summary.total)*100}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Jury list */}
                  <div className="space-y-1 max-h-36 overflow-y-auto t-scroll">
                    {summary.votes.map((v) => (
                      <div key={v.id_vote} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.02] transition">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-700/50 to-pink-700/50 flex items-center justify-center text-[7px] font-bold flex-shrink-0 text-white/60">
                          {v.User ? `${v.User.first_name?.[0]}${v.User.last_name?.[0]}` : "?"}
                        </div>
                        <span className="text-white/40 flex-1 truncate text-[11px]">
                          {v.User ? `${v.User.first_name} ${v.User.last_name}` : `Jury #${v.id_user}`}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          v.note === "YES" ? "bg-emerald-500/12 text-emerald-300" :
                          v.note === "NO"  ? "bg-red-500/12 text-red-300" :
                          "bg-amber-500/12 text-amber-300"
                        }`}>{v.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── COL 3: Actions sidebar ── */}
            <div className="flex flex-col divide-y divide-white/[0.05] overflow-y-auto max-h-[75vh] t-scroll">

              {/* Actions */}
              <div className="p-4">
                <p className="vid-section-label mb-3">Actions</p>
                {info && (
                  <div className="mb-3 px-3 py-2 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl text-xs text-amber-200/55 leading-relaxed">
                    {info}
                  </div>
                )}
                {primary.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {primary.map((a) => (
                      <button key={a.to} type="button"
                        disabled={a.cls.includes("disabled")}
                        onClick={() => !a.cls.includes("disabled") && onStatus(movie.id_movie, a.to)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium text-left transition ${a.cls}`}>
                        {a.label}
                        {a.tip && <p className="text-[9px] font-normal opacity-55 mt-0.5">{a.tip}</p>}
                      </button>
                    ))}
                  </div>
                )}
                {danger.length > 0 && (
                  <div className={`space-y-1.5 ${primary.length > 0 ? "pt-2 border-t border-white/[0.05]" : ""}`}>
                    {danger.map((a) => (
                      <button key={a.to} type="button" onClick={() => onStatus(movie.id_movie, a.to)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs text-left transition ${a.cls}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
                {primary.length === 0 && danger.length === 0 && !info && (
                  <p className="text-xs text-white/18 italic">Aucune action disponible.</p>
                )}
              </div>

              {/* Jurys */}
              <div className="p-4">
                <p className="vid-section-label mb-2.5">Jurys assignés</p>
                {juries.length === 0
                  ? <p className="text-xs text-white/25 italic">Aucun jury assigné.</p>
                  : <div className="space-y-2 mb-2">
                      {juries.map((j) => (
                        <div key={j.id_user} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-700 to-pink-700 flex items-center justify-center text-[8px] font-bold flex-shrink-0 ring-1 ring-white/10">
                            {j.first_name?.[0]}{j.last_name?.[0]}
                          </div>
                          <span className="text-white/50 text-xs">{j.first_name} {j.last_name}</span>
                        </div>
                      ))}
                    </div>
                }
                <p className="text-[9px] text-white/18 italic font-mono">
                  Gérer dans <span className="text-amber-400/45">Distribution &amp; Jury</span>.
                </p>
              </div>

              {/* Catégories */}
              <div className="p-4">
                <p className="vid-section-label mb-2.5">Catégories</p>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {categories.map((c) => (
                    <button key={c.id_categorie} type="button"
                      onClick={() => {
                        const curr = catSel[movie.id_movie] || [];
                        const next = curr.includes(c.id_categorie) ? curr.filter((x) => x !== c.id_categorie) : [...curr, c.id_categorie];
                        setCatSel((p) => ({ ...p, [movie.id_movie]: next }));
                      }}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition ${
                        currentCats.includes(c.id_categorie)
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-white/[0.04] border-white/[0.06] text-white/35 hover:bg-white/[0.07] hover:text-white/65"
                      }`}>
                      {c.name}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => onCategories(movie.id_movie)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.07] text-white/45 text-xs rounded-xl hover:bg-white/[0.07] hover:text-white/70 transition font-medium">
                  Enregistrer
                </button>
              </div>

              {/* Note interne */}
              <div className="p-4">
                <p className="vid-section-label mb-2.5">Note interne</p>
                <textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                  rows={3} placeholder="Note confidentielle…"
                  className="w-full bg-white/[0.04] border border-white/[0.07] text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/25 focus:bg-white/[0.05] resize-none mb-2 placeholder:text-white/15 transition" />
                <button type="button" onClick={() => onComment(movie.id_movie)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.07] text-white/45 text-xs rounded-xl hover:bg-white/[0.07] hover:text-white/70 transition font-medium">
                  Enregistrer
                </button>
              </div>

              {/* Forcer un statut */}
              <div className="p-4">
                <button onClick={() => setManual((p) => !p)}
                  className="w-full flex items-center justify-between text-[11px] text-white/28 hover:text-white/50 transition">
                  <span>Forcer un statut</span>
                  <span className={`transition-transform duration-200 ${manual ? "rotate-180" : ""}`}>▾</span>
                </button>
                {manual && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5 pt-3 border-t border-white/[0.05]">
                    {Object.entries(S).filter(([s]) => s !== status).map(([s, m]) => (
                      <button key={s} type="button" onClick={() => onStatus(movie.id_movie, s)}
                        className="flex items-center gap-1.5 px-2 py-2 bg-white/[0.03] border border-white/[0.05] text-white/40 text-[10px] rounded-xl hover:bg-white/[0.06] hover:text-white/65 hover:border-white/[0.09] transition">
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
                  className="w-full px-3 py-2 text-[11px] text-red-500/28 border border-red-900/18 rounded-xl hover:bg-red-950/25 hover:text-red-400/80 hover:border-red-800/35 transition">
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
        <p className="vid-section-label">Vérifications</p>
        <span className={`text-[9px] font-mono ${allOk ? "text-emerald-400" : "text-amber-400"}`}>{passed}/{checks.length}</span>
      </div>
      <div className="flex flex-col gap-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] ${
            c.ok ? "text-emerald-400/80" : "text-red-400/80"
          }`}>
            <span className="font-mono text-[9px] w-3 flex-shrink-0">{c.ok ? "✓" : "✗"}</span>
            <span className="flex-1">{c.label}</span>
            {!c.ok && c.note && <span className="text-[9px] opacity-40">({c.note})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Blk({ title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
      <h3 className="vid-section-label mb-4">{title}</h3>
      {children}
    </div>
  );
}