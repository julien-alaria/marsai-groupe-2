/**
 * Point d'entrée principal de l'application React (main.jsx)
 * Configure le routage avec React Router et TanStack Query pour la gestion d'état
 * Définit tous les chemins de routes (publics et protégés par rôle)
 * Utilise RoleGuard pour protéger les routes selon le rôle de l'utilisateur
 *
 * Structure des routes:
 * - / (publique): Accueil, Login, Register
 * - /admin (ADMIN uniquement): Dashboard, utilisateurs, vidéos
 * - /producer (PRODUCER uniquement): Page d'accueil producteur
 * - /jury (JURY uniquement): Page d'accueil jury
 */

import './i18n';

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


// import "./i18n"; // Désactivé tant que i18next n'est pas installé correctement
import "./index.css";

// Importation des pages publiques et privées
import Home from "./pages/public/Home.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import ProducerLayout from "./layouts/ProducerLayout.jsx";
import JuryLayout from "./layouts/JuryLayout.jsx";
import ProducerHome from "./pages/producer/ProducerHome.jsx";
import JuryHome from "./pages/jury/JuryHome.jsx";
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";
import { RoleGuard } from "./middlewares/RoleGuard.jsx";
import InfosPublic from "./pages/public/Infos.jsx";
import ProgramPublic from "./pages/public/Program.jsx";
import SponsorsPublic from "./pages/public/Sponsors.jsx";
import JuryPublic from "./pages/public/Jury.jsx";
import Users from "./pages/admin/Users.jsx";
import Videos from "./pages/admin/Videos.jsx";
import Categories from "./pages/admin/Categories.jsx";
import Awards from "./pages/admin/Awards.jsx";
import JuryManagement from "./pages/admin/JuryManagement.jsx";
import Results from "./pages/admin/Results.jsx";
import Leaderboard from "./pages/admin/Leaderboard.jsx";
/**
 * Configuration de TanStack Query
 * staleTime: Infinity signifie que les données en cache ne deviennent jamais obsolètes automatiquement
 * Les données doivent être actualisées manuellement via une mutation ou une invalidation
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

/**
 * Rendu de l'application principale
 * Utilise StrictMode pour détecter les problèmes potentiels en développement
 * Enveloppe l'application avec:
 * 1. BrowserRouter: Fournit le routage côté client
 * 2. QueryClientProvider: Fournit le client TanStack Query à toute l'app
 * 3. Routes: Définit toutes les routes de l'application
 */
createRoot(document.getElementById("root")).render(
  
    
  <StrictMode>  
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* ========================================
              ROUTES PUBLIQUES (Accessible à tous)
              ======================================== */}
   <Route path="/" element={<PublicLayout />}>
  <Route index element={<Home />} />
  <Route path="infos" element={<InfosPublic />} />
  <Route path="program" element={<ProgramPublic />} />
  <Route path="sponsors" element={<SponsorsPublic />} />
  <Route path="juryPublic" element={<JuryPublic />} />
</Route>

  {/* authentification*/}
  <Route path="auth/login" element={<Login />} />
  <Route path="auth/register" element={<Register />} />


          {/* ========================================
              ROUTES ADMIN (Rôle ADMIN uniquement)
              ======================================== */}
          <Route
            path="admin"
            element={
              <RoleGuard allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RoleGuard>
            }
          >
            {/* Dashboard administrateur */}
            <Route index element={<Dashboard />} />
            {/* Gestion des utilisateurs sera ajoutée ici */}

            <Route path="users" element={<Users />} />

            {/* Gestion des vidéos sera ajoutée ici */}

            <Route path="movies" element={<Videos />} />
            
            {/* Gestion des catégories */}
            <Route path="categories" element={<Categories />} />
            
            {/* Gestion des prix */}
            <Route path="awards" element={<Awards />} />
            
            {/* Distribution & Gestion des jurys */}
            <Route path="jury" element={<JuryManagement />} />

            {/* Résultats */}
            <Route path="results" element={<Results />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>

          {/* ========================================
              ROUTES PRODUCTEUR (Rôle PRODUCER)
              ======================================== */}
          <Route
            path="producer"
            element={
              <RoleGuard allowedRoles={["PRODUCER"]}>
                <ProducerLayout />
              </RoleGuard>
            }
          >
            {/* Page d'accueil et profil du producteur */}
            <Route index element={<ProducerHome />} />
          </Route>

          {/* ========================================
              ROUTES JURY (Rôle JURY)
              ======================================== */}
          <Route
            path="jury"
            element={
              <RoleGuard allowedRoles={["JURY"]}>
                <JuryLayout />
              </RoleGuard>
            }
          >
            {/* Page d'accueil du jury */}
            <Route index element={<JuryHome />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);



