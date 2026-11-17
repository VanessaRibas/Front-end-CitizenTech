export interface ChamadoSOS {
  id?: number;
  pcdId: number;
  agenteId: number;
  nivelAcionamento: string;
  latitude?: number;
  longitude?: number;
  status: string; // Ex: "PENDENTE", "EM_ANDAMENTO", "CONCLUIDO"
  dataHora?: string; // Formato ISO string para data/hora
}