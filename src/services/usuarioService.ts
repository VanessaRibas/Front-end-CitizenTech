import { Usuario } from "../interfaces/usuario";

// Altere para a URL correta do seu backend Spring Boot
const API_URL = "http://localhost:8080/usuario"; 

export async function listarUsuarios(): Promise<Usuario[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Erro ao buscar usuários do servidor.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro no listarUsuarios:", error);
    return [];
  }
}

export async function criarUsuario(usuario: Omit<Usuario, "id" | "criado_em">): Promise<Usuario | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...usuario,
        senhaHash: usuario.senhaHash || "123456", // Valor padrão caso não venha preenchido
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao cadastrar usuário no banco de dados.");
    }

    const novoUsuario = await response.json();
    return novoUsuario;
  } catch (error) {
    console.error("Erro no criarUsuario:", error);
    throw error;
  }
}