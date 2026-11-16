import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import Svg, { Path, Circle, Line, Rect, G } from "react-native-svg";

import { EventoRisco } from "../interfaces/evento";
import { listarEventos } from "../services/eventoService";

type PerfilPCD = "VISUAL" | "CADEIRANTE";
type AbaUsuario = "INICIO" | "PERFIL";
type TipoRota = "CASA" | "ABRIGO" | "REDE" | "DESVIO";

interface DashboardUserProps {
  userData?: any;
  onLogout: () => void;
}

const CONFIG_MAPAS: Record<
  TipoRota,
  {
    tituloDestino: string;
    placeholderDestino: string;
    caminhoCadeirante: string;
    caminhoVisual: string;
    pinBLeft: `${number}%`;
    pinBTop: `${number}%`;
    riscoCx: number;
    riscoCy: number;
    riscoLeft: `${number}%`;
    riscoTop: `${number}%`;
    etiquetaCadeirante: string;
    etiquetaVisual: string;
    legendaCadeirante: string;
    legendaVisual: string;
  }
> = {
  CASA: {
    tituloDestino: "DESTINO (RETORNO À RESIDÊNCIA)",
    placeholderDestino: "Rua das Acácias, 450 - Residência",
    caminhoCadeirante: "M 55 165 L 125 165 L 125 50 L 55 50",
    caminhoVisual: "M 55 165 L 55 50",
    pinBLeft: "13.7%",
    pinBTop: "22.7%",
    riscoCx: 265,
    riscoCy: 145,
    riscoLeft: "66.2%",
    riscoTop: "65.9%",
    etiquetaCadeirante: "✓ Rota direta para casa sem degraus",
    etiquetaVisual: "✓ Calçada com piso tátil até sua residência",
    legendaCadeirante: "Retorno à residência: trajeto plano e acessível",
    legendaVisual: "Retorno à residência: guia tátil e semáforo sonoro",
  },
  ABRIGO: {
    tituloDestino: "DESTINO (ABRIGO PÚBLICO ACESSÍVEL)",
    placeholderDestino: "Estação Consolação / Escola Adaptada (450m)",
    caminhoCadeirante: "M 55 165 L 125 165 L 125 100 L 265 100 L 265 50 L 345 50",
    caminhoVisual: "M 55 165 L 125 165 L 125 50 L 345 50",
    pinBLeft: "86.2%",
    pinBTop: "22.7%",
    riscoCx: 265,
    riscoCy: 145,
    riscoLeft: "66.2%",
    riscoTop: "65.9%",
    etiquetaCadeirante: "✓ Abrigo com elevador e rampa operacional",
    etiquetaVisual: "✓ Acesso coberto com sinalização sonora",
    legendaCadeirante: "Abrigo Público: elevador ativo e banheiro adaptado",
    legendaVisual: "Abrigo Público: entrada assistida pela Defesa Civil",
  },
  REDE: {
    tituloDestino: "DESTINO (REDE PESSOAL DE APOIO)",
    placeholderDestino: "Casa da Mãe / Local Seguro Cadastrado",
    caminhoCadeirante: "M 55 165 L 265 165 L 265 175 L 345 175",
    caminhoVisual: "M 55 165 L 345 165",
    pinBLeft: "86.2%",
    pinBTop: "77.2%",
    riscoCx: 125,
    riscoCy: 60,
    riscoLeft: "31.2%",
    riscoTop: "27.2%",
    etiquetaCadeirante: "✓ Trajeto seguro até contato de confiança",
    etiquetaVisual: "✓ Rota acompanhada pela Rede de Apoio",
    legendaCadeirante: "Rede de Apoio: familiar notificado da sua chegada",
    legendaVisual: "Rede de Apoio: compartilhamento de GPS em tempo real",
  },
  DESVIO: {
    tituloDestino: "DESTINO (DESVIO PROATIVO DE RISCO)",
    placeholderDestino: "Rota Alternativa (Contornando Alagamento)",
    caminhoCadeirante: "M 55 165 L 55 100 L 125 100 L 125 35 L 265 35 L 265 100 L 345 100",
    caminhoVisual: "M 55 165 L 125 165 L 125 35 L 345 35 L 345 100",
    pinBLeft: "86.2%",
    pinBTop: "45.4%",
    riscoCx: 195,
    riscoCy: 100,
    riscoLeft: "48.7%",
    riscoTop: "45.4%",
    etiquetaCadeirante: "⚠️ Desviando de alagamento severo na Av. Principal",
    etiquetaVisual: "⚠️ Desviando de obra e calçada obstruída",
    legendaCadeirante: "Desvio Proativo: contorno 100% livre de enxurradas",
    legendaVisual: "Desvio Proativo: evitando bloqueios sonoros e físicos",
  },
};

export function DashboardUserScreen({ userData, onLogout }: DashboardUserProps) {
  const [tela, setTela] = useState<AbaUsuario>("INICIO");
  const [perfil, setPerfil] = useState<PerfilPCD>(userData?.deficiencia || "CADEIRANTE");
  const [tipoRota, setTipoRota] = useState<TipoRota>("CASA");
  const [destino, setDestino] = useState("");
  const [rotaAtualizada, setRotaAtualizada] = useState(false);

  // Estados de Integração Backend Spring Boot
  const [eventos, setEventos] = useState<EventoRisco[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [conectado, setConectado] = useState<boolean>(true);

  // Estados do Modal de Reportar Risco Comunitário
  const [modalReportVisible, setModalReportVisible] = useState(false);
  const [tipoRiscoReport, setTipoRiscoReport] = useState("🌊 Alagamento na Via");
  const [localReport, setLocalReport] = useState("");
  const [descReport, setDescReport] = useState("");

  async function carregarEventosDoBackend() {
    try {
      setCarregando(true);
      const dados = await listarEventos();
      setEventos(dados);
      setConectado(true);
    } catch (error) {
      setConectado(false);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEventosDoBackend();
  }, []);

  const nomeUsuario = userData?.nome || "Vanessa";
  const mapaAtual = CONFIG_MAPAS[tipoRota];

  function selecionarTipoRota(novaRota: TipoRota) {
    setTipoRota(novaRota);
    setRotaAtualizada(false);
  }

  function enviarReporteComunitario() {
    if (!localReport.trim()) {
      Alert.alert("Campo obrigatório", "Informe a rua ou ponto de referência do risco.");
      return;
    }

    const novoEvento: any = {
      id: Date.now(),
      tipo: tipoRiscoReport.split(" ")[0],
      titulo: `${tipoRiscoReport.substring(2).trim()}`,
      descricao: descReport.trim() || "Ocorrência reportada pela comunidade local.",
      endereco: localReport.trim(),
      prioridade: "MÉDIO",
      cor: "#12242A",
      corTexto: "#00D4FF",
      origem: `Comunidade (${nomeUsuario})`,
      confianca: "40% (Em validação)",
    };

    setEventos([novoEvento, ...eventos]);
    setLocalReport("");
    setDescReport("");
    setModalReportVisible(false);
    Alert.alert(
      "📢 Ocorrência Registrada!",
      "Seu relato foi publicado no mapa com nível de confiança inicial de 40% e enviado para auditoria da Defesa Civil."
    );
  }

  return (
    <View style={styles.container}>
      {/* BARRA DE STATUS DE CONEXÃO */}
      <View
        style={[
          styles.connectionBar,
          { backgroundColor: conectado ? "#00FF66" : "#FF0055" },
        ]}
      >
        <Text style={styles.connectionText}>
          {conectado
            ? "● Backend Spring Boot: Conectado"
            : "⚠️ Servidor Offline — Modo de Contingência Ativo"}
        </Text>
        <TouchableOpacity onPress={carregarEventosDoBackend}>
          <Text style={styles.retryText}>Reconectar</Text>
        </TouchableOpacity>
      </View>

      {tela === "INICIO" ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* CABEÇALHO */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>CitizenTech</Text>
              <Text style={styles.headerSubtitle}>Mobilidade inteligente para todos</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity
                style={styles.reportHeaderBtn}
                onPress={() => setModalReportVisible(true)}
              >
                <Text style={styles.reportHeaderText}>+ Reportar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sosHeaderBtn}
                onPress={() =>
                  Alert.alert(
                    "🚨 SOS EMERGÊNCIA",
                    "Sua localização GPS e ficha de acessibilidade foram enviadas para a Defesa Civil (193) e sua Rede de Apoio!"
                  )
                }
              >
                <Text style={styles.sosHeaderText}>SOS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.avatar} onPress={() => setTela("PERFIL")}>
                <Text style={styles.avatarText}>{nomeUsuario.charAt(0).toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOAS-VINDAS */}
          <View style={styles.welcome}>
            <Text style={styles.welcomeTitle}>Olá, {nomeUsuario}! 👋</Text>
            <Text style={styles.welcomeSubtitle}>Vamos encontrar um caminho mais seguro?</Text>
          </View>

          {/* 4 TIPOS DE ROTAS ACESSÍVEIS */}
          <View style={styles.routeChipsRow}>
            {(["CASA", "ABRIGO", "REDE", "DESVIO"] as TipoRota[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.routeChip, tipoRota === r && styles.routeChipActive]}
                onPress={() => selecionarTipoRota(r)}
              >
                <Text style={[styles.routeChipText, tipoRota === r && { color: "#FFFFFF" }]}>
                  {r === "CASA" && "🏠 Casa"}
                  {r === "ABRIGO" && "🏢 Abrigo"}
                  {r === "REDE" && "🤝 Apoio"}
                  {r === "DESVIO" && "🗺️ Desvio"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BUSCA */}
          <View style={styles.searchCard}>
            <Text style={styles.cardTitle}>Para onde vamos?</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationIndicator}>
                <View style={styles.originDot} />
                <View style={styles.locationLine} />
                <View style={styles.destinationDot} />
              </View>

              <View style={styles.locationInputs}>
                <Text style={styles.locationLabel}>ORIGEM</Text>
                <Text style={styles.locationValue}>Minha localização atual</Text>
                <View style={styles.inputDivider} />
                <Text style={styles.locationLabel}>{mapaAtual.tituloDestino}</Text>
                <TextInput
                  value={destino}
                  onChangeText={setDestino}
                  placeholder={mapaAtual.placeholderDestino}
                  placeholderTextColor="#666677"
                  style={styles.destinationInput}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setRotaAtualizada(true)}
            >
              <Text style={styles.searchButtonText}>Calcular Rota Adaptada →</Text>
            </TouchableOpacity>

            {rotaAtualizada && (
              <Text style={styles.searchFeedback}>
                ✓ Rota ({tipoRota}) recalculada e sincronizada no mapa abaixo!
              </Text>
            )}
          </View>

          {/* MAPA VETORIAL DINÂMICO POR ROTA E PERFIL */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mapa: Rota {tipoRota}</Text>
            <View style={styles.profileBadgeTag}>
              <Text style={styles.profileBadgeTagText}>
                {perfil === "CADEIRANTE" ? "♿ Modo Cadeirante" : "🦯 Modo Def. Visual"}
              </Text>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <View style={styles.map}>
              <Svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
                <Rect x="0" y="0" width="400" height="220" fill="#13131A" />
                <Rect x="20" y="20" width="90" height="65" rx="8" fill="#1C1C26" />
                <Rect x="140" y="20" width="110" height="65" rx="8" fill="#1C1C26" />
                <Rect x="280" y="20" width="100" height="65" rx="8" fill="#1C1C26" />
                <Rect x="20" y="115" width="90" height="85" rx="8" fill="#1C1C26" />
                <Rect x="140" y="115" width="110" height="85" rx="8" fill="#1C1C26" />
                <Rect x="280" y="115" width="100" height="85" rx="8" fill="#1C1C26" />

                <Line x1="0" y1="100" x2="400" y2="100" stroke="#252533" strokeWidth="16" />
                <Line x1="125" y1="0" x2="125" y2="220" stroke="#252533" strokeWidth="14" />
                <Line x1="265" y1="0" x2="265" y2="220" stroke="#252533" strokeWidth="14" />

                <Line x1="0" y1="100" x2="400" y2="100" stroke="#36364A" strokeWidth="1.5" strokeDasharray="8,8" />
                <Line x1="125" y1="0" x2="125" y2="220" stroke="#36364A" strokeWidth="1.5" strokeDasharray="8,8" />
                <Line x1="265" y1="0" x2="265" y2="220" stroke="#36364A" strokeWidth="1.5" strokeDasharray="8,8" />

                <Circle
                  cx={mapaAtual.riscoCx}
                  cy={mapaAtual.riscoCy}
                  r="26"
                  fill="rgba(255, 0, 85, 0.18)"
                  stroke="#FF0055"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />

                {perfil === "CADEIRANTE" ? (
                  <G>
                    <Path
                      d={mapaAtual.caminhoCadeirante}
                      stroke="rgba(0, 255, 102, 0.25)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <Path
                      d={mapaAtual.caminhoCadeirante}
                      stroke="#00FF66"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </G>
                ) : (
                  <G>
                    <Path
                      d={mapaAtual.caminhoVisual}
                      stroke="rgba(0, 212, 255, 0.25)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <Path
                      d={mapaAtual.caminhoVisual}
                      stroke="#00D4FF"
                      strokeWidth="4"
                      strokeDasharray="6,4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </G>
                )}
              </Svg>

              <View style={[styles.mapPin, styles.pinStart, { left: "13.7%", top: "75%" }]}>
                <Text style={styles.mapPointText}>A</Text>
              </View>
              <View
                style={[
                  styles.mapPin,
                  styles.pinEnd,
                  { left: mapaAtual.pinBLeft, top: mapaAtual.pinBTop },
                ]}
              >
                <Text style={styles.mapPointText}>B</Text>
              </View>
              <View
                style={[
                  styles.mapRiskBadge,
                  { left: mapaAtual.riscoLeft, top: mapaAtual.riscoTop },
                ]}
              >
                <Text style={{ fontSize: 13 }}>⚠️</Text>
              </View>

              <View style={styles.mapInfoLabel}>
                <Text style={styles.mapInfoLabelText}>
                  {perfil === "CADEIRANTE"
                    ? mapaAtual.etiquetaCadeirante
                    : mapaAtual.etiquetaVisual}
                </Text>
              </View>
            </View>

            <View style={styles.mapFooter}>
              <View style={styles.legend}>
                <View
                  style={[
                    styles.legendIndicator,
                    { backgroundColor: perfil === "CADEIRANTE" ? "#00FF66" : "#00D4FF" },
                  ]}
                />
                <Text style={styles.legendText}>
                  {perfil === "CADEIRANTE"
                    ? mapaAtual.legendaCadeirante
                    : mapaAtual.legendaVisual}
                </Text>
              </View>
            </View>
          </View>

          {/* BANNER DE COLABORAÇÃO COMUNITÁRIA */}
          <TouchableOpacity
            style={styles.communityBanner}
            onPress={() => setModalReportVisible(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.communityBannerTitle}>📢 Viu algum risco ou bloqueio na via?</Text>
              <Text style={styles.communityBannerSub}>
                Ajude outros usuários reportando alagamentos ou rampas obstruídas.
              </Text>
            </View>
            <View style={styles.communityBannerBtn}>
              <Text style={styles.communityBannerBtnText}>+ Reportar Risco</Text>
            </View>
          </TouchableOpacity>

          {/* RESUMO */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Visão geral</Text>
            <Text style={styles.liveLabel}>{conectado ? "● DADOS DA API" : "● MODO OFFLINE"}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {eventos.length < 10 ? `0${eventos.length}` : eventos.length}
              </Text>
              <Text style={styles.summaryLabel}>Eventos</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#FF0055" }]}>
                {eventos.filter((e) => e.prioridade === "ALTA").length < 10
                  ? `0${eventos.filter((e) => e.prioridade === "ALTA").length}`
                  : eventos.filter((e) => e.prioridade === "ALTA").length}
              </Text>
              <Text style={styles.summaryLabel}>Alerta alto</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: "#00FF66" }]}>
                {eventos.filter((e) => e.prioridade !== "ALTA").length < 10
                  ? `0${eventos.filter((e) => e.prioridade !== "ALTA").length}`
                  : eventos.filter((e) => e.prioridade !== "ALTA").length}
              </Text>
              <Text style={styles.summaryLabel}>Outros riscos</Text>
            </View>
          </View>

          {/* EVENTOS DINÂMICOS DA API E COMUNIDADE */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertas e ocorrências</Text>
            {carregando ? (
              <ActivityIndicator size="small" color="#FF0055" />
            ) : (
              <Text style={styles.eventCount}>{eventos.length} registros</Text>
            )}
          </View>

          {eventos.map((evento) => (
            <View key={evento.id} style={styles.eventCard}>
              <View style={styles.eventIcon}>
                <Text style={{ fontSize: 23 }}>{evento.tipo || "⚠️"}</Text>
              </View>
              <View style={styles.eventContent}>
                <View style={styles.eventTitleRow}>
                  <Text style={styles.eventTitle}>{evento.titulo}</Text>
                  <View style={[styles.eventPriority, { backgroundColor: evento.cor || "#2A121A" }]}>
                    <Text style={[styles.eventPriorityText, { color: evento.corTexto || "#FF0055" }]}>
                      {evento.prioridade}
                    </Text>
                  </View>
                </View>
                <Text style={styles.eventDescription}>{evento.descricao}</Text>
                <Text style={styles.eventAddress}>📍 {evento.endereco}</Text>
                <Text style={styles.eventTime}>
                  Origem: {evento.origem} • Confiança: {evento.confianca}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* TELA DE PERFIL */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileHeaderTitle}>Meu perfil</Text>
            <View style={styles.largeAvatar}>
              <Text style={styles.largeAvatarText}>{nomeUsuario.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>{nomeUsuario}</Text>
            <Text style={styles.profileEmail}>{userData?.email || "Usuária CitizenTech"}</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Perfil de acessibilidade</Text>

            <TouchableOpacity
              style={[styles.accessibilityCard, perfil === "VISUAL" && styles.accessibilitySelected]}
              onPress={() => setPerfil("VISUAL")}
            >
              <Text style={styles.accessibilityEmoji}>🦯</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.accessibilityTitle}>Deficiência visual</Text>
                <Text style={styles.accessibilitySubtitle}>
                  Orientação por áudio e travessias sinalizadas.
                </Text>
              </View>
              <Text style={styles.check}>{perfil === "VISUAL" ? "●" : "○"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accessibilityCard,
                perfil === "CADEIRANTE" && styles.accessibilitySelected,
              ]}
              onPress={() => setPerfil("CADEIRANTE")}
            >
              <Text style={styles.accessibilityEmoji}>♿</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.accessibilityTitle}>Mobilidade reduzida</Text>
                <Text style={styles.accessibilitySubtitle}>
                  Rampas, calçadas acessíveis e sem escadas.
                </Text>
              </View>
              <Text style={styles.check}>{perfil === "CADEIRANTE" ? "●" : "○"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutFullBtn} onPress={onLogout}>
              <Text style={styles.logoutFullBtnText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* MODAL DE REPORTAR RISCO COMUNITÁRIO */}
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
              placeholder="Ex: Av. Paulista, 1200 (próx. ao metrô)"
              placeholderTextColor="#666677"
              value={localReport}
              onChangeText={setLocalReport}
            />

            <Text style={styles.modalLabel}>DETALHES ADICIONAIS (OPCIONAL)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Água subindo rápido na calçada"
              placeholderTextColor="#666677"
              value={descReport}
              onChangeText={setDescReport}
            />

            <Text style={styles.lgpdText}>
              🔒 Seu relato será publicado com confiança inicial de 40% e auditado pela Defesa Civil.
            </Text>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={enviarReporteComunitario}>
              <Text style={styles.modalSubmitText}>Enviar Alerta Comunitário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MENU INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setTela("INICIO")}>
          <Text style={[styles.tabIcon, tela === "INICIO" && styles.activeTab]}>⌂</Text>
          <Text style={[styles.tabText, tela === "INICIO" && styles.activeTab]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setTela("PERFIL")}>
          <Text style={[styles.tabIcon, tela === "PERFIL" && styles.activeTab]}>◉</Text>
          <Text style={[styles.tabText, tela === "PERFIL" && styles.activeTab]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0E" },
  connectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  connectionText: { color: "#0B0B0E", fontSize: 10, fontWeight: "bold" },
  retryText: { color: "#0B0B0E", fontSize: 10, textDecorationLine: "underline", fontWeight: "bold" },
  scrollContent: { paddingBottom: 20 },
  header: {
    backgroundColor: "#141419",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  logo: { fontSize: 23, fontWeight: "bold", color: "#FFFFFF" },
  headerSubtitle: { color: "#888899", fontSize: 11, marginTop: 4 },
  reportHeaderBtn: {
    backgroundColor: "#12242A",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00D4FF",
  },
  reportHeaderText: { color: "#00D4FF", fontWeight: "bold", fontSize: 11 },
  sosHeaderBtn: {
    backgroundColor: "#FF0055",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sosHeaderText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 11 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A121A",
    borderWidth: 1,
    borderColor: "#FF0055",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 17, color: "#FF0055", fontWeight: "bold" },
  welcome: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 },
  welcomeTitle: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  welcomeSubtitle: { fontSize: 13, color: "#888899", marginTop: 4 },
  routeChipsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  routeChip: {
    flex: 1,
    backgroundColor: "#141419",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22222E",
  },
  routeChipActive: { backgroundColor: "#2A121A", borderColor: "#FF0055" },
  routeChipText: { color: "#888899", fontSize: 11, fontWeight: "bold" },
  searchCard: {
    marginHorizontal: 16,
    backgroundColor: "#141419",
    padding: 17,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginBottom: 16 },
  locationRow: { flexDirection: "row" },
  locationIndicator: { width: 20, alignItems: "center", paddingTop: 6 },
  originDot: { width: 11, height: 11, borderRadius: 8, backgroundColor: "#00FF66" },
  locationLine: { width: 2, height: 37, backgroundColor: "#333344" },
  destinationDot: { width: 11, height: 11, borderRadius: 2, backgroundColor: "#FF0055" },
  locationInputs: { flex: 1, marginLeft: 10 },
  locationLabel: { color: "#777788", fontSize: 9, fontWeight: "bold", letterSpacing: 1 },
  locationValue: { fontSize: 13, color: "#CCCCDD", marginTop: 4, marginBottom: 7 },
  inputDivider: { height: 1, backgroundColor: "#22222E", marginBottom: 7 },
  destinationInput: { fontSize: 13, color: "#FFFFFF", paddingVertical: 4 },
  searchButton: {
    backgroundColor: "#FF0055",
    borderRadius: 11,
    padding: 14,
    alignItems: "center",
    marginTop: 15,
  },
  searchButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  searchFeedback: { color: "#00FF66", fontSize: 11, marginTop: 10 },
  sectionHeader: {
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
  liveLabel: { color: "#00FF66", fontSize: 9, fontWeight: "bold" },
  profileBadgeTag: {
    backgroundColor: "#1C1C26",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333344",
  },
  profileBadgeTagText: { color: "#00FF66", fontSize: 10, fontWeight: "bold" },
  mapContainer: {
    marginHorizontal: 16,
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  map: {
    height: 240,
    backgroundColor: "#13131A",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#252533",
  },
  mapPin: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  pinStart: { backgroundColor: "#FF0055" },
  pinEnd: { backgroundColor: "#00FF66" },
  mapPointText: { color: "#0B0B0E", fontWeight: "900", fontSize: 12 },
  mapRiskBadge: {
    position: "absolute",
    width: 28,
    height: 28,
    backgroundColor: "#2A121A",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FF0055",
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  mapInfoLabel: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "rgba(11, 11, 14, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333344",
  },
  mapInfoLabelText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  mapFooter: { paddingTop: 10, paddingHorizontal: 4 },
  legend: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendIndicator: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#9999AA", fontWeight: "500" },
  communityBanner: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: "#141419",
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: "#00D4FF55",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  communityBannerTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold", marginBottom: 4 },
  communityBannerSub: { color: "#888899", fontSize: 11, lineHeight: 16 },
  communityBannerBtn: {
    backgroundColor: "#00D4FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  communityBannerBtnText: { color: "#0B0B0E", fontWeight: "bold", fontSize: 11 },
  summaryRow: { flexDirection: "row", gap: 10, marginHorizontal: 16 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#141419",
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22222E",
  },
  summaryNumber: { color: "#FFFFFF", fontSize: 23, fontWeight: "bold" },
  summaryLabel: { color: "#777788", fontSize: 10, marginTop: 5 },
  eventCount: { color: "#888899", fontSize: 11 },
  eventCard: {
    backgroundColor: "#141419",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 13,
    padding: 13,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#22222E",
  },
  eventIcon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: "#1C1C26",
    justifyContent: "center",
    alignItems: "center",
  },
  eventContent: { flex: 1 },
  eventTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 5 },
  eventTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold", flex: 1 },
  eventPriority: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5 },
  eventPriorityText: { fontSize: 8, fontWeight: "bold" },
  eventDescription: { color: "#AAACC0", fontSize: 11, marginTop: 6 },
  eventAddress: { color: "#888899", fontSize: 10, marginTop: 7 },
  eventTime: { color: "#666677", fontSize: 9, marginTop: 5 },
  profileHeader: {
    backgroundColor: "#141419",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#22222E",
  },
  profileHeaderTitle: { color: "#FFFFFF", fontSize: 23, fontWeight: "bold", alignSelf: "flex-start" },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: "#2A121A",
    borderWidth: 2,
    borderColor: "#FF0055",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  largeAvatarText: { fontSize: 32, fontWeight: "bold", color: "#FF0055" },
  profileName: { color: "#FFFFFF", fontSize: 19, fontWeight: "bold", marginTop: 12 },
  profileEmail: { color: "#888899", fontSize: 12, marginTop: 4 },
  profileSection: { marginHorizontal: 16, marginTop: 24 },
  accessibilityCard: {
    backgroundColor: "#141419",
    borderRadius: 13,
    padding: 14,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#22222E",
  },
  accessibilitySelected: { backgroundColor: "#1F141C", borderColor: "#FF0055" },
  accessibilityEmoji: { fontSize: 28 },
  accessibilityTitle: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  accessibilitySubtitle: { color: "#888899", fontSize: 10, marginTop: 4 },
  check: { color: "#FF0055", fontSize: 20 },
  logoutFullBtn: {
    backgroundColor: "#1C1C26",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#FF0055",
  },
  logoutFullBtnText: { color: "#FF0055", fontWeight: "bold", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
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
  bottomBar: {
    height: 65,
    backgroundColor: "#141419",
    borderTopWidth: 1,
    borderTopColor: "#22222E",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabIcon: { color: "#666677", fontSize: 22 },
  tabText: { color: "#666677", fontSize: 10, marginTop: 3 },
  activeTab: { color: "#FF0055", fontWeight: "bold" },
});