/**
 * JuryHome — Espace jury
 *
 * FIXES appliqués :
 *  - canReject : ne force plus le revisionnage si un vote existant est déjà enregistré
 *  - confirmedWatched reset : conservé uniquement si aucun vote n'existe pour le film
 *  - Dead code supprimé : FlatRow, MetaCard, MetaRow (jamais rendus)
 *  - Dead code supprimé : GRAIN_INSIDE = null dans MovieGrid
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "../../api/users";
import { getAssignedMovies, promoteMovieToCandidateByJury } from "../../api/videos";

import { getMyVotes, submitMyVote } from "../../api/votes";
import { VideoPreview } from "../../components/VideoPreview.jsx";
import { UPLOAD_BASE } from "../../utils/constants.js";
import { getPoster, getTrailer } from "../../utils/movieUtils.js";

/* ─── SVG icons ───────────────────────────────────────── */
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

/* ─── Grain texture ───────────────────────────────────── */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const VOTE_LABELS = {
  YES: "Validé",
  "TO DISCUSS": "À discuter",
  NO: "Rejeté",
};
const getVoteLabel = (note) => VOTE_LABELS[note] || note;

/* ─── Numéro de votation → libellé ordinal ────────────── */
function voteOrdinal(n) {
  if (n === 1) return "1ère votation";
  return `${n}ème votation`;
}

/* ─── Composant principal ─────────────────────────────── */
export default function JuryHome() {
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

  /* Map id_movie → vote */
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
    mutationFn: ({ id, comment }) => promoteMovieToCandidateByJury(id, comment),
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
    // FIX: ne reset confirmedWatched que si aucun vote n'existe encore pour ce film.
    // Si un vote existe déjà, le juré a forcément déjà confirmé avoir regardé le film —
    // l'obliger à re-cocher la case à chaque réouverture de modale est inutile et frustrant.
    if (!existingVote) {
      setConfirmedWatched(false);
    }
    setSelectedMovie(movie);
  }

  function handleVideoEnded() {
    setHasWatched(true);
  }

  /* ── Catégories de films ── */
  const firstVoteMovies = assignedMovies.filter((movie) =>
    movie.selection_status === "assigned" && !getVote(movie)
  );
  const secondVoteMovies = assignedMovies.filter((movie) =>
    movie.selection_status === "to_discuss"
  );
  const votedMovies = assignedMovies.filter((movie) => Boolean(getVote(movie)));
  const candidateMovies = assignedMovies.filter((movie) =>
    ["candidate", "selected", "finalist"].includes(movie.selection_status)
  );

  /* ── États dérivés du film sélectionné ── */
  const selectedVote     = selectedMovie ? getVote(selectedMovie) : null;
  const isSecondVoteOpen = selectedMovie?.selection_status === "to_discuss";
  const canEditVote      = selectedMovie ? !selectedVote || isSecondVoteOpen : false;
  const watchedOk  = selectedMovie ? (getTrailer(selectedMovie) ? hasWatched : confirmedWatched) : false;
  const voteAllowed =
    selectedMovie
      ? watchedOk && canEditVote
      : false;
  const canPromote = isSecondVoteOpen && watchedOk;
  // FIX: canReject ne force plus le revisionnage si un vote existe déjà.
  // Un juré qui a déjà voté (phase 1 ou 2) peut rejeter sans re-visionner.
  const canReject  = isSecondVoteOpen && (watchedOk || !!selectedVote);

  /* ── Statistiques de progression ── */
  const totalAssigned = assignedMovies.length;
  const totalVoted    = votesList.length;
  const progressPct   = totalAssigned > 0
    ? Math.round((totalVoted / totalAssigned) * 100)
    : 0;

  /* ── Chargement / erreur ── */
  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#06080d] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[#AD46FF] rounded-full animate-spin" />
          <p className="text-white/30 text-sm tracking-widest uppercase text-[11px]">Chargement</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-[#06080d] text-white flex items-center justify-center">
        <p className="text-red-400/80 text-sm">Impossible de charger votre profil. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  const user = userData;

  /* ════════════════════════════════════════════════
     RENDU
  ════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#06080d] text-white pt-28 pb-24 px-4 md:pt-32">
      <div className="max-w-6xl mx-auto">

        {/* ── Toast notifications ── */}
        {voteNotice && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 px-5 py-3 rounded-2xl text-sm backdrop-blur-xl shadow-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {voteNotice}
          </div>
        )}
        {moviesError && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-red-950/90 border border-red-500/30 text-red-300 px-5 py-3 rounded-2xl text-sm backdrop-blur-xl shadow-2xl">
            Impossible de charger les films assignés.
          </div>
        )}

        {/* ── En-tête ── */}
        <div className="mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#AD46FF]/50 mb-2 font-medium">Festival MARS AI</p>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Espace Jury</h1>
              <p className="text-white/55 mt-1 text-sm font-medium uppercase tracking-wide">
                {user.first_name} {user.last_name}
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#AD46FF]/15 text-[#AD46FF]/80 border border-[#AD46FF]/20 font-medium tracking-wide uppercase">Jury</span>
              </p>
            </div>

            {/* Progression compacte */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] tracking-widest uppercase text-white/25 mb-0.5">Progression</p>
                <p className="text-2xl font-bold text-white leading-none">
                  {totalVoted}<span className="text-white/20 text-base font-normal">/{totalAssigned}</span>
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="w-32">
                <div className="flex justify-between text-[10px] text-white/25 mb-1.5">
                  <span>films évalués</span>
                  <span className="text-white/50 font-medium">{progressPct}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A] transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>

        {/* ── Dossiers (vue accueil) ── */}
        {!activeFolder ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FolderCard
              icon={<FilmIcon />}
              label="1ère Votation"
              sublabel="Présélection"
              count={firstVoteMovies.length}
              accentColor="sky"
              onClick={() => setActiveFolder("first")}
            />
            <FolderCard
              icon={<VoteIcon />}
              label="2ème Votation"
              sublabel="Délibération"
              count={secondVoteMovies.length}
              accentColor="amber"
              onClick={() => setActiveFolder("second")}
              highlight={secondVoteMovies.length > 0}
            />
            <FolderCard
              icon={<CheckIcon />}
              label="Votes enregistrés"
              sublabel="Films évalués"
              count={votedMovies.length}
              accentColor="violet"
              onClick={() => setActiveFolder("voted")}
            />
            <FolderCard
              icon={<StarIcon />}
              label="Candidats"
              sublabel="Films promus"
              count={candidateMovies.length}
              accentColor="pink"
              onClick={() => setActiveFolder("approved")}
            />
          </div>
        ) : (

          /* ── Vue dossier ── */
          <div>
            <div className="mb-8 flex items-center justify-between">
              <button
                onClick={() => setActiveFolder(null)}
                className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-all duration-200 text-sm group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white">
                  {activeFolder === "first"    && "1ère Votation"}
                  {activeFolder === "second"   && "2ème Votation"}
                  {activeFolder === "voted"    && "Votes enregistrés"}
                  {activeFolder === "approved" && "Films candidats"}
                </h2>
                <p className="text-[11px] text-white/25 mt-0.5">
                  {activeFolder === "first"    && `${firstVoteMovies.length} film${firstVoteMovies.length !== 1 ? "s" : ""}`}
                  {activeFolder === "second"   && `${secondVoteMovies.length} film${secondVoteMovies.length !== 1 ? "s" : ""}`}
                  {activeFolder === "voted"    && `${votedMovies.length} film${votedMovies.length !== 1 ? "s" : ""}`}
                  {activeFolder === "approved" && `${candidateMovies.length} film${candidateMovies.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="w-16" />
            </div>

            {activeFolder === "first" && (
              <MovieGrid movies={firstVoteMovies} votesByMovie={votesByMovie} emptyText="Aucun film en attente de 1ère votation." onSelect={openMovieModal} />
            )}
            {activeFolder === "second" && (
              <MovieGrid movies={secondVoteMovies} votesByMovie={votesByMovie} emptyText="Aucun film en 2ème votation pour l'instant." onSelect={openMovieModal} showSecondVoteBadge />
            )}
            {activeFolder === "voted" && (
              <MovieGrid movies={votedMovies} votesByMovie={votesByMovie} emptyText="Aucun vote enregistré pour le moment." onSelect={openMovieModal} showVoteBadge />
            )}
            {activeFolder === "approved" && (
              <MovieGrid movies={candidateMovies} votesByMovie={votesByMovie} emptyText="Aucun film candidat pour le moment." onSelect={openMovieModal} showCandidateBadge />
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════
          MODALE FILM
      ════════════════════════ */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#0d0f14] border border-white/8 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl shadow-black/60 overflow-hidden">

            {/* ── Header ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-white/6">
              <div className="flex items-center gap-2.5 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{selectedMovie.title}</h3>
                {isSecondVoteOpen ? (
                  <span className="flex-shrink-0 text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">2ème Votation</span>
                ) : (
                  <span className="flex-shrink-0 text-[10px] bg-sky-500/15 text-sky-300 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">1ère Votation</span>
                )}
                {(selectedMovie.Awards || []).length > 0 && (
                  <span className="flex-shrink-0 text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/25 px-2.5 py-1 rounded-full font-medium">🏆 {(selectedMovie.Awards || []).length}</span>
                )}
                {modalNotice && (
                  <span className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full text-[10px]">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />{modalNotice}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedMovie(null)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm ml-4">✕</button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-hidden grid grid-cols-[1fr_272px] divide-x divide-white/6">

              {/* ── Col gauche : infos + vidéo ── */}
              <div className="overflow-y-auto p-4 space-y-2">

                {/* Producteur + IA côte à côte */}
                <div className="grid grid-cols-2 gap-2">
                  <ModalBlock title="Producteur">
                    <ModalRow label="Nom"    value={`${(selectedMovie.User || selectedMovie.Producer)?.first_name || ""} ${(selectedMovie.User || selectedMovie.Producer)?.last_name || ""}`.trim() || "–"} />
                    <ModalRow label="E-mail" value={(selectedMovie.User || selectedMovie.Producer)?.email || "–"} />
                    <ModalRow label="Source" value={(selectedMovie.User || selectedMovie.Producer)?.known_by_mars_ai || "–"} />
                  </ModalBlock>
                  <ModalBlock title="IA & Méthodologie">
                    <ModalRow label="Classification" value={selectedMovie.production || "–"} />
                    <ModalRow label="Méthodologie"   value={selectedMovie.workshop   || "–"} />
                    <ModalRow label="Outil IA"       value={selectedMovie.ai_tool    || "–"} />
                  </ModalBlock>
                </div>

                {/* Synopsis FR + EN côte à côte */}
                <div className="grid grid-cols-2 gap-2">
                  <ModalBlock title="Synopsis (FR)">
                    <p className="text-white/40 text-[11px] leading-relaxed line-clamp-3">{selectedMovie.synopsis || selectedMovie.description || "–"}</p>
                  </ModalBlock>
                  <ModalBlock title="Synopsis (EN)">
                    <p className="text-white/40 text-[11px] leading-relaxed line-clamp-3">{selectedMovie.synopsis_anglais || "–"}</p>
                  </ModalBlock>
                </div>

                {/* Informations film */}
                <ModalBlock title="Informations film">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <ModalRow label="Durée"       value={selectedMovie.duration ? `${selectedMovie.duration}s` : "–"} />
                    <ModalRow label="Langue"      value={selectedMovie.main_language || "–"} />
                    <ModalRow label="Nationalité" value={selectedMovie.nationality   || "–"} />
                    <ModalRow label="Statut"      value={selectedMovie.selection_status || "–"} />
                  </div>
                  <div className="mt-1 flex gap-3">
                    {selectedMovie.subtitle?.endsWith?.(".srt") && (
                      <a href={`${UPLOAD_BASE}/${selectedMovie.subtitle}`} target="_blank" rel="noreferrer" download
                        className="text-[11px] text-[#AD46FF]/70 hover:text-[#AD46FF] transition-colors font-medium">↓ Sous-titres</a>
                    )}
                    {selectedMovie.youtube_link && (
                      <a href={selectedMovie.youtube_link} target="_blank" rel="noreferrer"
                        className="text-[11px] text-[#AD46FF]/70 hover:text-[#AD46FF] transition-colors font-medium">Ouvrir sur YouTube</a>
                    )}
                  </div>
                </ModalBlock>

                {/* Vidéo */}
                <ModalBlock title="Média">
                  {(getTrailer(selectedMovie) || selectedMovie.youtube_link) ? (
                    <div className="aspect-video h-[140px]">
                      {getTrailer(selectedMovie) ? (
                        <VideoPreview
                          title={selectedMovie.title}
                          label="MarsAI Festival"
                          src={`${UPLOAD_BASE}/${getTrailer(selectedMovie)}`}
                          poster={getPoster(selectedMovie) || undefined}
                          onEnded={handleVideoEnded}
                        />
                      ) : (
                        <a href={selectedMovie.youtube_link} target="_blank" rel="noreferrer"
                          className="text-[#AD46FF] hover:text-[#F6339A] transition-colors text-xs font-medium">
                          Ouvrir la vidéo
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/20 text-xs">Aucune vidéo disponible pour ce film.</p>
                  )}
                </ModalBlock>
              </div>

              {/* ── Col droite : vote ── */}
              <div className="flex flex-col divide-y divide-white/6 overflow-y-auto">

                {/* Statut du vote actuel */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] tracking-widest uppercase text-white/25 font-medium">Votre vote</p>
                    <div className="flex items-center gap-1.5">
                      {selectedVote && (
                        <span className="text-[10px] bg-sky-500/15 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full">Voté</span>
                      )}
                      {selectedVote?.modification_count > 0 && (
                        <span className="text-[10px] bg-orange-500/15 text-orange-300 border border-orange-500/20 px-2 py-0.5 rounded-full">2ème vote</span>
                      )}
                      {isSecondVoteOpen && (
                        <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">2ème Votation ouverte</span>
                      )}
                    </div>
                  </div>

                  {selectedVote?.history?.length > 0 && (
                    <div className="space-y-2">
                      {selectedVote.history.map((entry, idx) => (
                        <div key={entry.id_vote_history || idx} className="bg-white/3 border border-white/6 rounded-xl p-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-white/30">{voteOrdinal(idx + 1)}</span>
                            <VotePill note={entry.note} />
                          </div>
                          {entry.comments && (
                            <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed">{entry.comments}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedVote && (
                    <div className="bg-white/3 border border-white/6 rounded-xl p-2">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[10px] uppercase text-white/25 tracking-widest">Vote actuel</p>
                        <VotePill note={selectedVote.note} />
                      </div>
                      {selectedVote.comments && (
                        <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2">{selectedVote.comments}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Phase 2 ── */}
                {isSecondVoteOpen ? (
                  <div className="p-4 space-y-2">
                    <p className="text-[10px] tracking-widest uppercase text-white/25 font-medium">Décision — 2ème Votation</p>

                    {getTrailer(selectedMovie) ? (
                      <p className={`text-[11px] px-2.5 py-1.5 rounded-lg border ${hasWatched ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/35"}`}>
                        {hasWatched ? "✓ Film visionné — vous pouvez vous prononcer." : "Visionnez le film en entier avant de vous prononcer."}
                      </p>
                    ) : (
                      <label className="flex items-center gap-2.5 text-xs text-white/40 cursor-pointer group">
                        <input type="checkbox" checked={confirmedWatched} onChange={(e) => setConfirmedWatched(e.target.checked)} className="accent-[#AD46FF] w-3.5 h-3.5" />
                        <span className="group-hover:text-white/60 transition-colors">Je confirme avoir visionné le film dans son intégralité.</span>
                      </label>
                    )}

                    {voteMutation.isError && (
                      <p className="text-xs text-red-400/80">{voteMutation.error?.response?.data?.error || "Erreur lors de l'enregistrement."}</p>
                    )}

                    <div className="space-y-1.5">
                      <button type="button" disabled={!canPromote || promoteMutation.isPending}
                        onClick={() => setShowPromoteModal(true)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        Promouvoir à la candidature
                      </button>
                      <button type="button" disabled={!canReject || voteMutation.isPending}
                        onClick={() => { if (window.confirm(`Rejeter "${selectedMovie.title}" en 2ème votation ?`)) { voteMutation.mutate({ id_movie: selectedMovie.id_movie, payload: { note: "NO", comments: "Rejeté en 2ème votation." } }); } }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 hover:border-red-500/25 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        {voteMutation.isPending ? "Enregistrement…" : "Rejeter ce film"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Phase 1 ── */
                  <div className="p-4 space-y-2.5">
                    <p className="text-[10px] tracking-widest uppercase text-white/25 font-medium">Émettre un vote</p>

                    {getTrailer(selectedMovie) ? (
                      <p className={`text-[11px] px-2.5 py-1.5 rounded-lg border ${hasWatched ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/35"}`}>
                        {hasWatched ? "✓ Film visionné — vous pouvez voter." : "Vous devez visionner le film en entier avant de pouvoir voter."}
                      </p>
                    ) : (
                      <label className="flex items-center gap-2.5 text-xs text-white/40 cursor-pointer group">
                        <input type="checkbox" checked={confirmedWatched} onChange={(e) => setConfirmedWatched(e.target.checked)} className="accent-[#AD46FF] w-3.5 h-3.5" />
                        <span className="group-hover:text-white/60 transition-colors">Je confirme avoir visionné le film dans son intégralité.</span>
                      </label>
                    )}

                    {!canEditVote && selectedVote && (
                      <p className="text-[11px] px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300/70 rounded-xl">
                        Vote enregistré. L'administrateur peut ouvrir la 2ème votation.
                      </p>
                    )}

                    {voteMutation.isError && (
                      <p className="text-xs text-red-400/80">{voteMutation.error?.response?.data?.error || "Erreur lors de l'enregistrement."}</p>
                    )}

                    <form onSubmit={handleVoteSubmit} className="space-y-3">
                      <div className="space-y-1.5">
                        {[
                          { value: "YES",        icon: <IconThumbUp />,   label: "Valider",    color: "emerald" },
                          { value: "TO DISCUSS", icon: <IconChat />,      label: "À discuter", color: "amber"   },
                          { value: "NO",         icon: <IconThumbDown />, label: "Rejeter",    color: "red"     },
                        ].map((opt) => {
                          const sel = voteForm.note === opt.value;
                          const cls = {
                            emerald: sel ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-white/3 border-white/8 text-white/40 hover:border-white/15 hover:text-white/70",
                            amber:   sel ? "bg-amber-500/15 border-amber-500/30 text-amber-300"       : "bg-white/3 border-white/8 text-white/40 hover:border-white/15 hover:text-white/70",
                            red:     sel ? "bg-red-500/15 border-red-500/30 text-red-300"             : "bg-white/3 border-white/8 text-white/40 hover:border-white/15 hover:text-white/70",
                          }[opt.color];
                          return (
                            <label key={opt.value} className={`flex items-center gap-3 border rounded-xl px-3 py-2 transition-all duration-200 ${!voteAllowed ? "opacity-35 cursor-not-allowed" : "cursor-pointer"} ${cls}`}>
                              <input type="radio" name="note" value={opt.value} checked={sel} onChange={handleVoteChange} required disabled={!voteAllowed} className="sr-only" />
                              <span className="flex-shrink-0">{opt.icon}</span>
                              <span className="text-xs font-medium">{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>

                      <textarea name="commentaire" value={voteForm.commentaire} onChange={handleVoteChange} rows={2}
                        disabled={!voteAllowed} placeholder="Justifiez votre décision…"
                        className="w-full bg-white/3 border border-white/8 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#AD46FF]/30 focus:bg-white/5 resize-none placeholder:text-white/15 transition-all duration-200 disabled:opacity-35"
                      />

                      <button type="submit" disabled={!voteAllowed || voteMutation.isPending}
                        className="w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 bg-gradient-to-r from-[#AD46FF]/80 to-[#F6339A]/80 hover:from-[#AD46FF] hover:to-[#F6339A] text-white disabled:opacity-30 disabled:cursor-not-allowed">
                        {voteMutation.isPending ? "Enregistrement…" : "Enregistrer le 1er vote"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════
          MODALE PROMOTION
      ════════════════════════ */}
      {showPromoteModal && selectedMovie && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#0d0f14] border border-white/10 rounded-3xl w-full max-w-md p-7 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Promouvoir à la candidature</h3>
              <p className="text-sm text-white/35">
                <span className="text-white/60">{selectedMovie.title}</span>
              </p>
            </div>
            <label className="block text-[10px] tracking-widest uppercase text-white/25 mb-2 font-medium">
              Message pour l'administrateur
              <span className="normal-case tracking-normal text-white/20 ml-1">(facultatif)</span>
            </label>
            <textarea
              value={promoteComment}
              onChange={(e) => setPromoteComment(e.target.value)}
              rows={4}
              placeholder="Expliquez pourquoi ce film mérite d'être candidat…"
              className="w-full bg-white/3 border border-white/8 text-white text-sm px-4 py-3 rounded-2xl focus:outline-none focus:border-[#AD46FF]/30 focus:bg-white/5 resize-none mb-5 placeholder:text-white/15 transition-all duration-200"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="flex-1 px-4 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:bg-white/5 hover:text-white/80 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => promoteMutation.mutate({ id: selectedMovie.id_movie, comment: promoteComment })}
                disabled={promoteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/25 text-emerald-300 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
              >
                {promoteMutation.isPending ? "En cours…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sous-composants ─────────────────────────────────── */

const ACCENT_CLASSES = {
  sky:    { border: "border-sky-500/20",    hover: "hover:border-sky-400/40",    num: "text-sky-300",    dot: "bg-sky-400"    },
  amber:  { border: "border-amber-500/20",  hover: "hover:border-amber-400/40",  num: "text-amber-300",  dot: "bg-amber-400"  },
  violet: { border: "border-violet-500/20", hover: "hover:border-violet-400/40", num: "text-violet-300", dot: "bg-violet-400" },
  pink:   { border: "border-pink-500/20",   hover: "hover:border-pink-400/40",   num: "text-pink-300",   dot: "bg-pink-400"   },
};

function FolderCard({ icon, label, sublabel, count, accentColor, onClick, highlight }) {
  const ac = ACCENT_CLASSES[accentColor] || ACCENT_CLASSES.sky;
  return (
    <button
      onClick={onClick}
      className={`group relative bg-white/3 border ${ac.border} ${ac.hover} rounded-2xl p-6 text-left transition-all duration-300 hover:bg-white/5 ${
        highlight ? "ring-1 ring-amber-500/20" : ""
      }`}
    >
      {highlight && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      )}
      <div className="mb-4 text-white/50 group-hover:text-white/80 transition-colors duration-300">
        {icon}
      </div>
      <div className={`text-3xl font-bold tabular-nums mb-1 ${ac.num}`}>{count}</div>
      <p className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">{label}</p>
      <p className="text-[11px] text-white/25 mt-0.5">{sublabel}</p>
    </button>
  );
}

function MovieGrid({ movies, votesByMovie, emptyText, onSelect, showVoteBadge, showCandidateBadge, showSecondVoteBadge }) {
  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-white/20 text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {movies.map((movie) => {
        const poster = getPoster(movie);
        const vote   = votesByMovie[String(movie.id_movie)];
        return (
          <button
            key={movie.id_movie}
            type="button"
            onClick={() => onSelect(movie)}
            className="group relative text-left focus:outline-none"
            style={{ aspectRatio: "2/3" }}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.7)] group-hover:shadow-[0_12px_40px_rgba(173,70,255,0.22)] transition-all duration-500 group-hover:-translate-y-2 cursor-pointer">

              {/* Poster image or fallback */}
              {poster ? (
                <img src={poster} alt={movie.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1025] via-[#0d0f14] to-[#1a0a20] flex items-center justify-center">
                  <span className="text-4xl opacity-20">🎬</span>
                </div>
              )}

              {/* Film grain */}
              <div className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "120px 120px" }} />

              {/* Vignettes */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

              {/* Corner marks */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-white/20" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-white/20" />
              <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-white/20" />
              <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-white/20" />

              {/* Top-left badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                {(movie.Awards || []).length > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm rounded-sm bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                    🏆
                  </span>
                )}
                {showSecondVoteBadge && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm rounded-sm bg-amber-900/70 text-amber-200 border border-amber-500/30">
                    2e
                  </span>
                )}
              </div>

              {/* Top-right badges */}
              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
                {showVoteBadge && vote && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold backdrop-blur-sm rounded-sm bg-sky-500/25 text-sky-300 border border-sky-500/30">
                    ✓
                  </span>
                )}
                {showCandidateBadge && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold backdrop-blur-sm rounded-sm bg-emerald-500/25 text-emerald-300 border border-emerald-500/30">
                    ★
                  </span>
                )}
              </div>

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
                {/* Vote pill */}
                {vote && (
                  <div className="mt-1.5">
                    <VotePill note={vote.note} tiny />
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* Pill colorée pour afficher un vote */
function VotePill({ note, tiny }) {
  const cfg = {
    YES:        { label: "Validé",     cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
    "TO DISCUSS":{ label: "À discuter", cls: "bg-amber-500/15 text-amber-300 border-amber-500/20"     },
    NO:         { label: "Rejeté",     cls: "bg-red-500/15 text-red-300 border-red-500/20"             },
  };
  const { label, cls } = cfg[note] || { label: note, cls: "bg-white/10 text-white/40 border-white/10" };
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${tiny ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"} ${cls}`}>
      {label}
    </span>
  );
}

function ModalBlock({ title, children }) {
  return (
    <div className="bg-white/3 border border-white/6 rounded-xl p-2">
      <p className="text-[9px] tracking-widest uppercase text-white/20 font-medium mb-1">{title}</p>
      {children}
    </div>
  );
}

function ModalRow({ label, value }) {
  return (
    <div className="flex gap-1.5 mb-0.5 last:mb-0">
      <span className="text-white/20 text-[11px] shrink-0">{label} :</span>
      <span className="text-white/50 text-[11px] truncate">{value}</span>
    </div>
  );
}

/* Icônes inline */
function FilmIcon({ small }) {
  return (
    <svg className={small ? "w-6 h-6" : "w-8 h-8"} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  );
}
function VoteIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
