import axios from "axios";
import { showAppAlert } from "../utils/appAlert";

/**
 * Instance Axios configurée pour communiquer avec le backend
 * Base URL: http://localhost:3000/
 * Timeout: 5000ms (increased for DB operations)
 */
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/",
  timeout: 10000,
  // Nécessaire pour ngrok (évite la page d'avertissement sur les requêtes API)
  headers: { "ngrok-skip-browser-warning": "true" },
});

/**
 * Intercepteur de requête
 * Ajoute automatiquement le token JWT dans le header Authorization
 * de chaque requête HTTP envoyée au backend
 */
instance.interceptors.request.use(
  async (config) => {
    // Récupérer le token du localStorage
    const token = localStorage.getItem("token");

    // Ajouter le token au header si disponible
    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log("Une erreur est survenue lors de la requête:", error);
    return Promise.reject(new Error(error));
  }
);

// Interceptor globale per gestire 401 Unauthorized
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("role");
      showAppAlert({
        title: "Session expirée",
        message: "Session expirée ou non autorisé. Veuillez vous reconnecter.",
        tone: "warning",
      });
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
