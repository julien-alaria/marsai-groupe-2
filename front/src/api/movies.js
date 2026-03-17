import instance from "./config.js";

/**
 * Récupère les films du producteur connecté
 * Endpoint: GET /movies/mine
 * Requiert: Token JWT valide
 * @returns {Promise<Object>} Array des films du producteur
 */
async function getMyMovies() {
  return await instance.get("movies/mine");
}

/**
 * Soumet un film pour le producteur connecté
 * Endpoint: POST /movies
 * Requiert: Token JWT valide
 * @param {FormData} formData - Données multipart (fichier + champs)
 */
async function createMovie(formData) {
  return await instance.post("movies/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // Upload vidéo via ngrok peut dépasser 10s: on étend ce timeout uniquement ici.
    timeout: 180000
  });
}

/**
 * Met à jour les collaborateurs d'un film
 * Endpoint: PUT /movies/:id/collaborators
 */
async function updateMovieCollaborators(id, collaborators) {
  return await instance.put(`movies/${id}/collaborators`, { collaborators });
}

/**
 * Supprime un film
 * Endpoint: DELETE /movies/:id
 * Requiert: Token JWT valide (ADMIN ou PRODUCER propriétaire)
 * @param {number} id - ID du film à supprimer
 * @returns {Promise<Object>} Message de confirmation
 */
async function deleteMovie(id) {
  return await instance.delete(`movies/${id}`);
}

export { getMyMovies, createMovie, updateMovieCollaborators, deleteMovie };
