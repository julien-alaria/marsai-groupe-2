import { useEffect, useState } from "react";
import { VideoPreview } from "../../components/VideoPreview";
import { UPLOAD_BASE } from "../../utils/constants";

export default function Selection({ phaseFromAdmin }) {
  const [movies, setMovies] = useState([]);

  const phase = phaseFromAdmin || "phase";

  useEffect(() => {
    fetch(`http://localhost:3000/movies/${phase}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("MOVIES:", data);
        if (Array.isArray(data)) setMovies(data);
      })
      .catch((err) => console.error(err));
  }, [phase]);

   // Définir le texte du h2 dynamiquement
  const headerText = phase === "phase2" 
    ? "Sélection Officielle" 
    : phase === "phase3" 
      ? "Films Primés" 
      : "Sélection Officielle";

  return (
    <div className="p-6">
      <h2 className="text-2xl 
      bg-gradient-to-br from-[#C6CAD2]/30 to-[#0f1114]/10 backdrop-blur-sm text-white rounded-full px-4 py-2 border border-white/30 font-bold text-white mb-4 text-center">
        {headerText}
      </h2>
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {movies.map(
            (movie) =>
              movie?.trailer &&
              movie?.thumbnail && (
                <div
                  key={movie.id_movie}
                  className="
                  relative
                  bg-gray-900
                  rounded-xl
                  overflow-hidden
                  shadow-lg
                  hover:shadow-2xl
                  transition-shadow
                  duration-300
                  border border-white/10
                  before:pointer-events-none
                  before:absolute
                  before:inset-0
                  before:rounded-xl
                  before:bg-gradient-to-br
                  before:from-white/20
                  before:via-transparent
                  before:to-transparent
                  before:opacity-40
                  after:pointer-events-none
                  after:absolute
                  after:inset-0
                  after:rounded-xl
                  after:shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-4px_6px_rgba(0,0,0,0.6)]
                  "
                >
                  <VideoPreview
                    src={`${UPLOAD_BASE}/${movie.trailer}`}
                    poster={`${UPLOAD_BASE}/${movie.thumbnail}`}
                    title={movie.title}
                  />
                  <div className="p-4 bg-gray-800/70 backdrop-blur-md border-t border-white/10">
                    <h3 className="text-gray-200/80 text-lg font-semibold text-center">
                      {movie.title}
                    </h3>
                  </div>
                </div>
              )
          )}
        </div>
      ) : (
        <p className="text-white text-center">Loading movies...</p>
      )}
    </div>
  );
}