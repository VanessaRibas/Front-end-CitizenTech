export interface PerfilPcd {
  id?: number;
  usuario_id: number;
  tipoDeficiencia: string; // Ex: "Visual", "Mobilidade Reduzida", "Auditiva"
  enderecoResidencial: string;
  telefoneEmergencia: string;
}