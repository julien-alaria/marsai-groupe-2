import { createNewsLetter } from "../api/newsletter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const emailNewsletterSchema = z.object({
  email: z.string().email("validation.invalidEmail")
});

export default function Newsletter() {

  const [status, setStatus] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(emailNewsletterSchema)
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
  }

  return (
    <div className="w-100 h-52 bg-[rgba(255,255,255,0.05)] p-3.75 rounded-[40px] border border-[rgba(255,255,255,0.10)] items-center">
      
      <h3 className="font-semibold mb-4 text-4xl pl-3.5 pr-3.5 gap-3.5">RESTEZ<br />INFORMÉ</h3>
      <form className="grid grid-cols-[1fr_60px] pl-3.5 pr-3.5 gap-3.5 py-2 text-1xl" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="Email Signal"
          {...register("email")}
          className="bg-[rgba(255,255,255,0.05)] p-3.75 rounded-[15px] border border-[rgba(255,255,255,0.10)] text-white placeholder-white focus:outline-none focus:ring-1 focus:ring-white"
        />
        <button
          type="submit"
          className="bg-white text-black font-medium rounded-[15px] px-4 py-2 hover:bg-gray-300 transition"
        >
          OK
        </button>
      </form>

       {status && <p style={{ marginTop: "10px" }}>{status}</p>}
    </div>
  );
}