import axios from "./config";

export const getSponsors = async () => {
  return axios.get("/sponsors");
};