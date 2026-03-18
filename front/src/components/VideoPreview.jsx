import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function VideoPreview({
  src,
  poster,
  title,
  onEnded,
  openMode = "overlay",
  modalPlacement = "center",
  modalTopOffsetClass = "inset-0",
}) {
  const previewVideoRef = useRef(null);
  const fullscreenVideoRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inlineError, setInlineError] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);

  useEffect(() => {
    if (!isOpen && fullscreenVideoRef.current) {
      fullscreenVideoRef.current.pause();
      fullscreenVideoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  function openFullscreen() {
    setFullscreenError(false);
    setIsOpen(true);
  }

  function closeFullscreen() {
    setIsOpen(false);
  }

  function requestNativeFullscreen() {
    const video = fullscreenVideoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
  }

  const placementClasses =
    modalPlacement === "bottom"
      ? "items-end pb-4"
      : "items-center";

  const fullscreenModal = isOpen
    ? createPortal(
      <div className={`fixed z-[120] bg-black/90 flex ${placementClasses} justify-center p-4 mobile-modal-overlay ${modalTopOffsetClass}`}>
        <div className="w-full max-w-6xl mobile-modal-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <button
              onClick={closeFullscreen}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {fullscreenError ? (
            <div className="p-4 rounded-lg border border-red-700/50 bg-red-900/20 text-red-200 text-sm">
              Impossible de lire la video en plein ecran.
              <div className="mt-2">
                <a className="underline" href={src} target="_blank" rel="noreferrer">Ouvrir le fichier video</a>
              </div>
            </div>
          ) : (
            <video
              ref={fullscreenVideoRef}
              className="w-full h-auto max-h-[80vh] bg-black rounded-lg"
              src={src}
              poster={poster || undefined}
              controls
              playsInline
              autoPlay
              onEnded={onEnded}
              onError={() => setFullscreenError(true)}
            />
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={requestNativeFullscreen}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Plein ecran
            </button>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
            >
              Ouvrir dans un onglet
            </a>
          </div>
        </div>
      </div>,
      document.body
    )
    : null;

  return (
    <>
      <div
        className="group relative w-full aspect-video bg-black/80 border border-white/10 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-lg shadow-black/30"
      >
        {inlineError ? (
          <div className="w-full h-full flex items-center justify-center p-4 text-center">
            <div className="text-xs text-red-200">
              Impossible de lire la video ici.
              <div className="mt-2">
                <a className="underline" href={src} target="_blank" rel="noreferrer">Ouvrir le fichier video</a>
              </div>
            </div>
          </div>
        ) : (
          <video
            ref={previewVideoRef}
            className="w-full h-full object-cover"
            src={src}
            poster={poster || undefined}
            controls
            playsInline
            preload="metadata"
            onEnded={onEnded}
            onError={() => setInlineError(true)}
          />
        )}

        <button
          type="button"
          onClick={openFullscreen}
          className="absolute top-2 right-2 px-2 py-1 text-[10px] bg-black/70 border border-white/20 text-white rounded hover:bg-black/85"
        >
          Plein ecran
        </button>
      </div>
      {fullscreenModal}
    </>
  );
}
