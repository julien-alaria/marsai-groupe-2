import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVideos } from "../../api/videos.js";
import { getVotes } from "../../api/votes.js";
import { getAwards } from "../../api/awards.js";
import TutorialBox from "../../components/TutorialBox.jsx";
import { useEffect, useState } from "react";
import { loadTutorialSteps } from "../../utils/tutorialLoader.js";

// Fixed: was parseFloat(vote.note) which always returned NaN on ENUM strings
// Map ENUM values to numeric scores for ranking purposes
const ENUM_TO_SCORE = { YES: 1, NO: 0, "TO DISCUSS": 0.5 };

export default function Results() {
  const [tutorial, setTutorial] = useState({ title: "Tutoriel", steps: [] });

  useEffect(() => {
    async function fetchTutorial() {
      try {
        const tutorialData = await loadTutorialSteps("/src/pages/admin/TutorialVoting.fr.md");
        setTutorial(tutorialData);
      } catch (err) {
        setTutorial({ title: "Tutoriel", steps: ["Impossible de charger le tutoriel."] });
      }
    }
    fetchTutorial();
  }, []);

  const { data: moviesData, isPending: moviesLoading } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
  });

  const { data: votesData, isPending: votesLoading } = useQuery({
    queryKey: ["votes"],
    queryFn: getVotes,
  });

  const { data: awardsData, isPending: awardsLoading } = useQuery({
    queryKey: ["awards"],
    queryFn: getAwards,
  });

  const movies = moviesData?.data || [];
  const votes = votesData?.data || [];
  const awards = awardsData?.data || [];

  const voteStatsByMovie = useMemo(() => {
    const stats = {};

    votes.forEach((vote) => {
      if (!stats[vote.id_movie]) {
        stats[vote.id_movie] = {
          count: 0,
          sum: 0,
          average: 0,
          yes: 0,
          no: 0,
          toDiscuss: 0
        };
      }

      const score = ENUM_TO_SCORE[vote.note];
      if (score !== undefined) {
        stats[vote.id_movie].count += 1;
        stats[vote.id_movie].sum += score;
        stats[vote.id_movie].average =
          stats[vote.id_movie].sum / stats[vote.id_movie].count;
      }

      // Track individual vote counts per type
      if (vote.note === "YES") stats[vote.id_movie].yes += 1;
      if (vote.note === "NO") stats[vote.id_movie].no += 1;
      if (vote.note === "TO DISCUSS") stats[vote.id_movie].toDiscuss += 1;
    });

    return stats;
  }, [votes]);

  const awardsByMovie = useMemo(() => {
    const map = {};
    awards.forEach((award) => {
      if (!map[award.id_movie]) map[award.id_movie] = [];
      map[award.id_movie].push(award);
    });
    return map;
  }, [awards]);

  const enrichedMovies = useMemo(() => {
    return movies.map((movie) => {
      const stats = voteStatsByMovie[movie.id_movie] || {
        count: 0, average: 0, yes: 0, no: 0, toDiscuss: 0
      };
      const movieAwards = awardsByMovie[movie.id_movie] || [];
      return {
        ...movie,
        voteCount: stats.count,
        voteAverage: stats.average,
        voteYes: stats.yes,
        voteNo: stats.no,
        voteToDiscuss: stats.toDiscuss,
        awards: movieAwards,
      };
    });
  }, [movies, voteStatsByMovie, awardsByMovie]);

  const mostVoted = useMemo(() => {
    return [...enrichedMovies]
      .filter((movie) => movie.voteCount > 0)
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 20);
  }, [enrichedMovies]);

  const awardedMovies = useMemo(() => {
    return [...enrichedMovies]
      .filter((movie) => movie.awards.length > 0 || movie.selection_status === "awarded")
      .sort((a, b) => b.awards.length - a.awards.length || b.voteAverage - a.voteAverage);
  }, [enrichedMovies]);

  const acceptedMovies = useMemo(() => {
    return [...enrichedMovies]
      .filter((movie) =>
        ["selected", "candidate", "finalist", "awarded"].includes(movie.selection_status)
      )
      .sort((a, b) => b.voteAverage - a.voteAverage);
  }, [enrichedMovies]);

  const refusedMovies = useMemo(() => {
    return [...enrichedMovies]
      .filter((movie) => movie.selection_status === "refused")
      .sort((a, b) => b.voteAverage - a.voteAverage);
  }, [enrichedMovies]);

  if (moviesLoading || votesLoading || awardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm text-white/70">Chargement des résultats...</span>
        </div>
      </div>
    );
  }

  const VoteBadge = ({ yes, no, toDiscuss }) => (
    <div className="flex items-center gap-1">
      {yes > 0 && (
        <span className="px-2 py-0.5 text-[10px] font-medium bg-green-500/10 border border-green-500/30 text-green-300 rounded-full">
          ✓ {yes}
        </span>
      )}
      {toDiscuss > 0 && (
        <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-full">
          ? {toDiscuss}
        </span>
      )}
      {no > 0 && (
        <span className="px-2 py-0.5 text-[10px] font-medium bg-red-500/10 border border-red-500/30 text-red-300 rounded-full">
          ✗ {no}
        </span>
      )}
    </div>
  );

  const renderRows = (list, emptyText) => {
    if (list.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-8 text-center text-white/40">
            {emptyText}
          </td>
        </tr>
      );
    }

    return list.map((movie, index) => (
      <tr key={movie.id_movie} className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="px-4 py-2 text-white/40 text-xs">#{index + 1}</td>
        <td className="px-4 py-2">
          <span className="text-sm font-medium text-white">{movie.title}</span>
        </td>
        <td className="px-4 py-2">
          <span className="text-sm text-white/80">{movie.voteCount}</span>
        </td>
        <td className="px-4 py-2">
          <VoteBadge yes={movie.voteYes} no={movie.voteNo} toDiscuss={movie.voteToDiscuss} />
        </td>
        <td className="px-4 py-2">
          {movie.voteCount > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${(movie.voteAverage * 100)}%` }}
                />
              </div>
              <span className="text-xs text-white/60">{(movie.voteAverage * 100).toFixed(0)}%</span>
            </div>
          ) : (
            <span className="text-xs text-white/40">–</span>
          )}
        </td>
        <td className="px-4 py-2">
          {movie.awards.length > 0 ? (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-full">
              🏆 {movie.awards.length}
            </span>
          ) : (
            <span className="text-xs text-white/40">–</span>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] via-[#0c0e11] to-[#0d0f12] text-white pt-8 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <p className="text-xs uppercase tracking-wider text-white/60">Statistiques</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-light bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Résultats des votes
          </h1>
          <p className="text-white/40 text-sm mt-2 max-w-2xl mx-auto">
            Films les plus votés, primés, répartition des votes et statuts de sélection.
          </p>
        </div>

        {/* Tutorial Box */}
        <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          <TutorialBox title={tutorial.title} steps={tutorial.steps} defaultOpen={false} />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            <div className="relative">
              <p className="text-xs text-white/40 uppercase tracking-wider">Total films</p>
              <p className="text-3xl font-light text-white mt-2">{movies.length}</p>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            <div className="relative">
              <p className="text-xs text-white/40 uppercase tracking-wider">Films primés</p>
              <p className="text-3xl font-light text-white mt-2">{awardedMovies.length}</p>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            <div className="relative">
              <p className="text-xs text-white/40 uppercase tracking-wider">Acceptés</p>
              <p className="text-3xl font-light text-white mt-2">{acceptedMovies.length}</p>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            <div className="relative">
              <p className="text-xs text-white/40 uppercase tracking-wider">Refusés</p>
              <p className="text-3xl font-light text-white mt-2">{refusedMovies.length}</p>
            </div>
          </div>
        </div>

        {/* Most voted */}
        <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          
          <div className="relative">
            <h2 className="text-lg font-light text-white/90 mb-4">Films les plus votés</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Film</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Votes</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Répartition</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {renderRows(mostVoted, "Aucun vote pour le moment")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Accepted / Refused */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-lg font-light text-white/90 mb-4">Films acceptés</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Film</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Votes</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Répartition</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderRows(acceptedMovies, "Aucun film accepté")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-lg font-light text-white/90 mb-4">Films refusés</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Film</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Votes</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Répartition</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderRows(refusedMovies, "Aucun film refusé")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Awarded */}
        <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-xl p-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          
          <div className="relative">
            <h2 className="text-lg font-light text-white/90 mb-4">Films primés</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Film</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Votes</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Répartition</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {renderRows(awardedMovies, "Aucun film primé")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}