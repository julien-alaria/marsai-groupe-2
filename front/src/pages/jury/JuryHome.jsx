/**
 * Composant JuryHome (Accueil Jury)
 * Page d'accueil pour les membres du jury
 * Permet de consulter et modifier le profil
 * @returns {JSX.Element} La page d'accueil du jury
 */
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/users";
import { getAssignedMovies, promoteMovieToCandidateByJury } from "../../api/videos";
import { getMyVotes, submitMyVote } from "../../api/votes";
import { VideoPreview } from "../../components/VideoPreview.jsx";

export default function JuryHome() {
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedMovies, setAssignedMovies] = useState([]);
  const [moviesError, setMoviesError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [votesByMovie, setVotesByMovie] = useState({});
  const [voteForm, setVoteForm] = useState({ note: "", commentaire: "" });
  const [voteFeedback, setVoteFeedback] = useState(null);
  const [voteNotice, setVoteNotice] = useState(null);
  const [modalNotice, setModalNotice] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const [confirmedWatched, setConfirmedWatched] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null); // null, 'assigned', 'voted', 'approved'
  const [archivedMovieIds, setArchivedMovieIds] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("juryArchivedMovies") || "[]");
      if (!Array.isArray(raw)) return [];
      const normalized = raw
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
      return Array.from(new Set(normalized));
    } catch (err) {
      return [];
    }
  });
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

  useEffect(() => {
    localStorage.setItem("juryArchivedMovies", JSON.stringify(archivedMovieIds));
  }, [archivedMovieIds]);

  useEffect(() => {
    if (!voteNotice) return;
    const timeoutId = setTimeout(() => setVoteNotice(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [voteNotice]);

  useEffect(() => {
    if (!modalNotice) return;
    const timeoutId = setTimeout(() => setModalNotice(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [modalNotice]);

  useEffect(() => {
    if (selectedMovie) {
      const existingVote = votesByMovie[selectedMovie.id_movie];
      if (existingVote) {
        setVoteForm({
          note: String(existingVote.note),
          commentaire: existingVote.commentaire || ""
        });
      } else {
        setVoteForm({ note: "", commentaire: "" });
      }
      setHasWatched(false);
      setConfirmedWatched(false);
      setVoteFeedback(null);
    }
  }, [selectedMovie, votesByMovie]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError(t("jury.home.errors.notAuthenticated"));

      setLoading(false);
      return;
    }
    getCurrentUser()
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(t("jury.home.errors.userLoad"));

        setLoading(false);
      });

    getAssignedMovies()
      .then((res) => {
        setAssignedMovies(res.data || []);
      })
      .catch(() => {
        setMoviesError(t("jury.home.errors.moviesLoad"));

      });

    getMyVotes()
      .then((res) => {
        const mapped = (res.data || []).reduce((acc, vote) => {
          acc[vote.id_movie] = vote;
          return acc;
        }, {});
        setVotesByMovie(mapped);
      })
      .catch(() => {
        setVoteFeedback(t("jury.home.errors.votesLoad"));

      });
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t("jury.home.loading")}</div>;
  if (error) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{error}</div>;
  if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{t("jury.home.errors.userNotFound")}</div>


  function handleVoteChange(e) {
    const { name, value } = e.target;
    setVoteForm((prev) => ({ ...prev, [name]: value }));
  }

  async function refreshAssignedMovies() {
    try {
      const res = await getAssignedMovies();
      setAssignedMovies(res.data || []);
    } catch {
      // ignore refresh errors
    }
  }

  async function handleVoteSubmit(e) {
    e.preventDefault();
    if (!selectedMovie) return;
    setVoteFeedback(null);
    setVoteLoading(true);
    try {
      const existingVote = votesByMovie[selectedMovie.id_movie];
        const isSecondVoteOpen = selectedMovie.selection_status === "to_discuss";
      if (existingVote && !isSecondVoteOpen) {
        setVoteFeedback("Le second vote n'est pas encore ouvert pour ce film.");
        return;
      }
      // Invia il campo corretto 'comments' invece di 'commentaire'
      const { note, commentaire, ...rest } = voteForm;
      const res = await submitMyVote(selectedMovie.id_movie, { note, comments: commentaire, ...rest });
      const vote = res.data?.vote;
      if (vote) {
        setArchivedMovieIds((prev) => (prev.includes(vote.id_movie) ? prev : [...prev, vote.id_movie]));
      }
      const refreshedVotes = await getMyVotes();
      const mapped = (refreshedVotes.data || []).reduce((acc, item) => {
        acc[item.id_movie] = item;
        return acc;
      }, {});
      setVotesByMovie(mapped);
      setVoteFeedback("Vote enregistré.");
      setVoteNotice("Vote enregistré avec succès.");
      setModalNotice("Vote enregistré avec succès.");
      await refreshAssignedMovies();
    } catch (err) {
      const message = err?.response?.data?.error || "Erreur lors de l'enregistrement du vote.";
      setVoteFeedback(message);
    } finally {
      setVoteLoading(false);
    }
  }

  async function handlePromoteCandidate() {
    if (!selectedMovie) return;
    try {
      const message = window.prompt("Message pour l'admin (optionnel):", "");
      await promoteMovieToCandidateByJury(selectedMovie.id_movie, message || "");
      setModalNotice("Film proposé à la nomination. En attente de validation admin.");
      await refreshAssignedMovies();
      // Aggiorna anche la lista dei film candidati
      setActiveFolder('approved');
      setSelectedMovie(null);
    } catch (err) {
      const message = err?.response?.data?.error || "Impossible de promouvoir le film.";
      setVoteFeedback(message);
    }
  }

  const selectedVote = selectedMovie ? votesByMovie[selectedMovie.id_movie] : null;
  const isSecondVoteOpen = selectedMovie
    ? selectedMovie.selection_status === "to_discuss"
    : false;
  const canEditVote = selectedMovie ? !selectedVote || isSecondVoteOpen : false;
  const voteAllowed = selectedMovie
    ? (getTrailer(selectedMovie) ? hasWatched : confirmedWatched) && canEditVote
    : false;
  const canPromoteCandidate = isSecondVoteOpen && selectedVote && (selectedVote.modification_count || 0) > 0;

  const voteLabels = {
    1: "Refusé",
    2: "À discuter",
    3: "Validé"
  };
  const getVoteLabel = (note) => voteLabels[Number(note)] || note;

  const awaitingVoteMovies = assignedMovies.filter((movie) => {
    const status = movie.selection_status || "submitted";
    const vote = votesByMovie[movie.id_movie];
    if (status === "assigned") return !vote;
    if (status === "to_discuss") return !vote || (vote?.modification_count || 0) === 0;
    return false;
  });

  const votedMovies = assignedMovies.filter((movie) => {
    const status = movie.selection_status || "submitted";
    const vote = votesByMovie[movie.id_movie];
    if (status === "assigned") return Boolean(vote);
    if (status === "to_discuss") return Boolean(vote) && (vote.modification_count || 0) > 0;
    return false;
  });

  const candidateMovies = assignedMovies.filter((movie) => (
    ["candidate", "selected", "finalist"].includes(movie.selection_status)
  ));

  return (
    <div className="min-h-screen bg-black text-white font-light pt-28 pb-20 px-4 md:pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#AD46FF]">Espace Jury</h1>
          <p className="text-gray-400 mt-2">Bienvenue {user.first_name} {user.last_name}</p>
        </div>

        {voteNotice && (
          <div className="bg-green-900/30 border border-green-600 text-green-300 px-4 py-3 rounded-lg mb-6">
            {voteNotice}
          </div>
        )}

        {moviesError && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-6">
            {moviesError}
          </div>
        )}

        {!activeFolder ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
            {/* Cartella 1: Films à voter */}
            <button
              onClick={() => setActiveFolder('assigned')}
              className="bg-gray-900 rounded-2xl p-8 border-2 border-gray-800 hover:border-[#AD46FF] transition-all shadow-2xl group hover:shadow-[#AD46FF]/20"
            >
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#AD46FF] to-[#F6339A] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#AD46FF] transition-colors">À voter</h2>
                <p className="text-gray-400 mb-4">1ère / 2e votation</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-full font-bold text-xl shadow-lg">
                  {awaitingVoteMovies.length}
                </div>
              </div>
            </button>

            {/* Cartella 2: Films votés */}
            <button
              onClick={() => setActiveFolder('voted')}
              className="bg-gray-900 rounded-2xl p-8 border-2 border-gray-800 hover:border-[#AD46FF] transition-all shadow-2xl group hover:shadow-[#AD46FF]/20"
            >
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-700 to-[#AD46FF] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#AD46FF] transition-colors">Votés</h2>
                <p className="text-gray-400 mb-4">Votes enregistrés</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-700 to-[#AD46FF] text-white rounded-full font-bold text-xl shadow-lg">
                  {votedMovies.length}
                </div>
              </div>
            </button>

            {/* Cartella 3: Films promus */}
            <button
              onClick={() => setActiveFolder('approved')}
              className="bg-gray-900 rounded-2xl p-8 border-2 border-gray-800 hover:border-[#AD46FF] transition-all shadow-2xl group hover:shadow-[#F6339A]/20"
            >
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#F6339A] to-pink-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#F6339A] transition-colors">Candidats</h2>
                <p className="text-gray-400 mb-4">Promus à la candidature</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#F6339A] to-pink-700 text-white rounded-full font-bold text-xl shadow-lg">
                  {candidateMovies.length}
                </div>
              </div>
            </button>
          </div>
          </div>
        ) : (
          <div>
            {/* Header con bottone per tornare */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => setActiveFolder(null)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg hover:opacity-90 transition font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Retour</span>
              </button>
              <h2 className="text-2xl font-bold text-white">
                {activeFolder === 'assigned' && 'Films à voter'}
                {activeFolder === 'voted' && 'Films votés'}
                {activeFolder === 'approved' && 'Films candidats'}
              </h2>
              <div className="w-24"></div>
            </div>

            {/* Griglia Film */}
            {activeFolder === 'assigned' && (
              awaitingVoteMovies.length === 0 ? (
                <p className="text-center text-gray-400 py-12">Aucun film à voter.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {awaitingVoteMovies.map((movie) => {
                    const poster = getPoster(movie);
                    return (
                      <button
                        key={`awaiting-${movie.id_movie}`}
                        type="button"
                        onClick={() => setSelectedMovie(movie)}
                        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-[#AD46FF] transition group relative"
                      >
                        {((movie.Awards || []).length > 0 || movie.selection_status === "to_discuss") && (
                          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
                            {(movie.Awards || []).length > 0 && (
                              <span className="bg-yellow-500/90 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                                🏆 {(movie.Awards || []).length}
                              </span>
                            )}
                            {movie.selection_status === "to_discuss" && (
                              <span className="bg-green-900/80 text-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Second vote
                              </span>
                            )}
                          </div>
                        )}
                        <div className="aspect-video bg-gray-800 relative">
                          {poster ? (
                            <img src={poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#AD46FF] transition">
                            {movie.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {movie.duration}s • {movie.main_language || "-"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {activeFolder === 'voted' && (
              votedMovies.length === 0 ? (
                <p className="text-center text-gray-400 py-12">Aucun film voté.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {votedMovies.map((movie) => {
                    const poster = getPoster(movie);
                    const vote = votesByMovie[movie.id_movie];
                    return (
                      <button
                        key={`voted-${movie.id_movie}`}
                        type="button"
                        onClick={() => setSelectedMovie(movie)}
                        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-[#AD46FF] transition group relative"
                      >
                        {((movie.Awards || []).length > 0 || movie.selection_status === "to_discuss") && (
                          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
                            {(movie.Awards || []).length > 0 && (
                              <span className="bg-yellow-500/90 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                                🏆 {(movie.Awards || []).length}
                              </span>
                            )}
                            {movie.selection_status === "to_discuss" && (
                              <span className="bg-green-900/80 text-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Second vote
                              </span>
                            )}
                          </div>
                        )}
                        {vote && (
                          <div className="absolute top-1 right-1 z-10">
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              ✓
                            </span>
                          </div>
                        )}
                        <div className="aspect-video bg-gray-800 relative">
                          {poster ? (
                            <img src={poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#AD46FF] transition">
                            {movie.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {movie.duration}s • {movie.main_language || "-"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {activeFolder === 'approved' && (
              candidateMovies.length === 0 ? (
                <p className="text-center text-gray-400 py-12">Aucun film candidat pour le moment.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {candidateMovies.map((movie) => {
                    const poster = getPoster(movie);
                    return (
                      <button
                        key={`approved-${movie.id_movie}`}
                        type="button"
                        onClick={() => setSelectedMovie(movie)}
                        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-[#AD46FF] transition group relative"
                      >
                        {((movie.Awards || []).length > 0 || movie.selection_status === "to_discuss") && (
                          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
                            {(movie.Awards || []).length > 0 && (
                              <span className="bg-yellow-500/90 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                                🏆 {(movie.Awards || []).length}
                              </span>
                            )}
                            {movie.selection_status === "to_discuss" && (
                              <span className="bg-green-900/80 text-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Second vote
                              </span>
                            )}
                          </div>
                        )}
                        <div className="absolute top-1 right-1 z-10">
                          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            ★
                          </span>
                        </div>
                        <div className="aspect-video bg-gray-800 relative">
                          {poster ? (
                            <img src={poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#AD46FF] transition">
                            {movie.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {movie.duration}s • {movie.main_language || "-"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

        {selectedMovie && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{selectedMovie.title}</h3>
                  {isSecondVoteOpen && (
                    <span className="text-xs bg-green-900/40 text-green-200 px-2 py-1 rounded">
                      Mode second vote
                    </span>
                  )}
                  {(selectedMovie.Awards || []).length > 0 && (
                    <span className="text-xs bg-yellow-500/90 text-black px-2 py-1 rounded font-bold">
                      🏆 {(selectedMovie.Awards || []).length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMovie(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {modalNotice && (
                <div className="mt-3 bg-green-900/30 border border-green-600 text-green-300 px-3 py-2 rounded-lg text-xs">
                  {modalNotice}
                </div>
              )}

              <div className="mt-3 grid grid-cols-12 gap-3 text-[11px]">
                <div className="col-span-12 xl:col-span-7 space-y-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                      <h4 className="text-xs uppercase text-gray-400 mb-1">Producteur</h4>
                      <div className="text-gray-300 grid grid-cols-2 gap-2">
                        <div><span className="text-gray-400">Nom:</span> {(selectedMovie.User || selectedMovie.Producer) ? `${(selectedMovie.User || selectedMovie.Producer).first_name} ${(selectedMovie.User || selectedMovie.Producer).last_name}` : "-"}</div>
                        <div><span className="text-gray-400">Email:</span> {(selectedMovie.User || selectedMovie.Producer)?.email || "-"}</div>
                        <div><span className="text-gray-400">Source:</span> {(selectedMovie.User || selectedMovie.Producer)?.known_by_mars_ai || "-"}</div>
                      </div>
                    </div>

                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                      <h4 className="text-xs uppercase text-gray-400 mb-1">IA & Methodologie</h4>
                      <div className="text-gray-300 grid grid-cols-2 gap-2">
                        <div><span className="text-gray-400">Classification:</span> {selectedMovie.production || "-"}</div>
                        <div><span className="text-gray-400">Methodologie:</span> {selectedMovie.workshop || "-"}</div>
                        <div className="col-span-2"><span className="text-gray-400">Outil IA:</span> {selectedMovie.ai_tool || "-"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                      <h4 className="text-xs uppercase text-gray-400 mb-1">Synopsis (FR)</h4>
                      <p className="text-gray-300 line-clamp-4">{selectedMovie.synopsis || selectedMovie.description || "-"}</p>
                    </div>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                      <h4 className="text-xs uppercase text-gray-400 mb-1">Synopsis (EN)</h4>
                      <p className="text-gray-300 line-clamp-4">{selectedMovie.synopsis_anglais || "-"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                    <h4 className="text-xs uppercase text-gray-400 mb-1">Infos film</h4>
                    <div className="grid grid-cols-2 gap-2 text-gray-300">
                      <div><span className="text-gray-400">Durée:</span> {selectedMovie.duration ? `${selectedMovie.duration}s` : "-"}</div>
                      <div><span className="text-gray-400">Langue:</span> {selectedMovie.main_language || "-"}</div>
                      <div><span className="text-gray-400">Nationalité:</span> {selectedMovie.nationality || "-"}</div>
                      <div><span className="text-gray-400">Statut:</span> {selectedMovie.selection_status || "submitted"}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      {getTrailer(selectedMovie) && (
                        <span className="text-gray-400">Trailer plein ecran</span>
                      )}
                      {typeof selectedMovie.subtitle === "string" && selectedMovie.subtitle.toLowerCase().endsWith(".srt") && (
                        <a
                          className="text-[#AD46FF] hover:text-[#F6339A] font-semibold"
                          href={`${uploadBase}/${selectedMovie.subtitle}`}
                          target="_blank"
                          rel="noreferrer"
                          download
                        >
                          Sous-titres
                        </a>
                      )}
                      {selectedMovie.youtube_link && (
                        <a
                          className="text-[#AD46FF] hover:text-[#F6339A] font-semibold"
                          href={selectedMovie.youtube_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                    <h4 className="text-xs uppercase text-gray-400 mb-1">Media</h4>
                    {(getTrailer(selectedMovie) || selectedMovie.youtube_link) ? (
                      <div className="aspect-video h-[170px]">
                        {getTrailer(selectedMovie) ? (
                          <VideoPreview
                            title={selectedMovie.title}
                            src={`${uploadBase}/${getTrailer(selectedMovie)}`}
                            poster={getPoster(selectedMovie) || undefined}
                            onEnded={() => setHasWatched(true)}
                            openMode="fullscreen"
                          />
                        ) : (
                          <a className="text-[#AD46FF] hover:text-[#F6339A]" href={selectedMovie.youtube_link} target="_blank" rel="noreferrer">
                            Ouvrir la vidéo
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucune vidéo disponible.</p>
                    )}
                  </div>
                </div>

                <div className="col-span-12 xl:col-span-5 space-y-2">
                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-white">Votre vote</h4>
                      {votesByMovie[selectedMovie.id_movie] && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-900/40 text-blue-200 px-2 py-1 rounded">
                            Déjà voté
                          </span>
                          {votesByMovie[selectedMovie.id_movie].modification_count > 0 && (
                            <span className="text-xs bg-orange-900/40 text-orange-200 px-2 py-1 rounded">
                              Modifié {votesByMovie[selectedMovie.id_movie].modification_count}x
                            </span>
                          )}
                          {isSecondVoteOpen && (
                            <span className="text-xs bg-green-900/40 text-green-200 px-2 py-1 rounded">
                              ✓ Second vote ouvert
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedVote?.history?.length > 0 && (
                      <div className="mt-2 bg-gray-950 border border-gray-800 rounded-lg p-2">
                        <h5 className="text-xs uppercase text-gray-400 mb-2">Historique des votes</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
                          {selectedVote.history.map((entry, index) => (
                            <div key={`history-${entry.id_vote_history || index}`} className="bg-gray-900 border border-gray-800 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400">Vote {index + 1}</span>
                                <span className="font-semibold text-white">{getVoteLabel(entry.note)}</span>
                              </div>
                              {entry.commentaire && (
                                <p className="text-[11px] text-gray-400 line-clamp-2">{entry.commentaire}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedVote && (
                      <div className="mt-2 bg-gray-950 border border-gray-800 rounded-lg p-2">
                        <h5 className="text-xs uppercase text-gray-400 mb-2">Vote actuel</h5>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span>{getVoteLabel(selectedVote.note)}</span>
                          {selectedVote.modification_count > 0 && (
                            <span className="text-[10px] bg-orange-900/40 text-orange-200 px-2 py-0.5 rounded">
                              Modifié {selectedVote.modification_count}x
                            </span>
                          )}
                        </div>
                        {selectedVote.commentaire && (
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{selectedVote.commentaire}</p>
                        )}
                      </div>
                    )}

                    {canPromoteCandidate && (
                      <button
                        type="button"
                        onClick={handlePromoteCandidate}
                        className="mt-2 w-full px-3 py-2 bg-green-600/80 text-white rounded-lg text-xs font-semibold hover:bg-green-600"
                      >
                        Promouvoir à la candidature
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-2">
                    {getTrailer(selectedMovie) ? (
                      <p className="text-xs text-gray-400 mb-2">
                        Vous devez visionner le film en entier avant de voter.
                      </p>
                    ) : (
                      <label className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <input
                          type="checkbox"
                          checked={confirmedWatched}
                          onChange={(event) => setConfirmedWatched(event.target.checked)}
                          className="accent-[#AD46FF]"
                        />
                        Je confirme avoir visionné le film en entier.
                      </label>
                    )}

                    {voteFeedback && <p className="text-xs text-gray-300 mb-2">{voteFeedback}</p>}
                    {!canEditVote && selectedVote && (
                      <p className="text-xs text-orange-200 bg-orange-900/30 border border-orange-700/50 px-3 py-2 rounded-lg mb-2">
                        Le second vote n'est pas encore ouvert. Votre vote actuel est enregistré.
                      </p>
                    )}

                    <form onSubmit={handleVoteSubmit} className="space-y-3">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm uppercase text-gray-400">Décision</label>
                        <div className="grid grid-cols-1 gap-2">
                          <label className={`flex items-center gap-3 text-gray-300 bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-2 ${!voteAllowed ? "opacity-50" : "cursor-pointer"}`}>
                            <input
                              type="radio"
                              name="note"
                              value="3"
                              checked={voteForm.note === "3" || voteForm.note === 3}
                              onChange={handleVoteChange}
                              required
                              disabled={!voteAllowed}
                              className="accent-[#AD46FF]"
                            />
                            <span className="text-sm">Validé / J'aime / Bon 👍</span>
                          </label>
                          <label className={`flex items-center gap-3 text-gray-300 bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-2 ${!voteAllowed ? "opacity-50" : "cursor-pointer"}`}>
                            <input
                              type="radio"
                              name="note"
                              value="2"
                              checked={voteForm.note === "2" || voteForm.note === 2}
                              onChange={handleVoteChange}
                              required
                              disabled={!voteAllowed}
                              className="accent-[#AD46FF]"
                            />
                            <span className="text-sm">À discuter avec l'admin</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase text-gray-400 block mb-1">
                        Commentaire
                        <span className="normal-case text-gray-600 ml-1 font-normal">(recommandé — confidentiel)</span>
                      </label>
                      <textarea
                        name="commentaire"
                        value={voteForm.commentaire}
                        onChange={handleVoteChange}
                        rows={3}
                        disabled={!voteAllowed}
                        placeholder="Justifiez votre décision…"
                        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#AD46FF] resize-none disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!voteAllowed || voteMutation.isPending}
                      className="w-full bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white px-4 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
                    >
                      {voteMutation.isPending
                        ? "Enregistrement…"
                        : isSecondVoteOpen
                          ? "Enregistrer le 2ème vote"
                          : "Enregistrer le 1er vote"}
                    </button>
                  </form>
                </InfoBlock>
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
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Promouvoir à la candidature
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Film : <span className="text-white font-semibold">{selectedMovie.title}</span>
            </p>
            <label className="text-xs uppercase text-gray-400 block mb-1">
              Message pour l'administrateur (facultatif)
            </label>
            <textarea
              value={promoteComment}
              onChange={(e) => setPromoteComment(e.target.value)}
              rows={4}
              placeholder="Expliquez pourquoi ce film mérite d'être candidat…"
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#AD46FF] resize-none mb-4"
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
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-500 transition disabled:opacity-50"
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


