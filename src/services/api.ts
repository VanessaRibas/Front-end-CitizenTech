import axios from "axios";

// ATENÇÃO:
// - Expo Web / iOS Simulator: http://localhost:8080
// - Android Emulator: http://10.0.2.2:8080
// - Dispositivo Físico: Use o IP da sua máquina (ex: http://192.168.1.15:8080)
const BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;