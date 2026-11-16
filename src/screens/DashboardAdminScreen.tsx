import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

interface DashboardAdminProps {
  userData?: any;
  onLogout: () => void;
}

type AbaAdmin = "OPERACOES" | "ALERTAS" | "EMITIR" | "PERFIL";

export function DashboardAdminScreen({ userData, onLogout }: DashboardAdminProps) {
  const [aba, setAba] = useState<AbaAdmin>("OPERACOES");
  const [emPlantao, setEmPlantao] = useState(true);

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

  // Lista Completa de Alertas (Oficiais + Comunitários)
  const [todosAlertas, setTodosAlertas] = useState([
    {
      id: 101,
      titulo: "Alagamento Intransitável - Av. Paulista",
      local: "Altura do nº 1500",
      origem: "Sensor IoT #402 / Defesa Civil",
      confianca: 100,
      severidade: "CRÍTICO",
      status: "CONFIRMADO",
    },
    {
      id: 102,
      titulo: "Rampa obstruída por galhos",
      local: "Rua Augusta x Oscar Freire",
      origem: "Comunidade (1 relato)",
      confianca: 40,
      severidade: "MÉDIO",
      status: "EM_VALIDACAO",
    },
    {
      id: 103,
      titulo: "Chuva forte e granizo",
      local: "Bela Vista / Brigadeiro",
      origem: "Comunidade (4 relatos)",
      confianca: 75,
      severidade: "ALTO",
      status: "EM_VALIDACAO",
    },
  ]);

  // Estados do Formulário de Novo Alerta Oficial
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaRegiao, setNovaRegiao] = useState("");
  const [novaSeveridade, setNovaSeveridade] = useState<"CRÍTICO" | "ALTO" | "MÉDIO">("ALTO");

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

  function validarAlerta(id: number, aprovar: boolean) {
    if (aprovar) {
      setTodosAlertas(
        todosAlertas.map((al) =>
          al.id === id ? { ...al, confianca: 100, status: "CONFIRMADO" } : al
        )
      );
      Alert.alert("✅ Alerta Confirmado", "Confiança elevada para 100% e publicado no mapa público.");
    } else {
      setTodosAlertas(todosAlertas.filter((al) => al.id !== id));
      Alert.alert("🗑️ Descartado", "Falso alarme removido da base operacional.");
    }
  }

  function emitirAlertaOficial() {
    if (!novoTitulo.trim() || !novaRegiao.trim()) {
      Alert.alert("Atenção", "Preencha o título e a região afetada.");
      return;
    }

    const novo = {
      id: Date.now(),
      titulo: novoTitulo,
      local: novaRegiao,
      origem: `Oficial (${userData?.orgao || "Defesa Civil"})`,
      confianca: 100,
      severidade: novaSeveridade,
      status: "CONFIRMADO",
    };

    setTodosAlertas([novo, ...todosAlertas]);
    setNovoTitulo("");
    setNovaRegiao("");
    setAba("ALERTAS");
    Alert.alert("📢 Alerta Disparado", "Notificação enviada para todos os usuários PCD na área!");
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
            <Text style={styles.kpiLabel}>Alertas</Text>
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

        {/* ABA 2: TODOS OS ALERTAS E VALIDAÇÃO */}
        {aba === "ALERTAS" && (
          <>
            <Text style={styles.sectionTitle}>📋 Todos os Alertas & Auditoria ({todosAlertas.length})</Text>
            {todosAlertas.map((al) => (
              <View key={al.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text
                    style={[
                      styles.badgeStatus,
                      al.status === "CONFIRMADO" ? styles.badgeGreen : styles.badgeAmber,
                    ]}
                  >
                    {al.status === "CONFIRMADO" ? "✔ CONFIRMADO" : "⏳ EM VALIDAÇÃO"}
                  </Text>
                  <Text style={styles.badgeCyan}>Confiança: {al.confianca}%</Text>
                </View>

                <Text style={styles.cardTitle}>{al.titulo}</Text>
                <Text style={styles.infoText}>📍 Região: {al.local}</Text>
                <Text style={styles.infoText}>📡 Origem: {al.origem} • Severidade: {al.severidade}</Text>

                {al.status === "EM_VALIDACAO" && (
                  <View style={styles.valActionsRow}>
                    <TouchableOpacity
                      style={[styles.valBtn, { backgroundColor: "#00FF66" }]}
                      onPress={() => validarAlerta(al.id, true)}
                    >
                      <Text style={{ color: "#0B0B0E", fontWeight: "bold", fontSize: 12 }}>
                        ✅ Confirmar (100%)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.valBtn, { backgroundColor: "#2A121A", borderWidth: 1, borderColor: "#FF0055" }]}
                      onPress={() => validarAlerta(al.id, false)}
                    >
                      <Text style={{ color: "#FF0055", fontWeight: "bold", fontSize: 12 }}>
                        ✕ Descartar
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* ABA 3: EMITIR ALERTA OFICIAL */}
        {aba === "EMITIR" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📢 Emitir Alerta Oficial (Confiança 100%)</Text>
            <Text style={styles.helperText}>
              Alertas oficiais têm prioridade máxima e recalculam rotas automaticamente.
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

            <TouchableOpacity style={styles.emitBtn} onPress={emitirAlertaOficial}>
              <Text style={styles.emitBtnText}>🚨 Disparar Alerta para Todos os Usuários</Text>
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
          <Text style={[styles.tabText, aba === "ALERTAS" && styles.tabActive]}>Alertas</Text>
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