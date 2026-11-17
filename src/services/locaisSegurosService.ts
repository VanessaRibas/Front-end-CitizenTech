import { LocalSeguro } from "../interfaces/locaisSeguros";

// Ajuste a URL base conforme o endereço da sua API Spring Boot (ex: IP local ou localhost)
const API_URL = "http://localhost:8080/locaisSeguros";

export async function listarLocaisSeguros(): Promise<LocalSeguro[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erro ao listar locais seguros: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em listarLocaisSeguros:", error);
    return [];
  }
}

export async function criarLocalSeguro(local: LocalSeguro): Promise<LocalSeguro | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(local),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar local seguro: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro em criarLocalSeguro:", error);
    return null;
  }
}