export interface EventoRisco {
  id: number;
  titulo: string;
  descricao: string;
  endereco: string;
  prioridade: "ALTA" | "MÉDIA" | "BAIXA";
  tipo: string;
  origem: string;
  confianca: string;
  cor?: string;
  corTexto?: string;
}