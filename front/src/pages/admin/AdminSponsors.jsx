import { useEffect, useState } from "react";
import { sponsorService } from "../../api/adminSponsors";
import { UPLOAD_BASE } from "../../utils/constants";

export default function SponsorsAdmin() {
  const { getSponsors, createSponsor, deleteSponsor } = sponsorService();

  const [sponsors, setSponsors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    url: "",
    logo: null,
  });

  // Charger sponsors
  const fetchSponsors = async () => {
    try {
      const response = await getSponsors();
      setSponsors(response.data);
    } catch (error) {
      console.error("Erreur récupération sponsors :", error);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);


  //  Gestion formulaire
  const handleChange = (e) => {
    if (e.target.name === "logo") {
      setForm({ ...form, logo: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };



  //  Ajouter sponsor
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("url", form.url);
      formData.append("logo", form.logo);

      await createSponsor(formData);

      // Reset form
      setForm({
        name: "",
        category: "",
        url: "",
        logo: null,
      });

      fetchSponsors();
    } catch (error) {
      console.error("Erreur création sponsor :", error);
    }
  };


  //  Supprimer sponsor
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce sponsor ?")) return;

    try {
      await deleteSponsor(id);
      fetchSponsors();
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };


  //  RETURN FINAL
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion Sponsors</h1>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nom"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">Choisir catégorie</option>
          <option value="officiels">Officiels</option>
          <option value="medias">Medias</option>
          <option value="techniques">Techniques</option>
          <option value="divers">Divers</option>
        </select>

        <input
          type="text"
          name="url"
          placeholder="URL"
          value={form.url}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="file"
          name="logo"
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <button
          type="submit"
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>


      {/* LISTE SPONSORS */}
      <div className="grid grid-cols-3 gap-6">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id_sponsor} className="border p-4 rounded">
            <img
              src={`${UPLOAD_BASE}${sponsor.logo}`}
              alt={sponsor.name}
              className="h-20 object-contain mb-2"
            />

            <h3 className="font-semibold">{sponsor.name}</h3>
            <p className="text-sm text-gray-600">
              Catégorie : {sponsor.category}
            </p>

            <button
              onClick={() => handleDelete(sponsor.id_sponsor)}
              className="text-red-500 mt-2"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}