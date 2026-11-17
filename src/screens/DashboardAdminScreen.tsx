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
import { listarChamadosSOS, criarChamadoSOS, deletarChamadoSOS } from "../services/chamadoSOSService";
import { listarEventos, criarEvento } from "../services/eventoService";
import { listarLocaisSeguros } from "../services/locaisSegurosService";
import api from "../services/api";

interface DashboardAdminProps {
  userData?: any;
  onLogout: () => void;
}

type AbaAdmin = "OPERACOES" | "EVENTOS" | "EMITIR" | "PERFIL";

export function DashboardAdminScreen({ userData, onLogout }: DashboardAdminProps) {
  const [aba, setAba] = useState<AbaAdmin>("OPERACOES");
  const [emPlantao, setEmPlantao] = useState(true);
  const [carregando, setCarregando] = useState(false);

  // Estados dos dados do banco
  const [sosAtivos, setSosAtivos] = useState<any[]>([]);
  const [listaEventos, setListaEventos] = useState<any[]>([]);
  const [abrigos, setAbrigos] = useState<any[]>([]);

  // Paginação da Fila SOS (5 itens por página)
  const [paginaSos, setPaginaSos] = useState(0);
  const ITENS_POR_PAGINA = 5;

  // Estados do Formulário de Emitir Alerta / Chamado SOS
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaRegiao, setNovaRegiao] = useState("");
  const [novaSeveridade, setNovaSeveridade] = useState<"CRÍTICO" | "ALTO" | "MÉDIO">("ALTO");

  // Carrega os dados do banco ao abrir o painel (incluindo locais seguros)
  async function carregarDadosDoBanco() {
    try {
      setCarregando(true);
      const [dadosSOS, dadosEvt, dadosLocais] = await Promise.all([
        listarChamadosSOS(),
        listarEventos(),
        listarLocaisSeguros(),
      ]);
      setSosAtivos(dadosSOS || []);
      setListaEventos(dadosEvt || []);

      // Mapeia os locais seguros do banco para o formato da gestão de abrigos
      if (dadosLocais && dadosLocais.length > 0) {
        const locaisFormatados = dadosLocais.map((local: any, index: number) => ({
          id: local.id || index + 1,
          nome: local.nomeLocal || "Local Seguro",
          recurso: local.endereco || "Endereço não informado",
          status: index % 3 === 0 ? "LOTADO" : index % 2 === 0 ? "INACESSIVEL" : "ABERTO",
        }));
        setAbrigos(locaisFormatados);
      } else {
        setAbrigos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do banco:", error);
      setAbrigos([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  // Despacha a viatura pegando o ID exato, deleta do banco via service e remove da tela
  async function despacharViatura(id: number) {
    if (!id) {
      Alert.alert("Erro", "ID do chamado SOS inválido.");
      return;
    }

    try {
      setCarregando(true);
      await deletarChamadoSOS(id);
      
      const novaLista = sosAtivos.filter((item) => item.id !== id);
      setSosAtivos(novaLista);

      const totalPaginas = Math.ceil(novaLista.length / ITENS_POR_PAGINA);
      if (paginaSos >= totalPaginas && totalPaginas > 0) {
        setPaginaSos(totalPaginas - 1);
      }

      Alert.alert("🚒 Viatura Despachada", `O chamado SOS #${id} foi atendido e excluído do banco de dados!`);
    } catch (error) {
      console.error("Erro ao despachar e deletar chamado SOS:", error);
      Alert.alert("Erro", "Não foi possível remover o chamado SOS do servidor.");
    } finally {
      setCarregando(false);
    }
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

  // Auditoria e Validação de Eventos
  async function validarEvento(id: any, aprovar: boolean) {
    try {
      if (aprovar) {
        setListaEventos(
          listaEventos.map((ev) =>
            ev.id === id ? { ...ev, status: "CONFIRMADO", nivelConfianca: "100%" } : ev
          )
        );
        Alert.alert("✅ Evento Confirmado", "Status atualizado para confirmado.");
      } else {
        await api.delete(`/eventos/${id}`);
        setListaEventos(listaEventos.filter((ev) => ev.id !== id));
        Alert.alert("🗑️ Negado e Deletado", "Evento removido permanentemente da tabela eventos.");
      }
    } catch (error) {
      console.error("Erro ao processar auditoria do evento:", error);
      Alert.alert("Erro", "Não foi possível atualizar o evento no servidor.");
    }
  }

  // Emitir Alerta Oficial salvando diretamente como um Chamado SOS no banco
  async function emitirAlertaOficial() {
    if (!novoTitulo.trim() || !novaRegiao.trim()) {
      Alert.alert("Atenção", "Preencha o título e a região afetada.");
      return;
    }

    const novoChamadoSos = {
      pcdId: userData?.id || 1,
      agenteId: userData?.id || 1,
      nivelAcionamento: novaSeveridade,
      latitude: -23.5505,
      longitude: -46.6333,
      status: "PENDENTE",
      dataHora: new Date().toISOString(),
      titulo: novoTitulo,
      regiao: novaRegiao,
    };

    try {
      setCarregando(true);
      const salvoNoBanco = await criarChamadoSOS(novoChamadoSos);
      
      if (salvoNoBanco) {
        setSosAtivos([salvoNoBanco, ...sosAtivos]);
      } else {
        setSosAtivos([novoChamadoSos, ...sosAtivos]);
      }

      setNovoTitulo("");
      setNovaRegiao("");
      setAba("OPERACOES");
      Alert.alert("📢 Chamado SOS Emitido", "Salvo com sucesso na tabela chamadosSOS!");
    } catch (error) {
      console.error("Erro ao emitir chamado SOS:", error);
      Alert.alert("Erro", "Falha ao salvar chamado SOS no servidor.");
    } finally {
      setCarregando(false);
    }
  }

  // Lógica de Paginação da Fila SOS
  const totalPaginasSos = Math.ceil(sosAtivos.length / ITENS_POR_PAGINA) || 1;
  const sosPaginados = sosAtivos.slice(
    paginaSos * ITENS_POR_PAGINA,
    (paginaSos + 1) * ITENS_POR_PAGINA
  );

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
            <Text style={styles.kpiNumber}>{sosAtivos.length}</Text>
            <Text style={styles.kpiLabel}>SOS</Text>
          </View>
          <View style={[styles.kpiBox, { borderColor: "#00D4FF" }]}>
            <Text style={[styles.kpiNumber, { color: "#00D4FF" }]}>{listaEventos.length}</Text>
            <Text style={styles.kpiLabel}>Eventos</Text>
          </View>
        </View>
      </View>

      {/* CONTEÚDO DAS ABAS */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ABA 1: OPERAÇÕES (CHAMADOS SOS + ABRIGOS) */}
        {aba === "OPERACOES" && (
          <>
            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>Fila de Chamados SOS Ativos ({sosAtivos.length})</Text>
              {carregando && <ActivityIndicator size="small" color="#00FF66" />}
            </View>

            {sosAtivos.length === 0 ? (
              <Text style={{ color: "#666677", textAlign: "center", marginTop: 15, marginBottom: 15 }}>
                Nenhum chamado SOS registrado na tabela chamadosSOS.
              </Text>
            ) : (
              <View>
                {/* CONTROLE DE SETAS PARA NAVEGAR ENTRE PÁGINAS */}
                <View style={styles.paginacaoContainer}>
                  <TouchableOpacity
                    style={[styles.setaBtn, paginaSos === 0 && styles.setaBtnDisabled]}
                    disabled={paginaSos === 0}
                    onPress={() => setPaginaSos((prev) => Math.max(prev - 1, 0))}
                  >
                    <Text style={[styles.setaText, paginaSos === 0 && { color: "#444455" }]}>◀ Anterior</Text>
                  </TouchableOpacity>

                  <Text style={styles.paginacaoTexto}>
                    Página {paginaSos + 1} de {totalPaginasSos}
                  </Text>

                  <TouchableOpacity
                    style={[styles.setaBtn, paginaSos >= totalPaginasSos - 1 && styles.setaBtnDisabled]}
                    disabled={paginaSos >= totalPaginasSos - 1}
                    onPress={() => setPaginaSos((prev) => Math.min(prev + 1, totalPaginasSos - 1))}
                  >
                    <Text style={[styles.setaText, paginaSos >= totalPaginasSos - 1 && { color: "#444455" }]}>Próxima ▶</Text>
                  </TouchableOpacity>
                </View>

                {/* GRID / LISTA DOS 5 ITENS DA PÁGINA ATUAL */}
                <View style={{ gap: 10 }}>
                  {sosPaginados.map((sos) => (
                    <View key={`sos-${sos.id}`} style={styles.card}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>Chamado #{sos.id}</Text>
                        <Text style={styles.badgeRed}>{sos.nivelAcionamento}</Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <Text style={styles.specText}>👤 PCD ID: {sos.pcdId}</Text>
                        <Text style={styles.specText}>📡 Status: {sos.status}</Text>
                        <Text style={styles.infoText}>📍 Coords: {sos.latitude?.toFixed(4)}, {sos.longitude?.toFixed(4)}</Text>
                        <Text style={styles.infoText}>🕒 {sos.dataHora ? new Date(sos.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.actionBtn}
                        disabled={carregando}
                        onPress={() => despacharViatura(sos.id)}
                      >
                        <Text style={styles.actionBtnText}>🚒 Despachar Viatura & Deletar SOS</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={[styles.rowBetween, { marginTop: 25 }]}>
              <Text style={styles.sectionTitle}>🏢 Gestão de Abrigos Públicos Acessíveis</Text>
              <TouchableOpacity onPress={carregarDadosDoBanco}>
                <Text style={{ color: "#00D4FF", fontSize: 11, fontWeight: "bold" }}>🔄 Atualizar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Toque no status para alternar disponibilidade:</Text>

            {abrigos.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Sem locais seguros cadastrados</Text>
              </View>
            ) : (
              abrigos.map((ab) => (
                <View key={ab.id} style={styles.shelterCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shelterName}>{ab.nome}</Text>
                    <Text style={styles.shelterSub}>
                      📍 {ab.recurso}
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
              ))
            )}
          </>
        )}

        {/* ABA 2: EVENTOS */}
        {aba === "EVENTOS" && (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>📋 Gestão de Eventos & Auditoria ({listaEventos.length})</Text>
              {carregando && <ActivityIndicator size="small" color="#00FF66" />}
            </View>

            {listaEventos.length === 0 ? (
              <Text style={{ color: "#666677", textAlign: "center", marginTop: 20 }}>
                Nenhum evento registrado no banco.
              </Text>
            ) : (
              listaEventos.map((ev, index) => (
                <View key={`evento-${ev.id || index}`} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text
                      style={[
                        styles.badgeStatus,
                        (ev.status === "CONFIRMADO" || ev.nivelConfianca === "100%") ? styles.badgeGreen : styles.badgeAmber,
                      ]}
                    >
                      {(ev.status === "CONFIRMADO" || ev.nivelConfianca === "100%") ? "✔ CONFIRMADO" : "⏳ EM VALIDAÇÃO"}
                    </Text>
                    <Text style={styles.badgeCyan}>Confiança: {ev.nivelConfianca || "100%"}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{ev.titulo}</Text>
                  <Text style={styles.infoText}>📍 Endereço / Local: {ev.endereco || ev.local}</Text>
                  <Text style={styles.infoText}>📡 Origem: {ev.origemDado || "Defesa Civil"} | Severidade: {ev.nivelPrioridade || "ALTO"}</Text>
                  <Text style={styles.infoText}>📝 {ev.descricao}</Text>

                  <View style={styles.valActionsRow}>
                    <TouchableOpacity
                      style={[styles.valBtn, { backgroundColor: "#00FF66" }]}
                      onPress={() => validarEvento(ev.id, true)}
                    >
                      <Text style={{ color: "#0B0B0E", fontWeight: "bold", fontSize: 12 }}>
                        ✅ Confirmar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.valBtn, { backgroundColor: "#2A121A", borderWidth: 1, borderColor: "#FF0055" }]}
                      onPress={() => validarEvento(ev.id, false)}
                    >
                      <Text style={{ color: "#FF0055", fontWeight: "bold", fontSize: 12 }}>
                        ✕ Negar / Deletar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ABA 3: EMITIR */}
        {aba === "EMITIR" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📢 Emitir Chamado SOS (Salvar em chamadosSOS)</Text>
            <Text style={styles.helperText}>
              Emitir um chamado oficial registrará os dados diretamente na tabela de chamados SOS do backend.
            </Text>

            <Text style={styles.inputLabel}>NÍVEL DE SEVERIDADE / ACIONAMENTO</Text>
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

            <Text style={styles.inputLabel}>TÍTULO DO CHAMADO</Text>
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
                {carregando ? "Salvando no Banco..." : "🚨 Disparar e Salvar Chamado SOS"}
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

        <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("EVENTOS")}>
          <Text style={[styles.tabIcon, aba === "EVENTOS" && styles.tabActive]}>📋</Text>
          <Text style={[styles.tabText, aba === "EVENTOS" && styles.tabActive]}>Eventos</Text>
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
  emptyCard: {
    backgroundColor: "#141419",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#22222E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyText: {
    color: "#666677",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  paginacaoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#141419",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  setaBtn: {
    backgroundColor: "#1C1C26",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333344",
  },
  setaBtnDisabled: {
    opacity: 0.5,
  },
  setaText: {
    color: "#00D4FF",
    fontWeight: "bold",
    fontSize: 12,
  },
  paginacaoTexto: {
    color: "#CCCCDD",
    fontSize: 12,
    fontWeight: "bold",
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
  badgeGreen: { backgroundColor: "#12242A", color: "#00FF66" },
  badgeAmber: { backgroundColor: "#2A2212", color: "#FBBF24" },
  specText: { color: "#00D4FF", fontSize: 12, fontWeight: "600", marginBottom: 4 },
  infoText: { color: "#9999AA", fontSize: 12, marginBottom: 6 },
  actionBtn: {
    backgroundColor: "#FF0055",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
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