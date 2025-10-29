import axios from "axios";
import { getConfig } from "./config";

// export const baseURLL = "http://127.0.0.1:5000";

export function getAxiosInstance() {
  return axios.create({
    baseURL: getConfig().API_BASE_URL,
  });
}

export const generateResume = async (description) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post("/api/v1/resume/generate", {
    userDescription: description,
  });

  console.log(response.data);

  return response.data;
};
