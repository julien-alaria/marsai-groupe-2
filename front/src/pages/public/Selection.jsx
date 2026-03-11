import { useEffect, useState } from "react";
import { VideoPreview } from "../../components/VideoPreview";
import { UPLOAD_BASE } from "../../utils/constants";

export default function Selection() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/movies/phase2")
      .then((res) => res.json())
      .then((data) => {
        console.log("MOVIES:", data);
        if (Array.isArray(data)) setMovies(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {movies.map(
            (movie) =>
              movie?.trailer &&
              movie?.thumbnail && (
                <div
                  key={movie.id_movie}
                  className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <VideoPreview
                    src={`${UPLOAD_BASE}/${movie.trailer}`}
                    poster={`${UPLOAD_BASE}/${movie.thumbnail}`}
                    title={movie.title}
                  />
                  <div className="p-4 bg-gray-800">
                    <h3 className="text-white text-lg font-semibold text-center">
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