import axios from "./config";

export const sponsorService = () => {
    
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const getSponsors = async () => {
    const response = await axios.get("/sponsors", {
      headers: getAuthHeaders(),
    });

    return response;
  };

  const createSponsor = async (formData) => {
    const response = await axios.post("/sponsors", formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  };

  const updateSponsor = async (id, formData) => {
    const response = await axios.put(`/sponsors/${id}`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  };

  const deleteSponsor = async (id) => {
    const response = await axios.delete(`/sponsors/${id}`, {
      headers: getAuthHeaders(),
    });

    return response;
  };



  return {
    getSponsors,
    createSponsor,
    updateSponsor,
    deleteSponsor,
  };
};