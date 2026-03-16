import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   PendingVideoPlaceholder
   Shown when a video is uploaded but not yet processed.
───────────────────────────────────────────────────────────── */
export function PendingVideoPlaceholder({ accepted = false }) {
  return (
    <div className="w-full aspect-video bg-black/50 border border-white/10 rounded-lg flex flex-col items-center justify-center gap-3 px-4 text-center">
      {!accepted ? (
        <>
          <div className="w-10 h-10 border-2 border-[#AD46FF]/30 border-t-[#AD46FF] rounded-full animate-spin" />
          <p className="text-sm text-white/50 leading-relaxed">
            Vidéo en cours de traitement…
          </p>
          <p className="text-xs text-white/25">
            Vous recevrez un email dès qu&apos;elle sera disponible.
          </p>
        </>
      ) : (
        <>
          <span className="text-3xl">✅</span>
          <p className="text-sm text-emerald-400 font-medium">
            Votre vidéo a été traitée avec succès
          </p>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VideoPreview
   Props:
     src     {string}   — video URL
     poster  {string}   — thumbnail image URL
     title   {string}   — film title shown in lightbox header
     label   {string}   — optional context line (e.g. "MarsAI Festival")
     onEnded {function} — called when video ends
───────────────────────────────────────────────────────────── */
export function VideoPreview({ src, poster, title, label, onEnded }) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef(null);

  // Pause + reset when lightbox closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setIsOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Thumbnail ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative w-full aspect-video rounded-xl overflow-hidden border border-white/8 bg-black cursor-pointer focus:outline-none"
      >
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1025] via-[#0d0f14] to-[#1a0a20]" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Hint */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[9px] tracking-widest uppercase text-white/40">Cliquer pour lire</span>
        </div>
      </button>

      {/* ── Lightbox ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between mb-3 px-1">
              <div>
                {label && (
                  <p className="text-[8px] tracking-[0.25em] uppercase text-amber-400/50 mb-1">
                    {label}
                  </p>
                )}
                <h2 className="text-white font-bold text-lg sm:text-xl uppercase tracking-wide">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all ml-4 mt-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="flex-1 h-px bg-white/10" />
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Player */}
            <div className="rounded-xl overflow-hidden border border-white/8 bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)]">
              <video
                ref={videoRef}
                className="w-full aspect-video object-contain bg-black"
                src={src}
                poster={poster || undefined}
                controls
                autoPlay
                onEnded={onEnded}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}