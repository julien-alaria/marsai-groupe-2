import instance from "./config.js";

/**
 * Récupère la liste de tous les films/vidéos
 * Endpoint: GET /movies
 * @returns {Promise<Object>} Array de tous les films disponibles
 * 
 * @example
 * const response = await getVideos();
 * const films = response.data;
 */
async function getVideos() {
  return await instance.get("movies");
}

/**
 * Récupère les films assignés au jury connecté
 * Endpoint: GET /movies/assigned
 */
async function getAssignedMovies() {
  return await instance.get("movies/assigned");
}

/**
 * Promotion candidature (JURY)
 * Endpoint: PUT /movies/:id/jury-candidate
 */
async function promoteMovieToCandidateByJury(id, jury_comment = "") {
  return await instance.put(`movies/${id}/jury-candidate`, { jury_comment });
}

/**
 * Met à jour le statut d'un film
 * Endpoint: PUT /movies/:id/status
 */
async function updateMovieStatus(id, selection_status, payload = {}) {
  return await instance.put(`movies/${id}/status`, { selection_status, ...payload });
}

/**
 * Met à jour un film (ADMIN)
 * Endpoint: PUT /movies/:id
 */
async function updateMovie(id, payload) {
  if (payload instanceof FormData) {
    return await instance.put(`movies/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  } else {
    return await instance.put(`movies/${id}`, payload);
  }
}

/**
 * Supprime un film
 * Endpoint: DELETE /movies/:id
 */
async function deleteMovie(id) {
  return await instance.delete(`movies/${id}`);
}

/**
 * Met à jour les catégories d'un film
 * Endpoint: PUT /movies/:id/categories
 */
async function updateMovieCategories(id, categories) {
  return await instance.put(`movies/${id}/categories`, { categories });
}

/**
 * Met à jour les jurys assignés à un film
 * Endpoint: PUT /movies/:id/juries
 */
async function updateMovieJuries(id, juryIds) {
  return await instance.put(`movies/${id}/juries`, { juryIds });
}

/**
 * Récupère toutes les catégories
 * Endpoint: GET /categories
 */
async function getCategories() {
  return await instance.get("categories");
}

/**
 * Crée une catégorie (ADMIN)
 * Endpoint: POST /categories
 */
async function createCategory(name) {
  return await instance.post("categories", { name });
}

/**
 * Met à jour une catégorie (ADMIN)
 * Endpoint: PUT /categories/:id
 */
async function updateCategory(id, name) {
  return await instance.put(`categories/${id}`, { name });
}

/**
 * Supprime une catégorie (ADMIN)
 * Endpoint: DELETE /categories/:id
 */
async function deleteCategory(id) {
  return await instance.delete(`categories/${id}`);
}

export {
  getVideos,
  getAssignedMovies,
  promoteMovieToCandidateByJury,
  updateMovieStatus,
  updateMovie,
  updateMovieCategories,
  updateMovieJuries,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteMovie
};