import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers } from "../../api/users.js";
import { getVideos, updateMovieJuries } from "../../api/videos.js";
import { getCategories } from "../../api/videos.js";

export default function JuryManagement() {
  const queryClient = useQueryClient();
  const [selectedJury, setSelectedJury] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [notice, setNotice] = useState(null);

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  
  const { data: videosData } = useQuery({
    queryKey: ["listVideos"],
    queryFn: getVideos,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const juries = useMemo(
    () => (usersData?.data || []).filter((user) => user.role === "JURY"),
    [usersData]
  );

  const videos = videosData?.data || [];
  const categories = categoriesData?.data || [];

  const assignJuryMutation = useMutation({
    mutationFn: ({ movieId, juryIds }) => updateMovieJuries(movieId, juryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setNotice("Assignations mises à jour avec succès.");
      setTimeout(() => setNotice(null), 3000);
    },
    onError: () => {
      setNotice("Erreur lors de l'assignation.");
      setTimeout(() => setNotice(null), 3000);
    }
  });

  const unassignJuryMutation = useMutation({
    mutationFn: ({ movieId, juryIds }) => updateMovieJuries(movieId, juryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listVideos"] });
      setNotice("Désassignations mises à jour avec succès.");
      setTimeout(() => setNotice(null), 3000);
    },
    onError: () => {
      setNotice("Erreur lors de la désassignation.");
      setTimeout(() => setNotice(null), 3000);
    }
  });

  const filteredMovies = useMemo(() => {
    const votingStatuses = ["assigned", "to_discuss", "candidate", "selected", "finalist"];
    const eligibleMovies = videos.filter((movie) => votingStatuses.includes(movie.selection_status));

    if (selectedCategory === "all") return eligibleMovies;
    return eligibleMovies.filter((movie) =>
      (movie.Categories || []).some((cat) => cat.id_categorie === parseInt(selectedCategory))
    );
  }, [videos, selectedCategory]);

  const handleToggleMovie = (movieId) => {
    setSelectedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMovies.length === filteredMovies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(filteredMovies.map((m) => m.id_movie));
    }
  };

  const handleAssignToJury = () => {
    if (!selectedJury || selectedMovies.length === 0) {
      setNotice("Sélectionnez un jury et au moins un film.");
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    selectedMovies.forEach((movieId) => {
      const movie = videos.find((m) => m.id_movie === movieId);
      const currentJuries = (movie?.Juries || []).map((j) => j.id_user);
      
      if (!currentJuries.includes(selectedJury)) {
        assignJuryMutation.mutate({
          movieId,
          juryIds: [...currentJuries, selectedJury]
        });
      }
    });

    setSelectedMovies([]);
  };

  const handleUnassignFromJury = () => {
    if (!selectedJury || selectedMovies.length === 0) {
      setNotice("Sélectionnez un jury et au moins un film.");
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    selectedMovies.forEach((movieId) => {
      const movie = videos.find((m) => m.id_movie === movieId);
      const currentJuries = (movie?.Juries || []).map((j) => j.id_user);

      if (currentJuries.includes(selectedJury)) {
        unassignJuryMutation.mutate({
          movieId,
          juryIds: currentJuries.filter((id) => id !== selectedJury)
        });
      }
    });

    setSelectedMovies([]);
  };

  const uploadBase = "http://localhost:3000/uploads";
  const getPoster = (movie) => (
    movie.thumbnail
      ? `${uploadBase}/${movie.thumbnail}`
      : movie.display_picture
        ? `${uploadBase}/${movie.display_picture}`
        : movie.picture1
          ? `${uploadBase}/${movie.picture1}`
          : null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
          Distribution & Jury
        </h1>
        <p className="text-gray-400 mt-2">Assignez les films aux jurys pour la votation</p>
      </div>

      {notice && (
        <div className="bg-gradient-to-r from-[#AD46FF]/20 to-[#F6339A]/20 border border-[#AD46FF] text-white px-4 py-3 rounded-lg">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des Jurys */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Jurys</h2>
            {juries.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun jury disponible</p>
            ) : (
              <div className="space-y-2">
                {juries.map((jury) => {
                  const assignedCount = videos.filter((m) =>
                    (m.Juries || []).some((j) => j.id_user === jury.id_user)
                  ).length;

                  return (
                    <button
                      key={jury.id_user}
                      onClick={() => setSelectedJury(jury.id_user)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedJury === jury.id_user
                          ? "bg-gradient-to-r from-[#AD46FF]/20 to-[#F6339A]/20 border-[#AD46FF]"
                          : "bg-gray-950 border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#AD46FF] to-[#F6339A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {jury.first_name?.[0]}{jury.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {jury.first_name} {jury.last_name}
                          </h3>
                          <p className="text-xs text-gray-400">{jury.email}</p>
                          <p className="text-xs text-[#AD46FF] mt-1">
                            {assignedCount} film{assignedCount !== 1 ? 's' : ''} assigné{assignedCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedJury && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-sm uppercase text-gray-400 mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleAssignToJury}
                  disabled={selectedMovies.length === 0}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Assigner {selectedMovies.length} film{selectedMovies.length !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={handleUnassignFromJury}
                  disabled={selectedMovies.length === 0}
                  className="w-full px-4 py-2 bg-red-700/90 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Retirer {selectedMovies.length} film{selectedMovies.length !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => setSelectedMovies([])}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Désélectionner tout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des Films */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Films disponibles</h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-950 border border-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id_categorie} value={cat.id_categorie}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  {selectedMovies.length === filteredMovies.length ? "Désélectionner" : "Tout sélectionner"}
                </button>
              </div>
            </div>

            {filteredMovies.length === 0 ? (
              <p className="text-center text-gray-400 py-12">Aucun film disponible</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                {filteredMovies.map((movie) => {
                  const poster = getPoster(movie);
                  const isSelected = selectedMovies.includes(movie.id_movie);
                  const assignedJuries = movie.Juries || [];
                  const isAssignedToSelectedJury = assignedJuries.some(
                    (j) => j.id_user === selectedJury
                  );

                  return (
                    <div
                      key={movie.id_movie}
                      className={`relative bg-gray-950 border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#AD46FF] ring-1 ring-[#AD46FF]/50"
                          : "border-gray-800 hover:border-gray-700"
                      }`}
                      onClick={() => handleToggleMovie(movie.id_movie)}
                    >
                      {/* Checkbox */}
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 accent-[#AD46FF] cursor-pointer"
                        />
                      </div>

                      {/* Badge si déjà assigné au jury sélectionné */}
                      {isAssignedToSelectedJury && (
                        <div className="absolute top-1.5 right-1.5 z-10">
                          <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            ✓
                          </span>
                        </div>
                      )}

                      {/* Image */}
                      <div className="aspect-[4/3] bg-gray-800">
                        {poster ? (
                          <img
                            src={poster}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                            ?
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <h3 className="text-white font-semibold text-xs truncate">
                          {movie.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(movie.Categories || []).slice(0, 2).map((cat) => (
                            <span
                              key={cat.id_categorie}
                              className="text-[10px] bg-[#AD46FF]/20 text-[#AD46FF] px-1.5 py-0.5 rounded-full"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {(movie.Categories || []).length > 2 && (
                            <span className="text-[10px] text-gray-400">+{(movie.Categories || []).length - 2}</span>
                          )}
                        </div>
                        {assignedJuries.length > 0 && (
                          <div className="mt-1 text-[10px] text-gray-400">
                            {assignedJuries.length} jury{assignedJuries.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
