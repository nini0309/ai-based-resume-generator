import axios from "axios";

export const baseURLL = "http://127.0.0.1:5000";

export const axiosInstance = axios.create({
  baseURL: baseURLL,
});

export const generateResume = async (description) => {
  const response = await axiosInstance.post("/api/v1/resume/generate", {
    userDescription: description,
  });

  console.log(response.data);

  return response.data;
};
