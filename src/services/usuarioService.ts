
import { Usuario } from "../interfaces/usuario";

const API_URL = "http://localhost:8080/usuario";

export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar usuários. Status: ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("O servidor retornou uma resposta inválida.");
  }

  return data;
}

export async function criarUsuario(
  usuario: Omit<Usuario, "id" | "criado_em">
): Promise<Usuario> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...usuario,
      senhaHash: usuario.senhaHash || "123456",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao cadastrar usuário. Status: ${response.status}`
    );
  }

  return await response.json();
}
