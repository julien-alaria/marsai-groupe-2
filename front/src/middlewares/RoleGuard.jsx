import { useEffect, useState } from "react";
import { Navigate } from "react-router";

/**
 * Composant de protection des routes par rôle
 * Vérifie que l'utilisateur actuellement authentifié possède l'un des rôles autorisés
 * Écoute les changements de localStorage pour mettre à jour en temps réel
 * 
 * @param {Array<string>} allowedRoles - Liste des rôles autorisés (ex: ["ADMIN", "JURY"])
 * @param {ReactNode} children - Le contenu à afficher si l'utilisateur est autorisé
 * @returns {ReactNode} Le contenu si autorisé, sinon message d'erreur d'accès refusé
 * 
 * @example
 * <RoleGuard allowedRoles={["ADMIN"]}>
 *   <AdminPage />
 * </RoleGuard>
 */
export function RoleGuard({ allowedRoles, children }) {
  const [auth, setAuth] = useState(() => ({
    userRole: localStorage.getItem("role"),
    token: localStorage.getItem("token"),
  }));

  useEffect(() => {
    // Créer un écouteur d'événements storage (change dans localStorage)
    const onStorage = () =>
      setAuth({
        userRole: localStorage.getItem("role"),
        token: localStorage.getItem("token"),
      });
    window.addEventListener("storage", onStorage);
    
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!auth.token) {
    return <Navigate to="/auth/login" replace />;
  }

  // Vérifier si le rôle de l'utilisateur figure dans la liste des rôles autorisés
  if (allowedRoles.includes(auth.userRole)) {
    return children;
  } else {
    return <div className="p-6 text-red-600 font-bold">Accès refusé - Vous n'avez pas les permissions nécessaires</div>;
  }
}