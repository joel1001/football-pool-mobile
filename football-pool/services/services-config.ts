import axios from "axios";
import { Platform } from "react-native";

// En Android emulator, localhost no funciona. Usar 10.0.2.2
// En iOS simulator, localhost funciona correctamente
// Para dispositivo físico, necesitas usar la IP de tu computadora
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    // Para Android emulator
    return "http://10.0.2.2:8080/football-pool/v1/api/";
    
    // Si usas dispositivo físico Android, comenta la línea de arriba y usa tu IP local:
    // return "http://TU_IP_LOCAL:8080/football-pool/v1/api/";
    // Ejemplo: return "http://192.168.1.100:8080/football-pool/v1/api/";
  }
  
  // Para iOS y Web
  return "http://localhost:8080/football-pool/v1/api/";
};

const axiosBase = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log para debug
console.log(`🌐 API Base URL (${Platform.OS}):`, getBaseURL());

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