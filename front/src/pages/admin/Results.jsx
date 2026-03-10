import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVideos } from "../../api/videos.js";
import { getVotes } from "../../api/votes.js";
import { getAwards } from "../../api/awards.js";

export default function Results() {
  const { data: moviesData, isPending: moviesLoading } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
  });

  const {
    data: votesData,
    isPending: votesLoading,
    isError: votesIsError,
    error: votesError,
  } = useQuery({
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
        stats[vote.id_movie] = { count: 0, sum: 0, average: 0 };
      }

      const numeric = parseFloat(vote.note);
      if (!Number.isNaN(numeric)) {
        stats[vote.id_movie].count += 1;
        stats[vote.id_movie].sum += numeric;
        stats[vote.id_movie].average = stats[vote.id_movie].sum / stats[vote.id_movie].count;
      }
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
      const stats = voteStatsByMovie[movie.id_movie] || { count: 0, average: 0 };
      const movieAwards = awardsByMovie[movie.id_movie] || [];
      return {
        ...movie,
        voteCount: stats.count,
        voteAverage: stats.average,
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
      .filter((movie) => ["selected", "candidate", "finalist", "awarded"].includes(movie.selection_status))
      .sort((a, b) => b.voteAverage - a.voteAverage);
  }, [enrichedMovies]);

  const refusedMovies = useMemo(() => {
    return [...enrichedMovies]
      .filter((movie) => movie.selection_status === "refused")
      .sort((a, b) => b.voteAverage - a.voteAverage);
  }, [enrichedMovies]);

  if (moviesLoading || votesLoading || awardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-300">Chargement des résultats...</div>
      </div>
    );
  }

  if (votesIsError) {
    const message = votesError?.response?.data?.error || "Impossible de charger les votes jury";
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
        {message}
      </div>
    );
  }

  const renderRows = (list, emptyText) => {
    if (list.length === 0) {
      return <tr><td className="px-3 py-4 text-gray-400" colSpan={5}>{emptyText}</td></tr>;
    }

    return list.map((movie, index) => (
      <tr key={movie.id_movie} className="border-t border-gray-800">
        <td className="px-3 py-2 text-gray-400">#{index + 1}</td>
        <td className="px-3 py-2 text-white font-semibold">{movie.title}</td>
        <td className="px-3 py-2 text-gray-300">{movie.voteCount}</td>
        <td className="px-3 py-2 text-gray-300">{movie.voteCount > 0 ? movie.voteAverage.toFixed(2) : "-"}</td>
        <td className="px-3 py-2 text-gray-300">{movie.awards.length}</td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
          Results
        </h1>
        <p className="text-gray-400 mt-1">Films les plus votés, Gagnants du Prix, moyenne des votes et statuts acceptés/refusés.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total films</p>
          <p className="text-white text-2xl font-bold">{movies.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Gagnants du Prix</p>
          <p className="text-white text-2xl font-bold">{awardedMovies.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Acceptés</p>
          <p className="text-white text-2xl font-bold">{acceptedMovies.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Refusés</p>
          <p className="text-white text-2xl font-bold">{refusedMovies.length}</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto">
        <h2 className="text-white font-semibold mb-3">Liste des films les plus votés</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Film</th>
              <th className="px-3 py-2">Votes</th>
              <th className="px-3 py-2">Moyenne</th>
              <th className="px-3 py-2">Prix</th>
            </tr>
          </thead>
          <tbody>{renderRows(mostVoted, "Aucun vote pour le moment")}</tbody>
        </table>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto">
        <h2 className="text-white font-semibold mb-3">Votes du jury</h2>
        {votes.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun vote enregistré pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-3 py-2">Film</th>
                <th className="px-3 py-2">Jury</th>
                <th className="px-3 py-2">Note</th>
                <th className="px-3 py-2">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote) => (
                <tr key={vote.id_vote} className="border-t border-gray-800">
                  <td className="px-3 py-2 text-white">{vote.Movie?.title || `Film #${vote.id_movie}`}</td>
                  <td className="px-3 py-2 text-gray-300">
                    {vote.User
                      ? `${vote.User.first_name || ""} ${vote.User.last_name || ""}`.trim() || vote.User.email
                      : `Jury #${vote.id_user}`}
                  </td>
                  <td className="px-3 py-2 text-gray-300">{vote.note ?? "-"}</td>
                  <td className="px-3 py-2 text-gray-300">{vote.comments || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto">
          <h2 className="text-white font-semibold mb-3">Films acceptés</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Film</th>
                <th className="px-3 py-2">Votes</th>
                <th className="px-3 py-2">Moyenne</th>
                <th className="px-3 py-2">Prix</th>
              </tr>
            </thead>
            <tbody>{renderRows(acceptedMovies, "Aucun film accepté")}</tbody>
          </table>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto">
          <h2 className="text-white font-semibold mb-3">Films refusés</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Film</th>
                <th className="px-3 py-2">Votes</th>
                <th className="px-3 py-2">Moyenne</th>
                <th className="px-3 py-2">Prix</th>
              </tr>
            </thead>
            <tbody>{renderRows(refusedMovies, "Aucun film refusé")}</tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto">
        <h2 className="text-white font-semibold mb-3">Gagnants du Prix</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Film</th>
              <th className="px-3 py-2">Votes</th>
              <th className="px-3 py-2">Moyenne</th>
              <th className="px-3 py-2">Prix</th>
            </tr>
          </thead>
          <tbody>{renderRows(awardedMovies, "Aucun Gagnant du Prix")}</tbody>
        </table>
      </div>
    </div>
  );
}
