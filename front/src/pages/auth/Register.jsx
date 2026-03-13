import { Link, useNavigate } from "react-router";
import { signIn, login } from "../../api/auth.js";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import Navbar from "../../components/Navbar.jsx";

/**
 * Schéma de validation pour le formulaire d'enregistrement
 * Valide tous les champs du profil utilisateur
 */
const registerSchema = z.object({
  firstName: z.string().min(1, "validation.firstName.required"),
  lastName: z.string().min(1, "validation.lastName.required"),
  email: z.string().email("validation.email.invalid"),
  password: z.string().min(6, "validation.password.minLength"),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  birthDate: z.string().optional(),
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  biography: z.string().optional(),
  job: z.enum(["ACTOR", "DIRECTOR", "PRODUCER", "WRITER", "OTHER"]).optional(),
  portfolio: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  knownByMarsAi: z.enum(["YES", "NO"]).optional(),
  role: z.string().optional().default("PRODUCER"),
});

/**
 * Composant Register (Page d'enregistrement)
 * Formulaire complet d'enregistrement pour les nouveaux utilisateurs
 * Après enregistrement réussi, auto-login automatique
 * @returns {JSX.Element} La page d'enregistrement
 */
export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Configuration du formulaire avec react-hook-form et Zod
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "PRODUCER", job: "PRODUCER" },
  });

  // Si déjà connecté, afficher un message
  if (localStorage.getItem("email")) {
    return (
      <>
        <h1 className="text-2xl">
          {t('common.alreadyLoggedIn', { email: localStorage.getItem("email") })}
        </h1>
        <Link to="/">{t('common.goHome')}</Link>
      </>
    );
  }

  /**
   * Mutation pour envoyer les données d'enregistrement au backend
   * Après succès, effectue un auto-login automatique
   */
  const registerMutation = useMutation({
    mutationFn: async (data) => {
      return await signIn({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        mobile: data.mobile,
        birthDate: data.birthDate,
        street: data.street,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        biography: data.biography,
        job: data.job || "PRODUCER",
        portfolio: data.portfolio,
        youtube: data.youtube,
        instagram: data.instagram,
        linkedin: data.linkedin,
        facebook: data.facebook,
        tiktok: data.tiktok,
        knownByMarsAi: data.knownByMarsAi,
        role: data.role || "PRODUCER"
      });
    },
    onSuccess: async (data, variables) => {
      // Après enregistrement réussi, effectuer un login automatique
      try {
        const loginRes = await login({
          email: variables.email,
          password: variables.password
        });
        const userData = loginRes.data?.data || loginRes.data;
        if (!userData?.token || !userData?.email) {
          localStorage.removeItem("email");
          localStorage.removeItem("firstName");
          localStorage.removeItem("lastName");
          localStorage.removeItem("role");
          localStorage.removeItem("token");
          alert(t('messages.registrationSuccessButLoginFailed'));
          navigate("/auth/login");
          return;
        }
        // Sauvegarder les données de session
        localStorage.setItem("email", userData?.email);
        localStorage.setItem("firstName", userData?.first_name || "");
        localStorage.setItem("lastName", userData?.last_name || "");
        localStorage.setItem("role", userData?.role);
        localStorage.setItem("token", userData?.token);
        
        // Redirection vers le tableau de bord du producteur
        navigate("/producer");
      } catch (err) {
        alert(t('messages.registrationError'));
        navigate("/auth/login");
      }
    },
  });

  function onSubmit(data) {
    return registerMutation.mutate(data);
  }
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#06080d] text-white pt-28 pb-24 px-4 md:pt-32">
        <div className="max-w-5xl mx-auto">

          {/* ── En-tête ── */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#AD46FF]/50 mb-2 font-medium">Festival MARS AI</p>
            <h1 className="text-4xl font-bold tracking-tight text-white">{t('forms.register.title')}</h1>
            <p className="text-white/30 text-sm mt-2">{t('forms.register.subtitle1')}</p>
            <div className="mt-8 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          </div>

          {/* ── Formulaire ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ═══ Profil ═══ */}
            <div className="bg-white/3 border border-white/6 rounded-2xl p-6 space-y-5">
              <p className="text-[10px] tracking-widest uppercase text-white/25 font-medium">{t('forms.register.sections.profile')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <Field label={`${t('forms.register.labels.lastName')} *`} error={errors.lastName?.message && t(errors.lastName.message)}>
                  <input id="lastName" type="text" placeholder={t('forms.register.placeholders.lastName')} {...register("lastName")}
                    className={input(!!errors.lastName)} />
                </Field>

                <Field label={`${t('forms.register.labels.firstName')} *`} error={errors.firstName?.message && t(errors.firstName.message)}>
                  <input id="firstName" type="text" placeholder={t('forms.register.placeholders.firstName')} {...register("firstName")}
                    className={input(!!errors.firstName)} />
                </Field>

                <Field label={`${t('forms.register.labels.email')} *`} error={errors.email?.message && t(errors.email.message)}>
                  <input id="email" type="email" placeholder={t('forms.register.placeholders.email')} {...register("email")}
                    className={input(!!errors.email)} />
                </Field>

                <Field label={`${t('forms.register.labels.password')} *`} error={errors.password?.message && t(errors.password.message)}>
                  <input id="password" type="password" placeholder={t('forms.register.labels.password')} {...register("password")}
                    className={input(!!errors.password)} />
                </Field>

                <Field label={t('forms.register.labels.phone')}>
                  <input id="phone" type="text" placeholder={t('forms.register.placeholders.phone')} {...register("phone")}
                    className={input(false)} />
                </Field>

                <Field label={t('forms.register.labels.birthDate')}>
                  <input id="birthDate" type="date" {...register("birthDate")}
                    className={`${input(false)} [color-scheme:dark]`} />
                </Field>

                <Field label={t('forms.register.labels.street')}>
                  <input id="street" type="text" placeholder={t('forms.register.placeholders.street')} {...register("street")}
                    className={input(false)} />
                </Field>

                <Field label={`${t('forms.register.labels.city')}`}>
                  <input id="city" type="text" placeholder={t('forms.register.placeholders.city')} {...register("city")}
                    className={input(false)} />
                </Field>

                <Field label={t('forms.register.labels.postalCode')}>
                  <input id="postalCode" type="text" placeholder={t('forms.register.placeholders.postalCode')} {...register("postalCode")}
                    className={input(false)} />
                </Field>

                <Field label={t('forms.register.labels.country')}>
                  <input id="country" type="text" placeholder={t('forms.register.placeholders.country')} {...register("country")}
                    className={input(false)} />
                </Field>

                <Field label={t('forms.register.labels.job')}>
                  <select id="job" {...register("job")} className={input(false)}>
                    <option value="ACTOR">{t('forms.register.jobOptions.ACTOR')}</option>
                    <option value="DIRECTOR">{t('forms.register.jobOptions.DIRECTOR')}</option>
                    <option value="PRODUCER">{t('forms.register.jobOptions.PRODUCER')}</option>
                    <option value="WRITER">{t('forms.register.jobOptions.WRITER')}</option>
                    <option value="OTHER">{t('forms.register.jobOptions.OTHER')}</option>
                  </select>
                </Field>

                <Field label={t('forms.register.labels.socialLink', 'Site web / réseau social')} className="md:col-span-2 lg:col-span-2">
                  <input id="portfolio" type="text" placeholder="https://siteweb.com" {...register("portfolio")}
                    className={input(false)} />
                </Field>

                <Field label={t('forms.register.labels.biography')} className="md:col-span-2 lg:col-span-3">
                  <textarea id="biography" rows={3} placeholder={t('forms.register.placeholders.biography')} {...register("biography")}
                    className={`${input(false)} resize-none`} />
                </Field>
              </div>
            </div>

            <input type="hidden" {...register("role")} defaultValue="PRODUCER" />

            {/* ── Erreur globale ── */}
            {registerMutation.isError && (
              <div className="flex items-center gap-3 bg-red-950/60 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {registerMutation.error?.response?.data?.error
                  || registerMutation.error?.message
                  || t('validation.submissionError')}
              </div>
            )}

            {/* ── Soumettre ── */}
            <div className="space-y-3">
              <button type="submit" disabled={registerMutation.isPending}
                className="w-full py-3.5 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white font-semibold rounded-xl text-sm tracking-wide hover:brightness-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                {registerMutation.isPending
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      {t('forms.register.buttons.submit')}…
                    </span>
                  : t('forms.register.buttons.submit')}
              </button>
              <p className="text-center text-sm text-white/25">
                Déjà inscrit ?{" "}
                <Link to="/auth/login" className="text-[#AD46FF]/80 hover:text-[#AD46FF] transition-colors font-medium">Se connecter</Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

/* ── Helpers ── */
function input(hasError) {
  return `w-full bg-white/3 border ${hasError ? "border-red-500/40 bg-red-500/5" : "border-white/8"} text-white px-3.5 py-2.5 rounded-xl text-sm outline-none hover:border-[#AD46FF]/30 focus:border-[#AD46FF]/50 focus:bg-white/5 placeholder:text-white/15 transition-all duration-200`;
}

function Field({ label, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] uppercase tracking-widest text-white/95 font-medium">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-400/80">{error}</p>}
    </div>
  );
}