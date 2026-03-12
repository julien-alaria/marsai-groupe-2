import { useEffect, useState } from "react";
import { VideoPreview } from "../../components/VideoPreview";
import { UPLOAD_BASE } from "../../utils/constants";
import { getPoster, getTrailer } from "../../utils/movieUtils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Selection() {
  const [movies,  setMovies]  = useState([]);
  const [phase,   setPhase]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/festival/phase`)
      .then((r) => r.json())
      .then(async (data) => {
        const activePhase = data.phase ?? 0;
        setPhase(activePhase);
        if (activePhase === 2 || activePhase === 3) {
          const res = await fetch(`${API}/movies/phase${activePhase}`);
          const list = await res.json();
          if (Array.isArray(list)) setMovies(list);
        }
      })
      .catch(() => setPhase(0))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 0 || phase === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-6 gap-4">
        <span className="text-5xl">🎬</span>
        <h2 className="text-white text-2xl font-semibold">La sélection arrive bientôt</h2>
        <p className="text-white/40 text-sm max-w-sm">
          Les films seront publiés dès que le jury aura finalisé sa délibération.
        </p>
      </div>
    );
  }

  const isPhase3 = phase === 3;
  const title    = isPhase3 ? "🏆 Palmarès" : "🎞 Sélection officielle";
  const subtitle = isPhase3
    ? "Les films primés par le jury"
    : "Les films sélectionnés pour la délibération finale";

  return (
    <div className="min-h-screen bg-[#06080d] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <p className="text-[9px] tracking-[0.2em] uppercase text-amber-400/50 font-medium mb-2">
          {isPhase3 ? "Palmarès officiel" : "Sélection officielle"}
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white/40 text-sm">{subtitle}</p>
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-white/30">
          <span className="text-3xl">📭</span>
          <p className="text-sm">Aucun film disponible pour l'instant.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => {
            const trailer = getTrailer(movie);
            const poster  = getPoster(movie);
            if (!trailer && !movie.youtube_link) return null;
            return (
              <div key={movie.id_movie}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group">
                {trailer ? (
                  <VideoPreview
                    src={`${UPLOAD_BASE}/${trailer}`}
                    poster={poster || undefined}
                    title={movie.title}
                  />
                ) : (
                  <a href={movie.youtube_link} target="_blank" rel="noreferrer"
                    className="block relative aspect-video bg-black/60 flex items-center justify-center">
                    {poster && <img src={poster} alt={movie.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                    <div className="relative z-10 w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </a>
                )}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
                  {movie.main_language && <p className="text-white/30 text-[11px] mt-1">{movie.main_language}</p>}
                  {isPhase3 && movie.Awards?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {movie.Awards.map((a) => (
                        <span key={a.id_award} className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 font-medium">
                          🏆 {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}