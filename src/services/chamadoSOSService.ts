import api from "./api";
import { ChamadoSOS } from "../interfaces/chamadoSOS";

export async function listarChamadosSOS(): Promise<ChamadoSOS[]> {
  try {
    const response = await api.get<ChamadoSOS[]>("/chamadosSOS");
    return response.data;
  } catch (error) {
    console.error("Erro ao listar chamados SOS:", error);
    return [];
  }
}

export async function criarChamadoSOS(chamado: Omit<ChamadoSOS, "id">): Promise<ChamadoSOS> {
  try {
    const response = await api.post<ChamadoSOS>("/chamadosSOS", {
      ...chamado,
      dataHora: chamado.dataHora || new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar chamado SOS:", error);
    throw error;
  }
}

export async function atualizarStatusChamadoSOS(id: number, status: string): Promise<ChamadoSOS> {
  try {
    const response = await api.put<ChamadoSOS>(`/chamadosSOS/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status do chamado SOS:", error);
    throw error;
  }
}

// ➔ Nova função adicionada para deletar corretamente o chamado SOS pelo ID
export async function deletarChamadoSOS(id: number): Promise<void> {
  try {
    await api.delete(`/chamadosSOS/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar chamado SOS ID ${id}:`, error);
    throw error;
  }
}