export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senhaHash?: string;
  tipoPerfil: string; // Valores esperados: "pcd", "contato", "admin"
  criado_em?: string;
}