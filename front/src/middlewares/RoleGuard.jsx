// import { useEffect, useState } from "react";

// /**
//  * Composant de protection des routes par rôle
//  * Vérifie que l'utilisateur actuellement authentifié possède l'un des rôles autorisés
//  * Écoute les changements de localStorage pour mettre à jour en temps réel
//  * 
//  * @param {Array<string>} allowedRoles - Liste des rôles autorisés (ex: ["ADMIN", "JURY"])
//  * @param {ReactNode} children - Le contenu à afficher si l'utilisateur est autorisé
//  * @returns {ReactNode} Le contenu si autorisé, sinon message d'erreur d'accès refusé
//  * 
//  * @example
//  * <RoleGuard allowedRoles={["ADMIN"]}>
//  *   <AdminPage />
//  * </RoleGuard>
//  */
// export function RoleGuard({ allowedRoles, children }) {
//   // Récupérer le rôle initial du localStorage
//   const [userRole, setUserRole] = useState(() => localStorage.getItem("role"));

//   useEffect(() => {
//     // Créer un écouteur d'événements storage (change dans localStorage)
//     const onStorage = () => setUserRole(localStorage.getItem("role"));
//     window.addEventListener("storage", onStorage);
    
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   // Vérifier si le rôle de l'utilisateur figure dans la liste des rôles autorisés
//   if (allowedRoles.includes(userRole)) {
//     return children;
//   } else {
//     return <div className="p-6 text-red-600 font-bold">Accès refusé - Vous n'avez pas les permissions nécessaires</div>;
//   }
// }

import { Navigate } from "react-router";

export function RoleGuard({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token || !allowedRoles.includes(userRole)) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}