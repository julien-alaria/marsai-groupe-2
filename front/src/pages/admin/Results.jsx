import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVideos } from "../../api/videos.js";
import { getVotes } from "../../api/votes.js";
import { getAwards } from "../../api/awards.js";
import TutorialBox from "../../components/TutorialBox.jsx";
import { useEffect } from "react";
import { loadTutorialSteps } from "../../utils/tutorialLoader.js";

const ENUM_TO_SCORE = { YES: 1, NO: 0, "TO DISCUSS": 0.5 };

const STATUS_CONFIG = {
  submitted:  { label: "Soumis",        color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  assigned:   { label: "En évaluation", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  to_discuss: { label: "À discuter",    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  candidate:  { label: "Candidat",      color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  selected:   { label: "Sélectionné",   color: "bg-green-500/20 text-green-300 border-green-500/30" },
  finalist:   { label: "Finaliste",     color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  awarded:    { label: "Primé 🏆",      color: "bg-yellow-400/20 text-yellow-200 border-yellow-400/30" },
  refused:    { label: "Refusé",        color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const TABS = [
  { key: "all",       label: "Tous" },
  { key: "top",       label: "Top votés" },
  { key: "awarded",   label: "Primés 🏆" },
  { key: "accepted",  label: "Acceptés" },
  { key: "refused",   label: "Refusés" },
];

export default function Results() {
  const [tutorial, setTutorial] = useState({ title: "Tutoriel", steps: [] });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadTutorialSteps("/src/pages/admin/TutorialVoting.fr.md")
      .then(setTutorial)
      .catch(() => setTutorial({ title: "Aide", steps: ["Consultez les résultats des votes par catégorie."] }));
  }, []);

  const { data: moviesData, isPending: moviesLoading } = useQuery({ queryKey: ["listVideos"], queryFn: getVideos });
  const { data: votesData,  isPending: votesLoading  } = useQuery({ queryKey: ["votes"],      queryFn: getVotes  });
  const { data: awardsData, isPending: awardsLoading  } = useQuery({ queryKey: ["awards"],    queryFn: getAwards });

  const movies = moviesData?.data || [];
  const votes  = votesData?.data  || [];
  const awards = awardsData?.data || [];

  const voteStatsByMovie = useMemo(() => {
    const stats = {};
    votes.forEach((vote) => {
      if (!stats[vote.id_movie]) stats[vote.id_movie] = { count: 0, sum: 0, average: 0, yes: 0, no: 0, toDiscuss: 0 };
      const score = ENUM_TO_SCORE[vote.note];
      if (score !== undefined) { stats[vote.id_movie].count += 1; stats[vote.id_movie].sum += score; stats[vote.id_movie].average = stats[vote.id_movie].sum / stats[vote.id_movie].count; }
      if (vote.note === "YES")        stats[vote.id_movie].yes      += 1;
      if (vote.note === "NO")         stats[vote.id_movie].no       += 1;
      if (vote.note === "TO DISCUSS") stats[vote.id_movie].toDiscuss += 1;
    });
    return stats;
  }, [votes]);

  const awardsByMovie = useMemo(() => {
    const map = {};
    awards.forEach((a) => { if (!map[a.id_movie]) map[a.id_movie] = []; map[a.id_movie].push(a); });
    return map;
  }, [awards]);

  const enrichedMovies = useMemo(() =>
    movies.map((movie) => {
      const s = voteStatsByMovie[movie.id_movie] || { count: 0, average: 0, yes: 0, no: 0, toDiscuss: 0 };
      return { ...movie, voteCount: s.count, voteAverage: s.average, voteYes: s.yes, voteNo: s.no, voteToDiscuss: s.toDiscuss, awards: awardsByMovie[movie.id_movie] || [] };
    }), [movies, voteStatsByMovie, awardsByMovie]);

  const topVoted   = useMemo(() => [...enrichedMovies].filter(m => m.voteCount > 0).sort((a, b) => b.voteCount - a.voteCount).slice(0, 20), [enrichedMovies]);
  const awardedList = useMemo(() => [...enrichedMovies].filter(m => m.awards.length > 0 || m.selection_status === "awarded").sort((a, b) => b.awards.length - a.awards.length), [enrichedMovies]);
  const acceptedList = useMemo(() => [...enrichedMovies].filter(m => ["selected","candidate","finalist","awarded"].includes(m.selection_status)).sort((a, b) => b.voteAverage - a.voteAverage), [enrichedMovies]);
  const refusedList  = useMemo(() => [...enrichedMovies].filter(m => m.selection_status === "refused").sort((a, b) => b.voteAverage - a.voteAverage), [enrichedMovies]);

  const displayList = useMemo(() => {
    switch (activeTab) {
      case "top":      return topVoted;
      case "awarded":  return awardedList;
      case "accepted": return acceptedList;
      case "refused":  return refusedList;
      default:         return [...enrichedMovies].sort((a, b) => b.voteCount - a.voteCount);
    }
  }, [activeTab, enrichedMovies, topVoted, awardedList, acceptedList, refusedList]);

  const tabCounts = { all: enrichedMovies.length, top: topVoted.length, awarded: awardedList.length, accepted: acceptedList.length, refused: refusedList.length };

  if (moviesLoading || votesLoading || awardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] to-[#0d0f12] flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-sm text-white/70">Chargement des résultats…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c0f] via-[#0c0e11] to-[#0d0f12] text-white pt-8 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-white">
              Résultats & Classements
            </h1>
            <p className="text-[9px] tracking-[0.18em] uppercase text-white/25 font-medium mt-1">
              {movies.length} film{movies.length !== 1 ? "s" : ""} · {votes.length} vote{votes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <TutorialBox title={tutorial.title} steps={tutorial.steps} />
        </div>

        {/* ── Stats summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Films total",   value: movies.length,       color: "from-blue-500/20 to-blue-600/10",    border: "border-blue-500/20" },
            { label: "Votes total",   value: votes.length,        color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/20" },
            { label: "Films acceptés",value: acceptedList.length, color: "from-green-500/20 to-green-600/10",  border: "border-green-500/20" },
            { label: "Films primés",  value: awardedList.length,  color: "from-yellow-500/20 to-yellow-600/10",border: "border-yellow-500/20" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-4`}>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-3xl font-light text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-1 border-b border-white/10 pb-px">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === t.key
                  ? "text-purple-400 border-b-2 border-purple-400 -mb-px"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === t.key ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/30"}`}>
                {tabCounts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider w-8">#</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Film</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Votes</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Répartition</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider">Prix</th>
                </tr>
              </thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">
                      Aucun film dans cette catégorie
                    </td>
                  </tr>
                ) : (
                  displayList.map((movie, index) => {
                    const statusConf = STATUS_CONFIG[movie.selection_status] || STATUS_CONFIG.submitted;
                    const scorePct = movie.voteCount > 0 ? Math.round(movie.voteAverage * 100) : 0;
                    return (
                      <tr key={movie.id_movie} className="border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                        {/* Rank */}
                        <td className="px-4 py-3 text-white/25 text-xs font-mono">
                          {index === 0 && activeTab !== "all" ? (
                            <span className="text-yellow-400">🥇</span>
                          ) : index === 1 && activeTab !== "all" ? (
                            <span className="text-gray-300">🥈</span>
                          ) : index === 2 && activeTab !== "all" ? (
                            <span className="text-amber-600">🥉</span>
                          ) : (
                            <span>#{index + 1}</span>
                          )}
                        </td>

                        {/* Title + categories */}
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                          {(movie.Categories || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(movie.Categories || []).slice(0, 2).map((c) => (
                                <span key={c.id_categorie} className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${statusConf.color}`}>
                            {statusConf.label}
                          </span>
                        </td>

                        {/* Vote count */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-white">{movie.voteCount}</span>
                        </td>

                        {/* Vote breakdown */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {movie.voteYes > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-green-500/10 border border-green-500/30 text-green-300 rounded-full">✓{movie.voteYes}</span>
                            )}
                            {movie.voteToDiscuss > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-full">?{movie.voteToDiscuss}</span>
                            )}
                            {movie.voteNo > 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-red-500/10 border border-red-500/30 text-red-300 rounded-full">✗{movie.voteNo}</span>
                            )}
                            {movie.voteCount === 0 && <span className="text-xs text-white/20">—</span>}
                          </div>
                        </td>

                        {/* Score bar */}
                        <td className="px-4 py-3">
                          {movie.voteCount > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${scorePct >= 70 ? "bg-gradient-to-r from-green-500 to-emerald-400" : scorePct >= 40 ? "bg-gradient-to-r from-yellow-500 to-amber-400" : "bg-gradient-to-r from-red-500 to-rose-400"}`}
                                  style={{ width: `${scorePct}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-white/70 w-8 tabular-nums">{scorePct}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>

                        {/* Awards */}
                        <td className="px-4 py-3">
                          {movie.awards.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {movie.awards.map((award) => (
                                <span key={award.id_award} className="text-[9px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-full whitespace-nowrap">
                                  🏆 {award.award_name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Producer row count hint ── */}
        <p className="text-xs text-white/20 text-right">
          {displayList.length} film{displayList.length !== 1 ? "s" : ""} affiché{displayList.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}