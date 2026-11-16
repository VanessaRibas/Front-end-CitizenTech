import api from "./api";
import { Alerta } from "../interfaces/alerta";

export async function listarAlertas(): Promise<Alerta[]> {
  const response = await api.get<Alerta[]>("/alertas"); // Rota do seu AlertaController no Spring Boot
  return response.data;
}

export async function criarAlerta(alerta: Omit<Alerta, "id">): Promise<Alerta> {
  const response = await api.post<Alerta>("/alertas", alerta);
  return response.data;
}