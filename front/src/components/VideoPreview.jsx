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
  const videoRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  function handleMouseEnter() {
    if (videoRef.current) {
      videoRef.current.play().catch(() => null);
    }
  }

  function handleMouseLeave() {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  function openFullscreen() {
    setIsOpen(true);
  }

  function closeFullscreen() {
    setIsOpen(false);
  }

  function requestNativeFullscreen() {
    const video = videoRef.current;
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

  return (
    <>
      <div
        className="group relative w-full aspect-video bg-black/80 border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all duration-300 shadow-lg shadow-black/30"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={openFullscreen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            openFullscreen();
          }
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={src}
          poster={poster || undefined}
          muted
          playsInline
          loop
          preload="metadata"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-blue-600/90 flex items-center justify-center border-2 border-white/30 shadow-xl transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        
        {/* Time Badge */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-white/90">Cliquer pour agrandir</span>
        </div>
        
        {/* Title Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-white/90 font-medium truncate max-w-[200px]">{title}</span>
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div
            className={`fixed ${modalTopOffsetClass} z-[9999] bg-black/90 flex justify-center p-4 mobile-modal-overlay ${placementClasses}`}
          >
            <div className="relative z-[10000] w-full max-w-6xl mobile-modal-panel">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-lg">{title}</h3>
                <button
                  onClick={closeFullscreen}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <video
                className="w-full h-auto max-h-[80vh] bg-black rounded-lg"
                src={src}
                poster={poster || undefined}
                controls
                autoPlay
                onEnded={onEnded}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={requestNativeFullscreen}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Plein écran
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
