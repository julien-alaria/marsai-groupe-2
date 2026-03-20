import { createNewsLetter } from "../api/newsletter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const emailNewsletterSchema = z.object({
  email: z.string().email("validation.invalidEmail"),
});

export default function Newsletter() {
  const [status, setStatus] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(emailNewsletterSchema),
  });

  /* ── Logic inchangée ── */
  const onSubmit = async (data) => {
    try {
      await createNewsLetter(data.email);
      setStatus("success");
      reset();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h3 className="text-lg font-black tracking-tight text-white uppercase">
          Restez <span className="bg-gradient-to-r from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">informé</span>
        </h3>
        <p className="text-white/35 text-xs mt-1">
          Actualités, sélections et annonces du festival.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <input
          type="email"
          placeholder="votre@email.com"
          {...register("email")}
          className="flex-1 bg-white/[0.05] border border-white/10 text-white text-sm px-4 py-2.5 rounded-xl placeholder:text-white/25 focus:outline-none focus:border-[#AD46FF]/40 focus:bg-white/[0.07] transition-all duration-200 min-w-0"
        />
        <button
          type="submit"
          className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-[#AD46FF] to-[#F6339A] text-white text-xs font-bold rounded-xl hover:shadow-[0_0_20px_rgba(173,70,255,0.4)] transition-all duration-300"
        >
          OK
        </button>
      </form>

      {errors.email && (
        <p className="text-[11px] text-red-400/80">{errors.email.message}</p>
      )}

      {status === "success" && (
        <p className="flex items-center gap-1.5 text-[11px] text-[#00D492]">
          <span className="w-1 h-1 rounded-full bg-[#00D492]" />
          Inscription réussie !
        </p>
      )}
      {status === "error" && (
        <p className="text-[11px] text-red-400/80">
          Erreur lors de l'inscription. Réessayez.
        </p>
      )}
    </div>
  );
}