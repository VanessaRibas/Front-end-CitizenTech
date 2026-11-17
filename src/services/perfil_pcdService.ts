import api from "./api";
import { PerfilPcd } from "../interfaces/perfilPcd";

export async function listarPerfisPcd(): Promise<PerfilPcd[]> {
  try {
    const response = await api.get<PerfilPcd[]>("/perfil_pcd"); // Ajuste a rota conforme seu PerfilPcdController
    return response.data;
  } catch (error) {
    console.error("Erro ao listar perfis PCD:", error);
    return [];
  }
}

export async function buscarPerfilPcdPorUsuario(usuarioId: number): Promise<PerfilPcd | null> {
  try {
    const response = await api.get<PerfilPcd>(`/perfil_pcd/usuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar perfil PCD do usuário:", error);
    return null;
  }
}

export async function criarPerfilPcd(perfil: Omit<PerfilPcd, "id">): Promise<PerfilPcd> {
  try {
    const response = await api.post<PerfilPcd>("/perfil_pcd", perfil);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar perfil PCD:", error);
    throw error;
  }
}