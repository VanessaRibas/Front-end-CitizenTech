import { ContatoEmergencia } from "../interfaces/contatoEmergencia";

// Ajuste a URL base conforme a rota configurada no seu Controller do Spring Boot
const API_URL = "http://localhost:8080/contatoEmergencia";

export async function listarContatosEmergencia(): Promise<ContatoEmergencia[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erro ao listar contatos de emergência: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em listarContatosEmergencia:", error);
    return [];
  }
}

export async function criarContatoEmergencia(contato: ContatoEmergencia): Promise<ContatoEmergencia | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contato),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar contato de emergência: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro em criarContatoEmergencia:", error);
    return null;
  }
}