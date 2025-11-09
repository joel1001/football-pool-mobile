import axios from "axios";

const axiosBase = axios.create({
  baseURL: "http://localhost:8080/football-pool/v1/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosBase.interceptors.request.use((config) => {
  try {
    // React Native no tiene localStorage; proteger acceso en web-only
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem("token") : undefined;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {
    // ignorar si no hay almacenamiento disponible
  }
  return config;
});

export default axiosBase;