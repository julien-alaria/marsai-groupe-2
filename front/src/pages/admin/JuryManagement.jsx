/**
 * JuryManagement.jsx — Distribution & Jury
 *
 * Source unique de vérité pour l'assignation jury ↔ film.
 * Le film modal dans Videos.jsx affiche les jurys en lecture seule uniquement.
 *
 * Workflow :
 *  1. Sélectionner un ou plusieurs films dans la liste (colonne droite)
 *  2. Cliquer sur un membre du jury (colonne gauche) → modale de confirmation
 *  3. Les films sont assignés à ce jury (status → "assigned" si "submitted")
 *
 *  Ou inversement :
 *  1. Cliquer sur un jury sans film sélectionné → voir ses films assignés
 *  2. Sélectionner des films → les retirer
 *
 * Fixes appliqués :
 *  - Suppression des imports dupliqués (useEffectReact / useStateReact)
 *  - UPLOAD_BASE centralisé (plus de hardcode localhost)
 *  - Badges statut : 7 statuts complets
 *  - Section "Charge de travail" pour visualiser la répartition
 *  - Films avec statut "submitted" également assignables
 *  - Assignation entraîne le passage automatique en "assigned"
 */

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers } from "../../api/users.js";
import {
  getVideos,
  updateMovieJuries,
  updateMovieStatus,
} from "../../api/videos.js";
import { getCategories } from "../../api/videos.js";
import { UPLOAD_BASE } from "../../utils/constants.js";

const TUTORIAL_STEPS = [
  "Tous les membres du jury sont affichés à gauche.",
  "Vous pouvez voir les détails de chaque membre : nom, rôle, contact.",
  "Les administrateurs peuvent attribuer des membres du jury aux films.",
  "Chaque membre peut être associé à un ou plusieurs films.",
  "Vous pouvez modifier les permissions des membres du jury.",
  "Les permissions déterminent quels films ils peuvent voter.",
  "Vous pouvez supprimer ou modifier les membres du jury.",
  "Toutes les modifications sont tracées.",
  "Attribuez les membres en fonction des compétences.",
  "Maintenez à jour la liste du jury.",
];

/* ─── Statuts ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  submitted: {
    label: "Soumis",
    color: "bg-gray-600/40 text-gray-300 border-gray-600/40",
  },
  assigned: {
    label: "En évaluation",
    color: "bg-blue-600/30 text-blue-300 border-blue-600/40",
  },
  to_discuss: {
    label: "À discuter",
    color: "bg-yellow-600/30 text-yellow-300 border-yellow-600/40",
  },
  candidate: {
    label: "Candidat",
    color: "bg-purple-600/30 text-purple-300 border-purple-600/40",
  },
  selected: {
    label: "Sélectionné",
    color: "bg-green-600/30 text-green-300 border-green-600/40",
  },
  finalist: {
    label: "Finaliste",
    color: "bg-orange-600/30 text-orange-300 border-orange-600/40",
  },
  refused: {
    label: "Refusé",
    color: "bg-red-600/30 text-red-300 border-red-600/40",
  },
  awarded: {
    label: "Primé 🏆",
    color: "bg-yellow-400/30 text-yellow-200 border-yellow-400/40",
  },
};

const statusCfg = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.submitted;

/* ─── Utilitaires ─────────────────────────────────────── */
const getPoster = (movie) =>
  movie.thumbnail
    ? `${UPLOAD_BASE}/${movie.thumbnail}`
    : movie.display_picture
      ? `${UPLOAD_BASE}/${movie.display_picture}`
      : movie.picture1
        ? `${UPLOAD_BASE}/${movie.picture1}`
        : null;

/* ════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════════════════════ */
export default function JuryManagement() {
  const queryClient = useQueryClient();
  const [showTutorial, setShowTutorial] = useState(false);

  /* ── États ── */
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState(null);
  const [activeJury, setActiveJury] = useState(null); // jury whose detail is open
  const [modalMode, setModalMode] = useState(null); // "assign" | "unassign"
  const [selectedToUnassign, setSelectedToUnassign] = useState([]);
  const [confirmUnassign, setConfirmUnassign] = useState(false);
  const [viewMode, setViewMode] = useState("films"); // "films" | "workload"

  /* ── Données ── */
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  const { data: videosData } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
    refetchInterval: 30_000,
  });
  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const allUsers = usersData?.data || [];
  const allMovies = videosData?.data || [];
  const categories = catsData?.data || [];
  const juryMembers = useMemo(
    () => allUsers.filter((u) => u.role === "JURY"),
    [allUsers],
  );

  /* Films éligibles à l'assignation : tous sauf refused et awarded */
  const assignableMovies = useMemo(
    () =>
      allMovies.filter(
        (m) =>
          !["refused", "awarded"].includes(m.selection_status || "submitted"),
      ),
    [allMovies],
  );

  /* Films filtrés pour la liste */
  const filteredMovies = useMemo(() => {
    return assignableMovies.filter((m) => {
      if (selectedCategory !== "all") {
        const hascat = (m.Categories || []).some(
          (c) => c.id_categorie === parseInt(selectedCategory),
        );
        if (!hascat) return false;
      }
      if (
        statusFilter !== "all" &&
        (m.selection_status || "submitted") !== statusFilter
      )
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return m.title?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [assignableMovies, selectedCategory, statusFilter, searchQuery]);

  /* Workload : nb de films assignés par jury */
  const workload = useMemo(() => {
    return juryMembers
      .map((jury) => {
        const films = allMovies.filter((m) =>
          (m.Juries || []).some((j) => j.id_user === jury.id_user),
        );
        return { jury, films, count: films.length };
      })
      .sort((a, b) => b.count - a.count);
  }, [juryMembers, allMovies]);

  /* ── Mutations ── */
  function showNotice(msg, isError = false) {
    setNotice({ msg, isError });
    setTimeout(() => setNotice(null), 3500);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["listVideos"] });
  }

  const assignMutation = useMutation({
    mutationFn: async ({ jury, movieIds }) => {
      for (const movieId of movieIds) {
        const movie = allMovies.find((m) => m.id_movie === movieId);
        const currentIds = (movie?.Juries || []).map((j) => j.id_user);
        if (!currentIds.includes(jury.id_user)) {
          await updateMovieJuries(movieId, [...currentIds, jury.id_user]);
        }
        // Passer automatiquement de "submitted" → "assigned"
        if ((movie?.selection_status || "submitted") === "submitted") {
          await updateMovieStatus(movieId, "assigned");
        }
      }
    },
    onSuccess: () => {
      invalidate();
      setSelectedMovieIds([]);
      setActiveJury(null);
      setModalMode(null);
      showNotice("Films assignés avec succès.");
    },
    onError: () => showNotice("Erreur lors de l'assignation.", true),
  });

  const unassignMutation = useMutation({
    mutationFn: async ({ jury, movieIds }) => {
      for (const movieId of movieIds) {
        const movie = allMovies.find((m) => m.id_movie === movieId);
        const currentIds = (movie?.Juries || []).map((j) => j.id_user);
        await updateMovieJuries(
          movieId,
          currentIds.filter((id) => id !== jury.id_user),
        );
      }
    },
    onSuccess: () => {
      invalidate();
      setSelectedToUnassign([]);
      setConfirmUnassign(false);
      setModalMode(null);
      setActiveJury(null);
      showNotice("Films désassignés avec succès.");
    },
    onError: () => showNotice("Erreur lors de la désassignation.", true),
  });

  /* ── Handlers ── */
  function handleJuryClick(jury) {
    setActiveJury(jury);
    if (selectedMovieIds.length > 0) {
      setModalMode("assign");
    } else {
      setSelectedToUnassign([]);
      setModalMode("unassign");
    }
  }

  function toggleMovie(id) {
    setSelectedMovieIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    if (selectedMovieIds.length === filteredMovies.length) {
      setSelectedMovieIds([]);
    } else {
      setSelectedMovieIds(filteredMovies.map((m) => m.id_movie));
    }
  }

  /* Films du jury actif (pour le modal unassign) */
  const juryFilms = useMemo(
    () =>
      activeJury
        ? allMovies.filter((m) =>
            (m.Juries || []).some((j) => j.id_user === activeJury.id_user),
          )
        : [],
    [activeJury, allMovies],
  );

  /* ════════════════════════════════════════════════════════
     RENDU
  ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] text-white pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-5 pt-6">
        {/* ── En-tête ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-white">
              Distribution &amp; Jury
            </h1>
            <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">
              Assignez les films aux membres du jury pour lancer l'évaluation
            </p>
          </div>
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

        {showTutorial && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white/90 mb-2">Tutoriel : Attribution et Gestion du Jury</h3>
                <ul className="space-y-1.5 text-xs text-white/60">
                  {TUTORIAL_STEPS.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-px flex-shrink-0">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setShowTutorial(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Notice */}
        {notice && (
          <div
            className={`px-4 py-2 rounded-lg text-xs border ${
              notice.isError
                ? "bg-red-900/30 border-red-600/40 text-red-300"
                : "bg-green-900/30 border-green-600/40 text-green-300"
            }`}
          >
            {notice.msg}
          </div>
        )}

        {/* ── Onglets vue ── */}
        <div className="flex gap-2">
          {[
            { key: "films", label: "📋 Assigner des films" },
            { key: "workload", label: "📊 Charge de travail" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                viewMode === tab.key
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════
            VUE CHARGE DE TRAVAIL
        ════════════════ */}
        {viewMode === "workload" && (
          <div className="space-y-3">
            <p className="text-xs text-white/40">
              Répartition des films assignés par membre du jury.
            </p>
            {workload.length === 0 ? (
              <p className="text-sm text-white/30 py-8 text-center">
                Aucun membre du jury enregistré.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {workload.map(({ jury, films, count }) => (
                  <div
                    key={jury.id_user}
                    className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
                  >
                    {/* Jury header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {jury.first_name?.[0]}
                        {jury.last_name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {jury.first_name} {jury.last_name}
                        </p>
                        <p className="text-[10px] text-white/40 truncate">
                          {jury.email}
                        </p>
                      </div>
                      <span className="ml-auto text-xl font-bold text-purple-400">
                        {count}
                      </span>
                    </div>

                    {/* Barre de charge */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-white/40 mb-1">
                        <span>Films assignés</span>
                        <span>
                          {count} / {assignableMovies.length}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                          style={{
                            width: assignableMovies.length
                              ? `${(count / assignableMovies.length) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>

                    {/* Films (compacts) */}
                    {films.length > 0 ? (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {films.map((m) => {
                          const cfg = statusCfg(
                            m.selection_status || "submitted",
                          );
                          return (
                            <div
                              key={m.id_movie}
                              className="flex items-center gap-2 text-[10px]"
                            >
                              <span
                                className={`px-1.5 py-0.5 rounded-full border text-[8px] ${cfg.color}`}
                              >
                                {cfg.label}
                              </span>
                              <span className="text-white/70 truncate">
                                {m.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-white/20 italic">
                        Aucun film assigné
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════
            VUE ASSIGNATION
        ════════════════ */}
        {viewMode === "films" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* ── Colonne gauche : membres du jury ── */}
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-medium text-white">
                    Membres du jury
                  </h2>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-white/50">
                    {juryMembers.length}
                  </span>
                </div>

                {selectedMovieIds.length > 0 && (
                  <div className="mb-3 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2 text-[10px] text-purple-300">
                    Cliquer sur un jury pour assigner {selectedMovieIds.length}{" "}
                    film(s) sélectionné(s)
                  </div>
                )}

                {juryMembers.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-6">
                    Aucun jury enregistré
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
                    {juryMembers.map((jury) => {
                      const assigned = allMovies.filter((m) =>
                        (m.Juries || []).some(
                          (j) => j.id_user === jury.id_user,
                        ),
                      ).length;

                      return (
                        <button
                          key={jury.id_user}
                          onClick={() => handleJuryClick(jury)}
                          className={`w-full text-left p-3 rounded-xl border transition-all group ${
                            selectedMovieIds.length > 0
                              ? "border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                              : "border-white/10 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                              {jury.first_name?.[0]}
                              {jury.last_name?.[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate group-hover:text-purple-300 transition">
                                {jury.first_name} {jury.last_name}
                              </p>
                              <p className="text-[9px] text-white/40 truncate">
                                {jury.email}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-bold flex-shrink-0 ${
                                assigned > 0
                                  ? "text-purple-400"
                                  : "text-white/20"
                              }`}
                            >
                              {assigned}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Colonne droite : films ── */}
            <div className="lg:col-span-3">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                {/* Filtres */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <h2 className="text-sm font-medium text-white mr-1">Films</h2>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-white/50 mr-2">
                    {filteredMovies.length}
                  </span>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher…"
                    className="flex-1 min-w-[150px] bg-white/5 border border-white/10 text-white px-2 py-1 text-xs rounded-lg focus:outline-none focus:border-purple-500/50 placeholder:text-white/30"
                  />

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-black/40 border border-white/10 text-white px-2 py-1 text-xs rounded-lg focus:outline-none"
                  >
                    <option value="all" className="bg-[#1a1c20]">
                      Toutes catégories
                    </option>
                    {categories.map((c) => (
                      <option
                        key={c.id_categorie}
                        value={c.id_categorie}
                        className="bg-[#1a1c20]"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-black/40 border border-white/10 text-white px-2 py-1 text-xs rounded-lg focus:outline-none"
                  >
                    <option value="all" className="bg-[#1a1c20]">
                      Tous les statuts
                    </option>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key} className="bg-[#1a1c20]">
                        {cfg.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={toggleAll}
                    className="px-3 py-1 bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg hover:bg-white/10 transition"
                  >
                    {selectedMovieIds.length === filteredMovies.length &&
                    filteredMovies.length > 0
                      ? "Désélectionner tout"
                      : "Tout sélectionner"}
                  </button>

                  {selectedMovieIds.length > 0 && (
                    <button
                      onClick={() => setSelectedMovieIds([])}
                      className="px-3 py-1 bg-red-600/20 border border-red-600/30 text-red-300 text-xs rounded-lg hover:bg-red-600/30 transition"
                    >
                      ✕ {selectedMovieIds.length} sélectionné(s)
                    </button>
                  )}
                </div>

                {/* Liste */}
                {filteredMovies.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-white/20">
                    <span className="text-4xl mb-3">🎬</span>
                    <p className="text-xs">
                      Aucun film disponible pour cette sélection.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
                    {filteredMovies.map((movie) => {
                      const poster = getPoster(movie);
                      const isSelected = selectedMovieIds.includes(
                        movie.id_movie,
                      );
                      const cfg = statusCfg(
                        movie.selection_status || "submitted",
                      );
                      const assignedJuries = movie.Juries || [];

                      return (
                        <div
                          key={movie.id_movie}
                          onClick={() => toggleMovie(movie.id_movie)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-500/10 border-purple-500/30"
                              : "bg-black/30 border-white/8 hover:bg-white/[0.04] hover:border-white/15"
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition ${
                              isSelected
                                ? "bg-purple-500 border-purple-500"
                                : "border-white/20"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Affiche */}
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                            {poster ? (
                              <img
                                src={poster}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">
                                🎬
                              </div>
                            )}
                          </div>

                          {/* Titre */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {movie.title}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {(movie.Categories || []).slice(0, 2).map((c) => (
                                <span
                                  key={c.id_categorie}
                                  className="text-[8px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full"
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Jurys assignés (avatars) */}
                          <div className="flex items-center gap-1">
                            {assignedJuries.length === 0 ? (
                              <span className="text-[10px] text-white/20 italic">
                                Aucun jury
                              </span>
                            ) : (
                              <div className="flex -space-x-1">
                                {assignedJuries.slice(0, 3).map((j) => (
                                  <div
                                    key={j.id_user}
                                    title={`${j.first_name} ${j.last_name}`}
                                    className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border border-black flex items-center justify-center text-[8px] text-white font-bold"
                                  >
                                    {j.first_name?.[0]}
                                  </div>
                                ))}
                                {assignedJuries.length > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-white/10 border border-black flex items-center justify-center text-[8px] text-white/60">
                                    +{assignedJuries.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Statut */}
                          <span
                            className={`text-[9px] px-2 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          MODALE ASSIGNATION
      ════════════════════════════════════════════════════ */}
      {modalMode === "assign" && activeJury && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            {/* Jury */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {activeJury.first_name?.[0]}
                {activeJury.last_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {activeJury.first_name} {activeJury.last_name}
                </p>
                <p className="text-[10px] text-white/40">{activeJury.email}</p>
              </div>
            </div>

            <p className="text-white/70 text-sm mb-1">
              Assigner{" "}
              <span className="text-purple-400 font-bold">
                {selectedMovieIds.length}
              </span>{" "}
              film(s) à ce membre du jury.
            </p>
            <p className="text-white/40 text-[11px] mb-5">
              Les films au statut "Soumis" passeront automatiquement en "En
              évaluation".
            </p>

            {/* Liste des films sélectionnés */}
            <div className="space-y-1 max-h-40 overflow-y-auto mb-5">
              {selectedMovieIds.map((id) => {
                const m = allMovies.find((x) => x.id_movie === id);
                return m ? (
                  <div
                    key={id}
                    className="flex items-center gap-2 text-xs text-white/70"
                  >
                    <span className="text-purple-400">▸</span>
                    <span className="truncate">{m.title}</span>
                  </div>
                ) : null;
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setModalMode(null);
                  setActiveJury(null);
                }}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg hover:bg-white/10 transition"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  assignMutation.mutate({
                    jury: activeJury,
                    movieIds: selectedMovieIds,
                  })
                }
                disabled={assignMutation.isPending}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-500 transition font-semibold disabled:opacity-50"
              >
                {assignMutation.isPending ? "En cours…" : "✓ Assigner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODALE VOIR / RETIRER FILMS D'UN JURY
      ════════════════════════════════════════════════════ */}
      {modalMode === "unassign" && activeJury && !confirmUnassign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {activeJury.first_name?.[0]}
                  {activeJury.last_name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {activeJury.first_name} {activeJury.last_name}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {juryFilms.length} film(s) assigné(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalMode(null);
                  setActiveJury(null);
                }}
                className="text-white/40 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {juryFilms.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">
                  Aucun film assigné à ce membre du jury.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-white/40">
                      Sélectionner des films pour les retirer
                    </p>
                    <button
                      onClick={() => {
                        if (selectedToUnassign.length === juryFilms.length) {
                          setSelectedToUnassign([]);
                        } else {
                          setSelectedToUnassign(
                            juryFilms.map((m) => m.id_movie),
                          );
                        }
                      }}
                      className="text-[10px] text-purple-400 hover:text-purple-300 transition"
                    >
                      {selectedToUnassign.length === juryFilms.length
                        ? "Désélectionner tout"
                        : "Tout sélectionner"}
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto mb-4">
                    {juryFilms.map((movie) => {
                      const poster = getPoster(movie);
                      const isSel = selectedToUnassign.includes(movie.id_movie);
                      const cfg = statusCfg(
                        movie.selection_status || "submitted",
                      );
                      return (
                        <div
                          key={movie.id_movie}
                          onClick={() =>
                            setSelectedToUnassign((prev) =>
                              prev.includes(movie.id_movie)
                                ? prev.filter((x) => x !== movie.id_movie)
                                : [...prev, movie.id_movie],
                            )
                          }
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                            isSel
                              ? "bg-red-500/10 border-red-500/30"
                              : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                              isSel
                                ? "bg-red-500 border-red-500"
                                : "border-white/20"
                            }`}
                          >
                            {isSel && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          {poster && (
                            <img
                              src={poster}
                              alt={movie.title}
                              className="w-7 h-7 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <span className="flex-1 text-xs text-white truncate">
                            {movie.title}
                          </span>
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded-full border ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setModalMode(null);
                        setActiveJury(null);
                        setSelectedToUnassign([]);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg hover:bg-white/10 transition"
                    >
                      Fermer
                    </button>
                    <button
                      disabled={selectedToUnassign.length === 0}
                      onClick={() => setConfirmUnassign(true)}
                      className="flex-1 px-3 py-2 bg-red-600/80 text-white text-xs rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Retirer{" "}
                      {selectedToUnassign.length > 0
                        ? `(${selectedToUnassign.length})`
                        : ""}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODALE CONFIRMATION RETRAIT
      ════════════════════════════════════════════════════ */}
      {confirmUnassign && activeJury && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">
              Confirmer le retrait
            </h3>
            <p className="text-xs text-white/60 mb-5">
              Retirer{" "}
              <span className="text-white font-semibold">
                {selectedToUnassign.length}
              </span>{" "}
              film(s) de{" "}
              <span className="text-white font-semibold">
                {activeJury.first_name} {activeJury.last_name}
              </span>{" "}
              ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmUnassign(false)}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg hover:bg-white/10 transition"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  unassignMutation.mutate({
                    jury: activeJury,
                    movieIds: selectedToUnassign,
                  })
                }
                disabled={unassignMutation.isPending}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-500 transition font-semibold disabled:opacity-50"
              >
                {unassignMutation.isPending ? "En cours…" : "Oui, retirer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}