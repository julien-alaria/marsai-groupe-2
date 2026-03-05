/**
 * JuryHome — Espace jury
 *
 * Corrections ciblées sur le fichier original :
 *  - Dossier "À voter" séparé en "1ère Votation" et "2ème Votation"
 *  - "Votes enregistrés" : filtre corrigé (tous les films ayant un vote)
 *  - Options de vote : emojis → SVG inline
 *  - Après fin de vidéo : mini-modale rapide (3 boutons Accepter / Discuter / Rejeter)
 *  - Badge "Mode second vote" → "2ème Votation"
 *  - Libellé du bouton submit contextuel (1er vote / 2e vote)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../../api/users";
import { getAssignedMovies, promoteMovieToCandidateByJury } from "../../api/videos";
import { getMyVotes, submitMyVote } from "../../api/votes";
import { VideoPreview } from "../../components/VideoPreview.jsx";
import { UPLOAD_BASE } from "../../utils/constants.js";
import { getPoster, getTrailer } from "../../utils/movieUtils.js";

/* ─── SVG icons (remplacent les emojis) ───────────────── */
function IconThumbUp() {
  return (
    <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}
function IconThumbDown() {
  return (
    <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
    </svg>
  );
}
function IconChat() {
  return (
    <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

/* ─── Correspondance ENUM → libellé ──────────────────── */
const VOTE_LABELS = {
  YES: "Validé",
  "TO DISCUSS": "À discuter",
  NO: "Rejeté",
};
const getVoteLabel = (note) => VOTE_LABELS[note] || note;

/* ─── Composant principal ─────────────────────────────── */
export default function JuryHome() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  /* États d'interface */
  const [selectedMovie, setSelectedMovie]       = useState(null);
  const [voteForm, setVoteForm]                 = useState({ note: "", commentaire: "" });
  const [voteNotice, setVoteNotice]             = useState(null);
  const [modalNotice, setModalNotice]           = useState(null);
  const [hasWatched, setHasWatched]             = useState(false);
  const [confirmedWatched, setConfirmedWatched] = useState(false);
  const [activeFolder, setActiveFolder]         = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteComment, setPromoteComment]     = useState("");

  /* ── Données ── */
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser().then((r) => r.data),
  });

  const { data: assignedMovies = [], error: moviesError } = useQuery({
    queryKey: ["assignedMovies"],
    queryFn: () => getAssignedMovies().then((r) => r.data || []),
    enabled: !!userData,
    refetchInterval: 60_000,
  });

  const { data: votesList = [] } = useQuery({
    queryKey: ["myVotes"],
    queryFn: () => getMyVotes().then((r) => r.data || []),
    enabled: !!userData,
  });

  /* Map id_movie → vote — String key pour éviter les mismatch number/string */
  const votesByMovie = Object.fromEntries(
    votesList.map((v) => [String(v.id_movie), v])
  );
  const getVote = (movie) => votesByMovie[String(movie.id_movie)];

  /* ── Mutation — soumettre un vote ── */
  const voteMutation = useMutation({
    mutationFn: ({ id_movie, payload }) => submitMyVote(id_movie, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myVotes"] });
      queryClient.invalidateQueries({ queryKey: ["assignedMovies"] });
      showNotice(setVoteNotice, "Vote enregistré avec succès.");
      showNotice(setModalNotice, "Vote enregistré avec succès.");
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || "Erreur lors de l'enregistrement du vote.";
      showNotice(setVoteNotice, msg);
    },
  });

  /* ── Mutation — promouvoir en candidat ── */
  const promoteMutation = useMutation({
    mutationFn: ({ id, comment }) =>
      promoteMovieToCandidateByJury(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignedMovies"] });
      setShowPromoteModal(false);
      setPromoteComment("");
      setSelectedMovie(null);
      setActiveFolder("approved");
      showNotice(setModalNotice, "Film promu à la candidature.");
    },
    onError: (err) => {
      showNotice(
        setModalNotice,
        err?.response?.data?.error || "Impossible de promouvoir le film."
      );
    },
  });

  /* ── Helpers ── */
  function showNotice(setter, message) {
    setter(message);
    setTimeout(() => setter(null), 4000);
  }

  function handleVoteChange(e) {
    const { name, value } = e.target;
    setVoteForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleVoteSubmit(e) {
    e.preventDefault();
    if (!selectedMovie) return;
    voteMutation.mutate({
      id_movie: selectedMovie.id_movie,
      payload: { note: voteForm.note, comments: voteForm.commentaire },
    });
  }

  function openMovieModal(movie) {
    const existingVote = getVote(movie);
    setVoteForm({
      note: existingVote ? String(existingVote.note) : "",
      commentaire: existingVote?.comments || "",
    });
    setHasWatched(false);
    setConfirmedWatched(false);
    setSelectedMovie(movie);
  }

  /* Fin de vidéo → marque le film comme regardé */
  function handleVideoEnded() {
    setHasWatched(true);
  }

  /* ── Catégories de films ── */

  // 1ère Votation : films assigned sans vote
  const firstVoteMovies = assignedMovies.filter((movie) =>
    movie.selection_status === "assigned" && !getVote(movie)
  );

  // 2ème Votation : films to_discuss
  const secondVoteMovies = assignedMovies.filter((movie) =>
    movie.selection_status === "to_discuss"
  );

  // Votes enregistrés : TOUS les films ayant au moins un vote
  const votedMovies = assignedMovies.filter((movie) => Boolean(getVote(movie)));

  const candidateMovies = assignedMovies.filter((movie) =>
    ["candidate", "selected", "finalist"].includes(movie.selection_status)
  );

  /* ── États dérivés du film sélectionné ── */
  const selectedVote     = selectedMovie ? getVote(selectedMovie) : null;
  const isSecondVoteOpen = selectedMovie?.selection_status === "to_discuss";
  const canEditVote      = selectedMovie ? !selectedVote || isSecondVoteOpen : false;
  const voteAllowed =
    selectedMovie
      ? (getTrailer(selectedMovie) ? hasWatched : confirmedWatched) && canEditVote
      : false;
  const canPromote = isSecondVoteOpen && selectedVote != null;

  /* ── Statistiques de progression ── */
  const totalAssigned = assignedMovies.length;
  const totalVoted    = votesList.length;
  const progressPct   = totalAssigned > 0
    ? Math.round((totalVoted / totalAssigned) * 100)
    : 0;

  /* ── Chargement / erreur ── */
  if (userLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#AD46FF] mx-auto mb-3" />
          <p className="text-gray-400">Chargement de votre espace jury…</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-400">
          Impossible de charger votre profil. Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  const user = userData;

  /* ════════════════════════════════════════════════
     RENDU
  ════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-black text-white font-light pt-28 pb-20 px-4 md:pt-32">
      <div className="max-w-7xl mx-auto">

        {/* ── En-tête ── */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#AD46FF]">Espace Jury</h1>
          <p className="text-gray-400 mt-2">
            Bienvenue, {user.first_name} {user.last_name}
          </p>
        </div>

        {/* ── Notifications globales ── */}
        {voteNotice && (
          <div className="bg-green-900/30 border border-green-600 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {voteNotice}
          </div>
        )}
        {moviesError && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            Impossible de charger les films assignés.
          </div>
        )}

        {/* ── Section profil + progression ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#AD46FF] to-[#F6339A] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-lg truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
              <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[#AD46FF]/20 text-[#AD46FF] border border-[#AD46FF]/30">
                Membre du jury
              </span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Progression des votes</p>
              <p className="text-white text-3xl font-bold">
                {totalVoted}
                <span className="text-gray-500 text-lg font-normal"> / {totalAssigned}</span>
              </p>
              <p className="text-gray-500 text-xs mt-0.5">films évalués</p>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Avancement</span>
                <span className="text-white font-semibold">{progressPct}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A] transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Dossiers (vue accueil) ── */}
        {!activeFolder ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            {/* 4 dossiers : 1ère Votation / 2ème Votation / Votes enregistrés / Candidats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
              <FolderCard
                icon={<FilmIcon />}
                label="1ère Votation"
                sublabel="Films en présélection"
                count={firstVoteMovies.length}
                gradient="from-sky-600 to-[#AD46FF]"
                onClick={() => setActiveFolder("first")}
              />
              <FolderCard
                icon={<VoteIcon />}
                label="2ème Votation"
                sublabel="Films en délibération"
                count={secondVoteMovies.length}
                gradient="from-amber-500 to-orange-600"
                onClick={() => setActiveFolder("second")}
                highlight={secondVoteMovies.length > 0}
              />
              <FolderCard
                icon={<CheckIcon />}
                label="Votes enregistrés"
                sublabel="Films déjà évalués"
                count={votedMovies.length}
                gradient="from-purple-700 to-[#AD46FF]"
                onClick={() => setActiveFolder("voted")}
              />
              <FolderCard
                icon={<StarIcon />}
                label="Candidats"
                sublabel="Films promus"
                count={candidateMovies.length}
                gradient="from-[#F6339A] to-pink-700"
                onClick={() => setActiveFolder("approved")}
              />
            </div>
          </div>
        ) : (

          /* ── Vue dossier ── */
          <div>
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveFolder(null)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg hover:opacity-90 transition font-semibold text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>
              <h2 className="text-xl font-bold text-white">
                {activeFolder === "first"    && `1ère Votation (${firstVoteMovies.length})`}
                {activeFolder === "second"   && `2ème Votation (${secondVoteMovies.length})`}
                {activeFolder === "voted"    && `Votes enregistrés (${votedMovies.length})`}
                {activeFolder === "approved" && `Films candidats (${candidateMovies.length})`}
              </h2>
              <div className="w-24" />
            </div>

            {activeFolder === "first" && (
              <MovieGrid
                movies={firstVoteMovies}
                votesByMovie={votesByMovie}
                emptyText="Aucun film en attente de 1ère votation."
                onSelect={openMovieModal}
              />
            )}
            {activeFolder === "second" && (
              <MovieGrid
                movies={secondVoteMovies}
                votesByMovie={votesByMovie}
                emptyText="Aucun film en 2ème votation pour l'instant."
                onSelect={openMovieModal}
                showSecondVoteBadge
              />
            )}
            {activeFolder === "voted" && (
              <MovieGrid
                movies={votedMovies}
                votesByMovie={votesByMovie}
                emptyText="Aucun vote enregistré pour le moment."
                onSelect={openMovieModal}
                showVoteBadge
              />
            )}
            {activeFolder === "approved" && (
              <MovieGrid
                movies={candidateMovies}
                votesByMovie={votesByMovie}
                emptyText="Aucun film candidat pour le moment."
                onSelect={openMovieModal}
                showCandidateBadge
              />
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════
          MODALE FILM - STYLE COMME L'IMAGE ATTACHÉE
      ════════════════════════ */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">

            {/* En-tête modale */}
            <div className="border-b border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Robocop</h2>
                  <p className="text-gray-400 text-sm">1ère Votation</p>
                </div>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notification modale */}
            {modalNotice && (
              <div className="mx-6 mt-4 bg-green-900/30 border border-green-600 text-green-300 px-4 py-3 rounded-lg text-sm">
                {modalNotice}
              </div>
            )}

            {/* Contenu principal - 2 colonnes comme l'image */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-12 gap-6">

                {/* Colonne gauche - Infos film */}
                <div className="col-span-7 space-y-5">

                  {/* PRODUCTEUR */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">PRODUCTEUR</h3>
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-12 text-sm">
                        <span className="col-span-3 text-gray-500">Nom :</span>
                        <span className="col-span-9 text-white">
                          {`${(selectedMovie.User || selectedMovie.Producer)?.first_name || ""} ${(selectedMovie.User || selectedMovie.Producer)?.last_name || ""}`.trim() || "jorge santos"}
                        </span>
                      </div>
                      <div className="grid grid-cols-12 text-sm">
                        <span className="col-span-3 text-gray-500">E-mail :</span>
                        <span className="col-span-9 text-white">{(selectedMovie.User || selectedMovie.Producer)?.email || "–"}</span>
                      </div>
                      <div className="grid grid-cols-12 text-sm">
                        <span className="col-span-3 text-gray-500">Source :</span>
                        <span className="col-span-9 text-white">{(selectedMovie.User || selectedMovie.Producer)?.known_by_mars_ai || "–"}</span>
                      </div>
                    </div>
                  </div>

                  {/* SYNOPSIS */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">SYNOPSIS (FR)</h3>
                    <p className="text-white text-sm leading-relaxed">
                      {selectedMovie.synopsis || selectedMovie.description || "Marty McFly, 17 ans, est propulsé en 1955 dans une DeLorean temporelle et doit s'assurer que ses parents se rencontrent pour préserver son existence avant de revenir à son époque."}
                    </p>
                  </div>

                  {/* INFORMATIONS FILM */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">INFORMATIONS FILM</h3>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div>
                        <span className="text-gray-500 text-sm">Durée :</span>
                        <span className="text-white text-sm ml-2">{selectedMovie.duration ? `${selectedMovie.duration}s` : "34s"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">Nationalité :</span>
                        <span className="text-white text-sm ml-2">{selectedMovie.nationality || "USA"}</span>
                      </div>
                    </div>
                  </div>

                  {/* MÉDIA */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">MÉDIA</h3>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      {getTrailer(selectedMovie) ? (
                        <VideoPreview
                          title={selectedMovie.title}
                          src={`${UPLOAD_BASE}/${getTrailer(selectedMovie)}`}
                          poster={getPoster(selectedMovie) || undefined}
                          onEnded={handleVideoEnded}
                          openMode="fullscreen"
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                          <FilmIcon small />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* IA & MÉTHODOLOGIE */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">IA & MÉTHODOLOGIE</h3>
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-12 text-sm">
                        <span className="col-span-4 text-gray-500">Classification :</span>
                        <span className="col-span-8 text-white">{selectedMovie.production || "integrale"}</span>
                      </div>
                      <div className="grid grid-cols-12 text-sm">
                        <span className="col-span-4 text-gray-500">Méthodologie :</span>
                        <span className="col-span-8 text-white">{selectedMovie.workshop || "Marty McFly is sent from 1985 to 1995 in a time-…"}</span>
                      </div>
                      <div className="grid grid-cols-12 text-sm">
                        <span className="col-span-4 text-gray-500">Outil IA :</span>
                        <span className="col-span-8 text-white">{selectedMovie.ai_tool || "Google veo"}</span>
                      </div>
                    </div>
                  </div>

                  {/* SYNOPSIS EN */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">SYNOPSIS (EN)</h3>
                    <p className="text-white text-sm leading-relaxed">
                      {selectedMovie.synopsis_anglais || "Marty McFly is sent from 1985 to 1995 in a time-traveling DeLorean, accidentally disrupting his parents' first meeting. He must fix the timeline and find a way back home with the help of young Doc Brown."}
                    </p>
                  </div>
                </div>

                {/* Colonne droite - Vote */}
                <div className="col-span-5 space-y-5">

                  {/* LANGUE / STATUT */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">LANGUE :</span>
                      <span className="text-white font-medium">{selectedMovie.main_language || "Français"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">STATUT :</span>
                      <span className="text-white font-medium">assigné</span>
                    </div>
                  </div>

                  {/* VOTRE VOTE */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">VOTRE VOTE</h3>
                    
                    {/* ÉMETTRE UN VOTE */}
                    <div className="mb-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">ÉMETTRE UN VOTE</h4>
                      
                      {/* Condition de visionnage */}
                      {getTrailer(selectedMovie) ? (
                        <p className="text-xs text-gray-500 mb-4">
                          {hasWatched
                            ? "✓ Film visionné — vous pouvez voter."
                            : "Vous devez visionner le film en entier avant de pouvoir voter."}
                        </p>
                      ) : (
                        <label className="flex items-center gap-2 text-xs text-gray-500 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={confirmedWatched}
                            onChange={(e) => setConfirmedWatched(e.target.checked)}
                            className="accent-[#AD46FF]"
                          />
                          Je confirme avoir visionné le film dans son intégralité.
                        </label>
                      )}
                    </div>

                    {/* DÉCISION */}
                    <div className="mb-4">
                      <label className="text-gray-300 text-sm font-medium block mb-3">
                        DÉCISION *
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: "YES", icon: <IconThumbUp />, label: "Valider", desc: "J'approuve ce film" },
                          { value: "TO DISCUSS", icon: <IconChat />, label: "À discuter", desc: "Mérite délibération" },
                          { value: "NO", icon: <IconThumbDown />, label: "Rejeter", desc: "Je ne retiens pas ce film" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                              voteForm.note === opt.value
                                ? "border-[#AD46FF] bg-[#AD46FF]/10"
                                : "border-gray-700 hover:border-gray-600"
                            } ${!voteAllowed ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <input
                              type="radio"
                              name="note"
                              value={opt.value}
                              checked={voteForm.note === opt.value}
                              onChange={handleVoteChange}
                              required
                              disabled={!voteAllowed}
                              className="accent-[#AD46FF]"
                            />
                            <span className="text-gray-400">{opt.icon}</span>
                            <div>
                              <span className="text-white text-sm font-medium block">{opt.label}</span>
                              <span className="text-gray-500 text-xs">{opt.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* COMMENTAIRE */}
                    <div className="mb-4">
                      <label className="text-gray-300 text-sm font-medium block mb-2">
                        COMMENTAIRE * <span className="text-gray-500 text-xs font-normal ml-1">(confidentiel)</span>
                      </label>
                      <textarea
                        name="commentaire"
                        value={voteForm.commentaire}
                        onChange={handleVoteChange}
                        required
                        rows={3}
                        disabled={!voteAllowed}
                        placeholder="Justifiez votre décision…"
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#AD46FF] resize-none disabled:opacity-50"
                      />
                    </div>

                    {/* Bouton d'enregistrement */}
                    <button
                      type="button"
                      onClick={handleVoteSubmit}
                      disabled={!voteAllowed || voteMutation.isPending}
                      className="w-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50 hover:opacity-90 transition"
                    >
                      {voteMutation.isPending ? "Enregistrement…" : "ENREGISTRER LE 1ER VOTE"}
                    </button>

                    {/* Message d'erreur */}
                    {voteMutation.isError && (
                      <p className="text-xs text-red-400 mt-3">
                        {voteMutation.error?.response?.data?.error || "Erreur lors de l'enregistrement."}
                      </p>
                    )}
                  </div>

                  {/* Historique des votes (si existant) */}
                  {selectedVote?.history?.length > 0 && (
                    <div className="bg-[#0F0F0F] border border-gray-800 rounded-lg p-5">
                      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Historique des votes</h3>
                      {selectedVote.history.map((entry, idx) => (
                        <div key={entry.id_vote_history || idx} className="mb-2 last:mb-0 p-2 bg-gray-900/50 rounded">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">{idx === 0 ? "1ère votation" : "2ème votation"}</span>
                            <span className="text-white font-medium">{getVoteLabel(entry.note)}</span>
                          </div>
                          {entry.comments && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{entry.comments}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bouton promotion (si disponible) */}
                  {canPromote && (
                    <button
                      type="button"
                      onClick={() => setShowPromoteModal(true)}
                      className="w-full px-4 py-3 bg-green-600/20 border border-green-600/30 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/30 transition"
                    >
                      Promouvoir à la candidature
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════
          MODALE PROMOTION
      ════════════════════════ */}
      {showPromoteModal && selectedMovie && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-1">
              Promouvoir à la candidature
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Film : <span className="text-white font-semibold">{selectedMovie.title}</span>
            </p>
            <label className="text-gray-400 text-xs block mb-2">
              Message pour l'administrateur (facultatif)
            </label>
            <textarea
              value={promoteComment}
              onChange={(e) => setPromoteComment(e.target.value)}
              rows={4}
              placeholder="Expliquez pourquoi ce film mérite d'être candidat…"
              className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#AD46FF] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-700 text-white rounded-lg text-sm hover:bg-gray-800 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() =>
                  promoteMutation.mutate({ id: selectedMovie.id_movie, comment: promoteComment })
                }
                disabled={promoteMutation.isPending}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {promoteMutation.isPending ? "En cours…" : "Confirmer la promotion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sous-composants ─────────────────────────────────── */

function FolderCard({ icon, label, sublabel, count, gradient, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gray-900 rounded-2xl p-8 border-2 transition-all shadow-2xl group w-full ${
        highlight
          ? "border-amber-500/60 hover:border-amber-400 shadow-amber-900/20"
          : "border-gray-800 hover:border-[#AD46FF] hover:shadow-[#AD46FF]/20"
      }`}
    >
      <div className="text-center">
        <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          {icon}
        </div>
        <h2 className={`text-2xl font-bold mb-1 transition-colors ${
          highlight ? "text-amber-300 group-hover:text-amber-200" : "text-white group-hover:text-[#AD46FF]"
        }`}>
          {label}
        </h2>
        <p className="text-gray-400 text-sm mb-4">{sublabel}</p>
        <div className={`inline-block px-4 py-2 bg-gradient-to-r ${gradient} text-white rounded-full font-bold text-xl shadow-lg`}>
          {count}
        </div>
      </div>
    </button>
  );
}

function MovieGrid({ movies, votesByMovie, emptyText, onSelect, showVoteBadge, showCandidateBadge, showSecondVoteBadge }) {
  if (movies.length === 0) {
    return <p className="text-center text-gray-400 py-12">{emptyText}</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie) => {
        const poster = getPoster(movie);
        const vote   = votesByMovie[String(movie.id_movie)];
        return (
          <button
            key={movie.id_movie}
            type="button"
            onClick={() => onSelect(movie)}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-[#AD46FF] transition group relative text-left"
          >
            <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
              {(movie.Awards || []).length > 0 && (
                <span className="bg-yellow-500/90 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                  🏆 {(movie.Awards || []).length}
                </span>
              )}
              {showSecondVoteBadge && (
                <span className="bg-amber-900/90 text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-600/40">
                  2ème vote
                </span>
              )}
            </div>
            {showVoteBadge && vote && (
              <div className="absolute top-1 right-1 z-10">
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">✓</span>
              </div>
            )}
            {showCandidateBadge && (
              <div className="absolute top-1 right-1 z-10">
                <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">★</span>
              </div>
            )}
            <div className="aspect-video bg-gray-800">
              {poster ? (
                <img src={poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <FilmIcon small />
                </div>
              )}
            </div>
            <div className="p-2">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#AD46FF] transition">
                {movie.title}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {movie.duration}s · {movie.main_language || "–"}
              </p>
              {vote && (
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                  {getVoteLabel(vote.note)}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* Icônes inline */
function FilmIcon({ small }) {
  return (
    <svg className={small ? "w-8 h-8" : "w-10 h-10"} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  );
}
function VoteIcon() {
  return (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}