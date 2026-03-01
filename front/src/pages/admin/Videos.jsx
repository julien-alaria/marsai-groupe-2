/**
 * Videos.jsx — Gestion des films (Administrateur)
 *
 * Vue principale : liste PLATE de tous les films soumis.
 * L'administrateur voit immédiatement tous les films sans avoir
 * à naviguer dans des dossiers.
 *
 * Fonctionnalités :
 *  - Onglets de filtrage par statut (Tous / Soumis / En évaluation /
 *    À discuter / Candidats / Refusés / Primés)
 *  - Recherche par titre ou producteur
 *  - Accepter / Refuser un film en un clic depuis la liste
 *  - Modale de détail : vidéo, infos, votes, assigner jury,
 *    changer statut, commenter
 *  - Actions en lot (sélection multiple)
 *  - Second vote (to_discuss) déclenchable depuis la liste
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getVideos,
  deleteMovie,
  updateMovie,
  updateMovieCategories,
  updateMovieStatus
} from "../../api/videos.js";

import { getVotes, deleteVotesByMovie } from "../../api/votes.js";
import { VideoPreview } from "../../components/VideoPreview.jsx";
import { UPLOAD_BASE } from "../../utils/constants.js";

/* ─── Statuts du pipeline ─────────────────────────────── */
const STATUS_CONFIG = {
  submitted:   { label: "Soumis",              color: "bg-gray-500",    tab: "submitted"  },
  assigned:    { label: "En évaluation",       color: "bg-blue-600",    tab: "assigned"   },
  to_discuss:  { label: "À discuter",          color: "bg-yellow-600",  tab: "to_discuss" },
  candidate:   { label: "Candidat",            color: "bg-purple-600",  tab: "candidate"  },
  selected:    { label: "Sélectionné",         color: "bg-green-600",   tab: "candidate"  },
  finalist:    { label: "Finaliste",           color: "bg-orange-600",  tab: "candidate"  },
  refused:     { label: "Refusé",              color: "bg-red-600",     tab: "refused"    },
  awarded:     { label: "Primé 🏆",            color: "bg-yellow-400",  tab: "awarded"    },
};

const TABS = [
  { key: "all",       label: "Tous"           },
  { key: "submitted", label: "Soumis"         },
  { key: "assigned",  label: "En évaluation"  },
  { key: "to_discuss",label: "À discuter"     },
  { key: "candidate", label: "Candidats"      },
  { key: "refused",   label: "Refusés"        },
  { key: "awarded",   label: "Primés"         },
];

/* ─── Utilitaires ─────────────────────────────────────── */
const getPoster = (movie) =>
  movie.thumbnail       ? `${UPLOAD_BASE}/${movie.thumbnail}`       :
  movie.display_picture ? `${UPLOAD_BASE}/${movie.display_picture}` :
  movie.picture1        ? `${UPLOAD_BASE}/${movie.picture1}`        :
  movie.picture2        ? `${UPLOAD_BASE}/${movie.picture2}`        :
  movie.picture3        ? `${UPLOAD_BASE}/${movie.picture3}`        : null;

const getTrailer = (movie) =>
  movie.trailer || movie.trailer_video || movie.trailerVideo || movie.filmFile || movie.video || null;

const statusCfg = (status) => STATUS_CONFIG[status] || { label: status || "Soumis", color: "bg-gray-500", tab: "submitted" };

/* ════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════════════ */
export default function Videos() {
  const queryClient = useQueryClient();

  /* ── Données ── */
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
    refetchInterval: 30_000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
const { data: votesData } = useQuery({
    queryKey: ["votes"],
    queryFn: getVotes,
  });

  const allMovies   = data?.data || [];
  const categories  = categoriesData?.data || [];
  const votes       = votesData?.data || [];

  /* ── Vote summary par film ── */
  const voteSummary = useMemo(() => {
    return votes.reduce((acc, vote) => {
      if (!acc[vote.id_movie]) {
        acc[vote.id_movie] = { YES: 0, "TO DISCUSS": 0, NO: 0, total: 0, votes: [] };
      }
      const s = acc[vote.id_movie];
      if (["YES", "NO", "TO DISCUSS"].includes(vote.note)) s[vote.note]++;
      s.total++;
      s.votes.push(vote);
      return acc;
    }, {});
  }, [votes]);

  /* ── États d'interface ── */
  const [activeTab,      setActiveTab]      = useState("all");
  const [search,         setSearch]         = useState("");
  const [selectedIds,    setSelectedIds]    = useState([]);
  const [selectedMovie,  setSelectedMovie]  = useState(null);
  const [adminComment,   setAdminComment]   = useState("");
  const [modalNotice,    setModalNotice]    = useState(null);
  const [catSelection,   setCatSelection]   = useState({});

  /* Initialisation des sélections */
  useEffect(() => {
    if (!allMovies.length) return;
    const cats = {}, juries = {};
    allMovies.forEach((m) => {
      cats[m.id_movie]   = (m.Categories || []).map((c) => c.id_categorie);
    });
    setCatSelection(cats);
  }, [data]);

  /* Sync commentaire admin avec film sélectionné */
  useEffect(() => {
    if (!selectedMovie) return;
    setAdminComment(selectedMovie.admin_comment || "");
    setModalNotice(null);
  }, [selectedMovie]);

  useEffect(() => {
    if (!modalNotice) return;
    const t = setTimeout(() => setModalNotice(null), 4000);
    return () => clearTimeout(t);
  }, [modalNotice]);

  /* ── Films filtrés ── */
  const filteredMovies = useMemo(() => {
    return allMovies.filter((m) => {
      const status = m.selection_status || "submitted";
      const cfg    = statusCfg(status);

      // Filtre par onglet
      if (activeTab !== "all" && cfg.tab !== activeTab) return false;

      // Filtre par recherche
      if (search.trim()) {
        const q    = search.toLowerCase();
        const name = `${m.Producer?.first_name || ""} ${m.Producer?.last_name || ""}`.toLowerCase();
        return m.title?.toLowerCase().includes(q) || name.includes(q);
      }
      return true;
    });
  }, [allMovies, activeTab, search]);

  /* Comptage par onglet */
  const tabCounts = useMemo(() => {
    const counts = { all: allMovies.length };
    TABS.slice(1).forEach((tab) => {
      counts[tab.key] = allMovies.filter((m) => {
        const status = m.selection_status || "submitted";
        return statusCfg(status).tab === tab.key;
      }).length;
    });
    return counts;
  }, [allMovies]);

  /* ── Mutations ── */
  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["listVideos"] });
    queryClient.invalidateQueries({ queryKey: ["votes"] });
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateMovieStatus(id, status),
    onSuccess: () => { invalidate(); setModalNotice("Statut mis à jour."); }
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, comment }) => updateMovie(id, { admin_comment: comment }),
    onSuccess: () => { invalidate(); setModalNotice("Commentaire enregistré."); }
  });

  const catMutation = useMutation({
    mutationFn: ({ id, cats }) => updateMovieCategories(id, cats),
    onSuccess: () => { invalidate(); setModalNotice("Catégories mises à jour."); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMovie(id),
    onSuccess: () => { invalidate(); setSelectedMovie(null); }
  });

  const secondVoteMutation = useMutation({
    mutationFn: (id) => updateMovieStatus(id, "to_discuss"),
    onSuccess: () => { invalidate(); setModalNotice("Second vote ouvert."); }
  });

  /* Batch */
  async function batchStatus(status) {
    if (!selectedIds.length) return;
    await Promise.all(selectedIds.map((id) => updateMovieStatus(id, status)));
    invalidate();
    setSelectedIds([]);
  }

  /* Sélection */
  function toggleId(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedIds.length === filteredMovies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMovies.map((m) => m.id_movie));
    }
  }

  /* ── États de chargement ── */
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Chargement des films…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-400 text-sm p-6">
        Erreur : {error?.message}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     RENDU
  ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] text-white pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-5 pt-6">

        {/* ── En-tête ── */}
        <div>
          <h1 className="text-2xl font-light text-white">Gestion des films</h1>
          <p className="text-sm text-white/40 mt-1">
            {allMovies.length} film{allMovies.length !== 1 ? "s" : ""} au total dans le système
          </p>
        </div>

        {/* ── Onglets de statut ── */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedIds([]); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                }`}>
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Barre de recherche + actions en lot ── */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou producteur…"
            className="flex-1 min-w-[220px] bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-white/30"
          />

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/50">{selectedIds.length} sélectionné(s)</span>
              <button onClick={() => batchStatus("assigned")}
                className="px-3 py-1.5 bg-blue-600/80 text-white text-xs rounded-lg hover:bg-blue-600 transition">
                ✓ Accepter
              </button>
              <button onClick={() => batchStatus("refused")}
                className="px-3 py-1.5 bg-red-600/80 text-white text-xs rounded-lg hover:bg-red-600 transition">
                ✗ Refuser
              </button>
              <button onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 bg-white/10 text-white/60 text-xs rounded-lg hover:bg-white/20 transition">
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* ── Liste des films ── */}
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <span className="text-5xl mb-4">🎬</span>
            <p className="text-sm">
              {allMovies.length === 0
                ? "Aucun film n'a encore été soumis."
                : "Aucun film ne correspond aux critères sélectionnés."}
            </p>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            {/* En-tête tableau */}
            <div className="grid grid-cols-[24px_48px_1fr_120px_80px_120px_140px] gap-3 px-4 py-2 border-b border-white/10 text-[10px] uppercase text-white/30 tracking-wider">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredMovies.length && filteredMovies.length > 0}
                onChange={toggleAll}
                className="accent-purple-500 cursor-pointer"
              />
              <span>Affiche</span>
              <span>Film</span>
              <span>Producteur</span>
              <span>Votes</span>
              <span>Statut</span>
              <span>Actions</span>
            </div>

            {/* Lignes */}
            <div className="divide-y divide-white/5">
              {filteredMovies.map((movie) => {
                const poster  = getPoster(movie);
                const status  = movie.selection_status || "submitted";
                const cfg     = statusCfg(status);
                const summary = voteSummary[movie.id_movie];
                const producer = movie.Producer;
                const isSelected = selectedIds.includes(movie.id_movie);

                return (
                  <div
                    key={movie.id_movie}
                    className={`grid grid-cols-[24px_48px_1fr_120px_80px_120px_140px] gap-3 px-4 py-3 items-center transition-colors ${
                      isSelected ? "bg-purple-500/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleId(movie.id_movie)}
                      className="accent-purple-500 cursor-pointer"
                    />

                    {/* Affiche */}
                    <button
                      type="button"
                      onClick={() => setSelectedMovie(movie)}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border border-white/10 flex-shrink-0"
                    >
                      {poster ? (
                        <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">🎬</div>
                      )}
                    </button>

                    {/* Titre + catégories */}
                    <button type="button" onClick={() => setSelectedMovie(movie)} className="text-left min-w-0">
                      <p className="text-sm font-medium text-white truncate hover:text-purple-300 transition">
                        {movie.title}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(movie.Categories || []).slice(0, 2).map((cat) => (
                          <span key={cat.id_categorie} className="text-[9px] px-1.5 py-0.5 bg-purple-500/15 border border-purple-500/25 text-purple-300 rounded-full">
                            {cat.name}
                          </span>
                        ))}
                        {movie.duration && (
                          <span className="text-[9px] text-white/30">{movie.duration}s</span>
                        )}
                      </div>
                    </button>

                    {/* Producteur */}
                    <div className="min-w-0">
                      <p className="text-xs text-white/70 truncate">
                        {producer ? `${producer.first_name} ${producer.last_name}` : "—"}
                      </p>
                    </div>

                    {/* Votes */}
                    <div className="text-[10px] space-y-0.5">
                      {summary ? (
                        <>
                          <span className="text-green-400">✓ {summary.YES}</span>
                          {" · "}
                          <span className="text-yellow-400">◇ {summary["TO DISCUSS"]}</span>
                          {" · "}
                          <span className="text-red-400">✗ {summary.NO}</span>
                        </>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </div>

                    {/* Statut */}
                    <div>
                      <span className={`text-[9px] px-2 py-1 rounded-full text-white font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Accepter (→ assigned) */}
                      {(status === "submitted") && (
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ id: movie.id_movie, status: "assigned" })}
                          title="Accepter — passer en évaluation"
                          className="px-2 py-1 bg-green-600/80 text-white text-[9px] rounded hover:bg-green-600 transition font-semibold"
                        >
                          ✓ Accepter
                        </button>
                      )}

                      {/* Ouvrir second vote */}
                      {status === "assigned" && summary?.total > 0 && (
                        <button
                          type="button"
                          onClick={() => secondVoteMutation.mutate(movie.id_movie)}
                          title="Ouvrir le second vote"
                          className="px-2 py-1 bg-yellow-600/80 text-white text-[9px] rounded hover:bg-yellow-600 transition"
                        >
                          2e vote
                        </button>
                      )}

                      {/* Promouvoir candidat */}
                      {status === "to_discuss" && (
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ id: movie.id_movie, status: "selected" })}
                          className="px-2 py-1 bg-purple-600/80 text-white text-[9px] rounded hover:bg-purple-600 transition"
                        >
                          ★ Candidat
                        </button>
                      )}

                      {/* Refuser */}
                      {status !== "refused" && status !== "awarded" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Refuser "${movie.title}" ?`)) {
                              statusMutation.mutate({ id: movie.id_movie, status: "refused" });
                            }
                          }}
                          className="px-2 py-1 bg-red-600/70 text-white text-[9px] rounded hover:bg-red-600 transition"
                        >
                          ✗
                        </button>
                      )}

                      {/* Réémettre */}
                      {status === "refused" && (
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ id: movie.id_movie, status: "submitted" })}
                          className="px-2 py-1 bg-gray-600/80 text-white text-[9px] rounded hover:bg-gray-600 transition"
                        >
                          ↺ Réémettre
                        </button>
                      )}

                      {/* Détails */}
                      <button
                        type="button"
                        onClick={() => setSelectedMovie(movie)}
                        className="px-2 py-1 bg-white/10 text-white/70 text-[9px] rounded hover:bg-white/20 transition"
                      >
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

      {/* ════════════════════════════════════════════════════
          MODALE DÉTAIL FILM
      ════════════════════════════════════════════════════ */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          categories={categories}
          summary={voteSummary[selectedMovie.id_movie]}
          catSelection={catSelection}
          setCatSelection={setCatSelection}
          adminComment={adminComment}
          setAdminComment={setAdminComment}
          modalNotice={modalNotice}
          onClose={() => setSelectedMovie(null)}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
          onSaveComment={(id) => commentMutation.mutate({ id, comment: adminComment })}
          onSaveCategories={(id) => catMutation.mutate({ id, cats: catSelection[id] || [] })}
          onDelete={(id) => {
            if (window.confirm("Supprimer ce film définitivement ?")) {
              deleteMutation.mutate(id);
            }
          }}
          onSecondVote={(id) => secondVoteMutation.mutate(id)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MODALE DÉTAIL FILM
════════════════════════════════════════════════════════ */
function MovieModal({
  movie, categories,
  summary,
  catSelection, setCatSelection,
  adminComment, setAdminComment,
  modalNotice, onClose,
  onStatusChange, onSaveComment, onSaveCategories,
  onDelete, onSecondVote
}) {
  const status  = movie.selection_status || "submitted";
  const cfg     = statusCfg(status);
  const poster  = getPoster(movie);
  const trailer = getTrailer(movie);
  const producer = movie.Producer;

  const selectedCats   = catSelection[movie.id_movie]   || [];

  function toggleCat(id) {
    const curr = catSelection[movie.id_movie] || [];
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    setCatSelection((prev) => ({ ...prev, [movie.id_movie]: next }));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl">

        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-white">{movie.title}</h2>
            <span className={`text-[10px] px-2 py-1 rounded-full text-white font-semibold ${cfg.color}`}>
              {cfg.label}
            </span>
            {(movie.Awards || []).length > 0 && (
              <span className="text-[10px] bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                🏆 {movie.Awards.length} prix
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white text-xl">✕</button>
        </div>

        {/* Notification */}
        {modalNotice && (
          <div className="mx-6 mt-4 bg-green-900/30 border border-green-600 text-green-300 px-4 py-2 rounded-lg text-xs">
            {modalNotice}
          </div>
        )}

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Colonne gauche : infos + vidéo ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Vérifications automatiques */}
            <AutoChecks movie={movie} />

            {/* Infos générales */}
            <InfoSection title="Informations générales">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <InfoRow label="Producteur" value={producer ? `${producer.first_name} ${producer.last_name}` : "—"} />
                <InfoRow label="E-mail" value={producer?.email || "—"} />
                <InfoRow label="Durée" value={movie.duration ? `${movie.duration}s` : "—"} />
                <InfoRow label="Langue" value={movie.main_language || "—"} />
                <InfoRow label="Nationalité" value={movie.nationality || "—"} />
                <InfoRow label="Année" value={movie.release_year || "—"} />
                <InfoRow label="Classification IA" value={movie.production || "—"} />
                <InfoRow label="Outil IA" value={movie.ai_tool || "—"} />
                <InfoRow label="Méthodologie" value={movie.workshop || "—"} />
              </div>
            </InfoSection>

            {/* Synopses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoSection title="Synopsis (FR)">
                <p className="text-xs text-white/70 leading-relaxed">
                  {movie.synopsis || movie.description || "—"}
                </p>
              </InfoSection>
              <InfoSection title="Synopsis (EN)">
                <p className="text-xs text-white/70 leading-relaxed">
                  {movie.synopsis_anglais || "—"}
                </p>
              </InfoSection>
            </div>

            {/* Vidéo */}
            {(trailer || movie.youtube_link) && (
              <InfoSection title="Visionner le film">
                {trailer ? (
                  <div className="aspect-video max-h-56">
                    <VideoPreview
                      title={movie.title}
                      src={`${UPLOAD_BASE}/${trailer}`}
                      poster={poster || undefined}
                    />
                  </div>
                ) : (
                  <a href={movie.youtube_link} target="_blank" rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm">
                    Ouvrir sur YouTube ↗
                  </a>
                )}
              </InfoSection>
            )}

            {/* Images */}
            {[movie.picture1, movie.picture2, movie.picture3].filter(Boolean).length > 0 && (
              <InfoSection title="Visuels">
                <div className="grid grid-cols-3 gap-2">
                  {[movie.picture1, movie.picture2, movie.picture3].filter(Boolean).map((pic, i) => (
                    <img key={i} src={`${UPLOAD_BASE}/${pic}`} alt={`Visuel ${i + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-white/10" />
                  ))}
                </div>
              </InfoSection>
            )}

            {/* Votes des jurys */}
            {summary?.votes?.length > 0 && (
              <InfoSection title={`Votes du jury (${summary.total})`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">{summary.YES}</span>
                    <span className="text-xs text-white/40">Validé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold">{summary["TO DISCUSS"]}</span>
                    <span className="text-xs text-white/40">À discuter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">{summary.NO}</span>
                    <span className="text-xs text-white/40">Refusé</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {summary.votes.map((vote) => (
                    <div key={vote.id_vote} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">
                          {vote.User ? `${vote.User.first_name} ${vote.User.last_name}` : `Jury #${vote.id_user}`}
                        </span>
                        <span className={`font-semibold ${
                          vote.note === "YES" ? "text-green-400" :
                          vote.note === "NO"  ? "text-red-400"   : "text-yellow-400"
                        }`}>
                          {vote.note}
                        </span>
                      </div>
                      {vote.comments && (
                        <p className="text-white/40 mt-1 line-clamp-2">{vote.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </InfoSection>
            )}
          </div>

          {/* ── Colonne droite : actions admin ── */}
          <div className="space-y-5">

            {/* Changer le statut */}
            <InfoSection title="Changer le statut">
              <div className="grid grid-cols-1 gap-2">
                {[
                  { s: "assigned",   label: "✓ Accepter (évaluation)",    color: "bg-blue-600"   },
                  { s: "to_discuss", label: "💬 Ouvrir le second vote",   color: "bg-yellow-600" },
                  { s: "selected",   label: "★ Promouvoir candidat",      color: "bg-purple-600" },
                  { s: "finalist",   label: "⭐ Finaliste",               color: "bg-orange-600" },
                  { s: "awarded",    label: "🏆 Primer",                  color: "bg-yellow-400 text-black" },
                  { s: "refused",    label: "✗ Refuser",                  color: "bg-red-600"    },
                  { s: "submitted",  label: "↺ Remettre en attente",      color: "bg-gray-600"   },
                ]
                  .filter((item) => item.s !== status)
                  .map((item) => (
                    <button
                      key={item.s}
                      type="button"
                      onClick={() => onStatusChange(movie.id_movie, item.s)}
                      className={`w-full px-3 py-2 ${item.color} text-white rounded-lg text-xs font-semibold hover:opacity-90 transition text-left`}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            </InfoSection>

            {/* Assigner des catégories */}
            <InfoSection title="Catégories">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id_categorie}
                    type="button"
                    onClick={() => toggleCat(cat.id_categorie)}
                    className={`text-[10px] px-2 py-1 rounded-full border transition ${
                      selectedCats.includes(cat.id_categorie)
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => onSaveCategories(movie.id_movie)}
                className="w-full px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 text-xs rounded-lg hover:bg-white/20 transition">
                Enregistrer les catégories
              </button>
            </InfoSection>

            {/* Jurys assignés (lecture seule) */}
            <InfoSection title="Jurys assignés">
              {(movie.Juries || []).length === 0 ? (
                <p className="text-xs text-white/30 mb-2">Aucun jury assigné à ce film.</p>
              ) : (
                <div className="space-y-1.5 mb-2">
                  {(movie.Juries || []).map((jury) => (
                    <div key={jury.id_user} className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                        {jury.first_name?.[0]}{jury.last_name?.[0]}
                      </div>
                      <span className="text-white/80">{jury.first_name} {jury.last_name}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-white/30 italic">
                Pour modifier les jurys assignés, utiliser la page{" "}
                <span className="text-purple-400 not-italic">Distribution & Jury</span>.
              </p>
            </InfoSection>

            {/* Commentaire administrateur */}
            <InfoSection title="Commentaire administrateur">
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                rows={3}
                placeholder="Ajouter une note interne…"
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-purple-500/50 resize-none mb-2"
              />
              <button type="button" onClick={() => onSaveComment(movie.id_movie)}
                className="w-full px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 text-xs rounded-lg hover:bg-white/20 transition">
                Enregistrer le commentaire
              </button>
            </InfoSection>

            {/* Liens */}
            <InfoSection title="Liens">
              <div className="space-y-2">
                {trailer && (
                  <a href={`${UPLOAD_BASE}/${trailer}`} target="_blank" rel="noreferrer"
                    className="block text-xs text-purple-400 hover:text-purple-300">
                    📥 Télécharger le film
                  </a>
                )}
                {movie.subtitle && (
                  <a href={`${UPLOAD_BASE}/${movie.subtitle}`} target="_blank" rel="noreferrer" download
                    className="block text-xs text-purple-400 hover:text-purple-300">
                    📄 Télécharger les sous-titres
                  </a>
                )}
                {movie.youtube_link && (
                  <a href={movie.youtube_link} target="_blank" rel="noreferrer"
                    className="block text-xs text-red-400 hover:text-red-300">
                    ▶ Ouvrir sur YouTube
                  </a>
                )}
              </div>
            </InfoSection>

            {/* Supprimer */}
            <button
              type="button"
              onClick={() => onDelete(movie.id_movie)}
              className="w-full px-3 py-2 bg-red-900/30 border border-red-600/30 text-red-400 text-xs rounded-lg hover:bg-red-900/50 transition"
            >
              🗑 Supprimer définitivement ce film
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Vérifications automatiques ── */
function AutoChecks({ movie }) {
  const checks = [
    {
      label: "Durée ≤ 120s",
      ok: !movie.duration || movie.duration <= 120,
      value: movie.duration ? `${movie.duration}s` : "non renseignée",
    },
    {
      label: "Titre présent",
      ok: Boolean(movie.title?.trim()),
      value: movie.title || "manquant",
    },
    {
      label: "Synopsis présent",
      ok: Boolean((movie.synopsis || movie.description)?.trim()),
      value: (movie.synopsis || movie.description) ? "✓" : "manquant",
    },
    {
      label: "Fichier vidéo ou lien",
      ok: Boolean(getTrailer(movie) || movie.youtube_link),
      value: getTrailer(movie) ? "Fichier uploadé" : movie.youtube_link ? "Lien YouTube" : "absent",
    },
    {
      label: "Classification IA renseignée",
      ok: Boolean(movie.production?.trim()),
      value: movie.production || "non renseignée",
    },
  ];

  const passed = checks.filter((c) => c.ok).length;

  return (
    <InfoSection title={`Vérifications automatiques (${passed}/${checks.length})`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {checks.map((check) => (
          <div key={check.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
            check.ok
              ? "bg-green-900/20 border-green-700/30 text-green-300"
              : "bg-red-900/20 border-red-700/30 text-red-300"
          }`}>
            <span>{check.ok ? "✓" : "✗"}</span>
            <span className="font-medium">{check.label}</span>
            <span className="ml-auto text-white/40 truncate max-w-[80px]">{check.value}</span>
          </div>
        ))}
      </div>
    </InfoSection>
  );
}

/* ── Sous-composants ── */
function InfoSection({ title, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <h3 className="text-[10px] uppercase text-white/40 tracking-wider font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[9px] text-white/30 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-white/80 truncate">{value}</p>
    </div>
  );
}