// import { Link, useNavigate } from "react-router";
// import { login } from "../../api/auth.js";
// import { useMutation } from "@tanstack/react-query";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";

// /**
//  * Schéma de validation pour le formulaire de connexion
//  * Valide: email et password
//  */
// const loginSchema = z.object({
//   email: z.string().email("Format d'email invalide"),
//   password: z.string().min(1, "Le mot de passe est requis"),
// });

// /**
//  * Composant Login (Page de connexion)
//  * Affiche un formulaire de connexion pour les utilisateurs existants
//  * Après connexion réussie, stocke le JWT et redirige selon le rôle
//  * @returns {JSX.Element} La page de connexion
//  */
// export function Login() {
//   // Si déjà connecté, afficher un message
//   const storedEmail = localStorage.getItem("email");
//   if (storedEmail && storedEmail !== "undefined" && storedEmail !== "null") {
//     return (
//       <>
//         <h1 className="text-2xl">
//           Vous êtes déjà connecté en tant que {storedEmail}
//         </h1>
//         <Link to="/">Aller à l'accueil</Link>
//       </>
//     );
//   }

//   if (storedEmail === "undefined" || storedEmail === "null") {
//     localStorage.removeItem("email");
//     localStorage.removeItem("firstName");
//     localStorage.removeItem("lastName");
//     localStorage.removeItem("role");
//     localStorage.removeItem("token");
//   }

//   const navigate = useNavigate();

//   // Configuration du formulaire avec react-hook-form et Zod
//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(loginSchema),
//   });

//   /**
//    * Mutation pour envoyer les données de connexion au backend
//    * Stocke le token et les données utilisateur en localStorage
//    * Redirige vers le dashboard selon le rôle
//    */
//   const loginMutation = useMutation({
//     mutationFn: async (data) => {
//       return await login(data);
//     },
//     onSuccess: (response) => {
//       // Sauvegarder le token et les infos utilisateur
//       const userData = response.data?.data || response.data;
//       if (!userData?.token || !userData?.email) {
//         localStorage.removeItem("email");
//         localStorage.removeItem("firstName");
//         localStorage.removeItem("lastName");
//         localStorage.removeItem("role");
//         localStorage.removeItem("token");
//         alert("Connexion invalide: données utilisateur manquantes");
//         return;
//       }
//       localStorage.setItem("email", userData?.email);
//       localStorage.setItem("firstName", userData?.first_name || "");
//       localStorage.setItem("role", userData?.role);
//       localStorage.setItem("token", userData?.token);

//       // Redirection basée sur le rôle
//       switch (userData?.role) {
//         case "ADMIN":
//           navigate("/admin");
//           break;
//         case "JURY":
//           navigate("/jury");
//           break;
//         case "PRODUCER":
//           navigate("/producer");
//           break;
//         default:
//           navigate("/");
//           break;
//       }
//     },
//     onError: (error) => {
//       alert(error.response?.data?.error || "Erreur de connexion");
//     },
//   });

//   /**
//    * Gère la soumission du formulaire de connexion
//    * @param {Object} data - { email, password }
//    */
//   function onSubmit(data) {
//     return loginMutation.mutate(data);
//   }
//   return (
//     <div className="min-h-screen bg-black text-white font-light pt-28 pb-20 px-4 md:pt-32">
//       <div className="max-w-xl mx-auto">
//         <div className="text-center mb-10">
//           <h1 className="text-4xl font-bold mb-2">Connexion</h1>
//           <p className="text-gray-400">Accédez à votre espace MarsAI</p>
//         </div>

//         <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <input type="hidden" id="id" {...register("id")} />

//             <div className="flex flex-col">
//               <label htmlFor="email" className="text-white font-semibold mb-2 text-sm uppercase">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="Votre email"
//                 {...register("email")}
//                 className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#AD46FF] transition"
//                 required
//               />
//               {errors.email && (
//                 <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
//               )}
//             </div>

//             <div className="flex flex-col">
//               <label htmlFor="password" className="text-white font-semibold mb-2 text-sm uppercase">
//                 Mot de passe
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 placeholder="Votre mot de passe"
//                 {...register("password")}
//                 className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#AD46FF] transition"
//                 required
//               />
//               {errors.password && (
//                 <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={loginMutation.isPending}
//               className="w-full bg-linear-to-r from-[#AD46FF] to-[#F6339A] text-white font-bold py-4 rounded-lg uppercase hover:opacity-90 transition disabled:opacity-50"
//             >
//               {loginMutation.isPending ? "Connexion..." : "Se connecter"}
//             </button>

//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }



import { Link, useNavigate } from "react-router";
import { login } from "../../api/auth.js";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar.jsx";


/**
 * Schéma de validation pour le formulaire de connexion
 * Valide: email et password
 */
const loginSchema = z.object({
  email: z.string().email("validation.invalidEmail"),
  password: z.string().min(1, "validation.required"),
});

/**
 * Composant Login (Page de connexion)
 * Affiche un formulaire de connexion pour les utilisateurs existants
 * Après connexion réussie, stocke le JWT et redirige selon le rôle
 * @returns {JSX.Element} La page de connexion
 */
export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Configuration du formulaire avec react-hook-form et Zod
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Si déjà connecté, afficher un message
  const storedEmail = localStorage.getItem("email");
  if (storedEmail && storedEmail !== "undefined" && storedEmail !== "null") {
    return (
      <>
        <h1 className="text-2xl">
          {t('common.alreadyLoggedIn', { email: localStorage.getItem("email") })}
        </h1>
        <Link to="/">{t('common.goHome')}</Link>
      </>
    );
  }

  if (storedEmail === "undefined" || storedEmail === "null") {
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
  }

  /**
   * Mutation pour envoyer les données de connexion au backend
   * Stocke le token et les données utilisateur en localStorage
   * Redirige vers le dashboard selon le rôle
   */
  const loginMutation = useMutation({
    mutationFn: async (data) => {
      return await login(data);
    },
    onSuccess: (response) => {
      // Sauvegarder le token et les infos utilisateur
      const userData = response.data?.data || response.data;
      if (!userData?.token || !userData?.email) {
        localStorage.removeItem("email");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        alert(t('forms.login.errors.missingUserData'));
        return;
      }
      localStorage.setItem("email", userData?.email);
      localStorage.setItem("firstName", userData?.first_name || "");
      localStorage.setItem("role", userData?.role);
      localStorage.setItem("token", userData?.token);

      // Redirection basée sur le rôle
      switch (userData?.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "JURY":
          navigate("/jury");
          break;
        case "PRODUCER":
          navigate("/producer");
          break;
        default:
          navigate("/");
          break;
      }
    },
    onError: (error) => {
      if (error?.response?.status === 401) {
        alert(t('forms.login.errors.invalidCredentials'));
        return;
      }

      alert(error?.response?.data?.error || t('forms.login.errors.loginFailed'));
    },
  });

  /**
   * Gère la soumission du formulaire de connexion
   * @param {Object} data - { email, password }
   */
  function onSubmit(data) {
    return loginMutation.mutate(data);
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#06080d] text-white flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">

          {/* ── En-tête ── */}
          <div className="mb-10 text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#AD46FF]/50 mb-3 font-medium">Festival MARS AI</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t('forms.login.title')}</h1>
            <p className="text-white/30 text-sm mt-2">{t('forms.login.subtitle')}</p>
          </div>

          {/* ── Card ── */}
          <div className="bg-white/3 border border-white/6 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <input type="hidden" id="id" {...register("id")} />

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[9px] uppercase tracking-widest text-white/90 font-medium">
                  {t('forms.login.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('forms.login.placeholders.email')}
                  {...register("email")}
                  required
                  className={`w-full bg-white/3 border ${errors.email ? "border-red-500/40 bg-red-500/5" : "border-white/8"} text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-400/80">{t(errors.email.message)}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[9px] uppercase tracking-widest text-white/90 font-medium">
                  {t('forms.login.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={t('forms.login.placeholders.password')}
                  {...register("password")}
                  required
                  className={`w-full bg-white/3 border ${errors.password ? "border-red-500/40 bg-red-500/5" : "border-white/8"} text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200`}
                />
                {errors.password && (
                  <p className="text-[11px] text-red-400/80">{t(errors.password.message)}</p>
                )}
              </div>

              {/* Soumettre */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white font-semibold rounded-xl text-sm tracking-wide hover:brightness-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mt-2"
              >
                {loginMutation.isPending
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      {t('forms.login.buttons.submit')}…
                    </span>
                  : t('forms.login.buttons.submit')}
              </button>

              {/* Inscription */}
              <p className="text-center text-sm text-white/25 pt-1">
                {t('forms.login.links.noAccount')}{" "}
                <Link to="/auth/register" className="text-[#AD46FF]/80 hover:text-[#AD46FF] font-medium transition-colors">
                  {t('forms.login.links.register')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}