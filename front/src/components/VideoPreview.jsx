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
        className="group relative w-full aspect-video bg-black/80 border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all duration-300 shadow-lg shadow-black/30 flex items-center justify-center"
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
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={src}
          poster={poster || undefined}
          muted
          playsInline
          loop
          preload="metadata"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 bg-gradient-to-br from-[#C6CAD2]/30 to-[#0f1114]/10 backdrop-blur-xxs border border-white/20 shadow-lg border border-white/40 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        
        {/* Time Badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-white/90">Cliquer pour agrandir</span>
        </div>
        
        {/* Title Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-37.5 sm:max-w-50">
          <span className="text-[10px] text-white/90 font-medium truncate block">{title}</span>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 mobile-modal-overlay backdrop-blur-sm">
          <div className="w-full max-w-6xl mobile-modal-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <button
                onClick={closeFullscreen}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      )}
    </>
  );
}
