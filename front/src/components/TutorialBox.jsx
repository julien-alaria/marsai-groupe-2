import { useState, useRef, useEffect } from "react";

/**
 * TutorialBox — bouton "?" en haut à droite, panneau flottant identique à Gestion des catégories.
 * S'utilise directement dans le header : <TutorialBox title={...} steps={[...]} />
 */
export default function TutorialBox({ title = "Aide", steps = [], defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  if (!steps.length) return null;

  return (
    <div ref={wrapperRef} className="relative flex-shrink-0">
      {/* Toggle button — matches Categories style */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        title={isOpen ? "Fermer l'aide" : "Afficher l'aide"}
      >
        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Floating panel — identical markup to Categories tutorial panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white/5 border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white/90 mb-2">{title}</h3>
              <ul className="space-y-1.5 text-xs text-white/60">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-px flex-shrink-0">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}