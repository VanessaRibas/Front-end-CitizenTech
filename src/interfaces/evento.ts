
import type { TipoEvento } from "../types/tipoEvento";
import type { NivelPrioridade } from "../types/nivelPrioridade";
import type { StatusEvento } from "../types/statusEvento";
import type { Localizacao } from "./localizacao";

export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  tipo: TipoEvento;
  nivelPrioridade: NivelPrioridade;
  localizacao: Localizacao;
  origemDado: string;
  status: StatusEvento;
}
