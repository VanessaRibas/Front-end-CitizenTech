import api from "./api";
import { EventoRisco } from "../interfaces/evento";

export async function listarEventos(): Promise<EventoRisco[]> {
  const response = await api.get<EventoRisco[]>("/eventos");
  return response.data;
}

export async function buscarEventoPorId(id: number): Promise<EventoRisco> {
  const response = await api.get<EventoRisco>(`/eventos/${id}`);
  return response.data;
}

export async function criarEvento(evento: Omit<EventoRisco, "id">): Promise<EventoRisco> {
  const response = await api.post<EventoRisco>("/eventos", evento);
  return response.data;
}