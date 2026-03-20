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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(emailNewsletterSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createNewsLetter(data.email);
      setStatus("Inscription à la newsletter réussie");
      reset();
    } catch (err) {
      console.error(err);
      setStatus("Erreur lors de l'inscription à la newsletter");
    }
  };

  return (
    <div className="w-full max-w-md bg-[rgba(255,255,255,0.05)] p-4 sm:p-6 rounded-[30px] sm:rounded-[40px] border border-[rgba(255,255,255,0.10)]">
      <h3 className="font-semibold mb-4 text-2xl sm:text-3xl lg:text-4xl leading-tight">
        RESTEZ
        <br />
        INFORMÉ
      </h3>

      <form
        className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full">
          <input
            type="email"
            placeholder="Email Signal"
            {...register("email")}
            className="w-full bg-[rgba(255,255,255,0.05)] p-3 rounded-[15px] border border-[rgba(255,255,255,0.10)] text-white placeholder-white focus:outline-none focus:ring-1 focus:ring-white"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-white text-black font-medium rounded-[15px] px-4 py-3 hover:bg-gray-300 transition"
        >
          OK
        </button>
      </form>

      {status && <p className="mt-3 text-sm text-white">{status}</p>}
    </div>
  );
}