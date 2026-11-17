import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Svg, { Path, Circle, Line, Rect } from "react-native-svg";
import { listarContatosEmergencia } from "../services/contatoEmergenciaService";
import { listarUsuarios } from "../services/usuarioService";

interface DashboardContactProps {
  userData?: any;
  onLogout: () => void;
}

type AbaContato = "MONITORAR" | "ALERTAS" | "PERFIL";

interface PcdVinculadoItem {
  id: number | string;
  nome: string;
  perfil: string;
  distancia: string;
  rotaAtiva: string;
  bateria: string;
  status: "ATENÇÃO" | "SEGURO";
  pinLeft: `${number}%`;
  pinTop: `${number}%`;
}

export function DashboardContactScreen({ userData, onLogout }: DashboardContactProps) {
  const [aba, setAba] = useState<AbaContato>("MONITORAR");
  const [alertaSonoroCritico, setAlertaSonoroCritico] = useState(true);

  const [pcdsVinculados, setPcdsVinculados] = useState<PcdVinculadoItem[]>([]);
  const [pcdIndex, setPcdIndex] = useState<number>(0);
  const [carregandoPcd, setCarregandoPcd] = useState<boolean>(true);

  const [modalReportVisible, setModalReportVisible] = useState(false);
  const [tipoRiscoReport, setTipoRiscoReport] = useState("🌊 Alagamento na Via");
  const [localReport, setLocalReport] = useState("");
  const [descReport, setDescReport] = useState("");

  const nomeContato = userData?.nome || "Mariana (Rede de Apoio)";
  const telefoneLogado = userData?.telefone;
  const usuarioIdLogado = userData?.id;

  useEffect(() => {
    async function resolverPcdsVinculados() {
      try {
        setCarregandoPcd(true);
        const [listaContatos, listaUsuarios] = await Promise.all([
          listarContatosEmergencia(),
          listarUsuarios(),
        ]);

        const vinculosEncontrados = (listaContatos || []).filter((c: any) => {
          const bateTelefone =
            telefoneLogado && c.telefone?.trim() === telefoneLogado.trim();
          const bateId =
            usuarioIdLogado &&
            Number(c.usuario_id || c.usuarioId) === Number(usuarioIdLogado);
          return bateTelefone || bateId;
        });

        const mapeados: PcdVinculadoItem[] = [];

        vinculosEncontrados.forEach((vinculo: any, idx: number) => {
          const pcdId = vinculo.pcd_id || vinculo.pcdId;
          const usuarioPcd = (listaUsuarios || []).find(
            (u: any) => Number(u.id) === Number(pcdId)
          );

          if (usuarioPcd && usuarioPcd.nome) {
            const jaAdicionado = mapeados.some((m) => Number(m.id) === Number(usuarioPcd.id));
            if (!jaAdicionado) {
              mapeados.push({
                id: usuarioPcd.id,
                nome: usuarioPcd.nome,
                perfil:
                  usuarioPcd.deficiencia === "VISUAL"
                    ? "🦯 Deficiência Visual"
                    : "♿ Mobilidade Reduzida (Cadeirante)",
                distancia: idx === 0 ? "1,4 km de você" : "3,1 km de você",
                rotaAtiva:
                  idx === 0
                    ? "Retorno à Residência (Sem degraus)"
                    : "Abrigo Estação Consolação (Guia Tátil)",
                bateria: idx === 0 ? "78%" : "91%",
                status: idx === 0 ? "ATENÇÃO" : "SEGURO",
                pinLeft: idx === 0 ? "21%" : "52%",
                pinTop: idx === 0 ? "28%" : "44%",
              });
            }
          }
        });

        if (mapeados.length === 0) {
          mapeados.push({
            id: 1,
            nome: userData?.pcdVinculado || "Vanessa",
            perfil: "♿ Mobilidade Reduzida (Cadeirante)",
            distancia: "1,4 km de você",
            rotaAtiva: "Retorno à Residência (Sem degraus)",
            bateria: "78%",
            status: "ATENÇÃO",
            pinLeft: "21%",
            pinTop: "28%",
          });
        }

        if (mapeados.length === 1) {
          mapeados.push({
            id: "demo-2",
            nome: "Sr. Carlos (Segundo Vínculo)",
            perfil: "🦯 Deficiência Visual",
            distancia: "3,1 km de você",
            rotaAtiva: "Abrigo Estação Consolação (Guia Tátil)",
            bateria: "91%",
            status: "SEGURO",
            pinLeft: "52%",
            pinTop: "44%",
          });
        }

        setPcdsVinculados(mapeados);
        setPcdIndex(0);
      } catch (error) {
        console.error("Erro ao resolver PCDs vinculados:", error);
        setPcdsVinculados([
          {
            id: 1,
            nome: userData?.pcdVinculado || "Vanessa",
            perfil: "♿ Mobilidade Reduzida (Cadeirante)",
            distancia: "1,4 km de você",
            rotaAtiva: "Retorno à Residência (Sem degraus)",
            bateria: "78%",
            status: "ATENÇÃO",
            pinLeft: "21%",
            pinTop: "28%",
          },
          {
            id: "demo-2",
            nome: "Sr. Carlos (Segundo Vínculo)",
            perfil: "🦯 Deficiência Visual",
            distancia: "3,1 km de você",
            rotaAtiva: "Abrigo Estação Consolação (Guia Tátil)",
            bateria: "91%",
            status: "SEGURO",
            pinLeft: "52%",
            pinTop: "44%",
          },
        ]);
      } finally {
        setCarregandoPcd(false);
      }
    }

    resolverPcdsVinculados();
  }, [telefoneLogado, usuarioIdLogado]);

  const pcdAtual = pcdsVinculados[pcdIndex] || {
    id: 0,
    nome: "Nenhum vínculo ativo",
    perfil: "♿ Mobilidade Reduzida",
    distancia: "--",
    rotaAtiva: "Aguardando sincronização",
    bateria: "--",
    status: "ATENÇÃO" as const,
    pinLeft: "21%" as const,
    pinTop: "28%" as const,
  };

  function trocarPcdAcompanhado() {
    if (pcdsVinculados.length <= 1) return;
    const proximo = (pcdIndex + 1) % pcdsVinculados.length;
    setPcdIndex(proximo);
  }

  const [historicoAlertas, setHistoricoAlertas] = useState([
    {
      id: 1,
      tipo: "URGENTE",
      titulo: "Desvio Proativo de Rota Ativado",
      desc: `Alagamento detectado próximo ao trajeto monitorado. O SOS Rota recalculou uma rota segura sem degraus.`,
      hora: "Agora mesmo",
    },
    {
      id: 2,
      tipo: "ATENCAO",
      titulo: "Alerta Climático na Região",
      desc: "Chuva forte prevista para os próximos 15 minutos.",
      hora: "Há 12 min",
    },
  ]);

  function enviarReporteRedeApoio() {
    if (!localReport.trim()) {
      Alert.alert("Campo obrigatório", "Informe o endereço ou ponto de referência do risco.");
      return;
    }

    const novoAlerta = {
      id: Date.now(),
      tipo: "ATENCAO",
      titulo: `Risco Reportado: ${tipoRiscoReport}`,
      desc: `Local: ${localReport.trim()} • ${descReport.trim() || "Reportado pela Rede de Apoio (Confiança inicial: 40%)."}`,
      hora: "Agora mesmo",
    };

    setHistoricoAlertas([novoAlerta, ...historicoAlertas]);
    setLocalReport("");
    setDescReport("");
    setModalReportVisible(false);
    Alert.alert(
      "📢 Risco Reportado!",
      `O alerta foi registrado no CitizenTech — SOS Rota (Confiança inicial: 40%) e enviado para ${pcdAtual.nome} e para a Defesa Civil.`
    );
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>CitizenTech — SOS Rota</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Text style={styles.subtitle}>Rede de Apoio • Monitorando:</Text>
              {carregandoPcd ? (
                <ActivityIndicator size="small" color="#00FF66" />
              ) : (
                <Text style={[styles.subtitle, { color: "#00FF66", fontWeight: "bold" }]}>
                  {pcdAtual.nome}
                </Text>
              )}
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              style={styles.reportHeaderBtn}
              onPress={() => setModalReportVisible(true)}
            >
              <Text style={styles.reportHeaderText}>+ Reportar Risco</Text>
            </TouchableOpacity>

            <View
              style={[
                styles.statusBadge,
                pcdAtual.status === "SEGURO" && {
                  backgroundColor: "#122A1A",
                  borderColor: "#00FF66",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  pcdAtual.status === "SEGURO" && { color: "#00FF66" },
                ]}
              >
                ● {pcdAtual.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* ABA 1: MONITORAMENTO E MAPA */}
          {aba === "MONITORAR" && (
            <>
              {/* SELETOR / BOTÃO DE TROCA DE PCD ACOMPANHADO */}
              <View style={styles.switcherCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switcherLabel}>
                    PCD ACOMPANHADO ({pcdIndex + 1} DE {pcdsVinculados.length || 1})
                  </Text>
                  <Text style={styles.switcherName}>{pcdAtual.nome}</Text>
                  <Text style={styles.switcherProfile}>{pcdAtual.perfil}</Text>
                </View>

                <TouchableOpacity style={styles.switchBtn} onPress={trocarPcdAcompanhado}>
                  <Text style={styles.switchBtnText}>⇄ Trocar PCD</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.monitorGrid}>
                {/* Mapa Vetorial de Aproximação */}
                <View style={styles.mapCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>📍 Localização em Tempo Real</Text>
                    <Text style={styles.distanceTag}>{pcdAtual.distancia}</Text>
                  </View>

                  <View style={styles.mapBox}>
                    <Svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
                      <Rect x="0" y="0" width="400" height="180" fill="#13131A" />
                      <Rect x="25" y="20" width="100" height="55" rx="8" fill="#1C1C26" />
                      <Rect x="150" y="20" width="100" height="55" rx="8" fill="#1C1C26" />
                      <Rect x="275" y="20" width="100" height="55" rx="8" fill="#1C1C26" />
                      <Rect x="25" y="105" width="100" height="55" rx="8" fill="#1C1C26" />
                      <Rect x="150" y="105" width="100" height="55" rx="8" fill="#1C1C26" />
                      <Rect x="275" y="105" width="100" height="55" rx="8" fill="#1C1C26" />

                      <Line x1="0" y1="90" x2="400" y2="90" stroke="#252533" strokeWidth="14" />
                      <Line x1="138" y1="0" x2="138" y2="180" stroke="#252533" strokeWidth="12" />
                      <Line x1="262" y1="0" x2="262" y2="180" stroke="#252533" strokeWidth="12" />

                      <Path
                        d="M 320 135 L 262 135 L 262 90 L 138 90 L 138 50 L 85 50"
                        stroke="#00FF66"
                        strokeWidth="3.5"
                        strokeDasharray="6,4"
                        fill="none"
                      />
                      <Circle cx="200" cy="90" r="20" fill="rgba(255, 0, 85, 0.2)" stroke="#FF0055" strokeWidth="1.5" />
                    </Svg>

                    <View
                      style={[
                        styles.pin,
                        { left: pcdAtual.pinLeft, top: pcdAtual.pinTop, backgroundColor: "#00D4FF" },
                      ]}
                    >
                      <Text style={styles.pinText}>♿</Text>
                    </View>
                    <View style={[styles.pin, { left: "80%", top: "75%", backgroundColor: "#00FF66" }]}>
                      <Text style={styles.pinText}>🤝</Text>
                    </View>
                  </View>
                </View>

                {/* Ficha de Telemetria do Usuário (Layout Equilibrado) */}
                <View style={[styles.card, styles.telemetryCard]}>
                  <View>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>Status do Dispositivo ({pcdAtual.nome})</Text>
                      {carregandoPcd && <ActivityIndicator size="small" color="#00FF66" />}
                    </View>

                    <View style={styles.telemetryBox}>
                      <View style={styles.telemetryItem}>
                        <Text style={styles.telemetryLabel}>ROTA ATIVA</Text>
                        <Text style={styles.telemetryValue}>🧭 {pcdAtual.rotaAtiva}</Text>
                      </View>
                      <View style={styles.telemetryDivider} />
                      <View style={styles.telemetryItem}>
                        <Text style={styles.telemetryLabel}>SINAL E BATERIA</Text>
                        <Text style={styles.telemetryValue}>
                          🔋 {pcdAtual.bateria} • Sinal GPS Forte (Atualizado agora)
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionGroup}>
                    <TouchableOpacity
                      style={styles.fullCallBtn}
                      onPress={() =>
                        Alert.alert("📞 Chamada", `Ligando para o dispositivo de ${pcdAtual.nome}...`)
                      }
                    >
                      <Text style={styles.fullCallBtnText}>📞 Ligar para {pcdAtual.nome}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reportBlockBtn}
                      onPress={() => setModalReportVisible(true)}
                    >
                      <Text style={styles.reportBlockBtnText}>📢 Reportar Risco no Trajeto</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* ABA 2: HISTÓRICO DE ALERTAS */}
          {aba === "ALERTAS" && (
            <View style={{ width: "100%" }}>
              <Text style={styles.sectionTitle}>🔔 Histórico da Rede de Apoio ({historicoAlertas.length})</Text>
              {historicoAlertas.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.alertCard,
                    item.tipo === "URGENTE" && { borderLeftColor: "#FF0055" },
                    item.tipo === "ATENCAO" && { borderLeftColor: "#F59E0B" },
                    item.tipo === "SEGURO" && { borderLeftColor: "#00FF66" },
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={styles.alertTag}>{item.tipo}</Text>
                    <Text style={styles.alertTime}>{item.hora}</Text>
                  </View>
                  <Text style={styles.alertTitle}>{item.titulo}</Text>
                  <Text style={styles.alertDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ABA 3: PERFIL DO CONTATO */}
          {aba === "PERFIL" && (
            <View style={[styles.card, { width: "100%", maxWidth: 500, alignSelf: "center" }]}>
              <View style={styles.profileCenter}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>{nomeContato.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.profileName}>{nomeContato}</Text>
                <Text style={styles.profileSub}>Rede de Apoio • CitizenTech — SOS Rota</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLine}>
                  ♿ PCDs Vinculados: {pcdsVinculados.map((p) => p.nome).join(", ") || "Nenhum"}
                </Text>
                <Text style={styles.infoLine}>📧 E-mail: {userData?.email || "apoio@sosrota.com"}</Text>
                <Text style={styles.infoLine}>📱 Telefone: {userData?.telefone || "(11) 99999-8888"}</Text>
              </View>

              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setAlertaSonoroCritico(!alertaSonoroCritico)}
              >
                <Text style={styles.toggleBtnText}>
                  {alertaSonoroCritico
                    ? "🔊 Alerta Sonoro Crítico: ATIVADO"
                    : "🔇 Alerta Sonoro Crítico: DESATIVADO"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutFullBtn} onPress={onLogout}>
                <Text style={styles.logoutFullText}>Sair da Conta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE REPORTAR RISCO */}
      <Modal
        visible={modalReportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalReportVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📢 Reportar Risco na Via</Text>
              <TouchableOpacity onPress={() => setModalReportVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>TIPO DE OCORRÊNCIA</Text>
            <View style={styles.reportTypesGrid}>
              {[
                "🌊 Alagamento na Via",
                "♿ Rampa Obstruída",
                "🧊 Granizo / Vento Forte",
                "⚡ Queda de Árvore / Fio",
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.typeChip,
                    tipoRiscoReport === item && styles.typeChipActive,
                  ]}
                  onPress={() => setTipoRiscoReport(item)}
                >
                  <Text style={styles.typeChipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>LOCALIZAÇÃO / REFERÊNCIA</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Rua Augusta, próximo à residência"
              placeholderTextColor="#666677"
              value={localReport}
              onChangeText={setLocalReport}
            />

            <Text style={styles.modalLabel}>DETALHES ADICIONAIS (OPCIONAL)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Via bloqueada para cadeira de rodas"
              placeholderTextColor="#666677"
              value={descReport}
              onChangeText={setDescReport}
            />

            <Text style={styles.lgpdText}>
              🔒 Seu relato será enviado para {pcdAtual.nome} e para a fila de validação da Defesa Civil (40% de confiança inicial).
            </Text>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={enviarReporteRedeApoio}>
              <Text style={styles.modalSubmitText}>Enviar Alerta Comunitário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MENU INFERIOR RESPONSIVO */}
      <View style={styles.bottomBarWrapper}>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("MONITORAR")}>
            <Text style={[styles.tabIcon, aba === "MONITORAR" && styles.tabActive]}>📍</Text>
            <Text style={[styles.tabText, aba === "MONITORAR" && styles.tabActive]}>Monitorar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("ALERTAS")}>
            <Text style={[styles.tabIcon, aba === "ALERTAS" && styles.tabActive]}>🔔</Text>
            <Text style={[styles.tabText, aba === "ALERTAS" && styles.tabActive]}>Alertas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabBtn} onPress={() => setAba("PERFIL")}>
            <Text style={[styles.tabIcon, aba === "PERFIL" && styles.tabActive]}>👤</Text>
            <Text style={[styles.tabText, aba === "PERFIL" && styles.tabActive]}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0E" },

  headerWrapper: {
    backgroundColor: "#141419",
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
    width: "100%",
    alignItems: "center",
  },
  header: {
    width: "100%",
    maxWidth: 1000,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { fontSize: 19, fontWeight: "bold", color: "#FFFFFF" },
  subtitle: { color: "#888899", fontSize: 12 },

  reportHeaderBtn: {
    backgroundColor: "#12242A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00D4FF",
  },
  reportHeaderText: { color: "#00D4FF", fontSize: 11, fontWeight: "bold" },
  statusBadge: {
    backgroundColor: "#2A1F12",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  statusText: { color: "#FBBF24", fontSize: 10, fontWeight: "bold" },

  scrollContent: { padding: 16, paddingBottom: 40, alignItems: "center" },
  contentContainer: {
    width: "100%",
    maxWidth: 1000,
  },

  switcherCard: {
    backgroundColor: "#141419",
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: "#00D4FF55",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  switcherLabel: { color: "#888899", fontSize: 9, fontWeight: "bold", letterSpacing: 0.8 },
  switcherName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginTop: 2 },
  switcherProfile: { color: "#00D4FF", fontSize: 11, marginTop: 2 },
  switchBtn: {
    backgroundColor: "#00D4FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  switchBtnText: { color: "#0B0B0E", fontWeight: "bold", fontSize: 12 },

  monitorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  mapCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#FFFFFF" },
  distanceTag: { color: "#00FF66", fontSize: 11, fontWeight: "bold" },
  mapBox: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#252533",
  },
  pin: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  pinText: { fontSize: 13 },

  card: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  telemetryCard: {
    justifyContent: "space-between",
  },
  telemetryBox: {
    backgroundColor: "#1C1C26",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#282836",
    marginBottom: 14,
  },
  telemetryItem: {
    paddingVertical: 2,
  },
  telemetryLabel: {
    color: "#666677",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  telemetryValue: {
    color: "#EEEEF5",
    fontSize: 13,
    fontWeight: "500",
  },
  telemetryDivider: {
    height: 1,
    backgroundColor: "#282836",
    marginVertical: 10,
  },
  actionGroup: {
    gap: 10,
  },
  infoLine: { color: "#CCCCDD", fontSize: 13, marginBottom: 8 },
  fullCallBtn: {
    backgroundColor: "#00D4FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  fullCallBtnText: { color: "#0B0B0E", fontWeight: "bold", fontSize: 13 },
  reportBlockBtn: {
    backgroundColor: "#12242A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00D4FF",
  },
  reportBlockBtnText: { color: "#00D4FF", fontWeight: "bold", fontSize: 13 },

  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  alertCard: {
    backgroundColor: "#141419",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#00D4FF",
    marginBottom: 10,
  },
  alertTag: { color: "#00D4FF", fontSize: 10, fontWeight: "bold" },
  alertTime: { color: "#666677", fontSize: 10 },
  alertTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  alertDesc: { color: "#888899", fontSize: 12, lineHeight: 18 },

  profileCenter: { alignItems: "center", marginBottom: 16 },
  contactAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#122A1A",
    borderWidth: 2,
    borderColor: "#00FF66",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  contactAvatarText: { color: "#00FF66", fontSize: 28, fontWeight: "bold" },
  profileName: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  profileSub: { color: "#888899", fontSize: 12, marginTop: 4 },
  infoBox: { backgroundColor: "#1C1C26", padding: 14, borderRadius: 12, marginBottom: 14 },
  toggleBtn: {
    backgroundColor: "#1C1C26",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00FF66",
    marginBottom: 10,
  },
  toggleBtnText: { color: "#00FF66", fontWeight: "bold", fontSize: 12 },
  logoutFullBtn: {
    backgroundColor: "#2A121A",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF0055",
  },
  logoutFullText: { color: "#FF0055", fontWeight: "bold", fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#141419",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333344",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
  modalClose: { color: "#888899", fontSize: 18, fontWeight: "bold", padding: 4 },
  modalLabel: { color: "#888899", fontSize: 10, fontWeight: "bold", marginTop: 10, marginBottom: 6 },
  reportTypesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  typeChip: {
    backgroundColor: "#1C1C26",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E2E3E",
  },
  typeChipActive: { backgroundColor: "#12242A", borderColor: "#00D4FF" },
  typeChipText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  modalInput: {
    backgroundColor: "#1C1C26",
    borderWidth: 1,
    borderColor: "#2E2E3E",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 13,
  },
  lgpdText: { color: "#777788", fontSize: 11, marginTop: 12, lineHeight: 16 },
  modalSubmitBtn: {
    backgroundColor: "#00D4FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  modalSubmitText: { color: "#0B0B0E", fontWeight: "bold", fontSize: 14 },

  bottomBarWrapper: {
    backgroundColor: "#141419",
    borderTopWidth: 1,
    borderTopColor: "#22222E",
    width: "100%",
    alignItems: "center",
  },
  bottomBar: {
    width: "100%",
    maxWidth: 600,
    height: 64,
    flexDirection: "row",
  },
  tabBtn: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabIcon: { fontSize: 18, color: "#666677" },
  tabText: { fontSize: 10, color: "#666677", marginTop: 3 },
  tabActive: { color: "#00FF66", fontWeight: "bold" },
});