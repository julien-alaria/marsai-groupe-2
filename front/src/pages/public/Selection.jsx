import { useEffect, useRef, useState } from "react";
import { UPLOAD_BASE } from "../../utils/constants";
import { getPoster, getTrailer } from "../../utils/movieUtils";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function Selection() {
  const [movies,  setMovies]  = useState([]);
  const [phase,   setPhase]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(null);
  const videoRef = useRef(null);

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

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setActive(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!active && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 0 || phase === null || movies.length === 0) return null;

  const isPhase3     = phase === 3;
  const title        = isPhase3 ? "Palmarès" : "Sélection officielle";
  const subtitle     = isPhase3 ? "Les films primés par le jury" : "Les films sélectionnés pour la délibération finale";
  const activeTrailer = active ? getTrailer(active) : null;
  const activePoster  = active ? getPoster(active)  : null;

  return (
    <section className="min-h-screen text-white px-4 sm:px-6 py-12 sm:py-16">
      {/* <section className="min-h-screen bg-[#06080d] text-white px-4 sm:px-6 py-12 sm:py-16"> */}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <p className="text-[9px] tracking-[0.35em] uppercase text-amber-400/50 font-medium mb-3">
          {isPhase3 ? "Palmarès officiel" : "Sélection officielle"}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 mb-3 uppercase tracking-tight">{title}</h1>
        <p className="text-white/35 text-sm">{subtitle}</p>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-white/15" />
          <span className="text-[8px] tracking-[0.3em] uppercase text-white/20">
            {movies.length} film{movies.length > 1 ? "s" : ""}
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/8 to-white/15" />
        </div>
      </div>

      {/* Poster grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {movies.map((movie) => {
          const trailer  = getTrailer(movie);
          const poster   = getPoster(movie);
          const hasVideo = !!(trailer || movie.youtube_link);

          return (
            <button
              key={movie.id_movie}
              onClick={() => hasVideo && setActive(movie)}
              className={`group relative text-left focus:outline-none ${hasVideo ? "cursor-pointer" : "cursor-default"}`}
              style={{ aspectRatio: "2/3" }}
            >
              <div className="relative w-full h-full  border border-white/5 rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] group-hover:shadow-[0_14px_44px_rgba(173,70,255,0.18)] transition-all duration-500 group-hover:-translate-y-2">

                {poster ? (
                  <img src={poster} alt={movie.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1025] via-[#0d0f14] to-[#1a0a20] flex items-center justify-center">
                    <span className="text-4xl opacity-15">🎬</span>
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

                {/* Award badge */}
                {isPhase3 && movie.Awards?.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {movie.Awards.map((a) => (
                      <span key={a.id_award} className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm rounded-sm bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 max-w-[100px] truncate">
                        🏆 {a.award_name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Play button on hover */}
                {hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-xl">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}

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
                    {movie.nationality && <><span>·</span><span>{movie.nationality}</span></>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>

            {/* Lightbox header */}
            <div className="flex items-start justify-between mb-3 px-1">
              <div>
                <p className="text-[8px] tracking-[0.25em] uppercase text-amber-400/50 mb-1">
                  {isPhase3 ? "Palmarès" : "Sélection officielle"} · MarsAI Festival
                </p>
                <h2 className="text-white font-bold text-lg sm:text-xl uppercase tracking-wide">{active.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-white/35 text-xs">
                  {active.main_language && <span>{active.main_language}</span>}
                  {active.duration      && <span>· {active.duration}s</span>}
                  {active.nationality   && <span>· {active.nationality}</span>}
                </div>
              </div>
              <button
                onClick={() => setActive(null)}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all ml-4 mt-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Awards + divider */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="flex-1 h-px bg-white/10" />
              {isPhase3 && active.Awards?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {active.Awards.map((a) => (
                    <span key={a.id_award} className="text-[8px] px-2 py-0.5 rounded-sm bg-yellow-500/15 text-yellow-300 border border-yellow-500/25 font-medium">
                      🏆 {a.award_name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Video player */}
            <div className="rounded-xl overflow-hidden border border-white/8 bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)]">
              {activeTrailer ? (
                <video
                  ref={videoRef}
                  className="w-full aspect-video object-contain bg-black"
                  src={`${UPLOAD_BASE}/${activeTrailer}`}
                  poster={activePoster || undefined}
                  controls
                  autoPlay
                />
              ) : active.youtube_link ? (
                <div className="aspect-video flex items-center justify-center bg-black/60 relative">
                  {activePoster && (
                    <img src={activePoster} alt={active.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  )}
                  <a href={active.youtube_link} target="_blank" rel="noreferrer" className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-500 flex items-center justify-center shadow-xl transition-colors">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-white/60 text-xs">Regarder sur YouTube</span>
                  </a>
                </div>
              ) : null}
            </div>

            {/* Synopsis */}
            {(active.synopsis || active.description) && (
              <p className="mt-4 text-white/35 text-xs leading-relaxed px-1 line-clamp-3">
                {active.synopsis || active.description}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}