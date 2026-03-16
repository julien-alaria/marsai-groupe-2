/**
 * Composant de pagination réutilisable
 * @param {Object} props - Les propriétés du composant
 * @param {number} props.currentPage - Page actuelle
 * @param {number} props.totalPages - Nombre total de pages
 * @param {number} props.itemsPerPage - Nombre d'éléments par page
 * @param {function} props.onPageChange - Fonction appelée quand la page change
 * @param {function} props.onItemsPerPageChange - Fonction appelée quand le nombre d'éléments par page change
 * @returns {JSX.Element} Le composant de pagination
 */
function Pagination({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) {
  // Options pour le nombre d'éléments par page
  const itemsPerPageOptions = [5, 10, 20, 50];

  /**
   * Génère la liste des numéros de page à afficher
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5; // Réduire sur mobile
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajuster le début si on est proche de la fin
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-white/10">
      {/* Sélecteur d'éléments par page */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
        <span className="text-xs text-gray-400">Afficher</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option} className="bg-gray-900 text-xs">
              {option}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-400 hidden sm:inline">éléments par page</span>
      </div>

      {/* Informations de pagination */}
      <div className="text-xs text-gray-400 order-first sm:order-none">
        Page {currentPage} sur {totalPages}
      </div>

      {/* Contrôles de pagination */}
      <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
        {/* Bouton première page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded border ${
            currentPage === 1
              ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
          } transition-all duration-300 hidden sm:block`}
          title="Première page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Bouton page précédente */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1.5 rounded border ${
            currentPage === 1
              ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
          } transition-all duration-300`}
          title="Page précédente"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 flex items-center justify-center rounded border text-xs transition-all duration-300 ${
                currentPage === page
                  ? 'border-blue-500 bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Bouton page suivante */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded border ${
            currentPage === totalPages
              ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
          } transition-all duration-300`}
          title="Page suivante"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bouton dernière page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-1.5 rounded border ${
            currentPage === totalPages
              ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
          } transition-all duration-300 hidden sm:block`}
          title="Dernière page"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Pagination;