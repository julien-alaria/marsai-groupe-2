import "./i18n";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

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
import Selection from "./pages/public/Selection.jsx";
import Users from "./pages/admin/Users.jsx";
import Videos from "./pages/admin/Videos.jsx";
import Categories from "./pages/admin/Categories.jsx";
import Awards from "./pages/admin/Awards.jsx";
import JuryManagement from "./pages/admin/JuryManagement.jsx";
import Results from "./pages/admin/Results.jsx";
import FestivalConfig from "./pages/admin/FestivalConfig.jsx";
import { FestivalConfigProvider } from "./hooks/useFestivalConfig.jsx";
import AdminSponsors from "./pages/admin/AdminSponsors.jsx";
/**
 * Fixed: removed staleTime: Infinity which prevented any data from ever refreshing.
 * Each query now controls its own staleTime as needed.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute default — sensible for most data
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FestivalConfigProvider>
          <Routes>
            {/* ========================================
                ROUTES PUBLIQUES
                ======================================== */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="infos" element={<InfosPublic />} />
              <Route path="program" element={<ProgramPublic />} />
              <Route path="sponsors" element={<SponsorsPublic />} />
              <Route path="juryPublic" element={<JuryPublic />} />
              <Route path="selection" element={<Selection />} />
            </Route>

            {/* Authentification */}
            <Route path="auth/login" element={<Login />} />
            <Route path="auth/register" element={<Register />} />

            {/* ========================================
                ROUTES ADMIN
                ======================================== */}
            <Route
              path="admin"
              element={
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <AdminLayout />
                </RoleGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="movies" element={<Videos />} />
              <Route path="categories" element={<Categories />} />
              <Route path="awards" element={<Awards />} />
              <Route path="jury" element={<JuryManagement />} />
              <Route path="results" element={<Results />} />
               <Route path="sponsors" element={<AdminSponsors />} />
              <Route path="settings" element={<FestivalConfig />} />
            </Route>

            {/* ========================================
                ROUTES PRODUCTEUR
                ======================================== */}
            <Route
              path="producer"
              element={
                <RoleGuard allowedRoles={["PRODUCER"]}>
                  <ProducerLayout />
                </RoleGuard>
              }
            >
              <Route index element={<ProducerHome />} />
            </Route>

            {/* ========================================
                ROUTES JURY
                ======================================== */}
            <Route
              path="jury"
              element={
                <RoleGuard allowedRoles={["JURY"]}>
                  <JuryLayout />
                </RoleGuard>
              }
            >
              <Route index element={<JuryHome />} />
            </Route>
          </Routes>
        </FestivalConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);