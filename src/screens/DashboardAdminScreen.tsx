import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { listarEventos, criarEvento } from "../services/eventoService";
import api from "../services/api"; // Certifique-se que o caminho do api está correto

interface DashboardAdminProps {
  userData?: any;
  onLogout: () => void;
}

type AbaAdmin = "OPERACOES" | "ALERTAS" | "EMITIR" | "PERFIL";

export function DashboardAdminScreen({ userData, onLogout }: DashboardAdminProps) {
  const [aba, setAba] = useState<AbaAdmin>("OPERACOES");
  const [emPlantao, setEmPlantao] = useState(true);
  const [carregando, setCarregando] = useState(false);

  // Fila de Chamados SOS
  const [sosAtivos, setSosAtivos] = useState([
    {
      id: 1,
      nome: "Lucas Almeida",
      idade: "29 anos",
      tipo: "Cadeirante (Mobilidade Reduzida)",
      local: "Av. Paulista, 1578 (Trianon)",
      situacao: "Ilhado por enxurrada / alagamento severo",
      despachado: false,
    },
    {
      id: 2,
      nome: "Beatriz Souza",
      idade: "34 anos",
      tipo: "Deficiência Visual Total",
      local: "Rua Augusta, 900 - Consolação",
      situacao: "Sem resposta ao Check-in de Segurança (3 min)",
      despachado: false,
    },
  ]);

  // Gestão de Abrigos Públicos
  const [abrigos, setAbrigos] = useState([
    { id: 1, nome: "Estação Consolação (Metrô)", recurso: "Elevador OK", ocupacao: "45/100", status: "ABERTO" },
    { id: 2, nome: "E.E. Rodrigues Alves", recurso: "Rampa OK", ocupacao: "80/80", status: "LOTADO" },
    { id: 3, nome: "UBS Jardim Paulista", recurso: "Banheiro Adaptado", ocupacao: "12/40", status: "ABERTO" },
  ]);

  // Lista de Alertas / Eventos vindos do Banco de Dados
  const [todosAlertas, setTodosAlertas] = useState<any[]>([]);

  // Estados do Formulário de Novo Alerta Oficial
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaRegiao, setNovaRegiao] = useState("");
  const [novaSeveridade, setNovaSeveridade] = useState<"CRÍTICO" | "ALTO" | "MÉDIO">("ALTO");

  // Carrega os eventos/alertas do banco ao abrir o painel
  async function carregarEventosDoBanco() {
    try {
      setCarregando(true);
      const dados = await listarEventos();
      // Mapeia os dados do evento para o formato de alerta do painel, se necessário
      setTodosAlertas(dados || []);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEventosDoBanco();
  }, []);

  function despacharViatura(id: number, nome: string) {
    setSosAtivos(sosAtivos.map((item) => (item.id === id ? { ...item, despachado: true } : item)));
    Alert.alert("🚒 Viatura Despachada", `Equipe adaptada enviada para resgatar ${nome}!`);
  }

  function alternarStatusAbrigo(id: number) {
    const ordem = ["ABERTO", "LOTADO", "INACESSIVEL"];
    setAbrigos(
      abrigos.map((ab) => {
        if (ab.id !== id) return ab;
        const proximo = ordem[(ordem.indexOf(ab.status) + 1) % ordem.length];
        return { ...ab, status: proximo };
      })
    );
  }

  // Função para validar (Confirmar ou Negar/Deletar do Banco)
  async function validarAlerta(id: any, aprovar: boolean) {
    try {
      if (aprovar) {
        // Atualiza status para confirmado no backend ou estado local
        setTodosAlertas(
          todosAlertas.map((al) =>
            al.id === id ? { ...al, confianca: 100, status: "CONFIRMADO" } : al
          )
        );
        Alert.alert("✅ Alerta Confirmado", "Confiança elevada para 100% e publicado no mapa.");
      } else {
        // SE NEGADO: Deleta o evento/alerta diretamente do banco de dados
        await api.delete(`/eventos/${id}`);

        // Remove da lista local
        setTodosAlertas(todosAlertas.filter((al) => al.id !== id));
        Alert.alert("🗑️ Descartado e Deletado", "Registro removido permanentemente do banco de dados.");
      }
    } catch (error) {
      console.error("Erro ao processar auditoria do evento:", error);
      Alert.alert("Erro", "Não foi possível atualizar o registro no servidor.");
    }
  }

  // Emite novo alerta e salva como Evento no banco de dados
  async function emitirAlertaOficial() {
    if (!novoTitulo.trim() || !novaRegiao.trim()) {
      Alert.alert("Atenção", "Preencha o título e a região afetada.");
      return;
    }

    const novoEvento = {
      titulo: novoTitulo,
      descricao: `Severidade: ${novaSeveridade} - Região: ${novaRegiao}`,
      endereco: novaRegiao,
      tipo: "ALERTA_OFICIAL",
      origemDado: `Oficial (${userData?.orgao || "Defesa Civil"})`,
      nivelConfianca: "100%",
      nivelPrioridade: novaSeveridade,
      status: "CONFIRMADO",
    };

    try {
      setCarregando(true);
      const salvoNoBanco = await criarEvento(novoEvento);
      
      if (salvoNoBanco) {
        setTodosAlertas([salvoNoBanco, ...todosAlertas]);
      } else {
        // Fallback caso a API retorne vazio mas execute com sucesso
        setTodosAlertas([novoEvento, ...todosAlertas]);
      }

      setNovoTitulo("");
      setNovaRegiao("");
      setAba("ALERTAS");
      Alert.alert("📢 Alerta Disparado", "Notificação oficial salva no banco e enviada aos usuários!");
    } catch (error) {
      console.error("Erro ao emitir alerta:", error);
      Alert.alert("Erro", "Falha ao salvar alerta oficial no servidor.");
    } finally {
      setCarregando(false);
    }
  }

  const nomeAgente = userData?.nome || "Agente Silva";
  const orgaoAgente = userData?.orgao || "Defesa Civil Municipal";
  const matriculaAgente = userData?.matricula || "DC-2026-89";

  return (
    <View style={styles.container}>
      {/* CABEÇALHO SUPERIOR */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🛡️ CCO Operacional</Text>
          <Text style={styles.subtitle}>
            {orgaoAgente} • {emPlantao ? "🟢 Em Plantão" : "⚪ Fora de Turno"}
          </Text>
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiNumber}>
              {sosAtivos.filter((s) => !s.despachado).length}
            </Text>
            <Text style={styles.kpiLabel}>SOS</Text>
          </View>
          <View style={[styles.kpiBox, { borderColor: "#00D4FF" }]}>
            <Text style={[styles.kpiNumber, { color: "#00D4FF" }]}>{todosAlertas.length}</Text>
            <Text style={styles.kpiLabel}>Eventos</Text>
          </View>
        </View>
      </View>

      {/* CONTEÚDO DAS ABAS */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ABA 1: OPERAÇÕES (SOS + ABRIGOS) */}
        {aba === "OPERACOES" && (
          <>
            <Text style={styles.sectionTitle}>🚨 Chamados Críticos (Resgate Prioritário PCD)</Text>
            {sosAtivos.map((sos) => (
              <View key={sos.id} style={[styles.card, sos.despachado && { opacity: 0.7 }]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>
                    {sos.nome} ({sos.idade})
                  </Text>
                  <Text style={styles.badgeRed}>PRIORIDADE ZERO</Text>
                </View>
                <Text style={styles.specText}>♿ {sos.tipo}</Text>
                <Text style={styles.infoText}>📍 {sos.local}</Text>
                <Text style={styles.infoText}>⚠️ {sos.situacao}</Text>

                <TouchableOpacity
                  style={[styles.actionBtn, sos.despachado && styles.btnDone]}
                  disabled={sos.despachado}
                  onPress={() => despacharViatura(sos.id, sos.nome)}
                >
                  <Text style={styles.actionBtnText}>
                    {sos.despachado ? "✅ Viatura Adaptada a Caminho" : "🚒 Despachar Viatura Adaptada"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.sectionTitle}>🏢 Gestão de Abrigos Públicos Acessíveis</Text>
            <Text style={styles.helperText}>Toque no status para alternar disponibilidade:</Text>
            {abrigos.map((ab) => (
              <View key={ab.id} style={styles.shelterCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shelterName}>{ab.nome}</Text>
                  <Text style={styles.shelterSub}>
                    {ab.recurso} • Ocupação: {ab.ocupacao}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.statusPill,
                    ab.status === "ABERTO" && { backgroundColor: "#122A1A", borderColor: "#00FF66" },
                    ab.status === "LOTADO" && { backgroundColor: "#2A2212", borderColor: "#F59E0B" },
                    ab.status === "INACESSIVEL" && { backgroundColor: "#2A121A", borderColor: "#FF0055" },
                  ]}
                  onPress={() => alternarStatusAbrigo(ab.id)}
                >
                  <Text style={styles.statusPillText}>{ab.status}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* ABA 2: EVENTOS, ALERTAS E AUDITORIA */}
        {aba === "ALERTAS" && (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>📋 Eventos & Auditoria ({todosAlertas.length})</Text>
              {carregando && <ActivityIndicator size="small" color="#00FF66" />}
            </View>

            {todosAlertas.length === 0 ? (
              <Text style={{ color: "#666677", textAlign: "center", marginTop: 20 }}>
                Nenhum evento registrado no banco.
              </Text>
            ) : (
              todosAlertas.map((al, index) => (
                <View key={`alerta-${al.id || index}`} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text
                      style={[
                        styles.badgeStatus,
                        (al.status === "CONFIRMADO" || al.nivelConfianca === "100%") ? styles.badgeGreen : styles.badgeAmber,
                      ]}
                    >
                      {(al.status === "CONFIRMADO" || al.nivelConfianca === "100%") ? "✔ CONFIRMADO" : "⏳ EM VALIDAÇÃO"}
                    </Text>
                    <Text style={styles.badgeCyan}>Confiança: {al.nivelConfianca || `${al.confianca}%`}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{al.titulo}</Text>
                  <Text style={styles.infoText}>📍 Região: {al.endereco || al.local}</Text>
                  <Text style={styles.infoText}>📡 Origem: {al.origemDado || al.origem} | Severidade: {al.nivelPrioridade || al.severidade}</Text>
                  <Text style={styles.infoText}>📝 {al.descricao}</Text>

                  {/* Ações de Auditoria: Se negado, deleta do banco */}
                  <div style={{ display: 'flex' }}>
                    <View style={styles.valActionsRow}>
                      <TouchableOpacity
                        style={[styles.valBtn, { backgroundColor: "#00FF66" }]}
                        onPress={() => validarAlerta(al.id, true)}
                      >
                        <Text style={{ color: "#0B0B0E", fontWeight: "bold", fontSize: 12 }}>
                          ✅ Confirmar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.valBtn, { backgroundColor: "#2A121A", borderWidth: 1, borderColor: "#FF0055" }]}
                        onPress={() => validarAlerta(al.id, false)}
                      >
                        <Text style={{ color: "#FF0055", fontWeight: "bold", fontSize: 12 }}>
                          ✕ Negar / Deletar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </div>
                </View>
              ))
            )}
          </>
        )}

        {/* ABA 3: EMITIR ALERTA OFICIAL (SALVA COMO EVENTO NO BANCO) */}
        {aba === "EMITIR" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📢 Emitir Alerta Oficial (Salvar Evento)</Text>
            <Text style={styles.helperText}>
              Alertas oficiais salvam diretamente na tabela de eventos do banco de dados.
            </Text>

            <Text style={styles.inputLabel}>NÍVEL DE SEVERIDADE</Text>
            <View style={styles.rowGap}>
              {(["CRÍTICO", "ALTO", "MÉDIO"] as const).map((niv) => (
                <TouchableOpacity
                  key={niv}
                  style={[styles.sevChip, novaSeveridade === niv && styles.sevChipActive]}
                  onPress={() => setNovaSeveridade(niv)}
                >
                  <Text style={styles.sevChipText}>{niv}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>TÍTULO DA OCORRÊNCIA</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Alagamento Severo / Queda de Árvore"
              placeholderTextColor="#666677"
              value={novoTitulo}
              onChangeText={setNovoTitulo}
            />

            <Text style={styles.inputLabel}>REGIÃO OU VIA AFETADA</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Av. Paulista, altura nº 1200"
              placeholderTextColor="#666677"
              value={novaRegiao}
              onChangeText={setNovaRegiao}
            />

            <TouchableOpacity 
              style={[styles.emitBtn, carregando && { opacity: 0.7 }]} 
              onPress={emitirAlertaOficial}
              disabled={carregando}
            >
              <Text style={styles.emitBtnText}>
                {carregando ? "Salvando no Banco..." : "🚨 Disparar e Salvar Evento"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ABA 4: PERFIL DO AGENTE */}
        {aba === "PERFIL" && (
          <View style={styles.card}>
            <View style={styles.profileCenter}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>{nomeAgente.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.profileName}>{nomeAgente}</Text>
              <Text style={styles.profileRole}>{orgaoAgente}</Text>
            </View>

            <View style={styles.profileInfoBox}>
              <Text style={styles.profileLine}>🪪 Matrícula Funcional: {matriculaAgente}</Text>
              <Text style={styles.profileLine}>📧 E-mail: {userData?.email || "admin@defesacivil.gov.br"}</Text>
              <Text style={styles.profileLine}>📡 Setor: Centro de Controle Operacional (CCO)</Text>
            </View>

            <TouchableOpacity
              style={styles.shiftBtn}
              onPress={() => setEmPlantao(!emPlantao)}
            >
              <Text style={styles.shiftBtnText}>
                {emPlantao ? "⏸️ Pausar Turno de Plantão" : "▶️ Iniciar Turno de Plantão"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutFullBtn} onPress={onLogout}>
              <Text style={styles.logoutFullText}>Encerrar Sessão Operacional</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MENU INFERIOR DO AGENTE */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("OPERACOES")}>
          <Text style={[styles.tabIcon, aba === "OPERACOES" && styles.tabActive]}>🚨</Text>
          <Text style={[styles.tabText, aba === "OPERACOES" && styles.tabActive]}>Operações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("ALERTAS")}>
          <Text style={[styles.tabIcon, aba === "ALERTAS" && styles.tabActive]}>📋</Text>
          <Text style={[styles.tabText, aba === "ALERTAS" && styles.tabActive]}>Eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("EMITIR")}>
          <Text style={[styles.tabIcon, aba === "EMITIR" && styles.tabActive]}>📢</Text>
          <Text style={[styles.tabText, aba === "EMITIR" && styles.tabActive]}>Emitir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("PERFIL")}>
          <Text style={[styles.tabIcon, aba === "PERFIL" && styles.tabActive]}>👤</Text>
          <Text style={[styles.tabText, aba === "PERFIL" && styles.tabActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0E" },
  header: {
    backgroundColor: "#141419",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  logo: { fontSize: 21, fontWeight: "bold", color: "#FFFFFF" },
  subtitle: { color: "#888899", fontSize: 12, marginTop: 4 },
  kpiRow: { flexDirection: "row", gap: 8 },
  kpiBox: {
    backgroundColor: "#1C1C26",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF0055",
  },
  kpiNumber: { color: "#FF0055", fontWeight: "bold", fontSize: 15 },
  kpiLabel: { color: "#888899", fontSize: 9 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginTop: 8, marginBottom: 10 },
  helperText: { color: "#888899", fontSize: 12, marginBottom: 12 },
  card: {
    backgroundColor: "#141419",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#22222E",
    marginBottom: 12,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  badgeRed: {
    backgroundColor: "#2A121A",
    color: "#FF0055",
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeCyan: {
    backgroundColor: "#12242A",
    color: "#00D4FF",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeStatus: { fontSize: 10, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeGreen: { backgroundColor: "#122A1A", color: "#00FF66" },
  badgeAmber: { backgroundColor: "#2A2212", color: "#FBBF24" },
  specText: { color: "#00D4FF", fontSize: 12, fontWeight: "600", marginBottom: 4 },
  infoText: { color: "#9999AA", fontSize: 12, marginBottom: 6 },
  actionBtn: {
    backgroundColor: "#FF0055",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  btnDone: { backgroundColor: "#1C1C26", borderWidth: 1, borderColor: "#00FF66" },
  actionBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 12 },
  shelterCard: {
    backgroundColor: "#141419",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#22222E",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shelterName: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  shelterSub: { color: "#888899", fontSize: 11, marginTop: 4 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusPillText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  valActionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  valBtn: { flex: 1, padding: 11, borderRadius: 8, alignItems: "center" },
  inputLabel: { color: "#888899", fontSize: 10, fontWeight: "bold", marginTop: 12, marginBottom: 6 },
  rowGap: { flexDirection: "row", gap: 8 },
  sevChip: {
    flex: 1,
    backgroundColor: "#1C1C26",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E2E3E",
  },
  sevChipActive: { backgroundColor: "#2A121A", borderColor: "#FF0055" },
  sevChipText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  input: {
    backgroundColor: "#1C1C26",
    borderWidth: 1,
    borderColor: "#2E2E3E",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 13,
  },
  emitBtn: {
    backgroundColor: "#FF0055",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },
  emitBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  profileCenter: { alignItems: "center", marginBottom: 18 },
  agentAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#12242A",
    borderWidth: 2,
    borderColor: "#00D4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  agentAvatarText: { color: "#00D4FF", fontSize: 28, fontWeight: "bold" },
  profileName: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  profileRole: { color: "#00FF66", fontSize: 12, marginTop: 4, fontWeight: "600" },
  profileInfoBox: {
    backgroundColor: "#1C1C26",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  profileLine: { color: "#CCCCDD", fontSize: 12 },
  shiftBtn: {
    backgroundColor: "#1C1C26",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00D4FF",
    marginBottom: 10,
  },
  shiftBtnText: { color: "#00D4FF", fontWeight: "bold", fontSize: 13 },
  logoutFullBtn: {
    backgroundColor: "#2A121A",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF0055",
  },
  logoutFullText: { color: "#FF0055", fontWeight: "bold", fontSize: 13 },
  bottomBar: {
    height: 64,
    backgroundColor: "#141419",
    borderTopWidth: 1,
    borderTopColor: "#22222E",
    flexDirection: "row",
  },
  tabBtn: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabIcon: { fontSize: 18, color: "#666677" },
  tabText: { fontSize: 10, color: "#666677", marginTop: 3 },
  tabActive: { color: "#00D4FF", fontWeight: "bold" },
});