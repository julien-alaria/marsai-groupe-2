import instance from "./config.js";

/**
 * Récupère la liste de tous les utilisateurs
 * Endpoint: GET /users
 * Requiert: Rôle ADMIN
 * @returns {Promise<Object>} Array de tous les utilisateurs
 */
async function getUsers() {
  return await instance.get("users");
}

/**
 * Crée un nouvel utilisateur
 * Endpoint: POST /users
 * @param {Object} newUser - Données de l'utilisateur à créer
 *                           { firstName, lastName, email, password, role }
 * @returns {Promise<Object>} L'utilisateur créé avec ses données
 */
async function createUser(newUser) {
  return await instance.post("users", newUser);
}


/**
 * Met à jour un utilisateur spécifique (Admin modifiant un autre utilisateur)
 * Endpoint: PUT /users/:id
 * Requiert: Rôle ADMIN
 * @param {number} id - L'ID de l'utilisateur à mettre à jour
 * @param {Object} updatedUser - Les données à mettre à jour
 * @returns {Promise<Object>} L'utilisateur mis à jour
 */
async function updateUser(id, updatedUser) {
  return await instance.put(`users/${id}`, updatedUser);
}

/**
 * Supprime un utilisateur
 * Endpoint: DELETE /users/:id
 * Requiert: Rôle ADMIN
 * @param {number} id - L'ID de l'utilisateur à supprimer
 * @returns {Promise<Object>} Réponse de suppression
 */
async function deleteUser(id) {
  return await instance.delete(`users/${id}`);
}

/**
 * Récupère un utilisateur spécifique par son ID
 * Endpoint: GET /users/:id
 * Requiert: Rôle ADMIN
 * @param {number} id - L'ID de l'utilisateur à récupérer
 * @returns {Promise<Object>} Les données de l'utilisateur
 */
async function getUserById(id) {
  return await instance.get(`users/${id}`);
}

/**
 * Récupère le profil de l'utilisateur actuellement authentifié
 * Endpoint: GET /users/me
 * Requiert: Token JWT valide
 * @returns {Promise<Object>} Données de l'utilisateur authentifié
 */
async function getCurrentUser() {
  return await instance.get("users/me");
}

/**
 * Met à jour le profil de l'utilisateur actuellement authentifié
 * Endpoint: PUT /users/me
 * Requiert: Token JWT valide
 * @param {Object} updatedUser - Les champs à mettre à jour
 * @returns {Promise<Object>} Le profil utilisateur mis à jour
 */
async function updateCurrentUser(updatedUser) {
  return await instance.put("users/me", updatedUser);
}

/**
 * Inscription publique à la newsletter
 * Endpoint: POST /newsletter/subscribe
 */
async function subscribeNewsletter(payload) {
  return await instance.post("newsletter/subscribe", payload);
}

/**
 * Liste des abonnés newsletter (ADMIN)
 * Endpoint: GET /newsletter/subscribers
 */
async function getNewsletterSubscribers() {
  return await instance.get("newsletter/subscribers");
}

/**
 * Envoi d'une newsletter (ADMIN)
 * Endpoint: POST /newsletter/send
 */
async function sendNewsletter(payload) {
  return await instance.post("newsletter/send", payload);
}

export {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getCurrentUser,
  updateCurrentUser,
  subscribeNewsletter,
  getNewsletterSubscribers,
  sendNewsletter
};
