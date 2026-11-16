export interface Alerta {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  nivelPrioridade: string;
  endereco: string;
  latitude: number;
  longitude: number;
  origemDado: string;
  nivelConfianca: number;
  dataRegistro: string;
  ativo: boolean;
}