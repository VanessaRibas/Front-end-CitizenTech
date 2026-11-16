import api from "./api";
// Se tiver uma interface para Evento, importe-a aqui. Usaremos 'any' caso queira flexibilidade.

export async function listarEventos(): Promise<any[]> {
  const response = await api.get<any[]>("/eventos"); // Rota do seu EventoController no Spring Boot
  return response.data;
}

export async function criarEvento(evento: any): Promise<any> {
  const response = await api.post<any>("/eventos", evento);
  return response.data;
}