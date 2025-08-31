import axios from "axios";
import { parseCookies } from "nookies";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Create axios instance with auth header
export const api = () => {
  const cookies = parseCookies();
  const token = cookies.auth_token;

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
